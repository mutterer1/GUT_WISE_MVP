import { useState } from 'react';
import { Save, Clock, Activity, AlertCircle } from 'lucide-react';
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
      />

      {!showHistory ? (
        <Card>
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            {editingId ? 'Edit Entry' : 'Log New Entry'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="logged_at" className="mb-2 block text-sm font-medium text-gray-700">
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-900">
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
                    className={`rounded-lg border-2 p-3 text-sm transition-all ${
                      formData.symptom_type === symptom
                        ? 'border-teal-500 bg-teal-50 text-gray-900 shadow-md dark:border-dark-border dark:text-dark-text dark:hover:border-dark-border'
                        : 'border-gray-200 text-gray-900 hover:border-gray-300 text-gray-900'
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
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
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
                <div className="mt-2 text-sm text-teal-600">
                  Selected: {formData.symptom_type}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Severity: {formData.severity}/10
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
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-red-500"
              />

              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Mild</span>
                <span>Severe</span>
              </div>
            </div>

            <div>
              <label htmlFor="duration" className="mb-2 block text-sm font-medium text-gray-700">
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                min="1"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-700">
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-900">
                Potential Triggers
              </label>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {commonTriggers.map((trigger) => (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => toggleTrigger(trigger)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
  formData.triggers.includes(trigger)
    ? 'border-orange-500 bg-orange-50 text-gray-900 shadow-md dark:border-dark-border dark:text-gray-900 dark:hover:border-dark-muted'
    : 'border-gray-200 text-gray-900 hover:border-gray-500 dark:border-gray-200 dark:text-gray-900 dark:hover:border-gray-500'
}`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving || !formData.symptom_type}>
                <Save className="mr-2 inline h-4 w-4" />
                {saving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Entry'
                  : 'Save Entry'}
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
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Entry History</h2>

          {history.length === 0 ? (
            <EmptyState
              category="symptoms"
              icon={<AlertCircle className="h-8 w-8 text-gray-400" />}
            />
          ) : (
            <div className="space-y-4">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDateTime(log.logged_at)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {log.symptom_type}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleEdit(log as SymptomsFormData & { id: string })
                        }
                        className="text-sm font-medium text-teal-600 hover:text-teal-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(log.id!)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Severity:</span>
                      <span className="ml-1 font-medium">{log.severity}/10</span>
                    </div>

                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-1 font-medium">
                        {log.duration_minutes} min
                      </span>
                    </div>
                  </div>

                  {log.location && (
                    <div className="mb-2 text-sm text-gray-600">
                      <span className="font-medium">Location:</span>{' '}
                      {log.location}
                    </div>
                  )}

                  {log.triggers?.length > 0 && (
                    <div className="mb-2">
                      <div className="mb-1 text-xs text-gray-500">Triggers:</div>
                      <div className="flex flex-wrap gap-1">
                        {log.triggers.map((trigger, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800"
                          >
                            <AlertCircle className="mr-1 h-3 w-3" />
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.notes && (
                    <div className="mt-3 rounded bg-gray-50 p-2 text-sm text-gray-600">
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
