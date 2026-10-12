import { PRICING, ITEMS, CITIES, ROAD_FACTOR } from '../constants/pricing.js';

/** Finds a known city from free text such as "saskatoon" or "Regina, SK". */
export function findCity(text) {
  const q = (text || '').trim().toLowerCase();
  if (!q) return null;
  return CITIES.find((c) => c.label.toLowerCase() === q)
    || CITIES.find((c) => c.name.toLowerCase() === q)
    || CITIES.find((c) => q.startsWith(c.name.toLowerCase()))
    || null;
}

/** Approximate driving distance in km between two known cities (null if either is unknown). */
export function drivingKm(a, b) {
  if (!a || !b) return null;
  if (a === b) return 15; // a move within the same city
  const rad = (d) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(h)) * ROAD_FACTOR);
}

/** Smallest crew that suits the inventory (more volume or heavy items → more movers). */
export function recommendedCrew(cuft, hasHeavy, P = PRICING) {
  const size = cuft < 320 ? 2 : cuft < 800 ? 3 : 4;
  const crew = hasHeavy ? Math.max(3, size) : size;
  return P.crews[crew] ? crew : Number(Object.keys(P.crews).at(-1));
}

const quarterHour = (h) => Math.ceil(h * 4) / 4;
const cents = (n) => Math.round(n * 100) / 100;

function accessExtra(access = {}, P) {
  const floor = P.access.floors.find((f) => f.value === access.floor) || P.access.floors[0];
  let extra = access.elevator && floor.extra > 0 ? P.access.elevator : floor.extra;
  if (access.longCarry) extra += P.access.longCarry;
  return extra;
}

/**
 * Calculates a moving estimate.
 *   input = { distanceKm, province, items: { [itemId]: qty }, crew,
 *             origin: { floor, elevator, longCarry }, destination: { … },
 *             extras: { packing, unpacking, assembly, junkRemoval, storageMonths } }
 * Local moves:  total = hours × hourly crew rate + extras + tax.
 * Long distance: total = weight × rate per lb + fuel + loading/unloading labour + extras + tax.
 */
export function estimateMove(input, P = PRICING) {
  const lines = Object.entries(input.items || {})
    .map(([id, qty]) => ({ item: ITEMS[id], qty: Math.max(0, Math.floor(Number(qty) || 0)) }))
    .filter((l) => l.item && l.qty > 0);
  const sum = (fn) => lines.reduce((s, l) => s + fn(l.item) * l.qty, 0);

  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const cuft = sum((i) => i.cuft);
  const weight = sum((i) => i.lbs);
  const boxes = sum((i) => (i.box ? 1 : 0));
  const handlingMin = sum((i) => i.minutes);
  const hasHeavy = lines.some((l) => l.item.heavy);
  const recommended = recommendedCrew(cuft, hasHeavy, P);
  const crewSize = P.crews[input.crew] ? Number(input.crew) : recommended;
  const crew = P.crews[crewSize];
  const extras = input.extras || {};

  // Loading happens at the pickup and unloading at the delivery address: each half
  // of the handling time is slowed by that address's stairs, elevator or long walk.
  const accessMin = (handlingMin / 2) * (accessExtra(input.origin, P) + accessExtra(input.destination, P));
  const packingMin = extras.packing ? boxes * P.extras.packing.minutesPerBox : 0;
  const unpackingMin = extras.unpacking ? boxes * P.extras.unpacking.minutesPerBox : 0;
  const assemblyMin = extras.assembly ? sum((i) => i.assembly || 0) : 0;
  const workHours = ((handlingMin + accessMin + packingMin + unpackingMin + assemblyMin) / 60) * crew.speed;

  const distanceKm = Math.max(0, Number(input.distanceKm) || 0);
  const isLocal = distanceKm <= P.local.maxKm;

  const breakdown = [];
  let hours;
  let subtotal = 0;
  if (isLocal) {
    const driveHours = distanceKm / P.local.driveKmPerHour;
    hours = Math.max(P.local.minimumHours, quarterHour(workHours + driveHours + P.local.travelHours + P.local.setupHours));
    const labour = hours * crew.rate;
    breakdown.push({ key: 'labour', label: `Labour (${hours} h × $${crew.rate}/h)`, amount: labour });
    subtotal += labour;
  } else {
    hours = quarterHour(workHours + P.local.setupHours);
    const billable = Math.max(P.longDistance.minimumWeightLbs, weight);
    const band = P.longDistance.bands.find((b) => distanceKm <= b.upToKm);
    const transport = billable * band.perLb;
    const fuel = transport * P.longDistance.fuelSurcharge;
    const labour = hours * crew.rate;
    breakdown.push({ key: 'transport', label: `Transport (${billable.toLocaleString('en-CA')} lb × $${band.perLb.toFixed(2)}/lb)`, amount: transport });
    breakdown.push({ key: 'fuel', label: `Fuel surcharge (${Math.round(P.longDistance.fuelSurcharge * 100)}%)`, amount: fuel });
    breakdown.push({ key: 'labour', label: `Loading & unloading (${hours} h × $${crew.rate}/h)`, amount: labour });
    subtotal += transport + fuel + labour;
  }

  const special = sum((i) => i.fee || 0);
  if (special) breakdown.push({ key: 'special', label: 'Special-item handling', amount: special });
  const materials = extras.packing ? boxes * P.extras.packing.materialsPerBox : 0;
  if (materials) breakdown.push({ key: 'materials', label: `Packing materials (${boxes} boxes)`, amount: materials });
  const junk = extras.junkRemoval ? P.extras.junkRemoval.flat : 0;
  if (junk) breakdown.push({ key: 'junk', label: 'Junk removal', amount: junk });
  const months = Math.max(0, Math.floor(Number(extras.storageMonths) || 0));
  const storage = months * P.extras.storage.perMonth;
  if (storage) breakdown.push({ key: 'storage', label: `Storage (${months} month${months === 1 ? '' : 's'})`, amount: storage });
  const additional = special + materials + junk + storage;
  subtotal += additional;

  const taxRate = P.taxRates[input.province] ?? 0.05;
  const tax = subtotal * taxRate;

  return {
    isEmpty: itemCount === 0,
    isLocal,
    distanceKm,
    itemCount,
    cuft: Math.round(cuft),
    weight: Math.round(weight),
    boxes,
    crewSize,
    recommendedCrew: recommended,
    crewRate: crew.rate,
    hours,
    breakdown: breakdown.map((b) => ({ ...b, amount: cents(b.amount) })),
    additional: cents(additional),
    subtotal: cents(subtotal),
    taxRate,
    tax: cents(tax),
    total: cents(subtotal + tax),
  };
}

/** Plain-text inventory for the quote request ("1 × Three-seat sofa, 2 × Queen bed…"). */
export function inventorySummary(items) {
  return Object.entries(items || {})
    .filter(([id, q]) => ITEMS[id] && q > 0)
    .map(([id, q]) => `${q} × ${ITEMS[id].name}`)
    .join(', ');
}
