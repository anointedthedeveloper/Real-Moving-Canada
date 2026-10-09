/** Segmented filter (Active / Accepted / Archived…) implemented as an ARIA tablist. */
export default function FilterTabs({ options, value, onChange, label, variant = 'pill' }) {
  const onKeyDown = (e) => {
    const i = options.findIndex((o) => o.value === value);
    const move = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!move) return;
    e.preventDefault();
    const next = options[(i + move + options.length) % options.length];
    onChange(next.value);
    e.currentTarget.parentElement.querySelector(`[data-value="${next.value}"]`)?.focus();
  };
  return (
    <div className={`tabs${variant === 'underline' ? ' underline' : ''}`} role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value} type="button" role="tab" className="tab" data-value={o.value}
          aria-selected={o.value === value} tabIndex={o.value === value ? 0 : -1}
          onClick={() => onChange(o.value)} onKeyDown={onKeyDown}
        >
          {o.label}{o.count != null && <span className="tab-count"> {o.count}</span>}
        </button>
      ))}
    </div>
  );
}
