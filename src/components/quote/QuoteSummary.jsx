import { CONTACT_METHODS, MOVE_TYPES, PROPERTY_TYPES, PROPERTY_SIZES, labelFor } from '../../constants/options.js';
import { formatPlace, fmtDate } from '../../utils/format.js';
import { QUOTE_SERVICES } from './quoteModel.js';

const Row = ({ label, children }) => (
  <div className="summary-row"><dt>{label}</dt><dd>{children || '—'}</dd></div>
);

/** Review-step sections, each with an Edit button that jumps back to its step. */
export default function QuoteSummary({ values: v, onEdit }) {
  const sections = [
    {
      title: 'Customer details', step: 0,
      rows: [
        ['Name', `${v.firstName} ${v.lastName}`.trim()],
        ['Email', v.email],
        ['Phone', v.phone],
        ['Contact method', labelFor(CONTACT_METHODS, v.contactMethod)],
      ],
    },
    {
      title: 'Move details', step: 1,
      rows: [
        ['Route', `${formatPlace(v.origin, { withAddress: true })} → ${formatPlace(v.destination, { withAddress: true })}`],
        ['Date', fmtDate(v.moveDate)],
        ['Move type', labelFor(MOVE_TYPES, v.moveType)],
        ['Properties', `${labelFor(PROPERTY_TYPES, v.origin.propertyType)} → ${labelFor(PROPERTY_TYPES, v.destination.propertyType)}`],
        ['Rooms', `${labelFor(PROPERTY_SIZES, v.origin.rooms)} → ${v.destination.rooms ? labelFor(PROPERTY_SIZES, v.destination.rooms) : '—'}`],
      ],
    },
    {
      title: 'Services / Items', step: 2,
      rows: [
        ['Selected services', v.services.map((s) => labelFor(QUOTE_SERVICES, s)).join(' · ')],
        ['Heavy items', v.heavyItems],
        ['Storage', v.storageDetails],
        ['Notes', v.notes],
      ],
    },
  ];

  return (
    <div className="summary">
      {sections.map((s) => (
        <section className="summary-section" key={s.title} aria-label={s.title}>
          <header>
            <h3>{s.title}</h3>
            {onEdit && <button type="button" className="btn-link btn" onClick={() => onEdit(s.step)}>Edit<span className="sr-only"> {s.title.toLowerCase()}</span></button>}
          </header>
          <dl>{s.rows.map(([label, value]) => <Row key={label} label={label}>{value}</Row>)}</dl>
        </section>
      ))}
    </div>
  );
}
