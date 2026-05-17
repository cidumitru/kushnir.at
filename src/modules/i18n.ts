import { SUPPORTED_LANGS } from '../config';
import { state, translations } from '../state';
import type { Lang } from '../types';
import { renderRating, renderReviews } from './reviews';

export function t(key: string, vars?: Record<string, string>): string {
  const dict = translations[state.lang];
  let str = dict[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, v);
    }
  }
  return str;
}

export function applyTranslations(): void {
  const dict = translations[state.lang];

  document.documentElement.lang = dict.htmlLang || state.lang;
  if (dict.docTitle) document.title = dict.docTitle;

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-ph]').forEach((el) => {
    const key = el.getAttribute('data-i18n-ph');
    if (key && dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });

  document.querySelectorAll<HTMLButtonElement>('.lang button').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === state.lang);
  });

  renderRating();
  renderReviews();
}

function isLang(value: string): value is Lang {
  return (SUPPORTED_LANGS as readonly string[]).includes(value);
}

export function setLanguage(lang: Lang): void {
  if (!isLang(lang)) return;
  state.lang = lang;
  applyTranslations();
  try {
    localStorage.setItem('lang', lang);
  } catch {
    /* ignore */
  }
}

export function pickInitialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang');
    if (saved && isLang(saved)) return saved;
  } catch {
    /* ignore */
  }
  return state.lang;
}

export function bindLangSwitcher(): void {
  document.querySelectorAll<HTMLButtonElement>('.lang button').forEach((b) => {
    b.addEventListener('click', () => {
      const lang = b.dataset.lang;
      if (lang && isLang(lang)) setLanguage(lang);
    });
  });
}
