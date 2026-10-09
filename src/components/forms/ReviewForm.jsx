import TextField from './TextField.jsx';
import TextareaField from './TextareaField.jsx';
import FormAlert from './FormAlert.jsx';
import Honeypot from './Honeypot.jsx';
import Button from '../common/Button.jsx';
import Icon from '../common/Icon.jsx';
import SuccessPanel from '../common/SuccessPanel.jsx';
import { useForm } from '../../hooks/useForm.js';
import { submitReview } from '../../services/formsService.js';
import { required, email, minLength, maxLength } from '../../utils/validation.js';
import { firstName } from '../../utils/format.js';

const schema = {
  name: required('Enter your name.'),
  email: [required('Enter your email address.'), email()],
  rating: required('Please choose a rating.'),
  body: [required('Tell us about your move.'), minLength(20), maxLength(2000)],
};

export default function ReviewForm() {
  const form = useForm({ initialValues: { name: '', email: '', rating: '', title: '', body: '', _gotcha: '' }, schema });

  if (form.status === 'success') {
    return <SuccessPanel className="card card-pad" title={`Thank you, ${firstName(form.values.name)}!`} text="We’ve received your review and will publish it after our team reads it." />;
  }

  return (
    <form className="card card-pad" onSubmit={form.handleSubmit(submitReview)} noValidate>
      <div className="form-grid cols-2">
        <TextField label="Your name" autoComplete="name" maxLength={100} {...form.field('name')} />
        <TextField label="Email" type="email" autoComplete="email" maxLength={254} {...form.field('email')} />
      </div>
      <fieldset className={`field mt-1 ${form.errors.rating ? 'has-error' : ''}`} data-field="rating">
        <legend className="field-label">Your rating</legend>
        <div className="stars-input">
          {[5, 4, 3, 2, 1].map((n) => (
            <label key={n} title={`${n} star${n > 1 ? 's' : ''}`}>
              <input type="radio" name="rating" value={n} checked={Number(form.values.rating) === n} onChange={() => form.setValue('rating', n)} />
              <Icon name="star" />
              <span className="sr-only">{n} star{n > 1 ? 's' : ''}</span>
            </label>
          ))}
        </div>
        {form.errors.rating && <p className="field-error">{form.errors.rating}</p>}
      </fieldset>
      <TextField className="mt-1" label="Title" optional maxLength={100} {...form.field('title')} />
      <TextareaField className="mt-1" label="Your review" rows={5} maxLength={2000} hint="Between 20 and 2,000 characters. Reviews are published after our team reads them." placeholder="Tell others about your move — what went well, and what could be better." {...form.field('body')} />
      <Honeypot {...form.field('_gotcha')} />
      <FormAlert error={form.formError} />
      <div className="form-actions">
        <Button type="submit" loading={form.submitting}>Submit review</Button>
      </div>
    </form>
  );
}
