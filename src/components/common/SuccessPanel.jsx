import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

/** Confirmation panel with a green check; takes focus so screen readers announce it. */
export default function SuccessPanel({ headingAs: Heading = 'h2', title, text, children, actions, className = '', tone = 'success', icon }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus({ preventScroll: false }); }, []);
  return (
    <div className={`success-panel ${className}`.trim()} tabIndex={-1} ref={ref} role="status">
      <span className={`status-mark status-${tone}`}><Icon name={icon || (tone === 'danger' ? 'x' : 'check')} /></span>
      <Heading className="success-title">{title}</Heading>
      {text && <p className="lead">{text}</p>}
      {children}
      {actions && <div className="actions center">{actions}</div>}
    </div>
  );
}
