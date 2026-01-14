<script setup>
import { computed } from 'vue';
import { useStudyStore } from '@/stores/study';

const store = useStudyStore();

// Format folder names for display
const formatName = (str) => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Subject display overrides for better names
const subjectDisplayOverrides = {
  medical_exam: 'Läkarexamen',
  korkortsteori: 'Körkortsteori',
};

const prettySubject = (subject) => {
  return subjectDisplayOverrides[subject] || formatName(subject);
};

// Get list of subjects with their question counts
const subjects = computed(() => {
  const subjectList = Object.keys(store.subjects || {});
  return subjectList.map(subject => {
    const count = store.questions.filter(q => q.source?.startsWith(`${subject}/`)).length;
    return {
      key: subject,
      name: prettySubject(subject),
      count
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'sv'));
});

const selectSubject = (subjectKey) => {
  store.selectSubject(subjectKey);
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h1 class="text-4xl font-extrabold text-slate-900">Iller5</h1>
        <p class="text-slate-600">Välj ett ämne för att börja studera</p>
      </div>

      <!-- Subject Cards -->
      <div class="space-y-3">
        <button
          v-for="subject in subjects"
          :key="subject.key"
          @click="selectSubject(subject.key)"
          class="w-full p-6 bg-white/80 backdrop-blur border-2 border-stone-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-200 text-left group"
        >
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition">
                {{ subject.name }}
              </h2>
              <p class="text-sm text-slate-500 mt-1">
                {{ subject.count }} frågor tillgängliga
              </p>
            </div>
            <div class="text-3xl opacity-50 group-hover:opacity-100 transition">
              →
            </div>
          </div>
        </button>
      </div>

      <!-- Footer note -->
      <div class="text-center text-xs text-slate-400 pt-4">
        Din progress sparas lokalt i webbläsaren
      </div>
    </div>
  </div>
</template>
