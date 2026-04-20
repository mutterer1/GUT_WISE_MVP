import { useState } from 'react';
import { Activity, Clock, Droplet, Pencil, Save } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { formatDateTime } from '../utils/dateFormatters';
import {
  type HydrationUnit,
  mlToOz,
  ozToMl,
  formatHydrationAmount,
  getUnitLabel,
  getStoredHydrationUnit,
  setStoredHydrationUnit,
  QUICK_AMOUNTS_ML,
  QUICK_AMOUNTS_OZ,
} from '../utils/hydrationUnits';

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

export default function HydrationLog() {
  const [unit, setUnit] = useState<HydrationUnit>(getStoredHydrationUnit);

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
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      beverage_type: data.beverage_type,
      amount_ml: data.amount_ml,
      caffeine_content: data.caffeine_content,
      notes: data.notes,
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      beverage_type: data.beverage_type,
      amount_ml: data.amount_ml,
      caffeine_content: data.caffeine_content,
      notes: data.notes,
    }),
  });

  const displayValue = unit === 'imperial' ? mlToOz(formData.amount_ml) : formData.amount_ml;
  const unitLabel = getUnitLabel(unit);
  const quickAmounts = unit === 'imperial' ? QUICK_AMOUNTS_OZ : QUICK_AMOUNTS_ML;

  const handleUnitToggle = (nextUnit: HydrationUnit) => {
    setUnit(nextUnit);
    setStoredHydrationUnit(nextUnit);
  };

  const handleBeverageTypeChange = (type: string) => {
    const beverage = beverageTypes.find((item) => item.value === type);
    const hasCaffeine = type === 'Coffee' || type === 'Tea' || type === 'Soda';

    setFormData({
      ...formData,
      beverage_type: type,
      amount_ml: beverage?.ml || 250,
      caffeine_content: hasCaffeine,
    });
  };

  const handleQuickAmount = (amount: number) => {
    const ml = unit === 'imperial' ? ozToMl(amount) : amount;
    setFormData({ ...formData, amount_ml: ml });
  };

  const handleCustomAmount = (raw: string) => {
    const parsed = parseFloat(raw) || 0;
    const ml = unit === 'imperial' ? ozToMl(parsed) : Math.round(parsed);
    setFormData({ ...formData, amount_ml: ml });
  };

  const isQuickSelected = (amount: number) => {
    const ml = unit === 'imperial' ? ozToMl(amount) : amount;
    return formData.amount_ml === ml;
  };

  return (
    <LogPageShell
      title="Hydration Log"
      subtitle="Track fluid intake with enough structure to connect hydration, caffeine, and symptom response."
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
                  Log when the drink happened so hydration timing stays useful for daily review.
                </p>
              </div>

              <div className="surface-intelligence rounded-[24px] p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                  Intake snapshot
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                  {formData.beverage_type}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {formatHydrationAmount(formData.amount_ml, unit)}
                  {formData.caffeine_content ? ' · contains caffeine' : ' · caffeine-free'}
                </p>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-4">
                <label className="field-label">
                  <Droplet className="mr-1 inline h-4 w-4" />
                  Beverage Type
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {beverageTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleBeverageTypeChange(type.value)}
                    className={[
                      'rounded-[22px] border p-4 transition-smooth',
                      formData.beverage_type === type.value
                        ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)]'
                        : 'border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    <Droplet
                      className={[
                        'mx-auto mb-2 h-5 w-5',
                        formData.beverage_type === type.value
                          ? 'text-[var(--color-accent-primary)]'
                          : 'text-[var(--color-text-tertiary)]',
                      ].join(' ')}
                    />
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <label className="field-label">Amount</label>

                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
                  {(['metric', 'imperial'] as HydrationUnit[]).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleUnitToggle(u)}
                      className={[
                        'rounded-full px-3 py-1 text-xs font-medium transition-smooth',
                        unit === u
                          ? 'bg-[var(--color-accent-primary)] text-white'
                          : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]',
                      ].join(' ')}
                    >
                      {u === 'metric' ? 'mL / L' : 'oz / gal'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-5 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleQuickAmount(amount)}
                    className={[
                      'rounded-[20px] border p-3 transition-smooth',
                      isQuickSelected(amount)
                        ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)]'
                        : 'border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{amount}</div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">{unitLabel}</div>
                  </button>
                ))}
              </div>

              <label htmlFor="amount_display" className="field-label mb-2 block">
                Custom Amount ({unitLabel})
              </label>
              <input
                type="number"
                id="amount_display"
                value={displayValue}
                onChange={(e) => handleCustomAmount(e.target.value)}
                className="input-base w-full"
                min="0.1"
                step={unit === 'imperial' ? '0.1' : '1'}
                required
              />
            </div>

            <div className="surface-panel-quiet flex items-center justify-between rounded-[24px] p-4">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                Contains Caffeine
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, caffeine_content: !formData.caffeine_content })
                }
                className={[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-smooth',
                  formData.caffeine_content ? 'bg-[var(--color-warning)]' : 'bg-white/12',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                    formData.caffeine_content ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                />
              </button>
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
                placeholder="Additional details..."
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
              category="hydration"
              icon={<Droplet className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
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
                        {log.beverage_type} · {formatHydrationAmount(log.amount_ml, unit)}
                        {log.caffeine_content ? ' · Contains Caffeine' : ''}
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => handleEdit(log as HydrationFormData & { id: string })}
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
