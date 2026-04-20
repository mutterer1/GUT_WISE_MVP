import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  MonitorSmartphone,
  Save,
  ShieldCheck,
  X,
  KeyRound,
  Sparkles,
  BadgeCheck,
} from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const fieldClassName =
  'w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-smooth placeholder:text-[var(--color-text-tertiary)] focus:border-[rgba(84,160,255,0.32)] focus:bg-[rgba(255,255,255,0.06)]';

const labelClassName =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]';

export default function PrivacySecuritySettings() {
  const { user, signOut } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setMessage('');
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setMessage("Password updated. You'll be signed out momentarily.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);

      setTimeout(() => {
        setMessage('');
        signOut();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const PasswordToggle = ({
    isVisible,
    onClick,
  }: {
    isVisible: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-[var(--color-text-tertiary)] transition-smooth hover:bg-white/[0.04] hover:text-[var(--color-text-primary)]"
    >
      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <SettingsPageLayout
      title="Privacy & Security"
      description="Manage account protection, session visibility, and the trust boundary around sensitive health data."
    >
      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[30px] overflow-hidden">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div>
              <span className="badge-secondary mb-3 inline-flex">Account Protection</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Keep access disciplined and your health data private by default
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                GutWise should feel like a private clinical workspace. These controls protect your
                account, limit unintended exposure, and preserve trust in the data boundary.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricTile
                  label="Password"
                  value="Active"
                  helper="Primary sign-in protection"
                  tone="primary"
                />
                <MetricTile
                  label="2FA"
                  value="Soon"
                  helper="Secondary verification layer"
                  tone="secondary"
                />
                <MetricTile
                  label="Session"
                  value="1"
                  helper="Visible active device"
                  tone="neutral"
                />
              </div>
            </div>

            <div className="surface-panel-soft rounded-[26px] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[var(--color-text-primary)]">
                    Private by design
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                    Password changes, session awareness, and data export or deletion controls all
                    live inside one focused security workspace.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.025)] p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-secondary)]" />
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    Strong security should stay quiet and predictable. Change only what you need,
                    then return to the rest of the product with confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="rounded-[30px]">
          <div className="flex items-center gap-3 border-b border-white/8 pb-5">
            <KeyRound className="h-5 w-5 text-[var(--color-accent-primary)]" />
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Account Password
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                Maintain the primary credential protecting your account.
              </p>
            </div>
          </div>

          {!showPasswordForm ? (
            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                  A strong password helps keep your health data accessible only to you. Update it if
                  you suspect reuse, compromise, or just want tighter account hygiene.
                </p>
              </div>

              <div className="lg:w-[220px]">
                <Button variant="secondary" onClick={() => setShowPasswordForm(true)} className="w-full">
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <div>
                  <label htmlFor="current_password" className={labelClassName}>
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      id="current_password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`${fieldClassName} pr-12`}
                    />
                    <PasswordToggle
                      isVisible={showPasswords.current}
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="new_password" className={labelClassName}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      id="new_password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${fieldClassName} pr-12`}
                    />
                    <PasswordToggle
                      isVisible={showPasswords.new}
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm_password" className={labelClassName}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      id="confirm_password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${fieldClassName} pr-12`}
                    />
                    <PasswordToggle
                      isVisible={showPasswords.confirm}
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button disabled={saving} onClick={handleChangePassword}>
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Update Password'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Card variant="flat" className="rounded-[24px]">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                    Password Guidance
                  </p>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    <p>Use a unique password you do not reuse on other services.</p>
                    <p>Longer passphrases are usually more durable than short complex strings.</p>
                    <p>You will be signed out after a successful password update.</p>
                  </div>
                </Card>

                <Card
                  variant="discovery"
                  glowIntensity="subtle"
                  className="rounded-[24px] border-[rgba(133,93,255,0.14)]"
                >
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-5 w-5 text-[var(--color-accent-secondary)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Credential hygiene matters
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        If you suspect reuse or exposure, rotate the password before doing anything
                        else in the app.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Card>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card variant="flat" className="rounded-[30px]">
            <div className="flex items-center gap-3 border-b border-white/8 pb-5">
              <ShieldCheck className="h-5 w-5 text-[var(--color-accent-primary)]" />
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Two-Factor Authentication
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                  Secondary verification for sensitive access.
                </p>
              </div>
            </div>

            <div className="surface-panel-quiet mt-5 flex items-center justify-between gap-4 rounded-[24px] p-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Enable 2FA</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Add a second verification step at sign-in for stronger account protection.
                </p>
              </div>

              <Button variant="ghost" disabled>
                Coming Soon
              </Button>
            </div>
          </Card>

          <Card variant="flat" className="rounded-[30px]">
            <div className="flex items-center gap-3 border-b border-white/8 pb-5">
              <MonitorSmartphone className="h-5 w-5 text-[var(--color-accent-primary)]" />
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Active Session
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                  Device visibility for the current sign-in.
                </p>
              </div>
            </div>

            <div className="surface-panel-quiet mt-5 rounded-[24px] p-4">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                You&apos;re signed in on this device
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Only one session is shown at a time in the current product experience.
              </p>
              <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
                Signed in as {user?.email}
              </p>
            </div>
          </Card>
        </div>

        <Card
          variant="flat"
          className="rounded-[30px] border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.06)]"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                Your data is private by design
              </h3>
              <div className="mt-2 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                <p>
                  GutWise stores your health data securely and encrypted. It is never sold, shared
                  with advertisers, or used to train models outside your own insights.
                </p>
                <p>
                  You can export or permanently delete your data at any time from{' '}
                  <a
                    href="/settings/data-management"
                    className="font-medium text-[var(--color-accent-primary)] transition-smooth hover:text-[var(--color-text-primary)]"
                  >
                    Data Management
                  </a>
                  .
                </p>
                <a
                  href="/privacy"
                  className="inline-flex items-center font-medium text-[var(--color-accent-primary)] transition-smooth hover:text-[var(--color-text-primary)]"
                >
                  Read our full Privacy Policy
                  <span className="ml-1">→</span>
                </a>
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <Card
            variant="flat"
            className="rounded-[24px] border-[rgba(255,120,120,0.2)] bg-[rgba(255,120,120,0.06)]"
          >
            <div className="flex items-start gap-3">
              <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-danger)]" />
              <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>
            </div>
          </Card>
        )}

        {message && (
          <Card
            variant="flat"
            className="rounded-[24px] border-[rgba(84,160,255,0.2)] bg-[rgba(84,160,255,0.06)]"
          >
            <div className="flex items-start gap-3">
              <Save className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
              <p className="text-sm font-medium text-[var(--color-accent-primary)]">{message}</p>
            </div>
          </Card>
        )}
      </div>
    </SettingsPageLayout>
  );
}

function MetricTile({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: 'primary' | 'secondary' | 'neutral';
}) {
  const toneClassName =
    tone === 'primary'
      ? 'border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)]'
      : tone === 'secondary'
        ? 'border-[rgba(133,93,255,0.16)] bg-[rgba(133,93,255,0.08)]'
        : 'border-white/8 bg-[rgba(255,255,255,0.03)]';

  return (
    <div className={`rounded-[22px] border px-4 py-4 ${toneClassName}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{helper}</p>
    </div>
  );
}
