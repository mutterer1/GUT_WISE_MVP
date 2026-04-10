import { Save, Clock, Activity, Dumbbell, Pencil } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
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
  'Walking', 'Running', 'Cycling', 'Swimming',
  'Yoga', 'Strength Training', 'HIIT', 'Pilates',
  'Dancing', 'Hiking', 'Sports', 'Stretching',
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
    buildInsertPayload: (formData, userId) => ({
      user_id: userId,
      logged_at: formData.logged_at,
      exercise_type: formData.exercise_type,
      duration_minutes: formData.duration_minutes,
      intensity_level: formData.intensity_level,
      perceived_exertion: formData.perceived_exertion,
      indoor_outdoor: formData.indoor_outdoor || null,
      notes: formData.notes || null,
    }),
    buildUpdatePayload: (formData) => ({
      logged_at: formData.logged_at,
      exercise_type: formData.exercise_type,
      duration_minutes: formData.duration_minutes,
      intensity_level: formData.intensity_level,
      perceived_exertion: formData.perceived_exertion,
      indoor_outdoor: formData.indoor_outdoor || null,
      notes: formData.notes || null,
    }),
  });

  return (
    <LogPageShell
      title="Exercise Log"
      subtitle="Track workouts, movement, and physical activity"
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
        <Card>
          {editingId && (
            <div className="mb-6 flex items-center justify-between rounded-xl bg-brand-500/8 dark:bg-brand-500/10 border border-brand-500/20 px-4 py-3">
              <div className="flex items-center gap-2 text-body-sm text-brand-500 dark:text-brand-300">
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
            <div>
              <label htmlFor="logged_at" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                <Clock className="mr-1 inline h-4 w-4" />
                Time
              </label>
              <input
                type="datetime-local"
                id="logged_at"
                value={formData.logged_at}
                onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                <Activity className="mr-1 inline h-4 w-4" />
                Exercise Type
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {exerciseTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, exercise_type: type })}
                    className={`rounded-xl border-2 p-3 text-body-sm font-medium transition-all ${
                      formData.exercise_type === type
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                        : 'border-neutral-border dark:border-dark-border text-neutral-text dark:text-dark-text hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
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
                  className="mt-3 w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50"
                />
              )}
              {exerciseTypes.includes(formData.exercise_type) && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, exercise_type: '' })}
                  className="mt-2 text-xs text-brand-500 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-100"
                >
                  Use custom type instead
                </button>
              )}
            </div>

            <div>
              <label htmlFor="duration" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                min="0"
                max="600"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
              <div className="mt-2 flex gap-2">
                {[15, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setFormData({ ...formData, duration_minutes: mins })}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      formData.duration_minutes === mins
                        ? 'bg-brand-500 text-white'
                        : 'bg-neutral-bg dark:bg-dark-bg border border-neutral-border dark:border-dark-border text-neutral-muted dark:text-dark-muted hover:text-neutral-text dark:hover:text-dark-text'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Intensity: <span className="text-neutral-text dark:text-dark-text">{formData.intensity_level}/5 - {intensityLabels[formData.intensity_level]}</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.intensity_level}
                onChange={(e) => setFormData({ ...formData, intensity_level: parseInt(e.target.value) })}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-brand-500"
              />
              <div className="mt-1 flex justify-between text-xs text-neutral-muted dark:text-dark-muted">
                <span>Very Light</span>
                <span>Maximum</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Perceived Exertion (Optional): <span className="text-neutral-text dark:text-dark-text">{formData.perceived_exertion ?? '-'}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.perceived_exertion ?? 5}
                onChange={(e) => setFormData({ ...formData, perceived_exertion: parseInt(e.target.value) })}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-brand-500"
              />
              <div className="mt-1 flex justify-between text-xs text-neutral-muted dark:text-dark-muted">
                <span>Easy</span>
                <span>Max Effort</span>
              </div>
              {formData.perceived_exertion !== null && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, perceived_exertion: null })}
                  className="mt-1 text-xs text-neutral-muted dark:text-dark-muted hover:text-neutral-text dark:hover:text-dark-text"
                >
                  Clear
                </button>
              )}
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Location (Optional)
              </label>
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
                    className={`flex-1 rounded-xl border-2 p-3 text-body-sm font-medium capitalize transition-all ${
                      formData.indoor_outdoor === loc
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                        : 'border-neutral-border dark:border-dark-border text-neutral-text dark:text-dark-text hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50 resize-none"
                rows={3}
                placeholder="How did the workout feel?"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving || !formData.exercise_type} size="lg">
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
            <EmptyState category="exercise" icon={<Dumbbell className="h-8 w-8 text-neutral-muted dark:text-dark-muted" />} />
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
                        {log.exercise_type} &middot; {log.duration_minutes}min &middot; Intensity {log.intensity_level}/5
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(log as ExerciseFormData & { id: string })}
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
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 text-xs text-brand-500 dark:text-brand-300">
                      {intensityLabels[log.intensity_level] || `Intensity ${log.intensity_level}`}
                    </span>
                    {log.indoor_outdoor && (
                      <span className="inline-flex items-center rounded-full bg-neutral-bg dark:bg-dark-bg border border-neutral-border dark:border-dark-border px-2.5 py-1 text-xs capitalize text-neutral-muted dark:text-dark-muted">
                        {log.indoor_outdoor}
                      </span>
                    )}
                    {log.perceived_exertion != null && (
                      <span className="inline-flex items-center rounded-full bg-neutral-bg dark:bg-dark-bg border border-neutral-border dark:border-dark-border px-2.5 py-1 text-xs text-neutral-muted dark:text-dark-muted">
                        RPE {log.perceived_exertion}/10
                      </span>
                    )}
                  </div>
                  {log.notes && (
                    <div className="mt-3 rounded-lg bg-neutral-bg dark:bg-dark-bg px-3 py-2 text-body-sm text-neutral-muted dark:text-dark-muted">
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
