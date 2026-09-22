import '../site.js';
import { $, esc, icon, imageFallbacks } from '../core/ui.js';
import { loadServices } from '../core/catalog.js';
import { observeReveals } from '../site.js';

const paragraphs = (t) => String(t || '').split(/\n{2,}/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');

loadServices().then((list) => {
  $('[data-jump-links]').innerHTML = list.map((s) => `<a href="#${esc(s.slug)}">${esc(s.name)}</a>`).join('');
  $('[data-service-rows]').innerHTML = list.map((s) => `
    <article class="svc-row reveal" id="${esc(s.slug)}">
      <div class="media svc-row-media"><img src="${esc(s.imageUrl || '')}" alt="${esc(s.imageAlt || '')}" loading="lazy" width="1200" height="900"></div>
      <div>
        <span class="icon-badge">${icon(s.icon || 'box')}</span>
        <h2>${esc(s.name)}</h2>
        <p class="lead">${esc(s.summary)}</p>
        <div class="desc">${paragraphs(s.description)}</div>
        ${s.highlights?.length ? `<ul class="checklist">${s.highlights.map((h) => `<li>${icon('check')}${esc(h)}</li>`).join('')}</ul>` : ''}
        <div style="display:flex;gap:.75rem;flex-wrap:wrap">
          <a class="btn btn-primary" href="/quote">Get a Free Moving Quote</a>
          <a class="btn btn-outline" href="/pricing#estimate">Instant estimate</a>
        </div>
      </div>
    </article>`).join('');
  imageFallbacks($('[data-service-rows]'));
  observeReveals();
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
});
