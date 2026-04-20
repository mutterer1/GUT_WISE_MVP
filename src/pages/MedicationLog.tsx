import { Activity, Clock, Pencil, Pill, Save } from 'lucide-react';
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
  'Drowsiness',
  'Nausea',
  'Dizziness',
  'Headache',
  'Dry Mouth',
  'Upset Stomach',
  'Fatigue',
  'None',
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
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      medication_name: data.medication_name,
      dosage: data.dosage,
      medication_type: data.medication_type,
      taken_as_prescribed: data.taken_as_prescribed,
      side_effects: data.side_effects,
      notes: data.notes,
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      medication_name: data.medication_name,
      dosage: data.dosage,
      medication_type: data.medication_type,
      taken_as_prescribed: data.taken_as_prescribed,
      side_effects: data.side_effects,
      notes: data.notes,
    }),
  });

  const toggleSideEffect = (effect: string) => {
    if (effect === 'None') {
      setFormData({ ...formData, side_effects: ['None'] });
      return;
    }

    const filtered = formData.side_effects.filter((item) => item !== 'None');

    setFormData({
      ...formData,
      side_effects: filtered.includes(effect)
        ? filtered.filter((item) => item !== effect)
        : [...filtered, effect],
    });
  };

  return (
    <LogPageShell
      title="Medication Log"
      subtitle="Track adherence, dosage, and side effects so medication context stays visible inside your daily pattern read."
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
          {editingId && (
            <div className="mb-6 flex items-center justify-between gap-4 rounded-[24px] border border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)] px-4 py-3.5">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-accent-primary)]">
                <Pencil className="h-4 w-4" />
                <span>Editing entry</span>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-[var(--color-text-tertiary)] transition-smooth hover:text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="surface-panel-quiet rounded-[24px] p-4 sm:p-5">
                <label htmlFor="logged_at" className="field-label mb-2 block">
                  <Clock className="mr-1 inline h-4 w-4" />
                  Time Taken
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
                  Anchor the dose to the correct time so adherence and side effects stay readable.
                </p>
              </div>

              <div className="surface-intelligence rounded-[24px] p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                  Medication snapshot
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                  {formData.medication_name || 'Medication name'}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {formData.dosage || 'Dosage pending'} ·{' '}
                  {formData.taken_as_prescribed ? 'taken as prescribed' : 'taken off plan'}
                </p>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <label htmlFor="medication_name" className="field-label mb-2 block">
                <Pill className="mr-1 inline h-4 w-4" />
                Medication Name
              </label>
              <input
                type="text"
                id="medication_name"
                value={formData.medication_name}
                onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                placeholder="e.g. Ibuprofen, Vitamin D..."
                className="input-base w-full"
                required
              />
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <label htmlFor="dosage" className="field-label mb-2 block">
                Dosage
              </label>
              <input
                type="text"
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g. 200mg, 1 tablet, 5ml..."
                className="input-base w-full"
                required
              />
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-4">
                <label className="field-label">Medication Type</label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['prescription', 'otc', 'supplement'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, medication_type: type })}
                    className={[
                      'rounded-[22px] border p-4 transition-smooth',
                      formData.medication_type === type
                        ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)]'
                        : 'border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">
                      {type === 'otc'
                        ? 'Over-the-Counter'
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-panel-quiet flex items-center justify-between rounded-[24px] p-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  Taken as Prescribed
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                  Mark whether the dose matched the intended plan.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, taken_as_prescribed: !formData.taken_as_prescribed })
                }
                className={[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-smooth',
                  formData.taken_as_prescribed ? 'bg-[var(--color-accent-primary)]' : 'bg-white/12',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                    formData.taken_as_prescribed ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                />
              </button>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-4">
                <label className="field-label">Side Effects</label>
                <p className="field-help mt-1">(optional)</p>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {commonSideEffects.map((effect) => (
                  <button
                    key={effect}
                    type="button"
                    onClick={() => toggleSideEffect(effect)}
                    className={[
                      'rounded-[20px] border px-3 py-3 text-sm font-medium transition-smooth',
                      formData.side_effects.includes(effect)
                        ? effect === 'None'
                          ? 'border-[rgba(84,160,255,0.28)] bg-[rgba(84,160,255,0.10)] text-[var(--color-text-primary)]'
                          : 'border-[rgba(255,120,120,0.28)] bg-[rgba(255,120,120,0.10)] text-[var(--color-text-primary)]'
                        : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    {effect}
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
                placeholder="Reason for taking, effectiveness, etc..."
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button type="submit" disabled={saving} size="lg">
                <Save className="mr-2 inline h-4 w-4" />
                {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
              </Button>
              {editingId && (
                <Button type="button" variant="secondary" size="lg" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
      ) : (
        <Card variant="elevated" className="rounded-[28px]">
          {history.length === 0 ? (
            <EmptyState
              category="medication"
              icon={<Pill className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
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
                        {log.medication_name} · {log.dosage}
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => handleEdit(log as MedicationFormData & { id: string })}
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

                  <div className="mb-4 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 font-medium capitalize text-[var(--color-text-secondary)]">
                      {log.medication_type}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 font-medium text-[var(--color-text-secondary)]">
                      {log.taken_as_prescribed ? 'Taken as prescribed' : 'Off plan'}
                    </span>
                  </div>

                  {log.side_effects && log.side_effects.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                        Side Effects
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {log.side_effects.map((effect: string, idx: number) => (
                          <span
                            key={idx}
                            className={[
                              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border',
                              effect === 'None'
                                ? 'border-[rgba(84,160,255,0.22)] bg-[rgba(84,160,255,0.10)] text-[var(--color-accent-primary)]'
                                : 'border-[rgba(255,120,120,0.22)] bg-[rgba(255,120,120,0.10)] text-[var(--color-danger)]',
                            ].join(' ')}
                          >
                            {effect}
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
