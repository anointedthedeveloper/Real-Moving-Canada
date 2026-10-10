import TextField from '../forms/TextField.jsx';
import SelectField from '../forms/SelectField.jsx';
import Checkbox from '../forms/Checkbox.jsx';
import { CONTACT_METHODS } from '../../constants/options.js';

export default function CustomerStep({ form }) {
  return (
    <>
      <div className="form-grid cols-2">
        <TextField label="First name" autoComplete="given-name" maxLength={60} {...form.field('firstName')} />
        <TextField label="Last name" autoComplete="family-name" maxLength={60} {...form.field('lastName')} />
        <TextField label="Email" type="email" autoComplete="email" maxLength={254} {...form.field('email')} />
        <TextField label="Phone" type="tel" autoComplete="tel" maxLength={30} {...form.field('phone')} />
        <SelectField className="span-2" label="Preferred contact method" options={CONTACT_METHODS} {...form.field('contactMethod')} />
      </div>
      <Checkbox
        className="mt-1" label="Create an account to keep these details together"
        description="We’ll email you a link to set up your account and follow this move online."
        {...form.checkbox('createAccount')}
      />
    </>
  );
}
