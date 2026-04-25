import { useEffect, useState } from 'react';
import { Activity, Clock, Moon } from 'lucide-react';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogEditingBanner from '../components/LogEditingBanner';
import LogFormActions from '../components/LogFormActions';
import LogOptionalSection from '../components/LogOptionalSection';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { formatDateTime } from '../utils/dateFormatters';

interface SleepFormData {
  logged_at: string;
  sleep_start: string;
  sleep_end: string;
  quality: number;
  interruptions: number;
  felt_rested: boolean;
  notes: string;
  duration_minutes?: number;
}

function hasSleepDetailContext(formData: SleepFormData): boolean {
  return formData.interruptions > 0 || formData.felt_rested || formData.notes.trim().length > 0;
}

export default function SleepLog() {
  const [showRecoveryDetails, setShowRecoveryDetails] = useState(false);
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
  } = useLogCrud<SleepFormData>({
    table: 'sleep_logs' as const,
    logType: 'sleep' as const,
    defaultValues: {
      sleep_start: '' as const,
      sleep_end: '' as const,
      quality: 5,
      interruptions: 0,
      felt_rested: false,
      notes: '' as const,
    },
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      sleep_start: data.sleep_start,
      sleep_end: data.sleep_end,
      quality: data.quality,
      interruptions: data.interruptions,
      felt_rested: data.felt_rested,
      notes: data.notes || null,
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      sleep_start: data.sleep_start,
      sleep_end: data.sleep_end,
      quality: data.quality,
      interruptions: data.interruptions,
      felt_rested: data.felt_rested,
      notes: data.notes || null,
    }),
  });

  useEffect(() => {
    if (hasSleepDetailContext(formData)) {
      setShowRecoveryDetails(true);
    } else if (!editingId) {
      setShowRecoveryDetails(false);
    }
  }, [editingId, formData]);

  const calculateDuration = () => {
    if (formData.sleep_start && formData.sleep_end) {
      const start = new Date(formData.sleep_start);
      const end = new Date(formData.sleep_end);
      const diff = end.getTime() - start.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }

    return '0h 0m';
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sleep_start || !formData.sleep_end) return;
    if (new Date(formData.sleep_end) <= new Date(formData.sleep_start)) return;

    await handleSubmit(e);
  };

  return (
    <LogPageShell
      title="Sleep Log"
      subtitle="Capture bedtime, wake time, and recovery quality so sleep can be read alongside gut symptoms and daily context."
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
              setShowRecoveryDetails(false);
            }}
          />

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="surface-panel-quiet rounded-[24px] p-4 sm:p-5">
                <label htmlFor="sleep_start" className="field-label mb-2 block">
                  <Moon className="mr-1 inline h-4 w-4" />
                  Bedtime
                </label>
                <input
                  type="datetime-local"
                  id="sleep_start"
                  value={formData.sleep_start}
                  onChange={(e) => setFormData({ ...formData, sleep_start: e.target.value })}
                  className="input-base w-full"
                  required
                />
              </div>

              <div className="surface-panel-quiet rounded-[24px] p-4 sm:p-5">
                <label htmlFor="sleep_end" className="field-label mb-2 block">
                  <Clock className="mr-1 inline h-4 w-4" />
                  Wake Time
                </label>
                <input
                  type="datetime-local"
                  id="sleep_end"
                  value={formData.sleep_end}
                  onChange={(e) => setFormData({ ...formData, sleep_end: e.target.value })}
                  className="input-base w-full"
                  required
                />
              </div>
            </div>

            <div className="surface-intelligence rounded-[28px] p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                Sleep duration
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                {calculateDuration()}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                The recovery window matters as much as sleep quality when you compare symptoms,
                hydration, and stress.
              </p>
            </div>

            <div className="surface-panel-soft rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
              <label className="field-label mb-2 block">
                Sleep Quality:{' '}
                <span className="font-medium text-[var(--color-text-primary)]">
                  {formData.quality}/10
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.quality}
                onChange={(e) =>
                  setFormData({ ...formData, quality: parseInt(e.target.value, 10) })
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--color-accent-primary)]"
              />
              <div className="mt-2 flex justify-between text-xs text-[var(--color-text-tertiary)]">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <LogOptionalSection
              title="Recovery details"
              isOpen={showRecoveryDetails}
              onToggle={() => setShowRecoveryDetails(!showRecoveryDetails)}
              summary="Interruptions, felt-rested, and notes stay available when the entry needs more than the core sleep window."
            >
              <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                <div className="surface-panel-soft rounded-[24px] p-4">
                  <label htmlFor="interruptions" className="field-label mb-2 block">
                    Number of Interruptions
                  </label>
                  <input
                    type="number"
                    id="interruptions"
                    value={formData.interruptions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interruptions: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="input-base w-full"
                    min="0"
                    required
                  />
                </div>

                <div className="surface-panel-quiet flex items-center justify-between rounded-[24px] p-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      Felt Rested Upon Waking
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                      Use your subjective recovery read, not just hours slept.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, felt_rested: !formData.felt_rested })
                    }
                    className={[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-smooth',
                      formData.felt_rested ? 'bg-[var(--color-accent-primary)]' : 'bg-white/12',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                        formData.felt_rested ? 'translate-x-6' : 'translate-x-1',
                      ].join(' ')}
                    />
                  </button>
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
                  placeholder="Dreams, sleep environment, disturbances..."
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
              category="sleep"
              icon={<Moon className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
            />
          ) : (
            <div className="space-y-4">
              {history.map((log) => {
                const duration = log.duration_minutes
                  ? `${Math.floor(log.duration_minutes / 60)}h ${log.duration_minutes % 60}m`
                  : 'N/A';

                return (
                  <div
                    key={log.id}
                    className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 transition-smooth hover:border-white/14 hover:bg-white/[0.04] sm:p-5"
                  >
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-medium text-[var(--color-text-primary)]">
                          {formatDateTime(log.sleep_start)} → {formatDateTime(log.sleep_end)}
                        </div>
                        <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                          Duration: {duration}
                        </div>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => handleEdit(log as SleepFormData & { id: string })}
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

                    <div className="grid gap-3 sm:grid-cols-3">
                      <MetricChip label="Quality" value={`${log.quality}/10`} />
                      <MetricChip label="Interruptions" value={`${log.interruptions}`} />
                      <MetricChip label="Rested" value={log.felt_rested ? 'Yes' : 'No'} />
                    </div>

                    {log.notes && (
                      <div className="mt-4 rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                        {log.notes}
                      </div>
                    )}
                  </div>
                );
              })}
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
