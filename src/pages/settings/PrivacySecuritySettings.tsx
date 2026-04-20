import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  MonitorSmartphone,
  Save,
  ShieldCheck,
  X,
} from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

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
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
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
      className="p-2 text-[var(--color-text-tertiary)] transition-smooth hover:text-[var(--color-text-primary)]"
    >
      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <SettingsPageLayout
      title="Privacy & Security"
      description="Manage account protection, session visibility, and how GutWise handles sensitive health data."
    >
      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[28px]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Account Password</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            A strong password keeps your health data accessible only to you.
          </p>

          {!showPasswordForm ? (
            <div className="mt-5">
              <Button variant="secondary" onClick={() => setShowPasswordForm(true)}>
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="current_password" className="field-label mb-2 block">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="current_password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-base w-full pr-12"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
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
              </div>

              <div>
                <label htmlFor="new_password" className="field-label mb-2 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="new_password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-base w-full pr-12"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
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
              </div>

              <div>
                <label htmlFor="confirm_password" className="field-label mb-2 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirm_password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-base w-full pr-12"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
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
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button disabled={saving} onClick={handleChangePassword}>
                  <Save className="mr-2 h-4 w-4" />
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
          )}
        </Card>

        <Card variant="flat" className="rounded-[28px]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Two-Factor Authentication
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            Adds a second verification step at sign-in. Useful if you share a device or want an
            extra layer of protection.
          </p>

          <div className="surface-panel-quiet mt-5 flex items-center justify-between rounded-[24px] p-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Enable 2FA</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Verify your identity with a second step at sign-in.
              </p>
            </div>

            <Button variant="ghost" disabled>
              Coming Soon
            </Button>
          </div>
        </Card>

        <Card variant="flat" className="rounded-[28px]">
          <div className="flex items-start gap-3">
            <MonitorSmartphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-text-tertiary)]" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                Active Session
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                You&apos;re signed in on this device. Only one session is shown at a time.
              </p>
              <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                Signed in as {user?.email}
              </p>
            </div>
          </div>
        </Card>

        <Card
          variant="flat"
          className="rounded-[28px] border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.06)]"
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
