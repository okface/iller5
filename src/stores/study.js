import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

const randomFloat = () => {
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0] / 0x100000000;
  }
  return Math.random();
};

const randomInt = (maxExclusive) => {
  if (maxExclusive <= 0) return 0;
  return Math.floor(randomFloat() * maxExclusive);
};

const shuffleInPlace = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const takeRandom = (arr) => {
  const idx = randomInt(arr.length);
  return arr.splice(idx, 1)[0];
};

export const useStudyStore = defineStore('study', {
  state: () => ({
    loading: true,
    error: null,
    view: 'dashboard', // dashboard, quiz, summary
    
    // Data (Loaded from JSON)
    subjects: {}, // Structure: { folder: [ 'filename', ... ] }
    questions: [], // Flat list of all questions
    
    // Session State
    currentSession: [], // Array of question objects for current quiz
    currentIndex: 0,
    sessionAnswers: {}, // { questionId: { selected: 1, isCorrect: true } }
    
    // User Progress (Persisted in localStorage)
    // Structure: { questionId: { bucket: 'A'|'B'|'C', consecutiveCorrect: 0, lastSeen: timestamp } }
    progress: useStorage('iller5-progress', {}),
  }),

  actions: {
    async loadContent() {
      this.loading = true;
      try {
        // Use BASE_URL to handle GitHub Pages subdirectories correctly
        const baseUrl = import.meta.env.BASE_URL;
        // Ensure standard slash behavior
        const basePath = baseUrl.endsWith('/') ? `${baseUrl}content.json` : `${baseUrl}/content.json`;

        // Cache busting: GitHub Pages/static CDNs + browsers may cache content.json aggressively.
        // By varying the URL per deployment, we can fetch new questions without users clearing
        // site data (which would also wipe localStorage progress).
        const buildTag = (typeof __ILLER5_BUILD_TIME__ !== 'undefined' && __ILLER5_BUILD_TIME__)
          ? __ILLER5_BUILD_TIME__
          : `${Date.now()}`;
        const path = `${basePath}?v=${encodeURIComponent(buildTag)}`;
        
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) throw new Error("Failed to load content.json");
        
        const data = await response.json();
        this.subjects = data.subjects;
        this.questions = data.questions;
        
        // Sanitize progress (remove IDs that don't exist anymore if needed, or just ignore them)
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    startSession(mode, target = null, countOverride = null) {
      // mode: 'quick5', 'quick10', 'worst10', 'specific'
      // target: filename (for 'specific') or nil
      
      let candidateQuestions = [];

      if (mode === 'specific' && target) {
        // Filter by source filename or folder "Folder/File" logic
        // The bundler should probably attach 'source' metadata to questions
        candidateQuestions = this.questions.filter(q => q.source === target);
      } else if (mode === 'multi' && Array.isArray(target) && target.length > 0) {
        const selected = new Set(target);
        candidateQuestions = this.questions.filter(q => selected.has(q.source));
      } else {
        // All questions
        candidateQuestions = this.questions;
      }

      if (candidateQuestions.length === 0) {
        alert("No questions found for this selection.");
        return;
      }

      const count = (typeof countOverride === 'number' && Number.isFinite(countOverride))
        ? Math.max(1, Math.floor(countOverride))
        : ((mode === 'quick5') ? 5 : 10);
      this.currentSession = this.selectQuestionsSRS(candidateQuestions, count);
      this.currentIndex = 0;
      this.sessionAnswers = {};
      this.view = 'quiz';
    },

    selectQuestionsSRS(candidates, count) {
      if (candidates.length <= count) return shuffleInPlace([...candidates]);

      // Group by buckets
      const buckets = { A: [], B: [], C: [] };
      
      candidates.forEach(q => {
        const p = this.progress[q.id];
        if (!p) {
          buckets.A.push(q); // New = Bucket A
        } else {
          buckets[p.bucket].push(q);
        }
      });

      // Weighted draw (70/20/10) per slot for a more natural/random session order.
      // Still heavily favors Bucket A, but avoids "sticky" ordering from sort-random shuffles.
      const weights = { A: 0.7, B: 0.2, C: 0.1 };

      const selected = [];
      while (selected.length < count) {
        const available = ['A', 'B', 'C'].filter(k => buckets[k].length > 0);
        if (available.length === 0) break;

        const totalWeight = available.reduce((sum, k) => sum + weights[k], 0);
        let r = randomFloat() * totalWeight;
        let chosen = available[0];
        for (const k of available) {
          r -= weights[k];
          if (r <= 0) {
            chosen = k;
            break;
          }
        }

        selected.push(takeRandom(buckets[chosen]));
      }

      // Backfill if needed (should only happen if candidates were mutated unexpectedly)
      if (selected.length < count) {
        const alreadySelectedIds = new Set(selected.map(q => q.id));
        const remaining = candidates.filter(q => !alreadySelectedIds.has(q.id));
        shuffleInPlace(remaining);
        selected.push(...remaining.slice(0, count - selected.length));
      }

      return selected;
    },

    recordAnswer(questionId, isCorrect) {
      // Update Progress
      let p = this.progress[questionId] || { bucket: 'A', consecutiveCorrect: 0, lastSeen: 0 };
      
      if (isCorrect) {
        p.consecutiveCorrect += 1;
        // Promote logic
        // A -> Correct once -> B
        // B -> Correct again (total 2) -> C
        if (p.bucket === 'A') p.bucket = 'B';
        else if (p.bucket === 'B') p.bucket = 'C';
        // C stays C
      } else {
        // Wrong -> Back to A
        p.bucket = 'A';
        p.consecutiveCorrect = 0;
      }
      
      p.lastSeen = Date.now();
      this.progress[questionId] = p;
    }
  }
});
