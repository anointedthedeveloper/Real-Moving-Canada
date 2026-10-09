import Kicker from '../common/Kicker.jsx';

/** Heading row inside a portal page: title, supporting text and a primary action. */
export default function PageIntro({ kicker, title, text, action }) {
  return (
    <div className="page-intro">
      <div>
        {kicker && <Kicker tone="plain">{kicker}</Kicker>}
        <h2>{title}</h2>
        {text && <p className="muted">{text}</p>}
      </div>
      {action && <div className="page-intro-action">{action}</div>}
    </div>
  );
}
