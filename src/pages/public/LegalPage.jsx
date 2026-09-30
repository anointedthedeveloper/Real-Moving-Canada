import { Link } from 'react-router-dom';
import Kicker from '../../components/common/Kicker.jsx';
import { PRIVACY, TERMS, LEGAL_UPDATED } from '../../constants/legal.js';
import { COMPANY } from '../../constants/company.js';
import { fmtDate } from '../../utils/format.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

/** Privacy Policy (/privacy) and Terms of Service (/terms), with an in-page contents list. */
export default function LegalPage({ kind }) {
  const doc = kind === 'privacy' ? PRIVACY : TERMS;
  useDocumentTitle(doc.title);
  return (
    <>
      <section className="legal-hero">
        <div className="wrap">
          <Kicker tone="gold">{COMPANY.legalName}</Kicker>
          <h1>{doc.title}</h1>
          <p className="legal-updated">Last updated {fmtDate(LEGAL_UPDATED, { month: 'long' })}</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap legal-grid">
          <nav className="legal-toc" aria-label="On this page">
            <p className="legal-toc-title">On this page</p>
            <ol>{doc.sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}</ol>
            <p className="legal-other">
              {kind === 'privacy' ? <Link className="link" to="/terms">Terms of Service</Link> : <Link className="link" to="/privacy">Privacy Policy</Link>}
            </p>
          </nav>
          <article className="legal-body">
            <p className="lead">{doc.intro}</p>
            {doc.sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</h2>
                {s.body.map((part, j) => (Array.isArray(part)
                  ? <ul key={j}>{part.map((li) => <li key={li}>{li}</li>)}</ul>
                  : <p key={j}>{part}</p>))}
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
