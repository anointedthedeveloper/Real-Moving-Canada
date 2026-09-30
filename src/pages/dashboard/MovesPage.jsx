import { useMemo, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import PageIntro from '../../components/dashboard/PageIntro.jsx';
import Panel from '../../components/dashboard/Panel.jsx';
import ListItem from '../../components/dashboard/ListItem.jsx';
import DetailRows from '../../components/dashboard/DetailRows.jsx';
import ProgressTrack from '../../components/dashboard/ProgressTrack.jsx';
import SearchInput from '../../components/dashboard/SearchInput.jsx';
import FilterTabs from '../../components/dashboard/FilterTabs.jsx';
import PortalLoader from '../../components/dashboard/PortalLoader.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { fetchMoves } from '../../services/portalService.js';
import { fmtDate, formatPlace } from '../../utils/format.js';

const STAGES = ['Request', 'Quote', 'Booked', 'Move day'];
const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
];

export default function MovesPage() {
  useDocumentTitle('My Moves');
  const { data, loading, error, reload } = useAsync(fetchMoves);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const moves = data?.items || [];
  const visible = useMemo(() => moves.filter((m) => {
    const text = `${m.id} ${formatPlace(m.origin)} ${formatPlace(m.destination)}`.toLowerCase();
    return (filter === 'all' || String(m.status).toLowerCase() === filter) && text.includes(query.toLowerCase());
  }), [moves, filter, query]);
  const selected = visible.find((m) => m.id === selectedId) || visible[0];

  return (
    <>
      <PageIntro title="My Moves" text="Select a move to review the route, schedule, services, and updates." action={<Button to="/quote" icon="plus">Start a move request</Button>} />
      <PortalLoader loading={loading} error={error} reload={reload}>
        {!moves.length ? (
          <EmptyState icon="truck" title="No moves yet" text="Completed moves and new requests will appear here." action={<Button to="/quote" variant="outline">Start a move request</Button>} />
        ) : (
          <div className="master-detail">
            <div className="master">
              <div className="toolbar">
                <SearchInput label="Search moves" value={query} onChange={setQuery} placeholder="Search by move ID or city" />
                <FilterTabs label="Filter moves" options={FILTERS} value={filter} onChange={setFilter} />
              </div>
              {visible.length ? (
                <ul className="item-list">
                  {visible.map((m) => (
                    <li key={m.id}>
                      <ListItem icon="truck" title={`${formatPlace(m.origin)} to ${formatPlace(m.destination)}`} meta={`${m.id} · ${fmtDate(m.moveDate)}`} status={m.status} selected={selected?.id === m.id} onSelect={() => setSelectedId(m.id)} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon="search" title="No matching moves" text="Try a different search or filter." />
              )}
            </div>
            {selected && (
              <Panel title="Move details" subtitle={selected.id} badge={<Badge>{selected.status}</Badge>} className="detail">
                <ProgressTrack steps={STAGES} current={selected.stage ?? 0} />
                <DetailRows rows={[
                  ['Origin', formatPlace(selected.origin, { withAddress: true })],
                  ['Destination', formatPlace(selected.destination, { withAddress: true })],
                  ['Move date', fmtDate(selected.moveDate)],
                  ['Arrival window', selected.arrivalWindow],
                ]} />
                {!!selected.services?.length && (
                  <>
                    <h4 className="detail-sub">Selected services</h4>
                    <ul className="pill-list">{selected.services.map((s) => <li key={s}>{s}</li>)}</ul>
                  </>
                )}
                <div className="actions">
                  <Button to="/dashboard/bookings">View booking</Button>
                  <Button to="/dashboard/messages" variant="outline">Request a change</Button>
                </div>
              </Panel>
            )}
          </div>
        )}
      </PortalLoader>
    </>
  );
}
