import Icon from './Icon.jsx';

/** Friendly placeholder for lists with nothing in them yet (dashed card from the design). */
export default function EmptyState({ icon = 'box', title, text, action, dashed = true, className = '' }) {
  return (
    <div className={`empty-state ${dashed ? 'is-dashed' : ''} ${className}`.trim()}>
      <span className="empty-icon"><Icon name={icon} /></span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
