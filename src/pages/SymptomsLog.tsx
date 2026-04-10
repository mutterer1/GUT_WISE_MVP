import { useState } from 'react';
import { Save, Clock, Activity, AlertCircle, Pencil } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { formatDateTime } from '../utils/dateFormatters';

interface SymptomsFormData {
  id?: string;
  logged_at: string;
  symptom_type: string;
  severity: number;
  duration_minutes: number;
  location: string;
  triggers: string[];
  notes: string;
}

const commonSymptoms = [
  'Abdominal Pain',
  'Bloating',
  'Nausea',
  'Cramping',
  'Gas',
  'Headache',
  'Fatigue',
  'Dizziness',
];

const commonTriggers = [
  'Food',
  'Stress',
  'Lack of Sleep',
  'Exercise',
  'Weather',
  'Medication',
  'Dehydration',
];

export default function SymptomsLog() {
  const [customSymptom, setCustomSymptom] = useState('');

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
    resetForm: baseResetForm,
  } = useLogCrud<SymptomsFormData>({
    table: 'symptom_logs',
    logType: 'symptoms',
    defaultValues: {
      symptom_type: '',
      severity: 5,
      duration_minutes: 30,
      location: '',
      triggers: [],
      notes: '',
    },
    buildInsertPayload: (formData, userId) => ({
      user_id: userId,
      logged_at: formData.logged_at,
      symptom_type: formData.symptom_type,
      severity: formData.severity,
      duration_minutes: formData.duration_minutes,
      location: formData.location,
      triggers: formData.triggers,
      notes: formData.notes,
    }),
    buildUpdatePayload: (formData) => ({
      logged_at: formData.logged_at,
      symptom_type: formData.symptom_type,
      severity: formData.severity,
      duration_minutes: formData.duration_minutes,
      location: formData.location,
      triggers: formData.triggers,
      notes: formData.notes,
    }),
  });

  const resetForm = () => {
    baseResetForm();
    setCustomSymptom('');
  };

  const toggleTrigger = (trigger: string) => {
    setFormData({
      ...formData,
      triggers: formData.triggers.includes(trigger)
        ? formData.triggers.filter((t) => t !== trigger)
        : [...formData.triggers, trigger],
    });
  };

  return (
    <LogPageShell
      title="Symptoms Log"
      subtitle="Track symptoms, severity, and potential triggers"
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
                onChange={(e) =>
                  setFormData({ ...formData, logged_at: e.target.value })
                }
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Symptom Type
              </label>

              <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, symptom_type: symptom })
                    }
                    className={`rounded-xl border-2 p-3 text-body-sm font-medium transition-all ${
                      formData.symptom_type === symptom
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                        : 'border-neutral-border dark:border-dark-border text-neutral-text dark:text-dark-text hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder="Or enter custom symptom..."
                  className="flex-1 rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50"
                />

                <Button
                  type="button"
                  onClick={() => {
                    if (customSymptom.trim()) {
                      setFormData({
                        ...formData,
                        symptom_type: customSymptom.trim(),
                      });
                      setCustomSymptom('');
                    }
                  }}
                >
                  Set
                </Button>
              </div>

              {formData.symptom_type && (
                <div className="mt-2 text-body-sm text-brand-500 dark:text-brand-300">
                  Selected: {formData.symptom_type}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Severity: <span className="text-neutral-text dark:text-dark-text">{formData.severity}/10</span>
              </label>

              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.severity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    severity: parseInt(e.target.value, 10),
                  })
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-signal-500"
              />

              <div className="mt-1 flex justify-between text-xs text-neutral-muted dark:text-dark-muted">
                <span>Mild</span>
                <span>Severe</span>
              </div>
            </div>

            <div>
              <label htmlFor="duration" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Duration (minutes)
              </label>

              <input
                type="number"
                id="duration"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: parseInt(e.target.value, 10),
                  })
                }
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                min="1"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Location (Optional)
              </label>

              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Lower abdomen, Head..."
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50"
              />
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Potential Triggers
              </label>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {commonTriggers.map((trigger) => (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => toggleTrigger(trigger)}
                    className={`rounded-xl border-2 p-3 text-body-sm font-medium transition-all ${
                      formData.triggers.includes(trigger)
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                        : 'border-neutral-border dark:border-dark-border text-neutral-text dark:text-dark-text hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Notes
              </label>

              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder="Additional observations..."
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving || !formData.symptom_type} size="lg">
                <Save className="mr-2 inline h-4 w-4" />
                {saving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Entry'
                  : 'Save Entry'}
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
            <EmptyState
              category="symptoms"
              icon={<AlertCircle className="h-8 w-8 text-neutral-muted dark:text-dark-muted" />}
            />
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
                        {log.symptom_type}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          handleEdit(log as SymptomsFormData & { id: string })
                        }
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

                  <div className="mb-3 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-neutral-muted dark:text-dark-muted">Severity:</span>
                      <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">{log.severity}/10</span>
                    </div>

                    <div>
                      <span className="text-neutral-muted dark:text-dark-muted">Duration:</span>
                      <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">
                        {log.duration_minutes} min
                      </span>
                    </div>
                  </div>

                  {log.location && (
                    <div className="mb-2 text-body-sm text-neutral-muted dark:text-dark-muted">
                      <span className="font-medium">Location:</span>{' '}
                      {log.location}
                    </div>
                  )}

                  {log.triggers?.length > 0 && (
                    <div className="mb-2">
                      <div className="mb-1 text-xs text-neutral-muted dark:text-dark-muted">Triggers:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {log.triggers.map((trigger, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full bg-neutral-bg dark:bg-dark-bg border border-neutral-border dark:border-dark-border px-2.5 py-1 text-xs text-neutral-muted dark:text-dark-muted"
                          >
                            <AlertCircle className="mr-1 h-3 w-3" />
                            {trigger}
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
