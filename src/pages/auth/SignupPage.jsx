import { Link, useNavigate } from 'react-router-dom';
import AuthHeading from '../../components/auth/AuthHeading.jsx';
import Button from '../../components/common/Button.jsx';
import TextField from '../../components/forms/TextField.jsx';
import PasswordField from '../../components/forms/PasswordField.jsx';
import Checkbox from '../../components/forms/Checkbox.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import { useForm } from '../../hooks/useForm.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { required, email, minLength, matches, checked } from '../../utils/validation.js';

export default function SignupPage() {
  useDocumentTitle('Sign up', undefined, { noindex: true });
  const { signup } = useAuth();
  const navigate = useNavigate();
  const form = useForm({
    initialValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', terms: false },
    schema: {
      firstName: required('Enter your first name.'),
      lastName: required('Enter your last name.'),
      email: [required('Enter your email address.'), email()],
      password: [required('Choose a password.'), minLength(8, 'Use at least 8 characters.')],
      confirmPassword: [required('Confirm your password.'), matches((v) => v.password, 'Passwords don’t match.')],
      terms: checked('Please accept the terms to continue.'),
    },
  });

  const onSubmit = form.handleSubmit(async ({ confirmPassword: _c, terms: _t, ...details }) => {
    await signup(details);
    navigate('/dashboard', { replace: true });
  });

  return (
    <>
      <AuthHeading title="Sign Up" text="Create an account to keep your move details together." />
      <form onSubmit={onSubmit} noValidate className="auth-form">
        <div className="form-grid cols-2">
          <TextField label="First name" autoComplete="given-name" {...form.field('firstName')} />
          <TextField label="Last name" autoComplete="family-name" {...form.field('lastName')} />
        </div>
        <TextField label="Email" type="email" autoComplete="email" {...form.field('email')} />
        <PasswordField autoComplete="new-password" hint="At least 8 characters." {...form.field('password')} />
        <PasswordField label="Confirm password" autoComplete="new-password" {...form.field('confirmPassword')} />
        <Checkbox label={<>I agree to the <Link to="/terms" className="link">Terms</Link> and <Link to="/privacy" className="link">Privacy policy</Link></>} {...form.checkbox('terms')} />
        <FormAlert error={form.formError} />
        <Button type="submit" block loading={form.submitting} iconRight="arrow-right">{form.submitting ? 'Creating account…' : 'Create account'}</Button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login" className="link">Sign in</Link></p>
    </>
  );
}
