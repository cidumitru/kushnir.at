import { INITIAL_VISIBLE_REVIEWS } from '../config';
import { reviews, state } from '../state';
import { escapeHTML, formatRelativeDate } from '../utils';
import { t } from './i18n';

export function renderRating(): void {
  const { rating, best_rating } = reviews.summary;
  const score = document.getElementById('ratingScore');
  if (score) score.textContent = `${rating.toFixed(1)} / ${best_rating}`;
}

export function renderReviews(): void {
  const list = document.getElementById('reviews-list');
  if (!list) return;

  list.setAttribute('data-expanded', state.expandedReviews ? 'true' : 'false');

  list.innerHTML = reviews.items
    .map((r, i) => {
      const extra = i >= INITIAL_VISIBLE_REVIEWS ? ' is-extra' : '';
      const stars = '★'.repeat(r.rating || 5);
      const date = formatRelativeDate(r.date, state.lang);
      return `
      <article class="review-item${extra}">
        <div class="mark-q" aria-hidden="true">“</div>
        <div class="stars" aria-label="${r.rating || 5} / 5">${stars}</div>
        <p class="body">${escapeHTML(r.text)}</p>
        <div class="attr">
          <strong>${escapeHTML(r.author)}</strong>
          <span>${t('t_source_google')} · ${date}</span>
        </div>
      </article>`;
    })
    .join('');

  const btnLabel = document.querySelector<HTMLElement>(
    '#showAllReviewsBtn [data-role="show-label"]',
  );
  if (btnLabel) btnLabel.textContent = state.expandedReviews ? t('t_show_less') : t('t_show_all');
}

export function bindReviewsToggle(): void {
  const btn = document.getElementById('showAllReviewsBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const willCollapse = state.expandedReviews;
    state.expandedReviews = !state.expandedReviews;
    renderReviews();
    if (willCollapse) {
      document
        .getElementById('reviews')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}
