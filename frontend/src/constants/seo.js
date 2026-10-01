import { COMPANY } from './company.js';

/**
 * Search and social metadata. SITE_URL is the public address used for canonical
 * links, the sitemap and social previews — set VITE_SITE_URL when the site moves
 * to its own domain (e.g. https://realmovingcanada.ca).
 */
export const SITE_URL = (import.meta.env?.VITE_SITE_URL || 'https://real-moving-canada-ddne.vercel.app').replace(/\/+$/, '');
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/** Search phrases people use when looking for movers in Canada, used across the site. */
export const BASE_KEYWORDS = [
  'Real Moving Canada', 'movers Canada', 'moving company Canada', 'moving in Canada', 'Canada movers',
  'Canadian moving company', 'movers near me', 'moving services Canada', 'professional movers',
  'Saskatoon movers', 'moving company Saskatoon', 'Saskatchewan movers', 'movers Saskatchewan',
  'local movers', 'long distance movers Canada', 'cross-country movers Canada', 'interprovincial movers',
  'moving across Canada', 'residential movers', 'commercial movers', 'office movers',
  'packing services', 'moving and storage', 'junk removal', 'moving quote', 'free moving estimate',
];

/** Extra phrases for each page, combined with BASE_KEYWORDS. */
export const PAGE_KEYWORDS = {
  home: ['best movers in Canada', 'reliable movers', 'house movers', 'apartment movers', 'condo movers', 'moving help', 'book movers online', 'Moving Your Life Forward'],
  services: ['moving services', 'full service movers', 'furniture movers', 'appliance movers', 'loading and unloading help', 'furniture disassembly and assembly', 'moving supplies', 'cleanout services', 'heavy item movers', 'piano movers'],
  about: ['about Real Moving Canada', 'Saskatoon moving company', 'trusted movers Canada', 'family moving company'],
  contact: ['contact movers', 'moving company phone number', 'Saskatoon movers contact', 'moving company near me'],
  quote: ['moving quote', 'free moving quote', 'get a moving quote online', 'book a move', 'moving cost estimate', 'how much do movers cost in Canada'],
  pricing: ['moving cost Canada', 'how much do movers cost', 'moving prices', 'moving estimate calculator', 'long distance moving cost Canada', 'cheap movers Canada', 'affordable movers'],
  areas: [
    'movers British Columbia', 'movers Alberta', 'movers Saskatchewan', 'movers Manitoba', 'movers Ontario', 'movers Quebec',
    'movers Nova Scotia', 'movers New Brunswick', 'movers PEI', 'movers Newfoundland', 'movers Yukon', 'movers Northwest Territories', 'movers Nunavut',
    'moving to Alberta', 'moving to Ontario', 'moving to BC', 'Saskatoon to Calgary movers', 'Saskatoon to Edmonton movers', 'Saskatoon to Regina movers',
  ],
  reviews: ['moving company reviews', 'Real Moving Canada reviews', 'movers reviews Saskatoon'],
};

export const keywordsFor = (page, extra = []) => [...new Set([...(PAGE_KEYWORDS[page] || []), ...extra, ...BASE_KEYWORDS])].join(', ');

/** schema.org business record — also embedded statically in index.html. */
export const businessJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'MovingCompany',
  '@id': `${SITE_URL}/#business`,
  name: COMPANY.name,
  legalName: COMPANY.legalName,
  slogan: COMPANY.tagline,
  url: SITE_URL,
  logo: `${SITE_URL}/apple-touch-icon.png`,
  image: OG_IMAGE,
  telephone: COMPANY.phoneTel,
  email: COMPANY.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: COMPANY.address.street,
    addressLocality: COMPANY.address.city,
    addressRegion: COMPANY.address.provinceCode,
    postalCode: COMPANY.address.postal,
    addressCountry: 'CA',
  },
  areaServed: { '@type': 'Country', name: 'Canada' },
});

export const faqJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
});

export const serviceJsonLd = (service) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.title,
  serviceType: service.name,
  description: service.summary,
  url: `${SITE_URL}/services/${service.slug}`,
  provider: { '@id': `${SITE_URL}/#business` },
  areaServed: { '@type': 'Country', name: 'Canada' },
});

export const breadcrumbJsonLd = (crumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE_URL}${c.path}` })),
});
