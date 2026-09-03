/**
 * 相对时间格式化（依赖 i18n 文案）
 */
export function formatRelativeTime(ts: number, t: (key: string) => string): string {
  const diff = Date.now() - ts;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d >= 30) return t('community.favorites.time.month');
  if (d >= 7) return `${Math.floor(d / 7)} ${t('community.favorites.time.weeks')}`;
  if (d >= 1) return `${d} ${t('community.favorites.time.days')}`;
  if (h >= 1) return `${h} ${t('community.favorites.time.hours')}`;
  if (m >= 1) return `${m} ${t('community.favorites.time.minutes')}`;
  return t('community.favorites.time.justNow');
}
