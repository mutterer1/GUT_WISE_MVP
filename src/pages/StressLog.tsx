import { Save, Clock, Activity, Brain, Pencil } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
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
  'Work', 'Relationships', 'Finances', 'Health',
  'Family', 'Deadlines', 'Social Events', 'Traffic',
];

const commonCopingMethods = [
  'Deep Breathing', 'Exercise', 'Meditation', 'Talk to Someone',
  'Music', 'Walk', 'Journaling', 'Rest',
];

const commonPhysicalSymptoms = [
  'Headache', 'Tension', 'Rapid Heartbeat', 'Fatigue',
  'Stomach Issues', 'Sweating', 'Muscle Pain', 'Sleep Issues',
];

const toggleItem = (array: string[], item: string) =>
  array.includes(item) ? array.filter((i) => i !== item) : [...array, item];

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
    buildInsertPayload: (formData, userId) => ({
      user_id: userId,
      logged_at: formData.logged_at,
      stress_level: formData.stress_level,
      triggers: formData.triggers,
      coping_methods: formData.coping_methods,
      physical_symptoms: formData.physical_symptoms,
      notes: formData.notes,
    }),
    buildUpdatePayload: (formData) => ({
      logged_at: formData.logged_at,
      stress_level: formData.stress_level,
      triggers: formData.triggers,
      coping_methods: formData.coping_methods,
      physical_symptoms: formData.physical_symptoms,
      notes: formData.notes,
    }),
  });

  return (
    <LogPageShell
      title="Stress Log"
      subtitle="Track stress levels, triggers, and coping strategies"
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
              <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                <Brain className="mr-1 inline h-4 w-4" />
                Stress Level: <span className="text-neutral-text dark:text-dark-text">{formData.stress_level}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.stress_level}
                onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-signal-500"
              />
              <div className="mt-1 flex justify-between text-xs text-neutral-muted dark:text-dark-muted">
                <span>Calm</span>
                <span>Overwhelmed</span>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Triggers (Optional)
              </label>
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
                    className={`rounded-xl border-2 p-3 text-body-sm font-medium transition-all ${
                      formData.triggers.includes(trigger)
                        ? 'border-signal-500 bg-signal-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                        : 'border-neutral-border dark:border-dark-border text-neutral-text dark:text-dark-text hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Coping Methods Used (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {commonCopingMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({ ...formData, coping_methods: toggleItem(formData.coping_methods, method) })}
                    className={`rounded-xl border-2 p-3 text-body-sm font-medium transition-all ${
                      formData.coping_methods.includes(method)
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                        : 'border-neutral-border dark:border-dark-border text-neutral-text dark:text-dark-text hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Physical Symptoms (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {commonPhysicalSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => setFormData({ ...formData, physical_symptoms: toggleItem(formData.physical_symptoms, symptom) })}
                    className={`rounded-xl border-2 p-3 text-body-sm font-medium transition-all ${
                      formData.physical_symptoms.includes(symptom)
                        ? 'border-orange-500 bg-orange-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                        : 'border-neutral-border dark:border-dark-border text-neutral-text dark:text-dark-text hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    {symptom}
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
                placeholder="Additional context or observations..."
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
            <EmptyState category="stress" icon={<Brain className="h-8 w-8 text-neutral-muted dark:text-dark-muted" />} />
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
                        Stress Level: {log.stress_level}/10
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(log as StressFormData & { id: string })}
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
                  {log.triggers && log.triggers.length > 0 && (
                    <div className="mb-2">
                      <div className="mb-1 text-xs text-neutral-muted dark:text-dark-muted">Triggers:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {log.triggers.map((trigger: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center rounded-full bg-signal-500/10 border border-signal-500/20 px-2.5 py-1 text-xs text-signal-500 dark:text-signal-300">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {log.coping_methods && log.coping_methods.length > 0 && (
                    <div className="mb-2">
                      <div className="mb-1 text-xs text-neutral-muted dark:text-dark-muted">Coping Methods:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {log.coping_methods.map((method: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center rounded-full bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 text-xs text-brand-500 dark:text-brand-300">
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {log.physical_symptoms && log.physical_symptoms.length > 0 && (
                    <div className="mb-2">
                      <div className="mb-1 text-xs text-neutral-muted dark:text-dark-muted">Physical Symptoms:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {log.physical_symptoms.map((symptom: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 text-xs text-orange-600 dark:text-orange-300">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
