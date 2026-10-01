import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../common/Button.jsx';
import Icon from '../common/Icon.jsx';
import TextField from '../forms/TextField.jsx';
import SelectField from '../forms/SelectField.jsx';
import TextareaField from '../forms/TextareaField.jsx';
import Checkbox from '../forms/Checkbox.jsx';
import FormAlert from '../forms/FormAlert.jsx';
import { useForm } from '../../hooks/useForm.js';
import { requestEstimate, ESTIMATE_DISCLAIMER } from '../../services/estimateService.js';
import { ESTIMATE_MOVE_TYPES, ESTIMATE_SERVICES, PROPERTY_SIZES, PROVINCE_OPTIONS, INTERNATIONAL } from '../../constants/options.js';
import { money, todayIso } from '../../utils/format.js';
import { required, notBefore } from '../../utils/validation.js';
import { session, STORAGE_KEYS } from '../../utils/storage.js';

const EMPTY = {
  origin: { province: '', city: '' },
  destination: { province: '', city: '' },
  moveType: 'residential',
  propertySize: '',
  moveDate: '',
  services: [],
  details: '',
};

const schema = {
  'origin.province': required('Choose where you’re moving from.'),
  'origin.city': required('Enter a city.'),
  'destination.province': required('Choose where you’re moving to.'),
  'destination.city': required('Enter a city.'),
  propertySize: required('Choose a property size.'),
  moveDate: [required('Choose a moving date.'), notBefore(todayIso())],
};

/** Applies a route from the homepage ticket (?from=SK&to=AB&size=two_bed) over any saved draft. */
function withRoute(values, params) {
  const from = params.get('from');
  const to = params.get('to');
  const size = params.get('size');
  if (!from && !to && !size) return values;
  return {
    ...values,
    origin: from ? { province: from, city: values.origin.province === from ? values.origin.city : '' } : values.origin,
    destination: to ? { province: to, city: values.destination.province === to ? values.destination.city : '' } : values.destination,
    propertySize: size || values.propertySize,
  };
}

/**
 * Instant estimate (from the original /pricing page). The price range is
 * calculated server-side; when that service isn't reachable the result panel
 * says so and offers a quote request instead of showing a made-up number.
 */
export default function EstimateCalculator() {
  const [params] = useSearchParams();
  const saved = session.get(STORAGE_KEYS.estimateDraft);
  const form = useForm({ initialValues: withRoute({ ...EMPTY, ...saved }, params), schema });
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  // An international origin/destination makes the move international (as before).
  const intl = [form.values.origin.province, form.values.destination.province].includes(INTERNATIONAL);
  useEffect(() => {
    if (intl && form.values.moveType !== 'international') form.setValue('moveType', 'international');
    if (!intl && form.values.moveType === 'international') form.setValue('moveType', 'residential');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intl]);

  const onSubmit = form.handleSubmit(async (values) => {
    session.set(STORAGE_KEYS.estimateDraft, values);
    const res = await requestEstimate(values);
    setResult(res);
    if (window.innerWidth < 960) requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  });

  return (
    <div className="estimate">
      <form className="card card-pad estimate-form" onSubmit={onSubmit} noValidate>
        <fieldset>
          <legend className="step-legend"><span>1</span> Moving from</legend>
          <div className="form-grid cols-2">
            <SelectField label="Province or territory" options={PROVINCE_OPTIONS} placeholder="Select…" {...form.field('origin.province')} />
            <TextField label="City" {...form.field('origin.city')} maxLength={80} />
          </div>
        </fieldset>
        <fieldset>
          <legend className="step-legend"><span>2</span> Moving to</legend>
          <div className="form-grid cols-2">
            <SelectField label="Province or territory" options={PROVINCE_OPTIONS} placeholder="Select…" {...form.field('destination.province')} />
            <TextField label="City" {...form.field('destination.city')} maxLength={80} />
          </div>
        </fieldset>
        <fieldset>
          <legend className="step-legend"><span>3</span> Your move</legend>
          <div className="form-grid cols-3">
            <SelectField label="Move type" options={ESTIMATE_MOVE_TYPES} placeholder={null} {...form.field('moveType')} />
            <SelectField label="Property size" options={PROPERTY_SIZES} placeholder="Select…" {...form.field('propertySize')} />
            <TextField label="Moving date" type="date" min={todayIso()} {...form.field('moveDate')} />
          </div>
        </fieldset>
        <fieldset>
          <legend className="step-legend"><span>4</span> Services you need <span className="optional">(optional)</span></legend>
          <div className="check-grid">
            {ESTIMATE_SERVICES.map((s) => (
              <Checkbox key={s.value} label={s.label} checked={form.values.services.includes(s.value)} onChange={() => form.toggle('services', s.value)} />
            ))}
          </div>
          <TextareaField className="mt-1" label="Additional information" optional rows={3} maxLength={2000} placeholder="Stairs or elevators, large or fragile items, parking, anything we should know" {...form.field('details')} />
        </fieldset>
        <FormAlert error={form.formError} />
        <div className="form-actions">
          <Button type="submit" size="lg" loading={form.submitting}>Calculate my estimate</Button>
          <span className="small muted">Free, instant, no account needed.</span>
        </div>
      </form>

      <aside className="estimate-result card" aria-live="polite" ref={resultRef}>
        <div className="estimate-result-head">
          <h3>Your estimate</h3>
          <span className="badge badge-neutral"><Icon name="clock" /> Instant</span>
        </div>
        <div className="estimate-result-body">
          {!result && (
            <>
              <p><strong>Fill in your move details to see a price range.</strong></p>
              <p className="muted">Your estimate takes into account:</p>
              <ul className="tick-list">
                <li><Icon name="check" />Distance between your locations</li>
                <li><Icon name="check" />Property size and move type</li>
                <li><Icon name="check" />Moving date and season</li>
                <li><Icon name="check" />Packing, storage and other services</li>
              </ul>
              <p className="disclaimer">{ESTIMATE_DISCLAIMER}</p>
            </>
          )}
          {result?.unavailable && (
            <>
              <p><strong>We can’t calculate an instant price right now.</strong></p>
              <p className="muted">Request a free quote instead — a member of our team will review your move details and follow up with a price.</p>
              <Button to="/quote" block iconRight="arrow-right">Get a quote</Button>
            </>
          )}
          {result?.estimate && (
            <>
              <p className="estimate-label">Estimated moving cost</p>
              <p className="estimate-price">{money(result.estimate.min)} – {money(result.estimate.max)} <small>CAD</small></p>
              {!!result.estimate.factors?.length && (
                <ul className="tick-list">{result.estimate.factors.map((f) => <li key={f}><Icon name="check" />{f}</li>)}</ul>
              )}
              {!!result.estimate.notes?.length && <p className="muted small">{result.estimate.notes.join(' ')}</p>}
              <p className="disclaimer">{result.disclaimer}</p>
              <div className="stack-sm">
                <Button to="/quote" block>Get a quote</Button>
                <Button to="/contact" variant="outline" block>Ask a question</Button>
              </div>
            </>
          )}
          {!result && <p className="small muted">Prefer to talk it through? <Link className="link" to="/contact">Contact us</Link>.</p>}
        </div>
      </aside>
    </div>
  );
}
