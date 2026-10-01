import SectionHeader from '../common/SectionHeader.jsx';

const STEPS = [
  { title: 'Tell us about you', text: 'Add your contact details.' },
  { title: 'Describe the move', text: 'Add addresses, date, and property details.' },
  { title: 'Select services', text: 'Choose support and list special items.' },
  { title: 'Review and submit', text: 'Confirm the information you provided.' },
];

export default function ProcessSteps() {
  return (
    <section className="section white" aria-labelledby="process-title">
      <div className="wrap">
        <SectionHeader id="process-title" kicker="The moving process" title="From first details to move day" text="A simple path keeps your request organized and easy to review." />
        <ol className="process">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="process-no">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
