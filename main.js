/* ============================================================
   Atelier Kushnir — runtime
   - Translations live in i18n/<lang>.json
   - Reviews live in data/reviews.json
   - All cards stay in the DOM so search engines index them
============================================================ */

const WHATSAPP_NUMBER = '4369010545862';
const DEFAULT_LANG = 'de';
const SUPPORTED_LANGS = ['de', 'en'];
const INITIAL_VISIBLE_REVIEWS = 4;

const state = {
  lang: DEFAULT_LANG,
  translations: {},
  reviews: null,
  expandedReviews: false,
};

/* ——— Data loading —————————————————————————————————————— */

async function loadJSON(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

async function loadTranslations(lang) {
  if (state.translations[lang]) return state.translations[lang];
  const data = await loadJSON(`i18n/${lang}.json`);
  state.translations[lang] = data;
  return data;
}

/* ——— i18n —————————————————————————————————————————————— */

function t(key, vars) {
  const dict = state.translations[state.lang] || {};
  let str = dict[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, v);
    }
  }
  return str;
}

function applyTranslations() {
  const dict = state.translations[state.lang];
  if (!dict) return;

  document.documentElement.lang = dict.htmlLang || state.lang;
  if (dict.docTitle) document.title = dict.docTitle;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });

  document.querySelectorAll('.lang button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === state.lang);
  });

  renderRatingLine();
  renderReviews();
}

async function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  state.lang = lang;
  await loadTranslations(lang);
  applyTranslations();
  try { localStorage.setItem('lang', lang); } catch (_) { /* ignore */ }
}

/* ——— Reviews —————————————————————————————————————————— */

function formatRelativeDate(isoDate, lang) {
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return '';
  const now = new Date();
  const diffMs = now - then;
  const days = Math.max(0, Math.round(diffMs / 86_400_000));
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  if (days < 7)   return rtf.format(-days, 'day');
  if (days < 30)  return rtf.format(-Math.round(days / 7),   'week');
  if (days < 365) return rtf.format(-Math.round(days / 30),  'month');
  return rtf.format(-Math.round(days / 365), 'year');
}

function renderReviews() {
  const list = document.getElementById('reviews-list');
  if (!list || !state.reviews) return;

  list.setAttribute('data-expanded', state.expandedReviews ? 'true' : 'false');

  const items = state.reviews.items;
  list.innerHTML = items.map((r, i) => {
    const extra = i >= INITIAL_VISIBLE_REVIEWS ? ' is-extra' : '';
    const stars = '★'.repeat(r.rating || 5);
    const date  = formatRelativeDate(r.date, state.lang);
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
  }).join('');

  const btnLabel = document.querySelector('#showAllReviewsBtn [data-role="show-label"]');
  const btnCount = document.getElementById('showCount');
  if (btnLabel) btnLabel.textContent = state.expandedReviews ? t('t_show_less') : t('t_show_all');
  if (btnCount) btnCount.textContent = state.expandedReviews ? '' : `(${items.length})`;
}

function renderRatingLine() {
  const el = document.getElementById('ratingBasis');
  if (!el || !state.reviews) return;
  el.textContent = t('t_basis', { count: state.reviews.summary.count });

  const score = document.getElementById('ratingScore');
  if (score) score.textContent = `${state.reviews.summary.rating.toFixed(1)} / ${state.reviews.summary.best_rating}`;
}

function injectReviewSchema() {
  const node = document.getElementById('business-schema');
  if (!node || !state.reviews) return;

  let schema;
  try { schema = JSON.parse(node.textContent); }
  catch (e) { console.error('[kushnir] schema parse failed', e); return; }

  const { summary, items } = state.reviews;
  schema.aggregateRating = {
    '@type': 'AggregateRating',
    ratingValue: summary.rating.toFixed(1),
    reviewCount: summary.count,
    bestRating: summary.best_rating,
    worstRating: 1,
  };
  schema.review = items.slice(0, 12).map(r => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.author },
    datePublished: r.date,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: r.rating || 5,
      bestRating: summary.best_rating,
    },
    reviewBody: r.text,
  }));
  node.textContent = JSON.stringify(schema);
}

/* ——— Helpers —————————————————————————————————————————— */

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

/* ——— Form ————————————————————————————————————————————— */

function bindForm() {
  const form = document.getElementById('leadForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const name = document.getElementById('name').value.trim();
    const sel  = document.getElementById('category');
    const cat  = sel.options[sel.selectedIndex].textContent.trim();
    const desc = document.getElementById('description').value.trim();

    const msg = [
      t('msg_heading'),
      '',
      `${t('msg_name')}: ${name}`,
      `${t('msg_category')}: ${cat}`,
      `${t('msg_description')}: ${desc}`,
      '',
      t('msg_photo'),
    ].join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
  });
}

/* ——— Reviews toggle ——————————————————————————————————— */

function bindReviewsToggle() {
  const btn = document.getElementById('showAllReviewsBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const willCollapse = state.expandedReviews;
    state.expandedReviews = !state.expandedReviews;
    renderReviews();
    if (willCollapse) {
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/* ——— Language switcher ——————————————————————————————— */

function bindLangSwitcher() {
  document.querySelectorAll('.lang button').forEach(b => {
    b.addEventListener('click', () => setLanguage(b.dataset.lang));
  });
}

/* ——— Boot ————————————————————————————————————————————— */

function pickInitialLang() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  } catch (_) { /* ignore */ }
  const nav = (navigator.language || DEFAULT_LANG).toLowerCase().slice(0, 2);
  return SUPPORTED_LANGS.includes(nav) ? nav : DEFAULT_LANG;
}

async function boot() {
  bindForm();
  bindLangSwitcher();
  bindReviewsToggle();

  const initialLang = pickInitialLang();

  const [translations, reviews] = await Promise.all([
    loadTranslations(initialLang),
    loadJSON('data/reviews.json'),
  ]);

  state.lang = initialLang;
  state.translations[initialLang] = translations;
  state.reviews = reviews;

  injectReviewSchema();
  applyTranslations();
}

boot().catch(err => {
  console.error('[kushnir] boot failed', err);
});
