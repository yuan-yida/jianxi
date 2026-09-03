<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
    <div class="card max-w-2xl w-full p-8 sm:p-12">
      <!-- Step 1: Identity Selection -->
      <div v-if="step === 0" class="text-center">
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">{{ t('test.welcome') }}</h1>
        <p class="text-slate-500 mb-2">{{ t('test.welcomeDesc') }}</p>
        <p class="text-sm text-slate-400 mb-8">{{ t('test.duration') }}</p>

        <h2 class="text-lg font-semibold text-slate-700 mb-6">{{ t('test.selectIdentity') }}</h2>

        <div class="grid grid-cols-3 gap-4 sm:gap-6">
          <button
            v-for="identity in identities"
            :key="identity.id"
            @click="selectIdentity(identity)"
            class="card p-6 flex flex-col items-center gap-3 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
            :class="selectedIdentity?.id === identity.id ? 'border-indigo-400 ring-2 ring-indigo-200' : ''"
          >
            <div class="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-3xl group-hover:bg-indigo-100 transition-colors">
              {{ identity.icon }}
            </div>
            <div>
              <div class="font-semibold text-slate-800">{{ t(identity.label) }}</div>
              <div class="text-sm text-slate-400">{{ t(identity.ageLabel) }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Step 2: Questions -->
      <div v-else-if="step <= questions.length" class="text-center">
        <div class="flex items-center justify-between mb-6">
          <span class="text-sm text-slate-500">{{ t('test.question') }} {{ step }}/{{ questions.length }}</span>
          <div class="flex-1 mx-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" :style="{ width: `${(step / questions.length) * 100}%` }"></div>
          </div>
        </div>

        <h2 class="text-xl font-bold text-slate-800 mb-6">{{ questions[step - 1]?.question }}</h2>

        <div class="space-y-3 text-left">
          <button
            v-for="(option, idx) in questions[step - 1]?.options"
            :key="idx"
            @click="selectAnswer(option)"
            class="w-full p-4 rounded-xl border border-slate-200 text-left hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
            :class="answers[step - 1] === option ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200' : ''"
          >
            <span class="font-medium text-slate-700">{{ option }}</span>
          </button>
        </div>

        <div class="flex justify-between mt-8">
          <button
            v-if="step > 1"
            @click="step--"
            class="px-6 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {{ t('test.previous') }}
          </button>
          <div v-else></div>
          <button
            @click="nextQuestion"
            class="px-6 py-2.5 text-sm font-medium text-white btn-primary"
          >
            {{ step === questions.length ? t('test.finish') : t('test.next') }}
          </button>
        </div>
      </div>

      <!-- Step 3: Result -->
      <div v-else class="text-center">
        <div class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">{{ t('test.result') }}</h2>
        <p class="text-slate-500 mb-6">{{ t('test.resultDesc') }}</p>

        <div class="card bg-indigo-50/50 border-indigo-200 p-6 mb-8">
          <div class="text-sm text-slate-500 mb-1">{{ t('test.yourLevel') }}</div>
          <div class="text-3xl font-bold text-indigo-600">{{ levelResult }}</div>
          <div class="text-sm text-slate-500 mt-2">{{ levelDescriptions[levelResult] || '' }}</div>
        </div>

        <div class="flex gap-3 justify-center">
          <button @click="router.push('/learning-plan')" class="px-6 py-2.5 text-sm font-medium text-white btn-primary">
            {{ t('test.viewPlan') }}
          </button>
          <button @click="router.push('/scenes')" class="px-6 py-2.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">
            {{ t('test.startPractice') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useI18n } from '../i18n'

const router = useRouter()
const user = useUserStore()
const { t } = useI18n()

const step = ref(0)
const selectedIdentity = ref<{ id: string; label: string; ageRange: string } | null>(null)
const answers = ref<string[]>([])

const identities = [
  { id: 'child', label: 'test.child', ageLabel: 'test.childAge', icon: '🧒', ageRange: '6-12' },
  { id: 'teen', label: 'test.teen', ageLabel: 'test.teenAge', icon: '👦', ageRange: '13-18' },
  { id: 'adult', label: 'test.adult', ageLabel: 'test.adultAge', icon: '🧑', ageRange: '18+' },
]

const questions = [
  {
    question: 'What ___ you do yesterday?',
    options: ['do', 'did', 'does', 'doing'],
    answer: 'did',
  },
  {
    question: 'She ___ to the gym every morning.',
    options: ['go', 'goes', 'going', 'gone'],
    answer: 'goes',
  },
  {
    question: 'If it rains, I ___ stay at home.',
    options: ['will', 'would', 'am', 'was'],
    answer: 'will',
  },
  {
    question: 'The book ___ by millions of people.',
    options: ['read', 'reads', 'has been read', 'reading'],
    answer: 'has been read',
  },
  {
    question: 'I wish I ___ more time to travel.',
    options: ['have', 'had', 'has', 'having'],
    answer: 'had',
  },
  {
    question: 'By next year, she ___ here for 10 years.',
    options: ['works', 'will work', 'will have worked', 'is working'],
    answer: 'will have worked',
  },
  {
    question: 'Not only ___ he smart, but also hardworking.',
    options: ['is', 'does', 'has', 'was'],
    answer: 'is',
  },
  {
    question: 'The manager suggested ___ the meeting.',
    options: ['postpone', 'to postpone', 'postponing', 'postponed'],
    answer: 'postponing',
  },
  {
    question: '___ the bad weather, we went hiking.',
    options: ['Although', 'Despite', 'Because', 'Since'],
    answer: 'Despite',
  },
  {
    question: 'He spoke as if he ___ an expert.',
    options: ['is', 'was', 'were', 'be'],
    answer: 'were',
  },
]

const levelDescriptions: Record<string, string> = {
  A1: 'Beginner - Can understand and use familiar everyday expressions',
  A2: 'Elementary - Can communicate in simple and routine tasks',
  B1: 'Intermediate - Can deal with most situations while travelling',
  B2: 'Upper Intermediate - Can interact with fluency and spontaneity',
  C1: 'Advanced - Can express ideas fluently and flexibly',
}

const levelResult = computed(() => {
  const correct = answers.value.filter((a, i) => a === questions[i]?.answer).length
  if (correct <= 2) return 'A1'
  if (correct <= 4) return 'A2'
  if (correct <= 6) return 'B1'
  if (correct <= 8) return 'B2'
  return 'C1'
})

const selectIdentity = (identity: { id: string; label: string; ageRange: string }) => {
  if (!user.requireLogin()) return
  selectedIdentity.value = identity
  user.setProfile({ ageGroup: identity.id })
  setTimeout(() => { step.value = 1 }, 300)
}

const selectAnswer = (answer: string) => {
  answers.value[step.value - 1] = answer
}

// 测试等级 → 学习画像等级（新账户学习数据从零开始，测试结果写入画像）
const LEVEL_MAP: Record<string, 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced'> = {
  A1: 'beginner',
  A2: 'elementary',
  B1: 'intermediate',
  B2: 'upper_intermediate',
  C1: 'advanced',
}

const nextQuestion = () => {
  if (!answers.value[step.value - 1]) return
  if (step.value < questions.length) {
    step.value++
  } else {
    user.setProfile({ level: LEVEL_MAP[levelResult.value] || 'intermediate' })
    user.markTestDone()
    step.value = questions.length + 1
  }
}
</script>
