import { Link } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import { COMPANY } from '../../constants/company.js';
import { FOOTER_COMPANY_LINKS } from '../../constants/navigation.js';
import { SERVICE_BY_SLUG, FOOTER_SERVICE_SLUGS, serviceLabel } from '../../constants/services.js';

export default function SiteFooter() {
  const { address } = COMPANY;
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo tone="light" />
          <p className="footer-slogan">{COMPANY.services}</p>
        </div>
        <nav aria-label="Company">
          <h2 className="footer-title">Company</h2>
          <ul>{FOOTER_COMPANY_LINKS.map((l) => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}</ul>
        </nav>
        <nav aria-label="Services">
          <h2 className="footer-title">Services</h2>
          <ul>
            {FOOTER_SERVICE_SLUGS.map((slug) => (
              <li key={slug}><Link to={`/services/${slug}`}>{serviceLabel(SERVICE_BY_SLUG[slug])}</Link></li>
            ))}
            <li><Link to="/services">All services</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="footer-title">Contact</h2>
          <ul className="footer-contact">
            <li><a href={`tel:${COMPANY.phoneTel}`}>{COMPANY.phone}</a></li>
            <li><a href={`tel:${COMPANY.phone2Tel}`}>{COMPANY.phone2}</a></li>
            <li><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
            <li>{address.street}<br />{address.city}, {address.province} {address.postal}</li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} {COMPANY.legalName}</span>
        <span><Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link></span>
      </div>
    </footer>
  );
}
