import PageHero from '../../components/common/PageHero.jsx';
import SectionHeader from '../../components/common/SectionHeader.jsx';
import Accordion from '../../components/common/Accordion.jsx';
import Icon from '../../components/common/Icon.jsx';
import Button from '../../components/common/Button.jsx';
import EstimateCalculator from '../../components/estimate/EstimateCalculator.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import heroImage from '../../assets/images/hallway-boxes.webp';

const FACTORS = [
  { icon: 'route', title: 'Distance', text: 'How far your belongings travel — across town, across the province or across the country.' },
  { icon: 'home', title: 'Property size', text: 'The number of rooms sets the crew size, truck space and time needed.' },
  { icon: 'box', title: 'Volume of belongings', text: 'Two homes of the same size can hold very different amounts. Your inventory helps us plan accurately.' },
  { icon: 'calendar', title: 'Moving date', text: 'Summer months, weekends and month-end dates are in higher demand than mid-week, off-season dates.' },
  { icon: 'truck', title: 'Services', text: 'Loading, unloading and furniture delivery can be added or left out to suit your plans.' },
  { icon: 'hands', title: 'Packing', text: 'Full or partial packing and unpacking, including fragile items and kitchenware.' },
  { icon: 'warehouse', title: 'Storage', text: 'Short- or long-term storage when your move-out and move-in dates don’t line up.' },
  { icon: 'shield', title: 'Special handling', text: 'Pianos, artwork, antiques, heavy safes and difficult access like narrow stairs or long carries.' },
];

const FAQ = [
  { q: 'Is the online estimate my final price?', a: 'No. The online estimate is a price range based on the information you provide. A Real Moving Canada representative reviews every request and confirms the final price with you before your move.' },
  { q: 'How is distance calculated?', a: 'We estimate the road distance between the cities you enter. Exact addresses, access and routing are confirmed when a representative reviews your quote.' },
  { q: 'Why does my moving date change the estimate?', a: 'Demand is highest in summer, on weekends and around the end of the month. Choosing a mid-week or off-season date can lower your cost.' },
  { q: 'Do I need an account to get an estimate?', a: 'No — the instant estimate and the quote request are both open to everyone. A representative will follow up directly by phone or email.' },
  { q: 'What counts as special handling?', a: 'Items that need extra equipment, crew or care — such as pianos, artwork, antiques and very heavy items — and difficult access such as narrow stairwells or long walks to the truck. Mention them in your request so we can plan for them.' },
  { q: 'Can I change details after requesting a quote?', a: 'Yes. Contact us with the change and a representative will update your quote.' },
];

export default function PricingPage() {
  useDocumentTitle('Pricing & estimates', 'How moving costs are calculated, and an instant estimate for your move.');
  return (
    <>
      <PageHero
        kicker="Pricing" title="Clear pricing, tailored to your move"
        text="No two moves are the same, so we don’t publish one-size-fits-all prices. Here’s what shapes the cost of your move — and how to get your own estimate in seconds."
        image={heroImage} imageAlt="Two movers carrying labelled boxes down a hallway"
        actions={<Button href="#estimate" iconRight="arrow-right">Get your moving estimate</Button>}
      />
      <section className="section" aria-labelledby="factors-title">
        <div className="wrap">
          <SectionHeader id="factors-title" kicker="What affects the price" title="Eight things that shape your moving cost" />
          <ul className="feature-grid cols-4">
            {FACTORS.map((f) => (
              <li key={f.title} className="feature-card">
                <span className="icon-tile"><Icon name={f.icon} /></span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section tint" id="estimate" aria-labelledby="estimate-title">
        <div className="wrap">
          <SectionHeader id="estimate-title" kicker="Instant estimate" title="Get your moving estimate" text="An estimated price range based on the details you provide, calculated with our current pricing." />
          <EstimateCalculator />
        </div>
      </section>
      <section className="section white" aria-labelledby="pricing-faq">
        <div className="wrap faq-wrap">
          <SectionHeader id="pricing-faq" kicker="Questions" title="Pricing FAQ" />
          <Accordion items={FAQ} />
        </div>
      </section>
    </>
  );
}
