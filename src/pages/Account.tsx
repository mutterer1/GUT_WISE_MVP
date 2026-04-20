import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  LogOut,
  Save,
  Ruler,
  Scale,
  ShieldCheck,
  Sparkles,
  Clock3,
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const fieldClassName =
  'w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-smooth placeholder:text-[var(--color-text-tertiary)] focus:border-[rgba(84,160,255,0.32)] focus:bg-[rgba(255,255,255,0.06)]';

const labelClassName =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]';

export default function Account() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    heightCm: '',
    weightKg: '',
    timezone: 'UTC',
  });

  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');

  const [heightUnit, setHeightUnit] = useState<'imperial' | 'metric'>('imperial');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [heightCm, setHeightCm] = useState('');

  const [weightUnit, setWeightUnit] = useState<'imperial' | 'metric'>('imperial');
  const [weightLbs, setWeightLbs] = useState('');
  const [weightKg, setWeightKg] = useState('');

  const months = useMemo(
    () => [
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' },
    ],
    []
  );

  const days = useMemo(() => {
    const daysInMonth =
      dobMonth && dobYear ? new Date(parseInt(dobYear, 10), parseInt(dobMonth, 10), 0).getDate() : 31;

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = (index + 1).toString().padStart(2, '0');
      return { value: day, label: day };
    });
  }, [dobMonth, dobYear]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 101 }, (_, index) => {
      const year = (currentYear - index).toString();
      return { value: year, label: year };
    });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      setLoading(true);

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

      if (profile) {
        setFormData({
          fullName: profile.full_name || '',
          email: profile.email || user.email || '',
          dateOfBirth: profile.date_of_birth || '',
          gender: profile.gender || '',
          heightCm: profile.height_cm || '',
          weightKg: profile.weight_kg || '',
          timezone: profile.timezone || 'UTC',
        });

        if (profile.date_of_birth) {
          const [year, month, day] = profile.date_of_birth.split('-');
          setDobYear(year);
          setDobMonth(month);
          setDobDay(day);
        }

        if (profile.height_cm) {
          const cm = profile.height_cm.toString();
          setHeightCm(cm);
          const totalInches = parseFloat(cm) / 2.54;
          const feet = Math.floor(totalInches / 12);
          const inches = Math.round(totalInches % 12);
          setHeightFeet(feet.toString());
          setHeightInches(inches.toString());
        }

        if (profile.weight_kg) {
          const kg = profile.weight_kg.toString();
          setWeightKg(kg);
          const lbs = (parseFloat(kg) * 2.20462).toFixed(1);
          setWeightLbs(lbs);
        }
      } else {
        setFormData((previous) => ({
          ...previous,
          email: user.email || '',
        }));
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (dobMonth && dobDay && dobYear) {
      setFormData((previous) => ({
        ...previous,
        dateOfBirth: `${dobYear}-${dobMonth}-${dobDay}`,
      }));
    } else {
      setFormData((previous) => ({ ...previous, dateOfBirth: '' }));
    }
  }, [dobMonth, dobDay, dobYear]);

  useEffect(() => {
    if (heightUnit === 'imperial' && heightFeet && heightInches) {
      const totalInches = parseInt(heightFeet, 10) * 12 + parseInt(heightInches, 10);
      const cm = (totalInches * 2.54).toFixed(1);
      setHeightCm(cm);
      setFormData((previous) => ({ ...previous, heightCm: cm }));
    } else if (heightUnit === 'metric' && heightCm) {
      setFormData((previous) => ({ ...previous, heightCm }));
    }
  }, [heightFeet, heightInches, heightCm, heightUnit]);

  useEffect(() => {
    if (weightUnit === 'imperial' && weightLbs) {
      const kg = (parseFloat(weightLbs) / 2.20462).toFixed(1);
      setWeightKg(kg);
      setFormData((previous) => ({ ...previous, weightKg: kg }));
    } else if (weightUnit === 'metric' && weightKg) {
      setFormData((previous) => ({ ...previous, weightKg }));
    }
  }, [weightLbs, weightKg, weightUnit]);

  const handleHeightUnitToggle = () => {
    if (heightUnit === 'imperial') {
      setHeightUnit('metric');
      return;
    }

    setHeightUnit('imperial');
    if (heightCm) {
      const totalInches = parseFloat(heightCm) / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      setHeightFeet(feet.toString());
      setHeightInches(inches.toString());
    }
  };

  const handleWeightUnitToggle = () => {
    if (weightUnit === 'imperial') {
      setWeightUnit('metric');
      return;
    }

    setWeightUnit('imperial');
    if (weightKg) {
      const lbs = (parseFloat(weightKg) * 2.20462).toFixed(1);
      setWeightLbs(lbs);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          height_cm: formData.heightCm ? parseFloat(formData.heightCm) : null,
          weight_kg: formData.weightKg ? parseFloat(formData.weightKg) : null,
          timezone: formData.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setMessage('Account profile updated successfully.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="page-shell">
          <div className="page-wrap py-8">
            <Card variant="elevated" className="mx-auto max-w-3xl rounded-[30px]">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[var(--color-accent-primary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    Loading your account
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                    Preparing your private profile workspace.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page-shell">
        <div className="page-wrap py-6 lg:py-8">
          <div className="mx-auto max-w-5xl space-y-5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] transition-smooth hover:border-white/16 hover:bg-white/[0.05] hover:text-[var(--color-text-secondary)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <Card variant="elevated" className="rounded-[32px] overflow-hidden">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div>
                  <span className="badge-secondary mb-3 inline-flex">Account Workspace</span>
                  <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-4xl">
                    Manage your private profile and session controls
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Keep your personal baseline accurate, maintain regional defaults, and separate
                    sensitive account actions from routine logging.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <MetricTile
                      label="Identity"
                      value={formData.fullName ? 'Set' : 'Open'}
                      helper="Name and profile details"
                      tone="primary"
                    />
                    <MetricTile
                      label="Timezone"
                      value={formData.timezone.split('/').pop() || formData.timezone}
                      helper="Regional account default"
                      tone="secondary"
                    />
                    <MetricTile
                      label="Session"
                      value="Active"
                      helper="Current signed-in device"
                      tone="neutral"
                    />
                  </div>
                </div>

                <div className="surface-panel-soft rounded-[26px] p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[24px] bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]">
                      <span className="text-2xl font-semibold">
                        {formData.fullName.charAt(0).toUpperCase() ||
                          formData.email.charAt(0).toUpperCase() ||
                          'U'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-[var(--color-text-primary)]">
                        {formData.fullName || 'Unnamed account'}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                        {formData.email || 'No email available'}
                      </p>

                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)]">
                        <User className="h-4 w-4" />
                        Account profile
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.025)] p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                        This signed-in workspace stays anchored to your personal account context and
                        can be updated at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

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

            {error && (
              <Card
                variant="flat"
                className="rounded-[24px] border-[rgba(255,120,120,0.2)] bg-[rgba(255,120,120,0.06)]"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-[rgba(255,120,120,0.18)]" />
                  <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>
                </div>
              </Card>
            )}

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <Card variant="elevated" className="rounded-[30px]">
                <div className="flex items-center gap-3 border-b border-white/8 pb-5">
                  <User className="h-5 w-5 text-[var(--color-accent-primary)]" />
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      Profile Information
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                      Personal details and physical baseline used across the app.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="mt-5 space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="fullName" className={labelClassName}>
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className={`${fieldClassName} pr-12`}
                          placeholder="Enter your full name"
                        />
                        <User className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className={labelClassName}>
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          disabled
                          className="w-full cursor-not-allowed rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 pr-12 text-sm text-[var(--color-text-tertiary)] opacity-90"
                        />
                        <Mail className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                      </div>
                      <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                        Email cannot be changed here.
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClassName}>Date of Birth</label>
                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={dobMonth}
                          onChange={(e) => setDobMonth(e.target.value)}
                          className={fieldClassName}
                        >
                          <option value="">Month</option>
                          {months.map((month) => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={dobDay}
                          onChange={(e) => setDobDay(e.target.value)}
                          className={fieldClassName}
                        >
                          <option value="">Day</option>
                          {days.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={dobYear}
                          onChange={(e) => setDobYear(e.target.value)}
                          className={fieldClassName}
                        >
                          <option value="">Year</option>
                          {years.map((year) => (
                            <option key={year.value} value={year.value}>
                              {year.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="gender" className={labelClassName}>
                        Gender
                      </label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className={fieldClassName}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="timezone" className={labelClassName}>
                        Timezone
                      </label>
                      <div className="relative">
                        <select
                          id="timezone"
                          value={formData.timezone}
                          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                          className={`${fieldClassName} pr-12`}
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                          <option value="Asia/Tokyo">Tokyo</option>
                          <option value="Australia/Sydney">Sydney</option>
                        </select>
                        <Clock3 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className={labelClassName}>Height</label>
                        <button
                          type="button"
                          onClick={handleHeightUnitToggle}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] transition-smooth hover:bg-white/[0.05] hover:text-[var(--color-text-secondary)]"
                        >
                          {heightUnit === 'imperial' ? 'ft/in' : 'cm'}
                        </button>
                      </div>

                      {heightUnit === 'imperial' ? (
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            value={heightFeet}
                            onChange={(e) => setHeightFeet(e.target.value)}
                            className={fieldClassName}
                            placeholder="5 ft"
                            min="0"
                            max="8"
                          />
                          <input
                            type="number"
                            value={heightInches}
                            onChange={(e) => setHeightInches(e.target.value)}
                            className={fieldClassName}
                            placeholder="10 in"
                            min="0"
                            max="11"
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="number"
                            value={heightCm}
                            onChange={(e) => setHeightCm(e.target.value)}
                            className={`${fieldClassName} pr-12`}
                            placeholder="170 cm"
                            min="0"
                            max="300"
                            step="0.1"
                          />
                          <Ruler className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className={labelClassName}>Weight</label>
                        <button
                          type="button"
                          onClick={handleWeightUnitToggle}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] transition-smooth hover:bg-white/[0.05] hover:text-[var(--color-text-secondary)]"
                        >
                          {weightUnit === 'imperial' ? 'lbs' : 'kg'}
                        </button>
                      </div>

                      {weightUnit === 'imperial' ? (
                        <div className="relative">
                          <input
                            type="number"
                            value={weightLbs}
                            onChange={(e) => setWeightLbs(e.target.value)}
                            className={`${fieldClassName} pr-12`}
                            placeholder="155 lbs"
                            min="0"
                            max="1000"
                            step="0.1"
                          />
                          <Scale className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="number"
                            value={weightKg}
                            onChange={(e) => setWeightKg(e.target.value)}
                            className={`${fieldClassName} pr-12`}
                            placeholder="70 kg"
                            min="0"
                            max="500"
                            step="0.1"
                          />
                          <Scale className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      <Save className="h-4 w-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Card>

              <div className="space-y-5">
                <Card variant="flat" className="rounded-[30px]">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Profile Context
                      </h2>
                      <div className="mt-2 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        <p>
                          These details support a more personalized workspace and baseline context
                          across reports, insights, and settings.
                        </p>
                        <p>
                          For more sensitive account controls, continue to the dedicated security
                          and data-management settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card variant="discovery" glowIntensity="subtle" className="rounded-[30px]">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-secondary)]" />
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Account Actions
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Use sign out when you need to end the current session on this device without
                        changing any of your saved data.
                      </p>
                      <Button variant="secondary" onClick={handleSignOut} className="mt-4 w-full">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
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
