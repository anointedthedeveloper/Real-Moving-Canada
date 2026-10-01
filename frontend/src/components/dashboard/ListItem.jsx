import Icon from '../common/Icon.jsx';
import Badge from '../common/Badge.jsx';

/** Selectable row (move, quote, booking) with icon, title, meta and status. */
export default function ListItem({ icon, title, meta, status, selected, onSelect }) {
  return (
    <button type="button" className={`list-item${selected ? ' is-selected' : ''}`} onClick={onSelect} aria-pressed={selected}>
      <span className="icon-tile"><Icon name={icon} /></span>
      <span className="list-item-body"><strong>{title}</strong>{meta && <small>{meta}</small>}</span>
      {status && <Badge>{status}</Badge>}
      <Icon name="chevron-right" className="list-item-arrow" />
    </button>
  );
}
