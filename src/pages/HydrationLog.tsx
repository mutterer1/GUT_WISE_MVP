import { Save, Clock, Activity, Droplet } from 'lucide-react';
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
        newIcon={<Activity className="h-4 w-4 mr-2" />}
        historyIcon={<Clock className="h-4 w-4 mr-2" />}
      />

      {!showHistory ? (
        <Card>
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
                <Droplet className="inline h-4 w-4 mr-1" />
                Beverage Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {beverageTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleBeverageTypeChange(type.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.beverage_type === type.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Droplet className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-sm font-medium text-gray-900">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick Amount (ml)
              </label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount_ml: amount })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.amount_ml === amount
                        ? 'border-teal-500 bg-teal-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">{amount}</div>
                  </button>
                ))}
              </div>
              <label htmlFor="amount_ml" className="block text-sm font-medium text-gray-700 mb-2">
                Or Enter Custom Amount (ml)
              </label>
              <input
                type="number"
                id="amount_ml"
                value={formData.amount_ml}
                onChange={(e) => setFormData({ ...formData, amount_ml: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min="1"
                required
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Contains Caffeine</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, caffeine_content: !formData.caffeine_content })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.caffeine_content ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.caffeine_content ? 'translate-x-6' : 'translate-x-1'
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
                placeholder="Additional details..."
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
          {history.length === 0 ? (
            <EmptyState category="hydration" icon={<Droplet className="h-8 w-8 text-gray-400" />} />
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
                        {log.beverage_type} • {log.amount_ml}ml
                        {log.caffeine_content && ' • Contains Caffeine'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(log as HydrationFormData & { id: string })}
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
