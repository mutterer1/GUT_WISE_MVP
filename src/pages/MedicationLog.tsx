import { Save, Clock, Activity, Pill, Pencil } from 'lucide-react';
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
                Time Taken
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
              <label htmlFor="medication_name" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                <Pill className="mr-1 inline h-4 w-4" />
                Medication Name
              </label>
              <input
                type="text"
                id="medication_name"
                value={formData.medication_name}
                onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                placeholder="e.g., Ibuprofen, Vitamin D..."
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50"
                required
              />
            </div>

            <div>
              <label htmlFor="dosage" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Dosage
              </label>
              <input
                type="text"
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 200mg, 1 tablet, 5ml..."
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50"
                required
              />
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Medication Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['prescription', 'otc', 'supplement'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, medication_type: type })}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      formData.medication_type === type
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 shadow-sm'
                        : 'border-neutral-border dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    <div className="text-body-sm font-medium text-neutral-text dark:text-dark-text">
                      {type === 'otc' ? 'Over-the-Counter' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-neutral-bg dark:bg-dark-bg p-4 border border-neutral-border dark:border-dark-border">
              <span className="text-body-sm font-medium text-neutral-text dark:text-dark-text">Taken as Prescribed</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, taken_as_prescribed: !formData.taken_as_prescribed })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.taken_as_prescribed ? 'bg-brand-500' : 'bg-neutral-border dark:bg-dark-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    formData.taken_as_prescribed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Side Effects (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {commonSideEffects.map((effect) => (
                  <button
                    key={effect}
                    type="button"
                    onClick={() => toggleSideEffect(effect)}
                    className={`rounded-xl border-2 p-3 text-body-sm font-medium transition-all ${
                      formData.side_effects.includes(effect)
                        ? effect === 'None'
                          ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                          : 'border-signal-500 bg-signal-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                        : 'border-neutral-border dark:border-dark-border text-neutral-text dark:text-dark-text hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    {effect}
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
                placeholder="Reason for taking, effectiveness, etc..."
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
            <EmptyState category="medication" icon={<Pill className="h-8 w-8 text-neutral-muted dark:text-dark-muted" />} />
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
                        {log.medication_name} &middot; {log.dosage}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(log as MedicationFormData & { id: string })}
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
                  <div className="mb-2 flex gap-4 text-xs">
                    <div>
                      <span className="text-neutral-muted dark:text-dark-muted">Type:</span>
                      <span className="ml-1 font-medium capitalize text-neutral-text dark:text-dark-text">{log.medication_type}</span>
                    </div>
                    <div>
                      <span className="text-neutral-muted dark:text-dark-muted">As Prescribed:</span>
                      <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">{log.taken_as_prescribed ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  {log.side_effects && log.side_effects.length > 0 && (
                    <div className="mb-2">
                      <div className="mb-1 text-xs text-neutral-muted dark:text-dark-muted">Side Effects:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {log.side_effects.map((effect: string, idx: number) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs border ${
                              effect === 'None'
                                ? 'bg-brand-500/10 border-brand-500/20 text-brand-500 dark:text-brand-300'
                                : 'bg-signal-500/10 border-signal-500/20 text-signal-500 dark:text-signal-300'
                            }`}
                          >
                            {effect}
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
