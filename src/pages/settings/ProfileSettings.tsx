import { useState, useEffect } from 'react';
import { User, Camera, Save, X } from 'lucide-react';
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
      const { ft, inches } = cmToFtIn((profile as any).height_cm ?? null);
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user.email || '',
        date_of_birth: '',
        gender: '',
        height_ft: ft,
        height_in: inches,
        weight_lbs: kgToLbs((profile as any).weight_kg ?? null),
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

      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile && user?.email) {
      const { ft, inches } = cmToFtIn((profile as any).height_cm ?? null);
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user.email || '',
        date_of_birth: '',
        gender: '',
        height_ft: ft,
        height_in: inches,
        weight_lbs: kgToLbs((profile as any).weight_kg ?? null),
      });
    }
    setError('');
  };

  return (
    <SettingsPageLayout
      title="Profile Settings"
      description="Manage identity, physical baseline, and profile context used across your GutWise experience."
    >
      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[28px]">
          <div className="mb-8">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[28px] bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]">
              <User className="h-11 w-11" />
            </div>

            <div className="text-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-smooth hover:bg-white/[0.05] hover:text-[var(--color-text-primary)]"
              >
                <Camera className="h-4 w-4" />
                Upload Avatar
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="full_name" className="field-label mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="input-base w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="field-label mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-text-tertiary)] opacity-90"
              />
              <p className="field-help mt-2">Contact support to change your email address.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="date_of_birth" className="field-label mb-2 block">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="input-base w-full"
                />
              </div>

              <div>
                <label htmlFor="gender" className="field-label mb-2 block">
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="input-base w-full"
                >
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="field-label mb-2 block">Height</label>
                <div className="grid grid-cols-2 gap-2">
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
                      className="input-base w-full pr-10"
                      min="0"
                      max="8"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]">
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
                      className="input-base w-full pr-10"
                      min="0"
                      max="11"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]">
                      in
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="weight_lbs" className="field-label mb-2 block">
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
                    className="input-base w-full pr-12"
                    min="44"
                    max="660"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]">
                    lbs
                  </span>
                </div>
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

        <div className="flex flex-wrap gap-3">
          <Button disabled={saving} onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
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
