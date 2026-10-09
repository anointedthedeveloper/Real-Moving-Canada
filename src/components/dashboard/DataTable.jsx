/**
 * Accessible table that stacks into cards on phones (each cell shows its column
 * label). `empty` renders inside the table when there are no rows.
 */
export default function DataTable({ columns, rows, rowKey = 'id', empty, caption }) {
  return (
    <div className="table-wrap stack">
      <table className="table stack">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>{columns.map((c) => <th key={c.key} scope="col">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((c) => <td key={c.key} data-label={c.label}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>)}
            </tr>
          )) : (
            <tr className="table-empty"><td colSpan={columns.length}>{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
