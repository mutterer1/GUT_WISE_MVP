import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Activity, Clock, Droplet, Zap } from 'lucide-react';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogEditingBanner from '../components/LogEditingBanner';
import LogFormActions from '../components/LogFormActions';
import LogFollowUpNotice from '../components/LogFollowUpNotice';
import LogPageShell from '../components/LogPageShell';
import LogRecallPanel from '../components/LogRecallPanel';
import LogModeTabs from '../components/LogModeTabs';
import LogOptionalSection from '../components/LogOptionalSection';
import { useLogCrud } from '../hooks/useLogCrud';
import {
  mergeLogFollowUpPrefill,
  readLogFollowUpState,
} from '../services/logFollowUpService';
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
import {
  BEVERAGE_TYPES,
  type HydrationBeverageCategory,
  type HydrationBeverageDefinition,
} from '../constants/domain';
import { hydrateLogWithDerivedFields } from '../utils/hydrationClassification';

interface HydrationFormData {
  logged_at: string;
  beverage_type: string;
  beverage_category: HydrationBeverageCategory;
  amount_ml: number;
  caffeine_content: boolean;
  caffeine_mg: number;
  effective_hydration_ml: number;
  water_goal_contribution_ml: number;
  electrolyte_present: boolean;
  alcohol_present: boolean;
  notes: string;
}

function getBeverageDefinition(type: string): HydrationBeverageDefinition {
  return (
    BEVERAGE_TYPES.find((item) => item.value === type) ??
    BEVERAGE_TYPES.find((item) => item.category === 'other') ??
    BEVERAGE_TYPES[0]
  );
}

function buildHydrationFormData(
  overrides: Partial<HydrationFormData> = {}
): Omit<HydrationFormData, 'logged_at'> {
  const baseDefinition = getBeverageDefinition(overrides.beverage_type ?? 'Water');
  const baseAmount = overrides.amount_ml ?? baseDefinition.ml;
  const baseCaffeineContent =
    overrides.caffeine_content ?? (overrides.caffeine_mg ?? baseDefinition.defaultCaffeineMg) > 0;

  const derived = hydrateLogWithDerivedFields({
    beverage_type: overrides.beverage_type ?? baseDefinition.value,
    beverage_category: overrides.beverage_category ?? baseDefinition.category,
    amount_ml: baseAmount,
    caffeine_content: baseCaffeineContent,
    caffeine_mg: overrides.caffeine_mg,
    electrolyte_present: overrides.electrolyte_present,
    alcohol_present: overrides.alcohol_present,
  });

  return {
    beverage_type: derived.beverage_type,
    beverage_category: derived.beverage_category,
    amount_ml: derived.amount_ml,
    caffeine_content: baseCaffeineContent,
    caffeine_mg: derived.caffeine_mg,
    effective_hydration_ml: overrides.effective_hydration_ml ?? derived.effective_hydration_ml,
    water_goal_contribution_ml:
      overrides.water_goal_contribution_ml ?? derived.water_goal_contribution_ml,
    electrolyte_present: overrides.electrolyte_present ?? derived.electrolyte_present,
    alcohol_present: overrides.alcohol_present ?? derived.alcohol_present,
    notes: overrides.notes ?? '',
  };
}

function hasMeaningfulHydrationDraft(formData: HydrationFormData): boolean {
  const defaults = buildHydrationFormData();
  return (
    formData.beverage_type !== defaults.beverage_type ||
    formData.amount_ml !== defaults.amount_ml ||
    formData.caffeine_content !== defaults.caffeine_content ||
    formData.caffeine_mg !== defaults.caffeine_mg ||
    formData.electrolyte_present !== defaults.electrolyte_present ||
    formData.alcohol_present !== defaults.alcohol_present ||
    formData.notes.trim().length > 0
  );
}

function hasHydrationContextDetails(formData: HydrationFormData): boolean {
  return (
    formData.caffeine_content ||
    formData.caffeine_mg > 0 ||
    formData.notes.trim().length > 0
  );
}

export default function HydrationLog() {
  const location = useLocation();
  const [unit, setUnit] = useState<HydrationUnit>(getStoredHydrationUnit);
  const [showHydrationDetails, setShowHydrationDetails] = useState(false);
  const followUp = readLogFollowUpState<HydrationFormData>(location.state);

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
  } = useLogCrud<HydrationFormData>({
    table: 'hydration_logs' as const,
    logType: 'hydration' as const,
    defaultValues: buildHydrationFormData(),
    hasMeaningfulDraft: hasMeaningfulHydrationDraft,
    buildInsertPayload: (data, userId) => {
      const normalized = hydrateLogWithDerivedFields(data);
      return {
        user_id: userId,
        logged_at: data.logged_at,
        beverage_type: normalized.beverage_type,
        beverage_category: normalized.beverage_category,
        amount_ml: normalized.amount_ml,
        caffeine_content: data.caffeine_content,
        caffeine_mg: normalized.caffeine_mg,
        effective_hydration_ml: normalized.effective_hydration_ml,
        water_goal_contribution_ml: normalized.water_goal_contribution_ml,
        electrolyte_present: normalized.electrolyte_present,
        alcohol_present: normalized.alcohol_present,
        notes: data.notes || null,
      };
    },
    buildUpdatePayload: (data) => {
      const normalized = hydrateLogWithDerivedFields(data);
      return {
        logged_at: data.logged_at,
        beverage_type: normalized.beverage_type,
        beverage_category: normalized.beverage_category,
        amount_ml: normalized.amount_ml,
        caffeine_content: data.caffeine_content,
        caffeine_mg: normalized.caffeine_mg,
        effective_hydration_ml: normalized.effective_hydration_ml,
        water_goal_contribution_ml: normalized.water_goal_contribution_ml,
        electrolyte_present: normalized.electrolyte_present,
        alcohol_present: normalized.alcohol_present,
        notes: data.notes || null,
      };
    },
    mapHistoryToForm: (log) => ({
      logged_at: log.logged_at,
      ...buildHydrationFormData(log),
    }),
  });

  useEffect(() => {
    if (hasHydrationContextDetails(formData)) {
      setShowHydrationDetails(true);
    } else if (!editingId) {
      setShowHydrationDetails(false);
    }
  }, [editingId, formData]);

  useEffect(() => {
    if (!followUp || editingId) {
      return;
    }

    setFormData((current) => mergeLogFollowUpPrefill(current, followUp));
    setShowHydrationDetails(false);
  }, [editingId, followUp?.followUpKey, followUp, setFormData]);

  const applyHydrationChanges = (patch: Partial<HydrationFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...patch };
      const normalized = hydrateLogWithDerivedFields(next);
      return {
        ...next,
        beverage_category: normalized.beverage_category,
        caffeine_mg: normalized.caffeine_mg,
        effective_hydration_ml: normalized.effective_hydration_ml,
        water_goal_contribution_ml: normalized.water_goal_contribution_ml,
        electrolyte_present: normalized.electrolyte_present,
        alcohol_present: normalized.alcohol_present,
      };
    });
  };

  const displayValue = unit === 'imperial' ? mlToOz(formData.amount_ml) : formData.amount_ml;
  const unitLabel = getUnitLabel(unit);
  const quickAmounts = unit === 'imperial' ? QUICK_AMOUNTS_OZ : QUICK_AMOUNTS_ML;
  const selectedBeverage = getBeverageDefinition(formData.beverage_type);

  const handleUnitToggle = (nextUnit: HydrationUnit) => {
    setUnit(nextUnit);
    setStoredHydrationUnit(nextUnit);
  };

  const handleBeverageTypeChange = (type: string) => {
    const beverage = getBeverageDefinition(type);
    const hasCaffeine = beverage.defaultCaffeineMg > 0;

    applyHydrationChanges({
      beverage_type: beverage.value,
      beverage_category: beverage.category,
      amount_ml: beverage.ml,
      caffeine_content: hasCaffeine,
      caffeine_mg: beverage.defaultCaffeineMg,
      electrolyte_present: beverage.electrolytePresent,
      alcohol_present: beverage.alcoholPresent,
    });
  };

  const handleQuickAmount = (amount: number) => {
    const ml = unit === 'imperial' ? ozToMl(amount) : amount;
    applyHydrationChanges({ amount_ml: ml });
  };

  const handleCustomAmount = (raw: string) => {
    const parsed = parseFloat(raw) || 0;
    const ml = unit === 'imperial' ? ozToMl(parsed) : Math.round(parsed);
    applyHydrationChanges({ amount_ml: ml });
  };

  const handleCaffeineToggle = () => {
    const nextCaffeineContent = !formData.caffeine_content;

    applyHydrationChanges({
      caffeine_content: nextCaffeineContent,
      caffeine_mg: nextCaffeineContent ? Math.max(formData.caffeine_mg, selectedBeverage.defaultCaffeineMg, 25) : 0,
    });
  };

  const handleCaffeineMgChange = (raw: string) => {
    const parsed = Math.max(0, parseInt(raw, 10) || 0);
    applyHydrationChanges({
      caffeine_content: parsed > 0,
      caffeine_mg: parsed,
    });
  };

  const isQuickSelected = (amount: number) => {
    const ml = unit === 'imperial' ? ozToMl(amount) : amount;
    return formData.amount_ml === ml;
  };

  const hydrationModelLabel =
    formData.water_goal_contribution_ml > 0
      ? 'Counts toward water goal'
      : formData.alcohol_present
        ? 'Tracked separately from hydration'
        : 'Counts as total fluid, not water goal';

  const handleUseRecent = (recentId: string) => {
    const entry = recentEntries.find((item) => item.id === recentId);
    if (!entry) {
      return;
    }

    applyRecent(entry);
    setShowHydrationDetails(hasHydrationContextDetails(entry.data));
  };

  const recentRecallItems = recentEntries.slice(0, 3).map((entry) => ({
    id: entry.id,
    title: `${entry.data.beverage_type} | ${formatHydrationAmount(entry.data.amount_ml, unit)}`,
    subtitle: entry.data.caffeine_mg > 0
      ? `${entry.data.caffeine_mg} mg caffeine | ${entry.data.beverage_category}`
      : `caffeine-free | ${entry.data.beverage_category}`,
  }));

  return (
    <LogPageShell
      title="Hydration Log"
      subtitle="Track fluid intake with enough structure to separate water progress, total fluids, and caffeine exposure."
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
              setShowHydrationDetails(false);
            }}
          />

          {!editingId ? (
            <div className="mb-6">
              <LogRecallPanel
                hasStoredDraft={hasStoredDraft}
                draftUpdatedAt={draftUpdatedAt}
                draftLabel="Hydration draft restored from this device."
                recentItems={recentRecallItems}
                onDiscardDraft={() => {
                  discardStoredDraft();
                }}
                onUseRecent={handleUseRecent}
              />
            </div>
          ) : null}

          {!editingId && followUp ? (
            <div className="mb-6">
              <LogFollowUpNotice followUp={followUp} />
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
                  Log when the drink happened so timing can be compared with symptoms, sleep, and bowel activity.
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
                  {formData.caffeine_mg > 0 ? ` · ${formData.caffeine_mg} mg caffeine` : ' · caffeine-free'}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-tertiary)]">
                  {hydrationModelLabel}
                </p>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
              <div className="mb-4">
                <label className="field-label">
                  <Droplet className="mr-1 inline h-4 w-4" />
                  Beverage Type
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {BEVERAGE_TYPES.map((type) => (
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
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {type.category === 'water'
                        ? 'Water goal'
                        : type.category === 'electrolyte'
                          ? 'Electrolyte'
                          : type.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-panel-soft rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
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

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="surface-panel-soft rounded-[24px] p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[var(--color-accent-secondary)]" />
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    Hydration interpretation
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricChip
                    label="Effective Hydration"
                    value={formatHydrationAmount(formData.effective_hydration_ml, unit)}
                  />
                  <MetricChip
                    label="Water Goal Credit"
                    value={formatHydrationAmount(formData.water_goal_contribution_ml, unit)}
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.electrolyte_present && (
                    <span className="rounded-full border border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)] px-3 py-1 text-xs text-[var(--color-accent-primary)]">
                      Electrolytes present
                    </span>
                  )}
                  {formData.alcohol_present && (
                    <span className="rounded-full border border-[rgba(248,113,113,0.18)] bg-[rgba(248,113,113,0.08)] px-3 py-1 text-xs text-[rgba(252,165,165,0.98)]">
                      Alcohol tracked separately
                    </span>
                  )}
                  {!formData.electrolyte_present && !formData.alcohol_present && (
                    <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-[var(--color-text-tertiary)]">
                      Category: {formData.beverage_category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <LogOptionalSection
              title="Caffeine and notes"
              isOpen={showHydrationDetails}
              onToggle={() => setShowHydrationDetails(!showHydrationDetails)}
              summary="Use this only when caffeine context or extra notes help explain the intake."
            >
              <div className="surface-panel-quiet rounded-[24px] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                      Contains Caffeine
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                      Track caffeine separately from hydration.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCaffeineToggle}
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

                <label htmlFor="caffeine_mg" className="field-label mb-2 block">
                  Caffeine Amount (mg)
                </label>
                <input
                  type="number"
                  id="caffeine_mg"
                  value={formData.caffeine_mg}
                  onChange={(e) => handleCaffeineMgChange(e.target.value)}
                  className="input-base w-full"
                  min="0"
                  step="1"
                />
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
                  placeholder="Context, brand, timing, or anything you want to remember..."
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
                        {typeof log.caffeine_mg === 'number' && log.caffeine_mg > 0
                          ? ` · ${log.caffeine_mg} mg caffeine`
                          : ''}
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

                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricChip
                      label="Category"
                      value={String(log.beverage_category ?? 'other')}
                    />
                    <MetricChip
                      label="Effective Hydration"
                      value={formatHydrationAmount(
                        log.effective_hydration_ml ?? log.amount_ml,
                        unit
                      )}
                    />
                    <MetricChip
                      label="Water Goal Credit"
                      value={formatHydrationAmount(
                        log.water_goal_contribution_ml ?? 0,
                        unit
                      )}
                    />
                  </div>

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
