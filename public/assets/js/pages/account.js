import '../site.js';
import { $, $$, handleForm, enhancePasswords, esc } from '../core/ui.js';
import { post, currentCustomer } from '../core/api.js';

const params = new URLSearchParams(location.search);
const rawNext = params.get('next') || '/dashboard';
// Only allow same-site relative redirects.
const next = /^\/(?!\/)[\w\-/.#%?=&]*$/.test(rawNext) ? decodeURIComponent(rawNext) : '/dashboard';

const views = $$('[data-view]');
function show(name) {
  views.forEach((v) => { v.hidden = v.dataset.view !== name; });
  $(`[data-view="${name}"] input:not([type=hidden])`)?.focus();
}
$$('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); show(a.dataset.go); }));

// Tabs
const tabs = $$('[role=tab]');
function selectTab(id) {
  tabs.forEach((t) => {
    const on = t.id === id;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  const reg = id === 'tab-register';
  $('[data-title]').textContent = reg ? 'Create your account' : 'Welcome back';
  $('[data-subtitle]').textContent = reg ? 'Request quotes and bookings, and follow every update in one place.' : 'Sign in to manage your quotes, booking requests and updates.';
}
tabs.forEach((t) => {
  t.addEventListener('click', () => selectTab(t.id));
  t.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const other = tabs.find((x) => x !== t); other.focus(); selectTab(other.id); }
  });
});
enhancePasswords();

const token = params.get('token');
if (token) { show('reset'); $('#reset-form').token.value = token; }
else if (params.get('view') === 'forgot') show('forgot');
else {
  if (params.get('tab') === 'register') selectTab('tab-register');
  currentCustomer().then((u) => { if (u) location.replace(next); });
}

const go = () => location.assign(next);
handleForm($('#panel-login'), (d) => post('/auth/login', d), { onSuccess: go });
handleForm($('#panel-register'), (d) => post('/auth/register', d), { onSuccess: go });
handleForm($('#forgot-form'), (d) => post('/auth/forgot-password', d), {
  onSuccess: (res, form) => { const a = $('.form-alert', form); a.classList.add('ok'); a.textContent = res.message; form.email.value = ''; },
});
handleForm($('#reset-form'), (d) => post('/auth/reset-password', d), {
  onSuccess: (res, form) => {
    history.replaceState(null, '', '/account');
    form.innerHTML = `<div class="form-alert ok">${esc(res.message)}</div><a class="btn btn-primary btn-lg btn-block" href="${res.role === 'admin' ? '/admin/login' : '/account'}">Sign in</a>`;
  },
});
