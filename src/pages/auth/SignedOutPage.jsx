import Button from '../../components/common/Button.jsx';
import SuccessPanel from '../../components/common/SuccessPanel.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

/** "Logout / Signed out" screen from the portal design. */
export default function SignedOutPage() {
  useDocumentTitle('Signed out', undefined, { noindex: true });
  return (
    <SuccessPanel
      headingAs="h1" tone="neutral" icon="logout" title="You’re signed out"
      text="Your session has ended. Sign in again to access your customer account."
      actions={<><Button to="/login" block>Sign in again</Button><Button to="/" variant="outline" block>Return to website</Button></>}
    >
      <p className="small muted">On shared devices, close the browser window.</p>
    </SuccessPanel>
  );
}
