import { Link } from 'react-router-dom';
import AuthHeading from '../../components/auth/AuthHeading.jsx';
import Button from '../../components/common/Button.jsx';
import Notice from '../../components/common/Notice.jsx';
import TextField from '../../components/forms/TextField.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import { useForm } from '../../hooks/useForm.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { requestPasswordReset } from '../../services/authService.js';
import { required, email } from '../../utils/validation.js';

export default function ForgotPasswordPage() {
  useDocumentTitle('Forgot password');
  const form = useForm({ initialValues: { email: '' }, schema: { email: [required('Enter your email address.'), email()] } });

  return (
    <>
      <AuthHeading title="Forgot Password" text="Enter your email and we’ll send a link to reset your password." />
      {form.status === 'success' ? (
        <Notice tone="success" title="Check your email">
          If an account exists for {form.values.email}, you’ll receive a password reset link shortly.
        </Notice>
      ) : (
        <form onSubmit={form.handleSubmit(requestPasswordReset)} noValidate className="auth-form">
          <TextField label="Email" type="email" autoComplete="email" {...form.field('email')} />
          <FormAlert error={form.formError} />
          <Button type="submit" block loading={form.submitting} iconRight="arrow-right">Continue</Button>
        </form>
      )}
      <p className="auth-switch"><Link to="/login" className="link">Return to login</Link></p>
    </>
  );
}
