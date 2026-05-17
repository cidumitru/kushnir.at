export type Lang = 'de' | 'en';

export interface Translations {
  htmlLang: string;
  docTitle: string;
  [key: string]: string;
}

export interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
}

export interface ReviewSummary {
  rating: number;
  best_rating: number;
  count: number;
  source: string;
  source_url: string;
}

export interface ReviewsData {
  summary: ReviewSummary;
  items: Review[];
}
