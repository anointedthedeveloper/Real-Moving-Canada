import PageHero from '../../components/common/PageHero.jsx';
import SectionHeader from '../../components/common/SectionHeader.jsx';
import CtaBand from '../../components/layout/CtaBand.jsx';
import ServiceGrid from '../../components/services/ServiceGrid.jsx';
import { SERVICES } from '../../constants/services.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { keywordsFor, breadcrumbJsonLd } from '../../constants/seo.js';
import heroImage from '../../assets/images/crew-truck-loading.webp';

export default function ServicesPage() {
  useDocumentTitle('Moving Services in Canada — Residential, Commercial & Long-Distance', 'Moving services across Canada: residential and office moves, local and long-distance moving, packing, loading, furniture and appliance moving, storage, junk removal and cleanouts.', {
    keywords: keywordsFor('services', SERVICES.map((s) => `${s.title} Canada`)),
    jsonLd: breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]),
  });
  return (
    <>
      <PageHero
        kicker="Services" title="The right support for your move"
        text="Explore residential, commercial, packing, storage, cleanout, and specialty moving services."
        image={heroImage} imageAlt="Movers loading wrapped furniture into a moving truck"
      />
      <section className="section" aria-labelledby="all-services">
        <div className="wrap">
          <SectionHeader id="all-services" kicker="What we move" title="Services built around the details" text="Select individual services or combine them in your quote request." />
          <ServiceGrid services={SERVICES} showSummary />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
