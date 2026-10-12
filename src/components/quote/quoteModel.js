import { INTERNATIONAL } from '../../constants/options.js';
import { SERVICES } from '../../constants/services.js';
import { required, email, phone, notBefore, checked } from '../../utils/validation.js';
import { todayIso } from '../../utils/format.js';

export const QUOTE_STEPS = ['Customer Details', 'Move Details', 'Services / Items', 'Review', 'Confirmation'];

const emptyPlace = { address: '', city: '', province: '', country: '', postalCode: '', propertyType: '', rooms: '' };

export const EMPTY_QUOTE = {
  firstName: '', lastName: '', email: '', phone: '', contactMethod: '', createAccount: false,
  origin: { ...emptyPlace },
  destination: { ...emptyPlace },
  moveDate: '', moveType: '',
  services: [], heavyItems: '', storageDetails: '', notes: '',
  confirm: false, _gotcha: '',
};

const hasService = (v, value) => v.services.includes(value);

/** Validation rules for every field; each step validates only its own paths. */
export function quoteSchema(v) {
  const place = (p) => ({
    [`${p}.city`]: required('Enter a city.'),
    [`${p}.province`]: required('Choose a province or territory.'),
    ...(v[p].province === INTERNATIONAL ? { [`${p}.country`]: required('Enter a country.') } : {}),
    [`${p}.propertyType`]: required('Choose a property type.'),
  });
  return {
    firstName: required('Enter your first name.'),
    lastName: required('Enter your last name.'),
    email: [required('Enter your email address.'), email()],
    phone: [required('Enter a phone number so we can confirm details.'), phone()],
    contactMethod: required('Choose how we should contact you.'),
    ...place('origin'),
    ...place('destination'),
    'origin.rooms': required('Choose the size of the home or space you’re moving from.'),
    moveDate: [required('Choose your preferred moving date.'), notBefore(todayIso())],
    moveType: required('Choose local or long-distance.'),
    ...(hasService(v, 'heavy_oversized') ? { heavyItems: required('List the heavy or oversized items.') } : {}),
    ...(hasService(v, 'storage') ? { storageDetails: required('Describe what you need to store and for how long.') } : {}),
    confirm: checked('Please confirm your details are ready to submit.'),
  };
}

export const STEP_FIELDS = [
  ['firstName', 'lastName', 'email', 'phone', 'contactMethod'],
  ['origin.city', 'origin.province', 'origin.country', 'origin.propertyType', 'origin.rooms',
    'destination.city', 'destination.province', 'destination.country', 'destination.propertyType', 'moveDate', 'moveType'],
  ['heavyItems', 'storageDetails'],
  ['confirm'],
];

/** Services offered in the quote form (the design's catalogue, in two columns). */
export const QUOTE_SERVICES = SERVICES.map((s) => ({ value: s.quoteValue, label: s.name }));

/** Maps the moving calculator's hand-off (see MovingCalculator) onto quote values. */
export function fromEstimateDraft(draft) {
  const d = draft?.quote;
  if (!d) return {};
  return {
    origin: { ...emptyPlace, province: d.origin?.province || '', city: d.origin?.city || '', rooms: d.propertySize || '' },
    destination: { ...emptyPlace, province: d.destination?.province || '', city: d.destination?.city || '' },
    moveDate: d.moveDate || '',
    moveType: ['local', 'long_distance'].includes(d.moveType) ? d.moveType : '',
    services: (d.services || []).filter((v) => QUOTE_SERVICES.some((s) => s.value === v)),
    notes: d.details || '',
  };
}
