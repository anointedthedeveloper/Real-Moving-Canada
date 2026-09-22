import { $, $$, esc, icon, fmtDate, fmtDateTime, badge, stars, toast, confirmDialog, handleForm, debounce, pager } from '../../core/ui.js';
import { get, post, patch, del } from '../../core/api.js';
import { PROVINCES, REGION_ORDER, SERVICE_ICONS } from '../../core/data.js';
import { view, openDrawer, setDrawer, box, loading, emptyRow, hashQuery, setHashQuery, toQuery, bindRows, selectOpts } from '../shared.js';

const changed = () => window.dispatchEvent(new Event('admin:changed'));

// ═══ Reviews ══════════════════════════════════════════════════════════════
export async function reviews(id) {
  view().innerHTML = `<section class="box"><form class="filters" data-filters role="search">
      <select name="status" aria-label="Status">${selectOpts([['pending', 'Pending approval'], ['approved', 'Published'], ['rejected', 'Not published']], 'pending')}</select>
      <div class="field search">${icon('search')}<label class="sr-only" for="rv-q">Search</label><input id="rv-q" name="q" type="search" placeholder="Search reviewer or text"></div>
    </form><div class="table-wrap"><table class="table responsive"><thead><tr><th>Customer</th><th>Rating</th><th>Review</th><th>Submitted</th><th>Status</th></tr></thead>
    <tbody data-rows><tr><td colspan="5">${loading}</td></tr></tbody></table></div><div data-pager></div></section>`;
  const form = $('[data-filters]', view());
  const q = hashQuery();
  for (const el of form.elements) if (el.name && q[el.name] != null) el.value = q[el.name];
  let page = Number(q.page) || 1;
  const run = async () => {
    const params = Object.fromEntries(new FormData(form));
    setHashQuery('reviews', { ...params, page: page > 1 ? page : '' });
    const d = await get(`/admin/reviews${toQuery({ ...params, page })}`);
    $('[data-rows]', view()).innerHTML = d.reviews.length ? d.reviews.map((r) => `<tr data-id="${r.id}">
      <td><strong>${esc(r.customerName)}</strong><span class="sub">${esc(r.displayName)} (shown)</span></td>
      <td data-hide-sm>${stars(r.rating)}</td>
      <td>${r.title ? `<strong>${esc(r.title)}</strong><br>` : ''}<span class="sub">${esc(r.body.slice(0, 90))}${r.body.length > 90 ? '…' : ''}</span></td>
      <td data-hide-sm>${fmtDate(r.createdAt)}</td><td>${badge(r.status, r.statusLabel)}</td></tr>`).join('') : emptyRow(5, 'No reviews here.');
    $('[data-pager]', view()).innerHTML = pager(d.pagination, (p) => { page = p; run(); });
    bindRows(view(), (rid) => { location.hash = `#/reviews/${rid}`; });
  };
  reviews.refresh = run;
  form.addEventListener('input', debounce(() => { page = 1; run(); }, 300));
  form.addEventListener('change', () => { page = 1; run(); });
  form.addEventListener('submit', (e) => e.preventDefault());
  await run();
  if (id) openReview(id);
}
reviews.open = (id) => openReview(id);

async function openReview(id) {
  openDrawer('Review', loading, { onClose: () => history.replaceState(null, '', '#/reviews') });
  renderReview(await get(`/admin/reviews/${id}`));
}
function renderReview(d) {
  const r = d.review;
  const body = setDrawer(`
    <div class="page-title" style="margin-bottom:1rem"><div>${stars(r.rating)}<h2 style="margin-top:.4rem">${r.title ? esc(r.title) : 'Review'}</h2><p>Submitted ${fmtDateTime(r.createdAt)}</p></div>${badge(r.status, r.statusLabel)}</div>
    ${box('Customer', `<dl class="dl"><dt>Name</dt><dd><a class="link" href="#/customers/${r.customerId}">${esc(r.customerName)}</a></dd><dt>Email</dt><dd>${esc(r.customerEmail)}</dd>${r.bookingReference ? `<dt>Move</dt><dd><a class="link" href="#/bookings/${r.bookingId}">${esc(r.bookingReference)}</a></dd>` : ''}</dl>`)}
    ${box('Review text', `<p style="margin:0;white-space:pre-wrap">${esc(r.body)}</p>`)}
    ${box('Display name on website', `<form data-name-form novalidate><div class="form-alert" role="alert"></div><div class="field"><label for="rv-dn" class="sr-only">Display name</label><input id="rv-dn" name="displayName" value="${esc(r.displayName)}" maxlength="100"></div><button class="btn btn-outline btn-sm" type="submit" style="margin-top:.6rem">Save name</button></form><p class="hint" style="margin-top:.6rem">Default format follows Settings → Reviews (e.g. “First name + last initial”).</p>`)}
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin:1.2rem 0">
      ${r.status !== 'approved' ? `<button class="btn btn-primary" data-set="approved">${icon('check')} Approve &amp; publish</button>` : ''}
      ${r.status !== 'rejected' ? `<button class="btn btn-outline" data-set="rejected">Reject</button>` : ''}
      ${r.status !== 'pending' ? `<button class="btn btn-outline" data-set="pending">Move to pending</button>` : ''}
      <button class="btn btn-danger" data-delete>${icon('trash')} Delete</button></div>`);
  $$('[data-set]', body).forEach((b) => b.addEventListener('click', async () => { await patch(`/admin/reviews/${r.id}`, { status: b.dataset.set }); toast('Review updated.'); openReview(r.id); reviews.refresh?.(); changed(); }));
  $('[data-delete]', body).addEventListener('click', async () => {
    if (!(await confirmDialog('Delete this review permanently?', { confirmLabel: 'Delete', danger: true }))) return;
    await del(`/admin/reviews/${r.id}`); toast('Review deleted.'); location.hash = '#/reviews'; reviews.refresh?.(); changed();
  });
  handleForm($('[data-name-form]', body), (data) => patch(`/admin/reviews/${r.id}`, data), { onSuccess: () => toast('Display name saved.') });
}

// ═══ Services ═════════════════════════════════════════════════════════════
export async function services() {
  const d = await get('/admin/services');
  view().innerHTML = `<div class="page-title"><div><h2>Services</h2><p>Shown on the homepage and Services page, in this order.</p></div><button class="btn btn-primary" data-new>${icon('plus')} Add service</button></div>
    <section class="box"><div class="table-wrap"><table class="table responsive"><thead><tr><th></th><th>Service</th><th>Slug</th><th>Featured</th><th>Status</th><th></th></tr></thead>
    <tbody data-rows>${d.services.length ? d.services.map((s, i) => `<tr data-id="${s.id}">
      <td class="num" data-hide-sm>${icon(s.icon || 'box')}</td>
      <td><strong>${esc(s.name)}</strong><span class="sub">${esc(s.summary)}</span></td><td data-hide-sm><span class="ref">${esc(s.slug)}</span></td>
      <td data-hide-sm>${s.isFeatured ? badge('active', 'Featured') : ''}</td><td>${s.isActive ? badge('active', 'Visible') : badge('disabled', 'Hidden')}</td>
      <td class="num row-actions">
        <button class="icon-btn" data-up="${i}" title="Move up" ${i === 0 ? 'disabled' : ''}>${icon('chevron-down', 'i')}</button>
        <button class="icon-btn" data-edit title="Edit">${icon('edit')}</button>
        <button class="icon-btn" data-del title="Delete">${icon('trash')}</button></td></tr>`).join('') : emptyRow(6, 'No services yet.')}</tbody></table></div></section>`;
  $$('[data-up]', view()).forEach((btn) => { btn.querySelector('svg').style.transform = 'rotate(180deg)'; });
  $('[data-new]', view()).addEventListener('click', () => serviceForm());
  $$('tr[data-id]', view()).forEach((tr) => {
    const svc = d.services.find((s) => String(s.id) === tr.dataset.id);
    $('[data-edit]', tr).addEventListener('click', () => serviceForm(svc));
    $('[data-del]', tr).addEventListener('click', async () => {
      if (!(await confirmDialog(`Delete “${svc.name}”? This removes it from the website.`, { confirmLabel: 'Delete', danger: true }))) return;
      await del(`/admin/services/${svc.id}`); toast('Service deleted.'); services();
    });
    const up = $('[data-up]', tr);
    if (up && !up.disabled) up.addEventListener('click', async () => { await post(`/admin/services/${svc.id}/reorder`, { direction: 'up' }); services(); });
  });
}

function serviceForm(svc) {
  const isNew = !svc;
  const dlg = document.createElement('dialog');
  dlg.className = 'modal wide';
  dlg.innerHTML = `<form novalidate><div class="modal-head"><h2>${isNew ? 'Add service' : 'Edit service'}</h2><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <div class="modal-body"><div class="form-alert" role="alert"></div>
      <div class="form-grid">
        <div class="field"><label for="sv-name">Name</label><input id="sv-name" name="name" required maxlength="100" value="${esc(svc?.name || '')}"></div>
        <div class="field"><label for="sv-icon">Icon</label><select id="sv-icon" name="icon">${selectOpts(SERVICE_ICONS.map((i) => [i, i]), svc?.icon || 'box')}</select></div>
        <div class="field span-all"><label for="sv-summary">Short summary</label><input id="sv-summary" name="summary" required maxlength="200" value="${esc(svc?.summary || '')}"></div>
        <div class="field span-all"><label for="sv-desc">Description <span class="opt">(optional, longer text for the service page)</span></label><textarea id="sv-desc" name="description" rows="4" maxlength="3000">${esc(svc?.description || '')}</textarea></div>
        <div class="field span-all"><label for="sv-high">Highlights <span class="opt">(one per line, 2–6 recommended)</span></label><textarea id="sv-high" name="highlightsText" rows="4" maxlength="1000">${esc((svc?.highlights || []).join('\n'))}</textarea></div>
        <div class="field span-all"><label for="sv-img">Image URL <span class="opt">(optional — a default is used otherwise)</span></label><input id="sv-img" name="imageUrl" type="url" maxlength="500" value="${esc(svc?.imageUrl || '')}"></div>
        <div class="field span-all"><label for="sv-alt">Image alt text</label><input id="sv-alt" name="imageAlt" maxlength="200" value="${esc(svc?.imageAlt || '')}"></div>
        <label class="check"><input type="checkbox" name="isFeatured" data-bool ${svc?.isFeatured ? 'checked' : ''}> Feature on homepage</label>
        <label class="check"><input type="checkbox" name="isActive" data-bool ${svc?.isActive !== false ? 'checked' : ''}> Visible on website</label>
      </div></div>
    <div class="modal-foot"><button type="button" class="btn btn-outline" data-close>Cancel</button><button class="btn btn-dark" type="submit">${isNew ? 'Add service' : 'Save changes'}</button></div></form>`;
  document.body.append(dlg);
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  dlg.addEventListener('close', () => dlg.remove());
  dlg.showModal();
  handleForm($('form', dlg), (data) => {
    data.highlights = (data.highlightsText || '').split('\n').map((s) => s.trim()).filter(Boolean);
    delete data.highlightsText;
    return isNew ? post('/admin/services', data) : patch(`/admin/services/${svc.id}`, data);
  }, { onSuccess: () => { dlg.close(); toast(isNew ? 'Service added.' : 'Service saved.'); services(); } });
}

// ═══ Service areas ════════════════════════════════════════════════════════
export async function areas() {
  const d = await get('/admin/service-areas');
  const byCode = Object.fromEntries(d.areas.map((a) => [a.code, a]));
  view().innerHTML = `<div class="page-title"><div><h2>Service areas</h2><p>Turn provinces and territories on or off, and list the communities you serve in each.</p></div></div>
    <div class="grid-2" data-regions></div>`;
  const host = $('[data-regions]', view());
  host.innerHTML = REGION_ORDER.map((region) => `<section class="box"><div class="box-head"><h3>${esc(region)}</h3></div><div class="box-body" style="display:grid;gap:1rem">
    ${PROVINCES.filter((p) => p.region === region).map((p) => {
      const a = byCode[p.code] || { isActive: false, cities: [], note: '' };
      return `<div data-province="${p.code}">
        <label class="check" style="justify-content:space-between;width:100%"><span><strong>${esc(p.name)}</strong> <span class="tiny muted">(${p.code})</span></span><input type="checkbox" data-active data-bool ${a.isActive ? 'checked' : ''}></label>
        <div class="field" style="margin-top:.5rem"><label class="sr-only" for="note-${p.code}">Note</label><input id="note-${p.code}" data-note placeholder="Short note shown on the service areas page (optional)" value="${esc(a.note || '')}" maxlength="200"></div>
        <div class="inline-list" data-cities style="margin-top:.5rem">${(a.cities || []).map((c) => `<span class="pill" data-city="${esc(c.name)}">${esc(c.name)}<button type="button" data-rm aria-label="Remove ${esc(c.name)}">${icon('x', 'i')}</button></span>`).join('')}</div>
        <div class="field" style="margin-top:.5rem"><label class="sr-only" for="add-${p.code}">Add a city</label><input id="add-${p.code}" data-add-city placeholder="Add a community, press Enter" maxlength="80"></div>
      </div>`;
    }).join('<hr class="divider" style="margin:1rem 0">')}
  </div></section>`).join('');

  host.querySelectorAll('[data-province]').forEach((row) => {
    const code = row.dataset.province;
    row.querySelector('[data-add-city]').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const val = e.target.value.trim();
      if (!val) return;
      const list = row.querySelector('[data-cities]');
      const span = document.createElement('span');
      span.className = 'pill'; span.dataset.city = val;
      span.innerHTML = `${esc(val)}<button type="button" data-rm aria-label="Remove ${esc(val)}">${icon('x', 'i')}</button>`;
      span.querySelector('[data-rm]').addEventListener('click', () => span.remove());
      list.append(span);
      e.target.value = '';
    });
    row.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => b.closest('[data-city]').remove()));
  });

  const bar = document.createElement('div');
  bar.className = 'save-bar';
  bar.innerHTML = `<span class="msg"></span><button class="btn btn-dark" type="button" data-save-areas">Save service areas</button>`;
  view().append(bar);
  $('[data-save-areas]', bar).addEventListener('click', async () => {
    const btn = $('[data-save-areas]', bar);
    btn.setAttribute('aria-busy', 'true');
    try {
      const payload = PROVINCES.map((p) => {
        const row = host.querySelector(`[data-province="${p.code}"]`);
        return { code: p.code, isActive: row.querySelector('[data-active]').checked, note: row.querySelector('[data-note]').value.trim(), cities: [...row.querySelectorAll('[data-city]')].map((s) => s.dataset.city) };
      });
      await patch('/admin/service-areas', { areas: payload });
      bar.querySelector('.msg').textContent = 'Saved.';
      toast('Service areas saved.');
    } catch (err) { toast(err.message, 'error'); } finally { btn.removeAttribute('aria-busy'); }
  });
}
