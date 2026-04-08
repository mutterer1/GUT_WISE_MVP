import { Save, Clock, AlertCircle, Activity } from 'lucide-react';
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
    urgency: formData.urgency,
    pain_level: formData.pain_level,
    difficulty_level: formData.difficulty_level,
    amount: formData.amount,
    incomplete_evacuation: formData.incomplete_evacuation,
    blood_present: formData.blood_present,
    mucus_present: formData.mucus_present,
    notes: formData.notes || null,
  }),
  buildUpdatePayload: (formData: BMFormData) => ({
    logged_at: formData.logged_at,
    bristol_type: formData.bristol_type,
    urgency: formData.urgency,
    pain_level: formData.pain_level,
    difficulty_level: formData.difficulty_level,
    amount: formData.amount,
    incomplete_evacuation: formData.incomplete_evacuation,
    blood_present: formData.blood_present,
    mucus_present: formData.mucus_present,
    notes: formData.notes || null,
  }),
};

export default function BMLog() {
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

  return (
    <LogPageShell
      title="Bowel Movement Log"
      subtitle="Quick and comprehensive tracking"
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
      />

      {!showHistory ? (
        <Card>
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            {editingId ? 'Edit Entry' : 'Log New Entry'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="logged_at" className="mb-2 block text-sm font-medium text-gray-700">
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Bristol Stool Scale
              </label>

              <div className="grid grid-cols-7 gap-2">
                {BRISTOL_SCALE.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, bristol_type: item.value })
                    }
                    className={`rounded-lg border-2 p-3 transition-all ${
                      formData.bristol_type === item.value
                        ? 'border-teal-500 bg-teal-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl font-bold text-gray-900">
                      {item.value}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <SliderField
                label="Urgency Level"
                value={formData.urgency}
                onChange={(value) =>
                  setFormData({ ...formData, urgency: value })
                }
                accent="accent-teal-500"
                low="Low"
                high="High"
              />

              <SliderField
                label="Pain Level"
                value={formData.pain_level}
                onChange={(value) =>
                  setFormData({ ...formData, pain_level: value })
                }
                accent="accent-red-500"
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

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Amount
              </label>

              <div className="grid grid-cols-3 gap-3">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: size })}
                    className={`rounded-lg border-2 p-4 capitalize transition-all ${
                      formData.amount === size
                        ? 'border-teal-500 bg-teal-50 text-gray-900 shadow-md dark: border-teal-500 bg-teal-50 text-gray-900'
                        : 'border-gray-600 text-gray-900 hover:border-gray-900 dark:border-dark-border dark:text-gray-900 dark:hover:border-dark-muted'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
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
    activeClass="bg-teal-500"
    labelClassName="text-gray-900"
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
    activeClass="bg-red-500"
    labelClassName="text-gray-900"
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
    labelClassName="text-gray-900"
  />
</div>

            <div>
              <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 inline h-4 w-4" />
                {saving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Entry'
                  : 'Save Entry'}
              </Button>

              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Entry History
          </h2>

          {history.length === 0 ? (
            <EmptyState
              category="bm"
              icon={<Activity className="h-8 w-8 text-gray-400" />}
            />
          ) : (
            <div className="space-y-4">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDateTime(log.logged_at)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Bristol Type {log.bristol_type} - {log.amount}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleEdit(log as BMFormData & { id: string })
                        }
                        className="text-sm font-medium text-teal-600 hover:text-teal-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(log.id!)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Urgency:</span>
                      <span className="ml-1 font-medium">
                        {Number(log.urgency).toFixed(1)}/10
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Pain:</span>
                      <span className="ml-1 font-medium">
                        {Number(log.pain_level).toFixed(1)}/10
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Difficulty:</span>
                      <span className="ml-1 font-medium">
                        {Number(log.difficulty_level).toFixed(1)}/10
                      </span>
                    </div>
                  </div>

                  {(log.incomplete_evacuation ||
                    log.blood_present ||
                    log.mucus_present) && (
                    <div className="mt-3 flex gap-2">
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
                    <div className="mt-3 rounded bg-gray-50 p-2 text-sm text-gray-600">
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
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}: {value.toFixed(1)}
      </label>

      <input
        type="range"
        min="1"
        max="10"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 ${accent}`}
      />

      <div className="mt-1 flex justify-between text-xs text-gray-500">
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
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-dark-surface">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-700">{label}</span>

      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-3 w-11 items-center rounded-full transition-colors ${
          active ? activeClass : 'bg-gray-700 dark:bg-dark-border'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-dark transition-transform ${
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
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${styles[color]}`}
    >
      <AlertCircle className="mr-1 h-3 w-3" />
      {label}
    </span>
  );
}
