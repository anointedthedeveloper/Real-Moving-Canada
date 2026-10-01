export default function AuthHeading({ title, text }) {
  return (
    <div className="auth-heading">
      <h1>{title}</h1>
      {text && <p className="muted">{text}</p>}
    </div>
  );
}
