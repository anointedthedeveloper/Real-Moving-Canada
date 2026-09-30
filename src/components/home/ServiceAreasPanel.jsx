import { Link } from 'react-router-dom';
import Kicker from '../common/Kicker.jsx';
import Button from '../common/Button.jsx';
import Icon from '../common/Icon.jsx';
import { PROVINCES, REGION_ORDER } from '../../constants/options.js';

const slug = (region) => region.toLowerCase().replace(/\s+/g, '-');

export default function ServiceAreasPanel() {
  return (
    <section className="section tint" aria-labelledby="areas-title">
      <div className="wrap areas-panel">
        <div>
          <Kicker>Service areas</Kicker>
          <h2 id="areas-title">Planning a move in your area?</h2>
          <p className="lead">Enter your origin and destination in the quote flow so we can understand your route.</p>
          <Button to="/quote" iconRight="arrow-right">Check your move</Button>
        </div>
        <ul className="areas-list card">
          {REGION_ORDER.map((region) => (
            <li key={region}>
              <Link to={`/service-areas#${slug(region)}`}>
                <span>
                  <strong>{region}</strong>
                  <small>{PROVINCES.filter((p) => p.region === region).map((p) => p.name).join(', ')}</small>
                </span>
                <Icon name="plus" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
