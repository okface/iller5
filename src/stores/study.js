import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

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
        const path = baseUrl.endsWith('/') ? `${baseUrl}content.json` : `${baseUrl}/content.json`;
        
        const response = await fetch(path);
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

    startSession(mode, target = null) {
      // mode: 'quick5', 'quick10', 'worst10', 'specific'
      // target: filename (for 'specific') or nil
      
      let candidateQuestions = [];

      if (mode === 'specific' && target) {
        // Filter by source filename or folder "Folder/File" logic
        // The bundler should probably attach 'source' metadata to questions
        candidateQuestions = this.questions.filter(q => q.source === target);
      } else {
        // All questions
        candidateQuestions = this.questions;
      }

      if (candidateQuestions.length === 0) {
        alert("No questions found for this selection.");
        return;
      }

      const count = (mode === 'quick5') ? 5 : 10;
      this.currentSession = this.selectQuestionsSRS(candidateQuestions, count);
      this.currentIndex = 0;
      this.sessionAnswers = {};
      this.view = 'quiz';
    },

    selectQuestionsSRS(candidates, count) {
      if (candidates.length <= count) return candidates;

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

      // Target counts based on weights 70/20/10
      // We fill the session list until full
      let selected = [];
      const targets = {
        A: Math.round(count * 0.7),
        B: Math.round(count * 0.2),
        C: Math.round(count * 0.1)
      };

      // Helper to pick random items
      const pick = (arr, n) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
      };

      // 1. Fill A
      const pickedA = pick(buckets.A, targets.A);
      selected = selected.concat(pickedA);
      
      // 2. Fill B
      const pickedB = pick(buckets.B, targets.B);
      selected = selected.concat(pickedB);

      // 3. Fill C
      const pickedC = pick(buckets.C, targets.C);
      selected = selected.concat(pickedC);

      // 4. Backfill if we didn't meet the count (e.g. not enough C items, pull from A)
      // For simplicity, just pool remaining and fill
      if (selected.length < count) {
        const alreadySelectedIds = new Set(selected.map(q => q.id));
        const remaining = candidates.filter(q => !alreadySelectedIds.has(q.id));
        const needed = count - selected.length;
        selected = selected.concat(pick(remaining, needed));
      }

      // Shuffle final result so buckets aren't clustered
      return selected.sort(() => 0.5 - Math.random());
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
