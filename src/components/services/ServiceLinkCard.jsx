import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import { serviceLabel } from '../../constants/services.js';

const SIZES = '(max-width: 600px) 100vw, (max-width: 960px) 50vw, 400px';

/** Service tile: photo, icon badge, name, optional summary and an arrow; links to the service's detail page. */
export default function ServiceLinkCard({ service, showSummary = false }) {
  const { image } = service;
  return (
    <Link to={`/services/${service.slug}`} className="service-card">
      {image && (
        <span className="service-card-media">
          <img src={image.src} srcSet={image.srcSet} sizes={SIZES} alt="" width="1200" height="800" loading="lazy" decoding="async" />
        </span>
      )}
      <span className="service-card-main">
        <span className="icon-tile"><Icon name={service.icon} /></span>
        <span className="service-card-body">
          <span className="service-card-title">{serviceLabel(service)}</span>
          {showSummary && <span className="service-card-text">{service.summary}</span>}
        </span>
        <Icon name="chevron-right" className="service-card-arrow" />
      </span>
    </Link>
  );
}
