import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, Clock, Activity, Utensils, Tag, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import FoodAutocompleteInput from '../components/FoodAutocompleteInput';
import { useLogCrud } from '../hooks/useLogCrud';
import { type FoodSuggestion } from '../data/foodSuggestions';
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

function hasNonDefaultDetails(formData: FoodFormData): boolean {
  return (
    formData.portion_size !== 'Medium' ||
    formData.tags.length > 0 ||
    formData.notes.trim().length > 0
  );
}

export default function FoodLog() {
  const [searchParams] = useSearchParams();
  const [foodItemInput, setFoodItemInput] = useState('');
  const [showDetails, setShowDetails] = useState(false);

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

  useEffect(() => {
    if (editingId && hasNonDefaultDetails(formData)) {
      setShowDetails(true);
    }
  }, [editingId]);

  const resetForm = () => {
    baseResetForm();
    setFoodItemInput('');
    setShowDetails(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    setFoodItemInput('');
  };

  const addFoodItem = () => {
    if (!foodItemInput.trim()) return;

    setFormData({
      ...formData,
      food_items: [
        ...formData.food_items,
        { name: foodItemInput.trim() },
      ],
    });

    setFoodItemInput('');
  };

  const selectSuggestion = (suggestion: FoodSuggestion) => {
    setFormData({
      ...formData,
      food_items: [
        ...formData.food_items,
        { name: suggestion.name, estimated_calories: suggestion.calories },
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
      subtitle="Log quickly. Details are optional."
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

          <form onSubmit={handleFormSubmit} className="space-y-6">
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
              <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
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
                    className={`rounded-xl border-2 p-4 transition-all ${
                      formData.meal_type === type.value
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 shadow-sm'
                        : 'border-neutral-border dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    <Utensils className={`mx-auto mb-2 h-5 w-5 ${formData.meal_type === type.value ? 'text-brand-500' : 'text-neutral-muted dark:text-dark-muted'}`} />
                    <div className="text-body-sm font-medium text-neutral-text dark:text-dark-text">
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                Food Items
              </label>

              <div className="mb-3 flex gap-2">
                <FoodAutocompleteInput
                  value={foodItemInput}
                  onChange={setFoodItemInput}
                  onSelect={selectSuggestion}
                  onSubmit={addFoodItem}
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
                      className="flex items-center justify-between rounded-xl bg-neutral-bg dark:bg-dark-bg border border-neutral-border dark:border-dark-border px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-body-sm font-medium text-neutral-text dark:text-dark-text">
                          {item.name}
                        </span>
                        {item.estimated_calories !== undefined && item.estimated_calories > 0 && (
                          <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs text-brand-500 dark:text-brand-300">
                            ~{item.estimated_calories} cal
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFoodItem(index)}
                        className="text-body-sm text-neutral-muted dark:text-dark-muted hover:text-signal-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {totalEstimatedCalories > 0 && (
                    <div className="flex items-center justify-end px-1 pt-1">
                      <span className="text-xs text-neutral-muted dark:text-dark-muted">
                        Est. total:
                        <span className="ml-1 font-medium text-neutral-text dark:text-dark-text">
                          {totalEstimatedCalories} cal
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              )}
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
                  <div>
                    <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
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
                          className={`rounded-xl border-2 p-3 transition-all text-body-sm font-medium ${
                            formData.portion_size === size
                              ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/10 text-neutral-text dark:text-dark-text shadow-sm'
                              : 'border-neutral-border dark:border-dark-border text-neutral-text dark:text-dark-text hover:border-brand-300 dark:hover:border-brand-700'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Digestive Tags
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {digestiveTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                            formData.tags.includes(tag)
                              ? 'border-brand-500 bg-brand-500/10 text-brand-500 dark:text-brand-300'
                              : 'border-neutral-border dark:border-dark-border text-neutral-muted dark:text-dark-muted hover:border-brand-300 dark:hover:border-brand-700 hover:text-neutral-text dark:hover:text-dark-text'
                          }`}
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </button>
                      ))}
                    </div>
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
                      placeholder="Location, cravings, mood, unusual reactions..."
                      className="w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-neutral-muted/50 dark:placeholder:text-dark-muted/50 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving || formData.food_items.length === 0} size="lg">
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
            <EmptyState
              category="food"
              icon={<Utensils className="h-8 w-8 text-neutral-muted dark:text-dark-muted" />}
            />
          ) : (
            <div className="space-y-3">
              {history.map((log) => {
                const logCalories = (log.food_items || []).reduce(
                  (sum, item) => sum + (item.estimated_calories || 0),
                  0
                );

                return (
                  <div
                    key={log.id}
                    className="rounded-xl border border-neutral-border dark:border-dark-border p-4 transition-colors hover:border-brand-300 dark:hover:border-brand-700"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="text-body-sm font-medium text-neutral-text dark:text-dark-text">
                          {formatDateTime(log.logged_at)}
                        </div>
                        <div className="mt-0.5 text-xs capitalize text-neutral-muted dark:text-dark-muted">
                          {log.meal_type} &middot; {log.portion_size}
                          {logCalories > 0 ? ` \u00b7 ${logCalories} cal` : ''}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(log as FoodFormData & { id: string })}
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

                    {log.food_items?.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {log.food_items.map((item, idx) => (
                          <span
                            key={`${item.name}-${idx}`}
                            className="inline-flex items-center rounded-full bg-brand-500/8 dark:bg-brand-500/10 border border-brand-500/15 px-2.5 py-1 text-xs text-brand-500 dark:text-brand-300"
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {log.tags?.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {log.tags.map((tag, idx) => (
                          <span
                            key={`${tag}-${idx}`}
                            className="inline-flex items-center rounded-full bg-neutral-bg dark:bg-dark-bg border border-neutral-border dark:border-dark-border px-2.5 py-1 text-xs text-neutral-muted dark:text-dark-muted"
                          >
                            <Tag className="mr-1 h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {log.notes && (
                      <div className="mt-3 rounded-lg bg-neutral-bg dark:bg-dark-bg px-3 py-2 text-body-sm text-neutral-muted dark:text-dark-muted">
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
