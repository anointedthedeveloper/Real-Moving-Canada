import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Icon from '../../components/common/Icon.jsx';
import Switch from '../../components/forms/Switch.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import PageIntro from '../../components/dashboard/PageIntro.jsx';
import Panel from '../../components/dashboard/Panel.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { updateSettings } from '../../services/portalService.js';
import { useAuth } from '../../context/AuthContext.jsx';

const SECTIONS = [
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'security', label: 'Security', icon: 'lock' },
  { id: 'account', label: 'Account', icon: 'user' },
];

const PREFS = [
  { key: 'moveUpdates', label: 'Move updates', description: 'Schedule changes and move status updates.' },
  { key: 'quoteUpdates', label: 'Quote updates', description: 'Notifications when a quote is ready or changes.' },
  { key: 'paymentUpdates', label: 'Payment updates', description: 'Payment confirmations, receipts, and amount-due reminders.' },
  { key: 'documentUpdates', label: 'Document updates', description: 'Notifications when a document is added.' },
];

export default function SettingsPage() {
  useDocumentTitle('Settings', undefined, { noindex: true });
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('notifications');
  const [prefs, setPrefs] = useState({ moveUpdates: true, quoteUpdates: true, paymentUpdates: true, documentUpdates: false });
  const [save, setSave] = useState({ busy: false, error: '', done: false });

  const onSave = async () => {
    setSave({ busy: true, error: '', done: false });
    try {
      await updateSettings({ notifications: prefs });
      setSave({ busy: false, error: '', done: true });
    } catch (err) {
      setSave({ busy: false, error: err.message, done: false });
    }
  };

  return (
    <>
      <PageIntro title="Settings" text="Choose how you receive updates and manage account security." />
      <div className="settings-grid">
        <nav className="settings-nav" aria-label="Settings sections">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={section === s.id ? 'is-active' : ''} onClick={() => setSection(s.id)}><Icon name={s.icon} />{s.label}</a>
          ))}
        </nav>
        <div className="stack">
          <Panel title="Notification preferences" subtitle="Choose which account events should trigger updates." as="section">
            <div id="notifications">
              {PREFS.map((p) => (
                <Switch key={p.key} label={p.label} description={p.description} checked={prefs[p.key]} onChange={(v) => { setPrefs((x) => ({ ...x, [p.key]: v })); setSave((s) => ({ ...s, done: false })); }} />
              ))}
            </div>
            <FormAlert error={save.error} success={save.done && 'Your preferences were saved.'} />
            <div className="actions mt-1"><Button onClick={onSave} loading={save.busy}>Save preferences</Button></div>
          </Panel>
          <Panel title="Security" as="section">
            <div id="security" className="setting-rows">
              <div className="setting-row"><div><strong>Password</strong><small>Reset your password by email.</small></div><Button to="/forgot-password" variant="outline" size="sm">Change password</Button></div>
              <div className="setting-row"><div><strong>Active sessions</strong><small>Sign out if you used a shared device.</small></div><Button variant="outline" size="sm" onClick={async () => { await logout(); navigate('/signed-out', { replace: true }); }}>Sign out</Button></div>
            </div>
          </Panel>
          <Panel title="Account" as="section">
            <div id="account" className="setting-rows">
              <div className="setting-row"><div><strong>Personal details</strong><small>Update your name, email, phone and address.</small></div><Button to="/dashboard/profile" variant="outline" size="sm">Edit profile</Button></div>
              <div className="setting-row"><div><strong>Close your account</strong><small>Contact us and we’ll help with your request.</small></div><Button to="/contact" variant="ghost" size="sm">Contact us</Button></div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
