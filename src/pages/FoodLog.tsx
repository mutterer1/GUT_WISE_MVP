import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, Clock, Activity, Utensils, Tag } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import { useLogCrud } from '../hooks/useLogCrud';
import { estimateCalories } from '../utils/calorieEstimator';
import { formatDateTime } from '../utils/dateFormatters';

interface FoodItem {
  name: string;
  estimated_calories?: number;
}

interface FoodFormData {
  id?: string;
  logged_at: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: FoodItem[];
  portion_size: string;
  tags: string[];
  notes: string;
}

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
] as const;

const portionSizes = ['Small', 'Medium', 'Large', 'Extra Large'];

const digestiveTags = [
  'Dairy',
  'Gluten',
  'Spicy',
  'Fried',
  'High Fiber',
  'Low Fiber',
  'Caffeine',
  'Sugar',
  'Artificial Sweetener',
  'High Fat',
  'FODMAP',
  'Alcohol',
] as const;

export default function FoodLog() {
  const [searchParams] = useSearchParams();
  const [foodItemInput, setFoodItemInput] = useState('');

  const getMealTypeFromParam = (): FoodFormData['meal_type'] => {
    const mealParam = searchParams.get('meal');
    if (
      mealParam === 'breakfast' ||
      mealParam === 'lunch' ||
      mealParam === 'dinner' ||
      mealParam === 'snack'
    ) {
      return mealParam;
    }
    return 'lunch';
  };

  const initialMealType = getMealTypeFromParam();

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
    resetForm: baseResetForm,
  } = useLogCrud<FoodFormData>({
    table: 'food_logs',
    logType: 'food',
    defaultValues: {
      meal_type: initialMealType,
      food_items: [],
      portion_size: 'Medium',
      tags: [],
      notes: '',
    },
    buildInsertPayload: (formData, userId) => ({
      user_id: userId,
      logged_at: formData.logged_at,
      meal_type: formData.meal_type,
      food_items: formData.food_items,
      portion_size: formData.portion_size,
      tags: formData.tags,
      notes: formData.notes || null,
    }),
    buildUpdatePayload: (formData) => ({
      logged_at: formData.logged_at,
      meal_type: formData.meal_type,
      food_items: formData.food_items,
      portion_size: formData.portion_size,
      tags: formData.tags,
      notes: formData.notes || null,
    }),
  });

  const resetForm = () => {
    baseResetForm();
    setFoodItemInput('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    setFoodItemInput('');
  };

  const addFoodItem = () => {
    if (!foodItemInput.trim()) return;

    const itemName = foodItemInput.trim();
    const estimate = estimateCalories(itemName);

    setFormData({
      ...formData,
      food_items: [
        ...formData.food_items,
        {
          name: itemName,
          estimated_calories: estimate.calories,
        },
      ],
    });

    setFoodItemInput('');
  };

  const removeFoodItem = (index: number) => {
    setFormData({
      ...formData,
      food_items: formData.food_items.filter((_, i) => i !== index),
    });
  };

  const toggleTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tag)
        ? formData.tags.filter((t) => t !== tag)
        : [...formData.tags, tag],
    });
  };

  const totalEstimatedCalories = formData.food_items.reduce(
    (sum, item) => sum + (item.estimated_calories || 0),
    0
  );

  return (
    <LogPageShell
      title="Food Intake Log"
      subtitle="Track meals, snacks, and dietary patterns"
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

          <form onSubmit={handleFormSubmit} className="space-y-6">
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
                Meal Type
              </label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {mealTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        meal_type: type.value,
                      })
                    }
                    className={`rounded-lg border-2 p-4 transition-all ${
                      formData.meal_type === type.value
                        ? 'border-teal-500 bg-teal-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Utensils className="mx-auto mb-2 h-6 w-6 text-gray-700" />
                    <div className="text-sm font-medium text-gray-900">
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Food Items
              </label>

              <div className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={foodItemInput}
                  onChange={(e) => setFoodItemInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFoodItem();
                    }
                  }}
                  placeholder="Add food item..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
                <Button type="button" onClick={addFoodItem}>
                  Add
                </Button>
              </div>

              {formData.food_items.length > 0 && (
                <div className="space-y-2">
                  {formData.food_items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {item.name}
                          </span>
                          {item.estimated_calories !== undefined && (
                            <span className="rounded bg-teal-100 px-2 py-1 text-xs text-teal-800">
                              {item.estimated_calories} cal
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFoodItem(index)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Portion Size
              </label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {portionSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, portion_size: size })
                    }
                    className={`rounded-lg border-2 p-3 transition-all ${
                      formData.portion_size === size
                        ? 'border-teal-500 bg-teal-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {size}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Digestive Tags
              </label>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {digestiveTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-lg border-2 p-3 text-sm transition-all ${
                      formData.tags.includes(tag)
                        ? 'border-orange-500 bg-orange-50 text-gray-900 shadow-md dark:border-dark-border text-gray-900 dark:hover:border-dark-border text-gray-900'
                        : 'border-gray-200 hover:hover:border-gray-300 dark:border-gray-300 dark:text-gray-900 dark:hover:border-gray-300'
                    }`}
                  >
                    <span className="inline-flex items-center">
                      <Tag className="mr-1 h-3.5 w-3.5" />
                      {tag}
                    </span>
                  </button>
                ))}
              </div>

              {formData.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800"
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder="Location, cravings, mood, restaurant, unusual reactions..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {formData.food_items.length > 0 && (
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                <p className="text-sm text-teal-700">
                  <span className="font-semibold">Total Estimated Calories:</span>{' '}
                  {totalEstimatedCalories} cal
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={saving || formData.food_items.length === 0}>
                <Save className="mr-2 inline h-4 w-4" />
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
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Entry History</h2>

          {history.length === 0 ? (
            <EmptyState
              category="food"
              icon={<Utensils className="h-8 w-8 text-gray-400" />}
            />
          ) : (
            <div className="space-y-4">
              {history.map((log) => {
                const logCalories = (log.food_items || []).reduce(
                  (sum, item) => sum + (item.estimated_calories || 0),
                  0
                );

                return (
                  <div
                    key={log.id}
                    className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDateTime(log.logged_at)}
                        </div>
                        <div className="mt-1 text-xs capitalize text-gray-900">
                          {log.meal_type} • {log.portion_size}
                          {logCalories > 0 ? ` • ${logCalories} cal` : ''}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(log as FoodFormData & { id: string })}
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

                    {log.food_items?.length > 0 && (
                      <div className="mb-3">
                        <div className="mb-1 text-xs text-gray-500">Foods:</div>
                        <div className="flex flex-wrap gap-1">
                          {log.food_items.map((item, idx) => (
                            <span
                              key={`${item.name}-${idx}`}
                              className="inline-flex items-center rounded-full bg-teal-600 px-2 py-1 text-xs text-teal-800"
                            >
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.tags?.length > 0 && (
                      <div className="mb-3">
                        <div className="mb-1 text-xs text-gray-900">Tags:</div>
                        <div className="flex flex-wrap gap-1">
                          {log.tags.map((tag, idx) => (
                            <span
                              key={`${tag}-${idx}`}
                              className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800"
                            >
                              <Tag className="mr-1 h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.notes && (
                      <div className="mt-3 rounded bg-gray-50 p-2 text-sm text-gray-600">
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
