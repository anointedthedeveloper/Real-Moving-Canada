/**
 * Reference data used for labels and as an offline fallback.
 * The live values come from the API (/api/public/...) and admin settings.
 */
/** Business contact details, shown in the header, footer, contact page and service pages. */
export const PHONE = '+1 (306) 880-4560';
export const PHONE_TEL = '+13068804560';
export const EMAIL = 'etualiu@yahoo.com';
export const ADDRESS = { street: '231 Flynn Bend', city: 'Saskatoon', province: 'Saskatchewan', postal: 'S7V 1R9' };

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

/** Top-level service categories — used to group the services page and to build the homepage teaser. */
export const SERVICE_CATEGORIES = [
  { slug: 'residential-moving', name: 'Residential Moving Services', icon: 'home', summary: 'Local moves, long-distance relocations and apartment or condo moves, handled by an experienced crew.', highlights: ['Local moving', 'Long-distance moving', 'Apartment & condo moving'], imageUrl: u('photo-1758523671071-4e3c43d055e6'), imageAlt: 'A couple carrying a moving box and a plant into their new home' },
  { slug: 'packing-unpacking', name: 'Packing & Unpacking Services', icon: 'box', summary: 'Full or partial packing, custom crating for valuables, and unpacking once you arrive.', highlights: ['Full-service packing', 'Partial packing', 'Custom crating'], imageUrl: u('photo-1600725935160-f67ee4f6084a'), imageAlt: 'Packed moving boxes on a wooden table' },
  { slug: 'specialty-moving', name: 'Specialty Moving', icon: 'shield', summary: 'Pianos and heavy items, office relocations and vehicle shipping, handled with the right equipment.', highlights: ['Piano & heavy item moving', 'Office & commercial relocation', 'Vehicle shipping'], imageUrl: u('photo-1494412574643-ff11b0a5c1c3'), imageAlt: 'Shipping containers staged for transport' },
  { slug: 'logistics-storage', name: 'Logistics & Storage Solutions', icon: 'warehouse', summary: 'Disassembly and reassembly of furniture, plus short- and long-term storage options.', highlights: ['Disassembly & reassembly', 'Short-term storage', 'Long-term storage'], imageUrl: u('photo-1553413077-190dd305871c'), imageAlt: 'Shelving inside a storage warehouse' },
  { slug: 'junk-removal', name: 'Junk Removal', icon: 'trash', summary: 'Furniture, debris and unwanted items cleared away when you’re moving out, downsizing or cleaning up.', highlights: ['Furniture & household junk removal', 'Moving debris removal', 'Post-move cleanup'], imageUrl: u('photo-1742858492775-8f58f645aa12'), imageAlt: 'A delivery van with its back doors open, ready to be loaded' },
];

export const FALLBACK_SERVICES = [
  // Residential Moving Services
  { slug: 'local-moving', category: 'residential-moving', name: 'Local Moving', icon: 'pin', isFeatured: true,
    summary: 'Fast, reliable, and efficient relocation services within your local city or metropolitan area, billed transparently.',
    highlights: ['Crew and truck sized to your home', 'Transparent, upfront billing', 'Loading, transport and unloading', 'Optional packing and storage'],
    description: "Moving across town still means a full day of lifting, loading and logistics. Our local crews arrive with a truck sized to your home, protect floors and doorways, and move everything in one well-planned trip.\n\nYou get a clear, upfront estimate before moving day, and you can add packing, disassembly or short-term storage if your plans call for it.",
    idealFor: ['Houses, apartments and condos', 'Moves within the same city or region', 'Same-day moves with a planned timeline'],
    imageUrl: u('photo-1694715669993-ea0022b470f7'), imageAlt: 'A mover unloading boxes from a van' },
  { slug: 'long-distance-moving', category: 'residential-moving', name: 'Long-Distance Moving', icon: 'route',
    summary: 'Seamless cross-province or cross-country moving solutions with guaranteed safe transport and timely delivery.',
    highlights: ['Moves between cities and provinces', 'Agreed pickup and delivery windows', 'Inventory recorded at pickup', 'Updates while your belongings are in transit'],
    description: "Moving to another city or province takes more than a truck. We plan your route and timeline in advance, record an inventory at pickup, and agree on pickup and delivery windows before your belongings leave.\n\nWhile your items are in transit you can reach our team for updates, and we can coordinate storage if your new home isn't ready on arrival.",
    idealFor: ['Cross-province relocations', 'Job transfers and new starts', 'Families moving to be closer to relatives'],
    imageUrl: u('photo-1587440871875-191322ee64b0'), imageAlt: 'A moving truck being loaded with furniture outside a home' },
  { slug: 'apartment-condo-moving', category: 'residential-moving', name: 'Apartment & Condo Moving', icon: 'building',
    summary: 'Specialized handling of tight hallways, elevators, and building regulations to ensure a smooth transition.',
    highlights: ['Elevator and hallway protection', 'Building-approved moving windows', 'Careful navigation of stairwells and tight corners', 'Coordination with building management'],
    description: "Apartment and condo moves come with elevators to book, loading docks to reserve and building rules to follow. We plan around your building's moving windows and protect common areas along the way.\n\nOur crews are used to tight corners, narrow stairwells and long carries from the elevator to the truck.",
    idealFor: ['High-rise and walk-up apartments', 'Condos with booked elevator times', 'Buildings with strict moving rules'],
    imageUrl: u('photo-1758523671071-4e3c43d055e6'), imageAlt: 'A couple carrying a moving box and a plant into their new home' },

  // Packing & Unpacking Services
  { slug: 'full-service-packing', category: 'packing-unpacking', name: 'Full-Service Packing', icon: 'box',
    summary: 'Save your time and energy. We bring high-quality boxes, wrap, and supplies to professionally pack your entire home.',
    highlights: ['High-quality boxes and packing materials', 'Room-by-room packing and labelling', 'Fragile items wrapped and protected', 'Ready for loading day'],
    description: "Packing is often the most time-consuming part of a move. Our team brings quality boxes, paper, wrap and tape, and packs your home room by room with every box labelled for its destination.\n\nFragile items such as dishes, glassware and electronics get extra protection, so everything is ready to load on moving day.",
    idealFor: ['Busy households and professionals', 'Large homes with lots of contents', 'Anyone who wants a hands-off move'],
    imageUrl: u('photo-1600725935160-f67ee4f6084a'), imageAlt: 'Packed moving boxes on a wooden table' },
  { slug: 'partial-packing', category: 'packing-unpacking', name: 'Partial Packing', icon: 'hands',
    summary: 'Need help with the tricky stuff? We can pack specific rooms or fragile categories like kitchenware, electronics, and artwork.',
    highlights: ['Pack only the rooms or items you choose', 'Kitchenware, electronics and artwork', 'Combine with your own packing', 'Flexible scheduling around your move'],
    description: "Prefer to pack most of your home yourself? We can take on just the rooms or items that need a professional touch, such as the kitchen, artwork, electronics or collectibles.\n\nYou keep control of your budget while the tricky and fragile pieces are packed properly.",
    idealFor: ['Kitchens, glassware and china', 'TVs, computers and electronics', 'Artwork, mirrors and décor'],
    imageUrl: u('photo-1663625318264-695d2d04f11a'), imageAlt: 'Neatly packed moving boxes ready for a move' },
  { slug: 'custom-crating', category: 'packing-unpacking', name: 'Custom Crating', icon: 'ruler',
    summary: 'Tailor-made wooden crates built specifically for high-value antiques, fine art, large mirrors, and heirlooms.',
    highlights: ['Built to the exact dimensions of the item', 'Antiques, fine art and mirrors', 'Extra protection for irreplaceable pieces', 'Available for local and long-distance moves'],
    description: "Some items are too valuable or delicate for a standard box. We build wooden crates to the exact dimensions of the piece, with padding and bracing to keep it still in transit.\n\nCustom crating is available for local and long-distance moves, and for items heading into storage.",
    idealFor: ['Antiques and heirlooms', 'Fine art, sculptures and large mirrors', 'Glass tabletops and chandeliers'],
    imageUrl: u('photo-1553413077-190dd305871c'), imageAlt: 'Shelving inside a storage warehouse' },
  { slug: 'unpacking-debris-removal', category: 'packing-unpacking', name: 'Unpacking & Debris Removal', icon: 'archive',
    summary: 'We unpack your belongings onto flat surfaces and haul away used packing materials so your new home is instantly livable.',
    highlights: ['Boxes unpacked onto flat surfaces', 'Packing paper and wrap cleared away', 'Boxes broken down and removed', 'A livable space from day one'],
    description: "Arriving at a new home surrounded by boxes can be overwhelming. We unpack your belongings onto counters, shelves and flat surfaces so you can put things away at your own pace.\n\nWhen we're done, we break down boxes and haul away the paper and wrap, leaving you with a livable space from day one.",
    idealFor: ['Families settling in quickly', 'Seniors and downsizers', 'Office moves that need to reopen fast'],
    imageUrl: u('photo-1758523671893-0ba21cf4260f'), imageAlt: 'A couple unpacking moving boxes in their new home' },

  // Specialty Moving
  { slug: 'piano-heavy-item-moving', category: 'specialty-moving', name: 'Piano & Heavy Item Moving', icon: 'scale',
    summary: 'Safe transport of exceptionally heavy, delicate, or awkward items including pianos, pool tables, safes, and hot tubs using professional rigging equipment.',
    highlights: ['Pianos, pool tables, safes and hot tubs', 'Professional rigging equipment', 'Protection for floors, walls and doorways', 'Experienced, trained crews'],
    description: "Pianos, safes, pool tables and hot tubs need the right equipment, planning and crew. We assess access at both ends, bring dollies, straps and rigging gear, and protect floors, walls and doorways.\n\nTell us about the item and the access in your quote request and we'll plan the move around it.",
    idealFor: ['Upright and grand pianos', 'Gun safes and heavy cabinets', 'Pool tables, hot tubs and gym equipment'],
    imageUrl: u('photo-1739813914275-a0952d33477b'), imageAlt: 'A moving van parked and ready for transport' },
  { slug: 'office-commercial-relocation', category: 'specialty-moving', name: 'Office & Commercial Relocation', icon: 'building',
    summary: 'Minimize business downtime with structured commercial moves, including IT setup, office furniture dismantling, and corporate file transport.',
    highlights: ['Moves scheduled around business hours', 'Office furniture dismantling and setup', 'Workstations, files and equipment', 'One point of contact for your move'],
    description: "Every hour your business is closed costs money. We plan commercial moves around your schedule, including evenings and weekends, and label furniture, equipment and files so each workstation is set up in the right place.\n\nYou get one point of contact from planning to the first day in your new space.",
    idealFor: ['Offices and small businesses', 'Retail stores and clinics', 'Moves scheduled outside business hours'],
    imageUrl: u('photo-1497366216548-37526070297c'), imageAlt: 'A bright, modern open-plan office' },
  { slug: 'vehicle-shipping', category: 'specialty-moving', name: 'Vehicle Shipping', icon: 'truck',
    summary: 'Safe transportation of cars, motorcycles, and recreational vehicles via trusted carriers.',
    highlights: ['Cars, motorcycles and RVs', 'Trusted carrier network', 'Coordinated with your moving date', 'Door-to-door options available'],
    description: "Moving to another province often means moving a car too. We coordinate transport of cars, motorcycles and recreational vehicles through trusted carriers, timed to match the rest of your move.\n\nDoor-to-door options are available depending on the route.",
    idealFor: ['Cars and SUVs', 'Motorcycles', 'RVs and trailers'],
    imageUrl: u('photo-1494412574643-ff11b0a5c1c3'), imageAlt: 'Shipping containers staged for transport' },

  // Logistics & Storage Solutions
  { slug: 'disassembly-reassembly', category: 'logistics-storage', name: 'Disassembly & Reassembly', icon: 'sliders',
    summary: 'We expertly take apart beds, modular desks, and large entertainment units at your origin and reassemble them perfectly at your destination.',
    highlights: ['Beds, desks and entertainment units', 'Hardware kept organized and labelled', 'Reassembled at your new home', 'Included with residential and office moves'],
    description: "Large furniture often won't fit through a doorway in one piece. Our crew takes apart beds, desks, shelving and entertainment units, keeps the hardware bagged and labelled, and puts everything back together at your new place.\n\nDisassembly and reassembly can be added to any residential or office move.",
    idealFor: ['Bed frames and bunk beds', 'Modular desks and shelving', 'Wardrobes and entertainment units'],
    imageUrl: u('photo-1742858492775-8f58f645aa12'), imageAlt: 'A delivery van with its back doors open, ready to be loaded' },
  { slug: 'storage-solutions', category: 'logistics-storage', name: 'Short-Term & Long-Term Storage', icon: 'warehouse',
    summary: 'Secure, climate-controlled warehousing options available if your new home isn’t ready quite yet.',
    highlights: ['Short- and long-term options', 'Storage between move-out and move-in dates', 'Items inventoried before storage', 'Delivery from storage when you’re ready'],
    description: "When move-out and move-in dates don't line up, storage bridges the gap. Your belongings are inventoried and stored securely until you're ready, for a few days or several months.\n\nWhen it's time, we deliver from storage straight to your new home.",
    idealFor: ['Closing dates that don’t match', 'Renovations and home staging', 'Temporary or seasonal relocations'],
    imageUrl: u('photo-1553413077-190dd305871c'), imageAlt: 'Shelving inside a storage warehouse' },

  // Junk Removal
  { slug: 'junk-removal', category: 'junk-removal', name: 'Junk Removal', icon: 'trash', isFeatured: true,
    summary: 'Practical junk and debris removal for customers who are moving out, downsizing, clearing a property, or cleaning up after a move.',
    highlights: ['Furniture removal', 'Moving debris removal', 'Household junk removal', 'Post-move cleanup', 'Packing material removal'],
    description: 'Whether you’re moving out, downsizing, clearing a property, or simply need unwanted furniture and packing materials hauled away, our team can help clear the space so you don’t have to. The exact items we’re able to accept can be confirmed through the quote process.',
    idealFor: ['Move-outs and downsizing', 'Estate and property clean-outs', 'Clearing packing debris after a move'],
    imageUrl: u('photo-1742858492775-8f58f645aa12'), imageAlt: 'A delivery van with its back doors open, ready to be loaded' },
];
export const SERVICE_ICONS = ['home', 'building', 'pin', 'route', 'globe', 'box', 'warehouse', 'sofa', 'truck', 'shield', 'calendar', 'hands'];
