import { useMemo, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Icon from '../../components/common/Icon.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Notice from '../../components/common/Notice.jsx';
import PageIntro from '../../components/dashboard/PageIntro.jsx';
import Panel from '../../components/dashboard/Panel.jsx';
import ListItem from '../../components/dashboard/ListItem.jsx';
import DetailRows from '../../components/dashboard/DetailRows.jsx';
import FilterTabs from '../../components/dashboard/FilterTabs.jsx';
import PortalLoader from '../../components/dashboard/PortalLoader.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { fetchQuotes, acceptQuote } from '../../services/portalService.js';
import { fmtDate, formatPlace, money } from '../../utils/format.js';

const TABS = [
  { value: 'active', label: 'Active' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'archived', label: 'Archived' },
];
const groupOf = (q) => (['accepted'].includes(String(q.status).toLowerCase()) ? 'accepted' : ['archived', 'expired', 'declined'].includes(String(q.status).toLowerCase()) ? 'archived' : 'active');

export default function QuotesPage() {
  useDocumentTitle('Quotes', undefined, { noindex: true });
  const { data, loading, error, reload } = useAsync(fetchQuotes);
  const [tab, setTab] = useState('active');
  const [selectedId, setSelectedId] = useState(null);
  const [action, setAction] = useState({ busy: false, error: '', done: '' });

  const quotes = data?.items || [];
  const visible = useMemo(() => quotes.filter((q) => groupOf(q) === tab), [quotes, tab]);
  const selected = visible.find((q) => q.id === selectedId) || visible[0];

  const accept = async () => {
    setAction({ busy: true, error: '', done: '' });
    try {
      await acceptQuote(selected.id);
      setAction({ busy: false, error: '', done: 'Quote accepted. We’ll confirm your booking shortly.' });
      reload();
    } catch (err) {
      setAction({ busy: false, error: err.message, done: '' });
    }
  };

  return (
    <>
      <PageIntro title="Quotes" text="Open a quote to review its move details and available actions." action={<Button to="/quote" icon="plus">Request a quote</Button>} />
      <PortalLoader loading={loading} error={error} reload={reload}>
        <FilterTabs label="Quote status" variant="underline" options={TABS.map((t) => ({ ...t, count: quotes.filter((q) => groupOf(q) === t.value).length || null }))} value={tab} onChange={(v) => { setTab(v); setSelectedId(null); }} />
        {!visible.length ? (
          <EmptyState
            className="mt-1" icon="file"
            title={tab === 'active' ? 'No quotes yet' : `No ${tab} quotes`}
            text={tab === 'active' ? 'Quotes tied to your move requests will appear here.' : `${tab[0].toUpperCase()}${tab.slice(1)} quotes will appear here.`}
            action={tab === 'active' ? <Button to="/quote" variant="outline">Request a quote</Button> : <Button variant="outline" onClick={() => setTab('active')}>View active quotes</Button>}
          />
        ) : (
          <div className="master-detail mt-1">
            <ul className="item-list master">
              {visible.map((q) => (
                <li key={q.id}><ListItem icon="file" title={`Quote for ${q.moveId}`} meta={`${q.id} · ${fmtDate(q.date)}`} status={q.status} selected={selected?.id === q.id} onSelect={() => { setSelectedId(q.id); setAction({ busy: false, error: '', done: '' }); }} /></li>
              ))}
            </ul>
            {selected && (
              <Panel title="Quote details" subtitle={`${selected.id} · Created ${fmtDate(selected.date)}`} badge={<Badge>{selected.status}</Badge>} className="detail">
                <DetailRows rows={[
                  ['Move', selected.moveId],
                  ['Route', `${formatPlace(selected.origin)} → ${formatPlace(selected.destination)}`],
                  ['Preferred date', fmtDate(selected.preferredDate)],
                  ['Quote total', money(selected.total)],
                  ['Valid until', fmtDate(selected.validUntil)],
                ]} />
                {!!selected.services?.length && (
                  <>
                    <h4 className="detail-sub">Included services</h4>
                    <ul className="tick-list tick-boxes">{selected.services.map((s) => <li key={s}><Icon name="check" />{s}</li>)}</ul>
                  </>
                )}
                {action.error && <Notice tone="error">{action.error}</Notice>}
                {action.done && <Notice tone="success">{action.done}</Notice>}
                <div className="actions">
                  {groupOf(selected) === 'active' && <Button onClick={accept} loading={action.busy}>Accept quote</Button>}
                  {selected.downloadUrl && <Button href={selected.downloadUrl} variant="outline" icon="download" external={false} download>Download quote</Button>}
                  <Button to="/dashboard/messages" variant="ghost">Ask a question</Button>
                </div>
                <p className="small muted">Review the quote details before choosing an action. Any terms associated with the quote are shown in the downloadable document.</p>
              </Panel>
            )}
          </div>
        )}
      </PortalLoader>
    </>
  );
}
