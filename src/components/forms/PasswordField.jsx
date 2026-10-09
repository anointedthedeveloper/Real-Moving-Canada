import { useState } from 'react';
import Field from './Field.jsx';

/** Password input with a show/hide toggle. */
export default function PasswordField({ label = 'Password', hint, error, className, value, ...input }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <PasswordControl visible={visible} onToggle={() => setVisible((v) => !v)} value={value} {...input} />
    </Field>
  );
}

function PasswordControl({ visible, onToggle, value, ...props }) {
  return (
    <span className="password-wrap">
      <input className="input" type={visible ? 'text' : 'password'} value={value ?? ''} {...props} />
      <button type="button" className="password-toggle" onClick={onToggle} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </span>
  );
}
