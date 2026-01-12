<script setup>
import { computed } from 'vue';
import { useStudyStore } from '@/stores/study';

const store = useStudyStore();

// Group subjects for display
// store.subjects is { folder: [file1, file2] }
const subjectsList = computed(() => {
  return Object.keys(store.subjects).map(folder => ({
    name: folder,
    topics: store.subjects[folder]
  }));
});

// Format folder names (e.g. medical_exam -> Medical Exam)
const formatName = (str) => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const startSpecific = (subject, topic) => {
  store.startSession('specific', `${subject}/${topic}`); // matches the 'source' field we added in bundle.py
};
</script>

<template>
  <div class="space-y-8 p-4">
    <!-- Quick Actions -->
    <section>
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Quick Study</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <button 
          @click="store.startSession('quick5')"
          class="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105"
        >
          <div class="text-3xl font-bold mb-1">5</div>
          <div class="font-medium opacity-90">Quick Cards</div>
          <div class="text-xs mt-2 opacity-75">SRS Weighted</div>
        </button>

        <button 
          @click="store.startSession('quick10')"
          class="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg text-white hover:from-indigo-600 hover:to-indigo-700 transition transform hover:scale-105"
        >
          <div class="text-3xl font-bold mb-1">10</div>
          <div class="font-medium opacity-90">Standard Set</div>
           <div class="text-xs mt-2 opacity-75">SRS Weighted</div>
        </button>

        <button 
          @click="store.startSession('worst10')"
          class="p-6 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg text-white hover:from-rose-600 hover:to-rose-700 transition transform hover:scale-105"
        >
          <div class="text-3xl font-bold mb-1">Worst</div>
          <div class="font-medium opacity-90">Focus Weakness</div>
           <div class="text-xs mt-2 opacity-75">Lowest Stats</div>
        </button>

      </div>
    </section>

    <!-- Library Browser -->
    <section>
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Library</h2>
      
      <div v-if="subjectsList.length === 0" class="text-gray-500 italic">
        No content found. Please add content to /data folder.
      </div>

      <div v-for="sub in subjectsList" :key="sub.name" class="mb-6">
        <h3 class="font-bold text-lg text-gray-700 mb-2 border-b border-gray-200 pb-1">
          {{ formatName(sub.name) }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            v-for="topic in sub.topics" 
            :key="topic"
            @click="startSpecific(sub.name, topic)"
            class="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition text-left"
          >
            <span class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
              <!-- Icon placeholder -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </span>
            <span class="font-medium text-gray-700">{{ formatName(topic) }}</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
