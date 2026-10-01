/** Request → Quote → Booked → Move day progress bar from the "Move details" panel. */
export default function ProgressTrack({ steps, current }) {
  return (
    <div className="progress-track">
      <ol>
        {steps.map((s, i) => <li key={s} className={i <= current ? 'is-done' : ''}><span className="bar" /><span>{s}</span></li>)}
      </ol>
      <p className="sr-only">Progress: {current >= 0 ? steps[current] : 'not started'}</p>
    </div>
  );
}
