import { useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Icon from '../../components/common/Icon.jsx';
import Notice from '../../components/common/Notice.jsx';
import SuccessPanel from '../../components/common/SuccessPanel.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import TextField from '../../components/forms/TextField.jsx';
import Checkbox from '../../components/forms/Checkbox.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import PageIntro from '../../components/dashboard/PageIntro.jsx';
import Panel from '../../components/dashboard/Panel.jsx';
import DetailRows from '../../components/dashboard/DetailRows.jsx';
import { useForm } from '../../hooks/useForm.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { payBooking } from '../../services/paymentService.js';
import { required } from '../../utils/validation.js';
import { money } from '../../utils/format.js';
import { COMPANY } from '../../constants/company.js';

const digits = (v) => String(v || '').replace(/\D/g, '');
const luhn = (num) => {
  let sum = 0;
  [...num].reverse().forEach((d, i) => { let n = Number(d); if (i % 2) { n *= 2; if (n > 9) n -= 9; } sum += n; });
  return num.length >= 12 && sum % 10 === 0;
};
const schema = {
  name: required('Enter the name on the card.'),
  card: [required('Enter the card number.'), (v) => (luhn(digits(v)) ? '' : 'Check the card number.')],
  expiry: [required('Enter the expiry date.'), (v) => (/^(0[1-9]|1[0-2])\/\d{2}$/.test(v) ? '' : 'Use MM/YY.')],
  cvc: [required('Enter the security code.'), (v) => (/^\d{3,4}$/.test(v) ? '' : 'Enter 3 or 4 digits.')],
};

/** Provider-neutral payment form with processing, success and failure states (design: Payment States). */
export default function MakePaymentPage() {
  useDocumentTitle('Make a payment', undefined, { noindex: true });
  const [params] = useSearchParams();
  const bookingId = params.get('booking');
  const amount = null; // Filled from the booking once the portal API is connected.
  const form = useForm({ initialValues: { name: '', card: '', expiry: '', cvc: '', postal: '', save: false }, schema });

  const submit = form.handleSubmit(({ name, card, expiry, cvc, postal, save }) =>
    payBooking({ bookingId, amount, card: { name, number: digits(card), expiry, cvc, postal }, saveMethod: save }));

  if (form.submitting) {
    return (
      <Panel className="state-panel">
        <div className="state-center" role="status" aria-live="polite">
          <span className="status-mark status-info"><Spinner size={22} /></span>
          <h2>Processing your payment</h2>
          <p className="muted">Please keep this page open while the payment is processed. This may take a moment.</p>
          <div className="progress-bar" aria-hidden="true"><span /></div>
        </div>
      </Panel>
    );
  }
  if (form.status === 'success') {
    return (
      <SuccessPanel className="panel state-panel" title="Payment successful" text="Your payment was completed and a receipt is available in your account."
        actions={<><Button to="/dashboard/payments" icon="download">View receipts</Button><Button to="/dashboard/payments" variant="outline">Return to payments</Button></>} />
    );
  }
  if (form.status === 'error') {
    return (
      <SuccessPanel className="panel state-panel" tone="danger" title="Payment couldn’t be completed"
        text="No payment was recorded. Review the payment details or choose another payment method and try again."
        actions={<><Button onClick={() => { form.setStatus('idle'); form.setFormError(''); }}>Try again</Button><Button href={`tel:${COMPANY.phoneTel}`} variant="outline" icon="phone">Call us</Button><Button to="/dashboard/payments" variant="ghost">Return to payments</Button></>}>
        <Notice tone="error" title="Payment not completed">{form.formError}</Notice>
      </SuccessPanel>
    );
  }

  return (
    <>
      <PageIntro title="Make a payment" text="Use the form below to pay the selected booking balance." />
      <div className="payment-grid">
        <Panel dark className="amount-due">
          <p className="kicker kicker-plain">Payment summary</p>
          <p className="small">Amount due</p>
          <p className="amount">{amount ? money(amount) : '—'}</p>
          <DetailRows rows={[['Booking', bookingId || '—'], ['Due date', '—']]} />
          <p className="small">The final amount and payment reference are shown before submission.</p>
        </Panel>
        <Panel title="Payment details" subtitle="All fields are required unless marked optional." badge={<span className="secure"><Icon name="lock" /> Secure payment</span>}>
          <form onSubmit={submit} noValidate>
            <div className="form-grid cols-3">
              <TextField className="span-all" label="Name on payment method" autoComplete="cc-name" {...form.field('name')} />
              <TextField className="span-all" label="Card number" inputMode="numeric" autoComplete="cc-number" maxLength={23} placeholder="1234 1234 1234 1234" {...form.field('card')} />
              <TextField label="Expiry date" inputMode="numeric" autoComplete="cc-exp" maxLength={5} placeholder="MM/YY" {...form.field('expiry')} />
              <TextField label="Security code" inputMode="numeric" autoComplete="cc-csc" maxLength={4} {...form.field('cvc')} />
              <TextField label="Postal code" optional autoComplete="postal-code" maxLength={10} {...form.field('postal')} />
            </div>
            <Checkbox className="mt-1" label="Save this payment method for future use" {...form.checkbox('save')} />
            <div className="pay-total"><DetailRows rows={[['Payment amount', amount ? money(amount) : '—'], ['Total', amount ? money(amount) : '—']]} /></div>
            <FormAlert error={form.formError} />
            <div className="actions">
              <Button type="submit">Pay {amount ? money(amount) : 'now'}</Button>
              <Button to="/dashboard/payments" variant="outline">Cancel</Button>
            </div>
            <p className="small muted mt-05">By submitting, you confirm the payment details and amount shown above.</p>
          </form>
        </Panel>
      </div>
    </>
  );
}
