/**
 * Status pill with a leading dot. Tones: info (blue), neutral (grey), success (green),
 * warning (amber) and danger (red) — matching the portal design.
 */
const TONE_BY_STATUS = {
  upcoming: 'info', 'in review': 'info', review: 'warning', processing: 'info', 'in transit': 'info',
  current: 'neutral', draft: 'neutral', archived: 'neutral', pending: 'warning', 'action needed': 'warning', ready: 'warning',
  complete: 'success', completed: 'success', confirmed: 'success', paid: 'success', accepted: 'success',
  failed: 'danger', cancelled: 'danger', declined: 'danger', overdue: 'danger',
};

export const toneFor = (status) => TONE_BY_STATUS[String(status || '').toLowerCase()] || 'neutral';

export default function Badge({ children, tone, dot = true, className = '' }) {
  const t = tone || toneFor(children);
  return <span className={`badge badge-${t} ${dot ? 'has-dot' : ''} ${className}`.trim()}>{children}</span>;
}
