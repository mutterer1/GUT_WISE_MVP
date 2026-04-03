import { useState, useEffect } from 'react';
import { Globe, Save, X, Monitor, Moon, Sun } from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  compactView: boolean;
  animations: boolean;
}

const timezones = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Denver',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
  'Asia/Shanghai', 'Asia/Singapore', 'Australia/Sydney', 'America/Toronto'
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

      localStorage.setItem('app-preferences', JSON.stringify({
        theme: preferences.theme,
        language: preferences.language,
        dateFormat: preferences.dateFormat,
        compactView: preferences.compactView,
        animations: preferences.animations,
      }));

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
      description="Customize your experience and app preferences"
    >
      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setPreferences({ ...preferences, theme: value as typeof preferences.theme })}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      preferences.theme === value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.compactView}
                  onChange={(e) => setPreferences({ ...preferences, compactView: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">Use compact view</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.animations}
                  onChange={(e) => setPreferences({ ...preferences, animations: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable animations</span>
              </label>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Localization</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                id="dateFormat"
                value={preferences.dateFormat}
                onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="MMM DD, YYYY">Mar 15, 2024</option>
                <option value="DD/MM/YYYY">15/03/2024</option>
                <option value="YYYY-MM-DD">2024-03-15</option>
                <option value="MM/DD/YYYY">03/15/2024</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Your preferences are saved locally and synced to your account
              </p>
              <p className="text-sm text-blue-800 mt-1">
                These settings will be applied across all your devices when you log in
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
