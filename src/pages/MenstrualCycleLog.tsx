import { useEffect } from 'react';
import { Save, Clock, Heart, Droplet, Pencil } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { formatDateTime } from '../utils/dateFormatters';
import { useAuth } from '../contexts/AuthContext';

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
  logType: 'menstrual-cycle' as const,
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

const inputCls = 'w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-signal-500 focus:border-transparent';
const labelCls = 'mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted';
const sliderCls = 'h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-signal-500';

export default function MenstrualCycleLog() {
  const { profile } = useAuth();

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

  if (profile?.gender === 'male') {
    return (
      <LogPageShell
        title="Menstrual Cycle Tracker"
        subtitle=""
        message=""
        toastVisible={false}
        onDismissToast={() => {}}
        error=""
      >
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="mb-4 h-10 w-10 text-neutral-muted dark:text-dark-muted" />
            <p className="text-body-sm font-medium text-neutral-text dark:text-dark-text">
              Cycle tracking is not part of your current profile.
            </p>
            <p className="mt-2 text-xs text-neutral-muted dark:text-dark-muted">
              If this is in error, update your gender in Profile Settings.
            </p>
          </div>
        </Card>
      </LogPageShell>
    );
  }

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
        newIcon={<Heart className="mr-2 h-4 w-4" />}
        historyIcon={<Clock className="mr-2 h-4 w-4" />}
        newLabel={editingId ? 'Edit Entry' : 'New Entry'}
      />

      {!showHistory ? (
        <Card>
          {editingId && (
            <div className="mb-6 flex items-center justify-between rounded-xl bg-signal-500/8 dark:bg-signal-500/10 border border-signal-500/20 px-4 py-3">
              <div className="flex items-center gap-2 text-body-sm text-signal-500 dark:text-signal-300">
                <Pencil className="h-3.5 w-3.5" />
                <span className="font-medium">Editing entry</span>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="text-body-sm text-neutral-muted dark:text-dark-muted hover:text-neutral-text dark:hover:text-dark-text transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="cycle_start_date" className={labelCls}>
                  <Droplet className="mr-1 inline h-4 w-4" />
                  Cycle Start Date
                </label>
                <input
                  type="date"
                  id="cycle_start_date"
                  value={formData.cycle_start_date}
                  onChange={(e) => setFormData({ ...formData, cycle_start_date: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label htmlFor="logged_at" className={labelCls}>
                  <Clock className="mr-1 inline h-4 w-4" />
                  Logged At
                </label>
                <input
                  type="datetime-local"
                  id="logged_at"
                  value={formData.logged_at}
                  onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="cycle_day" className={labelCls}>Cycle Day</label>
                <input
                  type="number"
                  id="cycle_day"
                  min="1"
                  value={formData.cycle_day}
                  onChange={(e) => setFormData({ ...formData, cycle_day: parseInt(e.target.value) || 1 })}
                  className={inputCls}
                  required
                />
                <p className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">Auto-calculated from start date</p>
              </div>

              <div>
                <label htmlFor="estimated_cycle_length" className={labelCls}>Estimated Cycle Length (days)</label>
                <input
                  type="number"
                  id="estimated_cycle_length"
                  min="15"
                  max="60"
                  value={formData.estimated_cycle_length}
                  onChange={(e) => setFormData({ ...formData, estimated_cycle_length: parseInt(e.target.value) || 28 })}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="flow_intensity" className={labelCls}>Flow Intensity</label>
                <select
                  id="flow_intensity"
                  value={formData.flow_intensity}
                  onChange={(e) => setFormData({ ...formData, flow_intensity: e.target.value as typeof formData.flow_intensity })}
                  className={inputCls}
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="color" className={labelCls}>Color</label>
                <select
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className={inputCls}
                >
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="pain_level" className={labelCls}>
                  Pain Level: <span className="text-neutral-text dark:text-dark-text">{formData.pain_level}/10</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="pain_level"
                    min="0"
                    max="10"
                    value={formData.pain_level}
                    onChange={(e) => setFormData({ ...formData, pain_level: parseInt(e.target.value) })}
                    className={sliderCls + ' flex-1'}
                  />
                  <span className="text-body-sm font-semibold text-neutral-text dark:text-dark-text w-8">{formData.pain_level}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-neutral-bg dark:bg-dark-bg p-4 border border-neutral-border dark:border-dark-border">
              <span className="text-body-sm font-medium text-neutral-text dark:text-dark-text">Tissue/Clots Passed</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tissue_passed: !formData.tissue_passed })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.tissue_passed ? 'bg-signal-500' : 'bg-neutral-border dark:bg-dark-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    formData.tissue_passed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Symptoms (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`rounded-xl border-2 p-3 text-body-sm font-medium transition-all ${
                      formData.symptoms.includes(symptom)
                        ? 'border-signal-500 bg-signal-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                        : 'border-neutral-border dark:border-dark-border text-neutral-text dark:text-dark-text hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="mood_notes" className={labelCls}>Mood Notes (Optional)</label>
              <input
                type="text"
                id="mood_notes"
                value={formData.mood_notes}
                onChange={(e) => setFormData({ ...formData, mood_notes: e.target.value })}
                placeholder="e.g., irritable, emotional, anxious..."
                className={inputCls + ' placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50'}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="sleep_quality" className={labelCls}>
                  Sleep Quality: <span className="text-neutral-text dark:text-dark-text">{formData.sleep_quality}/10</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="sleep_quality"
                    min="1"
                    max="10"
                    value={formData.sleep_quality}
                    onChange={(e) => setFormData({ ...formData, sleep_quality: parseInt(e.target.value) })}
                    className={sliderCls + ' flex-1'}
                  />
                  <span className="text-body-sm font-semibold text-neutral-text dark:text-dark-text w-8">{formData.sleep_quality}</span>
                </div>
              </div>

              <div>
                <label htmlFor="energy_level" className={labelCls}>
                  Energy Level: <span className="text-neutral-text dark:text-dark-text">{formData.energy_level}/10</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="energy_level"
                    min="1"
                    max="10"
                    value={formData.energy_level}
                    onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                    className={sliderCls + ' flex-1'}
                  />
                  <span className="text-body-sm font-semibold text-neutral-text dark:text-dark-text w-8">{formData.energy_level}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="contraceptive_method" className={labelCls}>Contraceptive Method (Optional)</label>
                <select
                  id="contraceptive_method"
                  value={formData.contraceptive_method}
                  onChange={(e) => setFormData({ ...formData, contraceptive_method: e.target.value })}
                  className={inputCls}
                >
                  {contraceptiveOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cervical_mucus_type" className={labelCls}>Cervical Mucus (Optional)</label>
                <select
                  id="cervical_mucus_type"
                  value={formData.cervical_mucus_type}
                  onChange={(e) => setFormData({ ...formData, cervical_mucus_type: e.target.value })}
                  className={inputCls}
                >
                  {cervicalMucusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Ovulation Indicators (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {ovulationIndicatorsList.map((indicator) => (
                  <button
                    key={indicator}
                    type="button"
                    onClick={() => toggleOvulationIndicator(indicator)}
                    className={`rounded-xl border-2 p-3 text-body-sm font-medium transition-all ${
                      formData.ovulation_indicators.includes(indicator)
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                        : 'border-neutral-border dark:border-dark-border text-neutral-text dark:text-dark-text hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    {indicator}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="basal_temp" className={labelCls}>Basal Body Temperature (Optional)</label>
              <input
                type="number"
                id="basal_temp"
                step="0.1"
                min="96"
                max="100"
                value={formData.basal_temp}
                onChange={(e) => setFormData({ ...formData, basal_temp: e.target.value ? parseFloat(e.target.value) : '' })}
                placeholder="e.g., 97.8 F"
                className={inputCls + ' placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50'}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-neutral-bg dark:bg-dark-bg p-4 border border-neutral-border dark:border-dark-border">
              <span className="text-body-sm font-medium text-neutral-text dark:text-dark-text">Sexual Activity</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, sexual_activity: !formData.sexual_activity })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.sexual_activity ? 'bg-signal-500' : 'bg-neutral-border dark:bg-dark-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    formData.sexual_activity ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label htmlFor="notes" className={labelCls}>Additional Notes (Optional)</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-signal-500 focus:border-transparent placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50 resize-none"
                rows={3}
                placeholder="Any other observations or context..."
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving} size="lg">
                <Save className="mr-2 inline h-4 w-4" />
                {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" size="lg" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          {history.length === 0 ? (
            <EmptyState category="menstrual cycle" icon={<Heart className="h-8 w-8 text-neutral-muted dark:text-dark-muted" />} />
          ) : (
            <div className="space-y-3">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-neutral-border dark:border-dark-border p-4 transition-colors hover:border-brand-300 dark:hover:border-brand-700"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="text-body-sm font-medium text-neutral-text dark:text-dark-text">
                        {formatDateTime(log.logged_at)}
                      </div>
                      <div className="mt-0.5 text-xs text-neutral-muted dark:text-dark-muted">
                        Day {log.cycle_day} &middot; {log.flow_intensity} flow
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(log as MenstrualFormData & { id: string })}
                        className="text-body-sm font-medium text-brand-500 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(log.id!)}
                        className="text-body-sm font-medium text-signal-500 hover:text-signal-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                    <div>
                      <span className="text-neutral-muted dark:text-dark-muted">Color:</span>
                      <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">{log.color}</span>
                    </div>
                    <div>
                      <span className="text-neutral-muted dark:text-dark-muted">Pain:</span>
                      <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">{log.pain_level}/10</span>
                    </div>
                    <div>
                      <span className="text-neutral-muted dark:text-dark-muted">Sleep:</span>
                      <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">{log.sleep_quality}/10</span>
                    </div>
                    <div>
                      <span className="text-neutral-muted dark:text-dark-muted">Energy:</span>
                      <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">{log.energy_level}/10</span>
                    </div>
                  </div>

                  {log.symptoms && log.symptoms.length > 0 && (
                    <div className="mb-2">
                      <div className="mb-1 text-xs text-neutral-muted dark:text-dark-muted">Symptoms:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {log.symptoms.map((symptom: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center rounded-full bg-signal-500/10 border border-signal-500/20 px-2.5 py-1 text-xs text-signal-500 dark:text-signal-300">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.mood_notes && (
                    <div className="mb-2 rounded-lg bg-neutral-bg dark:bg-dark-bg px-3 py-2 text-xs text-neutral-muted dark:text-dark-muted">
                      Mood: {log.mood_notes}
                    </div>
                  )}

                  {log.notes && (
                    <div className="mt-2 rounded-lg bg-neutral-bg dark:bg-dark-bg px-3 py-2 text-body-sm text-neutral-muted dark:text-dark-muted">
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
