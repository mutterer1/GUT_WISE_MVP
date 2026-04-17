import { Save, Clock, Activity, Moon, Pencil } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
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

export default function SleepLog() {
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
    buildInsertPayload: (formData, userId) => ({
      user_id: userId,
      logged_at: formData.logged_at,
      sleep_start: formData.sleep_start,
      sleep_end: formData.sleep_end,
      quality: formData.quality,
      interruptions: formData.interruptions,
      felt_rested: formData.felt_rested,
      notes: formData.notes || null,
    }),
    buildUpdatePayload: (formData) => ({
      logged_at: formData.logged_at,
      sleep_start: formData.sleep_start,
      sleep_end: formData.sleep_end,
      quality: formData.quality,
      interruptions: formData.interruptions,
      felt_rested: formData.felt_rested,
      notes: formData.notes || null,
    }),
  });

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
    if (!formData.sleep_start || !formData.sleep_end) {
      return;
    }
    if (new Date(formData.sleep_end) <= new Date(formData.sleep_start)) {
      return;
    }
    await handleSubmit(e);
  };

  return (
    <LogPageShell
      title="Sleep Log"
      subtitle="Track sleep patterns, quality, and restfulness"
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

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="sleep_start" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                  <Moon className="mr-1 inline h-4 w-4" />
                  Bedtime
                </label>
                <input
                  type="datetime-local"
                  id="sleep_start"
                  value={formData.sleep_start}
                  onChange={(e) => setFormData({ ...formData, sleep_start: e.target.value })}
                  className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="sleep_end" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                  <Clock className="mr-1 inline h-4 w-4" />
                  Wake Time
                </label>
                <input
                  type="datetime-local"
                  id="sleep_end"
                  value={formData.sleep_end}
                  onChange={(e) => setFormData({ ...formData, sleep_end: e.target.value })}
                  className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="rounded-xl bg-brand-500/10 dark:bg-brand-500/10 border border-brand-500/20 p-4">
              <div className="text-body-sm font-medium text-brand-700 dark:text-brand-300">
                Total Sleep Duration: <span className="text-lg">{calculateDuration()}</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Sleep Quality: <span className="text-neutral-text dark:text-dark-text">{formData.quality}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: parseInt(e.target.value) })}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-brand-500"
              />
              <div className="mt-1 flex justify-between text-xs text-neutral-muted dark:text-dark-muted">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div>
              <label htmlFor="interruptions" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Number of Interruptions
              </label>
              <input
                type="number"
                id="interruptions"
                value={formData.interruptions}
                onChange={(e) => setFormData({ ...formData, interruptions: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                min="0"
                required
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-neutral-bg dark:bg-dark-bg p-4 border border-neutral-border dark:border-dark-border">
              <span className="text-body-sm font-medium text-neutral-text dark:text-dark-text">Felt Rested Upon Waking</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, felt_rested: !formData.felt_rested })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.felt_rested ? 'bg-brand-500' : 'bg-neutral-border dark:bg-dark-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    formData.felt_rested ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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
                placeholder="Dreams, sleep environment, disturbances..."
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
            <EmptyState category="sleep" icon={<Moon className="h-8 w-8 text-neutral-muted dark:text-dark-muted" />} />
          ) : (
            <div className="space-y-3">
              {history.map((log) => {
                const duration = log.duration_minutes
                  ? `${Math.floor(log.duration_minutes / 60)}h ${log.duration_minutes % 60}m`
                  : 'N/A';
                return (
                  <div
                    key={log.id}
                    className="rounded-xl border border-neutral-border dark:border-dark-border p-4 transition-colors hover:border-brand-300 dark:hover:border-brand-700"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="text-body-sm font-medium text-neutral-text dark:text-dark-text">
                          {formatDateTime(log.sleep_start)} &rarr; {formatDateTime(log.sleep_end)}
                        </div>
                        <div className="mt-0.5 text-xs text-neutral-muted dark:text-dark-muted">
                          Duration: {duration}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(log as SleepFormData & { id: string })}
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
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-neutral-muted dark:text-dark-muted">Quality:</span>
                        <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">{log.quality}/10</span>
                      </div>
                      <div>
                        <span className="text-neutral-muted dark:text-dark-muted">Interruptions:</span>
                        <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">{log.interruptions}</span>
                      </div>
                      <div>
                        <span className="text-neutral-muted dark:text-dark-muted">Rested:</span>
                        <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">{log.felt_rested ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    {log.notes && (
                      <div className="mt-3 rounded-lg bg-neutral-bg dark:bg-dark-bg px-3 py-2 text-body-sm text-neutral-muted dark:text-dark-muted">
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
