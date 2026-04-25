import { Activity, Clock, Dumbbell } from 'lucide-react';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogEditingBanner from '../components/LogEditingBanner';
import LogFormActions from '../components/LogFormActions';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { formatDateTime } from '../utils/dateFormatters';

interface ExerciseFormData {
  logged_at: string;
  exercise_type: string;
  duration_minutes: number;
  intensity_level: number;
  perceived_exertion: number | null;
  indoor_outdoor: string | null;
  notes: string;
}

const exerciseTypes = [
  'Walking',
  'Running',
  'Cycling',
  'Swimming',
  'Yoga',
  'Strength Training',
  'HIIT',
  'Pilates',
  'Dancing',
  'Hiking',
  'Sports',
  'Stretching',
];

const intensityLabels: Record<number, string> = {
  1: 'Very Light',
  2: 'Light',
  3: 'Moderate',
  4: 'Vigorous',
  5: 'Maximum',
};

export default function ExerciseLog() {
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
  } = useLogCrud<ExerciseFormData>({
    table: 'exercise_logs',
    logType: 'exercise',
    defaultValues: {
      exercise_type: '',
      duration_minutes: 30,
      intensity_level: 3,
      perceived_exertion: null,
      indoor_outdoor: null,
      notes: '',
    },
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      exercise_type: data.exercise_type,
      duration_minutes: data.duration_minutes,
      intensity_level: data.intensity_level,
      perceived_exertion: data.perceived_exertion,
      indoor_outdoor: data.indoor_outdoor || null,
      notes: data.notes || null,
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      exercise_type: data.exercise_type,
      duration_minutes: data.duration_minutes,
      intensity_level: data.intensity_level,
      perceived_exertion: data.perceived_exertion,
      indoor_outdoor: data.indoor_outdoor || null,
      notes: data.notes || null,
    }),
  });

  return (
    <LogPageShell
      title="Exercise Log"
      subtitle="Track movement, intensity, and exertion so activity can be compared against digestion, stress, and recovery."
      message={message}
      toastVisible={toastVisible}
      onDismissToast={dismissToast}
      error={error}
    >
      <LogModeTabs
        showHistory={showHistory}
        onShowNew={() => setShowHistory(false)}
        onShowHistory={() => setShowHistory(true)}
        newIcon={<Dumbbell className="mr-2 h-4 w-4" />}
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
                  Time the session so movement can be evaluated against symptoms and meals.
                </p>
              </div>

              <div className="surface-intelligence rounded-[24px] p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                  Session snapshot
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                  {formData.exercise_type || 'Select an activity'}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {formData.duration_minutes} min · {intensityLabels[formData.intensity_level]}
                </p>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-4">
                <label className="field-label">
                  <Activity className="mr-1 inline h-4 w-4" />
                  Exercise Type
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {exerciseTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, exercise_type: type })}
                    className={[
                      'rounded-[20px] border px-3 py-3 text-sm font-medium transition-smooth',
                      formData.exercise_type === type
                        ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)] text-[var(--color-text-primary)]'
                        : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {!exerciseTypes.includes(formData.exercise_type) && (
                <input
                  type="text"
                  placeholder="Or type a custom activity..."
                  value={exerciseTypes.includes(formData.exercise_type) ? '' : formData.exercise_type}
                  onChange={(e) => setFormData({ ...formData, exercise_type: e.target.value })}
                  className="input-base mt-4 w-full"
                />
              )}

              {exerciseTypes.includes(formData.exercise_type) && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, exercise_type: '' })}
                  className="mt-3 text-xs text-[var(--color-accent-primary)] transition-smooth hover:text-[var(--color-text-primary)]"
                >
                  Use custom type instead
                </button>
              )}
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <label htmlFor="duration" className="field-label mb-2 block">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                min="0"
                max="600"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="input-base w-full"
                required
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {[15, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setFormData({ ...formData, duration_minutes: mins })}
                    className={[
                      'rounded-full px-3 py-1 text-xs font-medium transition-smooth',
                      formData.duration_minutes === mins
                        ? 'bg-[var(--color-accent-primary)] text-white'
                        : 'border border-white/10 bg-white/[0.03] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]',
                    ].join(' ')}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <label className="field-label mb-2 block">
                Intensity:{' '}
                <span className="font-medium text-[var(--color-text-primary)]">
                  {formData.intensity_level}/5 - {intensityLabels[formData.intensity_level]}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.intensity_level}
                onChange={(e) =>
                  setFormData({ ...formData, intensity_level: parseInt(e.target.value, 10) })
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--color-accent-primary)]"
              />
              <div className="mt-2 flex justify-between text-xs text-[var(--color-text-tertiary)]">
                <span>Very Light</span>
                <span>Maximum</span>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <label className="field-label mb-2 block">
                Perceived Exertion (optional):{' '}
                <span className="font-medium text-[var(--color-text-primary)]">
                  {formData.perceived_exertion ?? '-'}/10
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.perceived_exertion ?? 5}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    perceived_exertion: parseInt(e.target.value, 10),
                  })
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--color-accent-primary)]"
              />
              <div className="mt-2 flex justify-between text-xs text-[var(--color-text-tertiary)]">
                <span>Easy</span>
                <span>Max Effort</span>
              </div>
              {formData.perceived_exertion !== null && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, perceived_exertion: null })}
                  className="mt-2 text-xs text-[var(--color-text-tertiary)] transition-smooth hover:text-[var(--color-text-primary)]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-3">
                <label className="field-label">Location</label>
                <p className="field-help mt-1">(optional)</p>
              </div>
              <div className="flex gap-3">
                {(['indoor', 'outdoor'] as const).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        indoor_outdoor: formData.indoor_outdoor === loc ? null : loc,
                      })
                    }
                    className={[
                      'flex-1 rounded-[20px] border p-3 text-sm font-medium capitalize transition-smooth',
                      formData.indoor_outdoor === loc
                        ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)] text-[var(--color-text-primary)]'
                        : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    {loc}
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
                placeholder="How did the workout feel?"
              />
            </div>

            <LogFormActions
              isEditing={Boolean(editingId)}
              saving={saving}
              submitDisabled={!formData.exercise_type}
              onCancel={resetForm}
            />
          </form>
        </Card>
      ) : (
        <Card variant="elevated" className="rounded-[28px]">
          {history.length === 0 ? (
            <EmptyState
              category="exercise"
              icon={<Dumbbell className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
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
                        {log.exercise_type} · {log.duration_minutes}min · Intensity {log.intensity_level}/5
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => handleEdit(log as ExerciseFormData & { id: string })}
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

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-[rgba(84,160,255,0.22)] bg-[rgba(84,160,255,0.10)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent-primary)]">
                      {intensityLabels[log.intensity_level] || `Intensity ${log.intensity_level}`}
                    </span>

                    {log.indoor_outdoor && (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs capitalize text-[var(--color-text-secondary)]">
                        {log.indoor_outdoor}
                      </span>
                    )}

                    {log.perceived_exertion != null && (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">
                        RPE {log.perceived_exertion}/10
                      </span>
                    )}
                  </div>

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
