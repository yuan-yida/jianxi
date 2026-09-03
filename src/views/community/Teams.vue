<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '@/i18n';
import { useCommunityStore } from '@/stores/community';

const { t } = useI18n();
const community = useCommunityStore();

const tab = ref<'all' | 'mine'>('all');

const visibleTeams = computed(() => {
  if (tab.value === 'mine') return community.teams.filter((team) => team.joined);
  return community.teams;
});

const progress = (team: (typeof community.teams)[0]) =>
  Math.min(100, Math.round((team.doneMinutes / team.goalMinutes) * 100));
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-lg font-bold text-slate-800">👥 {{ t('community.teams') }}</h2>
        <p class="text-xs text-slate-400 mt-0.5">{{ t('community.teamsDesc') }}</p>
      </div>
      <div class="flex gap-2">
        <button
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          :class="tab === 'all' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-50'"
          @click="tab = 'all'"
        >
          {{ t('community.all') }}
        </button>
        <button
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          :class="tab === 'mine' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-50'"
          @click="tab = 'mine'"
        >
          {{ t('community.myTeams') }}
        </button>
      </div>
    </div>

    <div v-if="visibleTeams.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        v-for="team in visibleTeams"
        :key="team.id"
        class="card p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br text-white flex items-center justify-center text-2xl shrink-0"
            :class="team.color"
          >{{ team.icon }}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-semibold text-slate-800 truncate">{{ team.name }}</h3>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium shrink-0">
                #{{ team.rank }}
              </span>
            </div>
            <div class="text-xs text-slate-400 mt-0.5">👥 {{ team.members }}/{{ team.totalMembers }} {{ t('community.members') }}</div>
          </div>
        </div>

        <p class="text-xs text-slate-500 leading-relaxed mt-3">{{ team.description }}</p>

        <div class="mt-4">
          <div class="flex items-center justify-between text-[11px] mb-1.5">
            <span class="text-slate-400">{{ t('community.teamGoal') }}</span>
            <span class="font-semibold text-indigo-600">{{ team.doneMinutes }}/{{ team.goalMinutes }} min</span>
          </div>
          <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" :style="{ width: progress(team) + '%' }"></div>
          </div>
          <div class="text-right text-[11px] text-slate-400 mt-1">{{ progress(team) }}%</div>
        </div>

        <button
          class="mt-4 w-full px-4 py-2 text-sm font-medium rounded-xl transition-colors"
          :class="team.joined ? 'bg-slate-100 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'"
          @click="community.joinTeam(team.id)"
        >
          {{ team.joined ? t('community.joined') : t('community.joinTeam') }}
        </button>
      </div>
    </div>

    <div v-else class="card p-16 text-center">
      <div class="text-5xl mb-3">🚀</div>
      <p class="text-slate-400 text-sm">{{ t('community.emptyTeams') }}</p>
    </div>
  </div>
</template>
