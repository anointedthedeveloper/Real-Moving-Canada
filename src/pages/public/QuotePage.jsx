import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Notice from '../../components/common/Notice.jsx';
import SuccessPanel from '../../components/common/SuccessPanel.jsx';
import Checkbox from '../../components/forms/Checkbox.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import Honeypot from '../../components/forms/Honeypot.jsx';
import Stepper from '../../components/quote/Stepper.jsx';
import CustomerStep from '../../components/quote/CustomerStep.jsx';
import MoveStep from '../../components/quote/MoveStep.jsx';
import ServicesStep from '../../components/quote/ServicesStep.jsx';
import QuoteSummary from '../../components/quote/QuoteSummary.jsx';
import { QUOTE_STEPS, EMPTY_QUOTE, quoteSchema, STEP_FIELDS, fromEstimateDraft, QUOTE_SERVICES } from '../../components/quote/quoteModel.js';
import { useForm } from '../../hooks/useForm.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { keywordsFor } from '../../constants/seo.js';
import { submitQuoteRequest } from '../../services/formsService.js';
import { local, session, STORAGE_KEYS } from '../../utils/storage.js';
import { formatPlace, fmtDate, firstName } from '../../utils/format.js';
import { labelFor } from '../../constants/options.js';
import { COMPANY } from '../../constants/company.js';

const HEADINGS = [
  ['Let’s start with your details', 'Enter the contact information you want associated with this move request.'],
  ['Tell us about the move', 'Add the route, preferred date, and property information.'],
  ['Choose services and describe items', 'Select any support you need and add details for special handling.'],
  ['Review your move request', 'Check each section and edit anything that needs to change before submitting.'],
];

/** Builds the starting values: saved draft → instant-estimate draft → ?service= preselection. */
function initialQuote(serviceParam) {
  const draft = local.get(STORAGE_KEYS.quoteDraft);
  const base = draft?.values
    ? { ...EMPTY_QUOTE, ...draft.values, confirm: false }
    : { ...EMPTY_QUOTE, ...fromEstimateDraft(session.get(STORAGE_KEYS.estimateDraft)) };
  if (serviceParam && QUOTE_SERVICES.some((s) => s.value === serviceParam) && !base.services.includes(serviceParam)) {
    base.services = [...base.services, serviceParam];
  }
  return { values: base, step: draft?.values ? Math.min(draft.step || 0, 2) : 0, resumed: !!draft?.values };
}

/** Get a Quote / Book a Move — five-step flow from the design. Submits through Formspree. */
export default function QuotePage() {
  useDocumentTitle('Get a Free Moving Quote', 'Get a free moving quote from Real Moving Canada. Tell us your route, date, home size and the services you need — local, long-distance and cross-Canada moves.', {
    keywords: keywordsFor('quote'),
  });
  const [params] = useSearchParams();
  const initial = useMemo(() => initialQuote(params.get('service')), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [step, setStep] = useState(initial.step);
  const [savedNotice, setSavedNotice] = useState(initial.resumed ? 'resumed' : '');
  const [submitted, setSubmitted] = useState(null);
  const topRef = useRef(null);
  const form = useForm({ initialValues: initial.values, schema: quoteSchema });

  // Keep a draft on this device so the visitor can come back later.
  useEffect(() => {
    if (!submitted) local.set(STORAGE_KEYS.quoteDraft, { values: { ...form.values, _gotcha: '' }, step });
  }, [form.values, step, submitted]);

  // Each step behaves like a new page: bring its heading into view and focus it.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    window.scrollTo({ top: 0, behavior: 'instant' });
    topRef.current?.focus({ preventScroll: true });
  }, [step, submitted]);

  const next = form.handleSubmit(() => setStep((s) => s + 1), { paths: STEP_FIELDS[step] });
  const back = () => { form.setFormError(''); setStep((s) => Math.max(0, s - 1)); };

  const submit = form.handleSubmit(async (values) => {
    const { reference } = await submitQuoteRequest(values);
    local.remove(STORAGE_KEYS.quoteDraft);
    session.remove(STORAGE_KEYS.estimateDraft);
    setSubmitted({ ...values, reference });
  }, { paths: STEP_FIELDS[3] });

  const startOver = () => {
    local.remove(STORAGE_KEYS.quoteDraft);
    form.reset(EMPTY_QUOTE);
    setSavedNotice('');
    setStep(0);
  };

  const current = submitted ? 4 : step;

  return (
    <div className="quote-page">
      <div className="wrap">
        <Stepper steps={QUOTE_STEPS} current={current} onSelect={submitted ? null : setStep} />
        <div className="quote-card card" ref={topRef} tabIndex={-1}>
          {submitted ? (
            <Confirmation values={submitted} />
          ) : (
            <form key={step} onSubmit={step === 3 ? submit : next} noValidate>
              <header className="quote-head">
                <h1>{HEADINGS[step][0]}</h1>
                <p className="muted">{HEADINGS[step][1]}</p>
              </header>

              {savedNotice === 'resumed' && step < 3 && (
                <Notice tone="info" className="mb-1" action={<button type="button" className="btn btn-link" onClick={startOver}>Start over</button>}>
                  We restored the details you entered earlier on this device.
                </Notice>
              )}
              {savedNotice === 'saved' && (
                <Notice tone="success" className="mb-1">Your progress is saved on this device. Come back to this page any time to continue.</Notice>
              )}

              {step === 0 && <CustomerStep form={form} />}
              {step === 1 && <MoveStep form={form} />}
              {step === 2 && <ServicesStep form={form} />}
              {step === 3 && (
                <>
                  <QuoteSummary values={form.values} onEdit={setStep} />
                  <Checkbox className="mt-1" label="I confirm that the information above is ready to submit" {...form.checkbox('confirm')} />
                  <p className="small muted mt-05">Submitting sends the move request details shown above to our team. We typically reply within one business day.</p>
                </>
              )}
              <Honeypot {...form.field('_gotcha')} />

              <FormAlert error={form.formError} />
              <div className="quote-actions">
                {step > 0
                  ? <Button variant="outline" icon="arrow-left" onClick={back}>Back</Button>
                  : <button type="button" className="btn btn-link" onClick={() => setSavedNotice('saved')}>Save and continue later</button>}
                <Button type="submit" loading={form.submitting} iconRight="arrow-right">
                  {step === 3 ? (form.submitting ? 'Submitting…' : 'Submit request') : 'Continue'}
                </Button>
              </div>
            </form>
          )}
        </div>
        {!submitted && (
          <p className="quote-help small muted">
            Prefer to talk it through? Call <a className="link" href={`tel:${COMPANY.phoneTel}`}>{COMPANY.phone}</a> or email <a className="link" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
          </p>
        )}
      </div>
    </div>
  );
}

const REPLY_BY = { email: 'email', phone: 'phone', text: 'text message' };

function Confirmation({ values: v }) {
  return (
    <SuccessPanel
      headingAs="h1"
      title="Your move request has been submitted"
      text={`Thanks, ${firstName(v.firstName)}. The details you provided are shown below. A member of our team will review your request and reply by ${REPLY_BY[v.contactMethod] || 'email'}.`}
      actions={<><Button to="/" iconRight="arrow-right">Return home</Button><Button to="/services" variant="outline" iconRight="arrow-right">View services</Button></>}
    >
      <dl className="summary-section submitted">
        <header><h3>Submitted details</h3></header>
        {v.reference && <div className="summary-row"><dt>Reference</dt><dd><strong>{v.reference}</strong></dd></div>}
        <div className="summary-row"><dt>Customer</dt><dd>{`${v.firstName} ${v.lastName}`}</dd></div>
        <div className="summary-row"><dt>Route</dt><dd>{formatPlace(v.origin)} → {formatPlace(v.destination)}</dd></div>
        <div className="summary-row"><dt>Move date</dt><dd>{fmtDate(v.moveDate)}</dd></div>
        <div className="summary-row"><dt>Services</dt><dd>{v.services.map((s) => labelFor(QUOTE_SERVICES, s)).join(', ') || '—'}</dd></div>
      </dl>
      {v.createAccount && (
        <Notice tone="info" className="mt-1">We’ll email {v.email} a link to finish setting up your account so you can follow this move online.</Notice>
      )}
    </SuccessPanel>
  );
}
