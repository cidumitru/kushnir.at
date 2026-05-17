const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHTML(str: string): string {
  return String(str).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] ?? ch);
}

export function formatRelativeDate(isoDate: string, lang: string): string {
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const days = Math.max(0, Math.round(diffMs / 86_400_000));
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  if (days < 7) return rtf.format(-days, 'day');
  if (days < 30) return rtf.format(-Math.round(days / 7), 'week');
  if (days < 365) return rtf.format(-Math.round(days / 30), 'month');
  return rtf.format(-Math.round(days / 365), 'year');
}
