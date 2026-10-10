import ServiceLinkCard from './ServiceLinkCard.jsx';

/** Grid of service cards. `swipe` turns it into a horizontal, swipeable row on phones. */
export default function ServiceGrid({ services, showSummary, columns = 3, swipe = false }) {
  return (
    <ul className={`service-grid cols-${columns}${swipe ? ' is-swipe' : ''}`}>
      {services.map((s) => <li key={s.slug}><ServiceLinkCard service={s} showSummary={showSummary} /></li>)}
    </ul>
  );
}
