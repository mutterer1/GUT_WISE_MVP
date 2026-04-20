import { useState, useEffect } from 'react';
import {
  Bell,
  Save,
  X,
  Mail,
  Smartphone,
  Sparkles,
  CalendarRange,
  AlarmClock,
  ShieldCheck,
} from 'lucide-react';
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

const notificationOptions = [
  {
    key: 'email' as const,
    label: 'Email Notifications',
    description: 'Receive account updates and important GutWise communication by email.',
    icon: Mail,
    tone: 'primary' as const,
  },
  {
    key: 'push' as const,
    label: 'Push Notifications',
    description: 'Allow real-time alerts on supported devices when timely action matters.',
    icon: Smartphone,
    tone: 'neutral' as const,
  },
  {
    key: 'dailyDigest' as const,
    label: 'Daily Digest',
    description: 'Get a compact daily summary of recent logging activity and signals.',
    icon: CalendarRange,
    tone: 'neutral' as const,
  },
  {
    key: 'insights' as const,
    label: 'Insights & Patterns',
    description: 'Be notified when GutWise identifies a potentially meaningful pattern.',
    icon: Sparkles,
    tone: 'secondary' as const,
  },
  {
    key: 'reminders' as const,
    label: 'Reminders',
    description: 'Receive prompts that help keep your tracking cadence consistent.',
    icon: AlarmClock,
    tone: 'primary' as const,
  },
  {
    key: 'weeklyReport' as const,
    label: 'Weekly Report',
    description: 'Receive a broader summary of your week in one scheduled update.',
    icon: Bell,
    tone: 'secondary' as const,
  },
];

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

      setMessage('Notification preferences updated successfully.');
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

  const enabledCount = Object.values(preferences).filter(Boolean).length;

  return (
    <SettingsPageLayout
      title="Notification Settings"
      description="Control how and when GutWise reaches you so alerts stay useful, disciplined, and easy to trust."
    >
      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[30px] overflow-hidden">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div>
              <span className="badge-secondary mb-3 inline-flex">Attention Control</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Keep notification volume intentional
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Configure reminders, summaries, and pattern alerts so GutWise surfaces what matters
                without creating background noise.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricTile
                  label="Enabled"
                  value={String(enabledCount)}
                  helper="Active notification channels"
                  tone="primary"
                />
                <MetricTile
                  label="Insights"
                  value={preferences.insights ? 'On' : 'Off'}
                  helper="Pattern detection alerts"
                  tone="secondary"
                />
                <MetricTile
                  label="Control"
                  value="Manual"
                  helper="Changed only when you save"
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
                    Immediate, reversible changes
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                    Save once and your account notification defaults update immediately across the
                    signed-in workspace.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.025)] p-4">
                <div className="flex items-start gap-3">
                  <Bell className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    Use fewer channels by default. A quieter clinical product feels more trustworthy
                    than one that constantly asks for attention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="rounded-[30px]">
          <div className="flex items-center gap-3 border-b border-white/8 pb-5">
            <Bell className="h-5 w-5 text-[var(--color-accent-primary)]" />
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Notification Channels
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                Enable only the notifications you want GutWise to send.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {notificationOptions.map((option) => {
              const Icon = option.icon;
              return (
                <NotificationRow
                  key={option.key}
                  icon={<Icon className="h-5 w-5" />}
                  title={option.label}
                  description={option.description}
                  checked={preferences[option.key]}
                  tone={option.tone}
                  onToggle={() => togglePreference(option.key)}
                />
              );
            })}
          </div>
        </Card>

        <Card
          variant="flat"
          className="rounded-[24px] border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.06)]"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
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

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button disabled={saving} onClick={handleSave}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </SettingsPageLayout>
  );
}

function NotificationRow({
  icon,
  title,
  description,
  checked,
  tone,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  tone: 'primary' | 'secondary' | 'neutral';
  onToggle: () => void;
}) {
  const iconToneClassName =
    tone === 'primary'
      ? 'bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]'
      : tone === 'secondary'
        ? 'bg-[rgba(133,93,255,0.16)] text-[var(--color-accent-secondary)]'
        : 'bg-[rgba(255,255,255,0.05)] text-[var(--color-text-tertiary)]';

  return (
    <div className="surface-panel-quiet flex items-center justify-between gap-4 rounded-[24px] p-4">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${iconToneClassName}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={[
          'relative ml-4 inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-smooth',
          checked ? 'bg-[var(--color-accent-primary)]' : 'bg-white/12',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-5 w-5 rounded-full bg-white transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
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
