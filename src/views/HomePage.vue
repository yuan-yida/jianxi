<template>
  <div class="relative overflow-hidden">
    <!-- Hero Section -->
    <section class="relative px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-20">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl"></div>
      </div>

      <div class="relative mx-auto max-w-5xl text-center">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5">
          <div class="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></div>
          <span class="text-sm font-medium text-indigo-600">{{ t('home.badge') }}</span>
        </div>

        <h1 class="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          <span class="text-slate-800">{{ t('home.heroTitle1') }}</span><br />
          <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{{ t('home.heroTitle2') }}</span>
        </h1>

        <p class="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-500 sm:text-xl">
          {{ t('home.heroDesc') }}
        </p>

        <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <router-link
            to="/scenes"
            class="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02]"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {{ t('home.startPracticing') }}
            <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </router-link>
          <router-link
            to="/placement-test"
            class="inline-flex items-center gap-2 rounded-2xl border-2 border-indigo-200 px-8 py-4 text-lg font-bold text-indigo-600 transition-all hover:border-indigo-300 hover:bg-indigo-50"
          >
            {{ t('home.takeLevelTest') }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- Why Section -->
    <section class="px-4 py-16 sm:px-6 sm:py-24">
      <div class="mx-auto max-w-5xl text-center">
        <h2 class="mb-3 text-3xl font-bold text-slate-800 sm:text-4xl">{{ t('home.whyTitle') }}</h2>
        <p class="mb-12 text-slate-500">{{ t('home.whyDesc') }}</p>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="f in features" :key="f.key" class="card p-6 text-left transition-all hover:-translate-y-1">
            <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">{{ f.icon }}</div>
            <h3 class="mb-2 text-lg font-semibold text-slate-800">{{ t(f.title) }}</h3>
            <p class="text-sm leading-relaxed text-slate-500">{{ t(f.desc) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Scenarios Preview -->
    <section class="px-4 py-16 sm:px-6 sm:py-24">
      <div class="mx-auto max-w-5xl">
        <div class="mb-10 flex items-end justify-between">
          <div>
            <h2 class="text-3xl font-bold text-slate-800 sm:text-4xl">{{ t('home.scenarioTitle') }}</h2>
            <p class="mt-2 text-slate-500">{{ t('home.scenarioDesc') }}</p>
          </div>
          <router-link to="/scenes" class="hidden text-sm font-medium text-indigo-600 hover:text-indigo-700 sm:block">
            {{ t('home.viewAll') }} →
          </router-link>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <router-link
            v-for="scene in previewScenes"
            :key="scene.id"
            :to="{ path: '/chat', query: { scene: scene.id } }"
            class="card p-5 transition-all hover:-translate-y-1 hover:shadow-lg group"
          >
            <div class="mb-3 text-3xl">{{ scene.icon }}</div>
            <h3 class="mb-1 font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{{ scene.name }}</h3>
            <p class="text-xs text-slate-500 line-clamp-2">{{ scene.desc }}</p>
          </router-link>
        </div>
        <div class="mt-6 text-center sm:hidden">
          <router-link to="/scenes" class="text-sm font-medium text-indigo-600">{{ t('home.viewAll') }} →</router-link>
        </div>
      </div>
    </section>

    <!-- Learning Resources -->
    <section class="px-4 py-16 sm:px-6 sm:py-24">
      <div class="mx-auto max-w-5xl">
        <div class="mb-10 text-center">
          <h2 class="text-3xl font-bold text-slate-800 sm:text-4xl">{{ t('home.resourcesTitle') }}</h2>
          <p class="mt-2 text-slate-500">{{ t('home.resourcesDesc') }}</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a v-for="resource in resources" :key="resource.name" :href="resource.url" target="_blank" rel="noopener"
            class="card p-5 transition-all hover:-translate-y-1 hover:shadow-lg group no-underline">
            <div class="flex items-start gap-4">
              <div class="text-3xl flex-shrink-0">{{ resource.icon }}</div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{{ resource.name }}</h3>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium" :style="{ background: resource.tagColor + '15', color: resource.tagColor }">{{ resource.tag }}</span>
                </div>
                <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">{{ resource.desc }}</p>
                <div class="flex items-center gap-1 mt-2 text-xs text-indigo-500">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  {{ t('home.visitSite') }}
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="px-4 py-12 sm:px-6">
      <div class="mx-auto max-w-4xl">
        <div class="card grid grid-cols-2 gap-6 p-8 sm:grid-cols-4">
          <div v-for="s in stats" :key="s.key" class="text-center">
            <div class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{{ s.value }}</div>
            <div class="mt-1 text-sm text-slate-500">{{ t(s.label) }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-indigo-100 px-4 py-8 text-center text-sm text-slate-400 sm:px-6">
      {{ t('home.footer') }}
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../i18n'

const { t } = useI18n()

const features = [
  { key: 'rolePlay', icon: '🎭', title: 'home.features.rolePlay', desc: 'home.features.rolePlayDesc' },
  { key: 'voice', icon: '🎙️', title: 'home.features.voice', desc: 'home.features.voiceDesc' },
  { key: 'assessment', icon: '📊', title: 'home.features.assessment', desc: 'home.features.assessmentDesc' },
  { key: 'plans', icon: '📈', title: 'home.features.plans', desc: 'home.features.plansDesc' },
  { key: 'communityFeature', icon: '👥', title: 'home.features.communityFeature', desc: 'home.features.communityDesc' },
  { key: 'allAges', icon: '👨‍👩‍👧‍', title: 'home.features.allAges', desc: 'home.features.allAgesDesc' },
]

const previewScenes = [
  { id: 'restaurant', icon: '🍽️', name: 'Restaurant', desc: 'Practice ordering food and dining conversations' },
  { id: 'airport', icon: '✈️', name: 'Airport', desc: 'Check-in, security, and boarding dialogues' },
  { id: 'interview', icon: '💼', name: 'Interview', desc: 'Job interview practice with AI interviewer' },
  { id: 'shopping', icon: '🛍️', name: 'Shopping', desc: 'Shopping conversations and bargaining' },
]

const resources = [
  { name: 'BBC Learning English', icon: '📺', tag: 'Video', tagColor: '#ef4444', desc: 'Free English lessons from BBC with videos, audio, and interactive exercises for all levels.', url: 'https://www.bbc.co.uk/learningenglish' },
  { name: 'VOA Learning English', icon: '🎧', tag: 'Audio', tagColor: '#3b82f6', desc: 'News-based English learning with slower speed audio and transcripts for beginners.', url: 'https://learningenglish.voanews.com' },
  { name: 'TED Talks', icon: '🎤', tag: 'Speech', tagColor: '#e11d48', desc: 'Inspiring talks from experts worldwide. Great for advanced listening practice.', url: 'https://www.ted.com/talks' },
  { name: 'Duolingo', icon: '🦉', tag: 'App', tagColor: '#22c55e', desc: 'Gamified language learning with bite-sized lessons. Perfect for daily practice.', url: 'https://www.duolingo.com' },
  { name: 'Cambridge Dictionary', icon: '📖', tag: 'Tool', tagColor: '#8b5cf6', desc: 'Authoritative English dictionary with pronunciation, examples, and grammar guides.', url: 'https://dictionary.cambridge.org' },
  { name: 'English Central', icon: '🎬', tag: 'Video', tagColor: '#f59e0b', desc: 'Learn English through videos with interactive subtitles and pronunciation feedback.', url: 'https://www.englishcentral.com' },
]

const stats = [
  { key: 'scenarios', value: '8+', label: 'home.stats.scenarios' },
  { key: 'vocabulary', value: '5000+', label: 'home.stats.vocabulary' },
  { key: 'ai', value: '24/7', label: 'home.stats.ai' },
  { key: 'feedback', value: '100%', label: 'home.stats.feedback' },
]
</script>
