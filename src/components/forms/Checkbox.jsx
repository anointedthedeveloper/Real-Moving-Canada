import { useId } from 'react';
import Icon from '../common/Icon.jsx';

/** Checkbox with the design's red check square. */
export default function Checkbox({ label, description, error, className = '', ...input }) {
  const id = `c${useId().replace(/:/g, '')}`;
  return (
    <div className={`check-field ${error ? 'has-error' : ''} ${className}`.trim()}>
      <label className="check" htmlFor={id}>
        <input type="checkbox" id={id} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-err` : undefined} {...input} />
        <span className="check-box" aria-hidden="true"><Icon name="check" /></span>
        <span className="check-label">
          {label}
          {description && <small>{description}</small>}
        </span>
      </label>
      {error && <p className="field-error" id={`${id}-err`}>{error}</p>}
    </div>
  );
}
