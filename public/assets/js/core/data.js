/**
 * Reference data used for labels and as an offline fallback.
 * The live values come from the API (/api/public/...) and admin settings.
 */
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

/** Grid positions for the Canada tile map (column, row). */
export const TILE_POS = { YT: [1, 1], NT: [2, 1], NU: [3, 1], NL: [7, 1], BC: [1, 2], AB: [2, 2], SK: [3, 2], MB: [4, 2], ON: [5, 2], QC: [6, 2], PE: [7, 2], NB: [6, 3], NS: [7, 3] };

export const FALLBACK_OPTIONS = {
  propertySizes: [
    { value: 'studio', label: 'Studio' }, { value: 'one_bed', label: '1 bedroom' }, { value: 'two_bed', label: '2 bedrooms' },
    { value: 'three_bed', label: '3 bedrooms' }, { value: 'four_bed', label: '4 bedrooms' }, { value: 'five_plus', label: '5+ bedrooms' },
    { value: 'office', label: 'Office / commercial' },
  ],
  moveTypes: [
    { value: 'residential', label: 'Residential' }, { value: 'commercial', label: 'Commercial' }, { value: 'local', label: 'Local' },
    { value: 'long_distance', label: 'Long-distance' }, { value: 'international', label: 'International' },
  ],
  services: [
    { value: 'packing', label: 'Packing' }, { value: 'unpacking', label: 'Unpacking' }, { value: 'storage', label: 'Storage' },
    { value: 'furniture_delivery', label: 'Furniture delivery' }, { value: 'loading', label: 'Loading' }, { value: 'unloading', label: 'Unloading' },
  ],
  timeWindows: [
    { value: 'morning', label: 'Morning (8 am – 12 pm)' }, { value: 'afternoon', label: 'Afternoon (12 pm – 4 pm)' },
    { value: 'evening', label: 'Evening (4 pm – 8 pm)' }, { value: 'flexible', label: 'Flexible' },
  ],
  propertyTypes: [
    { value: 'house', label: 'House' }, { value: 'apartment', label: 'Apartment' }, { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' }, { value: 'office', label: 'Office' }, { value: 'commercial', label: 'Commercial space' },
    { value: 'storage_unit', label: 'Storage unit' }, { value: 'other', label: 'Other' },
  ],
  provinces: PROVINCES,
  citySuggestions: {},
};

const u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=75`;
export const FALLBACK_SERVICES = [
  { slug: 'residential-moving', name: 'Residential Moving', icon: 'home', isFeatured: true, summary: 'Moving houses, apartments, condos, and other residential properties.', highlights: ['Houses, apartments, condos and townhouses', 'Furniture wrapping and protection', 'Disassembly and reassembly of standard furniture', 'Room-by-room placement at your new home'], imageUrl: u('photo-1758523671071-4e3c43d055e6'), imageAlt: 'A couple carrying a moving box and a plant into their new home' },
  { slug: 'commercial-office-moving', name: 'Commercial & Office Moving', icon: 'building', isFeatured: true, summary: 'Office relocations and commercial moving services.', highlights: ['Moves scheduled around business hours', 'Workstations, files and office equipment', 'Labelling by room and workstation', 'One point of contact for your move'], imageUrl: u('photo-1497366216548-37526070297c'), imageAlt: 'A bright, modern open-plan office' },
  { slug: 'local-moving', name: 'Local Moving', icon: 'pin', summary: 'Moving within the same city or local area.', highlights: ['Moves within your city or nearby communities', 'Crew and truck sized to your home', 'Loading, transport and unloading', 'Optional packing and storage'], imageUrl: u('photo-1694715669993-ea0022b470f7'), imageAlt: 'A mover unloading boxes from a van' },
  { slug: 'long-distance-moving', name: 'Long-Distance Moving', icon: 'route', summary: 'Moving between cities and provinces across Canada.', highlights: ['Moves between cities and provinces', 'Agreed pickup and delivery windows', 'Inventory recorded at pickup', 'Updates while your belongings are in transit'], imageUrl: u('photo-1739813914275-a0952d33477b'), imageAlt: 'A van parked beside a road' },
  { slug: 'international-moving', name: 'International Moving', icon: 'globe', summary: 'Moving services for customers relocating internationally.', highlights: ['Moves from Canada to destinations abroad', 'Export packing for overseas transport', 'Help preparing inventory lists for customs', 'Coordination of the overseas leg of your move'], imageUrl: u('photo-1494412574643-ff11b0a5c1c3'), imageAlt: 'Shipping containers at a port' },
  { slug: 'packing-unpacking', name: 'Packing & Unpacking', icon: 'box', summary: 'Professional packing and unpacking assistance.', highlights: ['Full or partial packing', 'Packing materials available on request', 'Fragile items, kitchenware and artwork', 'Unpacking and box removal at your new home'], imageUrl: u('photo-1600725935160-f67ee4f6084a'), imageAlt: 'Packed boxes on a wooden table' },
  { slug: 'storage', name: 'Storage', icon: 'warehouse', summary: 'Secure storage solutions for customers who need temporary or extended storage.', highlights: ['Short- and long-term options', 'Storage between move-out and move-in dates', 'Items inventoried before storage', 'Delivery from storage when you’re ready'], imageUrl: u('photo-1553413077-190dd305871c'), imageAlt: 'Shelving inside a storage warehouse' },
  { slug: 'furniture-delivery', name: 'Furniture Delivery', icon: 'sofa', summary: 'Safe transportation and delivery of furniture and large items.', highlights: ['Single items or full rooms', 'Store and marketplace pickups', 'Blanket-wrapped for transport', 'Placement in the room of your choice'], imageUrl: u('photo-1742858492775-8f58f645aa12'), imageAlt: 'A delivery van with its back doors open' },
];

export const BOOKING_FLOW = ['pending', 'under_review', 'confirmed', 'completed'];
export const BOOKING_LABELS = { pending: 'Pending', under_review: 'Under review', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' };
export const QUOTE_LABELS = { submitted: 'Submitted', under_review: 'Under review', finalized: 'Quote ready', closed: 'Closed' };
export const REVIEW_LABELS = { pending: 'Awaiting approval', approved: 'Published', rejected: 'Not published' };
export const SERVICE_ICONS = ['home', 'building', 'pin', 'route', 'globe', 'box', 'warehouse', 'sofa', 'truck', 'shield', 'calendar', 'hands'];
