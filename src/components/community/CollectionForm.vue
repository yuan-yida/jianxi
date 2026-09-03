<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@/i18n';

const props = defineProps<{ defaultName?: string }>();
const emit = defineEmits<{
  (e: 'created', value: { name: string; icon: string; color: string }): void;
  (e: 'cancel'): void;
}>();

const { t } = useI18n();

const ICONS = ['📁', '📚', '🎯', '🎙️', '💡', '📝', '🎧', '✈️', '📈', '🏆', '🗂️', '🌟'];
const COLORS = ['#6366f1', '#f59e0b', '#ec4899', '#10b981', '#06b6d4', '#ef4444', '#8b5cf6', '#f97316'];

const name = ref(props.defaultName || '');
const icon = ref('📁');
const color = ref('#6366f1');
const error = ref('');

const submit = () => {
  if (!name.value.trim()) {
    error.value = t('community.favorites.nameRequired');
    return;
  }
  emit('created', { name: name.value, icon: icon.value, color: color.value });
};
</script>

<template>
  <div class="space-y-3">
    <div>
      <label class="text-xs text-slate-400 mb-1.5 block">{{ t('community.favorites.nameLabel') }}</label>
      <input
        v-model="name"
        type="text"
        maxlength="12"
        :placeholder="t('community.favorites.namePlaceholder')"
        class="w-full text-sm bg-slate-50 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-200"
        @keyup.enter="submit"
      />
    </div>

    <div>
      <label class="text-xs text-slate-400 mb-1.5 block">{{ t('community.favorites.iconLabel') }}</label>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="ic in ICONS"
          :key="ic"
          class="w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors"
          :class="icon === ic ? 'bg-indigo-100 ring-1 ring-indigo-300' : 'bg-slate-50 hover:bg-slate-100'"
          @click="icon = ic"
        >
          {{ ic }}
        </button>
      </div>
    </div>

    <div>
      <label class="text-xs text-slate-400 mb-1.5 block">{{ t('community.favorites.colorLabel') }}</label>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="c in COLORS"
          :key="c"
          class="w-7 h-7 rounded-full transition-transform"
          :class="color === c ? 'ring-2 ring-offset-2 ring-slate-300 scale-110' : 'hover:scale-110'"
          :style="{ background: c }"
          @click="color = c"
        ></button>
      </div>
    </div>

    <p v-if="error" class="text-xs text-rose-500">{{ error }}</p>

    <div class="flex items-center justify-end gap-3 pt-1">
      <button class="text-sm text-slate-400 hover:text-slate-600 transition-colors" @click="emit('cancel')">
        {{ t('community.create.cancel') }}
      </button>
      <button class="px-4 py-1.5 text-sm font-medium text-white btn-primary" @click="submit">
        {{ t('community.publish') }}
      </button>
    </div>
  </div>
</template>
