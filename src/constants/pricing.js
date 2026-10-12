/**
 * Pricing rules for the online moving calculator — the ONE place to change rates.
 *
 * IMPORTANT: the numbers below are example rates (they reproduce the worked example
 * in the pricing brief: 3 movers × $160/h). Replace them with Real Moving Canada's
 * real rates before relying on the calculator. Everything the calculator shows
 * comes from this file; no other code needs to change when prices change.
 */
export const PRICING = {
  currency: 'CAD',

  /** Hourly crew rates (truck included) and how fast each crew works compared with 2 movers. */
  crews: {
    2: { rate: 130, speed: 1 },
    3: { rate: 160, speed: 0.75 },
    4: { rate: 195, speed: 0.62 },
  },

  /** Local moves — hourly pricing: (hours × crew rate) + extras + tax. */
  local: {
    maxKm: 120,          // longer than this is priced as a long-distance move
    minimumHours: 2,     // minimum booking
    travelHours: 0.5,    // crew travel from our base to the pickup and back
    setupHours: 0.5,     // floor and doorway protection, walkthrough and paperwork
    driveKmPerHour: 50,  // average speed between the two addresses
  },

  /** Long-distance moves — shipment weight × rate per pound for the route, plus loading/unloading labour. */
  longDistance: {
    minimumWeightLbs: 1500,
    bands: [ // rate per pound by driving distance
      { upToKm: 500, perLb: 0.55 },
      { upToKm: 1000, perLb: 0.75 },
      { upToKm: 2000, perLb: 0.95 },
      { upToKm: 3500, perLb: 1.15 },
      { upToKm: Infinity, perLb: 1.35 },
    ],
    fuelSurcharge: 0.08, // share of the transport cost
  },

  /** Access at each address: extra share of the handling time at that address. */
  access: {
    floors: [
      { value: 'ground', label: 'Ground floor / house', extra: 0 },
      { value: 'f2', label: '2nd floor (1 flight of stairs)', extra: 0.15 },
      { value: 'f3', label: '3rd floor (2 flights)', extra: 0.3 },
      { value: 'f4', label: '4th floor or higher', extra: 0.45 },
    ],
    elevator: 0.1,   // replaces the stairs extra when there is an elevator
    longCarry: 0.15, // long walk between the door and the truck
  },

  /** Extra services. */
  extras: {
    packing: { minutesPerBox: 6, materialsPerBox: 4 },
    unpacking: { minutesPerBox: 4 },
    junkRemoval: { flat: 175 },
    storage: { perMonth: 175 },
  },

  /** Estimated GST/HST by province (place of pickup). Adjust if PST/QST applies to your services. */
  taxRates: {
    AB: 0.05, BC: 0.05, MB: 0.05, NB: 0.15, NL: 0.15, NS: 0.14, NT: 0.05,
    NU: 0.05, ON: 0.13, PE: 0.15, QC: 0.05, SK: 0.05, YT: 0.05,
  },
};

/**
 * Item list. `minutes` = handling time for a 2-mover crew (load + unload, wrapping
 * and protection), `cuft` = truck space, `lbs` = shipping weight, `assembly` =
 * minutes to take apart and put back together, `fee` = special-handling charge.
 * Times are planning estimates, not fixed industry standards.
 */
export const ITEM_GROUPS = [
  { id: 'living', label: 'Living room', icon: 'sofa', items: [
    { id: 'sofa3', name: 'Three-seat sofa', minutes: 15, cuft: 50, lbs: 150 },
    { id: 'loveseat', name: 'Loveseat', minutes: 12, cuft: 35, lbs: 100 },
    { id: 'sectional', name: 'Sectional sofa', minutes: 25, cuft: 90, lbs: 250 },
    { id: 'armchair', name: 'Armchair', minutes: 8, cuft: 20, lbs: 60 },
    { id: 'recliner', name: 'Recliner', minutes: 10, cuft: 25, lbs: 90 },
    { id: 'coffee_table', name: 'Coffee table', minutes: 5, cuft: 8, lbs: 30 },
    { id: 'tv_stand', name: 'TV stand', minutes: 8, cuft: 15, lbs: 60 },
    { id: 'tv', name: 'Television', minutes: 8, cuft: 8, lbs: 40 },
    { id: 'bookshelf', name: 'Bookshelf', minutes: 10, cuft: 20, lbs: 70 },
    { id: 'rug', name: 'Large rug', minutes: 4, cuft: 6, lbs: 25 },
  ] },
  { id: 'bedroom', label: 'Bedroom', icon: 'home', items: [
    { id: 'bed_king', name: 'King bed', minutes: 20, cuft: 70, lbs: 170, assembly: 25 },
    { id: 'bed_queen', name: 'Queen bed', minutes: 15, cuft: 60, lbs: 150, assembly: 20 },
    { id: 'bed_single', name: 'Single or double bed', minutes: 12, cuft: 45, lbs: 110, assembly: 15 },
    { id: 'crib', name: 'Crib', minutes: 10, cuft: 15, lbs: 50, assembly: 15 },
    { id: 'dresser', name: 'Dresser', minutes: 12, cuft: 35, lbs: 150 },
    { id: 'nightstand', name: 'Nightstand', minutes: 4, cuft: 6, lbs: 30 },
    { id: 'wardrobe', name: 'Wardrobe / armoire', minutes: 15, cuft: 40, lbs: 150, assembly: 20 },
    { id: 'mirror', name: 'Large mirror', minutes: 4, cuft: 5, lbs: 25 },
  ] },
  { id: 'dining', label: 'Dining', icon: 'grid', items: [
    { id: 'dining_table', name: 'Dining table', minutes: 15, cuft: 25, lbs: 100, assembly: 10 },
    { id: 'dining_chair', name: 'Dining chair', minutes: 2, cuft: 5, lbs: 15 },
    { id: 'china_cabinet', name: 'China cabinet / hutch', minutes: 18, cuft: 40, lbs: 200 },
    { id: 'bar_stool', name: 'Bar stool', minutes: 2, cuft: 4, lbs: 12 },
  ] },
  { id: 'kitchen', label: 'Kitchen & appliances', icon: 'box', items: [
    { id: 'fridge', name: 'Refrigerator', minutes: 15, cuft: 45, lbs: 250 },
    { id: 'stove', name: 'Stove / range', minutes: 12, cuft: 30, lbs: 180 },
    { id: 'washer', name: 'Washer', minutes: 12, cuft: 25, lbs: 170 },
    { id: 'dryer', name: 'Dryer', minutes: 10, cuft: 25, lbs: 120 },
    { id: 'dishwasher', name: 'Dishwasher', minutes: 10, cuft: 15, lbs: 90 },
    { id: 'freezer', name: 'Chest freezer', minutes: 15, cuft: 35, lbs: 200 },
    { id: 'microwave', name: 'Microwave', minutes: 3, cuft: 3, lbs: 40 },
  ] },
  { id: 'boxes', label: 'Boxes', icon: 'archive', items: [
    { id: 'box_small', name: 'Small box', minutes: 1.5, cuft: 1.5, lbs: 25, box: true },
    { id: 'box_medium', name: 'Medium box', minutes: 2, cuft: 3, lbs: 35, box: true },
    { id: 'box_large', name: 'Large box', minutes: 2.5, cuft: 4.5, lbs: 45, box: true },
    { id: 'box_wardrobe', name: 'Wardrobe box', minutes: 3, cuft: 10, lbs: 50, box: true },
    { id: 'tote', name: 'Plastic tote', minutes: 2, cuft: 3, lbs: 30 },
  ] },
  { id: 'office', label: 'Office', icon: 'building', items: [
    { id: 'desk', name: 'Desk', minutes: 12, cuft: 25, lbs: 120, assembly: 15 },
    { id: 'office_chair', name: 'Office chair', minutes: 3, cuft: 8, lbs: 30 },
    { id: 'filing_cabinet', name: 'Filing cabinet', minutes: 8, cuft: 12, lbs: 90 },
    { id: 'conference_table', name: 'Conference table', minutes: 20, cuft: 40, lbs: 250, assembly: 20 },
  ] },
  { id: 'outdoor', label: 'Garage & outdoor', icon: 'warehouse', items: [
    { id: 'bbq', name: 'Barbecue', minutes: 8, cuft: 15, lbs: 90 },
    { id: 'patio_table', name: 'Patio table', minutes: 6, cuft: 15, lbs: 50 },
    { id: 'patio_chair', name: 'Patio chair', minutes: 2, cuft: 5, lbs: 10 },
    { id: 'bicycle', name: 'Bicycle', minutes: 4, cuft: 10, lbs: 30 },
    { id: 'lawn_mower', name: 'Lawn mower', minutes: 6, cuft: 10, lbs: 70 },
    { id: 'tool_chest', name: 'Tool chest', minutes: 10, cuft: 15, lbs: 150 },
  ] },
  { id: 'special', label: 'Heavy & special items', icon: 'scale', items: [
    { id: 'piano', name: 'Upright piano', minutes: 30, cuft: 40, lbs: 400, fee: 250, heavy: true },
    { id: 'safe', name: 'Safe (under 500 lb)', minutes: 25, cuft: 10, lbs: 300, fee: 175, heavy: true },
    { id: 'treadmill', name: 'Treadmill', minutes: 15, cuft: 30, lbs: 250, assembly: 10 },
    { id: 'pool_table', name: 'Pool table', minutes: 40, cuft: 60, lbs: 600, fee: 300, heavy: true, assembly: 45 },
  ] },
];

export const ITEMS = Object.fromEntries(ITEM_GROUPS.flatMap((g) => g.items.map((i) => [i.id, i])));

/** Typical inventories by home size — a starting point the customer adjusts. */
export const INVENTORY_PRESETS = {
  studio: { sofa3: 1, coffee_table: 1, tv: 1, tv_stand: 1, bed_queen: 1, dresser: 1, nightstand: 1, dining_table: 1, dining_chair: 2, box_medium: 15, box_large: 3 },
  one_bed: { sofa3: 1, armchair: 1, coffee_table: 1, tv: 1, tv_stand: 1, bookshelf: 1, bed_queen: 1, dresser: 1, nightstand: 2, dining_table: 1, dining_chair: 4, box_small: 5, box_medium: 20, box_large: 5 },
  two_bed: { sofa3: 1, armchair: 1, coffee_table: 1, tv: 1, tv_stand: 1, bookshelf: 1, bed_queen: 1, bed_single: 1, dresser: 2, nightstand: 3, desk: 1, office_chair: 1, dining_table: 1, dining_chair: 4, box_small: 8, box_medium: 30, box_large: 8 },
  three_bed: { sofa3: 1, loveseat: 1, armchair: 1, coffee_table: 1, tv: 2, tv_stand: 1, bookshelf: 2, bed_king: 1, bed_queen: 1, bed_single: 1, dresser: 3, nightstand: 4, desk: 1, office_chair: 1, dining_table: 1, dining_chair: 6, fridge: 1, washer: 1, dryer: 1, bbq: 1, box_small: 10, box_medium: 45, box_large: 12, box_wardrobe: 2 },
  four_bed: { sectional: 1, loveseat: 1, armchair: 2, coffee_table: 1, tv: 3, tv_stand: 2, bookshelf: 2, bed_king: 1, bed_queen: 2, bed_single: 1, dresser: 4, nightstand: 6, desk: 2, office_chair: 2, dining_table: 1, dining_chair: 6, china_cabinet: 1, fridge: 1, washer: 1, dryer: 1, bbq: 1, patio_table: 1, patio_chair: 4, lawn_mower: 1, box_small: 15, box_medium: 60, box_large: 15, box_wardrobe: 3 },
  five_plus: { sectional: 1, sofa3: 1, armchair: 2, coffee_table: 2, tv: 4, tv_stand: 2, bookshelf: 3, bed_king: 2, bed_queen: 2, bed_single: 1, dresser: 5, nightstand: 8, desk: 2, office_chair: 2, dining_table: 1, dining_chair: 8, china_cabinet: 1, fridge: 1, freezer: 1, washer: 1, dryer: 1, bbq: 1, patio_table: 1, patio_chair: 6, lawn_mower: 1, tool_chest: 1, box_small: 20, box_medium: 80, box_large: 20, box_wardrobe: 4 },
  office: { desk: 6, office_chair: 6, filing_cabinet: 3, bookshelf: 2, conference_table: 1, box_medium: 40, box_large: 5 },
};

/**
 * Cities with coordinates, for an automatic driving-distance estimate
 * (straight-line distance × a road factor). Customers can always correct it.
 */
export const ROAD_FACTOR = 1.25;
export const CITIES = [
  ['Saskatoon', 'SK', 52.13, -106.67], ['Regina', 'SK', 50.45, -104.61], ['Prince Albert', 'SK', 53.2, -105.75],
  ['Moose Jaw', 'SK', 50.39, -105.53], ['North Battleford', 'SK', 52.76, -108.29], ['Swift Current', 'SK', 50.29, -107.79],
  ['Yorkton', 'SK', 51.21, -102.46], ['Estevan', 'SK', 49.14, -102.99], ['Warman', 'SK', 52.32, -106.58],
  ['Martensville', 'SK', 52.29, -106.67], ['Humboldt', 'SK', 52.2, -105.12], ['Lloydminster', 'SK', 53.28, -110.0],
  ['Calgary', 'AB', 51.05, -114.07], ['Edmonton', 'AB', 53.55, -113.49], ['Red Deer', 'AB', 52.27, -113.81],
  ['Lethbridge', 'AB', 49.69, -112.84], ['Medicine Hat', 'AB', 50.04, -110.68], ['Grande Prairie', 'AB', 55.17, -118.8],
  ['Fort McMurray', 'AB', 56.73, -111.38],
  ['Vancouver', 'BC', 49.28, -123.12], ['Surrey', 'BC', 49.19, -122.85], ['Victoria', 'BC', 48.43, -123.37],
  ['Kelowna', 'BC', 49.89, -119.5], ['Kamloops', 'BC', 50.67, -120.33], ['Prince George', 'BC', 53.92, -122.75],
  ['Nanaimo', 'BC', 49.17, -123.94],
  ['Winnipeg', 'MB', 49.9, -97.14], ['Brandon', 'MB', 49.85, -99.95], ['Thompson', 'MB', 55.74, -97.86],
  ['Toronto', 'ON', 43.65, -79.38], ['Ottawa', 'ON', 45.42, -75.7], ['Mississauga', 'ON', 43.59, -79.64],
  ['Hamilton', 'ON', 43.26, -79.87], ['London', 'ON', 42.98, -81.25], ['Kitchener', 'ON', 43.45, -80.49],
  ['Windsor', 'ON', 42.31, -83.04], ['Sudbury', 'ON', 46.49, -80.99], ['Thunder Bay', 'ON', 48.38, -89.25],
  ['Kingston', 'ON', 44.23, -76.49], ['Barrie', 'ON', 44.39, -79.69],
  ['Montreal', 'QC', 45.5, -73.57], ['Quebec City', 'QC', 46.81, -71.21], ['Gatineau', 'QC', 45.48, -75.7],
  ['Sherbrooke', 'QC', 45.4, -71.89],
  ['Moncton', 'NB', 46.09, -64.78], ['Saint John', 'NB', 45.27, -66.06], ['Fredericton', 'NB', 45.96, -66.64],
  ['Halifax', 'NS', 44.65, -63.57], ['Sydney', 'NS', 46.14, -60.19],
  ['Charlottetown', 'PE', 46.24, -63.13],
  ["St. John's", 'NL', 47.56, -52.71], ['Corner Brook', 'NL', 48.95, -57.95],
  ['Whitehorse', 'YT', 60.72, -135.06], ['Yellowknife', 'NT', 62.45, -114.37], ['Iqaluit', 'NU', 63.75, -68.52],
].map(([name, province, lat, lon]) => ({ name, province, lat, lon, label: `${name}, ${province}` }));
