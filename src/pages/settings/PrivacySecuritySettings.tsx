import { useState } from 'react';
import { Lock, Eye, EyeOff, Save, X, AlertCircle } from 'lucide-react';
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

      setMessage('Password changed successfully');
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
      description="Manage your data privacy and security settings"
    >
      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>

          {!showPasswordForm ? (
            <Button
              variant="outline"
              onClick={() => setShowPasswordForm(true)}
            >
              <Lock className="h-4 w-4 mr-2" />
              Update Password
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Enable 2FA</p>
              <p className="text-sm text-gray-600 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">Current Session</p>
              <p className="text-sm text-gray-600 mt-2">
                Browser: {typeof navigator !== 'undefined' ? navigator.userAgent.split('(')[0].trim() : 'Unknown'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You're currently logged in on this device
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Policy</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Your data privacy is important to us. Review our privacy policy to understand how we collect, use, and protect your information.
            </p>
            <a
              href="/privacy"
              className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              View Privacy Policy
              <span className="ml-2">→</span>
            </a>
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
