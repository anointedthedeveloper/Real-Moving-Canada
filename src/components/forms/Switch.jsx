import { useId } from 'react';

/** On/off toggle (role="switch") used for notification preferences. */
export default function Switch({ label, description, checked, onChange, disabled }) {
  const id = `s${useId().replace(/:/g, '')}`;
  return (
    <div className="switch-row">
      <div>
        <label htmlFor={id} className="switch-label">{label}</label>
        {description && <p className="switch-desc" id={`${id}-d`}>{description}</p>}
      </div>
      <button
        type="button" id={id} role="switch" aria-checked={checked} disabled={disabled}
        aria-describedby={description ? `${id}-d` : undefined}
        className="switch" onClick={() => onChange(!checked)}
      >
        <span className="switch-thumb" />
      </button>
    </div>
  );
}
