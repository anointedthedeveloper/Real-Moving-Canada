import Icon from './Icon.jsx';

/** FAQ list built on native <details>, so it works with keyboard and screen readers out of the box. */
export default function Accordion({ items, defaultOpen = 0 }) {
  return (
    <div className="accordion">
      {items.map((item, i) => (
        <details key={item.q} open={i === defaultOpen}>
          <summary>
            <span>{item.q}</span>
            <Icon name="plus" className="accordion-icon" />
          </summary>
          <div className="accordion-body"><p>{item.a}</p></div>
        </details>
      ))}
    </div>
  );
}
