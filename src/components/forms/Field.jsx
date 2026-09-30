import { cloneElement, useId } from 'react';

/**
 * Label + control + hint + error wrapper. Wires up ids, aria-describedby and
 * aria-invalid on the single child control so every field is accessible.
 */
export default function Field({ label, hint, error, optional, children, className = '', id: idProp, labelHidden }) {
  const autoId = useId();
  const id = idProp || `f${autoId.replace(/:/g, '')}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className={labelHidden ? 'sr-only' : undefined}>
          {label}{optional && <span className="optional"> (optional)</span>}
        </label>
      )}
      {cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': error ? 'true' : undefined })}
      {hint && <p className="field-hint" id={hintId}>{hint}</p>}
      {error && <p className="field-error" id={errorId}>{error}</p>}
    </div>
  );
}
