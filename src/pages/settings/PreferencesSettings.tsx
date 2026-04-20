import { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  X,
  Monitor,
  Moon,
  Sun,
  Droplets,
  Clock3,
  Languages,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
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

const fieldClassName =
  'w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-smooth placeholder:text-[var(--color-text-tertiary)] focus:border-[rgba(84,160,255,0.32)] focus:bg-[rgba(255,255,255,0.06)]';

const labelClassName =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]';

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

      setMessage('Preferences saved successfully.');
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
      description="Tune the GutWise workspace so review, logging, and interpretation feel native to how you actually work."
    >
      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[30px] overflow-hidden">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div>
              <span className="badge-secondary mb-3 inline-flex">Workspace Preferences</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Shape the product around your review habits
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Adjust visual behavior, regional formatting, and measurement defaults so the
                signed-in GutWise workspace feels tighter, calmer, and easier to scan.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricTile
                  label="Theme"
                  value={preferences.theme === 'system' ? 'Auto' : preferences.theme}
                  helper="Visual mode behavior"
                  tone="primary"
                />
                <MetricTile
                  label="Timezone"
                  value={preferences.timezone.split('/').pop() || preferences.timezone}
                  helper="Log and summary timing"
                  tone="secondary"
                />
                <MetricTile
                  label="Hydration"
                  value={preferences.hydrationUnit === 'metric' ? 'Metric' : 'Imperial'}
                  helper="Default intake units"
                  tone="neutral"
                />
              </div>
            </div>

            <div className="surface-panel-soft rounded-[26px] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(133,93,255,0.16)] text-[var(--color-accent-secondary)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[var(--color-text-primary)]">
                    Personal workspace defaults
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                    These choices affect readability, pacing, and regional formatting without
                    changing your underlying health records.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.025)] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    Preference changes are lightweight and reversible. Save once to sync your
                    preferred defaults across the account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="rounded-[30px]">
          <div className="flex items-center gap-3 border-b border-white/8 pb-5">
            <Monitor className="h-5 w-5 text-[var(--color-accent-primary)]" />
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Appearance</h3>
              <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                Control visual tone, density, and motion.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <label className={labelClassName}>Theme</label>
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
                      'flex items-center gap-3 rounded-[22px] border p-4 text-left transition-smooth',
                      preferences.theme === value
                        ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)]'
                        : 'border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] text-[var(--color-text-tertiary)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {value === 'light'
                          ? 'Higher brightness interface'
                          : value === 'dark'
                            ? 'Low-glare default workspace'
                            : 'Follow device setting'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <PreferenceToggle
              title="Use compact view"
              description="Tighten spacing for denser review and less vertical scrolling."
              checked={preferences.compactView}
              onChange={(checked) => setPreferences({ ...preferences, compactView: checked })}
            />

            <PreferenceToggle
              title="Enable animations"
              description="Keep subtle movement and transitions in the interface."
              checked={preferences.animations}
              onChange={(checked) => setPreferences({ ...preferences, animations: checked })}
            />
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card variant="flat" className="rounded-[30px]">
            <div className="flex items-center gap-3 border-b border-white/8 pb-5">
              <Languages className="h-5 w-5 text-[var(--color-accent-primary)]" />
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Localization
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                  Language, timezone, and date formatting defaults.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="language" className={labelClassName}>
                  Language
                </label>
                <select
                  id="language"
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className={fieldClassName}
                >
                  {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="timezone" className={labelClassName}>
                  Timezone
                </label>
                <div className="relative">
                  <select
                    id="timezone"
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                    className={`${fieldClassName} pr-12`}
                  >
                    {timezones.map((timezone) => (
                      <option key={timezone} value={timezone}>
                        {timezone}
                      </option>
                    ))}
                  </select>
                  <Clock3 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                </div>
              </div>

              <div>
                <label htmlFor="dateFormat" className={labelClassName}>
                  Date Format
                </label>
                <select
                  id="dateFormat"
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                  className={fieldClassName}
                >
                  <option value="MMM DD, YYYY">Mar 15, 2024</option>
                  <option value="DD/MM/YYYY">15/03/2024</option>
                  <option value="YYYY-MM-DD">2024-03-15</option>
                  <option value="MM/DD/YYYY">03/15/2024</option>
                </select>
              </div>
            </div>
          </Card>

          <Card variant="flat" className="rounded-[30px]">
            <div className="flex items-center gap-3 border-b border-white/8 pb-5">
              <Droplets className="h-5 w-5 text-[var(--color-accent-primary)]" />
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Units</h3>
                <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                  Measurement defaults for daily logging.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label className={labelClassName}>Hydration Unit</label>
              <div className="flex flex-col gap-3">
                {([
                  { value: 'metric', label: 'Metric (mL / L)', detail: 'Best for clinical-style measurement' },
                  { value: 'imperial', label: 'Imperial (fl oz / gal)', detail: 'Best for US customary intake tracking' },
                ] as { value: HydrationUnit; label: string; detail: string }[]).map(
                  ({ value, label, detail }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, hydrationUnit: value })}
                      className={[
                        'rounded-[22px] border px-4 py-4 text-left transition-smooth',
                        preferences.hydrationUnit === value
                          ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)]'
                          : 'border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]',
                      ].join(' ')}
                    >
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{detail}</p>
                    </button>
                  )
                )}
              </div>
            </div>
          </Card>
        </div>

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
                Visual behavior and formatting defaults can follow you across signed-in sessions.
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
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Reset View
          </Button>
        </div>
      </div>
    </SettingsPageLayout>
  );
}

function PreferenceToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="surface-panel-quiet flex items-center justify-between gap-4 rounded-[24px] p-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
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
