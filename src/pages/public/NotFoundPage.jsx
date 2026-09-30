import { useEffect } from 'react';
import Button from '../../components/common/Button.jsx';
import Icon from '../../components/common/Icon.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  // Keep unknown URLs out of search results (the host answers every path with the app shell).
  useEffect(() => {
    const meta = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex' });
    document.head.append(meta);
    return () => meta.remove();
  }, []);
  return (
    <section className="section">
      <div className="wrap not-found">
        <span className="empty-icon"><Icon name="route" /></span>
        <p className="kicker kicker-red">Error 404</p>
        <h1>This page took a wrong turn</h1>
        <p className="lead">The page you’re looking for doesn’t exist or has moved.</p>
        <div className="actions center">
          <Button to="/" iconRight="arrow-right">Go to the home page</Button>
          <Button to="/services" variant="outline">View services</Button>
          <Button to="/contact" variant="ghost">Contact us</Button>
        </div>
      </div>
    </section>
  );
}
