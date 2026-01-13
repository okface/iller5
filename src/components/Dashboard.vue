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
  const counts = store.sourceCounts || {};
  const showSubject = subjectsList.value.length > 1;
  const items = [];
  subjectsList.value.forEach(sub => {
    sub.topics.forEach(topic => {
      const source = `${sub.name}/${topic}`;
      const count = counts[source] || 0;
      items.push({
        source,
        subject: sub.name,
        topic,
        count,
        label: showSubject ? `${formatName(sub.name)} — ${formatName(topic)}` : `${formatName(topic)}`,
      });
    });
  });

  // Non-empty first; empty at bottom (greyed out)
  return items.sort((a, b) => {
    const aEmpty = a.count === 0;
    const bEmpty = b.count === 0;
    if (aEmpty !== bEmpty) return aEmpty ? 1 : -1;
    return a.label.localeCompare(b.label, 'sv');
  });
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

const focusSelected = (count) => {
  const sources = Array.from(selectedSources.value);
  if (sources.length === 0) {
    alert('Select at least one category.');
    return;
  }
  store.startSession('focus', sources, count);
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
          class="p-5 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow text-white hover:from-slate-800 hover:to-slate-950 transition"
        >
          <div class="text-2xl font-bold mb-1">5 Questions</div>
          <div class="text-xs mt-1 opacity-80">SRS weighted</div>
        </button>

        <button 
          @click="store.startSession('quick10')"
          class="p-5 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow text-white hover:from-indigo-700 hover:to-indigo-900 transition"
        >
          <div class="text-2xl font-bold mb-1">10 Questions</div>
          <div class="text-xs mt-1 opacity-80">SRS weighted</div>
        </button>

        <button 
          @click="store.startSession('focus', null, 10)"
          class="p-5 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl shadow text-white hover:from-emerald-700 hover:to-emerald-900 transition"
        >
          <div class="text-2xl font-bold mb-1">Focus</div>
          <div class="text-sm opacity-90">Study what you got wrong</div>
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
          class="w-full p-4 bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 rounded-xl hover:border-indigo-200 transition text-left"
        >
          <div class="font-bold text-gray-800">Study specific categories</div>
          <div class="text-sm text-gray-500 mt-1">Pick one or more categories</div>
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
              class="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer"
              :class="item.count === 0 ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-indigo-300 hover:bg-gray-50'"
            >
              <input
                type="checkbox"
                class="h-4 w-4"
                :checked="selectedSources.has(item.source)"
                :disabled="item.count === 0"
                @change="toggleSource(item.source)"
              />
              <span class="text-sm text-gray-800">{{ item.label }}</span>
              <span class="ml-auto text-xs text-gray-500" v-if="item.count !== 0">{{ item.count }}</span>
              <span class="ml-auto text-xs text-gray-400" v-else>0</span>
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

          <div class="mt-2">
            <button
              @click="focusSelected(10)"
              class="w-full py-2 px-3 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition"
            >
              Focus (10)
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
