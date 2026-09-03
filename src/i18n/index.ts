import { computed } from 'vue';
import { useLocaleStore, type Locale } from '@/stores/locale';
import { translations } from '@/i18n/translations';

/**
 * Simple i18n composable.
 * Usage:
 *   const { t, locale, toggleLocale } = useI18n();
 *   t('home.heroTitle1')  // => "Master English" or "精通英语"
 */
export function useI18n() {
  const localeStore = useLocaleStore();

  const locale = computed(() => localeStore.locale);

  function t(key: string): string {
    const parts = key.split('.');
    let current: unknown = translations;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return key; // fallback to key
      }
    }
    if (current && typeof current === 'object' && 'en' in current && 'zh' in current) {
      return (current as Record<Locale, string>)[localeStore.locale];
    }
    return key;
  }

  function toggleLocale() {
    localeStore.toggle();
  }

  return { t, locale, toggleLocale, localeStore };
}
