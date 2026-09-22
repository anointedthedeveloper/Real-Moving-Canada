/** Admin UI helpers shared by all sections. */
import { $, $$, esc, icon } from '../core/ui.js';

export const view = () => $('[data-view]');
export const setTitle = (t) => { $('[data-page-title]').textContent = t; document.title = `${t} — Admin — RealMovingCanada`; };

// ─── Drawer for record details ────────────────────────────────────────────
const drawer = () => $('[data-drawer]');
let onDrawerClose = null;
export function openDrawer(title, html, { onClose } = {}) {
  $('[data-drawer-title]').textContent = title;
  $('[data-drawer-body]').innerHTML = html;
  drawer().classList.add('open');
  drawer().setAttribute('aria-hidden', 'false');
  $('[data-drawer-scrim]').classList.add('open');
  onDrawerClose = onClose || null;
  setTimeout(() => $('[data-drawer-close]').focus(), 50);
  return $('[data-drawer-body]');
}
export function setDrawer(html) { $('[data-drawer-body]').innerHTML = html; return $('[data-drawer-body]'); }
export function closeDrawer() {
  if (!drawer().classList.contains('open')) return;
  drawer().classList.remove('open');
  drawer().setAttribute('aria-hidden', 'true');
  $('[data-drawer-scrim]').classList.remove('open');
  const cb = onDrawerClose; onDrawerClose = null; cb?.();
}
export const drawerBody = () => $('[data-drawer-body]');

// ─── Building blocks ──────────────────────────────────────────────────────
export const box = (heading, body, extra = '') => `<section class="box"><div class="box-head"><h3>${heading}</h3>${extra}</div><div class="box-body">${body}</div></section>`;
export const loading = '<div class="loading"><div class="spinner"></div></div>';
export const emptyRow = (cols, text) => `<tr><td colspan="${cols}"><div class="empty" style="padding:2rem 1rem">${icon('search')}<p style="margin:0">${esc(text)}</p></div></td></tr>`;

/** Filter bar state lives in the URL hash query so views are shareable and survive refresh. */
export function hashQuery() {
  const q = location.hash.split('?')[1] || '';
  return Object.fromEntries(new URLSearchParams(q));
}
export function setHashQuery(base, params) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== undefined));
  const qs = new URLSearchParams(clean).toString();
  const next = `#/${base}${qs ? `?${qs}` : ''}`;
  if (location.hash !== next) history.replaceState(null, '', next);
}
export const toQuery = (obj) => { const qs = new URLSearchParams(Object.entries(obj).filter(([, v]) => v !== '' && v != null)).toString(); return qs ? `?${qs}` : ''; };

export function bindRows(root, onOpen) {
  $$('tr[data-id]', root).forEach((tr) => {
    tr.tabIndex = 0;
    tr.classList.add('clickable');
    tr.addEventListener('click', (e) => { if (!e.target.closest('button, a, input, select')) onOpen(tr.dataset.id); });
    tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') onOpen(tr.dataset.id); });
  });
}

export const selectOpts = (entries, selected, placeholder) =>
  (placeholder !== undefined ? `<option value="">${esc(placeholder)}</option>` : '') +
  entries.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(selected ?? '') ? ' selected' : ''}>${esc(l)}</option>`).join('');

export const notesBlock = (notes) => `<ul class="notes-list">${notes.length ? notes.map((n) => `<li>${esc(n.body).replace(/\n/g, '<br>')}<div class="meta">${esc(n.authorName || 'Admin')} · ${new Date(n.createdAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })}</div></li>`).join('') : '<li class="muted" style="background:transparent;border:0;padding:0">No internal notes yet.</li>'}</ul>
  <form data-note-form style="margin-top:1rem" novalidate><div class="form-alert" role="alert"></div><div class="field"><label for="note-body" class="sr-only">Add a note</label><textarea id="note-body" name="body" rows="2" placeholder="Add an internal note (not visible to the customer)" required maxlength="2000"></textarea></div>
  <button class="btn btn-outline btn-sm" type="submit" style="margin-top:.6rem">${icon('plus')} Add note</button></form>`;

export const adminTimeline = (events) => (events.length ? `<ul class="timeline">${events.map((e) => `<li><div class="t-title">${esc(e.message || e.toStatus)}</div>
  <div class="t-meta">${e.fromStatus ? `${esc(e.fromStatus)} → ` : ''}${esc(e.toStatus)} · ${esc(e.actorName || e.actorRole)} · ${new Date(e.createdAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })}</div></li>`).join('')}</ul>` : '<p class="muted">No history.</p>');
