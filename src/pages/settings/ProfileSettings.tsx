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
  height_cm: number | null;
  weight_kg: number | null;
}

export default function ProfileSettings() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    full_name: '',
    email: '',
    date_of_birth: '',
    gender: '',
    height_cm: null,
    weight_kg: null,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile && user?.email) {
      setFormData((prev) => ({
        ...prev,
        full_name: profile.full_name || '',
        email: profile.email || user.email,
        date_of_birth: '',
        gender: '',
        height_cm: null,
        weight_kg: null,
      }));
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
          height_cm: formData.height_cm ? parseFloat(formData.height_cm.toString()) : null,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg.toString()) : null,
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
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user.email,
        date_of_birth: '',
        gender: '',
        height_cm: null,
        weight_kg: null,
      });
    }
    setError('');
  };

  return (
    <SettingsPageLayout
      title="Profile Settings"
      description="Manage your personal information and profile details"
    >
      <div className="space-y-6">
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
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contact support to change your email address
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                <label htmlFor="height_cm" className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  id="height_cm"
                  value={formData.height_cm || ''}
                  onChange={(e) => setFormData({ ...formData, height_cm: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="50"
                  max="250"
                />
              </div>

              <div>
                <label htmlFor="weight_kg" className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight_kg"
                  value={formData.weight_kg || ''}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="20"
                  max="300"
                />
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
