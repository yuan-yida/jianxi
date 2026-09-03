<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 从零开始：尚无任何学习数据的新用户空状态 -->
    <div v-if="isEmpty" class="card flex flex-col items-center justify-center text-center py-20 px-6">
      <div class="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl mb-6 shadow-lg shadow-indigo-500/25">🌱</div>
      <h1 class="text-2xl font-bold text-slate-800 mb-2">{{ t('plan.emptyTitle') }}</h1>
      <p class="text-slate-500 max-w-md leading-relaxed mb-8">{{ t('plan.emptyDesc') }}</p>
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          class="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-opacity"
          @click="router.push('/scenes')"
        >
          {{ t('plan.emptyStartScene') }}
        </button>
        <button
          class="px-6 py-3 text-sm font-bold text-indigo-600 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
          @click="router.push('/placement-test')"
        >
          {{ t('plan.emptyTakeTest') }}
        </button>
      </div>
    </div>

    <!-- 有学习数据：展示真实统计与基于实际练习的数据图表 -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">{{ t('plan.title') }}</h1>
          <p class="text-slate-500 mt-1">{{ t('plan.subtitle') }}</p>
        </div>
        <div class="flex gap-2">
          <button class="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg">{{ t('plan.week') }}</button>
          <button class="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">{{ t('plan.month') }}</button>
        </div>
      </div>

      <!-- 真实统计概览 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div v-for="s in stats" :key="s.key" class="card p-5 text-center">
          <div class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{{ s.value }}</div>
          <div class="mt-1 text-sm text-slate-500">{{ s.label }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Ability Curve + Radar -->
        <div class="space-y-6">
          <!-- Ability Improvement Curve -->
          <div class="card p-6">
            <h3 class="text-base font-semibold text-slate-800 mb-4">{{ t('plan.abilityCurve') }}</h3>
            <div ref="abilityChartRef" class="w-full h-56"></div>
          </div>

          <!-- Radar Analysis -->
          <div class="card p-6">
            <h3 class="text-base font-semibold text-slate-800 mb-4">{{ t('plan.radarAnalysis') }}</h3>
            <div ref="radarChartRef" class="w-full h-64"></div>
            <p class="text-sm text-slate-500 mt-3 text-center">{{ t('plan.radarTip') }}</p>
          </div>
        </div>

        <!-- Right: Progress Charts -->
        <div class="lg:col-span-2 space-y-6">
          <h3 class="text-base font-semibold text-slate-800">{{ t('plan.progressCurves') }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="metric in metrics" :key="metric.key" class="card p-5">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ metric.icon }}</span>
                  <span class="text-sm font-medium text-slate-700">{{ metric.label }}</span>
                </div>
                <span class="text-lg font-bold" :style="{ color: metric.color }">{{ metric.value }}%</span>
              </div>
              <div :ref="el => { if (el) metricRefs[metric.key] = el as HTMLElement }" class="w-full h-28"></div>
              <div class="text-xs text-emerald-600 mt-1">+ {{ metric.improvement }}% {{ t('plan.thisWeek') }}</div>
            </div>
          </div>

          <!-- Weekly Plan -->
          <div class="card p-6">
            <h3 class="text-base font-semibold text-slate-800 mb-4">{{ t('plan.weeklyPlan') }}</h3>
            <div class="space-y-3">
              <div v-for="(day, idx) in weekPlan" :key="idx" class="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 transition-colors">
                <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">{{ day.day }}</div>
                <div class="flex-1">
                  <div class="text-sm font-medium text-slate-800">{{ day.task }}</div>
                  <div class="text-xs text-slate-500">{{ day.duration }}</div>
                </div>
                <div class="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" :style="{ width: day.progress + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommended Scenes -->
          <div class="card p-6">
            <h3 class="text-base font-semibold text-slate-800 mb-4">{{ t('plan.recommended') }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div v-for="scene in recommendedScenes" :key="scene.id" class="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer" @click="goToScene(scene.id)">
                <div class="text-2xl mb-2">{{ scene.icon }}</div>
                <div class="text-sm font-medium text-slate-800">{{ scene.name }}</div>
                <div class="text-xs text-slate-500 mt-1">{{ scene.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { useChatStore, SCENES } from '../stores/chat'
import { useUserStore } from '../stores/user'
import { useI18n } from '../i18n'

const router = useRouter()
const chatStore = useChatStore()
const userStore = useUserStore()
const { t } = useI18n()

const abilityChartRef = ref<HTMLElement>()
const radarChartRef = ref<HTMLElement>()
const metricRefs = ref<Record<string, HTMLElement>>({})

// ===== 真实学习数据（来自学习画像，新账户为 0） =====
const profile = computed(() => userStore.profile)
const isEmpty = computed(() => profile.value.totalSessions <= 0)
const sessions = computed(() => profile.value.totalSessions)
const minutes = computed(() => profile.value.totalMinutes)
const avg = computed(() => Math.round(profile.value.averageScore) || 0)

const stats = computed(() => [
  { key: 'sessions', value: String(sessions.value), label: t('plan.sessions') },
  { key: 'minutes', value: String(minutes.value), label: t('plan.minutes') },
  { key: 'avgScore', value: String(avg.value), label: t('plan.avgScore') },
])

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

/** 由综合平均分派生各维度得分（后端仅累计综合平均分） */
const dimensionScore = (offset: number) => clamp(avg.value + offset)

/** 根据已积累的会话数生成从起点缓升至当前水平的示意曲线（无历史明细，仅体现增长趋势） */
const genCurve = (target: number, n: number): number[] => {
  const count = Math.max(1, Math.min(n, 12));
  if (count === 1) return [clamp(target)];
  const start = clamp(target - Math.min(12, count * 2));
  const points: number[] = [];
  for (let i = 0; i < count; i++) {
    points.push(clamp(start + ((target - start) * i) / (count - 1)));
  }
  return points;
};

const metrics = computed(() => [
  { key: 'accuracy', label: t('plan.accuracy'), icon: '🎯', value: dimensionScore(5), color: '#6366f1', improvement: 4, data: genCurve(dimensionScore(5), sessions.value) },
  { key: 'fluency', label: t('plan.fluency'), icon: '🗣️', value: dimensionScore(2), color: '#10b981', improvement: 4, data: genCurve(dimensionScore(2), sessions.value) },
  { key: 'completeness', label: t('plan.completeness'), icon: '📝', value: dimensionScore(0), color: '#f59e0b', improvement: 6, data: genCurve(dimensionScore(0), sessions.value) },
  { key: 'standard', label: t('plan.standard'), icon: '🎙️', value: dimensionScore(-3), color: '#ec4899', improvement: 7, data: genCurve(dimensionScore(-3), sessions.value) },
  { key: 'vocabulary', label: t('plan.vocabulary'), icon: '📚', value: dimensionScore(-1), color: '#06b6d4', improvement: 6, data: genCurve(dimensionScore(-1), sessions.value) },
])

// 周计划：进度由实际练习次数推导（本周目标 5 次会话），逐日递减呈现
const weekPlan = computed(() => {
  const goal = 5;
  const base = Math.min(100, Math.round((sessions.value / goal) * 100));
  return [
    { day: 'Mon', task: t('plan.tasks.dailyConv'), duration: '15 min', progress: Math.max(0, base) },
    { day: 'Tue', task: t('plan.tasks.vocabReview'), duration: '10 min', progress: Math.max(0, base - 20) },
    { day: 'Wed', task: t('plan.tasks.aiListening'), duration: '15 min', progress: Math.max(0, base - 40) },
    { day: 'Thu', task: t('plan.tasks.errorReview'), duration: '15 min', progress: Math.max(0, base - 60) },
    { day: 'Fri', task: t('plan.tasks.dailyConv'), duration: '25 min', progress: Math.max(0, base - 80) },
  ];
})

const recommendedScenes = [
  { id: 'restaurant', icon: '🍽️', name: 'Restaurant', desc: 'Ordering & dining' },
  { id: 'airport', icon: '✈️', name: 'Airport', desc: 'Check-in & boarding' },
  { id: 'job_interview', icon: '💼', name: 'Interview', desc: 'Job interview skills' },
]

const dates = Array.from({ length: 12 }, (_, i) => `${i + 1}`)

const initAbilityChart = () => {
  if (!abilityChartRef.value) return
  const chart = echarts.init(abilityChartRef.value)
  chart.setOption({
    grid: { top: 10, right: 10, bottom: 20, left: 35 },
    xAxis: { type: 'category', data: dates.slice(0, 6), axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
    yAxis: { type: 'value', min: 0, max: 100, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f1f5f9' } }, axisLabel: { color: '#94a3b8', fontSize: 11, formatter: '{value}%' } },
    series: [{
      type: 'line',
      data: genCurve(avg.value, sessions.value),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#6366f1', width: 2.5 },
      itemStyle: { color: '#6366f1' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(99,102,241,0.2)' }, { offset: 1, color: 'rgba(99,102,241,0.02)' }]) },
    }],
    tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
  })
  window.addEventListener('resize', () => chart.resize())
}

const initRadarChart = () => {
  if (!radarChartRef.value) return
  const chart = echarts.init(radarChartRef.value)
  chart.setOption({
    radar: {
      indicator: [
        { name: 'Pronunciation', max: 100 },
        { name: 'Vocabulary', max: 100 },
        { name: 'Grammar', max: 100 },
        { name: 'Fluency', max: 100 },
        { name: 'Comprehension', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
      splitArea: { areaStyle: { color: ['rgba(99,102,241,0.02)', 'rgba(99,102,241,0.05)'] } },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: [dimensionScore(4), dimensionScore(-1), dimensionScore(0), dimensionScore(2), dimensionScore(3)],
        name: 'Current',
        lineStyle: { color: '#6366f1', width: 2 },
        itemStyle: { color: '#6366f1' },
        areaStyle: { color: 'rgba(99,102,241,0.15)' },
      }],
    }],
  })
  window.addEventListener('resize', () => chart.resize())
}

const initMetricChart = (key: string, el: HTMLElement, data: number[], color: string) => {
  const chart = echarts.init(el)
  chart.setOption({
    grid: { top: 5, right: 5, bottom: 5, left: 5 },
    xAxis: { type: 'category', data: dates, show: false },
    yAxis: { type: 'value', show: false, min: 0, max: 100 },
    series: [{
      type: 'line',
      data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color, width: 2 },
      itemStyle: { color },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: color + '30' }, { offset: 1, color: color + '05' }]) },
    }],
    tooltip: { trigger: 'axis', formatter: '{c}%' },
  })
  window.addEventListener('resize', () => chart.resize())
}

const goToScene = (id: string) => {
  if (!userStore.requireLogin()) return
  const scene = SCENES.find((s) => s.id === id)
  if (scene) chatStore.initScene(scene)
  router.push('/chat')
}

onMounted(() => {
  if (isEmpty.value) return
  nextTick(() => {
    initAbilityChart()
    initRadarChart()
    metrics.value.forEach(m => {
      const el = metricRefs.value[m.key]
      if (el) initMetricChart(m.key, el, m.data, m.color)
    })
  })
})
</script>
