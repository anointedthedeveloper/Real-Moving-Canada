import Kicker from './Kicker.jsx';

/**
 * Inner-page hero: dark copy panel beside a photo on desktop, and copy over the
 * photo on phones (Services, Service detail, About and Contact in the design).
 */
export default function PageHero({ kicker, title, text, image, imageAlt = '', actions, children }) {
  return (
    <section className="page-hero">
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
