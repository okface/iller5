<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useStudyStore } from '@/stores/study';

const store = useStudyStore();

// Local state for the current card interaction
const answered = ref(false);
const selectedOptionIndex = ref(null); 
const revealedOptions = ref(new Set()); // Track which options user clicked AFTER answering
const optionOrder = ref([]); // Array of original option indices, shuffled per question
const questionHeaderRef = ref(null);

const randomInt = (maxExclusive) => {
  if (maxExclusive <= 0) return 0;
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
};

const shuffleInPlace = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Current Question Data
const currentQuestion = computed(() => {
  if (!store.currentSession || store.currentSession.length === 0) return null;
  return store.currentSession[store.currentIndex];
});

const displayOptions = computed(() => {
  if (!currentQuestion.value) return [];
  const opts = currentQuestion.value.options || [];
  if (!Array.isArray(opts) || opts.length === 0) return [];
  if (!Array.isArray(optionOrder.value) || optionOrder.value.length !== opts.length) {
    return opts;
  }
  return optionOrder.value.map(i => opts[i]);
});

const formatName = (str) => {
  return String(str || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const sourceLabel = computed(() => {
  const src = currentQuestion.value?.source;
  if (!src) return '';
  const parts = String(src).split('/');
  // If the app currently has only one subject folder, just show the topic.
  const hasMultipleSubjects = Object.keys(store.subjects || {}).length > 1;
  if (!hasMultipleSubjects && parts.length >= 2) return formatName(parts.slice(1).join('/'));
  return formatName(parts.join(' / '));
});

const scrollQuestionIntoView = async () => {
  await nextTick();
  // Instant jump (no smooth) to avoid weird mid-transition positions.
  questionHeaderRef.value?.scrollIntoView({ block: 'start', behavior: 'auto' });
};

// Progress
const progressText = computed(() => {
  return `${store.currentIndex + 1} / ${store.currentSession.length}`;
});

const isFinished = computed(() => {
  return store.currentIndex >= store.currentSession.length;
});

// Watch for question change to reset local state
watch(currentQuestion, () => {
  answered.value = false;
  selectedOptionIndex.value = null;
  revealedOptions.value = new Set();

  const n = currentQuestion.value?.options?.length || 0;
  optionOrder.value = shuffleInPlace(Array.from({ length: n }, (_, i) => i));

  scrollQuestionIntoView();
});

// Actions
const selectOption = (index) => {
  // If already answered, just reveal this option's feedback (The "Why" feature)
  if (answered.value) {
    if (index !== selectedOptionIndex.value) {
        revealedOptions.value.add(index);
    }
    return;
  }

  // First selection (The actual answer)
  selectedOptionIndex.value = index;
  answered.value = true;
  
  // Check correctness
  const originalIndex = optionOrder.value[index] ?? index;
  const isCorrect = currentQuestion.value.options[originalIndex].correct;
  
  // Record in store
  store.recordAnswer(currentQuestion.value.id, isCorrect);
};

const nextQuestion = () => {
  if (store.currentIndex < store.currentSession.length - 1) {
    store.currentIndex++;
    // scroll handled by watcher, but keep this for extra safety
    scrollQuestionIntoView();
  } else {
    // End session
    store.view = 'dashboard';
    store.currentSession = [];
    store.currentIndex = 0;
  }
};

// Styles for options
const getOptionClass = (index, option) => {
  const base = "w-full p-3 mb-2 text-left border rounded-lg transition-all duration-200 relative ";
  
  if (!answered.value) {
    return base + "bg-white border-gray-200 hover:border-indigo-500 hover:bg-gray-50";
  }

  // Answered State Logic
  const isSelected = index === selectedOptionIndex.value;
  const isCorrect = option.correct;

  if (isCorrect) {
    // ALWAYS show Green for correct answer
    return base + "bg-green-50 border-green-500 ring-1 ring-green-500";
  }
  
  if (isSelected && !isCorrect) {
    // Show Red for selected wrong answer
    return base + "bg-red-50 border-red-500 ring-1 ring-red-500";
  }

  // Unselected, Incorrect options
  return base + "bg-gray-50 border-gray-200 opacity-75 cursor-pointer hover:bg-gray-100";
};

</script>

<template>
  <div v-if="currentQuestion" class="max-w-2xl mx-auto pb-20">
    
    <!-- Top Bar -->
    <div class="flex justify-between items-center mb-3 text-xs text-gray-500">
      <button @click="store.view = 'dashboard'" class="hover:text-gray-900">&larr; Quit</button>
      <span class="font-mono bg-gray-100 px-2 py-1 rounded">{{ progressText }}</span>
    </div>

    <!-- Sticky Question Header -->
    <div ref="questionHeaderRef" class="sticky top-0 z-10 bg-white pb-2 border-b border-gray-100">
      <div class="pt-2">
        <div v-if="sourceLabel" class="text-[11px] text-gray-500 mb-1">
          {{ sourceLabel }}
        </div>
        <span v-for="tag in currentQuestion.tags" :key="tag" class="inline-block text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mr-2 mb-1">
          {{ tag }}
        </span>
      </div>
      <h2 class="text-lg font-bold text-gray-900 leading-snug">{{ currentQuestion.question }}</h2>
    </div>

    <!-- Image (if any) -->
    <div v-if="currentQuestion.image" class="mb-6 rounded-lg overflow-hidden border border-gray-200">
      <img :src="currentQuestion.image" alt="Question Image" class="w-full h-auto object-cover max-h-64" />
    </div>

    <!-- Options -->
    <div class="mb-5">
      <button 
        v-for="(opt, idx) in displayOptions" 
        :key="idx"
        @click="selectOption(idx)"
        :class="getOptionClass(idx, opt)"
      >
        <div class="flex items-start">
            <span class="flex-shrink-0 w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs mr-3 mt-0.5"
                :class="{'border-green-500 text-green-700 bg-green-100 font-bold': answered && opt.correct, 'border-red-500 text-red-700 bg-red-100 font-bold': answered && !opt.correct && idx === selectedOptionIndex}">
                {{ String.fromCharCode(65 + idx) }}
            </span>
            <span class="text-gray-800">{{ opt.text }}</span>
        </div>

        <!-- Post-Answer Feedback (The "Why" Feature) -->
        <!-- Logic: Show if (Answered AND (IsSelected OR IsCorrect OR Revealed)) -->
        <div 
          v-if="answered && (idx === selectedOptionIndex || opt.correct || revealedOptions.has(idx))" 
          class="mt-2 pl-9 text-sm"
          :class="opt.correct ? 'text-green-700' : 'text-red-600'"
        >
          <span v-if="opt.correct" class="font-bold">Correct: </span>
          <span v-else class="font-bold">Wrong: </span>
          {{ opt.feedback }}
        </div>
      </button>
    </div>

    <!-- General Explanation (Always appears after answer) -->
    <div v-if="answered" class="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-14 animate-fade-in">
      <h3 class="text-sm font-bold text-blue-800 mb-1 uppercase tracking-wider">Explanation</h3>
      <p class="text-blue-900 text-sm leading-relaxed">
        {{ currentQuestion.explanation }}
      </p>
    </div>

    <!-- Next Button (Floating Bottom) -->
    <div v-if="answered" class="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-center pb-3 sm:pb-2 md:static md:bg-transparent md:border-0 md:p-0 md:justify-end">
      <button 
        @click="nextQuestion"
        class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 transition w-full md:w-auto"
      >
        {{ store.currentIndex < store.currentSession.length - 1 ? 'Next Question &rarr;' : 'Finish Session' }}
      </button>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
