import { Link, useSearchParams } from 'react-router-dom';
import AuthHeading from '../../components/auth/AuthHeading.jsx';
import Button from '../../components/common/Button.jsx';
import Notice from '../../components/common/Notice.jsx';
import PasswordField from '../../components/forms/PasswordField.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import { useForm } from '../../hooks/useForm.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { resetPassword } from '../../services/authService.js';
import { required, minLength, matches } from '../../utils/validation.js';

/** Reached from the emailed link: /reset-password?token=… */
export default function ResetPasswordPage() {
  useDocumentTitle('Reset password');
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const form = useForm({
    initialValues: { password: '', confirmPassword: '' },
    schema: {
      password: [required('Choose a new password.'), minLength(8, 'Use at least 8 characters.')],
      confirmPassword: [required('Confirm your new password.'), matches((v) => v.password, 'Passwords don’t match.')],
    },
  });

  return (
    <>
      <AuthHeading title="Reset Password" text="Choose a new password for your account." />
      {!token && (
        <Notice tone="warning" className="mb-1">This page needs the link from your password reset email. <Link to="/forgot-password" className="link">Request a new link</Link>.</Notice>
      )}
      {form.status === 'success' ? (
        <Notice tone="success" title="Password updated">You can now sign in with your new password.</Notice>
      ) : (
        <form onSubmit={form.handleSubmit(({ password }) => resetPassword({ token, password }))} noValidate className="auth-form">
          <PasswordField label="New password" autoComplete="new-password" hint="At least 8 characters." {...form.field('password')} />
          <PasswordField label="Confirm password" autoComplete="new-password" {...form.field('confirmPassword')} />
          <FormAlert error={form.formError} />
          <Button type="submit" block loading={form.submitting} disabled={!token} iconRight="arrow-right">Reset password</Button>
        </form>
      )}
      <p className="auth-switch"><Link to="/login" className="link">Back to login</Link></p>
    </>
  );
}
