import { useEffect } from 'react';
import { Clock, Droplet, Heart } from 'lucide-react';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogEditingBanner from '../components/LogEditingBanner';
import LogFormActions from '../components/LogFormActions';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { formatDateTime } from '../utils/dateFormatters';
import { useAuth } from '../contexts/AuthContext';
import { DEV_CYCLE_LOG_ACCESS } from '../lib/devFlags';

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
  'Cramps',
  'Bloating',
  'Headaches',
  'Mood Changes',
  'Breast Tenderness',
  'Fatigue',
  'Acne',
  'Food Cravings',
  'Back Pain',
  'Nausea',
  'Joint Pain',
  'None',
];

const ovulationIndicatorsList = [
  'Temperature Rise',
  'Cervical Mucus',
  'Ovulation Pain',
  'Luteal Phase',
  'Follicular Phase',
];

const colorOptions = ['Bright Red', 'Dark Red', 'Brown', 'Light Pink', 'Watery Red'];
const contraceptiveOptions = [
  'None',
  'Birth Control Pill',
  'IUD',
  'Implant',
  'Injection',
  'Condom',
  'Other',
];
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
  buildInsertPayload: (formData: MenstrualFormData, userId: string) => buildPayload(formData, userId),
  buildUpdatePayload: (formData: MenstrualFormData) => buildPayload(formData),
};

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
  }, [formData.cycle_start_date, setFormData]);

  if (!DEV_CYCLE_LOG_ACCESS && profile?.gender === 'male') {
    return (
      <LogPageShell
        title="Menstrual Cycle Tracker"
        subtitle=""
        message=""
        toastVisible={false}
        onDismissToast={() => {}}
        error=""
      >
        <Card variant="elevated" className="rounded-[28px]">
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Heart className="mb-4 h-10 w-10 text-[var(--color-text-tertiary)]" />
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Cycle tracking is not part of your current profile.
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
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
      return;
    }

    const filtered = formData.symptoms.filter((item) => item !== 'None');
    setFormData({
      ...formData,
      symptoms: filtered.includes(symptom)
        ? filtered.filter((item) => item !== symptom)
        : [...filtered, symptom],
    });
  };

  const toggleOvulationIndicator = (indicator: string) => {
    setFormData({
      ...formData,
      ovulation_indicators: formData.ovulation_indicators.includes(indicator)
        ? formData.ovulation_indicators.filter((item) => item !== indicator)
        : [...formData.ovulation_indicators, indicator],
    });
  };

  return (
    <LogPageShell
      title="Menstrual Cycle Tracker"
      subtitle="Capture cycle timing, symptoms, and reproductive context in one structured entry."
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
        <Card variant="elevated" className="rounded-[28px]">
          <LogEditingBanner
            isEditing={Boolean(editingId)}
            onCancel={resetForm}
            tone="danger"
            description="Update the existing cycle entry or cancel to return to a fresh cycle record."
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="surface-panel-quiet rounded-[24px] p-4 sm:p-5">
                <label htmlFor="cycle_start_date" className="field-label mb-2 block">
                  <Droplet className="mr-1 inline h-4 w-4" />
                  Cycle Start Date
                </label>
                <input
                  type="date"
                  id="cycle_start_date"
                  value={formData.cycle_start_date}
                  onChange={(e) => setFormData({ ...formData, cycle_start_date: e.target.value })}
                  className="input-base w-full"
                  required
                />
              </div>

              <div className="surface-panel-quiet rounded-[24px] p-4 sm:p-5">
                <label htmlFor="logged_at" className="field-label mb-2 block">
                  <Clock className="mr-1 inline h-4 w-4" />
                  Logged At
                </label>
                <input
                  type="datetime-local"
                  id="logged_at"
                  value={formData.logged_at}
                  onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                  className="input-base w-full"
                  required
                />
              </div>
            </div>

            <div className="surface-intelligence rounded-[28px] p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                Cycle snapshot
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Day {formData.cycle_day}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {formData.flow_intensity} flow · {formData.color} · pain {formData.pain_level}/10
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="surface-panel-soft rounded-[24px] p-4">
                <label htmlFor="cycle_day" className="field-label mb-2 block">
                  Cycle Day
                </label>
                <input
                  type="number"
                  id="cycle_day"
                  min="1"
                  value={formData.cycle_day}
                  onChange={(e) =>
                    setFormData({ ...formData, cycle_day: parseInt(e.target.value, 10) || 1 })
                  }
                  className="input-base w-full"
                  required
                />
                <p className="field-help mt-2">Auto-calculated from start date</p>
              </div>

              <div className="surface-panel-soft rounded-[24px] p-4">
                <label htmlFor="estimated_cycle_length" className="field-label mb-2 block">
                  Estimated Cycle Length (days)
                </label>
                <input
                  type="number"
                  id="estimated_cycle_length"
                  min="15"
                  max="60"
                  value={formData.estimated_cycle_length}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimated_cycle_length: parseInt(e.target.value, 10) || 28,
                    })
                  }
                  className="input-base w-full"
                />
              </div>

              <div className="surface-panel-soft rounded-[24px] p-4">
                <label htmlFor="flow_intensity" className="field-label mb-2 block">
                  Flow Intensity
                </label>
                <select
                  id="flow_intensity"
                  value={formData.flow_intensity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      flow_intensity: e.target.value as typeof formData.flow_intensity,
                    })
                  }
                  className="input-base w-full"
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-panel-soft rounded-[24px] p-4">
                <label htmlFor="color" className="field-label mb-2 block">
                  Color
                </label>
                <select
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="input-base w-full"
                >
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              <div className="surface-panel-soft rounded-[24px] p-4">
                <label htmlFor="pain_level" className="field-label mb-2 block">
                  Pain Level:{' '}
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {formData.pain_level}/10
                  </span>
                </label>
                <input
                  type="range"
                  id="pain_level"
                  min="0"
                  max="10"
                  value={formData.pain_level}
                  onChange={(e) =>
                    setFormData({ ...formData, pain_level: parseInt(e.target.value, 10) })
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--color-danger)]"
                />
              </div>
            </div>

            <div className="surface-panel-quiet flex items-center justify-between rounded-[24px] p-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  Tissue/Clots Passed
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                  Mark if this was part of the event.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, tissue_passed: !formData.tissue_passed })}
                className={[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-smooth',
                  formData.tissue_passed ? 'bg-[var(--color-danger)]' : 'bg-white/12',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                    formData.tissue_passed ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                />
              </button>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-4">
                <label className="field-label">Symptoms</label>
                <p className="field-help mt-1">(optional)</p>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={[
                      'rounded-[20px] border px-3 py-3 text-sm font-medium transition-smooth',
                      formData.symptoms.includes(symptom)
                        ? 'border-[rgba(255,120,120,0.28)] bg-[rgba(255,120,120,0.10)] text-[var(--color-text-primary)]'
                        : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-panel-soft rounded-[24px] p-4">
              <label htmlFor="mood_notes" className="field-label mb-2 block">
                Mood Notes
                <span className="ml-2 text-[var(--color-text-tertiary)]">(optional)</span>
              </label>
              <input
                type="text"
                id="mood_notes"
                value={formData.mood_notes}
                onChange={(e) => setFormData({ ...formData, mood_notes: e.target.value })}
                placeholder="e.g. irritable, emotional, anxious..."
                className="input-base w-full"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-panel-soft rounded-[24px] p-4">
                <label htmlFor="sleep_quality" className="field-label mb-2 block">
                  Sleep Quality:{' '}
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {formData.sleep_quality}/10
                  </span>
                </label>
                <input
                  type="range"
                  id="sleep_quality"
                  min="1"
                  max="10"
                  value={formData.sleep_quality}
                  onChange={(e) =>
                    setFormData({ ...formData, sleep_quality: parseInt(e.target.value, 10) })
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--color-accent-primary)]"
                />
              </div>

              <div className="surface-panel-soft rounded-[24px] p-4">
                <label htmlFor="energy_level" className="field-label mb-2 block">
                  Energy Level:{' '}
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {formData.energy_level}/10
                  </span>
                </label>
                <input
                  type="range"
                  id="energy_level"
                  min="1"
                  max="10"
                  value={formData.energy_level}
                  onChange={(e) =>
                    setFormData({ ...formData, energy_level: parseInt(e.target.value, 10) })
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--color-accent-primary)]"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-panel-soft rounded-[24px] p-4">
                <label htmlFor="contraceptive_method" className="field-label mb-2 block">
                  Contraceptive Method
                  <span className="ml-2 text-[var(--color-text-tertiary)]">(optional)</span>
                </label>
                <select
                  id="contraceptive_method"
                  value={formData.contraceptive_method}
                  onChange={(e) =>
                    setFormData({ ...formData, contraceptive_method: e.target.value })
                  }
                  className="input-base w-full"
                >
                  {contraceptiveOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="surface-panel-soft rounded-[24px] p-4">
                <label htmlFor="cervical_mucus_type" className="field-label mb-2 block">
                  Cervical Mucus
                  <span className="ml-2 text-[var(--color-text-tertiary)]">(optional)</span>
                </label>
                <select
                  id="cervical_mucus_type"
                  value={formData.cervical_mucus_type}
                  onChange={(e) =>
                    setFormData({ ...formData, cervical_mucus_type: e.target.value })
                  }
                  className="input-base w-full"
                >
                  {cervicalMucusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-4">
                <label className="field-label">Ovulation Indicators</label>
                <p className="field-help mt-1">(optional)</p>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {ovulationIndicatorsList.map((indicator) => (
                  <button
                    key={indicator}
                    type="button"
                    onClick={() => toggleOvulationIndicator(indicator)}
                    className={[
                      'rounded-[20px] border px-3 py-3 text-sm font-medium transition-smooth',
                      formData.ovulation_indicators.includes(indicator)
                        ? 'border-[rgba(84,160,255,0.28)] bg-[rgba(84,160,255,0.10)] text-[var(--color-text-primary)]'
                        : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    {indicator}
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-panel-soft rounded-[24px] p-4">
              <label htmlFor="basal_temp" className="field-label mb-2 block">
                Basal Body Temperature
                <span className="ml-2 text-[var(--color-text-tertiary)]">(optional)</span>
              </label>
              <input
                type="number"
                id="basal_temp"
                step="0.1"
                min="96"
                max="100"
                value={formData.basal_temp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    basal_temp: e.target.value ? parseFloat(e.target.value) : '',
                  })
                }
                placeholder="e.g. 97.8 F"
                className="input-base w-full"
              />
            </div>

            <div className="surface-panel-quiet flex items-center justify-between rounded-[24px] p-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  Sexual Activity
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                  Include only if relevant to cycle context.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, sexual_activity: !formData.sexual_activity })
                }
                className={[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-smooth',
                  formData.sexual_activity ? 'bg-[var(--color-danger)]' : 'bg-white/12',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                    formData.sexual_activity ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                />
              </button>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <label htmlFor="notes" className="field-label mb-2 block">
                Additional Notes
                <span className="ml-2 text-[var(--color-text-tertiary)]">(optional)</span>
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-base min-h-[112px] w-full resize-none"
                rows={4}
                placeholder="Any other observations or context..."
              />
            </div>

            <LogFormActions isEditing={Boolean(editingId)} saving={saving} onCancel={resetForm} />
          </form>
        </Card>
      ) : (
        <Card variant="elevated" className="rounded-[28px]">
          {history.length === 0 ? (
            <EmptyState
              category="menstrual cycle"
              icon={<Heart className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
            />
          ) : (
            <div className="space-y-4">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 transition-smooth hover:border-white/14 hover:bg-white/[0.04] sm:p-5"
                >
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">
                        {formatDateTime(log.logged_at)}
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        Day {log.cycle_day} · {log.flow_intensity} flow
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => handleEdit(log as MenstrualFormData & { id: string })}
                        className="font-medium text-[var(--color-accent-primary)] transition-smooth hover:text-[var(--color-text-primary)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(log.id!)}
                        className="font-medium text-[var(--color-danger)] transition-smooth hover:opacity-80"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <MetricChip label="Color" value={log.color} />
                    <MetricChip label="Pain" value={`${log.pain_level}/10`} />
                    <MetricChip label="Sleep" value={`${log.sleep_quality}/10`} />
                    <MetricChip label="Energy" value={`${log.energy_level}/10`} />
                  </div>

                  {log.symptoms && log.symptoms.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                        Symptoms
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {log.symptoms.map((symptom: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full border border-[rgba(255,120,120,0.22)] bg-[rgba(255,120,120,0.10)] px-2.5 py-1 text-xs font-medium text-[var(--color-danger)]"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.mood_notes && (
                    <div className="mb-4 rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                      <span className="font-medium text-[var(--color-text-primary)]">Mood:</span>{' '}
                      {log.mood_notes}
                    </div>
                  )}

                  {log.notes && (
                    <div className="rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
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

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
      <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <div className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">{value}</div>
    </div>
  );
}
