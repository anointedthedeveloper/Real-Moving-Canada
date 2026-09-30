import PageHero from '../../components/common/PageHero.jsx';
import Button from '../../components/common/Button.jsx';
import { SkeletonCard } from '../../components/common/Skeleton.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { keywordsFor } from '../../constants/seo.js';
import { loadServiceAreas } from '../../services/catalogService.js';
import { PROVINCES, REGION_ORDER } from '../../constants/options.js';
import heroImage from '../../assets/images/clipboard-check.webp';

const slug = (region) => region.toLowerCase().replace(/\s+/g, '-');

export default function ServiceAreasPage() {
  useDocumentTitle('Service Areas — Movers Across Canada, Coast to Coast', 'Moving in Canada? Real Moving Canada plans local and long-distance moves in British Columbia, Alberta, Saskatchewan, Manitoba, Ontario, Quebec, the Atlantic provinces and the North.', {
    keywords: keywordsFor('areas'),
  });
  const { data: areas, loading } = useAsync(loadServiceAreas);

  const byCode = Object.fromEntries((areas || []).map((a) => [a.code, a]));
  const active = PROVINCES
    .map((p) => ({ ...p, ...(byCode[p.code] || {}), isActive: !!byCode[p.code] && byCode[p.code].isActive !== false }))
    .filter((p) => p.isActive);

  return (
    <>
      <PageHero
        kicker="Service areas" title="Moving across Canada"
        text="We plan moves within and between Canada’s provinces and territories. Find your region below, then start a quote with your route."
        image={heroImage} imageAlt="Two movers reviewing a checklist beside a moving truck"
      />
      <section className="section" aria-label="Regions">
        <div className="wrap">
          {loading ? (
            <div className="region-grid" aria-busy="true">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
          ) : REGION_ORDER.map((region) => {
            const list = active.filter((p) => p.region === region);
            if (!list.length) return null;
            return (
              <div className="region" key={region} id={slug(region)}>
                <h2>{region}</h2>
                <ul className="region-grid">
                  {list.map((p) => (
                    <li className="province-card card" key={p.code} id={p.code.toLowerCase()}>
                      <header><span className="province-code">{p.code}</span><h3>{p.name}</h3></header>
                      <p>{p.note || `Local and long-distance moves to, from and within ${p.name}.`}</p>
                      {!!p.cities?.length && <ul className="pill-list">{p.cities.map((c) => <li key={c.name}>{c.name}</li>)}</ul>}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
      <section className="section tint">
        <div className="wrap center-block">
          <h2>Don’t see your city?</h2>
          <p className="lead">Tell us where you’re moving from and to. We’ll let you know how we can help.</p>
          <div className="actions center">
            <Button to="/quote" iconRight="arrow-right">Get a quote</Button>
            <Button to="/contact" variant="outline">Contact us</Button>
          </div>
        </div>
      </section>
    </>
  );
}
