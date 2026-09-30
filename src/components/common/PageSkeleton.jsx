import { Skeleton } from './Skeleton.jsx';

const Lines = ({ widths }) => widths.map((w, i) => <Skeleton key={i} width={w} height={14} />);

/** Public page frame: dark hero panel, section heading and a grid of cards. */
function PublicSkeleton() {
  return (
    <>
      <div className="sk-hero">
        <div className="wrap sk-hero-inner">
          <Skeleton width={140} height={12} className="sk-dark" />
          <Skeleton width="min(520px, 80%)" height={44} className="sk-dark" />
          <Skeleton width="min(420px, 70%)" height={16} className="sk-dark" />
          <Skeleton width={160} height={46} radius={6} className="sk-dark" />
        </div>
      </div>
      <div className="wrap section">
        <Skeleton width={120} height={12} />
        <Skeleton width="min(460px, 80%)" height={32} />
        <div className="sk-cards">
          {Array.from({ length: 6 }, (_, i) => (
            <div className="sk-card" key={i}><Skeleton width={40} height={40} radius={10} /><Skeleton width="60%" height={16} /><Lines widths={['90%', '70%']} /></div>
          ))}
        </div>
      </div>
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="sk-form">
      <Skeleton width="45%" height={30} />
      <Skeleton width="70%" height={14} />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="sk-field"><Skeleton width={90} height={12} /><Skeleton width="100%" height={46} radius={6} /></div>
      ))}
      <Skeleton width="100%" height={48} radius={6} />
    </div>
  );
}

function QuoteSkeleton() {
  return (
    <div className="wrap sk-quote">
      <div className="sk-steps">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} width={32} height={32} radius={99} />)}</div>
      <div className="card card-pad"><FormSkeleton /></div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="sk-dashboard">
      <Skeleton width={110} height={12} />
      <Skeleton width="min(320px, 70%)" height={30} />
      <div className="sk-stats">
        {Array.from({ length: 4 }, (_, i) => (
          <div className="sk-card" key={i}><Skeleton width={36} height={36} radius={10} /><Skeleton width="70%" height={20} /><Skeleton width="40%" height={12} /></div>
        ))}
      </div>
      <div className="sk-panels">
        {[0, 1].map((i) => (
          <div className="sk-card tall" key={i}><Skeleton width="40%" height={20} /><Lines widths={['95%', '85%', '90%', '60%']} /></div>
        ))}
      </div>
    </div>
  );
}

const VARIANTS = { public: PublicSkeleton, auth: FormSkeleton, quote: QuoteSkeleton, dashboard: DashboardSkeleton };

/** Shimmering outline of the page that is loading, shown while its code downloads. */
export default function PageSkeleton({ variant = 'public' }) {
  const Frame = VARIANTS[variant] || PublicSkeleton;
  return (
    <div className="page-skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading page…</span>
      <Frame />
    </div>
  );
}
