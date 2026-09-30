/** Reference lists for forms, carried over from the original site's FALLBACK_OPTIONS. */

export const PROVINCES = [
  { code: 'BC', name: 'British Columbia', region: 'West Coast' },
  { code: 'AB', name: 'Alberta', region: 'Prairies' },
  { code: 'SK', name: 'Saskatchewan', region: 'Prairies' },
  { code: 'MB', name: 'Manitoba', region: 'Prairies' },
  { code: 'ON', name: 'Ontario', region: 'Central Canada' },
  { code: 'QC', name: 'Quebec', region: 'Central Canada' },
  { code: 'NB', name: 'New Brunswick', region: 'Atlantic Canada' },
  { code: 'NS', name: 'Nova Scotia', region: 'Atlantic Canada' },
  { code: 'PE', name: 'Prince Edward Island', region: 'Atlantic Canada' },
  { code: 'NL', name: 'Newfoundland and Labrador', region: 'Atlantic Canada' },
  { code: 'YT', name: 'Yukon', region: 'Northern Canada' },
  { code: 'NT', name: 'Northwest Territories', region: 'Northern Canada' },
  { code: 'NU', name: 'Nunavut', region: 'Northern Canada' },
];
export const REGION_ORDER = ['West Coast', 'Prairies', 'Central Canada', 'Atlantic Canada', 'Northern Canada'];
export const INTERNATIONAL = 'INTL';

export const PROVINCE_OPTIONS = [
  ...PROVINCES.map((p) => ({ value: p.code, label: p.name })),
  { value: INTERNATIONAL, label: 'Outside Canada' },
];

export const MOVE_TYPES = [
  { value: 'local', label: 'Local' },
  { value: 'long_distance', label: 'Long-distance' },
  { value: 'international', label: 'International' },
];

/** Move categories used by the instant estimate (matches the estimate API contract). */
export const ESTIMATE_MOVE_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'local', label: 'Local' },
  { value: 'long_distance', label: 'Long-distance' },
  { value: 'international', label: 'International' },
];

export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'office', label: 'Office' },
  { value: 'commercial', label: 'Commercial space' },
  { value: 'storage_unit', label: 'Storage unit' },
  { value: 'other', label: 'Other' },
];

export const PROPERTY_SIZES = [
  { value: 'studio', label: 'Studio' },
  { value: 'one_bed', label: '1 bedroom' },
  { value: 'two_bed', label: '2 bedrooms' },
  { value: 'three_bed', label: '3 bedrooms' },
  { value: 'four_bed', label: '4 bedrooms' },
  { value: 'five_plus', label: '5+ bedrooms' },
  { value: 'office', label: 'Office / commercial' },
];

export const ESTIMATE_SERVICES = [
  { value: 'packing', label: 'Packing' },
  { value: 'unpacking', label: 'Unpacking' },
  { value: 'storage', label: 'Storage' },
  { value: 'furniture_delivery', label: 'Furniture delivery' },
  { value: 'loading', label: 'Loading' },
  { value: 'unloading', label: 'Unloading' },
];

export const TIME_WINDOWS = [
  { value: 'morning', label: 'Morning (8 am – 12 pm)' },
  { value: 'afternoon', label: 'Afternoon (12 pm – 4 pm)' },
  { value: 'evening', label: 'Evening (4 pm – 8 pm)' },
  { value: 'flexible', label: 'Flexible' },
];

export const CONTACT_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone call' },
  { value: 'text', label: 'Text message' },
];

export const CONTACT_TOPICS = [
  { value: 'quote', label: 'A quote or estimate' },
  { value: 'booking', label: 'An existing booking' },
  { value: 'services', label: 'Our services' },
  { value: 'other', label: 'Something else' },
];

export const labelFor = (list, value) => list.find((o) => o.value === value)?.label || value || '—';
