import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import { serviceLabel } from '../../constants/services.js';

/** Service tile from the design: icon, name and an arrow; links to the service's detail page. */
export default function ServiceLinkCard({ service, showSummary = false }) {
  return (
    <Link to={`/services/${service.slug}`} className="service-card">
      <span className="icon-tile"><Icon name={service.icon} /></span>
      <span className="service-card-body">
        <span className="service-card-title">{serviceLabel(service)}</span>
        {showSummary && <span className="service-card-text">{service.summary}</span>}
      </span>
      <Icon name="chevron-right" className="service-card-arrow" />
    </Link>
  );
}
