import Notice from '../common/Notice.jsx';

/** Form-level error or success message shown above the submit button. */
export default function FormAlert({ error, success }) {
  if (error) return <Notice tone="error">{error}</Notice>;
  if (success) return <Notice tone="success">{success}</Notice>;
  return null;
}
