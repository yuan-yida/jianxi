<template>
  <div class="flex h-[calc(100vh-4rem)] flex-col">
    <!-- Chat Header -->
    <div class="flex-shrink-0 border-b border-indigo-100 bg-white/80 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div class="mx-auto flex max-w-3xl items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="goBack" class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 sm:hidden">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-xl">
            {{ sceneEmoji }}
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-800">{{ scene?.title || t('chat.loading') }}</h2>
            <p class="text-xs text-slate-500">{{ scene?.titleZh }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Session Stats -->
          <div v-if="chatStore.messages.length > 0" class="hidden items-center gap-3 text-xs text-slate-500 sm:flex">
            <span class="flex items-center gap-1">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {{ chatStore.messageCount }}/{{ MAX_ROUNDS }} {{ t('chat.turns') }}
            </span>
            <span class="flex items-center gap-1">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ sessionDuration }}
            </span>
            <span class="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">{{ selectedDifficulty }}</span>
          </div>
          <div v-if="chatStore.messages.length > 0" class="flex items-center gap-2">
            <button
              @click="endSession"
              class="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
            >
              {{ t('chat.endReview') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-6 sm:px-6" @scroll="handleScroll">
      <div class="mx-auto max-w-3xl space-y-6">
        <!-- Scene picker when no scene selected -->
        <div v-if="!scene" class="py-10">
          <div class="mb-8 text-center">
            <div class="mb-3 text-5xl">🎭</div>
            <h3 class="mb-2 text-xl font-bold text-slate-800">{{ t('chat.pickScene') }}</h3>
            <p class="text-sm text-slate-500">{{ t('chat.pickSceneDesc') }}</p>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              v-for="s in SCENES"
              :key="s.id"
              @click="router.push(`/chat/${s.id}`)"
              class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                {{ getSceneEmoji(s.icon) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-slate-800">{{ s.title }}</div>
                <div class="text-xs text-slate-500 truncate">{{ s.description }}</div>
                <div class="mt-1 flex items-center gap-2">
                  <span class="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">{{ s.level }}</span>
                  <span class="text-[10px] text-slate-400">{{ s.vocabulary.length }} {{ t('chat.vocab') }}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Welcome message when no conversation yet -->
        <div v-else-if="chatStore.messages.length === 0 && !chatStore.isStreaming" class="py-6">
          <!-- Scene Info Card -->
          <div class="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
            <div class="mb-4 flex items-center gap-3">
              <div class="text-4xl">{{ sceneEmoji }}</div>
              <div>
                <h3 class="text-lg font-bold text-slate-800">{{ scene.title }}</h3>
                <p class="text-sm text-slate-600">{{ scene.description }}</p>
              </div>
            </div>
            <div class="mb-4 flex flex-wrap gap-2">
              <span class="rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-600 shadow-sm">
                {{ t('chat.level') }}: {{ scene.level }}
              </span>
              <span class="rounded-full bg-white px-3 py-1 text-xs font-medium text-purple-600 shadow-sm">
                {{ scene.vocabulary.length }} {{ t('chat.vocabWords') }}
              </span>
            </div>
            <!-- Vocabulary Preview -->
            <div class="mb-4">
              <div class="mb-2 text-xs font-medium text-slate-500">{{ t('chat.keyVocab') }}</div>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="word in scene.vocabulary"
                  :key="word"
                  class="rounded-lg bg-white px-2.5 py-1 text-xs text-slate-700 shadow-sm"
                >
                  {{ word }}
                </span>
              </div>
            </div>
            <!-- Difficulty Selection -->
            <div class="mb-5">
              <div class="mb-2 text-xs font-medium text-slate-500">{{ t('chat.difficulty') }}</div>
              <div class="flex gap-2">
                <button
                  v-for="d in difficulties"
                  :key="d.key"
                  @click="selectedDifficulty = d.key"
                  class="flex-1 rounded-xl border-2 px-3 py-2.5 text-center transition-all"
                  :class="selectedDifficulty === d.key
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'"
                >
                  <div class="text-sm font-bold">{{ d.label }}</div>
                  <div class="mt-0.5 text-[10px] opacity-70">{{ d.desc }}</div>
                </button>
              </div>
            </div>

            <!-- Tips -->
            <div class="rounded-xl bg-white/60 p-3">
              <div class="mb-1 text-xs font-medium text-indigo-600">💡 {{ t('chat.tips') }}</div>
              <p class="text-xs leading-relaxed text-slate-600">{{ scene.tips || t('chat.defaultTips') }}</p>
            </div>
            <!-- Round limit hint -->
            <div class="mt-3 rounded-xl bg-amber-50 p-2.5 text-center text-xs text-amber-700">
              {{ t('chat.roundLimitHint') }}
            </div>
          </div>

          <!-- Quick Start -->
          <div class="text-center">
            <button
              @click="initiateConversation"
              class="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              {{ t('chat.startConversation') }}
            </button>
            <p class="mt-3 text-xs text-slate-400">{{ t('chat.startHint') }}</p>
          </div>
        </div>

        <!-- Chat messages -->
        <div
          v-for="msg in chatStore.messages"
          :key="msg.id"
          class="flex gap-3"
          :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
        >
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium shadow-sm"
              :class="msg.role === 'user'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                : 'bg-indigo-100 text-indigo-600'"
            >
              {{ msg.role === 'user' ? '👤' : sceneEmoji }}
            </div>
          </div>

          <!-- Message bubble -->
          <div class="max-w-[80%] sm:max-w-[70%]">
            <!-- Role label -->
            <div class="mb-1 text-[10px] text-slate-400" :class="msg.role === 'user' ? 'text-right' : ''">
              {{ msg.role === 'user' ? t('chat.you') : scene?.title || 'AI' }}
            </div>

            <div
              class="rounded-2xl px-4 py-3 text-sm leading-relaxed"
              :class="msg.role === 'user'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                : 'border border-slate-200 bg-white text-slate-700'"
            >
              <div class="whitespace-pre-wrap" v-html="formatMessage(msg.content)"></div>
            </div>

            <!-- Message actions -->
            <div class="mt-1 flex items-center gap-2" :class="msg.role === 'user' ? 'justify-end' : ''">
              <span class="text-[10px] text-slate-400">{{ formatTime(msg.timestamp) }}</span>
              <button
                v-if="msg.role === 'assistant'"
                @click="copyMessage(msg)"
                class="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                :title="t('chat.copy')"
              >
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>

            <!-- Audio playback for assistant messages -->
            <div v-if="msg.role === 'assistant'" class="mt-2 flex items-center gap-2">
              <button
                @click="toggleAudio(msg)"
                :disabled="msg.isGeneratingAudio"
                class="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
              >
                <svg v-if="!msg.isPlaying && !msg.isGeneratingAudio" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <svg v-else-if="!msg.isGeneratingAudio" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
                <svg v-else class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                {{ msg.isGeneratingAudio ? t('chat.generating') : (msg.isPlaying ? t('chat.stop') : t('chat.listen')) }}
              </button>
            </div>

            <!-- Evaluation for user messages -->
            <div v-if="msg.evaluation && msg.role === 'user'" class="mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div class="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <svg class="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {{ t('chat.evaluation') }}
              </div>
              <div class="mb-2 grid grid-cols-3 gap-2">
                <div class="rounded-lg bg-slate-50 p-2 text-center">
                  <div class="text-lg font-bold" :class="scoreColor(msg.evaluation.pronunciationScore)">{{ msg.evaluation.pronunciationScore }}</div>
                  <div class="text-[10px] text-slate-500">{{ t('chat.pronunciation') }}</div>
                </div>
                <div class="rounded-lg bg-slate-50 p-2 text-center">
                  <div class="text-lg font-bold" :class="scoreColor(msg.evaluation.grammarScore)">{{ msg.evaluation.grammarScore }}</div>
                  <div class="text-[10px] text-slate-500">{{ t('chat.grammar') }}</div>
                </div>
                <div class="rounded-lg bg-slate-50 p-2 text-center">
                  <div class="text-lg font-bold" :class="scoreColor(msg.evaluation.fluencyScore)">{{ msg.evaluation.fluencyScore }}</div>
                  <div class="text-[10px] text-slate-500">{{ t('chat.fluency') }}</div>
                </div>
              </div>
              <p class="text-xs leading-relaxed text-slate-600">{{ msg.evaluation.feedback }}</p>
              <div v-if="msg.evaluation.corrections.length > 0" class="mt-2 space-y-1">
                <div
                  v-for="(corr, i) in msg.evaluation.corrections"
                  :key="i"
                  class="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs"
                >
                  <span class="text-rose-500 line-through">{{ corr.original }}</span>
                  <svg class="h-3 w-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  <span class="font-medium text-emerald-600">{{ corr.corrected }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Streaming indicator -->
        <div v-if="chatStore.isStreaming" class="flex gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm text-indigo-600 shadow-sm">
            {{ sceneEmoji }}
          </div>
          <div>
            <div class="mb-1 text-[10px] text-slate-400">{{ scene?.title || 'AI' }}</div>
            <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5">
                  <div class="h-2 w-2 animate-bounce rounded-full bg-indigo-500" style="animation-delay: 0ms"></div>
                  <div class="h-2 w-2 animate-bounce rounded-full bg-indigo-500" style="animation-delay: 150ms"></div>
                  <div class="h-2 w-2 animate-bounce rounded-full bg-indigo-500" style="animation-delay: 300ms"></div>
                </div>
                <span class="text-xs text-slate-400">{{ t('chat.aiThinking') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Scroll to bottom button -->
        <div v-if="showScrollButton" class="fixed bottom-28 right-6 z-10">
          <button
            @click="scrollToBottom"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg transition-all hover:bg-indigo-600 hover:shadow-xl"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Replies -->
    <div v-if="scene && chatStore.messages.length > 0 && !chatStore.isStreaming" class="flex-shrink-0 border-t border-indigo-50 bg-white/60 px-4 py-2 sm:px-6">
      <div class="mx-auto max-w-3xl flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="(reply, i) in quickReplies"
          :key="i"
          @click="sendQuickReply(reply)"
          class="flex-shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
        >
          {{ reply }}
        </button>
      </div>
    </div>

    <!-- Input Area -->
    <div class="flex-shrink-0 border-t border-indigo-100 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div class="mx-auto max-w-3xl">
        <div class="flex items-end gap-3">
          <!-- Text input -->
          <div class="relative flex-1">
            <textarea
              ref="textInput"
              v-model="inputText"
              @keydown.enter.exact.prevent="sendTextMessage"
              :placeholder="chatStore.isStreaming ? t('chat.aiThinking') : t('chat.typePlaceholder')"
              :disabled="chatStore.isStreaming"
              rows="1"
              class="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
              style="min-height: 44px; max-height: 120px;"
              @input="autoResize"
            ></textarea>
            <!-- Character counter -->
            <div v-if="inputText.length > 0" class="absolute bottom-1 right-3 text-[10px] text-slate-400">
              {{ inputText.length }}/500
            </div>
          </div>

          <!-- Voice record button -->
          <button
            @mousedown="startRecording"
            @mouseup="stopRecording"
            @mouseleave="stopRecording"
            @touchstart.prevent="startRecording"
            @touchend.prevent="stopRecording"
            :disabled="chatStore.isStreaming"
            class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all"
            :class="isRecording
              ? 'bg-rose-500 text-white recording-pulse'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50'"
            :title="t('chat.voiceInput')"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </button>

          <!-- Send button -->
          <button
            @click="sendTextMessage"
            :disabled="!inputText.trim() || chatStore.isStreaming"
            class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 disabled:opacity-30 disabled:shadow-none"
            :title="t('chat.send')"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <!-- Recording indicator -->
        <div v-if="isRecording" class="mt-3 flex items-center justify-center gap-2 text-sm text-rose-600">
          <div class="h-2 w-2 animate-pulse rounded-full bg-rose-500"></div>
          {{ t('chat.recording') }}
          <div class="flex items-end gap-0.5">
            <div v-for="i in 5" :key="i" class="w-1 rounded-full bg-rose-400 waveform-bar" :style="{ animationDelay: `${i * 0.15}s`, height: '4px' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useChatStore, SCENES, type MessageEvaluation } from '@/stores/chat';
import { useUserStore } from '@/stores/user';
import { useI18n } from '@/i18n';

const props = defineProps<{ sceneId?: string }>();
const router = useRouter();
const chatStore = useChatStore();
const userStore = useUserStore();
const { t } = useI18n();

const inputText = ref('');
const isRecording = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const textInput = ref<HTMLTextAreaElement | null>(null);
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks = ref<Blob[]>([]);
const currentAudio = ref<HTMLAudioElement | null>(null);
const showScrollButton = ref(false);
const sessionStartTime = ref<number>(Date.now());
const selectedDifficulty = ref<'A2' | 'B1' | 'B2'>('B1');

const MAX_ROUNDS = 20;

const difficulties = [
  { key: 'A2' as const, label: 'A2', desc: 'Simple sentences' },
  { key: 'B1' as const, label: 'B1', desc: 'Daily conversation' },
  { key: 'B2' as const, label: 'B2', desc: 'Complex expression' },
];

const scene = computed(() => SCENES.find((s) => s.id === props.sceneId) || null);
const sceneEmoji = computed(() => {
  if (!scene.value) return '💬';
  return getSceneEmoji(scene.value.icon);
});

const sessionDuration = computed(() => {
  const elapsed = Math.floor((Date.now() - sessionStartTime.value) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});

// Quick replies based on scene
const quickReplies = computed(() => {
  if (!scene.value) return [];
  const replies: Record<string, string[]> = {
    restaurant: ['Could I see the menu?', 'What do you recommend?', 'I\'d like to order...', 'Can I have the bill?'],
    airport: ['Where is the check-in counter?', 'I\'d like a window seat.', 'Is my flight on time?', 'Where is baggage claim?'],
    hotel: ['I have a reservation.', 'What time is check-out?', 'Could I get extra towels?', 'Is breakfast included?'],
    hospital: ['I don\'t feel well.', 'I have an appointment.', 'Where is the pharmacy?', 'I need a doctor.'],
    interview: ['Tell me about yourself.', 'What are your strengths?', 'Why do you want this job?', 'Do you have any questions?'],
    shopping: ['How much is this?', 'Do you have this in a different size?', 'Can I try this on?', 'I\'ll take it.'],
    taxi: ['Take me to the airport, please.', 'How long will it take?', 'Can you stop here?', 'Keep the change.'],
    phone: ['Hello, this is...', 'Could I speak to...?', 'I\'ll call back later.', 'Can you repeat that?'],
  };
  return replies[scene.value.id] || ['Hello!', 'Can you help me?', 'Tell me more.', 'Thank you!'];
});

const getSceneEmoji = (icon: string) => {
  const map: Record<string, string> = {
    'utensils': '🍽️', 'plane': '✈️', 'bed': '🛏️',
    'stethoscope': '🩺', 'briefcase': '💼', 'shopping-bag': '🛍️',
    'car': '🚕', 'phone': '📞',
  };
  return map[icon] || '💬';
};

onMounted(() => {
  if (scene.value) {
    chatStore.initScene(scene.value);
  }
});

onUnmounted(() => {
  if (currentAudio.value) {
    currentAudio.value.pause();
  }
});

onBeforeRouteLeave(() => {
  chatStore.reset();
});

watch(() => chatStore.messages.length, async () => {
  await nextTick();
  scrollToBottom();
});

const handleScroll = () => {
  if (!messagesContainer.value) return;
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  showScrollButton.value = scrollHeight - scrollTop - clientHeight > 100;
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth',
    });
  }
};

const goBack = () => router.push('/scenes');

const initiateConversation = async () => {
  if (!userStore.requireLogin()) return;
  chatStore.setDifficulty(selectedDifficulty.value);
  await chatStore.sendMessage('Hello!');
};

const sendTextMessage = async () => {
  if (!userStore.requireLogin()) return;
  if (!inputText.value.trim() || chatStore.isStreaming) return;
  // Check 20-round limit
  if (chatStore.messageCount >= MAX_ROUNDS) {
    endSession();
    return;
  }
  const text = inputText.value.trim();
  inputText.value = '';
  if (textInput.value) textInput.value.style.height = 'auto';
  await chatStore.sendMessage(text);
  // Auto-end after 20 rounds
  if (chatStore.messageCount >= MAX_ROUNDS) {
    setTimeout(() => endSession(), 1500);
  }
};

const sendQuickReply = async (reply: string) => {
  inputText.value = reply;
  await sendTextMessage();
};

const autoResize = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  target.style.height = 'auto';
  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
};

const startRecording = async () => {
  if (!userStore.requireLogin()) return;
  if (chatStore.isStreaming) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.value = new MediaRecorder(stream);
    audioChunks.value = [];
    mediaRecorder.value.ondataavailable = (e) => audioChunks.value.push(e.data);
    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
      stream.getTracks().forEach(t => t.stop());
      try {
        await chatStore.sendVoiceMessage(audioBlob);
      } catch {
        alert(t('chat.voiceFailed'));
      }
    };
    mediaRecorder.value.start();
    isRecording.value = true;
  } catch {
    alert('Microphone access denied');
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop();
  }
  isRecording.value = false;
};

const toggleAudio = async (msg: any) => {
  if (msg.isPlaying) {
    currentAudio.value?.pause();
    msg.isPlaying = false;
    return;
  }
  // 还没有音频时，先调用 TTS 生成
  if (!msg.audioUrl) {
    try {
      await chatStore.ensureAudio(msg);
    } catch {
      alert(t('chat.voiceFailed'));
      return;
    }
  }
  if (msg.audioUrl) {
    currentAudio.value?.pause();
    currentAudio.value = new Audio(msg.audioUrl);
    currentAudio.value.onended = () => { msg.isPlaying = false; };
    currentAudio.value.play();
    msg.isPlaying = true;
  }
};

const copyMessage = (msg: any) => {
  navigator.clipboard.writeText(msg.content).then(() => {
    // Could show a toast here
  });
};

const formatMessage = (content: string) => {
  // Basic markdown-like formatting
  return content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-xs">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="font-bold mt-2 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold mt-2 mb-1">$1</h2>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
};

const endSession = () => {
  if (!userStore.requireLogin()) return;
  // 记录本次练习的学习数据：实际时长（分钟，至少 1 分钟）+ 平均分
  const minutes = Math.max(1, Math.round((Date.now() - sessionStartTime.value) / 60000));
  const scored = chatStore.messages.filter((m) => m.evaluation);
  const score = scored.length
    ? Math.round(scored.reduce((sum, m) => sum + (m.evaluation!.pronunciationScore + m.evaluation!.grammarScore + m.evaluation!.fluencyScore) / 3, 0) / scored.length)
    : 0;
  userStore.addSession(minutes, score);
  router.push('/assessment');
};

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-rose-600';
};
</script>

<style scoped>
.recording-pulse {
  animation: pulse-rose 1.5s ease-in-out infinite;
}
@keyframes pulse-rose {
  0%, 100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(244, 63, 94, 0); }
}
.waveform-bar {
  animation: waveform 0.8s ease-in-out infinite alternate;
}
@keyframes waveform {
  0% { height: 4px; }
  100% { height: 16px; }
}
</style>
