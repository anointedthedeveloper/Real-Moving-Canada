import { Navigate, useParams } from 'react-router-dom';
import PageHero from '../../components/common/PageHero.jsx';
import SectionHeader from '../../components/common/SectionHeader.jsx';
import Kicker from '../../components/common/Kicker.jsx';
import Button from '../../components/common/Button.jsx';
import Icon from '../../components/common/Icon.jsx';
import ServiceGrid from '../../components/services/ServiceGrid.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import { SERVICE_BY_SLUG, LEGACY_SERVICE_REDIRECTS } from '../../constants/services.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { keywordsFor, serviceJsonLd, breadcrumbJsonLd, SITE_URL } from '../../constants/seo.js';

/** One reusable template for every service (design: "Service Detail · Reusable template"). */
export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const service = SERVICE_BY_SLUG[serviceId];
  const pageTitle = service ? `${service.title[0].toUpperCase()}${service.title.slice(1)} in Saskatoon & Across Canada` : 'Service not found';
  useDocumentTitle(pageTitle, service && `${service.summary} Real Moving Canada — ${service.title} in Saskatoon, Saskatchewan and across Canada. Get a free quote.`, {
    keywords: service && keywordsFor('services', [`${service.title} Canada`, `${service.title} Saskatoon`, `${service.name.toLowerCase()} movers`, ...service.idealFor]),
    jsonLd: service && [serviceJsonLd(service), breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, { name: service.name, path: `/services/${service.slug}` }])],
    image: service?.image ? new URL(service.image.src, SITE_URL).href : undefined,
  });

  if (!service) {
    const moved = LEGACY_SERVICE_REDIRECTS[serviceId];
    return moved ? <Navigate to={`/services/${moved}`} replace /> : <NotFoundPage />;
  }

  const related = service.related.map((slug) => SERVICE_BY_SLUG[slug]).filter(Boolean);
  const quoteLink = `/quote?service=${service.quoteValue}`;

  return (
    <>
      <PageHero kicker={service.title} title={service.headline} text={service.intro} image={service.image} imageAlt={service.imageAlt} />
      <section className="section" aria-labelledby="overview-title">
        <div className="wrap detail-grid">
          <div>
            <Kicker>Service overview</Kicker>
            <h2 id="overview-title">Tell us what your move includes</h2>
            {service.description.map((p) => <p key={p} className="lead">{p}</p>)}
            <ul className="tick-list tick-boxes">
              {service.includes.map((item) => <li key={item}><Icon name="check" />{item}</li>)}
            </ul>
            <h3 className="mt-2">Ideal for</h3>
            <ul className="pill-list">{service.idealFor.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
          <aside className="card card-pad detail-aside">
            <h3>Start your {service.title.toLowerCase()} quote</h3>
            <p className="muted">You can review and edit your details before submitting.</p>
            <div className="stack-sm">
              <Button to={quoteLink} block iconRight="arrow-right">Get a quote</Button>
              <Button to="/services" variant="outline" block iconRight="arrow-right">View all services</Button>
            </div>
          </aside>
        </div>
      </section>
      <section className="section tint" aria-labelledby="related-title">
        <div className="wrap">
          <SectionHeader id="related-title" kicker="Related support" title="Add help where you need it" />
          <ServiceGrid services={related} swipe />
        </div>
      </section>
    </>
  );
}
