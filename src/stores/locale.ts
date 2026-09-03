import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type Locale = 'en' | 'zh';

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>('en');

  const isZh = computed(() => locale.value === 'zh');
  const isEn = computed(() => locale.value === 'en');

  function toggle() {
    locale.value = locale.value === 'en' ? 'zh' : 'en';
  }

  function setLocale(lang: Locale) {
    locale.value = lang;
  }

  return { locale, isZh, isEn, toggle, setLocale };
});
