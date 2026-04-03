import { useState, useEffect } from 'react';
import { Bell, Save, X } from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  dailyDigest: boolean;
  insights: boolean;
  reminders: boolean;
  weeklyReport: boolean;
}

export default function NotificationsSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: false,
    dailyDigest: false,
    insights: true,
    reminders: true,
    weeklyReport: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.id) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('notification_preferences')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data?.notification_preferences) {
          setPreferences((prev) => ({
            ...prev,
            ...data.notification_preferences,
          }));
        }
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
      }
    };

    fetchPreferences();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          notification_preferences: preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setMessage('Notification preferences updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notificationOptions = [
    {
      key: 'email' as const,
      label: 'Email Notifications',
      description: 'Receive important updates and announcements via email',
    },
    {
      key: 'push' as const,
      label: 'Push Notifications',
      description: 'Get real-time alerts on your device',
    },
    {
      key: 'dailyDigest' as const,
      label: 'Daily Digest',
      description: 'Summary of your daily health activities',
    },
    {
      key: 'insights' as const,
      label: 'Insights & Patterns',
      description: 'Notifications about health insights and patterns',
    },
    {
      key: 'reminders' as const,
      label: 'Reminders',
      description: 'Reminders to log your health data',
    },
    {
      key: 'weeklyReport' as const,
      label: 'Weekly Report',
      description: 'Comprehensive weekly health summary',
    },
  ];

  return (
    <SettingsPageLayout
      title="Notification Settings"
      description="Control how and when you receive updates"
    >
      <div className="space-y-6">
        <Card>
          <div className="space-y-4">
            {notificationOptions.map((option) => (
              <div
                key={option.key}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{option.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
                <button
                  onClick={() => togglePreference(option.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 flex-shrink-0 ${
                    preferences[option.key] ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences[option.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                You can manage your notification preferences at any time
              </p>
              <p className="text-sm text-blue-800 mt-1">
                Changes will take effect immediately after saving
              </p>
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

        <Button disabled={saving} onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
