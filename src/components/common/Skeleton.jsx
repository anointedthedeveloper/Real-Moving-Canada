/** Shimmering placeholder blocks shaped like the content that will replace them. */
export function Skeleton({ width, height = 14, radius, className = '' }) {
  return <span className={`skeleton ${className}`.trim()} style={{ width, height, borderRadius: radius }} aria-hidden="true" />;
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <Skeleton width={36} height={36} radius={10} />
      <Skeleton width="55%" height={18} />
      {Array.from({ length: lines }, (_, i) => <Skeleton key={i} width={`${90 - i * 15}%`} />)}
    </div>
  );
}

export function SkeletonList({ rows = 3, label = 'Loading…' }) {
  return (
    <div className="skeleton-list" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton-row" key={i} aria-hidden="true">
          <Skeleton width={36} height={36} radius={10} />
          <div><Skeleton width="60%" height={14} /><Skeleton width="35%" height={12} /></div>
          <Skeleton width={72} height={22} radius={99} />
        </div>
      ))}
    </div>
  );
}
