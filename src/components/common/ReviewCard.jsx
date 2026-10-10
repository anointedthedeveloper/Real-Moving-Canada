import Icon from './Icon.jsx';
import { fmtDate, initials } from '../../utils/format.js';

export function Stars({ value }) {
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <Icon key={n} name="star" className={n <= value ? 'on' : ''} />)}
    </span>
  );
}

export default function ReviewCard({ review }) {
  return (
    <article className="card card-pad review-card">
      <Stars value={review.rating} />
      {review.title && <h3>{review.title}</h3>}
      <blockquote>{review.body}</blockquote>
      <footer>
        <span className="avatar" aria-hidden="true">{initials(review.displayName)}</span>
        <div><strong>{review.displayName}</strong><small>{fmtDate(review.date)}</small></div>
      </footer>
    </article>
  );
}
