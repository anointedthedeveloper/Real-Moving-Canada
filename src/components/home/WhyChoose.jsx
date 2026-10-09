import Kicker from '../common/Kicker.jsx';
import Icon from '../common/Icon.jsx';
import image from '../../assets/images/blanket-wrapping.webp';

const POINTS = [
  { title: 'Plan around your move', text: 'Share property details, rooms, access notes, dates, and addresses in one place.' },
  { title: 'Choose only what you need', text: 'Add packing, storage, cleanout, furniture, appliance, or heavy-item support.' },
  { title: 'Review before submitting', text: 'Check your details and edit each section before you confirm your request.' },
];

export default function WhyChoose() {
  return (
    <section className="why" id="why" aria-labelledby="why-title">
      <div className="why-media"><img src={image} alt="Two movers wrapping a table in moving blankets" loading="lazy" width="1100" height="1100" /></div>
      <div className="why-panel">
        <div className="why-inner">
          <Kicker tone="light">Why choose us</Kicker>
          <h2 id="why-title">A clear plan for the things that matter</h2>
          <p className="lead">Tell us what is moving, where it is going, and what support you need. We organize the details into a straightforward booking experience.</p>
          <ul className="why-list">
            {POINTS.map((p) => (
              <li key={p.title}>
                <span className="why-check"><Icon name="check" /></span>
                <div><h3>{p.title}</h3><p>{p.text}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
