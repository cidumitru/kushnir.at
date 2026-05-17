import { MAP_SRC } from '../config';

export function lazyLoadMap(): void {
  const container = document.getElementById('footer-map');
  if (!container || container.querySelector('iframe')) return;

  const insert = (): void => {
    if (container.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = MAP_SRC;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.title = 'Atelier Kushnir — Hermanngasse 2A, 1070 Wien';
    iframe.setAttribute(
      'aria-label',
      'Karte zum Atelier Kushnir, Hermanngasse 2A, 1070 Wien',
    );
    container.appendChild(iframe);
  };

  if (!('IntersectionObserver' in window)) {
    insert();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        insert();
      }
    },
    { rootMargin: '600px 0px' },
  );
  observer.observe(container);
}
