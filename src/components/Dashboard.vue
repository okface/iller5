<script setup>
import { computed, ref } from 'vue';
import { useStudyStore } from '@/stores/study';

const store = useStudyStore();

const showCategoryPicker = ref(false);
const selectedSources = ref(new Set());

// Group subjects for display
// store.subjects is { folder: [file1, file2] }
const subjectsList = computed(() => {
  return Object.keys(store.subjects).map(folder => ({
    name: folder,
    topics: store.subjects[folder]
  }));
});

const allSources = computed(() => {
  const items = [];
  subjectsList.value.forEach(sub => {
    sub.topics.forEach(topic => {
      items.push({
        source: `${sub.name}/${topic}`,
        subject: sub.name,
        topic,
        label: `${formatName(sub.name)} — ${formatName(topic)}`,
      });
    });
  });
  return items;
});

// Format folder names (e.g. medical_exam -> Medical Exam)
const formatName = (str) => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const startSpecific = (subject, topic) => {
  store.startSession('specific', `${subject}/${topic}`); // matches the 'source' field we added in bundle.py
};

const openCategoryPicker = () => {
  selectedSources.value = new Set();
  showCategoryPicker.value = true;
};

const closeCategoryPicker = () => {
  showCategoryPicker.value = false;
};

const toggleSource = (source) => {
  const next = new Set(selectedSources.value);
  if (next.has(source)) next.delete(source);
  else next.add(source);
  selectedSources.value = next;
};

const startSelected = (count) => {
  const sources = Array.from(selectedSources.value);
  if (sources.length === 0) {
    alert('Select at least one category.');
    return;
  }
  store.startSession('multi', sources, count);
  showCategoryPicker.value = false;
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

    <!-- Category Picker (multi-select) -->
    <section>
      <h2 class="text-2xl font-bold mb-3 text-gray-800">Categories</h2>

      <div v-if="subjectsList.length === 0" class="text-gray-500 italic">
        No content found. Please add content to /data folder.
      </div>

      <div v-else class="space-y-3">
        <button
          v-if="!showCategoryPicker"
          @click="openCategoryPicker"
          class="w-full p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition text-left"
        >
          <div class="font-bold text-gray-800">Study specific categories</div>
          <div class="text-sm text-gray-500 mt-1">Pick one or more categories (checkbox grid)</div>
        </button>

        <div v-else class="bg-white border border-gray-200 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="font-bold text-gray-800">Select categories</div>
            <button @click="closeCategoryPicker" class="text-sm text-gray-500 hover:text-gray-900">Cancel</button>
          </div>

          <div class="text-xs text-gray-500 mb-3">Selected: {{ selectedSources.size }}</div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
            <label
              v-for="item in allSources"
              :key="item.source"
              class="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                class="h-4 w-4"
                :checked="selectedSources.has(item.source)"
                @change="toggleSource(item.source)"
              />
              <span class="text-sm text-gray-800">{{ item.label }}</span>
            </label>
          </div>

          <div class="mt-4 flex gap-2">
            <button
              @click="startSelected(5)"
              class="flex-1 py-2 px-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
            >
              Start 5
            </button>
            <button
              @click="startSelected(10)"
              class="flex-1 py-2 px-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
            >
              Start 10
            </button>
          </div>

          <div class="mt-3 text-xs text-gray-500">
            Tip: you can pick across subjects.
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
