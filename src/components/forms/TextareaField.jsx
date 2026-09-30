import Field from './Field.jsx';

export default function TextareaField({ label, hint, error, optional, className, rows = 4, value, ...input }) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea className="input" rows={rows} value={value ?? ''} {...input} />
    </Field>
  );
}
