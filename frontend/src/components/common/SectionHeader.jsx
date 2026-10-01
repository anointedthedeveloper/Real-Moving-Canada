import Kicker from './Kicker.jsx';

/** Kicker + heading + intro text, with an optional action aligned to the right on wide screens. */
export default function SectionHeader({ kicker, title, text, action, tone, as: Tag = 'h2', id, className = '' }) {
  return (
    <div className={`section-header ${action ? 'has-action' : ''} ${className}`.trim()}>
      <div>
        {kicker && <Kicker tone={tone === 'dark' ? 'light' : 'red'}>{kicker}</Kicker>}
        <Tag id={id}>{title}</Tag>
        {text && <p className="lead">{text}</p>}
      </div>
      {action && <div className="section-header-action">{action}</div>}
    </div>
  );
}
