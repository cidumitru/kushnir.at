import './styles/base.css';
import './styles/topbar.css';
import './styles/hero.css';
import './styles/services.css';
import './styles/declaration.css';
import './styles/form.css';
import './styles/contact.css';
import './styles/reviews.css';
import './styles/footer.css';

import { applyTranslations, bindLangSwitcher, pickInitialLang } from './modules/i18n';
import { bindForm } from './modules/form';
import { lazyLoadMap } from './modules/map';
import { bindReviewsToggle } from './modules/reviews';
import { injectReviewSchema } from './modules/schema';
import { state } from './state';

function boot(): void {
  bindForm();
  bindLangSwitcher();
  bindReviewsToggle();
  lazyLoadMap();

  state.lang = pickInitialLang();

  injectReviewSchema();
  applyTranslations();
}

try {
  boot();
} catch (err) {
  console.error('[kushnir] boot failed', err);
}
