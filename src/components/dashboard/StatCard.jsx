import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import Badge from '../common/Badge.jsx';

/** Summary tile on the overview (Upcoming move / Quote / Booking / Payment status). */
export default function StatCard({ icon, label, value, meta, status, to }) {
  const body = (
    <>
      <div className="stat-top">
        <span className="icon-tile"><Icon name={icon} /></span>
        {status && <Badge>{status}</Badge>}
      </div>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
      {meta && <p className="stat-meta">{meta}</p>}
    </>
  );
  return to ? <Link to={to} className="stat-card">{body}</Link> : <div className="stat-card">{body}</div>;
}
