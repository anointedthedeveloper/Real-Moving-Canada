import Field from './Field.jsx';

/** Text-like input (text, email, tel, date, password, number…) with label and validation state. */
export default function TextField({ label, hint, error, optional, className, type = 'text', value, ...input }) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={className}>
      <input className="input" type={type} value={value ?? ''} {...input} />
    </Field>
  );
}
