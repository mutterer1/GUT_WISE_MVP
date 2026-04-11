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

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent';

const labelClass = 'block text-sm font-medium text-gray-700 mb-2';

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
      description="Manage your personal information and profile details"
    >
      <div className="space-y-6 pt-4">
        <Card>
          <div className="mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-teal-50 rounded-full mx-auto mb-4">
              <User className="h-10 w-10 text-teal-600" />
            </div>
            <div className="text-center">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
                <Camera className="h-4 w-4" />
                Upload Avatar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className={labelClass}>
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-100 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contact support to change your email address
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date_of_birth" className={labelClass}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="gender" className={labelClass}>
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Height</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      id="height_ft"
                      placeholder="0"
                      value={formData.height_ft ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          height_ft: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className={inputClass}
                      min="0"
                      max="8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                      ft
                    </span>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      id="height_in"
                      placeholder="0"
                      value={formData.height_in ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          height_in: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className={inputClass}
                      min="0"
                      max="11"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                      in
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="weight_lbs" className={labelClass}>
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
                    className={inputClass}
                    min="44"
                    max="660"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                    lbs
                  </span>
                </div>
              </div>
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

        <div className="flex gap-3">
          <Button disabled={saving} onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
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
