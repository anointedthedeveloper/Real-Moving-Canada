/** Label/value pairs for detail panels. */
export default function DetailRows({ rows }) {
  return (
    <dl className="detail-rows">
      {rows.map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd>{value ?? '—'}</dd></div>
      ))}
    </dl>
  );
}
