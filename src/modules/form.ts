import { WHATSAPP_NUMBER } from '../config';
import { t } from './i18n';

export function bindForm(): void {
  const form = document.getElementById('leadForm');
  if (!(form instanceof HTMLFormElement)) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const nameEl = document.getElementById('name');
    const catEl = document.getElementById('category');
    const descEl = document.getElementById('description');

    if (
      !(nameEl instanceof HTMLInputElement) ||
      !(catEl instanceof HTMLSelectElement) ||
      !(descEl instanceof HTMLTextAreaElement)
    ) {
      return;
    }

    const name = nameEl.value.trim();
    const cat = catEl.options[catEl.selectedIndex]?.textContent?.trim() ?? '';
    const desc = descEl.value.trim();

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
