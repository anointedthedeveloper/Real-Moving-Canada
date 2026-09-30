import { Link } from 'react-router-dom';
import Kicker from '../common/Kicker.jsx';
import Button from '../common/Button.jsx';
import Icon from '../common/Icon.jsx';
import heroImage from '../../assets/images/hero-home.webp';

export default function HomeHero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-media">
        <img src={heroImage} alt="Two movers carrying a plastic-wrapped couch toward a moving truck" width="1584" height="672" fetchpriority="high" />
      </div>
      <div className="wrap hero-inner">
        <Kicker tone="light">Real Moving Canada</Kicker>
        <h1 id="hero-title">Moving your life forward, with care.</h1>
        <p className="lead">Residential, commercial, packing, cleanout, storage, and specialty moving services—planned around the details of your move.</p>
        <div className="actions">
          <Button to="/quote" size="lg" iconRight="arrow-right">Book a move</Button>
          <Button to="/quote" variant="light" size="lg" iconRight="arrow-right">Get a quote</Button>
        </div>
        <Link to="/quote" className="hero-chip"><Icon name="calendar" /> Start with your move date and addresses</Link>
      </div>
    </section>
  );
}
