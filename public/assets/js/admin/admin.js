/** Admin dashboard shell: session check, navigation, hash router, badge counts. */
import { $, $$, esc, icon, initials, toast } from '../core/ui.js';
import { get, post, ApiError } from '../core/api.js';
import { setTitle, view, closeDrawer, loading } from './shared.js';
import * as ops from './sections/operations.js';
import * as content from './sections/content.js';
import * as config from './sections/config.js';

const ROUTES = {
  overview: ['Overview', ops.overview],
  quotes: ['Quotes', ops.quotes],
  bookings: ['Bookings', ops.bookings],
  customers: ['Customers', ops.customers],
  messages: ['Messages', ops.messages],
  notifications: ['Notifications', ops.notifications],
  reviews: ['Reviews', content.reviews],
  services: ['Services', content.services],
  areas: ['Service areas', content.areas],
  pricing: ['Pricing', config.pricing],
  settings: ['Settings', config.settings],
};

// Sidebar (mobile)
const sidebar = $('#sidebar');
let scrim;
function setSidebar(open) {
  sidebar.classList.toggle('open', open);
  if (open) { scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.onclick = () => setSidebar(false); document.body.append(scrim); }
  else scrim?.remove();
}
$('.menu-btn').addEventListener('click', () => setSidebar(!sidebar.classList.contains('open')));

// Drawer close
$('[data-drawer-close]').addEventListener('click', closeDrawer);
$('[data-drawer-scrim]').addEventListener('click', closeDrawer);
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) closeDrawer(); });

$('[data-logout]').addEventListener('click', async (e) => {
  e.preventDefault();
  await post('/admin/auth/logout').catch(() => {});
  location.assign('/admin/login');
});

export async function refreshCounts() {
  try {
    const { stats } = await get('/admin/overview');
    $$('[data-count]').forEach((el) => { const n = stats[el.dataset.count] || 0; el.hidden = !n; el.textContent = n; });
    const dot = $('[data-unread-dot]');
    dot.hidden = !stats.unreadNotifications;
    dot.textContent = stats.unreadNotifications > 9 ? '9+' : stats.unreadNotifications;
    return stats;
  } catch (err) {
    if (err.status === 401) location.assign('/admin/login');
    return null;
  }
}
window.addEventListener('admin:changed', refreshCounts);

let lastKey = null;
async function route() {
  const [path] = location.hash.replace(/^#\/?/, '').split('?');
  const [name = 'overview', id] = path.split('/');
  const key = ROUTES[name] ? name : 'overview';
  const [label, render] = ROUTES[key];
  $$('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === key));
  setSidebar(false);
  // Opening a record within the same section keeps the list and just opens the drawer.
  if (key === lastKey && id && render.open) { render.open(id); return; }
  closeDrawer();
  lastKey = key;
  setTitle(label);
  view().innerHTML = loading;
  try {
    await render(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) { location.assign('/admin/login'); return; }
    view().innerHTML = `<div class="box empty">${icon('alert')}<h3>Couldn’t load this page</h3><p>${esc(err.message)}</p></div>`;
  }
}
addEventListener('hashchange', route);

(async () => {
  try {
    const { user } = await get('/admin/auth/me');
    $('[data-user-name]').textContent = user.fullName;
    $('[data-user-email]').textContent = user.email;
    $('[data-user-initials]').textContent = initials(user.fullName);
  } catch {
    location.replace('/admin/login');
    return;
  }
  route();
  refreshCounts();
  setInterval(refreshCounts, 60000);
})();

window.addEventListener('unhandledrejection', (e) => { if (e.reason?.message) toast(e.reason.message, 'error'); });
