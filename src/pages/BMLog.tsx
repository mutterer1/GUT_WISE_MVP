import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Pencil,
  Save,
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import {
  LogHistoryActions,
  LogHistoryGroup,
  LogHistoryNoMatches,
  LogHistoryToolbar,
} from '../components/LogHistoryTools';
import { useLogCrud } from '../hooks/useLogCrud';
import {
  buildLogHistorySearchText,
  formatLogHistoryTime,
  groupLogHistoryByDay,
  matchesLogHistoryQuery,
} from '../utils/logHistoryDisplay';
import { BRISTOL_SCALE } from '../constants/domain';

interface BMFormData {
  id?: string;
  logged_at: string;
  bristol_type: number;
  urgency: number;
  pain_level: number;
  difficulty_level: number;
  amount: 'small' | 'medium' | 'large';
  incomplete_evacuation: boolean;
  blood_present: boolean;
  mucus_present: boolean;
  notes: string;
}

const bmConfig = {
  table: 'bm_logs',
  logType: 'bm' as const,
  defaultValues: {
    bristol_type: 4,
    urgency: 1,
    pain_level: 1,
    difficulty_level: 1,
    amount: 'medium' as const,
    incomplete_evacuation: false,
    blood_present: false,
    mucus_present: false,
    notes: '',
  },
  buildInsertPayload: (formData: BMFormData, userId: string) => ({
    user_id: userId,
    logged_at: formData.logged_at,
    bristol_type: formData.bristol_type,
    urgency: Math.round(formData.urgency),
    pain_level: Math.round(formData.pain_level),
    difficulty_level: Math.round(formData.difficulty_level),
    amount: formData.amount,
    incomplete_evacuation: formData.incomplete_evacuation,
    blood_present: formData.blood_present,
    mucus_present: formData.mucus_present,
    notes: formData.notes || null,
  }),
  buildUpdatePayload: (formData: BMFormData) => ({
    logged_at: formData.logged_at,
    bristol_type: formData.bristol_type,
    urgency: Math.round(formData.urgency),
    pain_level: Math.round(formData.pain_level),
    difficulty_level: Math.round(formData.difficulty_level),
    amount: formData.amount,
    incomplete_evacuation: formData.incomplete_evacuation,
    blood_present: formData.blood_present,
    mucus_present: formData.mucus_present,
    notes: formData.notes || null,
  }),
};

function hasNonDefaultDetails(formData: BMFormData): boolean {
  return (
    formData.urgency > 1 ||
    formData.pain_level > 1 ||
    formData.difficulty_level > 1 ||
    formData.incomplete_evacuation ||
    formData.blood_present ||
    formData.mucus_present ||
    formData.notes.trim().length > 0
  );
}

export default function BMLog() {
  const [showDetails, setShowDetails] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');

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
    handleUseAsTemplate,
    handleDelete,
    resetForm,
  } = useLogCrud<BMFormData>(bmConfig);

  useEffect(() => {
    if (editingId && hasNonDefaultDetails(formData)) {
      setShowDetails(true);
    }
  }, [editingId, formData]);

  useEffect(() => {
    if (!editingId && !hasNonDefaultDetails(formData)) {
      setShowDetails(false);
    }
  }, [editingId, formData]);

  const handleReset = () => {
    resetForm();
    setShowDetails(false);
  };

  const filteredHistory = history.filter((log) =>
    matchesLogHistoryQuery(
      buildLogHistorySearchText(
        log.logged_at,
        log.bristol_type,
        log.amount,
        log.urgency,
        log.pain_level,
        log.difficulty_level,
        log.incomplete_evacuation ? 'incomplete evacuation incomplete' : '',
        log.blood_present ? 'blood present blood' : '',
        log.mucus_present ? 'mucus present mucus' : '',
        log.notes
      ),
      historyQuery
    )
  );
  const groupedHistory = groupLogHistoryByDay(filteredHistory);

  return (
    <LogPageShell
      title="Bowel Movement Log"
      subtitle="Capture the core event quickly, then expand only if the entry needs more context."
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
                onClick={handleReset}
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

                <p className="field-help mt-3">
                  Anchor the event first. Everything else can stay lightweight.
                </p>
              </div>

              <div className="surface-intelligence rounded-[24px] p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                  Stool Framing
                </p>
                <p className="mt-3 text-[clamp(1.6rem,2vw,2rem)] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                  Bristol Type {formData.bristol_type}
                </p>
                <p className="mt-3 max-w-[36ch] text-sm leading-7 text-[var(--color-text-secondary)]">
                  Type 4 is the usual reference point. Log what actually happened, not what you
                  hoped to see.
                </p>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <label className="field-label">Bristol Stool Scale</label>
                  <p className="field-help mt-1">Choose the closest match to the event.</p>
                </div>
                <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                  Type 4 Ideal
                </span>
              </div>

              <div className="-mx-1 overflow-x-auto px-1 pb-1">
                <div className="grid min-w-[560px] grid-cols-7 gap-2">
                  {BRISTOL_SCALE.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, bristol_type: item.value })}
                      className={[
                        'flex min-h-[156px] flex-col items-center justify-start rounded-[20px] border px-3 py-4 text-center transition-smooth',
                        formData.bristol_type === item.value
                          ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)] shadow-[0_0_0_1px_rgba(84,160,255,0.12)]'
                          : 'border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]',
                      ].join(' ')}
                    >
                      <div className="flex h-10 items-center justify-center text-[2.35rem] font-semibold leading-none tracking-[-0.03em] text-[var(--color-text-primary)]">
                        {item.value}
                      </div>
                      <div className="mt-3 flex min-h-[64px] items-start justify-center text-center text-[11px] leading-5 text-[var(--color-text-secondary)]">
                        <span className="max-w-[11ch]">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <label className="field-label mb-3 block">Amount</label>

              <div className="grid grid-cols-3 gap-3">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: size })}
                    className={[
                      'flex min-h-[76px] items-center justify-center rounded-[20px] border px-4 py-4 text-center text-sm font-medium capitalize transition-smooth',
                      formData.amount === size
                        ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)] text-[var(--color-text-primary)]'
                        : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.02] px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-between gap-4 py-1 text-left transition-smooth hover:text-[var(--color-text-primary)]"
              >
                <span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">Details</span>
                  <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">(optional)</span>
                </span>

                {showDetails ? (
                  <ChevronUp className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                )}
              </button>

              {showDetails && (
                <div className="mt-5 space-y-6 border-t border-white/8 pt-5">
                  <div className="grid gap-5 md:grid-cols-3">
                    <SliderField
                      label="Urgency Level"
                      value={formData.urgency}
                      onChange={(value) => setFormData((prev) => ({ ...prev, urgency: value }))}
                      low="Low"
                      high="High"
                    />

                    <SliderField
                      label="Pain Level"
                      value={formData.pain_level}
                      onChange={(value) => setFormData((prev) => ({ ...prev, pain_level: value }))}
                      low="None"
                      high="Severe"
                    />

                    <SliderField
                      label="Difficulty Level"
                      value={formData.difficulty_level}
                      onChange={(value) => setFormData((prev) => ({ ...prev, difficulty_level: value }))}
                      low="Easy"
                      high="Hard"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <ToggleField
                      label="Incomplete Evacuation"
                      active={formData.incomplete_evacuation}
                      onToggle={() =>
                        setFormData((prev) => ({ ...prev, incomplete_evacuation: !prev.incomplete_evacuation }))
                      }
                    />

                    <ToggleField
                      label="Blood Present"
                      active={formData.blood_present}
                      onToggle={() =>
                        setFormData((prev) => ({ ...prev, blood_present: !prev.blood_present }))
                      }
                    />

                    <ToggleField
                      label="Mucus Present"
                      active={formData.mucus_present}
                      onToggle={() =>
                        setFormData((prev) => ({ ...prev, mucus_present: !prev.mucus_present }))
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="field-label mb-2 block">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => { const v = e.target.value; setFormData((prev) => ({ ...prev, notes: v })); }}
                      rows={4}
                      placeholder="Any context worth remembering..."
                      className="input-base min-h-[112px] w-full resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button type="submit" disabled={saving} size="lg">
                <Save className="mr-2 inline h-4 w-4" />
                {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
              </Button>

              {editingId && (
                <Button type="button" variant="secondary" size="lg" onClick={handleReset}>
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
              category="bm"
              icon={<Activity className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
            />
          ) : (
            <div className="space-y-5">
              <LogHistoryToolbar
                query={historyQuery}
                onQueryChange={setHistoryQuery}
                totalCount={history.length}
                filteredCount={filteredHistory.length}
                placeholder="Search Bristol type, amount, flags, notes..."
              />

              {filteredHistory.length === 0 ? (
                <LogHistoryNoMatches query={historyQuery} onClear={() => setHistoryQuery('')} />
              ) : (
                <div className="space-y-5">
                  {groupedHistory.map((group) => (
                    <LogHistoryGroup key={group.key} label={group.label} count={group.entries.length}>
                      {group.entries.map((log) => (
                <div
                  key={log.id}
                  className="rounded-[22px] border border-white/8 bg-white/[0.03] p-3 transition-smooth hover:border-white/14 hover:bg-white/[0.04] sm:p-4"
                >
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">
                        {formatLogHistoryTime(log.logged_at)}
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        Bristol Type {log.bristol_type} · {log.amount}
                      </div>
                    </div>

                    <LogHistoryActions
                      onUseAsTemplate={() => handleUseAsTemplate(log as BMFormData & { id: string })}
                      onEdit={() => handleEdit(log as BMFormData & { id: string })}
                      onDelete={() => handleDelete(log.id!)}
                    />
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <MetricChip label="Urgency" value={`${Number(log.urgency).toFixed(1)}/10`} />
                    <MetricChip label="Pain" value={`${Number(log.pain_level).toFixed(1)}/10`} />
                    <MetricChip
                      label="Difficulty"
                      value={`${Number(log.difficulty_level).toFixed(1)}/10`}
                    />
                  </div>

                  {(log.incomplete_evacuation || log.blood_present || log.mucus_present) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {log.incomplete_evacuation && <Badge label="Incomplete" />}
                      {log.blood_present && <Badge label="Blood" />}
                      {log.mucus_present && <Badge label="Mucus" />}
                    </div>
                  )}

                  {log.notes && (
                    <div className="mt-3 rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {log.notes}
                    </div>
                  )}
                        </div>
                      ))}
                    </LogHistoryGroup>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </LogPageShell>
  );
}

function SliderField({
  label,
  value,
  onChange,
  low,
  high,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  low: string;
  high: string;
}) {
  return (
    <div className="surface-panel-quiet rounded-[22px] p-4">
      <label className="field-label mb-2 block">
        {label}:{' '}
        <span className="font-medium text-[var(--color-text-primary)]">{value.toFixed(1)}</span>
      </label>

      <input
        type="range"
        min="1"
        max="10"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--color-accent-primary)]"
      />

      <div className="mt-2 flex justify-between text-xs text-[var(--color-text-tertiary)]">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function ToggleField({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="surface-panel-quiet flex items-center justify-between rounded-[22px] p-4">
      <span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span>

      <button
        type="button"
        onClick={onToggle}
        className={[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-smooth',
          active ? 'bg-[var(--color-accent-primary)]' : 'bg-white/12',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 rounded-full bg-white transition-transform',
            active ? 'translate-x-6' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
    </div>
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

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
      <AlertCircle className="mr-1 h-3 w-3 text-[var(--color-accent-primary)]" />
      {label}
    </span>
  );
}
