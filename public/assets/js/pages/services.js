import { $, esc, icon, imageFallbacks } from '../core/ui.js';
import { loadServices } from '../core/catalog.js';
import { SERVICE_CATEGORIES, FALLBACK_SERVICES } from '../core/data.js';
import { serviceCard, fillGrid, SERVICE_FILL } from '../components/cards.js';
import { initCarousel } from '../components/carousel.js';
import { observeReveals } from '../site.js';

const PROCESS_STEPS = [
  { title: 'Packing', desc: 'Fragile items, kitchenware and furniture are carefully wrapped and boxed before moving day.' },
  { title: 'Loading', desc: 'Furniture and boxes are loaded securely into the truck, protected and organized for transport.' },
  { title: 'Transportation', desc: 'Your belongings travel safely to their destination, with the route and timing agreed in advance.' },
  { title: 'Unloading', desc: 'Boxes and furniture are carefully unloaded and brought into your new home or office.' },
  { title: 'Final setup', desc: 'Furniture is placed where you want it, so you can start settling in right away.' },
];

const gallery = $('.process-gallery');
if (gallery) {
  const captionText = $('[data-process-text]', gallery);
  initCarousel(gallery, {
    onChange: (i) => {
      const step = PROCESS_STEPS[i];
      if (!step || !captionText) return;
      captionText.innerHTML = `<span class="no">Step ${i + 1} of ${PROCESS_STEPS.length}</span><h3>${esc(step.title)}</h3><p>${esc(step.desc)}</p>`;
    },
  });
}

function categorySection(cat, services) {
  if (cat.slug === 'junk-removal') {
    const s = services[0];
    if (!s) return '';
    return `<section class="svc-category svc-category-spotlight" id="${esc(cat.slug)}">
      <div class="svc-cat-head">
        <span class="icon-badge">${icon(cat.icon)}</span>
        <p class="kicker">Also available</p>
        <h2>${esc(cat.name)}</h2>
        <p class="lead">${esc(cat.summary)}</p>
      </div>
      <div class="junk-spotlight reveal">
        <div class="media"><img src="${esc(s.imageUrl || '')}" alt="${esc(s.imageAlt || '')}" loading="lazy" width="1200" height="900"></div>
        <div class="body">
          <p>${esc(s.summary)}</p>
          <ul class="checklist">${(s.highlights || []).map((h) => `<li>${icon('check')}${esc(h)}</li>`).join('')}</ul>
          <div class="btn-row">
            <a class="btn btn-primary" href="/quote">Get a Quote</a>
            <a class="btn btn-outline" href="/services/${esc(s.slug)}">View details ${icon('arrow-right')}</a>
          </div>
        </div>
      </div>
    </section>`;
  }
  return `<section class="svc-category" id="${esc(cat.slug)}">
    <div class="svc-cat-head">
      <span class="icon-badge">${icon(cat.icon)}</span>
      <h2>${esc(cat.name)}</h2>
      <p class="lead">${esc(cat.summary)}</p>
    </div>
    ${fillGrid(services.map(serviceCard), SERVICE_FILL)}
  </section>`;
}

// Old links pointed at /services#<service-slug>; send those to the service's own page.
const legacy = location.hash.slice(1);
if (legacy && FALLBACK_SERVICES.some((s) => s.slug === legacy && s.slug !== s.category)) location.replace(`/services/${legacy}`);

loadServices().then((list) => {
  $('[data-jump-links]').innerHTML = SERVICE_CATEGORIES.map((c) => `<a href="#${esc(c.slug)}">${icon(c.icon)}${esc(c.name)}</a>`).join('');
  const host = $('[data-service-rows]');
  host.innerHTML = SERVICE_CATEGORIES
    .map((cat) => categorySection(cat, list.filter((s) => s.category === cat.slug)))
    .join('');
  host.removeAttribute('aria-busy');
  imageFallbacks(host);
  observeReveals();
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
});
