<template>
  <div class="px-4 py-10 sm:px-6 sm:py-16">
    <div class="mx-auto max-w-5xl">
      <!-- Back Button -->
      <router-link to="/scenes" class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {{ t('course.backToCourses') }}
      </router-link>

      <!-- Course Header -->
      <div class="card p-8 mb-8">
        <div class="flex flex-col sm:flex-row gap-6">
          <div class="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 text-5xl">
            {{ getSceneEmoji(course?.icon || '') }}
          </div>
          <div class="flex-1">
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">{{ course?.category }}</span>
              <span class="rounded-full px-3 py-1 text-xs font-medium" :class="difficultyClass(course?.difficulty || 'beginner')">
                {{ t(`difficulty.${course?.difficulty}`) }}
              </span>
              <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                {{ t('course.lessonsCount', { count: course?.lessons?.length || 0 }) }}
              </span>
            </div>
            <h1 class="mb-1 text-2xl font-bold text-slate-800 sm:text-3xl">{{ course?.title }}</h1>
            <p class="mb-3 text-base text-slate-500">{{ course?.titleZh }}</p>
            <p class="text-sm leading-relaxed text-slate-500">{{ course?.description }}</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="rounded-xl bg-indigo-50 p-4 text-center">
            <div class="text-2xl font-bold text-indigo-600">{{ course?.lessons?.length || 0 }}</div>
            <div class="text-xs text-slate-500">{{ t('course.lessons') }}</div>
          </div>
          <div class="rounded-xl bg-purple-50 p-4 text-center">
            <div class="text-2xl font-bold text-purple-600">{{ course?.vocabularyCount || 0 }}</div>
            <div class="text-xs text-slate-500">{{ t('course.vocabulary') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50 p-4 text-center">
            <div class="text-2xl font-bold text-emerald-600">{{ course?.estimatedMinutes || 30 }}</div>
            <div class="text-xs text-slate-500">{{ t('course.minutes') }}</div>
          </div>
          <div class="rounded-xl bg-amber-50 p-4 text-center">
            <div class="text-2xl font-bold text-amber-600">{{ course?.exercises?.length || 0 }}</div>
            <div class="text-xs text-slate-500">{{ t('course.exercises') }}</div>
          </div>
        </div>
      </div>

      <!-- Learning Objectives -->
      <div class="card p-6 mb-8">
        <h2 class="mb-4 text-xl font-bold text-slate-800 flex items-center gap-2">
          <svg class="h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {{ t('course.learningObjectives') }}
        </h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <div v-for="(obj, i) in course?.objectives || []" :key="i" class="flex items-start gap-3">
            <div class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span class="text-sm text-slate-600">{{ obj }}</span>
          </div>
        </div>
      </div>

      <!-- Core Vocabulary -->
      <div class="card p-6 mb-8">
        <h2 class="mb-4 text-xl font-bold text-slate-800 flex items-center gap-2">
          <svg class="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          {{ t('course.coreVocabulary') }}
        </h2>
        <div class="flex flex-wrap gap-2">
          <span v-for="word in course?.vocabulary || []" :key="word" class="rounded-full bg-purple-50 border border-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700">
            {{ word }}
          </span>
        </div>
      </div>

      <!-- Lessons List -->
      <div class="card p-6 mb-8">
        <h2 class="mb-4 text-xl font-bold text-slate-800 flex items-center gap-2">
          <svg class="h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          {{ t('course.courseLessons') }}
        </h2>
        <div class="space-y-3">
          <div
            v-for="(lesson, index) in course?.lessons || []"
            :key="index"
            class="group flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer"
            @click="startLesson(lesson)"
          >
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600">
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{{ lesson.title }}</h3>
              <p class="text-xs text-slate-500 truncate">{{ lesson.description }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs text-slate-400">{{ lesson.duration }} {{ t('course.minutes') }}</span>
              <svg class="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Practice Exercises -->
      <div class="card p-6 mb-8">
        <h2 class="mb-4 text-xl font-bold text-slate-800 flex items-center gap-2">
          <svg class="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          {{ t('course.practiceExercises') }}
        </h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="(exercise, index) in course?.exercises || []"
            :key="index"
            class="rounded-xl border border-slate-100 p-4 transition-all hover:border-amber-200 hover:bg-amber-50/50"
          >
            <div class="mb-2 flex items-center gap-2">
              <span class="text-lg">{{ exercise.icon }}</span>
              <span class="text-sm font-semibold text-slate-800">{{ exercise.title }}</span>
            </div>
            <p class="text-xs text-slate-500">{{ exercise.description }}</p>
          </div>
        </div>
      </div>

      <!-- Tips -->
      <div v-if="course?.tips" class="card p-6 mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
        <h2 class="mb-3 text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg class="h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          {{ t('course.tips') }}
        </h2>
        <p class="text-sm leading-relaxed text-slate-600">{{ course.tips }}</p>
      </div>

      <!-- Start Practice CTA -->
      <div class="text-center">
        <button
          @click="startCourse"
          class="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02]"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          {{ t('course.startPractice') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../i18n'
import { useChatStore, SCENES } from '../stores/chat'
import { useUserStore } from '../stores/user'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const userStore = useUserStore()

const course = computed(() => {
  const sceneId = route.params.sceneId as string
  return SCENES.find(s => s.id === sceneId)
})

function getSceneEmoji(icon: string): string {
  const map: Record<string, string> = {
    'restaurant': '🍽️', 'airport': '✈️', 'hotel': '', 'doctor': '',
    'interview': '', 'shopping': '🛍️', 'taxi': '🚕', 'phone': '📞',
  }
  return map[icon] || '📚'
}

function difficultyClass(d: string): string {
  const map: Record<string, string> = {
    beginner: 'bg-emerald-100 text-emerald-700',
    elementary: 'bg-blue-100 text-blue-700',
    intermediate: 'bg-amber-100 text-amber-700',
    upper_intermediate: 'bg-orange-100 text-orange-700',
    advanced: 'bg-rose-100 text-rose-700',
  }
  return map[d] || 'bg-slate-100 text-slate-700'
}

function startLesson(lesson: { title: string; description: string }) {
  if (!userStore.requireLogin()) return
  if (!course.value) return
  chatStore.startScene(course.value.id)
  chatStore.addMessage({
    id: Date.now().toString(),
    role: 'system',
    content: `Welcome to "${lesson.title}"! ${lesson.description}`,
    timestamp: Date.now(),
  })
  router.push(`/chat/${course.value.id}`)
}

function startCourse() {
  if (!userStore.requireLogin()) return
  if (!course.value) return
  chatStore.startScene(course.value.id)
  router.push(`/chat/${course.value.id}`)
}
</script>
