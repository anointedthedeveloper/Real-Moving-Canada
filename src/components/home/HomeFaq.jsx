import SectionHeader from '../common/SectionHeader.jsx';
import Accordion from '../common/Accordion.jsx';

export const HOME_FAQ = [
  { q: 'What details should I have ready?', a: 'Your origin, destination, preferred date, property type, room count, and any notes about access or special items.' },
  { q: 'Can I request packing or storage?', a: 'Yes. Select packing, unpacking or storage in the services step of the quote form, and add storage details such as how long you need it.' },
  { q: 'Where do I list heavy or oversized items?', a: 'The services step has a field for heavy or oversized items — pianos, safes, appliances and similar pieces — plus a notes field for stairs, elevators and other access details.' },
  { q: 'Can I change details before submitting?', a: 'Yes. The review step shows everything you entered, with an Edit link for each section. After you submit, contact us with any changes and we’ll update your request.' },
];

export default function HomeFaq() {
  return (
    <section className="section white" aria-labelledby="faq-title">
      <div className="wrap faq-wrap">
        <SectionHeader id="faq-title" kicker="FAQ" title="Questions before you get started" text="A few useful details about preparing a move request." />
        <Accordion items={HOME_FAQ} />
      </div>
    </section>
  );
}
