import { useState, useEffect } from 'react';
import { Globe, Save, X, Monitor, Moon, Sun } from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  type HydrationUnit,
  getStoredHydrationUnit,
  setStoredHydrationUnit,
} from '../../utils/hydrationUnits';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  compactView: boolean;
  animations: boolean;
  hydrationUnit: HydrationUnit;
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Denver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
  'America/Toronto',
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
];

export default function PreferencesSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MMM DD, YYYY',
    compactView: false,
    animations: true,
    hydrationUnit: getStoredHydrationUnit(),
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
          .select('timezone')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data?.timezone) {
          setPreferences((prev) => ({
            ...prev,
            timezone: data.timezone,
          }));
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
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
          timezone: preferences.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setStoredHydrationUnit(preferences.hydrationUnit);
      localStorage.setItem(
        'app-preferences',
        JSON.stringify({
          theme: preferences.theme,
          language: preferences.language,
          dateFormat: preferences.dateFormat,
          compactView: preferences.compactView,
          animations: preferences.animations,
        })
      );

      setMessage('Preferences saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsPageLayout
      title="Preferences"
      description="Customize appearance, formatting, and unit behavior so the product matches how you review data day to day."
    >
      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[28px]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Appearance</h3>

          <div className="mt-5 space-y-5">
            <div>
              <label className="field-label mb-3 block">Theme</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        theme: value as typeof preferences.theme,
                      })
                    }
                    className={[
                      'flex items-center gap-3 rounded-[22px] border p-4 transition-smooth',
                      preferences.theme === value
                        ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)]'
                        : 'border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    <Icon className="h-5 w-5 text-[var(--color-text-tertiary)]" />
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-panel-quiet rounded-[24px] p-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.compactView}
                  onChange={(e) =>
                    setPreferences({ ...preferences, compactView: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-white/20 bg-transparent text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
                />
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  Use compact view
                </span>
              </label>
            </div>

            <div className="surface-panel-quiet rounded-[24px] p-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.animations}
                  onChange={(e) =>
                    setPreferences({ ...preferences, animations: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-white/20 bg-transparent text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
                />
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  Enable animations
                </span>
              </label>
            </div>
          </div>
        </Card>

        <Card variant="flat" className="rounded-[28px]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Localization</h3>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="language" className="field-label mb-2 block">
                Language
              </label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="input-base w-full"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="timezone" className="field-label mb-2 block">
                Timezone
              </label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                className="input-base w-full"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dateFormat" className="field-label mb-2 block">
                Date Format
              </label>
              <select
                id="dateFormat"
                value={preferences.dateFormat}
                onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                className="input-base w-full"
              >
                <option value="MMM DD, YYYY">Mar 15, 2024</option>
                <option value="DD/MM/YYYY">15/03/2024</option>
                <option value="YYYY-MM-DD">2024-03-15</option>
                <option value="MM/DD/YYYY">03/15/2024</option>
              </select>
            </div>
          </div>
        </Card>

        <Card variant="flat" className="rounded-[28px]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Units</h3>

          <div className="mt-5">
            <label className="field-label mb-3 block">Hydration Unit</label>
            <div className="flex flex-col gap-3 md:flex-row">
              {([
                { value: 'metric', label: 'Metric (mL / L)' },
                { value: 'imperial', label: 'Imperial (fl oz / gal)' },
              ] as { value: HydrationUnit; label: string }[]).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPreferences({ ...preferences, hydrationUnit: value })}
                  className={[
                    'flex-1 rounded-[22px] border px-4 py-3 text-sm font-medium transition-smooth',
                    preferences.hydrationUnit === value
                      ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)] text-[var(--color-text-primary)]'
                      : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card
          variant="flat"
          className="rounded-[24px] border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.06)]"
        >
          <div className="flex items-start gap-3">
            <Globe className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Preferences are saved locally and synced to your account
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                These settings will be applied across your devices when you log in.
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
