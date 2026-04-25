import { useEffect, useState } from 'react';
import { Activity, Clock, Pill } from 'lucide-react';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogEditingBanner from '../components/LogEditingBanner';
import LogFormActions from '../components/LogFormActions';
import LogPageShell from '../components/LogPageShell';
import LogRecallPanel from '../components/LogRecallPanel';
import LogModeTabs from '../components/LogModeTabs';
import LogOptionalSection from '../components/LogOptionalSection';
import MedicationAutocompleteInput from '../components/MedicationAutocompleteInput';
import { useLogCrud } from '../hooks/useLogCrud';
import { syncMedicationNormalizationForLog } from '../services/medicationNormalizationService';
import { type MedicationReferenceSuggestion } from '../services/referenceSearchService';
import { formatDateTime } from '../utils/dateFormatters';
import type { MedicationRegimenStatus } from '../types/intelligence';

interface MedicationFormData {
  logged_at: string;
  medication_name: string;
  dosage: string;
  medication_type: 'prescription' | 'otc' | 'supplement';
  route: string;
  reason_for_use: string;
  regimen_status: MedicationRegimenStatus;
  timing_context: string;
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

const routeOptions = ['oral', 'topical', 'nasal', 'inhaled', 'injection', 'rectal'] as const;

const regimenOptions: Array<{ value: MedicationRegimenStatus; label: string }> = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'as_needed', label: 'As Needed' },
  { value: 'one_time', label: 'One-Time' },
  { value: 'unknown', label: 'Unknown' },
];

const timingOptions = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'bedtime', label: 'Bedtime' },
  { value: 'before_meal', label: 'Before Meal' },
  { value: 'with_food', label: 'With Food' },
  { value: 'after_meal', label: 'After Meal' },
] as const;

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formatSnakeCase(value: string): string {
  return value.replace(/_/g, ' ');
}

function coerceMedicationType(
  value: MedicationReferenceSuggestion['medicationType']
): MedicationFormData['medication_type'] | null {
  if (value === 'prescription' || value === 'otc' || value === 'supplement') {
    return value;
  }
  return null;
}

function hasMeaningfulMedicationDraft(formData: MedicationFormData): boolean {
  return (
    formData.medication_name.trim().length > 0 ||
    formData.dosage.trim().length > 0 ||
    formData.medication_type !== 'prescription' ||
    formData.route.trim().length > 0 ||
    formData.reason_for_use.trim().length > 0 ||
    formData.regimen_status !== 'unknown' ||
    formData.timing_context.trim().length > 0 ||
    !formData.taken_as_prescribed ||
    formData.side_effects.length > 0 ||
    formData.notes.trim().length > 0
  );
}

function hasMedicationContextDetails(formData: MedicationFormData): boolean {
  return (
    formData.route.trim().length > 0 ||
    formData.reason_for_use.trim().length > 0 ||
    formData.regimen_status !== 'unknown' ||
    formData.timing_context.trim().length > 0 ||
    !formData.taken_as_prescribed
  );
}

function hasMedicationResponseDetails(formData: MedicationFormData): boolean {
  return formData.side_effects.length > 0 || formData.notes.trim().length > 0;
}

export default function MedicationLog() {
  const [showContextDetails, setShowContextDetails] = useState(false);
  const [showResponseDetails, setShowResponseDetails] = useState(false);

  const {
    formData,
    setFormData,
    history,
    showHistory,
    setShowHistory,
    editingId,
    saving,
    recentEntries,
    applyRecent,
    hasStoredDraft,
    draftUpdatedAt,
    discardStoredDraft,
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
      route: '' as const,
      reason_for_use: '' as const,
      regimen_status: 'unknown' as const,
      timing_context: '' as const,
      taken_as_prescribed: true,
      side_effects: [] as string[],
      notes: '' as const,
    },
    hasMeaningfulDraft: hasMeaningfulMedicationDraft,
    mapHistoryToForm: (log) => ({
      logged_at: log.logged_at,
      medication_name: log.medication_name ?? '',
      dosage: log.dosage ?? '',
      medication_type: log.medication_type ?? 'prescription',
      route: log.route ?? '',
      reason_for_use: log.reason_for_use ?? '',
      regimen_status: log.regimen_status ?? 'unknown',
      timing_context: log.timing_context ?? '',
      taken_as_prescribed: log.taken_as_prescribed ?? true,
      side_effects: log.side_effects ?? [],
      notes: log.notes ?? '',
    }),
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      medication_name: data.medication_name,
      dosage: data.dosage,
      medication_type: data.medication_type,
      route: normalizeOptionalText(data.route),
      reason_for_use: normalizeOptionalText(data.reason_for_use),
      regimen_status: data.regimen_status,
      timing_context: normalizeOptionalText(data.timing_context),
      taken_as_prescribed: data.taken_as_prescribed,
      side_effects: data.side_effects,
      notes: normalizeOptionalText(data.notes),
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      medication_name: data.medication_name,
      dosage: data.dosage,
      medication_type: data.medication_type,
      route: normalizeOptionalText(data.route),
      reason_for_use: normalizeOptionalText(data.reason_for_use),
      regimen_status: data.regimen_status,
      timing_context: normalizeOptionalText(data.timing_context),
      taken_as_prescribed: data.taken_as_prescribed,
      side_effects: data.side_effects,
      notes: normalizeOptionalText(data.notes),
    }),
    onAfterCreate: async ({ entryId, userId, formData: savedFormData }) => {
      await syncMedicationNormalizationForLog({
        medicationLogId: entryId,
        userId,
        formData: savedFormData,
      });
    },
    onAfterUpdate: async ({ entryId, userId, formData: savedFormData }) => {
      await syncMedicationNormalizationForLog({
        medicationLogId: entryId,
        userId,
        formData: savedFormData,
      });
    },
  });

  useEffect(() => {
    if (hasMedicationContextDetails(formData)) {
      setShowContextDetails(true);
    } else if (!editingId) {
      setShowContextDetails(false);
    }
  }, [editingId, formData]);

  useEffect(() => {
    if (hasMedicationResponseDetails(formData)) {
      setShowResponseDetails(true);
    } else if (!editingId) {
      setShowResponseDetails(false);
    }
  }, [editingId, formData]);

  const selectMedicationSuggestion = (suggestion: MedicationReferenceSuggestion) => {
    setFormData({
      ...formData,
      medication_name: suggestion.name,
      medication_type: coerceMedicationType(suggestion.medicationType) ?? formData.medication_type,
      route: suggestion.route ?? formData.route,
    });
  };

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

  const handleUseRecent = (recentId: string) => {
    const entry = recentEntries.find((item) => item.id === recentId);
    if (!entry) {
      return;
    }

    applyRecent(entry);
    setShowContextDetails(hasMedicationContextDetails(entry.data));
    setShowResponseDetails(hasMedicationResponseDetails(entry.data));
  };

  const recentRecallItems = recentEntries.slice(0, 3).map((entry) => ({
    id: entry.id,
    title: `${entry.data.medication_name || 'Medication'}${
      entry.data.dosage ? ` | ${entry.data.dosage}` : ''
    }`,
    subtitle: `${entry.data.medication_type}${
      entry.data.regimen_status !== 'unknown'
        ? ` | ${formatSnakeCase(entry.data.regimen_status)}`
        : ''
    }${entry.data.route ? ` | ${entry.data.route}` : ''}`,
  }));

  return (
    <LogPageShell
      title="Medication Log"
      subtitle="Track adherence, dosage, route, and context so medication patterns are usable inside your insight layer."
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
          <LogEditingBanner
            isEditing={Boolean(editingId)}
            onCancel={() => {
              resetForm();
              setShowContextDetails(false);
              setShowResponseDetails(false);
            }}
          />

          {!editingId ? (
            <div className="mb-6">
              <LogRecallPanel
                hasStoredDraft={hasStoredDraft}
                draftUpdatedAt={draftUpdatedAt}
                draftLabel="Medication draft restored from this device."
                recentItems={recentRecallItems}
                onDiscardDraft={discardStoredDraft}
                onUseRecent={handleUseRecent}
              />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
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
                  {formData.dosage || 'Dosage pending'} |{' '}
                  {formData.regimen_status === 'unknown'
                    ? 'regimen not set'
                    : formatSnakeCase(formData.regimen_status)}{' '}
                  | {formData.taken_as_prescribed ? 'taken as prescribed' : 'taken off plan'}
                </p>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
              <label htmlFor="medication_name" className="field-label mb-2 block">
                <Pill className="mr-1 inline h-4 w-4" />
                Medication Name
              </label>
              <MedicationAutocompleteInput
                id="medication_name"
                value={formData.medication_name}
                onChange={(value) => setFormData({ ...formData, medication_name: value })}
                onSelect={selectMedicationSuggestion}
              />
              <p className="field-help mt-2">
                Search the live medication reference table first, then leave a custom name if the
                exact product is not there yet. Custom medications that miss the current reference
                table will be queued for review in Settings.
              </p>
            </div>

            <div className="surface-panel-soft rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
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

            <div className="surface-panel-soft rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
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

            <LogOptionalSection
              title="Context details"
              isOpen={showContextDetails}
              onToggle={() => setShowContextDetails(!showContextDetails)}
              summary="Route, regimen, timing, and adherence help when medication effects need more precision."
            >
              <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                <div className="surface-panel-soft rounded-[24px] p-4">
                  <div className="mb-4">
                    <label className="field-label">Route</label>
                    <p className="field-help mt-1">
                      Leave this blank if you want GutWise to fall back to a known route from the
                      medication reference table.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {routeOptions.map((route) => (
                      <button
                        key={route}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            route: formData.route === route ? '' : route,
                          })
                        }
                        className={[
                          'rounded-[18px] border px-3 py-3 text-sm font-medium transition-smooth',
                          formData.route === route
                            ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)] text-[var(--color-text-primary)]'
                            : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                        ].join(' ')}
                      >
                        {route.charAt(0).toUpperCase() + route.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="surface-panel-soft rounded-[24px] p-4">
                  <div className="mb-4">
                    <label className="field-label">Regimen Status</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {regimenOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            regimen_status: option.value,
                          })
                        }
                        className={[
                          'rounded-[18px] border px-3 py-3 text-sm font-medium transition-smooth',
                          formData.regimen_status === option.value
                            ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)] text-[var(--color-text-primary)]'
                            : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                        ].join(' ')}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                <div className="surface-panel-soft rounded-[24px] p-4">
                  <label htmlFor="reason_for_use" className="field-label mb-2 block">
                    Reason for Use
                    <span className="ml-2 text-[var(--color-text-tertiary)]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="reason_for_use"
                    value={formData.reason_for_use}
                    onChange={(e) =>
                      setFormData({ ...formData, reason_for_use: e.target.value })
                    }
                    placeholder="e.g. reflux flare, maintenance, headache"
                    className="input-base w-full"
                  />
                </div>

                <div className="surface-panel-soft rounded-[24px] p-4">
                  <div className="mb-4">
                    <label className="field-label">Timing Context</label>
                    <p className="field-help mt-1">
                      Capture when the dose happened relative to the day or meals.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {timingOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            timing_context:
                              formData.timing_context === option.value ? '' : option.value,
                          })
                        }
                        className={[
                          'rounded-[18px] border px-3 py-3 text-sm font-medium transition-smooth',
                          formData.timing_context === option.value
                            ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)] text-[var(--color-text-primary)]'
                            : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                        ].join(' ')}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
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
            </LogOptionalSection>

            <LogOptionalSection
              title="Response and notes"
              isOpen={showResponseDetails}
              onToggle={() => setShowResponseDetails(!showResponseDetails)}
              summary="Side effects and notes stay available without forcing extra scrolling on every medication entry."
            >
              <div className="surface-panel-soft rounded-[24px] p-4">
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
                        'rounded-[18px] border px-3 py-3 text-sm font-medium transition-smooth',
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

              <div className="surface-panel-soft rounded-[24px] p-4">
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
                  placeholder="Effectiveness, side effects, or context not captured above..."
                />
              </div>
            </LogOptionalSection>

            <LogFormActions isEditing={Boolean(editingId)} saving={saving} onCancel={resetForm} />
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
                        {log.medication_name} | {log.dosage}
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
                    {log.regimen_status && (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 font-medium capitalize text-[var(--color-text-secondary)]">
                        {formatSnakeCase(log.regimen_status)}
                      </span>
                    )}
                    {log.route && (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 font-medium capitalize text-[var(--color-text-secondary)]">
                        {log.route}
                      </span>
                    )}
                    {log.timing_context && (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 font-medium capitalize text-[var(--color-text-secondary)]">
                        {formatSnakeCase(log.timing_context)}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 font-medium text-[var(--color-text-secondary)]">
                      {log.taken_as_prescribed ? 'Taken as prescribed' : 'Off plan'}
                    </span>
                  </div>

                  {log.reason_for_use && (
                    <div className="mb-4 rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                      <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                        Reason
                      </span>
                      {log.reason_for_use}
                    </div>
                  )}

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
                              'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
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
