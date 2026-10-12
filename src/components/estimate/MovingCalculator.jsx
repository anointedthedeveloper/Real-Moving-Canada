import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../common/Button.jsx';
import Icon from '../common/Icon.jsx';
import Checkbox from '../forms/Checkbox.jsx';
import SelectField from '../forms/SelectField.jsx';
import TextField from '../forms/TextField.jsx';
import { PRICING, ITEM_GROUPS, INVENTORY_PRESETS, CITIES } from '../../constants/pricing.js';
import { PROPERTY_SIZES, PROVINCES } from '../../constants/options.js';
import { COMPANY } from '../../constants/company.js';
import { estimateMove, findCity, drivingKm, inventorySummary } from '../../utils/movingEstimate.js';
import { money, todayIso } from '../../utils/format.js';
import { session, STORAGE_KEYS } from '../../utils/storage.js';

const EMPTY_ACCESS = { floor: 'ground', elevator: false, longCarry: false };
const EMPTY = {
  from: '', to: '', distance: '', distanceEdited: false, moveDate: '',
  origin: { ...EMPTY_ACCESS }, destination: { ...EMPTY_ACCESS },
  preset: '', items: {}, crew: null,
  extras: { packing: false, unpacking: false, assembly: false, junkRemoval: false, storageMonths: 0 },
};
const FLOOR_OPTIONS = PRICING.access.floors.map((f) => ({ value: f.value, label: f.label }));
const MAX_QTY = 999;

/** First listed city in a province ("SK" → "Saskatoon, SK"), used when only a province is known. */
const cityForProvince = (code) => CITIES.find((c) => c.province === code)?.label || '';

/** Starting state: saved draft, then the homepage route ticket (?from=SK&to=AB&size=two_bed). */
function initialState(params) {
  const saved = session.get(STORAGE_KEYS.estimateDraft);
  const base = saved?.calculator ? { ...EMPTY, ...saved.calculator } : { ...EMPTY };
  const from = params.get('from');
  const to = params.get('to');
  const size = params.get('size');
  if (from && PROVINCES.some((p) => p.code === from)) base.from = cityForProvince(from);
  if (to && PROVINCES.some((p) => p.code === to)) base.to = cityForProvince(to);
  if (from || to) base.distanceEdited = false;
  if (size && INVENTORY_PRESETS[size]) { base.preset = size; base.items = { ...INVENTORY_PRESETS[size] }; }
  return base;
}

/** Services in the quote form that match the calculator's extras. */
function quoteServices(s) {
  return [
    s.extras.packing || s.extras.unpacking ? 'packing_unpacking' : null,
    s.extras.assembly ? 'furniture_disassembly' : null,
    s.extras.junkRemoval ? 'junk_removal' : null,
    s.extras.storageMonths > 0 ? 'storage' : null,
    Object.keys(s.items).some((id) => ['piano', 'safe', 'pool_table'].includes(id) && s.items[id] > 0) ? 'heavy_oversized' : null,
  ].filter(Boolean);
}

/**
 * Moving calculator: the customer lists their items, the route, access at each
 * address and any extras; the estimate updates instantly from the rules in
 * constants/pricing.js. "Request this quote" carries everything into the quote form.
 */
export default function MovingCalculator() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState(() => initialState(params));
  const summaryRef = useRef(null);
  const listId = useId();

  const set = (patch) => setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  const setAccess = (side, key, value) => set((s) => ({ [side]: { ...s[side], [key]: value } }));
  const setExtra = (key, value) => set((s) => ({ extras: { ...s.extras, [key]: value } }));
  const setQty = (id, qty) => set((s) => {
    const items = { ...s.items, [id]: Math.min(MAX_QTY, Math.max(0, qty)) };
    if (!items[id]) delete items[id];
    return { items };
  });

  const fromCity = findCity(state.from);
  const toCity = findCity(state.to);
  const autoKm = drivingKm(fromCity, toCity);
  const distance = state.distanceEdited ? Number(state.distance) || 0 : autoKm;
  const hasRoute = distance != null && distance > 0;

  const result = useMemo(() => estimateMove({
    distanceKm: distance || 0,
    province: fromCity?.province || 'SK',
    items: state.items,
    crew: state.crew,
    origin: state.origin,
    destination: state.destination,
    extras: state.extras,
  }), [distance, fromCity, state.items, state.crew, state.origin, state.destination, state.extras]);

  useEffect(() => { session.set(STORAGE_KEYS.estimateDraft, { calculator: state }); }, [state]);

  // Hide the phone total bar while the full estimate is on screen.
  const [summaryInView, setSummaryInView] = useState(false);
  useEffect(() => {
    const el = summaryRef.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setSummaryInView(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ready = hasRoute && !result.isEmpty;

  const applyPreset = (value) => set({ preset: value, items: value ? { ...INVENTORY_PRESETS[value] } : {} });

  const requestQuote = () => {
    const access = (a) => `${PRICING.access.floors.find((f) => f.value === a.floor)?.label}${a.elevator ? ', elevator' : ''}${a.longCarry ? ', long walk to truck' : ''}`;
    session.set(STORAGE_KEYS.estimateDraft, {
      calculator: state,
      quote: {
        origin: { province: fromCity?.province || '', city: fromCity?.name || state.from },
        destination: { province: toCity?.province || '', city: toCity?.name || state.to },
        propertySize: state.preset,
        moveDate: state.moveDate,
        moveType: result.isLocal ? 'local' : 'long_distance',
        services: quoteServices(state),
        details: [
          `Inventory: ${inventorySummary(state.items)}.`,
          `Pickup access: ${access(state.origin)}. Delivery access: ${access(state.destination)}.`,
          state.extras.storageMonths > 0 ? `Storage: ${state.extras.storageMonths} month(s).` : '',
          `Online estimate: ${money(result.total)} (${result.isLocal ? `${result.hours} h, ${result.crewSize} movers` : `${result.weight.toLocaleString('en-CA')} lb, ${distance} km`}).`,
        ].filter(Boolean).join('\n'),
      },
    });
    navigate('/quote?from=calculator');
  };

  const groupCount = (g) => g.items.reduce((n, i) => n + (state.items[i.id] || 0), 0);

  return (
    <div className="calc">
      <div className="calc-main">
        <section className="calc-card" aria-labelledby="calc-route">
          <h3 className="step-legend" id="calc-route"><span>1</span> Where are you moving?</h3>
          <datalist id={listId}>{CITIES.map((c) => <option key={c.label} value={c.label} />)}</datalist>
          <div className="form-grid cols-2">
            <TextField label="Moving from" list={listId} placeholder="e.g. Saskatoon, SK" autoComplete="off" value={state.from}
              onChange={(e) => set({ from: e.target.value, distanceEdited: false })} />
            <TextField label="Moving to" list={listId} placeholder="e.g. Regina, SK" autoComplete="off" value={state.to}
              onChange={(e) => set({ to: e.target.value, distanceEdited: false })} />
          </div>
          <div className="calc-distance">
            <TextField
              label="Driving distance (km)" type="number" inputMode="numeric" min="0" max="10000"
              hint={!state.distanceEdited && autoKm != null ? 'Estimated from the cities — change it if you know the exact distance.' : 'Enter the approximate driving distance between the two addresses.'}
              value={state.distanceEdited ? state.distance : (autoKm ?? '')}
              onChange={(e) => set({ distance: e.target.value, distanceEdited: true })}
            />
            {hasRoute && (
              <p className={`calc-movetype ${result.isLocal ? 'is-local' : 'is-long'}`}>
                <Icon name={result.isLocal ? 'pin' : 'route'} />
                <span><strong>{result.isLocal ? 'Local move' : 'Long-distance move'}</strong>{result.isLocal ? 'Priced by the hour' : 'Priced by shipment weight'}</span>
              </p>
            )}
          </div>
          <TextField className="calc-date" label="Moving date" optional type="date" min={todayIso()} value={state.moveDate} onChange={(e) => set({ moveDate: e.target.value })} />
        </section>

        <section className="calc-card" aria-labelledby="calc-access">
          <h3 className="step-legend" id="calc-access"><span>2</span> Access at each address</h3>
          <div className="calc-access">
            {[['origin', 'Pickup'], ['destination', 'Delivery']].map(([side, label]) => (
              <fieldset key={side} className="calc-access-col">
                <legend>{label}</legend>
                <SelectField label="Floor" placeholder={null} options={FLOOR_OPTIONS} value={state[side].floor} onChange={(e) => setAccess(side, 'floor', e.target.value)} />
                <Checkbox label="Elevator available" checked={state[side].elevator} onChange={(e) => setAccess(side, 'elevator', e.target.checked)} />
                <Checkbox label="Long walk to the truck" checked={state[side].longCarry} onChange={(e) => setAccess(side, 'longCarry', e.target.checked)} />
              </fieldset>
            ))}
          </div>
        </section>

        <section className="calc-card" aria-labelledby="calc-items">
          <h3 className="step-legend" id="calc-items"><span>3</span> What are you moving?</h3>
          <p className="calc-help">Start from a typical home, then adjust the quantities.</p>
          <div className="calc-chips" role="group" aria-label="Typical homes">
            {PROPERTY_SIZES.map((p) => (
              <button key={p.value} type="button" className={`calc-chip${state.preset === p.value ? ' is-active' : ''}`} aria-pressed={state.preset === p.value} onClick={() => applyPreset(p.value)}>{p.label}</button>
            ))}
          </div>
          <div className="calc-groups">
            {ITEM_GROUPS.map((g, gi) => (
              <details key={g.id} className="calc-group" open={gi === 0}>
                <summary>
                  <span className="calc-group-icon"><Icon name={g.icon} /></span>
                  <span className="calc-group-name">{g.label}</span>
                  {groupCount(g) > 0 && <span className="calc-group-count">{groupCount(g)}</span>}
                  <Icon name="chevron-down" className="calc-group-chev" />
                </summary>
                <ul className="calc-items">
                  {g.items.map((item) => {
                    const qty = state.items[item.id] || 0;
                    return (
                      <li key={item.id} className={qty ? 'has-qty' : ''}>
                        <span className="calc-item-name">{item.name}{item.fee ? <small>Special handling</small> : null}</span>
                        <span className="stepper" role="group" aria-label={`${item.name} quantity`}>
                          <button type="button" onClick={() => setQty(item.id, qty - 1)} disabled={!qty} aria-label={`Remove one ${item.name}`}>−</button>
                          <output aria-live="polite">{qty}</output>
                          <button type="button" onClick={() => setQty(item.id, qty + 1)} aria-label={`Add one ${item.name}`}>+</button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>
          <p className="calc-totals">
            <strong>{result.itemCount}</strong> items · about <strong>{result.cuft.toLocaleString('en-CA')}</strong> cu ft · <strong>{result.weight.toLocaleString('en-CA')}</strong> lb
            {result.itemCount > 0 && <button type="button" className="link calc-clear" onClick={() => set({ items: {}, preset: '' })}>Clear all</button>}
          </p>
        </section>

        <section className="calc-card" aria-labelledby="calc-extras">
          <h3 className="step-legend" id="calc-extras"><span>4</span> Extra services <span className="optional">(optional)</span></h3>
          <div className="check-grid">
            <Checkbox label="Packing" description={`We pack your boxes · $${PRICING.extras.packing.materialsPerBox}/box materials`} checked={state.extras.packing} onChange={(e) => setExtra('packing', e.target.checked)} />
            <Checkbox label="Unpacking" description="We unpack at your new home" checked={state.extras.unpacking} onChange={(e) => setExtra('unpacking', e.target.checked)} />
            <Checkbox label="Furniture disassembly & reassembly" description="Beds, tables, desks, wardrobes" checked={state.extras.assembly} onChange={(e) => setExtra('assembly', e.target.checked)} />
            <Checkbox label="Junk removal" description={`From ${money(PRICING.extras.junkRemoval.flat)}`} checked={state.extras.junkRemoval} onChange={(e) => setExtra('junkRemoval', e.target.checked)} />
          </div>
          <div className="calc-storage">
            <span>
              <strong>Storage</strong>
              <small>{money(PRICING.extras.storage.perMonth)} per month</small>
            </span>
            <span className="stepper" role="group" aria-label="Storage months">
              <button type="button" onClick={() => setExtra('storageMonths', Math.max(0, state.extras.storageMonths - 1))} disabled={!state.extras.storageMonths} aria-label="One month less">−</button>
              <output aria-live="polite">{state.extras.storageMonths} mo</output>
              <button type="button" onClick={() => setExtra('storageMonths', Math.min(24, state.extras.storageMonths + 1))} aria-label="One month more">+</button>
            </span>
          </div>
        </section>

        <section className="calc-card" aria-labelledby="calc-crew">
          <h3 className="step-legend" id="calc-crew"><span>5</span> Crew size</h3>
          <div className="calc-crew" role="radiogroup" aria-labelledby="calc-crew">
            {Object.entries(PRICING.crews).map(([n, c]) => {
              const active = result.crewSize === Number(n);
              return (
                <button key={n} type="button" role="radio" aria-checked={active} className={`calc-crew-opt${active ? ' is-active' : ''}`} onClick={() => set({ crew: Number(n) })}>
                  <strong>{n} movers</strong>
                  <span>{money(c.rate)}/hour</span>
                  {Number(n) === result.recommendedCrew && <em>Recommended</em>}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="calc-summary" ref={summaryRef} aria-live="polite" aria-labelledby="calc-summary-title">
        <div className="calc-summary-head">
          <h3 id="calc-summary-title">Your estimate</h3>
          <span>{result.isLocal ? 'Hourly' : 'By weight'}</span>
        </div>
        <div className="calc-summary-body">
          {!ready ? (
            <div className="calc-empty">
              <Icon name="sliders" />
              <p><strong>{!hasRoute ? 'Add your route to see a price.' : 'Add your items to see a price.'}</strong></p>
              <p className="muted small">Choose a typical home size to start in one tap.</p>
            </div>
          ) : (
            <>
              <ul className="calc-facts">
                <li><span>Crew</span><strong>{result.crewSize} movers</strong></li>
                <li><span>{result.isLocal ? 'Estimated time' : 'Load & unload'}</span><strong>{result.hours} h</strong></li>
                <li><span>Distance</span><strong>{distance.toLocaleString('en-CA')} km</strong></li>
                <li><span>Shipment</span><strong>{result.weight.toLocaleString('en-CA')} lb</strong></li>
              </ul>
              <dl className="calc-lines">
                {result.breakdown.map((l) => (
                  <div key={l.key}><dt>{l.label}</dt><dd>{money(l.amount)}</dd></div>
                ))}
                <div><dt>Estimated tax ({Math.round(result.taxRate * 1000) / 10}% GST/HST)</dt><dd>{money(result.tax)}</dd></div>
              </dl>
              <div className="calc-total">
                <span>Estimated total</span>
                <strong>{money(result.total)} <small>CAD</small></strong>
              </div>
            </>
          )}
          <div className="stack-sm">
            <Button block size="lg" iconRight="arrow-right" onClick={requestQuote} disabled={!ready}>Request this quote</Button>
            <Button href={`tel:${COMPANY.phoneTel}`} variant="outline" block icon="phone">Call {COMPANY.phone}</Button>
          </div>
          <p className="disclaimer">An estimate, not a final price. Our team confirms the price after reviewing your inventory, access and date.</p>
        </div>
      </aside>

      {ready && !summaryInView && (
        <div className="calc-bar" aria-hidden="true">
          <span><small>Estimated total</small><strong>{money(result.total)}</strong></span>
          <span className="calc-bar-meta">{result.crewSize} movers · {result.hours} h</span>
          <button type="button" tabIndex={-1} onClick={() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Details</button>
        </div>
      )}
    </div>
  );
}
