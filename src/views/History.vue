<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@/i18n';
import { useUserStore } from '@/stores/user';

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();

interface TrainingRecord {
  id: string;
  sceneId: string;
  sceneTitle: string;
  sceneIcon: string;
  difficulty: 'A2' | 'B1' | 'B2';
  startTime: number;
  duration: number; // minutes
  rounds: number;
  scores: {
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    fluency: number;
    naturalness: number;
    total: number;
  };
  suggestions: string[];
}

const records = ref<TrainingRecord[]>([]);
const filterScene = ref('all');
const filterSort = ref<'time' | 'score'>('time');

const sceneMap: Record<string, { title: string; icon: string }> = {
  restaurant: { title: 'Restaurant', icon: '🍽️' },
  airport: { title: 'Airport', icon: '✈️' },
  hotel: { title: 'Hotel', icon: '🛏️' },
  doctor: { title: "Doctor's Visit", icon: '🩺' },
  job_interview: { title: 'Job Interview', icon: '💼' },
  shopping: { title: 'Shopping', icon: '🛍️' },
  taxi: { title: 'Taxi Ride', icon: '🚕' },
  phone_call: { title: 'Phone Call', icon: '📞' },
};

const filteredRecords = computed(() => {
  let result = [...records.value];
  if (filterScene.value !== 'all') {
    result = result.filter(r => r.sceneId === filterScene.value);
  }
  if (filterSort.value === 'score') {
    result.sort((a, b) => b.scores.total - a.scores.total);
  } else {
    result.sort((a, b) => b.startTime - a.startTime);
  }
  return result;
});

const uniqueScenes = computed(() => {
  const ids = new Set(records.value.map(r => r.sceneId));
  return Array.from(ids).map(id => ({ id, ...sceneMap[id] }));
});

const avgScore = computed(() => {
  if (!records.value.length) return 0;
  return Math.round(records.value.reduce((sum, r) => sum + r.scores.total, 0) / records.value.length);
});

const totalMinutes = computed(() => {
  return records.value.reduce((sum, r) => sum + r.duration, 0);
});

const totalRounds = computed(() => {
  return records.value.reduce((sum, r) => sum + r.rounds, 0);
});

const formatDate = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return t('history.today');
  if (days === 1) return t('history.yesterday');
  if (days < 7) return `${days} ${t('history.daysAgo')}`;
  return d.toLocaleDateString();
};

const scoreColor = (score: number) => {
  if (score >= 85) return 'text-emerald-600 bg-emerald-50';
  if (score >= 70) return 'text-indigo-600 bg-indigo-50';
  if (score >= 55) return 'text-amber-600 bg-amber-50';
  return 'text-rose-600 bg-rose-50';
};

onMounted(() => {
  // Load from user store sessions or localStorage
  const saved = localStorage.getItem('verbflow_training_records');
  if (saved) {
    try {
      records.value = JSON.parse(saved);
    } catch {
      records.value = [];
    }
  }
  // Generate sample records if empty (for demo)
  if (!records.value.length) {
    records.value = generateSampleRecords();
    saveRecords();
  }
});

function saveRecords() {
  localStorage.setItem('verbflow_training_records', JSON.stringify(records.value));
}

function generateSampleRecords(): TrainingRecord[] {
  const scenes = Object.keys(sceneMap);
  const diffs: Array<'A2' | 'B1' | 'B2'> = ['A2', 'B1', 'B2'];
  const now = Date.now();
  return [
    {
      id: 'rec_1', sceneId: 'restaurant', sceneTitle: 'Restaurant Ordering', sceneIcon: '🍽️',
      difficulty: 'B1', startTime: now - 86400000, duration: 8, rounds: 12,
      scores: { pronunciation: 78, grammar: 82, vocabulary: 75, fluency: 80, naturalness: 76, total: 78 },
      suggestions: ['Practice restaurant-specific vocabulary', 'Work on polite request forms'],
    },
    {
      id: 'rec_2', sceneId: 'airport', sceneTitle: 'Airport Travel', sceneIcon: '✈️',
      difficulty: 'B1', startTime: now - 172800000, duration: 12, rounds: 16,
      scores: { pronunciation: 82, grammar: 79, vocabulary: 85, fluency: 83, naturalness: 80, total: 82 },
      suggestions: ['Practice asking for directions more naturally', 'Review boarding-related vocabulary'],
    },
    {
      id: 'rec_3', sceneId: 'job_interview', sceneTitle: 'Job Interview', sceneIcon: '💼',
      difficulty: 'B2', startTime: now - 345600000, duration: 15, rounds: 18,
      scores: { pronunciation: 72, grammar: 68, vocabulary: 74, fluency: 70, naturalness: 65, total: 70 },
      suggestions: ['Practice STAR method for behavioral questions', 'Work on professional vocabulary', 'Slow down speech for clarity'],
    },
    {
      id: 'rec_4', sceneId: 'hotel', sceneTitle: 'Hotel Check-in', sceneIcon: '🛏️',
      difficulty: 'A2', startTime: now - 518400000, duration: 6, rounds: 8,
      scores: { pronunciation: 85, grammar: 88, vocabulary: 82, fluency: 86, naturalness: 84, total: 85 },
      suggestions: ['Try more complex sentence structures', 'Practice B1 level hotel conversations'],
    },
  ];
}

// Expose for adding new records from ChatRoom
window.__verbflow_addRecord = (record: TrainingRecord) => {
  records.value.unshift(record);
  saveRecords();
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 px-4 py-8 sm:px-6">
    <div class="mx-auto max-w-5xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-800">{{ t('history.title') }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ t('history.subtitle') }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div class="text-2xl font-bold text-indigo-600">{{ records.length }}</div>
          <div class="mt-1 text-xs text-slate-500">{{ t('history.totalSessions') }}</div>
        </div>
        <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div class="text-2xl font-bold text-emerald-600">{{ totalMinutes }}</div>
          <div class="mt-1 text-xs text-slate-500">{{ t('history.totalMinutes') }}</div>
        </div>
        <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div class="text-2xl font-bold text-purple-600">{{ totalRounds }}</div>
          <div class="mt-1 text-xs text-slate-500">{{ t('history.totalRounds') }}</div>
        </div>
        <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div class="text-2xl font-bold text-amber-600">{{ avgScore }}</div>
          <div class="mt-1 text-xs text-slate-500">{{ t('history.avgScore') }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <select
          v-model="filterScene"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="all">{{ t('history.allScenes') }}</option>
          <option v-for="s in uniqueScenes" :key="s.id" :value="s.id">{{ s.icon }} {{ s.title }}</option>
        </select>
        <div class="flex rounded-xl border border-slate-200 bg-white shadow-sm">
          <button
            @click="filterSort = 'time'"
            class="px-3 py-2 text-sm rounded-l-xl transition-colors"
            :class="filterSort === 'time' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:text-slate-700'"
          >
            {{ t('history.sortTime') }}
          </button>
          <button
            @click="filterSort = 'score'"
            class="px-3 py-2 text-sm rounded-r-xl transition-colors"
            :class="filterSort === 'score' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:text-slate-700'"
          >
            {{ t('history.sortScore') }}
          </button>
        </div>
      </div>

      <!-- Records List -->
      <div class="space-y-4">
        <div
          v-for="record in filteredRecords"
          :key="record.id"
          class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                {{ record.sceneIcon }}
              </div>
              <div>
                <h3 class="font-semibold text-slate-800">{{ record.sceneTitle }}</h3>
                <div class="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span>{{ formatDate(record.startTime) }}</span>
                  <span class="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">{{ record.difficulty }}</span>
                  <span>{{ record.duration }} min</span>
                  <span>{{ record.rounds }} {{ t('history.rounds') }}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold" :class="scoreColor(record.scores.total).split(' ')[0]">
                {{ record.scores.total }}
              </div>
              <div class="text-[10px] text-slate-400">{{ t('history.score') }}</div>
            </div>
          </div>

          <!-- Score Bars -->
          <div class="mt-4 grid grid-cols-5 gap-2">
            <div v-for="(label, key) in { pronunciation: t('history.pronunciation'), grammar: t('history.grammar'), vocabulary: t('history.vocabulary'), fluency: t('history.fluency'), naturalness: t('history.naturalness') }" :key="key" class="text-center">
              <div class="mb-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full transition-all"
                  :class="(record.scores as any)[key] >= 80 ? 'bg-emerald-500' : (record.scores as any)[key] >= 60 ? 'bg-amber-500' : 'bg-rose-500'"
                  :style="{ width: `${(record.scores as any)[key]}%` }"
                ></div>
              </div>
              <div class="text-[10px] text-slate-400">{{ label }}</div>
              <div class="text-xs font-semibold text-slate-600">{{ (record.scores as any)[key] }}</div>
            </div>
          </div>

          <!-- Suggestions -->
          <div v-if="record.suggestions.length" class="mt-3 rounded-xl bg-slate-50 p-3">
            <div class="mb-1 text-[10px] font-medium text-slate-500">{{ t('history.suggestions') }}</div>
            <ul class="space-y-0.5">
              <li v-for="(s, i) in record.suggestions" :key="i" class="text-xs text-slate-600">• {{ s }}</li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="mt-3 flex gap-2">
            <button
              @click="router.push(`/chat/${record.sceneId}`)"
              class="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
            >
              {{ t('history.practiceAgain') }}
            </button>
            <button
              @click="router.push('/assessment')"
              class="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              {{ t('history.viewReport') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!filteredRecords.length" class="py-16 text-center">
        <div class="mb-3 text-4xl">📝</div>
        <h3 class="text-lg font-semibold text-slate-700">{{ t('history.noRecords') }}</h3>
        <p class="mt-1 text-sm text-slate-500">{{ t('history.noRecordsDesc') }}</p>
        <button
          @click="router.push('/scenes')"
          class="mt-4 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          {{ t('history.startNow') }}
        </button>
      </div>
    </div>
  </div>
</template>
