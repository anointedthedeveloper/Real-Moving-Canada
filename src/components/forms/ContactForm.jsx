import TextField from './TextField.jsx';
import SelectField from './SelectField.jsx';
import TextareaField from './TextareaField.jsx';
import FormAlert from './FormAlert.jsx';
import Honeypot from './Honeypot.jsx';
import Button from '../common/Button.jsx';
import SuccessPanel from '../common/SuccessPanel.jsx';
import { useForm } from '../../hooks/useForm.js';
import { submitContactMessage } from '../../services/formsService.js';
import { CONTACT_TOPICS } from '../../constants/options.js';
import { required, email, phone, maxLength } from '../../utils/validation.js';
import { firstName } from '../../utils/format.js';

const schema = {
  firstName: required('Enter your first name.'),
  lastName: required('Enter your last name.'),
  email: [required('Enter your email address.'), email()],
  phone: phone(),
  topic: required('Choose a topic.'),
  message: [required('Enter a message.'), maxLength(5000)],
};

/** "Send a message" card from the Contact design; submits through Formspree like the original site. */
export default function ContactForm() {
  const form = useForm({
    initialValues: { firstName: '', lastName: '', email: '', phone: '', topic: '', message: '', _gotcha: '' },
    schema,
  });

  if (form.status === 'success') {
    return (
      <SuccessPanel
        className="card card-pad"
        title="Message sent"
        text={`Thanks, ${firstName(form.values.firstName)} — we’ve received your message and will reply to ${form.values.email} shortly.`}
        actions={<Button variant="outline" onClick={() => form.reset()}>Send another message</Button>}
      />
    );
  }

  return (
    <form className="card card-pad" onSubmit={form.handleSubmit(submitContactMessage)} noValidate aria-labelledby="send-title">
      <h2 id="send-title" className="card-title">Send a message</h2>
      <div className="form-grid cols-2">
        <TextField label="First name" autoComplete="given-name" maxLength={60} {...form.field('firstName')} />
        <TextField label="Last name" autoComplete="family-name" maxLength={60} {...form.field('lastName')} />
        <TextField label="Email" type="email" autoComplete="email" maxLength={254} {...form.field('email')} />
        <TextField label="Phone" type="tel" optional autoComplete="tel" maxLength={30} {...form.field('phone')} />
        <SelectField className="span-2" label="Topic" options={CONTACT_TOPICS} placeholder="Select a topic" {...form.field('topic')} />
        <TextareaField className="span-2" label="Message" rows={5} maxLength={5000} placeholder="How can we help?" {...form.field('message')} />
      </div>
      <Honeypot {...form.field('_gotcha')} />
      <FormAlert error={form.formError} />
      <div className="form-actions">
        <Button type="submit" loading={form.submitting} iconRight="arrow-right">{form.submitting ? 'Sending…' : 'Send message'}</Button>
        <span className="small muted">We use your details only to respond to your message.</span>
      </div>
    </form>
  );
}
