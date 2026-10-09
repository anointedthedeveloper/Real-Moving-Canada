import ServiceLinkCard from './ServiceLinkCard.jsx';

export default function ServiceGrid({ services, showSummary, columns = 3 }) {
  return (
    <ul className={`service-grid cols-${columns}`}>
      {services.map((s) => <li key={s.slug}><ServiceLinkCard service={s} showSummary={showSummary} /></li>)}
    </ul>
  );
}
