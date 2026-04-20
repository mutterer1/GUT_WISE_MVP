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
      description: 'Receive important updates and announcements via email.',
    },
    {
      key: 'push' as const,
      label: 'Push Notifications',
      description: 'Get real-time alerts on your device.',
    },
    {
      key: 'dailyDigest' as const,
      label: 'Daily Digest',
      description: 'Receive a summary of your daily health activities.',
    },
    {
      key: 'insights' as const,
      label: 'Insights & Patterns',
      description: 'Get notified when GutWise finds meaningful patterns.',
    },
    {
      key: 'reminders' as const,
      label: 'Reminders',
      description: 'Receive prompts to keep your tracking cadence consistent.',
    },
    {
      key: 'weeklyReport' as const,
      label: 'Weekly Report',
      description: 'Receive a broader weekly summary of your health picture.',
    },
  ];

  return (
    <SettingsPageLayout
      title="Notification Settings"
      description="Control how and when GutWise reaches you across reminders, insights, and summary updates."
    >
      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[28px]">
          <div className="space-y-4">
            {notificationOptions.map((option) => (
              <div
                key={option.key}
                className="surface-panel-quiet flex items-center justify-between gap-4 rounded-[24px] p-4"
              >
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    {option.label}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {option.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => togglePreference(option.key)}
                  className={[
                    'relative ml-4 inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-smooth',
                    preferences[option.key] ? 'bg-[var(--color-accent-primary)]' : 'bg-white/12',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'inline-block h-5 w-5 rounded-full bg-white transition-transform',
                      preferences[option.key] ? 'translate-x-5' : 'translate-x-0',
                    ].join(' ')}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card
          variant="flat"
          className="rounded-[24px] border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.06)]"
        >
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Preferences can be changed at any time
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Changes take effect immediately after saving, so you can tune notification load
                without leaving the page.
              </p>
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

        <Button disabled={saving} onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
