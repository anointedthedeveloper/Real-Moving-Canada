/**
 * Business details from the company's branding (RMC truck livery and website
 * mock-up). Anything not known yet (e.g. operating hours) is left out rather than invented.
 */
export const COMPANY = {
  name: 'Real Moving Canada',
  legalName: 'Real Moving Canada Inc.',
  tagline: 'Moving Your Life Forward',
  slogan: 'Your Move. Our Priority.',
  promise: 'Safe. Reliable. On Time. We Move What Matters.',
  services: 'Moving • Junk Removal • Storage',
  phone: '+1 (306) 880 4560',
  phoneTel: '+13068804560',
  phone2: '+1 (306) 202 7026',
  phone2Tel: '+13062027026',
  email: 'info@realmovingcanada.ca',
  website: 'www.realmovingcanada.ca',
  address: {
    street: '231 Flynn Bend',
    city: 'Saskatoon',
    province: 'Saskatchewan',
    provinceCode: 'SK',
    postal: 'S7V 1R9',
  },
};

export const ADDRESS_LINE = `${COMPANY.address.street}, ${COMPANY.address.city}, ${COMPANY.address.provinceCode} ${COMPANY.address.postal}`;

export const MAP_EMBED_URL =
  'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s231+Flynn+Bend,+Saskatoon,+SK+S7V+1R9!6i15';
export const MAP_DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=231+Flynn+Bend%2C+Saskatoon%2C+SK+S7V+1R9';
