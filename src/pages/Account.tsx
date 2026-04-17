import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, LogOut, Save } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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

  const months = useMemo(() => [
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
  ], []);

  const days = useMemo(() => {
    const daysInMonth = dobMonth && dobYear
      ? new Date(parseInt(dobYear), parseInt(dobMonth), 0).getDate()
      : 31;
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = (i + 1).toString().padStart(2, '0');
      return { value: day, label: day };
    });
  }, [dobMonth, dobYear]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 101 }, (_, i) => {
      const year = (currentYear - i).toString();
      return { value: year, label: year };
    });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

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
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
          }));
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (dobMonth && dobDay && dobYear) {
      const dateString = `${dobYear}-${dobMonth}-${dobDay}`;
      setFormData(prev => ({ ...prev, dateOfBirth: dateString }));
    } else {
      setFormData(prev => ({ ...prev, dateOfBirth: '' }));
    }
  }, [dobMonth, dobDay, dobYear]);

  useEffect(() => {
    if (heightUnit === 'imperial' && heightFeet && heightInches) {
      const totalInches = parseInt(heightFeet) * 12 + parseInt(heightInches);
      const cm = (totalInches * 2.54).toFixed(1);
      setHeightCm(cm);
      setFormData(prev => ({ ...prev, heightCm: cm }));
    } else if (heightUnit === 'metric' && heightCm) {
      setFormData(prev => ({ ...prev, heightCm }));
    }
  }, [heightFeet, heightInches, heightCm, heightUnit]);

  useEffect(() => {
    if (weightUnit === 'imperial' && weightLbs) {
      const kg = (parseFloat(weightLbs) / 2.20462).toFixed(1);
      setWeightKg(kg);
      setFormData(prev => ({ ...prev, weightKg: kg }));
    } else if (weightUnit === 'metric' && weightKg) {
      setFormData(prev => ({ ...prev, weightKg }));
    }
  }, [weightLbs, weightKg, weightUnit]);

  const handleHeightUnitToggle = () => {
    if (heightUnit === 'imperial') {
      setHeightUnit('metric');
    } else {
      setHeightUnit('imperial');
      if (heightCm) {
        const totalInches = parseFloat(heightCm) / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        setHeightFeet(feet.toString());
        setHeightInches(inches.toString());
      }
    }
  };

  const handleWeightUnitToggle = () => {
    if (weightUnit === 'imperial') {
      setWeightUnit('metric');
    } else {
      setWeightUnit('imperial');
      if (weightKg) {
        const lbs = (parseFloat(weightKg) * 2.20462).toFixed(1);
        setWeightLbs(lbs);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const { error } = await supabase
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

      if (error) throw error;

      setMessage('Profile updated successfully');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-bg">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-md sm:p-lg pt-16 sm:pt-16 lg:pt-0">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600 mt-2">Manage your profile and account preferences</p>
            </div>

            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
                    {formData.fullName.charAt(0).toUpperCase() || formData.email.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    <p className="text-sm text-gray-600">Update your personal details</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Date of Birth
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={dobMonth}
                          onChange={(e) => setDobMonth(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Height
                        </label>
                        <button
                          type="button"
                          onClick={handleHeightUnitToggle}
                          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          {heightUnit === 'imperial' ? 'ft/in' : 'cm'}
                        </button>
                      </div>
                      {heightUnit === 'imperial' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={heightFeet}
                            onChange={(e) => setHeightFeet(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="5 ft"
                            min="0"
                            max="8"
                          />
                          <input
                            type="number"
                            value={heightInches}
                            onChange={(e) => setHeightInches(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="10 in"
                            min="0"
                            max="11"
                          />
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="170 cm"
                          min="0"
                          max="300"
                          step="0.1"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Weight
                        </label>
                        <button
                          type="button"
                          onClick={handleWeightUnitToggle}
                          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          {weightUnit === 'imperial' ? 'lbs' : 'kg'}
                        </button>
                      </div>
                      {weightUnit === 'imperial' ? (
                        <input
                          type="number"
                          value={weightLbs}
                          onChange={(e) => setWeightLbs(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="155 lbs"
                          min="0"
                          max="1000"
                          step="0.1"
                        />
                      ) : (
                        <input
                          type="number"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="70 kg"
                          min="0"
                          max="500"
                          step="0.1"
                        />
                      )}
                    </div>

                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        id="timezone"
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      <Save className="inline h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Sign Out</h3>
                      <p className="text-sm text-gray-600">Sign out of your account on this device</p>
                    </div>
                    <Button variant="secondary" onClick={handleSignOut}>
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
      </main>
    </div>
  );
}
