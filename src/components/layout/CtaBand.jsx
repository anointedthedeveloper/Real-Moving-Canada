import Button from '../common/Button.jsx';

/** Red call-to-action strip ("Ready to outline your move?"). */
export default function CtaBand({
  title = 'Ready to outline your move?',
  text = 'Share your locations, date, property details, and selected services.',
  action = { to: '/quote', label: 'Get a quote' },
}) {
  return (
    <section className="cta-band">
      <div className="wrap cta-band-inner">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <Button to={action.to} variant="light" iconRight="arrow-right">{action.label}</Button>
      </div>
    </section>
  );
}
