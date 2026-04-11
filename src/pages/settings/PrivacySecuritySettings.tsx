import { useState } from 'react';
import { Lock, Eye, EyeOff, Save, X, ShieldCheck, MonitorSmartphone } from 'lucide-react';
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

      setMessage('Password updated. You\'ll be signed out momentarily.');
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
      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
    >
      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <SettingsPageLayout
      title="Privacy & Security"
      description="Control how your account is secured and how your health data is handled"
    >
      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-100 mb-1">Account Password</h3>
          <p className="text-sm text-gray-100 mb-4">
            A strong password keeps your health data accessible only to you.
          </p>

          {!showPasswordForm ? (
            <Button
              variant="outline"
              onClick={() => setShowPasswordForm(true)}
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-100 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="current_password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10"
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center">
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
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="new_password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10"
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center">
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
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirm_password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10"
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center">
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

              <div className="flex gap-3 pt-2">
                <Button disabled={saving} onClick={handleChangePassword}>
                  <Save className="h-4 w-4 mr-2" />
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

        <Card>
          <h3 className="text-lg font-semibold text-gray-100 mb-1">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500 mb-4">
            Adds a second verification step when signing in — useful if you share a device or want extra protection for your health data.
          </p>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Enable 2FA</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Verify your identity with a second step at sign-in
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <MonitorSmartphone className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-1">Active Session</h3>
              <p className="text-sm text-gray-500">
                You're signed in on this device. Only one session is shown at a time.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Signed in as {user?.email}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Your data is private by design</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  GutWise stores your health data securely and encrypted. It is never sold, shared with advertisers, or used to train models outside your own insights.
                </p>
                <p>
                  You can export or permanently delete your data at any time from{' '}
                  <a href="/settings/data" className="text-brand-600 hover:text-brand-700 font-medium">
                    Data Management
                  </a>.
                </p>
                <a
                  href="/privacy"
                  className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium transition-colors mt-1"
                >
                  Read our full Privacy Policy
                  <span className="ml-1">→</span>
                </a>
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <Card className="bg-red-50 border border-red-200">
            <div className="flex items-start gap-3">
              <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {message && (
          <Card className="bg-green-50 border border-green-200">
            <div className="flex items-start gap-3">
              <Save className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">{message}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </SettingsPageLayout>
  );
}
