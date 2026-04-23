import { supabase } from '../lib/supabase';
import type { CanonicalEvent } from '../types/canonicalEvents';
import type { UserDailyFeatures } from '../types/dailyFeatures';
import type { UserBaselineSet } from '../types/baselines';
import type {
  FoodReferenceIngredientRow,
  FoodReferenceItemRow,
  FoodLogItemIngredientRow,
  FoodLogItemRow,
  IngredientReferenceItemRow,
  MedicationReferenceItemRow,
} from '../types/intelligence';
import {
  normalizeBMEvent,
  normalizeSymptomEvent,
  normalizeFoodEvent,
  normalizeHydrationEvent,
  normalizeSleepEvent,
  normalizeStressEvent,
  normalizeMedicationEvent,
  normalizeMenstrualCycleEvent,
  normalizeExerciseEvent,
  type EnrichedFoodLogRow,
  type EnrichedMedicationLogRow,
} from '../lib/canonicalEvents';
import { buildDailyFeatures } from '../lib/dailyFeatures';
import { computeUserBaselines } from '../lib/baselines';

export interface AssembledInsightInputs {
  dailyFeatures: UserDailyFeatures[];
  baselines: UserBaselineSet;
}

type EnrichedFoodIngredientRow = FoodLogItemIngredientRow & {
  ingredient_reference?: IngredientReferenceItemRow | null;
};

type EnrichedFoodReferenceIngredientRow = FoodReferenceIngredientRow & {
  ingredient_reference?: IngredientReferenceItemRow | null;
};

type EnrichedFoodItemRow = FoodLogItemRow & {
  food_reference?: FoodReferenceItemRow | null;
  normalized_ingredients?: EnrichedFoodIngredientRow[];
  reference_ingredients?: EnrichedFoodReferenceIngredientRow[];
};

type EnrichedMedicationRow = EnrichedMedicationLogRow;

function lookbackDateISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function fetchTable<T>(
  table: string,
  userId: string,
  since: string
): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', since)
    .order('logged_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
  return (data ?? []) as T[];
}

async function fetchRowsByIds<T>(
  table: string,
  column: string,
  ids: string[]
): Promise<T[]> {
  const uniqueIds = [...new Set(ids.filter((id) => id.length > 0))];
  if (uniqueIds.length === 0) return [];

  const { data, error } = await supabase.from(table).select('*').in(column, uniqueIds);

  if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
  return (data ?? []) as T[];
}

async function fetchEnrichedFoodRows(
  userId: string,
  since: string
): Promise<EnrichedFoodLogRow[]> {
  const foodRows = await fetchTable<EnrichedFoodLogRow>('food_logs', userId, since);
  const foodLogIds = foodRows
    .map((row) => row.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  if (foodLogIds.length === 0) {
    return foodRows;
  }

  const foodLogItems = await fetchRowsByIds<FoodLogItemRow>(
    'food_log_items',
    'food_log_id',
    foodLogIds
  );

  const foodLogItemIds = foodLogItems
    .map((row) => row.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const normalizedFoodIds = foodLogItems
    .map((row) => row.normalized_food_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const ingredientRows = await fetchRowsByIds<FoodLogItemIngredientRow>(
    'food_log_item_ingredients',
    'food_log_item_id',
    foodLogItemIds
  );

  const foodReferences = await fetchRowsByIds<FoodReferenceItemRow>(
    'food_reference_items',
    'id',
    normalizedFoodIds
  );

  const foodReferenceIngredientRows = await fetchRowsByIds<FoodReferenceIngredientRow>(
    'food_reference_ingredients',
    'food_reference_id',
    normalizedFoodIds
  );

  const ingredientReferenceIds = ingredientRows
    .map((row) => row.ingredient_reference_id)
    .concat(foodReferenceIngredientRows.map((row) => row.ingredient_reference_id))
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const ingredientReferences = await fetchRowsByIds<IngredientReferenceItemRow>(
    'ingredient_reference_items',
    'id',
    ingredientReferenceIds
  );

  const ingredientReferenceById = new Map(
    ingredientReferences.map((row) => [row.id, row])
  );
  const foodReferenceById = new Map(foodReferences.map((row) => [row.id, row]));
  const referenceIngredientsByFoodReferenceId = new Map<
    string,
    EnrichedFoodReferenceIngredientRow[]
  >();

  const ingredientsByFoodLogItemId = new Map<
    string,
    EnrichedFoodIngredientRow[]
  >();

  for (const ingredientRow of ingredientRows) {
    const current = ingredientsByFoodLogItemId.get(ingredientRow.food_log_item_id) ?? [];
    current.push({
      ...ingredientRow,
      ingredient_reference: ingredientRow.ingredient_reference_id
        ? ingredientReferenceById.get(ingredientRow.ingredient_reference_id) ?? null
        : null,
    });
    ingredientsByFoodLogItemId.set(ingredientRow.food_log_item_id, current);
  }

  for (const referenceIngredientRow of foodReferenceIngredientRows) {
    const current =
      referenceIngredientsByFoodReferenceId.get(referenceIngredientRow.food_reference_id) ?? [];
    current.push({
      ...referenceIngredientRow,
      ingredient_reference: ingredientReferenceById.get(
        referenceIngredientRow.ingredient_reference_id
      ) ?? null,
    });
    referenceIngredientsByFoodReferenceId.set(
      referenceIngredientRow.food_reference_id,
      current
    );
  }

  for (const [foodReferenceId, rows] of referenceIngredientsByFoodReferenceId) {
    rows.sort((left, right) => {
      const leftRank = left.prominence_rank ?? Number.MAX_SAFE_INTEGER;
      const rightRank = right.prominence_rank ?? Number.MAX_SAFE_INTEGER;
      if (leftRank !== rightRank) return leftRank - rightRank;
      return left.created_at.localeCompare(right.created_at);
    });
    referenceIngredientsByFoodReferenceId.set(foodReferenceId, rows);
  }

  const foodItemsByFoodLogId = new Map<string, EnrichedFoodItemRow[]>();

  for (const foodLogItem of [...foodLogItems].sort((a, b) => {
    const orderA = a.consumed_order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.consumed_order ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  })) {
    const current = foodItemsByFoodLogId.get(foodLogItem.food_log_id) ?? [];
    current.push({
      ...foodLogItem,
      food_reference: foodLogItem.normalized_food_id
        ? foodReferenceById.get(foodLogItem.normalized_food_id) ?? null
        : null,
      normalized_ingredients: ingredientsByFoodLogItemId.get(foodLogItem.id) ?? [],
      reference_ingredients: foodLogItem.normalized_food_id
        ? referenceIngredientsByFoodReferenceId.get(foodLogItem.normalized_food_id) ?? []
        : [],
    });
    foodItemsByFoodLogId.set(foodLogItem.food_log_id, current);
  }

  return foodRows.map((row) => ({
    ...row,
    normalized_items: row.id ? foodItemsByFoodLogId.get(row.id) ?? [] : [],
  }));
}

async function fetchEnrichedMedicationRows(
  userId: string,
  since: string
): Promise<EnrichedMedicationRow[]> {
  const medicationRows = await fetchTable<EnrichedMedicationRow>(
    'medication_logs',
    userId,
    since
  );

  const normalizedMedicationIds = medicationRows
    .map((row) => row.normalized_medication_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  if (normalizedMedicationIds.length === 0) {
    return medicationRows;
  }

  const medicationReferences = await fetchRowsByIds<MedicationReferenceItemRow>(
    'medication_reference_items',
    'id',
    normalizedMedicationIds
  );

  const medicationReferenceById = new Map(
    medicationReferences.map((row) => [row.id, row])
  );

  return medicationRows.map((row) => ({
    ...row,
    medication_reference: row.normalized_medication_id
      ? medicationReferenceById.get(row.normalized_medication_id) ?? null
      : null,
  }));
}

export async function assembleRankedInsightInputs(
  userId: string,
  lookbackDays = 90
): Promise<AssembledInsightInputs | null> {
  const since = lookbackDateISO(lookbackDays);

  const [bmRows, symptomRows, foodRows, hydrationRows, sleepRows, stressRows, medicationRows, menstrualRows, exerciseRows] =
    await Promise.all([
      fetchTable<Parameters<typeof normalizeBMEvent>[0]>('bm_logs', userId, since),
      fetchTable<Parameters<typeof normalizeSymptomEvent>[0]>('symptom_logs', userId, since),
      fetchEnrichedFoodRows(userId, since),
      fetchTable<Parameters<typeof normalizeHydrationEvent>[0]>('hydration_logs', userId, since),
      fetchTable<Parameters<typeof normalizeSleepEvent>[0]>('sleep_logs', userId, since),
      fetchTable<Parameters<typeof normalizeStressEvent>[0]>('stress_logs', userId, since),
      fetchEnrichedMedicationRows(userId, since),
      fetchTable<Parameters<typeof normalizeMenstrualCycleEvent>[0]>('menstrual_cycle_logs', userId, since),
      fetchTable<Parameters<typeof normalizeExerciseEvent>[0]>('exercise_logs', userId, since),
    ]);

  const allEvents: CanonicalEvent[] = [
    ...bmRows.map(normalizeBMEvent),
    ...symptomRows.map(normalizeSymptomEvent),
    ...foodRows.map(normalizeFoodEvent),
    ...hydrationRows.map(normalizeHydrationEvent),
    ...sleepRows.map(normalizeSleepEvent),
    ...stressRows.map(normalizeStressEvent),
    ...medicationRows.map(normalizeMedicationEvent),
    ...menstrualRows.map(normalizeMenstrualCycleEvent),
    ...exerciseRows.map(normalizeExerciseEvent),
  ];

  if (allEvents.length === 0) return null;

  const dailyFeatures = buildDailyFeatures(allEvents);
  const baselines = computeUserBaselines(dailyFeatures);

  if (!baselines) return null;

  return { dailyFeatures, baselines };
}
