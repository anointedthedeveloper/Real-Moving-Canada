import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Icon from '../../components/common/Icon.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import PageIntro from '../../components/dashboard/PageIntro.jsx';
import Panel from '../../components/dashboard/Panel.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import DetailRows from '../../components/dashboard/DetailRows.jsx';
import PortalLoader from '../../components/dashboard/PortalLoader.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchOverview } from '../../services/portalService.js';
import { fmtDate, formatPlace } from '../../utils/format.js';

const ACTIVITY_ICON = { quote: 'file', booking: 'calendar', document: 'upload', payment: 'card', message: 'message' };

export default function OverviewPage() {
  useDocumentTitle('Overview', undefined, { noindex: true });
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(fetchOverview);
  const s = data?.summary;
  const move = data?.upcomingMove;

  return (
    <>
      <PageIntro
        kicker="Customer account"
        title={user?.firstName ? `Welcome, ${user.firstName}` : 'Welcome'}
        text="Review upcoming move details and account activity."
        action={<Button to="/quote" icon="plus">Request a quote</Button>}
      />
      <PortalLoader loading={loading} error={error} reload={reload} rows={2}>
        <div className="stat-grid">
          <StatCard icon="truck" label="Upcoming move" value={s?.moveDate ? fmtDate(s.moveDate) : 'No move scheduled'} meta={s?.moveId} status={s?.moveStatus} to="/dashboard/moves" />
          <StatCard icon="file" label="Quote status" value={s?.quoteStatus || 'No quotes yet'} meta={s?.quoteId} status={s?.quoteStatus && 'Current'} to="/dashboard/quotes" />
          <StatCard icon="calendar" label="Booking status" value={s?.bookingStatus || 'No bookings yet'} meta={s?.bookingId} status={s?.bookingStatus} to="/dashboard/bookings" />
          <StatCard icon="card" label="Payment status" value={s?.paymentStatus || 'Nothing due'} meta={s?.amountDue} status={s?.paymentStatus} to="/dashboard/payments" />
        </div>

        <div className="overview-grid">
          <Panel title="Upcoming move" subtitle="Your next scheduled move at a glance." badge={move && <Badge>{move.status}</Badge>}>
            {move ? (
              <div className="upcoming">
                <ol className="route-line">
                  <li><small>Origin</small>{formatPlace(move.origin, { withAddress: true })}</li>
                  <li><small>Destination</small>{formatPlace(move.destination, { withAddress: true })}</li>
                </ol>
                <DetailRows rows={[['Date', fmtDate(move.moveDate)], ['Move ID', move.id], ['Status', move.status]]} />
                <div className="actions">
                  <Button to="/dashboard/moves" variant="dark">View move</Button>
                  <Button to="/dashboard/messages" variant="outline">Message support</Button>
                </div>
              </div>
            ) : (
              <EmptyState icon="truck" title="No upcoming move" text="When a move is booked, its route, date and status will appear here." action={<Button to="/quote" variant="outline" size="sm">Start a move request</Button>} />
            )}
          </Panel>

          <Panel title="Recent activity" subtitle="Latest updates to your account.">
            {data?.activity?.length ? (
              <ul className="activity">
                {data.activity.map((a) => (
                  <li key={a.id}>
                    <span className="activity-icon"><Icon name={ACTIVITY_ICON[a.type] || 'bell'} /></span>
                    <div><strong>{a.title}</strong><small>{fmtDate(a.at, { hour: 'numeric', minute: '2-digit' })}{a.reference ? ` · ${a.reference}` : ''}</small></div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon="bell" title="No activity yet" text="Quote updates, booking changes and new documents will be listed here." />
            )}
          </Panel>
        </div>
      </PortalLoader>
    </>
  );
}
