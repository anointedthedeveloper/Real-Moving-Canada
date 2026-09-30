import { useState } from 'react';
import PageHero from '../../components/common/PageHero.jsx';
import SectionHeader from '../../components/common/SectionHeader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Button from '../../components/common/Button.jsx';
import { SkeletonCard } from '../../components/common/Skeleton.jsx';
import ReviewCard from '../../components/common/ReviewCard.jsx';
import ReviewForm from '../../components/forms/ReviewForm.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { keywordsFor } from '../../constants/seo.js';
import { loadReviews } from '../../services/catalogService.js';
import heroImage from '../../assets/images/couch-inside.webp';

export default function ReviewsPage() {
  useDocumentTitle('Customer Reviews', 'Read reviews from Real Moving Canada customers, or share your own moving experience with our Saskatoon movers.', {
    keywords: keywordsFor('reviews'),
  });
  const [page, setPage] = useState(1);
  const { data, loading } = useAsync(() => loadReviews(page, 9), [page]);
  const summary = data?.summary;
  const p = data?.pagination;

  return (
    <>
      <PageHero
        kicker="Reviews" title="Customer reviews"
        text="Reviews are submitted by Real Moving Canada customers and published after they’ve been read by our team."
        image={heroImage} imageAlt="Two movers carrying furniture into a home"
      >
        {summary?.count > 0 && (
          <p className="review-summary"><strong>{summary.average.toFixed(1)}</strong> / 5 · based on {summary.count} published review{summary.count === 1 ? '' : 's'}</p>
        )}
      </PageHero>
      <section className="section" aria-label="Published reviews">
        <div className="wrap">
          {loading && <div className="region-grid" aria-busy="true">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>}
          {!loading && !data?.reviews.length && (
            <EmptyState
              icon="message" title="No published reviews yet"
              text="Reviews from Real Moving Canada customers will appear here once they’ve been approved."
              action={<Button href="#write" variant="outline">Be the first to share your experience</Button>}
            />
          )}
          {!loading && !!data?.reviews.length && (
            <>
              <ul className="region-grid">{data.reviews.map((r) => <li key={r.id || r.displayName + r.date}><ReviewCard review={r} /></li>)}</ul>
              {p?.totalPages > 1 && (
                <div className="pager">
                  <span>Page {p.page} of {p.totalPages}</span>
                  <div className="actions">
                    <Button variant="outline" size="sm" disabled={p.page <= 1} onClick={() => setPage(p.page - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={p.page >= p.totalPages} onClick={() => setPage(p.page + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <section className="section tint" id="write" aria-labelledby="write-title">
        <div className="wrap narrow">
          <SectionHeader id="write-title" kicker="Moved with us?" title="Share your experience" text="Your review helps other families and businesses plan their move." />
          <ReviewForm />
        </div>
      </section>
    </>
  );
}
