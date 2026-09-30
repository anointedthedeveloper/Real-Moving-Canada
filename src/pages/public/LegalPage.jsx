import { Link } from 'react-router-dom';
import Kicker from '../../components/common/Kicker.jsx';
import { COMPANY } from '../../constants/company.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

/**
 * Privacy and Terms are linked from the footer in the design, but their text
 * has to come from the company — so these pages say so instead of inventing policy.
 */
export default function LegalPage({ kind }) {
  const title = kind === 'privacy' ? 'Privacy policy' : 'Terms of service';
  useDocumentTitle(title);
  return (
    <section className="section">
      <div className="wrap narrow">
        <Kicker>{COMPANY.legalName}</Kicker>
        <h1>{title}</h1>
        <p className="lead">Our {title.toLowerCase()} is being prepared and will be published here.</p>
        <p>
          {kind === 'privacy'
            ? 'In the meantime, the details you send through our quote, contact and review forms are used only to respond to your request.'
            : 'In the meantime, the price and terms for your move are confirmed with you directly by a representative before moving day.'}
          {' '}If you have questions, email <a className="link" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or <Link className="link" to="/contact">contact us</Link>.
        </p>
      </div>
    </section>
  );
}
