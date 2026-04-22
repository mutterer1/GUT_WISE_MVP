import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  Pencil,
  Save,
  Tag,
  Utensils,
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LogPageShell from '../components/LogPageShell';
import LogModeTabs from '../components/LogModeTabs';
import FoodAutocompleteInput from '../components/FoodAutocompleteInput';
import { useLogCrud } from '../hooks/useLogCrud';
import { type FoodSuggestion } from '../data/foodSuggestions';
import { replaceFoodLogItemsForLog } from '../services/foodLogNormalizationService';
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
    buildInsertPayload: (data, userId) => ({
      user_id: userId,
      logged_at: data.logged_at,
      meal_type: data.meal_type,
      food_items: data.food_items,
      portion_size: data.portion_size,
      tags: data.tags,
      notes: data.notes || null,
    }),
    buildUpdatePayload: (data) => ({
      logged_at: data.logged_at,
      meal_type: data.meal_type,
      food_items: data.food_items,
      portion_size: data.portion_size,
      tags: data.tags,
      notes: data.notes || null,
    }),
    onAfterCreate: async ({ entryId, userId, formData: savedFormData }) => {
      await replaceFoodLogItemsForLog({
        userId,
        foodLogId: entryId,
        foodItems: savedFormData.food_items,
      });
    },
    onAfterUpdate: async ({ entryId, userId, formData: savedFormData }) => {
      await replaceFoodLogItemsForLog({
        userId,
        foodLogId: entryId,
        foodItems: savedFormData.food_items,
      });
    },
  });

  useEffect(() => {
    if (editingId && hasNonDefaultDetails(formData)) {
      setShowDetails(true);
    }
  }, [editingId, formData]);

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
      food_items: [...formData.food_items, { name: foodItemInput.trim() }],
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
      food_items: formData.food_items.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const toggleTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tag)
        ? formData.tags.filter((item) => item !== tag)
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
      subtitle="Log the meal first, then add digestive context only when it improves the signal."
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

          <form onSubmit={handleFormSubmit} className="space-y-6">
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
                  Anchor the meal to the right point in the day before adding detail.
                </p>
              </div>

              <div className="surface-intelligence rounded-[24px] p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                  Meal snapshot
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)] capitalize">
                  {formData.meal_type}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Capture what you ate first. Portion, tags, and notes can help explain digestive
                  response later.
                </p>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[28px] p-4 sm:p-5">
              <div className="mb-4">
                <label className="field-label">Meal Type</label>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {mealTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, meal_type: type.value })}
                    className={[
                      'rounded-[22px] border p-4 transition-smooth',
                      formData.meal_type === type.value
                        ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)]'
                        : 'border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    <Utensils
                      className={[
                        'mx-auto mb-2 h-5 w-5',
                        formData.meal_type === type.value
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
              <div className="mb-4">
                <label className="field-label">Food Items</label>
                <p className="field-help mt-1">
                  Add the meal components. Autocomplete can help keep entries consistent.
                </p>
              </div>

              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <FoodAutocompleteInput
                  value={foodItemInput}
                  onChange={setFoodItemInput}
                  onSelect={selectSuggestion}
                  onSubmit={addFoodItem}
                />
                <Button type="button" variant="secondary" onClick={addFoodItem}>
                  Add
                </Button>
              </div>

              {formData.food_items.length > 0 && (
                <div className="space-y-2">
                  {formData.food_items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                          {item.name}
                        </span>

                        {item.estimated_calories !== undefined && item.estimated_calories > 0 && (
                          <span className="rounded-full border border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent-primary)]">
                            ~{item.estimated_calories} cal
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFoodItem(index)}
                        className="text-sm text-[var(--color-text-tertiary)] transition-smooth hover:text-[var(--color-danger)]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {totalEstimatedCalories > 0 && (
                    <div className="flex items-center justify-end px-1 pt-1">
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        Est. total:
                        <span className="ml-1 font-medium text-[var(--color-text-primary)]">
                          {totalEstimatedCalories} cal
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              )}
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
                  <div>
                    <label className="field-label mb-3 block">Portion Size</label>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {portionSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFormData({ ...formData, portion_size: size })}
                          className={[
                            'rounded-[20px] border px-3 py-3 text-sm font-medium transition-smooth',
                            formData.portion_size === size
                              ? 'border-[rgba(84,160,255,0.34)] bg-[rgba(84,160,255,0.12)] text-[var(--color-text-primary)]'
                              : 'border-white/8 bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-white/14 hover:bg-white/[0.04]',
                          ].join(' ')}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="field-label mb-3 block">Digestive Tags</label>

                    <div className="flex flex-wrap gap-2">
                      {digestiveTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={[
                            'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth',
                            formData.tags.includes(tag)
                              ? 'border-[rgba(84,160,255,0.24)] bg-[rgba(84,160,255,0.10)] text-[var(--color-accent-primary)]'
                              : 'border-white/8 bg-white/[0.02] text-[var(--color-text-tertiary)] hover:border-white/14 hover:bg-white/[0.04] hover:text-[var(--color-text-secondary)]',
                          ].join(' ')}
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="field-label mb-2 block">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      placeholder="Location, cravings, mood, unusual reactions..."
                      className="input-base min-h-[112px] w-full resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button type="submit" disabled={saving || formData.food_items.length === 0} size="lg">
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
              category="food"
              icon={<Utensils className="h-8 w-8 text-[var(--color-text-tertiary)]" />}
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
                    className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 transition-smooth hover:border-white/14 hover:bg-white/[0.04] sm:p-5"
                  >
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-medium text-[var(--color-text-primary)]">
                          {formatDateTime(log.logged_at)}
                        </div>
                        <div className="mt-1 text-xs capitalize text-[var(--color-text-tertiary)]">
                          {log.meal_type} · {log.portion_size}
                          {logCalories > 0 ? ` · ${logCalories} cal` : ''}
                        </div>
                      </div>

                      <div className="flex gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => handleEdit(log as FoodFormData & { id: string })}
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

                    {log.food_items?.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {log.food_items.map((item, idx) => (
                          <span
                            key={`${item.name}-${idx}`}
                            className="inline-flex items-center rounded-full border border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent-primary)]"
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {log.tags?.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {log.tags.map((tag, idx) => (
                          <span
                            key={`${tag}-${idx}`}
                            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]"
                          >
                            <Tag className="mr-1 h-3 w-3 text-[var(--color-text-tertiary)]" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {log.notes && (
                      <div className="rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
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
