import PageHero from '../../components/common/PageHero.jsx';
import Kicker from '../../components/common/Kicker.jsx';
import SectionHeader from '../../components/common/SectionHeader.jsx';
import Icon from '../../components/common/Icon.jsx';
import CtaBand from '../../components/layout/CtaBand.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { keywordsFor, businessJsonLd, breadcrumbJsonLd } from '../../constants/seo.js';
import { COMPANY } from '../../constants/company.js';
import { photo } from '../../constants/photos.js';

const heroImage = photo('crew-at-truck');
const approachImage = photo('packing-supplies');

const PRINCIPLES = [
  { icon: 'file', title: 'Clear information', text: 'Share your route, dates, property details, rooms and access notes once, in one place.' },
  { icon: 'sliders', title: 'Flexible service selection', text: 'Choose only the support you need — from packing to storage and heavy items.' },
  { icon: 'check', title: 'Editable review', text: 'See everything you entered and edit any section before you submit.' },
];

const VALUES = [
  { icon: 'hands', title: 'Care', text: 'Your belongings matter to you, so they matter to us. We wrap, protect and handle every item as if it were our own.' },
  { icon: 'file', title: 'Clarity', text: 'You see an estimate before you commit, a confirmed quote before moving day, and status updates at every step.' },
  { icon: 'calendar', title: 'Reliability', text: 'We confirm dates and arrival windows in writing and communicate early if anything needs to change.' },
];

export default function AboutPage() {
  useDocumentTitle('About Us — Saskatoon Movers Moving Canada Forward', 'Real Moving Canada is a Saskatoon-based moving company helping households and businesses move within their city, between provinces and across Canada — with careful work, honest estimates and clear communication.', {
    keywords: keywordsFor('about'),
    jsonLd: [businessJsonLd(), breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])],
  });
  return (
    <>
      <PageHero
        kicker="About Real Moving Canada" title={COMPANY.motto}
        text="A practical approach to residential, commercial, packing, cleanout, storage, and specialty moving needs."
        image={heroImage} imageAlt="A three-person moving crew beside an open truck"
      />
      <section className="section" aria-labelledby="approach-title">
        <div className="wrap split">
          <div>
            <Kicker>Our approach</Kicker>
            <h2 id="approach-title">Careful planning starts with clear information</h2>
            <p className="lead">Every move has different spaces, items, access details, and support needs. Our booking experience helps capture those details clearly from the start.</p>
            <p className="lead">From a residential move to an office move, cleanout, or oversized item, you can choose the services that fit and add notes that help describe the work.</p>
          </div>
          <div className="split-media"><img src={approachImage.src} srcSet={approachImage.srcSet} sizes="(max-width: 960px) 100vw, 50vw" alt="Labelled moving boxes, blankets and a hand truck" loading="lazy" width="1200" height="800" /></div>
        </div>
      </section>
      <section className="section dark" aria-labelledby="guides-title">
        <div className="wrap">
          <SectionHeader id="guides-title" tone="dark" kicker="What guides the experience" title="Simple, clear, and built around your details" />
          <ul className="feature-grid">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="feature-card dark">
                <span className="icon-tile dark"><Icon name={p.icon} /></span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section white" aria-labelledby="story-title">
        <div className="wrap split">
          <div>
            <Kicker>Our story</Kicker>
            <h2 id="story-title">Who we are</h2>
            <p className="lead">Real Moving Canada is a Saskatoon-based moving company helping households and businesses move within their city, between provinces and across the country.</p>
            <p className="lead">We started with a simple idea: moving should be planned carefully and communicated clearly. That means an honest estimate up front, a crew that treats your home with respect, and updates from the first box to the last.</p>
          </div>
          <div className="mission card card-pad">
            <Kicker tone="plain">Our mission</Kicker>
            <p>Our mission is to make every move across Canada simple, careful and clearly communicated — from the first estimate to the last box.</p>
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="values-title">
        <div className="wrap">
          <SectionHeader id="values-title" kicker="Our values" title="What guides every move" />
          <ul className="feature-grid">
            {VALUES.map((v) => (
              <li key={v.title} className="feature-card">
                <span className="icon-tile"><Icon name={v.icon} /></span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand title="Let’s talk about your move" text="Get a quote or send us a message — we’ll take it from there." />
    </>
  );
}
