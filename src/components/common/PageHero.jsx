import Kicker from './Kicker.jsx';

/**
 * Inner-page hero. `split` (default): navy copy panel beside a photo on desktop,
 * copy over the photo on phones. `banner`: the photo fills the whole hero behind
 * the copy (used with the RMC truck banner on Contact).
 */
export default function PageHero({ kicker, title, text, image, imageAlt = '', actions, children, variant = 'split' }) {
  return (
    <section className={`page-hero${variant === 'banner' ? ' page-hero-banner' : ''}`}>
      <div className="page-hero-copy">
        <div className="page-hero-inner">
          {kicker && <Kicker tone="gold">{kicker}</Kicker>}
          <h1>{title}</h1>
          {text && <p className="lead">{text}</p>}
          {actions && <div className="actions">{actions}</div>}
          {children}
        </div>
      </div>
      <div className="page-hero-media">
        <img src={image} alt={imageAlt} width="1200" height="800" fetchpriority="high" />
      </div>
    </section>
  );
}
