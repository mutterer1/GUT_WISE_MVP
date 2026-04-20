import { useState, useEffect } from 'react';
import {
  User,
  Camera,
  Save,
  X,
  ShieldCheck,
  Ruler,
  Scale,
  Mail,
  Calendar,
} from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ProfileData {
  full_name: string;
  email: string;
  date_of_birth: string;
  gender: string;
  height_ft: number | null;
  height_in: number | null;
  weight_lbs: number | null;
}

function cmToFtIn(cm: number | null): { ft: number | null; inches: number | null } {
  if (!cm) return { ft: null, inches: null };
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { ft, inches };
}

function ftInToCm(ft: number | null, inches: number | null): number | null {
  if (ft === null && inches === null) return null;
  return ((ft ?? 0) * 12 + (inches ?? 0)) * 2.54;
}

function kgToLbs(kg: number | null): number | null {
  if (!kg) return null;
  return Math.round(kg * 2.20462);
}

function lbsToKg(lbs: number | null): number | null {
  if (!lbs) return null;
  return lbs / 2.20462;
}

const fieldClassName =
  'w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-smooth placeholder:text-[var(--color-text-tertiary)] focus:border-[rgba(84,160,255,0.32)] focus:bg-[rgba(255,255,255,0.06)]';

const labelClassName =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]';

export default function ProfileSettings() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    full_name: '',
    email: '',
    date_of_birth: '',
    gender: '',
    height_ft: null,
    height_in: null,
    weight_lbs: null,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile && user?.email) {
      const { ft, inches } = cmToFtIn((profile as { height_cm?: number | null }).height_cm ?? null);
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user.email || '',
        date_of_birth: '',
        gender: '',
        height_ft: ft,
        height_in: inches,
        weight_lbs: kgToLbs((profile as { weight_kg?: number | null }).weight_kg ?? null),
      });
    }
  }, [profile, user?.email]);

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          height_cm: ftInToCm(formData.height_ft, formData.height_in),
          weight_kg: lbsToKg(formData.weight_lbs),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setMessage('Profile updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile && user?.email) {
      const { ft, inches } = cmToFtIn((profile as { height_cm?: number | null }).height_cm ?? null);
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user.email || '',
        date_of_birth: '',
        gender: '',
        height_ft: ft,
        height_in: inches,
        weight_lbs: kgToLbs((profile as { weight_kg?: number | null }).weight_kg ?? null),
      });
    }
    setError('');
  };

  return (
    <SettingsPageLayout
      title="Profile Settings"
      description="Maintain the identity and physical baseline GutWise uses across your private account workspace."
    >
      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[30px] overflow-hidden">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div>
              <span className="badge-secondary mb-3 inline-flex">Identity & Baseline</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Keep your account profile clinically useful and up to date
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                These details support a more personalized GutWise experience and help establish the
                baseline context for your logs, reports, and insights.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricTile
                  label="Identity"
                  value={formData.full_name ? 'Set' : 'Open'}
                  helper="Name and account basics"
                  tone="primary"
                />
                <MetricTile
                  label="Baseline"
                  value={formData.weight_lbs || formData.height_ft ? 'Set' : 'Open'}
                  helper="Height and weight context"
                  tone="secondary"
                />
                <MetricTile
                  label="Privacy"
                  value="Private"
                  helper="Visible only within your account"
                  tone="neutral"
                />
              </div>
            </div>

            <div className="surface-panel-soft rounded-[26px] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[24px] bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]">
                  <User className="h-10 w-10" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-[var(--color-text-primary)]">
                    Account identity
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                    Your profile anchors the personal workspace around your records and preferences.
                  </p>

                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-smooth hover:bg-white/[0.05] hover:text-[var(--color-text-primary)]"
                  >
                    <Camera className="h-4 w-4" />
                    Upload Avatar
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.025)] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    Profile details stay private to your account and support personalization across
                    the signed-in GutWise experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="rounded-[30px]">
          <div className="flex items-center gap-3 border-b border-white/8 pb-5">
            <Mail className="h-5 w-5 text-[var(--color-accent-primary)]" />
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Personal Details
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                Core identity and demographic context.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="full_name" className={labelClassName}>
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClassName}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                disabled
                className="w-full cursor-not-allowed rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-text-tertiary)] opacity-90"
              />
              <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                Contact support to change your email address.
              </p>
            </div>

            <div>
              <label htmlFor="date_of_birth" className={labelClassName}>
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className={`${fieldClassName} pr-12`}
                />
                <Calendar className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
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
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </Card>

        <Card variant="flat" className="rounded-[30px]">
          <div className="flex items-center gap-3 border-b border-white/8 pb-5">
            <Ruler className="h-5 w-5 text-[var(--color-accent-primary)]" />
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Physical Baseline
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                Optional body metrics used for context, not judgment.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClassName}>Height</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="number"
                    id="height_ft"
                    placeholder="0"
                    value={formData.height_ft ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        height_ft: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    className={`${fieldClassName} pr-10`}
                    min="0"
                    max="8"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]">
                    ft
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    id="height_in"
                    placeholder="0"
                    value={formData.height_in ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        height_in: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    className={`${fieldClassName} pr-10`}
                    min="0"
                    max="11"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]">
                    in
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="weight_lbs" className={labelClassName}>
                Weight
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="weight_lbs"
                  placeholder="0"
                  value={formData.weight_lbs ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight_lbs: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className={`${fieldClassName} pr-12`}
                  min="44"
                  max="660"
                />
                <Scale className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
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

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button disabled={saving} onClick={handleSave}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </SettingsPageLayout>
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
