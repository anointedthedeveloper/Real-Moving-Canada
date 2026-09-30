import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Icon from '../../components/common/Icon.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import PageIntro from '../../components/dashboard/PageIntro.jsx';
import Panel from '../../components/dashboard/Panel.jsx';
import DataTable from '../../components/dashboard/DataTable.jsx';
import FilterTabs from '../../components/dashboard/FilterTabs.jsx';
import PortalLoader from '../../components/dashboard/PortalLoader.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { fetchPayments } from '../../services/portalService.js';
import { fmtDate, money } from '../../utils/format.js';

const TABS = [
  { value: 'history', label: 'Payment history' },
  { value: 'documents', label: 'Invoices & receipts' },
];

const COLUMNS = [
  { key: 'date', label: 'Date', render: (r) => fmtDate(r.date) },
  { key: 'reference', label: 'Reference' },
  { key: 'amount', label: 'Amount', render: (r) => money(r.amount) },
  { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
  {
    key: 'file', label: 'File', render: (r) => (r.fileUrl
      ? <a className="icon-link" href={r.fileUrl} download aria-label={`Download ${r.reference}`}><Icon name="download" /></a>
      : '—'),
  },
];

export default function PaymentsPage() {
  useDocumentTitle('Payments');
  const { data, loading, error, reload } = useAsync(fetchPayments);
  const [tab, setTab] = useState('history');
  const records = data?.items || [];
  const due = records.find((r) => String(r.status).toLowerCase() === 'due');
  const rows = records.filter((r) => (tab === 'history' ? r.type !== 'document' : r.fileUrl));

  return (
    <>
      <PageIntro title="Payments" text="Review amount due, make a payment, and access invoices or receipts." />
      <PortalLoader loading={loading} error={error} reload={reload}>
        <div className="payments-grid">
          <div className="stack">
            <Panel dark className="amount-due">
              <p className="kicker kicker-plain">Amount due</p>
              <p className="amount">{due ? money(due.amount) : money(0)}</p>
              <p className="amount-meta">{due ? `${due.bookingId} · Due ${fmtDate(due.dueDate)}` : 'No balance is due right now.'}</p>
              <Button to={due ? `/dashboard/payments/pay?booking=${encodeURIComponent(due.bookingId)}` : '/dashboard/payments/pay'} block disabled={!due}>Make a payment</Button>
            </Panel>
            <Panel title="Payment method" action={<Button variant="link" size="sm" to="/dashboard/settings">Manage</Button>}>
              <div className="method-row">
                <span className="icon-tile"><Icon name="card" /></span>
                <div><strong>No saved payment method</strong><small>You can save one when you make a payment.</small></div>
              </div>
            </Panel>
          </div>
          <Panel>
            <FilterTabs label="Payment records" variant="underline" options={TABS} value={tab} onChange={setTab} />
            <div className="mt-1">
              <DataTable
                caption="Payment records" columns={COLUMNS} rows={rows}
                empty={<EmptyState icon="card" title="No payment records yet" text="Future invoices, payments, and receipts will appear here." action={<Button to="/dashboard/bookings" variant="outline" size="sm">View bookings</Button>} />}
              />
            </div>
          </Panel>
        </div>
      </PortalLoader>
    </>
  );
}
