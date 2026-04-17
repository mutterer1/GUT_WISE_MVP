import { useState, useEffect } from 'react';
import { Save, Clock, AlertCircle, Activity, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { formatDateTime } from '../utils/dateFormatters';
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
  } = useLogCrud<BMFormData>(bmConfig);

  useEffect(() => {
    if (editingId && hasNonDefaultDetails(formData)) {
      setShowDetails(true);
    }
  }, [editingId]);

  const handleReset = () => {
    resetForm();
    setShowDetails(false);
  };

  return (
    <LogPageShell
      title="Bowel Movement Log"
      subtitle="Log quickly. All details are optional."
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
                onClick={handleReset}
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
                onChange={(e) =>
                  setFormData({ ...formData, logged_at: e.target.value })
                }
                className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <label className="text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                  Bristol Stool Scale
                </label>
                <span className="text-xs text-neutral-muted dark:text-dark-muted">Type 4 is ideal</span>
              </div>

              <div className="-mx-1 overflow-x-auto px-1 pb-1">
                <div className="grid grid-cols-7 gap-1.5 min-w-[392px]">
                  {BRISTOL_SCALE.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, bristol_type: item.value })
                      }
                      className={`rounded-xl border-2 px-1 py-3 transition-all ${
                        formData.bristol_type === item.value
                          ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 shadow-sm'
                          : 'border-neutral-border dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700'
                      }`}
                    >
                      <div className="text-xl font-bold text-neutral-text dark:text-dark-text leading-none">
                        {item.value}
                      </div>
                      <div className="mt-1.5 text-[10px] leading-tight text-neutral-muted dark:text-dark-muted">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Amount
              </label>

              <div className="grid grid-cols-3 gap-3">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: size })}
                    className={`rounded-xl border-2 p-4 capitalize transition-all text-body-sm font-medium ${
                      formData.amount === size
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                        : 'border-neutral-border dark:border-dark-border text-neutral-text dark:text-dark-text hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-border dark:border-dark-border pt-2">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-between py-2 text-body-sm text-neutral-muted dark:text-dark-muted hover:text-neutral-text dark:hover:text-dark-text transition-colors"
              >
                <span className="font-medium">
                  Details
                  <span className="ml-1.5 font-normal opacity-60">(optional)</span>
                </span>
                {showDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showDetails && (
                <div className="mt-4 space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <SliderField
                      label="Urgency Level"
                      value={formData.urgency}
                      onChange={(value) =>
                        setFormData({ ...formData, urgency: value })
                      }
                      accent="accent-brand-500"
                      low="Low"
                      high="High"
                    />

                    <SliderField
                      label="Pain Level"
                      value={formData.pain_level}
                      onChange={(value) =>
                        setFormData({ ...formData, pain_level: value })
                      }
                      accent="accent-signal-500"
                      low="None"
                      high="Severe"
                    />

                    <SliderField
                      label="Difficulty Level"
                      value={formData.difficulty_level}
                      onChange={(value) =>
                        setFormData({ ...formData, difficulty_level: value })
                      }
                      accent="accent-orange-500"
                      low="Easy"
                      high="Hard"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <ToggleField
                      label="Incomplete Evacuation"
                      active={formData.incomplete_evacuation}
                      onToggle={() =>
                        setFormData({
                          ...formData,
                          incomplete_evacuation: !formData.incomplete_evacuation,
                        })
                      }
                      activeClass="bg-brand-500"
                    />

                    <ToggleField
                      label="Blood Present"
                      active={formData.blood_present}
                      onToggle={() =>
                        setFormData({
                          ...formData,
                          blood_present: !formData.blood_present,
                        })
                      }
                      activeClass="bg-signal-500"
                    />

                    <ToggleField
                      label="Mucus Present"
                      active={formData.mucus_present}
                      onToggle={() =>
                        setFormData({
                          ...formData,
                          mucus_present: !formData.mucus_present,
                        })
                      }
                      activeClass="bg-orange-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                      placeholder="Any additional observations..."
                      className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving} size="lg">
                <Save className="mr-2 inline h-4 w-4" />
                {saving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Entry'
                  : 'Save Entry'}
              </Button>

              {editingId && (
                <Button type="button" variant="outline" size="lg" onClick={handleReset}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          {history.length === 0 ? (
            <EmptyState
              category="bm"
              icon={<Activity className="h-8 w-8 text-neutral-muted dark:text-dark-muted" />}
            />
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
                        Bristol Type {log.bristol_type} &middot; {log.amount}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          handleEdit(log as BMFormData & { id: string })
                        }
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
                      <span className="text-neutral-muted dark:text-dark-muted">Urgency:</span>
                      <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">
                        {Number(log.urgency).toFixed(1)}/10
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-muted dark:text-dark-muted">Pain:</span>
                      <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">
                        {Number(log.pain_level).toFixed(1)}/10
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-muted dark:text-dark-muted">Difficulty:</span>
                      <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">
                        {Number(log.difficulty_level).toFixed(1)}/10
                      </span>
                    </div>
                  </div>

                  {(log.incomplete_evacuation ||
                    log.blood_present ||
                    log.mucus_present) && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {log.incomplete_evacuation && (
                        <Badge label="Incomplete" color="yellow" />
                      )}
                      {log.blood_present && (
                        <Badge label="Blood" color="red" />
                      )}
                      {log.mucus_present && (
                        <Badge label="Mucus" color="orange" />
                      )}
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

function SliderField({
  label,
  value,
  onChange,
  accent,
  low,
  high,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  accent: string;
  low: string;
  high: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
        {label}: <span className="text-neutral-text dark:text-dark-text">{value.toFixed(1)}</span>
      </label>

      <input
        type="range"
        min="1"
        max="10"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border ${accent}`}
      />

      <div className="mt-1 flex justify-between text-xs text-neutral-muted dark:text-dark-muted">
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
  activeClass,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  activeClass: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-neutral-bg dark:bg-dark-bg p-4 border border-neutral-border dark:border-dark-border">
      <span className="text-body-sm font-medium text-neutral-text dark:text-dark-text">{label}</span>

      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          active ? activeClass : 'bg-neutral-border dark:bg-dark-border'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            active ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function Badge({
  label,
  color,
}: {
  label: string;
  color: 'yellow' | 'red' | 'orange';
}) {
  const styles = {
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    red: 'bg-signal-500/10 text-signal-500',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles[color]}`}
    >
      <AlertCircle className="mr-1 h-3 w-3" />
      {label}
    </span>
  );
}
