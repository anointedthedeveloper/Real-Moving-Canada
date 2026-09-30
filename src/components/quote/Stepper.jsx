import Icon from '../common/Icon.jsx';

/** Progress indicator for the quote flow. Completed steps can be revisited. */
export default function Stepper({ steps, current, onSelect }) {
  return (
    <nav className="stepper" aria-label="Quote progress">
      <ol>
        {steps.map((label, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          const content = (
            <>
              <span className="stepper-dot">{state === 'done' ? <Icon name="check" /> : i + 1}</span>
              <span className="stepper-label">{label}</span>
            </>
          );
          return (
            <li key={label} className={`is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
              {state === 'done' && onSelect
                ? <button type="button" onClick={() => onSelect(i)} aria-label={`Step ${i + 1}: ${label} (completed) — edit`}>{content}</button>
                : <span>{content}</span>}
            </li>
          );
        })}
      </ol>
      <p className="stepper-mobile">Step {current + 1} of {steps.length} · <strong>{steps[current]}</strong></p>
    </nav>
  );
}
