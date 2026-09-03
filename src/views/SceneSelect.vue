<template>
  <div class="px-4 py-10 sm:px-6 sm:py-16">
    <div class="mx-auto max-w-6xl">
      <div class="mb-10">
        <h1 class="mb-3 text-3xl font-bold text-slate-800 sm:text-4xl">{{ t('scenes.title') }}</h1>
        <p class="text-lg text-slate-500">{{ t('scenes.desc') }}</p>
      </div>

      <!-- Category Filter -->
      <div class="mb-8 flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="selectedCategory = cat.id"
          class="rounded-full px-4 py-2 text-sm font-medium transition-all"
          :class="selectedCategory === cat.id
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
            : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'"
        >
          {{ t(cat.label) }}
        </button>
      </div>

      <!-- Age Group Filter -->
      <div class="mb-8 flex flex-wrap gap-2">
        <span class="mr-2 self-center text-sm text-slate-500">{{ t('scenes.ageLabel') }}</span>
        <button
          v-for="age in ageGroups"
          :key="age.id"
          @click="selectedAge = age.id"
          class="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
          :class="selectedAge === age.id
            ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
            : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-200'"
        >
          {{ t(age.label) }}
        </button>
      </div>

      <!-- Scene Grid -->
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <router-link
          v-for="scene in filteredScenes"
          :key="scene.id"
          :to="`/course/${scene.id}`"
          class="group card block p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="mb-4 flex items-start justify-between">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl transition-transform group-hover:scale-110">
              {{ getSceneEmoji(scene.icon) }}
            </div>
            <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="difficultyClass(scene.difficulty)">
              {{ t(`difficulty.${scene.difficulty}`) }}
            </span>
          </div>

          <h3 class="mb-1 text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{{ scene.title }}</h3>
          <p class="mb-1 text-sm text-slate-500">{{ scene.titleZh }}</p>
          <p class="mb-4 text-sm leading-relaxed text-slate-500">{{ scene.description }}</p>

          <div class="flex items-center justify-between">
            <div class="flex flex-wrap gap-1">
              <span class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">{{ scene.lessons?.length || 0 }} {{ t('course.lessons') }}</span>
              <span class="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-600">{{ scene.vocabularyCount || 0 }} {{ t('course.vocabulary') }}</span>
            </div>
            <span class="text-sm font-medium text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">{{ t('course.viewDetail') }} →</span>
          </div>
        </router-link>
      </div>

      <div v-if="filteredScenes.length === 0" class="py-20 text-center text-slate-400">
        {{ t('scenes.noResults') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { useUserStore } from '../stores/user'
import { useI18n } from '../i18n'

const router = useRouter()
const chatStore = useChatStore()
const userStore = useUserStore()
const { t } = useI18n()

const selectedCategory = ref('all')
const selectedAge = ref('all')

const categories = [
  { id: 'all', label: 'scenes.categories.all' },
  { id: 'daily', label: 'scenes.categories.dailyLife' },
  { id: 'travel', label: 'scenes.categories.travel' },
  { id: 'career', label: 'scenes.categories.career' },
  { id: 'health', label: 'scenes.categories.health' },
]

const ageGroups = [
  { id: 'all', label: 'scenes.ageGroups.all' },
  { id: 'child', label: 'scenes.ageGroups.child' },
  { id: 'teen', label: 'scenes.ageGroups.teen' },
  { id: 'adult', label: 'scenes.ageGroups.adult' },
  { id: 'senior', label: 'scenes.ageGroups.senior' },
]

const scenes = [
  { id: 'restaurant', title: 'Restaurant Ordering', titleZh: '餐厅点餐', icon: 'restaurant', description: 'Practice ordering food, asking about menu items, and dining conversations with a waiter.', category: 'daily', difficulty: 'beginner', ageGroups: ['all'], tags: ['Food', 'Daily'] },
  { id: 'airport', title: 'Airport Check-in', titleZh: '机场值机', icon: 'airport', description: 'Navigate airport procedures including check-in, security, and boarding announcements.', category: 'travel', difficulty: 'elementary', ageGroups: ['all'], tags: ['Travel', 'Transport'] },
  { id: 'hotel', title: 'Hotel Check-in', titleZh: '酒店入住', icon: 'hotel', description: 'Book a room, ask about amenities, and handle common hotel situations.', category: 'travel', difficulty: 'elementary', ageGroups: ['all'], tags: ['Travel', 'Accommodation'] },
  { id: 'doctor', title: 'Doctor Visit', titleZh: '就医问诊', icon: 'doctor', description: 'Describe symptoms, understand medical advice, and discuss treatment options.', category: 'health', difficulty: 'intermediate', ageGroups: ['adult', 'senior'], tags: ['Health', 'Medical'] },
  { id: 'interview', title: 'Job Interview', titleZh: '求职面试', icon: 'interview', description: 'Practice common interview questions, discuss experience, and negotiate salary.', category: 'career', difficulty: 'upper_intermediate', ageGroups: ['adult'], tags: ['Career', 'Professional'] },
  { id: 'shopping', title: 'Shopping', titleZh: '购物消费', icon: 'shopping', description: 'Browse items, ask about prices, sizes, and make purchases in different stores.', category: 'daily', difficulty: 'beginner', ageGroups: ['all'], tags: ['Shopping', 'Daily'] },
  { id: 'taxi', title: 'Taxi Ride', titleZh: '打车出行', icon: 'taxi', description: 'Give directions, discuss routes, and handle payment with a taxi driver.', category: 'travel', difficulty: 'beginner', ageGroups: ['all'], tags: ['Travel', 'Transport'] },
  { id: 'phone', title: 'Phone Call', titleZh: '电话沟通', icon: 'phone', description: 'Make and receive phone calls, leave messages, and schedule appointments.', category: 'daily', difficulty: 'intermediate', ageGroups: ['all'], tags: ['Communication', 'Daily'] },
]

const filteredScenes = computed(() => {
  return scenes.filter(s => {
    const catMatch = selectedCategory.value === 'all' || s.category === selectedCategory.value
    const ageMatch = selectedAge.value === 'all' || s.ageGroups.includes(selectedAge.value) || s.ageGroups.includes('all')
    return catMatch && ageMatch
  })
})

const getSceneEmoji = (icon: string) => {
  const map: Record<string, string> = { restaurant: '🍽️', airport: '✈️', hotel: '🏨', doctor: '🩺', interview: '💼', shopping: '🛍️', taxi: '🚕', phone: '📞' }
  return map[icon] || ''
}

const difficultyClass = (d: string) => {
  const map: Record<string, string> = {
    beginner: 'bg-emerald-100 text-emerald-700',
    elementary: 'bg-blue-100 text-blue-700',
    intermediate: 'bg-amber-100 text-amber-700',
    upper_intermediate: 'bg-orange-100 text-orange-700',
    advanced: 'bg-rose-100 text-rose-700',
  }
  return map[d] || 'bg-slate-100 text-slate-600'
}

const startScene = (scene: typeof scenes[0]) => {
  if (!userStore.requireLogin()) return
  chatStore.setScene(scene.id as any)
  router.push('/chat')
}
</script>
