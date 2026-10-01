import HomeHero from '../../components/home/HomeHero.jsx';
import WhyChoose from '../../components/home/WhyChoose.jsx';
import ProcessSteps from '../../components/home/ProcessSteps.jsx';
import ServiceAreasPanel from '../../components/home/ServiceAreasPanel.jsx';
import HomeFaq from '../../components/home/HomeFaq.jsx';
import SectionHeader from '../../components/common/SectionHeader.jsx';
import Button from '../../components/common/Button.jsx';
import ServiceGrid from '../../components/services/ServiceGrid.jsx';
import { SERVICE_BY_SLUG, FEATURED_SERVICE_SLUGS } from '../../constants/services.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { keywordsFor, businessJsonLd, faqJsonLd } from '../../constants/seo.js';
import { HOME_FAQ } from '../../components/home/HomeFaq.jsx';

const featured = FEATURED_SERVICE_SLUGS.map((slug) => SERVICE_BY_SLUG[slug]);

export default function HomePage() {
  useDocumentTitle(null, 'Real Moving Canada is a Saskatoon moving company for local and long-distance moves across Canada — residential, commercial, packing, storage, cleanouts and heavy items. Get a free moving quote.', {
    keywords: keywordsFor('home'),
    jsonLd: [businessJsonLd(), faqJsonLd(HOME_FAQ)],
  });
  return (
    <>
      <HomeHero />
      <section className="section" aria-labelledby="help-title">
        <div className="wrap">
          <SectionHeader
            id="help-title" kicker="How we can help" title="Moving support for every stage"
            text="Choose the services you need, from careful packing and loading to storage, cleanouts, and oversized-item support."
            action={<Button to="/services" variant="dark" iconRight="arrow-right">View all services</Button>}
          />
          <ServiceGrid services={featured} />
        </div>
      </section>
      <WhyChoose />
      <ProcessSteps />
      <ServiceAreasPanel />
      <HomeFaq />
    </>
  );
}
