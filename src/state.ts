import deTranslations from './i18n/de.json';
import enTranslations from './i18n/en.json';
import reviewsData from './data/reviews.json';
import { DEFAULT_LANG } from './config';
import type { Lang, ReviewsData, Translations } from './types';

export const translations: Record<Lang, Translations> = {
  de: deTranslations as Translations,
  en: enTranslations as Translations,
};

export const reviews: ReviewsData = reviewsData as ReviewsData;

export interface AppState {
  lang: Lang;
  expandedReviews: boolean;
}

export const state: AppState = {
  lang: DEFAULT_LANG,
  expandedReviews: false,
};
