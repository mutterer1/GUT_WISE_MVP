import { Activity, Clock, Frown } from 'lucide-react';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogEditingBanner from '../components/LogEditingBanner';
import LogFormActions from '../components/LogFormActions';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { formatDateTime } from '../utils/dateFormatters';

interface StressFormData {
  logged_at: string;
  stress_level: number;
  triggers: string[];
  coping_methods: string[];
  physical_symptoms: string[];
  notes: string;
}

const commonTriggers = [
  'Work',
  'Relationships',
  'Finances',
  'Health',
  'Family',
  'Deadlines',
  'Social Events',
  'Traffic',
];

const commonCopingMethods = [
  'Deep Breathing',
  'Exercise',
  'Meditation',
  'Talk to Someone',
  'Music',
  'Walk',
  'Journaling',
  'Rest',
];

const commonPhysicalSymptoms = [
  'Headache',
  'Tension',
  'Rapid Heartbeat',
  'Fatigue',
  'Stomach Issues',
  'Sweating',
  'Muscle Pain',
  'Sleep Issues',
];

const toggleItem = (array: string[], item: string) =>
  array.includes(item) ? array.filter((entry) => entry !== item) : [...array, item];

export default function StressLog() {
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
  } = useLogCrud<StressFormData>({
    table: 'stress_logs' as const,
    logType: 'stress' as const,
    defaultValues: {
      stress_level: 5,
      triggers: [] as string[],
      coping_methods: [] as string[],
      physical_symptoms: [] as string[],
      notes: '' as const,
    },
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      stress_level: data.stress_level,
      triggers: data.triggers,
      coping_methods: data.coping_methods,
      physical_symptoms: data.physical_symptoms,
      notes: data.notes,
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      stress_level: data.stress_level,
      triggers: data.triggers,
      coping_methods: data.coping_methods,
      physical_symptoms: data.physical_symptoms,
      notes: data.notes,
    }),
  });

  return (
    <LogPageShell
      title="Stress Log"
      subtitle="Capture the pressure level, likely triggers, and what helped regulate it."
      message={message}
      toastVisible={toastVisible}
      onDismissToast={dismissToast}
      error={error}
    >
      <LogModeTabs
        showHistory={showHistory}
        onShowNew={() => setShowHistory(false)}
        onShowHistory={() => setShowHistory(true)}
        newIcon={<Activity className="mr-2 h-4 w-4" />}
        historyIcon={<Clock className="mr-2 h-4 w-4" />}
        newLabel={editingId ? 'Edit Entry' : 'New Entry'}
      />

      {!showHistory ? (
        <Card variant="elevated" className="rounded-[28px]">
          <LogEditingBanner isEditing={Boolean(editingId)} onCancel={resetForm} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="surface-panel-quiet rounded-[24px] p-4 sm:p-5">
                <label htmlFor="logged_at" className="field-label mb-2 block">
                  <Clock className="mr-1 inline h-4 w-4" />
                  Time
                </label>
                <input
                  type="datetime-local"
                  id="logged_at"
                  value={formData.logged_at}
                  onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                  className="input-base w-full"
                  required
                />
                <p className="field-help mt-2">
                  Timestamp the moment so stress can be compared against symptoms and behavior.
                </p>
              </div>

              <div className="surface-intelligence rounded-[24px] p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                  Stress posture
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                  {formData.stress_level}/10
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Record the felt load, then add likely causes and physical spillover only if they
                  sharpen the pattern.
                </p>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <label className="field-label mb-2 block">
                <Frown className="mr-1 inline h-4 w-4" />
                Stress Level:{' '}
                <span className="font-medium text-[var(--color-text-primary)]">
                  {formData.stress_level}/10
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.stress_level}
                onChange={(e) =>
                  setFormData({ ...formData, stress_level: parseInt(e.target.value, 10) })
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--color-danger)]"
              />
              <div className="mt-2 flex justify-between text-xs text-[var(--color-text-tertiary)]">
                <span>Calm</span>
                <span>Overwhelmed</span>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-4">
                <label className="field-label">Triggers</label>
                <p className="field-help mt-1">(optional)</p>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {commonTriggers.map((trigger) => (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        triggers: toggleItem(formData.triggers, trigger),
                      })
                    }
                    className={[
                      'rounded-[20px] border px-3 py-3 text-sm font-medium transition-smooth',
                      formData.triggers.includes(trigger)
                        ? 'border-[rgba(255,120,120,0.28)] bg-[rgba(255,120,120,0.10)] text-[var(--color-text-primary)]'
                        : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-4">
                <label className="field-label">Coping Methods Used</label>
                <p className="field-help mt-1">(optional)</p>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {commonCopingMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        coping_methods: toggleItem(formData.coping_methods, method),
                      })
                    }
                    className={[
                      'rounded-[20px] border px-3 py-3 text-sm font-medium transition-smooth',
                      formData.coping_methods.includes(method)
                        ? 'border-[rgba(84,160,255,0.28)] bg-[rgba(84,160,255,0.10)] text-[var(--color-text-primary)]'
                        : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-4">
                <label className="field-label">Physical Symptoms</label>
                <p className="field-help mt-1">(optional)</p>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {commonPhysicalSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        physical_symptoms: toggleItem(formData.physical_symptoms, symptom),
                      })
                    }
                    className={[
                      'rounded-[20px] border px-3 py-3 text-sm font-medium transition-smooth',
                      formData.physical_symptoms.includes(symptom)
                        ? 'border-[rgba(255,170,92,0.28)] bg-[rgba(255,170,92,0.10)] text-[var(--color-text-primary)]'
                        : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <label htmlFor="notes" className="field-label mb-2 block">
                Notes
                <span className="ml-2 text-[var(--color-text-tertiary)]">(optional)</span>
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-base min-h-[112px] w-full resize-none"
                rows={4}
                placeholder="Additional context or observations..."
              />
            </div>

            <LogFormActions isEditing={Boolean(editingId)} saving={saving} onCancel={resetForm} />
          </form>
        </Card>
      ) : (
        <Card variant="elevated" className="rounded-[28px]">
          {history.length === 0 ? (
            <EmptyState
              category="stress"
              icon={<Frown className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
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
                        Stress Level: {log.stress_level}/10
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => handleEdit(log as StressFormData & { id: string })}
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

                  {log.triggers && log.triggers.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                        Triggers
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {log.triggers.map((trigger: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full border border-[rgba(255,120,120,0.22)] bg-[rgba(255,120,120,0.10)] px-2.5 py-1 text-xs font-medium text-[var(--color-danger)]"
                          >
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.coping_methods && log.coping_methods.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                        Coping Methods
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {log.coping_methods.map((method: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full border border-[rgba(84,160,255,0.22)] bg-[rgba(84,160,255,0.10)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent-primary)]"
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.physical_symptoms && log.physical_symptoms.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                        Physical Symptoms
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {log.physical_symptoms.map((symptom: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full border border-[rgba(255,170,92,0.22)] bg-[rgba(255,170,92,0.10)] px-2.5 py-1 text-xs font-medium text-[var(--color-warning)]"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
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
