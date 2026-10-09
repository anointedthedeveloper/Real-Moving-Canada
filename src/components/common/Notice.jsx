import Icon from './Icon.jsx';

const ICON = { info: 'info', error: 'alert', success: 'check', warning: 'alert' };

/** Inline message box. Errors are announced to screen readers. */
export default function Notice({ tone = 'info', title, children, className = '', action }) {
  if (!title && !children) return null;
  return (
    <div className={`notice notice-${tone} ${className}`.trim()} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={ICON[tone]} />
      <div className="notice-body">
        {title && <strong>{title}</strong>}
        {children && <div>{children}</div>}
      </div>
      {action && <div className="notice-action">{action}</div>}
    </div>
  );
}
