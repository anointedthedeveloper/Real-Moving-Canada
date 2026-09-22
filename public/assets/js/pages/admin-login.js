import { $, handleForm, enhancePasswords } from '../core/ui.js';
import { get, post } from '../core/api.js';

enhancePasswords();
get('/admin/auth/me').then(() => location.replace('/admin')).catch(() => {});
handleForm($('#admin-login'), (d) => post('/admin/auth/login', d), { onSuccess: () => location.assign('/admin') });
