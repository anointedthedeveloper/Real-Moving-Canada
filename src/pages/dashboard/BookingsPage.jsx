import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Checkbox from '../../components/forms/Checkbox.jsx';
import PageIntro from '../../components/dashboard/PageIntro.jsx';
import Panel from '../../components/dashboard/Panel.jsx';
import ListItem from '../../components/dashboard/ListItem.jsx';
import DetailRows from '../../components/dashboard/DetailRows.jsx';
import PortalLoader from '../../components/dashboard/PortalLoader.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { fetchBookings } from '../../services/portalService.js';
import { fmtDate, formatPlace } from '../../utils/format.js';
import { downloadCalendarEvent } from '../../utils/calendar.js';
import { COMPANY } from '../../constants/company.js';

const CHECKLIST = ['Review the confirmed schedule', 'Complete any pending documents', 'Review payment status'];

export default function BookingsPage() {
  useDocumentTitle('Bookings');
  const { data, loading, error, reload } = useAsync(fetchBookings);
  const [selectedId, setSelectedId] = useState(null);
  const [done, setDone] = useState([]);
  const bookings = data?.items || [];
  const selected = bookings.find((b) => b.id === selectedId) || bookings[0];

  return (
    <>
      <PageIntro title="Bookings" text="Review booking details, schedules, and next steps." action={<Button to="/dashboard/moves" variant="outline">View moves</Button>} />
      <PortalLoader loading={loading} error={error} reload={reload}>
        {!bookings.length ? (
          <EmptyState icon="calendar" title="No bookings yet" text="A booking will appear here after a quote is accepted and the move is scheduled." action={<Button to="/dashboard/quotes" variant="outline">Review quotes</Button>} />
        ) : (
          <div className="master-detail">
            <ul className="item-list master">
              {bookings.map((b) => (
                <li key={b.id}><ListItem icon="calendar" title={`Booking for ${b.moveId}`} meta={`${b.id} · ${fmtDate(b.moveDate)}`} status={b.status} selected={selected?.id === b.id} onSelect={() => setSelectedId(b.id)} /></li>
              ))}
            </ul>
            {selected && (
              <Panel title="Booking details" subtitle={selected.id} badge={<Badge>{selected.status}</Badge>} className="detail">
                <div className="dark-callout">
                  <div><small>Move date</small><strong>{fmtDate(selected.moveDate)}</strong></div>
                  <div><small>Arrival window</small><strong>{selected.arrivalWindow || 'To be confirmed'}</strong></div>
                </div>
                <DetailRows rows={[
                  ['Move ID', selected.moveId],
                  ['Origin', formatPlace(selected.origin, { withAddress: true })],
                  ['Destination', formatPlace(selected.destination, { withAddress: true })],
                  ['Contact', selected.contactPhone || COMPANY.phone],
                ]} />
                <fieldset className="checklist">
                  <legend className="detail-sub">Before move day</legend>
                  {CHECKLIST.map((item) => (
                    <Checkbox key={item} label={item} checked={done.includes(item)} onChange={() => setDone((d) => (d.includes(item) ? d.filter((x) => x !== item) : [...d, item]))} />
                  ))}
                </fieldset>
                <div className="actions">
                  <Button to="/dashboard/moves">View move</Button>
                  <Button variant="outline" icon="calendar-plus" onClick={() => downloadCalendarEvent(selected)}>Add to calendar</Button>
                </div>
              </Panel>
            )}
          </div>
        )}
      </PortalLoader>
    </>
  );
}
