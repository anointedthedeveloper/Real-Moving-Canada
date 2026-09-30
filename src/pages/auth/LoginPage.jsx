import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthHeading from '../../components/auth/AuthHeading.jsx';
import Button from '../../components/common/Button.jsx';
import TextField from '../../components/forms/TextField.jsx';
import PasswordField from '../../components/forms/PasswordField.jsx';
import Checkbox from '../../components/forms/Checkbox.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import { useForm } from '../../hooks/useForm.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { required, email } from '../../utils/validation.js';

export default function LoginPage() {
  useDocumentTitle('Login');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm({
    initialValues: { email: '', password: '', remember: false },
    schema: { email: [required('Enter your email address.'), email()], password: required('Enter your password.') },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await login(values);
    navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
  });

  return (
    <>
      <AuthHeading title="Login" text="Welcome back. Sign in to continue." />
      <form onSubmit={onSubmit} noValidate className="auth-form">
        <TextField label="Email" type="email" autoComplete="email" placeholder="you@example.com" {...form.field('email')} />
        <PasswordField autoComplete="current-password" {...form.field('password')} />
        <div className="auth-row">
          <Checkbox label="Remember me" {...form.checkbox('remember')} />
          <Link to="/forgot-password" className="link small">Forgot password?</Link>
        </div>
        <FormAlert error={form.formError} />
        <Button type="submit" block loading={form.submitting} iconRight="arrow-right">{form.submitting ? 'Signing in…' : 'Sign in'}</Button>
      </form>
      <p className="auth-switch">New to Real Moving Canada? <Link to="/signup" className="link">Sign up</Link></p>
      <p className="auth-note">Just need a price? <Link to="/quote" className="link">Get a quote</Link> — no account needed.</p>
    </>
  );
}
