import { Save, Clock, Activity, Moon } from 'lucide-react';
import Header from '../components/Header';
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
    buildInsertPayload: (formData, userId) => {
      const start = new Date(formData.sleep_start);
      const end = new Date(formData.sleep_end);
      const duration_minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      return {
        user_id: userId,
        logged_at: formData.logged_at,
        sleep_start: formData.sleep_start,
        sleep_end: formData.sleep_end,
        quality: formData.quality,
        interruptions: formData.interruptions,
        felt_rested: formData.felt_rested,
        duration_minutes,
        notes: formData.notes,
      };
    },
    buildUpdatePayload: (formData) => {
      const start = new Date(formData.sleep_start);
      const end = new Date(formData.sleep_end);
      const duration_minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      return {
        logged_at: formData.logged_at,
        sleep_start: formData.sleep_start,
        sleep_end: formData.sleep_end,
        quality: formData.quality,
        interruptions: formData.interruptions,
        felt_rested: formData.felt_rested,
        duration_minutes,
        notes: formData.notes,
      };
    },
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
        newIcon={<Activity className="h-4 w-4 mr-2" />}
        historyIcon={<Clock className="h-4 w-4 mr-2" />}
      />

      {!showHistory ? (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingId ? 'Edit Entry' : 'Log New Entry'}
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sleep_start" className="block text-sm font-medium text-gray-700 mb-2">
                  <Moon className="inline h-4 w-4 mr-1" />
                  Bedtime
                </label>
                <input
                  type="datetime-local"
                  id="sleep_start"
                  value={formData.sleep_start}
                  onChange={(e) => setFormData({ ...formData, sleep_start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="sleep_end" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Wake Time
                </label>
                <input
                  type="datetime-local"
                  id="sleep_end"
                  value={formData.sleep_end}
                  onChange={(e) => setFormData({ ...formData, sleep_end: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-teal-50 rounded-lg">
              <div className="text-sm font-medium text-teal-900">
                Total Sleep Duration: <span className="text-lg">{calculateDuration()}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Quality: {formData.quality}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                style={{
                  background: `linear-gradient(to right, rgb(20, 184, 166) 0%, rgb(20, 184, 166) ${((formData.quality - 1) / 9) * 100}%, rgb(229, 231, 235) ${((formData.quality - 1) / 9) * 100}%, rgb(229, 231, 235) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div>
              <label htmlFor="interruptions" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Interruptions
              </label>
              <input
                type="number"
                id="interruptions"
                value={formData.interruptions}
                onChange={(e) => setFormData({ ...formData, interruptions: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min="0"
                required
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Felt Rested Upon Waking</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, felt_rested: !formData.felt_rested })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.felt_rested ? 'bg-teal-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.felt_rested ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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
                placeholder="Dreams, sleep environment, disturbances..."
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
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
            <EmptyState category="sleep" icon={<Moon className="h-8 w-8 text-gray-400" />} />
          ) : (
            <div className="space-y-4">
              {history.map((log) => {
                const duration = log.duration_minutes
                  ? `${Math.floor(log.duration_minutes / 60)}h ${log.duration_minutes % 60}m`
                  : 'N/A';
                return (
                  <div
                    key={log.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDateTime(log.sleep_start)} → {formatDateTime(log.sleep_end)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Duration: {duration}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(log as SleepFormData & { id: string })}
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
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Quality:</span>
                        <span className="ml-1 font-medium">{log.quality}/10</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Interruptions:</span>
                        <span className="ml-1 font-medium">{log.interruptions}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Rested:</span>
                        <span className="ml-1 font-medium">{log.felt_rested ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    {log.notes && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
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
