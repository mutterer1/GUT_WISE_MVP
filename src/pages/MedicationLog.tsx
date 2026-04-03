import { Save, Clock, Activity, Pill } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { formatDateTime } from '../utils/dateFormatters';

interface MedicationFormData {
  logged_at: string;
  medication_name: string;
  dosage: string;
  medication_type: 'prescription' | 'otc' | 'supplement';
  taken_as_prescribed: boolean;
  side_effects: string[];
  notes: string;
}

const commonSideEffects = [
  'Drowsiness', 'Nausea', 'Dizziness', 'Headache',
  'Dry Mouth', 'Upset Stomach', 'Fatigue', 'None',
];

export default function MedicationLog() {
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
  } = useLogCrud<MedicationFormData>({
    table: 'medication_logs' as const,
    logType: 'medication' as const,
    defaultValues: {
      medication_name: '' as const,
      dosage: '' as const,
      medication_type: 'prescription' as const,
      taken_as_prescribed: true,
      side_effects: [] as string[],
      notes: '' as const,
    },
    buildInsertPayload: (formData, userId) => ({
      user_id: userId,
      logged_at: formData.logged_at,
      medication_name: formData.medication_name,
      dosage: formData.dosage,
      medication_type: formData.medication_type,
      taken_as_prescribed: formData.taken_as_prescribed,
      side_effects: formData.side_effects,
      notes: formData.notes,
    }),
    buildUpdatePayload: (formData) => ({
      logged_at: formData.logged_at,
      medication_name: formData.medication_name,
      dosage: formData.dosage,
      medication_type: formData.medication_type,
      taken_as_prescribed: formData.taken_as_prescribed,
      side_effects: formData.side_effects,
      notes: formData.notes,
    }),
  });

  const toggleSideEffect = (effect: string) => {
    if (effect === 'None') {
      setFormData({ ...formData, side_effects: ['None'] });
    } else {
      const filtered = formData.side_effects.filter((e) => e !== 'None');
      setFormData({
        ...formData,
        side_effects: filtered.includes(effect)
          ? filtered.filter((e) => e !== effect)
          : [...filtered, effect],
      });
    }
  };

  return (
    <LogPageShell
      title="Medication Log"
      subtitle="Track medications, dosages, and adherence"
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
                Time Taken
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
              <label htmlFor="medication_name" className="block text-sm font-medium text-gray-700 mb-2">
                <Pill className="inline h-4 w-4 mr-1" />
                Medication Name
              </label>
              <input
                type="text"
                id="medication_name"
                value={formData.medication_name}
                onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                placeholder="e.g., Ibuprofen, Vitamin D..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-2">
                Dosage
              </label>
              <input
                type="text"
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 200mg, 1 tablet, 5ml..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Medication Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['prescription', 'otc', 'supplement'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, medication_type: type })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.medication_type === type
                        ? 'border-teal-500 bg-teal-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {type === 'otc' ? 'Over-the-Counter' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Taken as Prescribed</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, taken_as_prescribed: !formData.taken_as_prescribed })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.taken_as_prescribed ? 'bg-teal-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.taken_as_prescribed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Side Effects (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {commonSideEffects.map((effect) => (
                  <button
                    key={effect}
                    type="button"
                    onClick={() => toggleSideEffect(effect)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      formData.side_effects.includes(effect)
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {effect}
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
                placeholder="Reason for taking, effectiveness, etc..."
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
            <EmptyState category="medication" icon={<Pill className="h-8 w-8 text-gray-400" />} />
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
                        {log.medication_name} • {log.dosage}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(log as MedicationFormData & { id: string })}
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
                  <div className="flex gap-4 text-xs mb-2">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-1 font-medium capitalize">{log.medication_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">As Prescribed:</span>
                      <span className="ml-1 font-medium">{log.taken_as_prescribed ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  {log.side_effects && log.side_effects.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 mb-1">Side Effects:</div>
                      <div className="flex flex-wrap gap-1">
                        {log.side_effects.map((effect: string, idx: number) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              effect === 'None' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {effect}
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
