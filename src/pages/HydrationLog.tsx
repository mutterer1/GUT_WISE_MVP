import { Save, Clock, Activity, Droplet, Pencil } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { formatDateTime } from '../utils/dateFormatters';

interface HydrationFormData {
  logged_at: string;
  beverage_type: string;
  amount_ml: number;
  caffeine_content: boolean;
  notes: string;
}

const beverageTypes = [
  { label: 'Water', value: 'Water', ml: 250 },
  { label: 'Coffee', value: 'Coffee', ml: 240 },
  { label: 'Tea', value: 'Tea', ml: 240 },
  { label: 'Juice', value: 'Juice', ml: 200 },
  { label: 'Soda', value: 'Soda', ml: 330 },
  { label: 'Sports Drink', value: 'Sports Drink', ml: 500 },
  { label: 'Milk', value: 'Milk', ml: 250 },
  { label: 'Other', value: 'Other', ml: 250 },
];

const quickAmounts = [250, 350, 500, 750, 1000];

export default function HydrationLog() {
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
  } = useLogCrud<HydrationFormData>({
    table: 'hydration_logs' as const,
    logType: 'hydration' as const,
    defaultValues: {
      beverage_type: 'Water' as const,
      amount_ml: 250,
      caffeine_content: false,
      notes: '' as const,
    },
    buildInsertPayload: (formData, userId) => ({
      user_id: userId,
      logged_at: formData.logged_at,
      beverage_type: formData.beverage_type,
      amount_ml: formData.amount_ml,
      caffeine_content: formData.caffeine_content,
      notes: formData.notes,
    }),
    buildUpdatePayload: (formData) => ({
      logged_at: formData.logged_at,
      beverage_type: formData.beverage_type,
      amount_ml: formData.amount_ml,
      caffeine_content: formData.caffeine_content,
      notes: formData.notes,
    }),
  });

  const handleBeverageTypeChange = (type: string) => {
    const beverage = beverageTypes.find((b) => b.value === type);
    const hasCaffeine = type === 'Coffee' || type === 'Tea' || type === 'Soda';
    setFormData({
      ...formData,
      beverage_type: type,
      amount_ml: beverage?.ml || 250,
      caffeine_content: hasCaffeine,
    });
  };

  return (
    <LogPageShell
      title="Hydration Log"
      subtitle="Track fluid intake and beverage types"
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
                onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                <Droplet className="mr-1 inline h-4 w-4" />
                Beverage Type
              </label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {beverageTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleBeverageTypeChange(type.value)}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      formData.beverage_type === type.value
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 shadow-sm'
                        : 'border-neutral-border dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    <Droplet className={`mx-auto mb-2 h-5 w-5 ${formData.beverage_type === type.value ? 'text-brand-500' : 'text-neutral-muted dark:text-dark-muted'}`} />
                    <div className="text-body-sm font-medium text-neutral-text dark:text-dark-text">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Quick Amount (ml)
              </label>
              <div className="mb-3 grid grid-cols-5 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount_ml: amount })}
                    className={`rounded-xl border-2 p-3 transition-all ${
                      formData.amount_ml === amount
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 shadow-sm'
                        : 'border-neutral-border dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    <div className="text-body-sm font-medium text-neutral-text dark:text-dark-text">{amount}</div>
                  </button>
                ))}
              </div>
              <label htmlFor="amount_ml" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Or Enter Custom Amount (ml)
              </label>
              <input
                type="number"
                id="amount_ml"
                value={formData.amount_ml}
                onChange={(e) => setFormData({ ...formData, amount_ml: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                min="1"
                required
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-neutral-bg dark:bg-dark-bg p-4 border border-neutral-border dark:border-dark-border">
              <span className="text-body-sm font-medium text-neutral-text dark:text-dark-text">Contains Caffeine</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, caffeine_content: !formData.caffeine_content })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.caffeine_content ? 'bg-orange-500' : 'bg-neutral-border dark:bg-dark-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    formData.caffeine_content ? 'translate-x-6' : 'translate-x-1'
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
                placeholder="Additional details..."
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
            <EmptyState category="hydration" icon={<Droplet className="h-8 w-8 text-neutral-muted dark:text-dark-muted" />} />
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
                        {log.beverage_type} &middot; {log.amount_ml}ml
                        {log.caffeine_content && ' \u00b7 Contains Caffeine'}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(log as HydrationFormData & { id: string })}
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
