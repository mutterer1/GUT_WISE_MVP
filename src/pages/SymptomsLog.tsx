import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogEditingBanner from '../components/LogEditingBanner';
import LogFormActions from '../components/LogFormActions';
import LogPageShell from '../components/LogPageShell';
import LogRecallPanel from '../components/LogRecallPanel';
import LogModeTabs from '../components/LogModeTabs';
import LogOptionalSection from '../components/LogOptionalSection';
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

function hasMeaningfulSymptomsDraft(formData: SymptomsFormData): boolean {
  return (
    formData.symptom_type.trim().length > 0 ||
    formData.severity !== 5 ||
    formData.duration_minutes !== 30 ||
    formData.location.trim().length > 0 ||
    formData.triggers.length > 0 ||
    formData.notes.trim().length > 0
  );
}

function hasSymptomContextDetails(formData: SymptomsFormData): boolean {
  return (
    formData.location.trim().length > 0 ||
    formData.triggers.length > 0 ||
    formData.notes.trim().length > 0
  );
}

export default function SymptomsLog() {
  const [customSymptom, setCustomSymptom] = useState('');
  const [showContextDetails, setShowContextDetails] = useState(false);

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
    hasMeaningfulDraft: hasMeaningfulSymptomsDraft,
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      symptom_type: data.symptom_type,
      severity: data.severity,
      duration_minutes: data.duration_minutes,
      location: data.location,
      triggers: data.triggers,
      notes: data.notes,
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      symptom_type: data.symptom_type,
      severity: data.severity,
      duration_minutes: data.duration_minutes,
      location: data.location,
      triggers: data.triggers,
      notes: data.notes,
    }),
  });

  useEffect(() => {
    if (hasSymptomContextDetails(formData)) {
      setShowContextDetails(true);
    } else if (!editingId) {
      setShowContextDetails(false);
    }
  }, [editingId, formData]);

  const resetForm = () => {
    baseResetForm();
    setCustomSymptom('');
  };

  const toggleTrigger = (trigger: string) => {
    setFormData({
      ...formData,
      triggers: formData.triggers.includes(trigger)
        ? formData.triggers.filter((item) => item !== trigger)
        : [...formData.triggers, trigger],
    });
  };

  const handleUseRecent = (recentId: string) => {
    const entry = recentEntries.find((item) => item.id === recentId);
    if (!entry) {
      return;
    }

    applyRecent(entry);
    setCustomSymptom('');
    setShowContextDetails(hasSymptomContextDetails(entry.data));
  };

  const recentRecallItems = recentEntries.slice(0, 3).map((entry) => ({
    id: entry.id,
    title: entry.data.symptom_type || 'Symptom entry',
    subtitle: `Severity ${entry.data.severity}/10 | ${entry.data.duration_minutes} min${
      entry.data.location ? ` | ${entry.data.location}` : ''
    }`,
  }));

  return (
    <LogPageShell
      title="Symptoms Log"
      subtitle="Capture the symptom, grade the intensity, and add likely context only when it helps interpret the event."
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
            }}
          />

          {!editingId ? (
            <div className="mb-6">
              <LogRecallPanel
                hasStoredDraft={hasStoredDraft}
                draftUpdatedAt={draftUpdatedAt}
                draftLabel="Symptom draft restored from this device."
                recentItems={recentRecallItems}
                onDiscardDraft={() => {
                  discardStoredDraft();
                  setCustomSymptom('');
                }}
                onUseRecent={handleUseRecent}
              />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
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
                  Start with when the symptom happened. The rest refines the read.
                </p>
              </div>

              <div className="surface-intelligence rounded-[24px] p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                  Symptom posture
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                  {formData.symptom_type || 'Select a symptom'}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Capture the primary signal first, then add severity, duration, and possible
                  triggers to sharpen the pattern.
                </p>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
              <div className="mb-4">
                <label className="field-label">Symptom Type</label>
                <p className="field-help mt-1">Choose the closest match or set a custom symptom.</p>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => setFormData({ ...formData, symptom_type: symptom })}
                    className={[
                      'rounded-[20px] border px-3 py-3 text-sm font-medium transition-smooth',
                      formData.symptom_type === symptom
                        ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)] text-[var(--color-text-primary)]'
                        : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    {symptom}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder="Or enter a custom symptom..."
                  className="input-base flex-1"
                />

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (!customSymptom.trim()) return;
                    setFormData({ ...formData, symptom_type: customSymptom.trim() });
                    setCustomSymptom('');
                  }}
                >
                  Set
                </Button>
              </div>

              {formData.symptom_type && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-primary)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Selected: {formData.symptom_type}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="surface-panel-soft rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
                <label className="field-label mb-2 block">
                  Severity:{' '}
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {formData.severity}/10
                  </span>
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
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--color-danger)]"
                />

                <div className="mt-2 flex justify-between text-xs text-[var(--color-text-tertiary)]">
                  <span>Mild</span>
                  <span>Severe</span>
                </div>
              </div>

              <div className="surface-panel-quiet rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
                <label htmlFor="duration" className="field-label mb-2 block">
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
                  className="input-base w-full"
                  min="1"
                  required
                />
              </div>
            </div>

            <LogOptionalSection
              title="Symptom context"
              isOpen={showContextDetails}
              onToggle={() => setShowContextDetails(!showContextDetails)}
              summary="Location, likely triggers, and notes stay available without lengthening every symptom entry."
            >
              <div className="surface-panel-soft rounded-[24px] p-4">
                <label htmlFor="location" className="field-label mb-2 block">
                  <MapPin className="mr-1 inline h-4 w-4" />
                  Location
                  <span className="ml-2 text-[var(--color-text-tertiary)]">(optional)</span>
                </label>

                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Lower abdomen, head, left side..."
                  className="input-base w-full"
                />
              </div>

              <div className="surface-panel-soft rounded-[24px] p-4">
                <div className="mb-4">
                  <label className="field-label">Potential Triggers</label>
                  <p className="field-help mt-1">
                    Tag likely context without overfitting. Use only what seems relevant.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {commonTriggers.map((trigger) => (
                    <button
                      key={trigger}
                      type="button"
                      onClick={() => toggleTrigger(trigger)}
                      className={[
                        'rounded-[18px] border px-3 py-3 text-sm font-medium transition-smooth',
                        formData.triggers.includes(trigger)
                          ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)] text-[var(--color-text-primary)]'
                          : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                      ].join(' ')}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
              </div>

              <div className="surface-panel-soft rounded-[24px] p-4">
                <label htmlFor="notes" className="field-label mb-2 block">
                  Notes
                </label>

                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Additional observations..."
                  className="input-base min-h-[112px] w-full resize-none"
                />
              </div>
            </LogOptionalSection>

            <LogFormActions
              isEditing={Boolean(editingId)}
              saving={saving}
              submitDisabled={!formData.symptom_type}
              onCancel={resetForm}
            />
          </form>
        </Card>
      ) : (
        <Card variant="elevated" className="rounded-[28px]">
          {history.length === 0 ? (
            <EmptyState
              category="symptoms"
              icon={<AlertCircle className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
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
                        {log.symptom_type}
                      </div>
                    </div>

                    <div className="flex gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => handleEdit(log as SymptomsFormData & { id: string })}
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

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricChip label="Severity" value={`${log.severity}/10`} />
                    <MetricChip label="Duration" value={`${log.duration_minutes} min`} />
                  </div>

                  {log.location && (
                    <div className="mt-4 rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                      <span className="font-medium text-[var(--color-text-primary)]">Location:</span>{' '}
                      {log.location}
                    </div>
                  )}

                  {log.triggers?.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                        Triggers
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {log.triggers.map((trigger, idx) => (
                          <span
                            key={`${trigger}-${idx}`}
                            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]"
                          >
                            <AlertCircle className="mr-1 h-3 w-3 text-[var(--color-accent-primary)]" />
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.notes && (
                    <div className="mt-4 rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
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

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
      <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <div className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">{value}</div>
    </div>
  );
}
