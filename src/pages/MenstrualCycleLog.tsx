import { useEffect } from 'react';
import { Save, Clock, Heart, Droplet } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { formatDateTime } from '../utils/dateFormatters';

interface MenstrualFormData {
  id?: string;
  logged_at: string;
  cycle_start_date: string;
  cycle_day: number;
  estimated_cycle_length: number;
  flow_intensity: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
  color: string;
  pain_level: number;
  tissue_passed: boolean;
  symptoms: string[];
  mood_notes: string;
  sleep_quality: number;
  energy_level: number;
  contraceptive_method: string;
  cervical_mucus_type: string;
  ovulation_indicators: string[];
  basal_temp: number | '';
  sexual_activity: boolean;
  notes: string;
}

const commonSymptoms = [
  'Cramps', 'Bloating', 'Headaches', 'Mood Changes',
  'Breast Tenderness', 'Fatigue', 'Acne', 'Food Cravings',
  'Back Pain', 'Nausea', 'Joint Pain', 'None',
];

const ovulationIndicatorsList = [
  'Temperature Rise', 'Cervical Mucus', 'Ovulation Pain',
  'Luteal Phase', 'Follicular Phase',
];

const colorOptions = ['Bright Red', 'Dark Red', 'Brown', 'Light Pink', 'Watery Red'];
const contraceptiveOptions = ['None', 'Birth Control Pill', 'IUD', 'Implant', 'Injection', 'Condom', 'Other'];
const cervicalMucusOptions = ['Dry', 'Sticky', 'Creamy', 'Fertile (Egg White)', 'N/A'];

const buildPayload = (formData: MenstrualFormData, userId?: string) => ({
  ...(userId ? { user_id: userId } : {}),
  logged_at: formData.logged_at,
  cycle_start_date: formData.cycle_start_date,
  cycle_day: formData.cycle_day,
  estimated_cycle_length: formData.estimated_cycle_length,
  flow_intensity: formData.flow_intensity,
  color: formData.color,
  pain_level: formData.pain_level,
  tissue_passed: formData.tissue_passed,
  symptoms: formData.symptoms,
  mood_notes: formData.mood_notes || null,
  sleep_quality: formData.sleep_quality,
  energy_level: formData.energy_level,
  contraceptive_method: formData.contraceptive_method || null,
  cervical_mucus_type: formData.cervical_mucus_type || null,
  ovulation_indicators: formData.ovulation_indicators,
  basal_temp: formData.basal_temp !== '' ? formData.basal_temp : null,
  sexual_activity: formData.sexual_activity,
  notes: formData.notes || null,
});

const menstrualConfig = {
  table: 'menstrual_cycle_logs',
  logType: 'menstrual' as const,
  defaultValues: {
    cycle_start_date: new Date().toISOString().split('T')[0],
    cycle_day: 1,
    estimated_cycle_length: 28,
    flow_intensity: 'medium' as const,
    color: 'Bright Red',
    pain_level: 0,
    tissue_passed: false,
    symptoms: [] as string[],
    mood_notes: '',
    sleep_quality: 7,
    energy_level: 7,
    contraceptive_method: 'None',
    cervical_mucus_type: 'N/A',
    ovulation_indicators: [] as string[],
    basal_temp: '' as number | '',
    sexual_activity: false,
    notes: '',
  },
  buildInsertPayload: (formData: MenstrualFormData, userId: string) =>
    buildPayload(formData, userId),
  buildUpdatePayload: (formData: MenstrualFormData) =>
    buildPayload(formData),
};

export default function MenstrualCycleLog() {
  const {
    formData,
    setFormData,
    history,
    showHistory,
    setShowHistory,
    editingId,
    saving,
    message,
    toastVisible,
    error,
    dismissToast,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
  } = useLogCrud<MenstrualFormData>(menstrualConfig);

  useEffect(() => {
    if (formData.cycle_start_date) {
      const startDate = new Date(formData.cycle_start_date);
      const today = new Date();
      const diffTime = today.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData((prev) => ({ ...prev, cycle_day: Math.max(1, diffDays) }));
    }
  }, [formData.cycle_start_date]);

  const toggleSymptom = (symptom: string) => {
    if (symptom === 'None') {
      setFormData({ ...formData, symptoms: ['None'] });
    } else {
      const filtered = formData.symptoms.filter((s) => s !== 'None');
      setFormData({
        ...formData,
        symptoms: filtered.includes(symptom)
          ? filtered.filter((s) => s !== symptom)
          : [...filtered, symptom],
      });
    }
  };

  const toggleOvulationIndicator = (indicator: string) => {
    setFormData({
      ...formData,
      ovulation_indicators: formData.ovulation_indicators.includes(indicator)
        ? formData.ovulation_indicators.filter((i) => i !== indicator)
        : [...formData.ovulation_indicators, indicator],
    });
  };

  return (
    <LogPageShell
      title="Menstrual Cycle Tracker"
      subtitle="Track your cycle, symptoms, and reproductive health"
      message={message}
      toastVisible={toastVisible}
      onDismissToast={dismissToast}
      error={error}
    >
      <LogModeTabs
        showHistory={showHistory}
        onShowNew={() => setShowHistory(false)}
        onShowHistory={() => setShowHistory(true)}
        newIcon={<Heart className="h-4 w-4 mr-2" />}
        historyIcon={<Clock className="h-4 w-4 mr-2" />}
      />

      {!showHistory ? (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingId ? 'Edit Entry' : 'Log New Entry'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cycle_start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  <Droplet className="inline h-4 w-4 mr-1" />
                  Cycle Start Date
                </label>
                <input
                  type="date"
                  id="cycle_start_date"
                  value={formData.cycle_start_date}
                  onChange={(e) => setFormData({ ...formData, cycle_start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="logged_at" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Logged At
                </label>
                <input
                  type="datetime-local"
                  id="logged_at"
                  value={formData.logged_at}
                  onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="cycle_day" className="block text-sm font-medium text-gray-700 mb-2">
                  Cycle Day
                </label>
                <input
                  type="number"
                  id="cycle_day"
                  min="1"
                  value={formData.cycle_day}
                  onChange={(e) => setFormData({ ...formData, cycle_day: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Auto-calculated from start date</p>
              </div>

              <div>
                <label htmlFor="estimated_cycle_length" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Cycle Length (days)
                </label>
                <input
                  type="number"
                  id="estimated_cycle_length"
                  min="15"
                  max="60"
                  value={formData.estimated_cycle_length}
                  onChange={(e) => setFormData({ ...formData, estimated_cycle_length: parseInt(e.target.value) || 28 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="flow_intensity" className="block text-sm font-medium text-gray-700 mb-2">
                  Flow Intensity
                </label>
                <select
                  id="flow_intensity"
                  value={formData.flow_intensity}
                  onChange={(e) => setFormData({ ...formData, flow_intensity: e.target.value as typeof formData.flow_intensity })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                >
                  <option value="none">None</option>
                  <option value="spotting">Spotting</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <select
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="pain_level" className="block text-sm font-medium text-gray-700 mb-2">
                  Pain Level (0-10)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="pain_level"
                    min="0"
                    max="10"
                    value={formData.pain_level}
                    onChange={(e) => setFormData({ ...formData, pain_level: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold text-gray-700 w-8">{formData.pain_level}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Tissue/Clots Passed</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tissue_passed: !formData.tissue_passed })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.tissue_passed ? 'bg-rose-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.tissue_passed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Symptoms (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      formData.symptoms.includes(symptom)
                        ? 'border-rose-500 bg-rose-50 text-gray-900 shadow-md'
                        : 'border-gray-300 text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="mood_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Mood Notes (Optional)
              </label>
              <input
                type="text"
                id="mood_notes"
                value={formData.mood_notes}
                onChange={(e) => setFormData({ ...formData, mood_notes: e.target.value })}
                placeholder="e.g., irritable, emotional, anxious..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sleep_quality" className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Quality (1-10)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="sleep_quality"
                    min="1"
                    max="10"
                    value={formData.sleep_quality}
                    onChange={(e) => setFormData({ ...formData, sleep_quality: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold text-gray-700 w-8">{formData.sleep_quality}</span>
                </div>
              </div>

              <div>
                <label htmlFor="energy_level" className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Level (1-10)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="energy_level"
                    min="1"
                    max="10"
                    value={formData.energy_level}
                    onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold text-gray-700 w-8">{formData.energy_level}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contraceptive_method" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraceptive Method (Optional)
                </label>
                <select
                  id="contraceptive_method"
                  value={formData.contraceptive_method}
                  onChange={(e) => setFormData({ ...formData, contraceptive_method: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  {contraceptiveOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cervical_mucus_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Cervical Mucus (Optional)
                </label>
                <select
                  id="cervical_mucus_type"
                  value={formData.cervical_mucus_type}
                  onChange={(e) => setFormData({ ...formData, cervical_mucus_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  {cervicalMucusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ovulation Indicators (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ovulationIndicatorsList.map((indicator) => (
                  <button
                    key={indicator}
                    type="button"
                    onClick={() => toggleOvulationIndicator(indicator)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      formData.ovulation_indicators.includes(indicator)
                        ? 'border-amber-500 bg-amber-50 text-gray-900 shadow-md'
                        : 'border-gray-200 text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    {indicator}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="basal_temp" className="block text-sm font-medium text-gray-700 mb-2">
                Basal Body Temperature (Optional)
              </label>
              <input
                type="number"
                id="basal_temp"
                step="0.1"
                min="96"
                max="100"
                value={formData.basal_temp}
                onChange={(e) => setFormData({ ...formData, basal_temp: e.target.value ? parseFloat(e.target.value) : '' })}
                placeholder="e.g., 97.8 F"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Sexual Activity</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, sexual_activity: !formData.sexual_activity })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.sexual_activity ? 'bg-rose-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.sexual_activity ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                rows={3}
                placeholder="Any other observations or context..."
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                <Save className="inline h-4 w-4 mr-2" />
                {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
              </Button>
              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Entry History</h2>
          {history.length === 0 ? (
            <EmptyState category="menstrual cycle" icon={<Heart className="h-8 w-8 text-gray-400" />} />
          ) : (
            <div className="space-y-4">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDateTime(log.logged_at)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Day {log.cycle_day} - {log.flow_intensity} flow
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(log as MenstrualFormData & { id: string })}
                        className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(log.id!)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-500">Color:</span>
                      <span className="ml-1 font-medium">{log.color}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pain:</span>
                      <span className="ml-1 font-medium">{log.pain_level}/10</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sleep:</span>
                      <span className="ml-1 font-medium">{log.sleep_quality}/10</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Energy:</span>
                      <span className="ml-1 font-medium">{log.energy_level}/10</span>
                    </div>
                  </div>

                  {log.symptoms && log.symptoms.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 mb-1">Symptoms:</div>
                      <div className="flex flex-wrap gap-1">
                        {log.symptoms.map((symptom: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-rose-100 text-rose-800">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.mood_notes && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2">
                      Mood: {log.mood_notes}
                    </div>
                  )}

                  {log.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {log.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </LogPageShell>
  );
}
