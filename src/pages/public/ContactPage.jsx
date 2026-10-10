import PageHero from '../../components/common/PageHero.jsx';
import Kicker from '../../components/common/Kicker.jsx';
import SectionHeader from '../../components/common/SectionHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Icon from '../../components/common/Icon.jsx';
import ContactForm from '../../components/forms/ContactForm.jsx';
import { COMPANY, MAP_EMBED_URL, MAP_DIRECTIONS_URL } from '../../constants/company.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { keywordsFor, businessJsonLd } from '../../constants/seo.js';
import truckBanner from '../../assets/images/truck-banner.webp';

export default function ContactPage() {
  useDocumentTitle('Contact Our Movers — Saskatoon, Saskatchewan', `Contact Real Moving Canada: call ${COMPANY.phone}, email ${COMPANY.email}, or visit ${COMPANY.address.street}, Saskatoon. Ask about your move or start a free moving quote.`, {
    keywords: keywordsFor('contact'),
    jsonLd: businessJsonLd(),
  });
  const { address } = COMPANY;
  return (
    <>
      <PageHero
        variant="banner"
        kicker="Contact" title="Let’s talk about your move"
        text={`${COMPANY.motto}. Call ${COMPANY.phone} or ${COMPANY.phone2}, send a message, or start a quote.`}
        image={truckBanner} imageAlt="Real Moving Canada truck with the RMC livery, movers and moving supplies"
        actions={<><Button to="/quote" variant="light" icon="mail">Get a Free Quote</Button><Button href={`tel:${COMPANY.phoneTel}`} variant="ghost-light" icon="phone">Call now</Button></>}
      />
      <section className="section" aria-labelledby="reach-title">
        <div className="wrap contact-grid">
          <div>
            <Kicker>Reach us</Kicker>
            <h2 id="reach-title">Contact information</h2>
            <p className="lead">Questions about a move or a quote? Call, email, or send a message and our team will get back to you.</p>
            <ul className="contact-list">
              <li><span className="icon-tile"><Icon name="phone" /></span><div><small>Call today</small><a href={`tel:${COMPANY.phoneTel}`}>{COMPANY.phone}</a><a href={`tel:${COMPANY.phone2Tel}`}>{COMPANY.phone2}</a></div></li>
              <li><span className="icon-tile"><Icon name="mail" /></span><div><small>Email</small><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></div></li>
              <li><span className="icon-tile"><Icon name="pin" /></span><div><small>Business address</small><span>{address.street}<br />{address.city}, {address.province} {address.postal}</span></div></li>
              <li><span className="icon-tile"><Icon name="map" /></span><div><small>Service area</small><span>Residential, commercial and long-distance moves across Canada.</span></div></li>
            </ul>
          </div>
          <ContactForm />
        </div>
      </section>
      <section className="section tint" id="map" aria-labelledby="map-title">
        <div className="wrap">
          <SectionHeader
            id="map-title" kicker="Find us" title={`Based in ${address.city}, moving across Canada`}
            text={`${address.street}, ${address.city}, ${address.province} ${address.postal}`}
            action={<Button href={MAP_DIRECTIONS_URL} variant="dark" icon="route">Get directions</Button>}
          />
          <div className="map-frame">
            <iframe title={`Map showing ${COMPANY.name} at ${address.street}, ${address.city}`} src={MAP_EMBED_URL} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
        </div>
      </section>
    </>
  );
}
