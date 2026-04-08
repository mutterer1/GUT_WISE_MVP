import { Save, Clock, Activity, Dumbbell } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { formatDateTime } from '../utils/dateFormatters';

interface ExerciseFormData {
  logged_at: string;
  exercise_type: string;
  duration_minutes: number;
  intensity_level: number;
  perceived_exertion: number | null;
  indoor_outdoor: string | null;
  notes: string;
}

const exerciseTypes = [
  'Walking', 'Running', 'Cycling', 'Swimming',
  'Yoga', 'Strength Training', 'HIIT', 'Pilates',
  'Dancing', 'Hiking', 'Sports', 'Stretching',
];

const intensityLabels: Record<number, string> = {
  1: 'Very Light',
  2: 'Light',
  3: 'Moderate',
  4: 'Vigorous',
  5: 'Maximum',
};

export default function ExerciseLog() {
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
  } = useLogCrud<ExerciseFormData>({
    table: 'exercise_logs',
    logType: 'exercise',
    defaultValues: {
      exercise_type: '',
      duration_minutes: 30,
      intensity_level: 3,
      perceived_exertion: null,
      indoor_outdoor: null,
      notes: '',
    },
    buildInsertPayload: (formData, userId) => ({
      user_id: userId,
      logged_at: formData.logged_at,
      exercise_type: formData.exercise_type,
      duration_minutes: formData.duration_minutes,
      intensity_level: formData.intensity_level,
      perceived_exertion: formData.perceived_exertion,
      indoor_outdoor: formData.indoor_outdoor || null,
      notes: formData.notes || null,
    }),
    buildUpdatePayload: (formData) => ({
      logged_at: formData.logged_at,
      exercise_type: formData.exercise_type,
      duration_minutes: formData.duration_minutes,
      intensity_level: formData.intensity_level,
      perceived_exertion: formData.perceived_exertion,
      indoor_outdoor: formData.indoor_outdoor || null,
      notes: formData.notes || null,
    }),
  });

  return (
    <LogPageShell
      title="Exercise Log"
      subtitle="Track workouts, movement, and physical activity"
      message={message}
      toastVisible={toastVisible}
      onDismissToast={dismissToast}
      error={error}
    >
      <LogModeTabs
        showHistory={showHistory}
        onShowNew={() => setShowHistory(false)}
        onShowHistory={() => setShowHistory(true)}
        newIcon={<Dumbbell className="h-4 w-4 mr-2" />}
        historyIcon={<Clock className="h-4 w-4 mr-2" />}
      />

      {!showHistory ? (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingId ? 'Edit Entry' : 'Log New Entry'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="logged_at" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Time
              </label>
              <input
                type="datetime-local"
                id="logged_at"
                value={formData.logged_at}
                onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Activity className="inline h-4 w-4 mr-1" />
                Exercise Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {exerciseTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, exercise_type: type })}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      formData.exercise_type === type
                        ? 'border-brand-500 bg-brand-100 text-brand-700 shadow-md dark:border-brand-300 dark:bg-brand-900/30 dark:text-brand-300'
                        : 'border-gray-200 text-neutral-text hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {!exerciseTypes.includes(formData.exercise_type) && (
                <input
                  type="text"
                  placeholder="Or type a custom activity..."
                  value={exerciseTypes.includes(formData.exercise_type) ? '' : formData.exercise_type}
                  onChange={(e) => setFormData({ ...formData, exercise_type: e.target.value })}
                  className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              )}
              {exerciseTypes.includes(formData.exercise_type) && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, exercise_type: '' })}
                  className="mt-2 text-xs text-brand-500 hover:text-brand-700"
                >
                  Use custom type instead
                </button>
              )}
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                min="0"
                max="600"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
              <div className="flex gap-2 mt-2">
                {[15, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setFormData({ ...formData, duration_minutes: mins })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      formData.duration_minutes === mins
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensity: {formData.intensity_level}/5 - {intensityLabels[formData.intensity_level]}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.intensity_level}
                onChange={(e) => setFormData({ ...formData, intensity_level: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                style={{
                  background: `linear-gradient(to right, #4A8FA8 0%, #4A8FA8 ${((formData.intensity_level - 1) / 4) * 100}%, rgb(229, 231, 235) ${((formData.intensity_level - 1) / 4) * 100}%, rgb(229, 231, 235) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Light</span>
                <span>Maximum</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perceived Exertion (Optional): {formData.perceived_exertion ?? '-'}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.perceived_exertion ?? 5}
                onChange={(e) => setFormData({ ...formData, perceived_exertion: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Easy</span>
                <span>Max Effort</span>
              </div>
              {formData.perceived_exertion !== null && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, perceived_exertion: null })}
                  className="mt-1 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Location (Optional)
              </label>
              <div className="flex gap-3">
                {(['indoor', 'outdoor'] as const).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        indoor_outdoor: formData.indoor_outdoor === loc ? null : loc,
                      })
                    }
                    className={`flex-1 p-3 rounded-lg border-2 transition-all text-sm font-medium capitalize ${
                      formData.indoor_outdoor === loc
                        ? 'border-brand-500 bg-brand-100 text-brand-700 shadow-md dark:border-brand-300 dark:bg-brand-900/30 dark:text-brand-300'
                        : 'border-gray-200 text-neutral-text hover:border-gray-300'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows={3}
                placeholder="How did the workout feel?"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving || !formData.exercise_type}>
                <Save className="inline h-4 w-4 mr-2" />
                {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Entry History</h2>
          {history.length === 0 ? (
            <EmptyState category="exercise" icon={<Dumbbell className="h-8 w-8 text-gray-400" />} />
          ) : (
            <div className="space-y-4">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDateTime(log.logged_at)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {log.exercise_type} - {log.duration_minutes}min - Intensity {log.intensity_level}/5
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(log as ExerciseFormData & { id: string })}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(log.id!)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-700">
                      {intensityLabels[log.intensity_level] || `Intensity ${log.intensity_level}`}
                    </span>
                    {log.indoor_outdoor && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 capitalize">
                        {log.indoor_outdoor}
                      </span>
                    )}
                    {log.perceived_exertion != null && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        RPE {log.perceived_exertion}/10
                      </span>
                    )}
                  </div>
                  {log.notes && (
                    <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
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
