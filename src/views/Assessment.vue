<template>
  <div class="px-4 py-10 sm:px-6 sm:py-16">
    <div class="mx-auto max-w-3xl">
      <!-- Header -->
      <div class="mb-10 text-center">
        <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          <svg class="h-8 w-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h1 class="mb-2 text-3xl font-bold text-slate-800">{{ t('assessment.title') }}</h1>
        <p class="text-slate-500">{{ t('assessment.desc') }}</p>
      </div>

      <!-- Overall Score -->
      <div class="mb-8 card p-8 text-center">
        <div class="relative mx-auto mb-6 h-40 w-40">
          <svg class="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" stroke-width="8"/>
            <circle
              cx="50" cy="50" r="45" fill="none"
              :stroke="overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#6366f1' : '#f59e0b'"
              stroke-width="8" stroke-linecap="round"
              :stroke-dasharray="283"
              :stroke-dashoffset="283 - (283 * overallScore) / 100"
              class="score-circle"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-4xl font-extrabold text-slate-800">{{ overallScore }}</span>
            <span class="text-xs text-slate-500">{{ t('assessment.overall') }}</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 sm:grid-cols-5">
          <div v-for="metric in metrics" :key="metric.labelKey" class="text-center">
            <div class="text-2xl font-bold" :class="scoreColor(metric.score)">{{ metric.score }}</div>
            <div class="text-xs text-slate-500">{{ t(metric.labelKey) }}</div>
            <div class="mx-auto mt-2 h-1.5 w-full max-w-[80px] overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full transition-all duration-1000"
                :class="metric.score >= 80 ? 'bg-emerald-500' : metric.score >= 60 ? 'bg-indigo-500' : 'bg-amber-500'"
                :style="{ width: `${metric.score}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Session Stats -->
      <div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div v-for="stat in sessionStats" :key="stat.label" class="card p-4 text-center">
          <div class="text-xl font-bold text-slate-800">{{ stat.value }}</div>
          <div class="text-xs text-slate-500">{{ t(stat.labelKey) }}</div>
        </div>
      </div>

      <!-- Detailed Feedback -->
      <div v-if="feedbackItems.length > 0" class="mb-8 card p-6">
        <h2 class="mb-4 text-lg font-bold text-slate-800">{{ t('assessment.detailed') }}</h2>
        <div class="space-y-4">
          <div v-for="(item, idx) in feedbackItems" :key="idx" class="rounded-xl bg-slate-50 p-4">
            <div class="mb-2 flex items-center gap-2">
              <span class="text-xs font-medium text-indigo-600">{{ t('assessment.turn') }} {{ idx + 1 }}</span>
            </div>
            <p class="text-sm text-slate-700">{{ item.feedback }}</p>
            <div v-if="item.corrections.length > 0" class="mt-2 space-y-1">
              <div v-for="(corr, i) in item.corrections" :key="i" class="rounded-lg bg-white px-2.5 py-1.5 text-xs border border-slate-200">
                <span class="text-rose-500 line-through">{{ corr.original }}</span>
                <span class="mx-1 text-slate-400">&rarr;</span>
                <span class="text-emerald-600">{{ corr.corrected }}</span>
                <span class="ml-2 text-slate-500">{{ corr.explanation }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button @click="router.push('/chat')" class="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40">
          {{ t('assessment.practiceAgain') }}
        </button>
        <button @click="router.push('/scenes')" class="rounded-xl border-2 border-indigo-200 px-6 py-3 font-semibold text-indigo-600 transition-all hover:bg-indigo-50">
          {{ t('assessment.tryNew') }}
        </button>
        <button @click="router.push('/history')" class="rounded-xl border-2 border-slate-200 px-6 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50">
          {{ t('assessment.viewHistory') }}
        </button>
      </div>

      <!-- Training Suggestions -->
      <div v-if="suggestions.length > 0" class="mt-8 card p-6">
        <h2 class="mb-4 text-lg font-bold text-slate-800">{{ t('assessment.suggestions') }}</h2>
        <ul class="space-y-3">
          <li v-for="(s, i) in suggestions" :key="i" class="flex items-start gap-3 rounded-xl bg-indigo-50/50 p-3">
            <span class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">{{ i + 1 }}</span>
            <span class="text-sm text-slate-700">{{ s }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { useI18n } from '../i18n'

const router = useRouter()
const chatStore = useChatStore()
const { t } = useI18n()

const overallScore = computed(() => {
  const msgs = chatStore.messages.filter(m => m.evaluation)
  if (msgs.length === 0) return 0
  const total = msgs.reduce((sum, m) => {
    const e = m.evaluation!
    return sum + (e.pronunciationScore + e.grammarScore + e.fluencyScore) / 3
  }, 0)
  return Math.round(total / msgs.length)
})

const metrics = computed(() => {
  const msgs = chatStore.messages.filter(m => m.evaluation)
  if (msgs.length === 0) return []
  const avg = (key: 'pronunciationScore' | 'grammarScore' | 'fluencyScore') =>
    Math.round(msgs.reduce((s, m) => s + m.evaluation![key], 0) / msgs.length)
  // Vocabulary and naturalness are derived from grammar and fluency for now
  const vocabScore = Math.round((avg('grammarScore') + avg('fluencyScore')) / 2)
  const naturalScore = Math.round((avg('pronunciationScore') + avg('fluencyScore')) / 2)
  return [
    { labelKey: 'chat.pronunciation', score: avg('pronunciationScore') },
    { labelKey: 'chat.grammar', score: avg('grammarScore') },
    { labelKey: 'history.vocabulary', score: vocabScore },
    { labelKey: 'chat.fluency', score: avg('fluencyScore') },
    { labelKey: 'history.naturalness', score: naturalScore },
  ]
})

const sessionStats = computed(() => [
  { labelKey: 'assessment.stats.duration', value: Math.ceil(chatStore.messages.length * 0.5) + ' ' + t('assessment.stats.min') },
  { labelKey: 'assessment.stats.turnsLabel', value: chatStore.messageCount },
  { labelKey: 'assessment.stats.scene', value: chatStore.currentScene?.title || '-' },
  { labelKey: 'assessment.stats.words', value: chatStore.messages.filter(m => m.role === 'user').reduce((s, m) => s + m.content.split(' ').length, 0) },
])

const feedbackItems = computed(() =>
  chatStore.messages
    .filter(m => m.role === 'user' && m.evaluation)
    .map(m => ({ feedback: m.evaluation!.feedback, corrections: m.evaluation!.corrections }))
)

const suggestions = computed(() => {
  const msgs = chatStore.messages.filter(m => m.evaluation)
  const result: string[] = []
  if (msgs.length === 0) return result
  const avgPron = msgs.reduce((s, m) => s + m.evaluation!.pronunciationScore, 0) / msgs.length
  const avgGram = msgs.reduce((s, m) => s + m.evaluation!.grammarScore, 0) / msgs.length
  const avgFlu = msgs.reduce((s, m) => s + m.evaluation!.fluencyScore, 0) / msgs.length
  if (avgPron < 70) result.push(t('assessment.suggestPron'))
  if (avgGram < 70) result.push(t('assessment.suggestGram'))
  if (avgFlu < 70) result.push(t('assessment.suggestFlu'))
  if (result.length === 0) result.push(t('assessment.suggestGeneral'))
  const scene = chatStore.currentScene
  if (scene) result.push(t('assessment.suggestScene', scene.title))
  return result
})

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-indigo-600'
  return 'text-amber-600'
}
</script>

<style scoped>
.score-circle {
  transition: stroke-dashoffset 1.5s ease-in-out;
}
</style>
