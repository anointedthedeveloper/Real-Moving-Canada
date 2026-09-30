import { useEffect } from 'react';
import Button from '../../components/common/Button.jsx';
import Icon from '../../components/common/Icon.jsx';
import TextField from '../../components/forms/TextField.jsx';
import SelectField from '../../components/forms/SelectField.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import PageIntro from '../../components/dashboard/PageIntro.jsx';
import Panel from '../../components/dashboard/Panel.jsx';
import DetailRows from '../../components/dashboard/DetailRows.jsx';
import PortalLoader from '../../components/dashboard/PortalLoader.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useForm } from '../../hooks/useForm.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchProfile, updateProfile } from '../../services/portalService.js';
import { CONTACT_METHODS, PROVINCE_OPTIONS } from '../../constants/options.js';
import { required, email, phone } from '../../utils/validation.js';
import { fmtDate, formatPostal } from '../../utils/format.js';

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', street: '', city: '', province: '', postalCode: '', contactMethod: '' };

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(fetchProfile);
  const form = useForm({
    initialValues: EMPTY,
    schema: { firstName: required('Enter your first name.'), lastName: required('Enter your last name.'), email: [required('Enter your email address.'), email()], phone: phone() },
  });

  useEffect(() => {
    const p = data?.profile || user;
    if (p) form.reset({ ...EMPTY, ...p });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, user]);

  const name = `${form.values.firstName} ${form.values.lastName}`.trim();
  const saveId = 'profile-form';

  return (
    <>
      <PageIntro title="Profile" text="Keep your contact details current for move communications."
        action={<Button type="submit" form={saveId} loading={form.submitting}>Save changes</Button>} />
      <PortalLoader loading={loading} error={error} reload={reload}>
        <div className="profile-grid">
          <Panel className="profile-card">
            <span className="profile-avatar"><Icon name="user" /></span>
            <h3>{name || 'Your name'}</h3>
            <p className="muted small">{form.values.email || 'Email address'}</p>
            <DetailRows rows={[['Customer since', fmtDate(data?.profile?.createdAt)], ['Active moves', data?.profile?.activeMoves ?? '—'], ['Account status', data?.connected ? 'Active' : 'Preview']]} />
          </Panel>
          <Panel>
            <form id={saveId} onSubmit={form.handleSubmit(updateProfile)} noValidate>
              <h3>Personal information</h3>
              <div className="form-grid cols-2">
                <TextField label="First name" autoComplete="given-name" {...form.field('firstName')} />
                <TextField label="Last name" autoComplete="family-name" {...form.field('lastName')} />
                <TextField label="Email address" type="email" autoComplete="email" {...form.field('email')} />
                <TextField label="Phone number" type="tel" autoComplete="tel" optional {...form.field('phone')} />
              </div>
              <h3 className="mt-2">Address information</h3>
              <div className="form-grid cols-3">
                <TextField className="span-all" label="Street address" autoComplete="street-address" optional {...form.field('street')} />
                <TextField label="City" autoComplete="address-level2" optional {...form.field('city')} />
                <SelectField label="Province / territory" optional options={PROVINCE_OPTIONS.slice(0, -1)} placeholder="Select…" {...form.field('province')} />
                <TextField label="Postal code" autoComplete="postal-code" optional {...form.field('postalCode')} onBlur={(e) => form.setValue('postalCode', formatPostal(e.target.value))} />
                <SelectField className="span-all" label="Preferred contact method" optional options={CONTACT_METHODS} {...form.field('contactMethod')} />
              </div>
              <FormAlert error={form.formError} success={form.status === 'success' && 'Your profile was saved.'} />
              <div className="actions mt-1">
                <Button type="submit" loading={form.submitting}>Save changes</Button>
                <Button variant="outline" onClick={() => form.reset({ ...EMPTY, ...(data?.profile || user) })}>Cancel</Button>
              </div>
            </form>
          </Panel>
        </div>
      </PortalLoader>
    </>
  );
}
