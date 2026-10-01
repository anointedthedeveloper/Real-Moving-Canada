import { INTERNATIONAL, PROVINCES } from '../constants/options.js';

const moneyFmt = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
export const money = (n) => (n == null || n === '' ? '—' : moneyFmt.format(Number(n)));

const toDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T12:00:00`) : new Date(v));
export const fmtDate = (v, opts = {}) =>
  (v ? toDate(v).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', ...opts }) : '—');

export const todayIso = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const initials = (name) =>
  String(name || '?').trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export const firstName = (name) => String(name || '').trim().split(/\s+/)[0];

const provinceName = (code) => PROVINCES.find((p) => p.code === code)?.code || code;

/** "Saskatoon, SK" — or "123 Main St, Saskatoon, SK S7V 1R9" with `withAddress`. */
export function formatPlace(loc, { withAddress = false } = {}) {
  if (!loc || !loc.city) return '—';
  const region = loc.province === INTERNATIONAL ? loc.country || 'Outside Canada' : provinceName(loc.province);
  const base = [loc.city, region].filter(Boolean).join(', ');
  if (!withAddress) return base;
  return [loc.address, `${base}${loc.postalCode ? ` ${loc.postalCode}` : ''}`].filter(Boolean).join(', ');
}

/** Normalises a Canadian postal code to "A1A 1A1" when it looks like one. */
export function formatPostal(value) {
  const v = String(value || '').replace(/[\s-]/g, '').toUpperCase();
  return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(v) ? `${v.slice(0, 3)} ${v.slice(3)}` : value;
}
