/** Hidden spam trap that Formspree reads as `_gotcha` — real visitors never see or fill it. */
export default function Honeypot({ value, onChange }) {
  return (
    <div className="hp" aria-hidden="true">
      <label htmlFor="website-field">Leave this field empty</label>
      <input id="website-field" name="_gotcha" tabIndex={-1} autoComplete="off" value={value || ''} onChange={onChange} />
    </div>
  );
}
