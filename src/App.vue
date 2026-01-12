<script setup>
import { onMounted } from 'vue';
import { useStudyStore } from '@/stores/study';
import Dashboard from '@/components/Dashboard.vue';
import Quiz from '@/components/Quiz.vue';

const store = useStudyStore();

onMounted(() => {
  store.loadContent();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 font-sans">
    <div v-if="store.loading" class="flex items-center justify-center h-screen">
      <div class="text-xl animate-pulse text-indigo-600 font-bold">Loading Iller5...</div>
    </div>
    
    <div v-else-if="store.error" class="flex items-center justify-center h-screen">
      <div class="text-red-600 bg-red-100 p-8 rounded-lg shadow-lg max-w-md">
        <h2 class="font-bold text-lg mb-2">Error</h2>
        {{ store.error }}
        <button @click="location.reload()" class="mt-4 text-sm underline display-block">Reload</button>
      </div>
    </div>

    <div v-else class="max-w-2xl mx-auto min-h-screen bg-white shadow-xl flex flex-col relative">
      <!-- Header -->
      <header class="bg-indigo-600 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <h1 class="font-bold text-lg cursor-pointer flex items-center gap-2" @click="store.view = 'dashboard'">
          <span>Iller5</span>
        </h1>
        <div class="text-xs opacity-75">Local & Private</div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-grow p-4 md:p-6 overflow-y-auto">
        <transition name="fade" mode="out-in">
          <Dashboard v-if="store.view === 'dashboard'" />
          <Quiz v-else-if="store.view === 'quiz'" />
        </transition>
      </main>
    </div>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
