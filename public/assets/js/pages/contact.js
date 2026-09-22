import '../site.js';
import { $, handleForm } from '../core/ui.js';
import { post, currentCustomer } from '../core/api.js';

const form = $('#contact-form');
currentCustomer().then((u) => {
  if (!u) return;
  form.name.value ||= u.fullName;
  form.email.value ||= u.email;
  form.phone.value ||= u.phone || '';
});

handleForm(form, (data) => post('/public/contact', data), {
  onSuccess: (res) => {
    form.innerHTML = `<div class="success-panel"><div class="check-mark"><svg class="i"><use href="#i-check"></use></svg></div>
      <h2>Message sent</h2><p class="lead">${res.message || 'Thanks — our team will reply by email.'}</p>
      <a class="btn btn-outline" href="/">Back to home</a></div>`;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },
});
