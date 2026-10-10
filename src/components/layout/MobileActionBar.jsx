import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import { COMPANY } from '../../constants/company.js';

/** Phone-only bar pinned to the bottom of public pages: call or start a quote in one tap. */
export default function MobileActionBar() {
  return (
    <nav className="mobile-action-bar" aria-label="Quick actions">
      <a href={`tel:${COMPANY.phoneTel}`} className="mab-call"><Icon name="phone" /><span>Call us</span></a>
      <Link to="/quote" className="mab-quote"><span>Get a Free Quote</span><Icon name="arrow-right" /></Link>
    </nav>
  );
}
