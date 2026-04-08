import { Save, Clock, Activity, Brain } from 'lucide-react';
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
        newIcon={<Activity className="h-4 w-4 mr-2" />}
        historyIcon={<Clock className="h-4 w-4 mr-2" />}
      />

      {!showHistory ? (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingId ? 'Edit Entry' : 'Log New Entry'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="logged_at" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Time
              </label>
              <input
                type="datetime-local"
                id="logged_at"
                value={formData.logged_at}
                onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Brain className="inline h-4 w-4 mr-1" />
                Stress Level: {formData.stress_level}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.stress_level}
                onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                style={{
                  background: `linear-gradient(to right, rgb(249, 115, 22) 0%, rgb(249, 115, 22) ${((formData.stress_level - 1) / 9) * 100}%, rgb(229, 231, 235) ${((formData.stress_level - 1) / 9) * 100}%, rgb(229, 231, 235) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Calm</span>
                <span>Overwhelmed</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Triggers (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      formData.triggers.includes(trigger)
                        ? 'border-red-500 bg-red-50 text-neutral-text shadow-md dark:border-dark-border dark:text-neutral-text dark:hover:border-dark-muted'
                        : 'border-gray-200 text-neutral-text hover:border-gray-300'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Coping Methods Used (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {commonCopingMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({ ...formData, coping_methods: toggleItem(formData.coping_methods, method) })}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      formData.coping_methods.includes(method)
                        ? 'border-teal-500 bg-teal-50 text-gray-900 shadow-md dark:border-dark-border dark:text-neutral-text dark:hover:border-dark-muted'
                        : 'border-gray-200 text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Physical Symptoms (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {commonPhysicalSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => setFormData({ ...formData, physical_symptoms: toggleItem(formData.physical_symptoms, symptom) })}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      formData.physical_symptoms.includes(symptom)
                        ? 'border-orange-500 bg-orange-50 shadow-md dark:border-dark-border dark:text-neutral-text dark:hover:border-dark-muted'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows={3}
                placeholder="Additional context or observations..."
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
            <EmptyState category="stress" icon={<Brain className="h-8 w-8 text-gray-400" />} />
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
                        Stress Level: {log.stress_level}/10
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(log as StressFormData & { id: string })}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
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
                  {log.triggers && log.triggers.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 mb-1">Triggers:</div>
                      <div className="flex flex-wrap gap-1">
                        {log.triggers.map((trigger: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {log.coping_methods && log.coping_methods.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 mb-1">Coping Methods:</div>
                      <div className="flex flex-wrap gap-1">
                        {log.coping_methods.map((method: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {log.physical_symptoms && log.physical_symptoms.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 mb-1">Physical Symptoms:</div>
                      <div className="flex flex-wrap gap-1">
                        {log.physical_symptoms.map((symptom: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {log.notes && (
                    <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
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
