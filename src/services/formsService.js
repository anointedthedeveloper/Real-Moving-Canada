import { submitToFormspree } from './formspree.js';
import { labelFor, MOVE_TYPES, PROPERTY_TYPES, CONTACT_METHODS, CONTACT_TOPICS } from '../constants/options.js';
import { SERVICES } from '../constants/services.js';
import { formatPlace, fmtDate } from '../utils/format.js';

/** Quote / booking request from the five-step quote flow. */
export function submitQuoteRequest(q) {
  const name = `${q.firstName} ${q.lastName}`.trim();
  const services = q.services.map((v) => SERVICES.find((s) => s.quoteValue === v)?.name || v);
  return submitToFormspree({
    'Name': name,
    'Email': q.email,
    'Phone': q.phone,
    'Preferred contact method': labelFor(CONTACT_METHODS, q.contactMethod),
    'Wants an account': q.createAccount ? 'Yes' : 'No',
    'Moving from': formatPlace(q.origin, { withAddress: true }),
    'Moving to': formatPlace(q.destination, { withAddress: true }),
    'Preferred moving date': fmtDate(q.moveDate),
    'Move type': labelFor(MOVE_TYPES, q.moveType),
    'Origin property type': labelFor(PROPERTY_TYPES, q.origin.propertyType),
    'Destination property type': labelFor(PROPERTY_TYPES, q.destination.propertyType),
    'Rooms at origin': q.origin.rooms || '—',
    'Rooms at destination': q.destination.rooms || '—',
    'Services requested': services.join(', ') || '—',
    'Heavy / oversized items': q.heavyItems || '—',
    'Storage details': q.storageDetails || '—',
    'Move notes': q.notes || '—',
    _replyto: q.email,
    _gotcha: q._gotcha,
  }, { subject: `New moving quote request — ${name}` });
}

export function submitContactMessage(m) {
  const name = `${m.firstName} ${m.lastName}`.trim();
  return submitToFormspree({
    'Name': name,
    'Email': m.email,
    'Phone': m.phone || '—',
    'Topic': labelFor(CONTACT_TOPICS, m.topic),
    'Message': m.message,
    _replyto: m.email,
    _gotcha: m._gotcha,
  }, { subject: `New contact message — ${labelFor(CONTACT_TOPICS, m.topic)}` });
}

export function submitReview(r) {
  return submitToFormspree({
    'Name': r.name,
    'Email': r.email,
    'Rating': `${r.rating} / 5`,
    'Title': r.title || '—',
    'Review': r.body,
    _replyto: r.email,
    _gotcha: r._gotcha,
  }, { subject: `New customer review — ${r.name}` });
}
