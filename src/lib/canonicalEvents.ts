import type {
  BMLogRow,
  SymptomLogRow,
  FoodLogRow,
  HydrationLogRow,
  SleepLogRow,
  StressLogRow,
  MedicationLogRow,
  MenstrualCycleLogRow,
  ExerciseLogRow,
} from '../types/logs';
import type {
  FoodReferenceIngredientRow,
  FoodNutritionSnapshot,
  FoodLogItemIngredientRow,
  FoodLogItemRow,
  FoodReferenceItemRow,
  IngredientReferenceItemRow,
  MedicationReferenceItemRow,
} from '../types/intelligence';
import type { CanonicalEvent, EventType } from '../types/canonicalEvents';
import { EVENT_TYPE_TO_SOURCE_TABLE } from '../types/canonicalEvents';
import { deriveFoodIntelligence } from './foodIntelligence';
import { deriveMedicationIntelligence } from './medicationIntelligence';
import type { DerivedFoodIntelligence } from './foodIntelligence';
import type { IngredientSignalKey } from '../data/ingredientCatalog';

function numericAvg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function deriveLocalDate(occurredAt: string): string {
  const iso = occurredAt.split('T')[0];
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  try {
    return new Date(occurredAt).toISOString().split('T')[0];
  } catch {
    return '1970-01-01';
  }
}

function deriveLocalHour(occurredAt: string): number {
  try {
    const timePart = occurredAt.split('T')[1];
    if (timePart) {
      const hour = parseInt(timePart.split(':')[0], 10);
      if (!isNaN(hour)) return hour;
    }
    return new Date(occurredAt).getUTCHours();
  } catch {
    return 0;
  }
}

interface TimestampMeta {
  local_date?: string | null;
  local_hour?: number | null;
  timezone?: string | null;
  completeness_score?: number | null;
}

function resolveTimestampFields(
  occurredAt: string,
  meta: TimestampMeta
): Pick<CanonicalEvent, 'local_date' | 'local_hour' | 'timezone' | 'completeness_score'> {
  return {
    local_date: meta.local_date ?? deriveLocalDate(occurredAt),
    local_hour: meta.local_hour ?? deriveLocalHour(occurredAt),
    timezone: meta.timezone ?? null,
    completeness_score: meta.completeness_score ?? null,
  };
}

function baseEvent(
  row: { id?: string; logged_at: string; user_id: string } & TimestampMeta,
  eventType: EventType
): Omit<CanonicalEvent, 'payload'> {
  const occurredAt = row.logged_at;
  const resolved = resolveTimestampFields(occurredAt, row);

  return {
    id: row.id ?? '',
    user_id: row.user_id,
    event_type: eventType,
    occurred_at: occurredAt,
    local_date: resolved.local_date,
    local_hour: resolved.local_hour,
    timezone: resolved.timezone,
    source_table: EVENT_TYPE_TO_SOURCE_TABLE[eventType],
    completeness_score: resolved.completeness_score,
  };
}

const FOOD_SIGNAL_KEYS: IngredientSignalKey[] = [
  'high_fodmap',
  'dairy',
  'gluten',
  'artificial_sweetener',
  'high_fat',
  'spicy',
  'caffeine_food',
  'alcohol',
  'fiber_dense',
];

interface EnrichedFoodLogItemIngredientRow extends FoodLogItemIngredientRow {
  ingredient_reference?: IngredientReferenceItemRow | null;
}

interface EnrichedFoodReferenceIngredientRow extends FoodReferenceIngredientRow {
  ingredient_reference?: IngredientReferenceItemRow | null;
}

interface EnrichedFoodLogItemRow extends FoodLogItemRow {
  food_reference?: FoodReferenceItemRow | null;
  normalized_ingredients?: EnrichedFoodLogItemIngredientRow[];
  reference_ingredients?: EnrichedFoodReferenceIngredientRow[];
}

export interface EnrichedFoodLogRow extends FoodLogRow {
  normalized_items?: EnrichedFoodLogItemRow[];
}

export interface EnrichedMedicationLogRow extends MedicationLogRow {
  medication_reference?: MedicationReferenceItemRow | null;
}

function uniqueSortedStrings(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.length > 0))].sort();
}

interface LoggedFoodItemValue {
  name: string;
  estimated_calories: number | null;
}

interface DerivedFoodNutrition {
  matched_food_reference_ids: string[];
  nutrition: FoodNutritionSnapshot;
  covered_item_count: number;
  missing_item_count: number;
  source_labels: string[];
}

interface DerivedFoodSignalBurden {
  food_item_count_total: number;
  structured_food_item_count: number;
  structured_ingredient_count: number;
  structured_food_coverage_ratio: number | null;
  ingredient_signal_confidence_avg: number | null;
  signal_burdens: Record<IngredientSignalKey, number>;
}

function isIngredientSignalKey(value: string): value is IngredientSignalKey {
  return FOOD_SIGNAL_KEYS.includes(value as IngredientSignalKey);
}

function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function emptySignalScoreMap(): Record<IngredientSignalKey, number> {
  return {
    high_fodmap: 0,
    dairy: 0,
    gluten: 0,
    artificial_sweetener: 0,
    high_fat: 0,
    spicy: 0,
    caffeine_food: 0,
    alcohol: 0,
    fiber_dense: 0,
  };
}

function readLoggedFoodItems(foodItems: unknown): LoggedFoodItemValue[] {
  if (!Array.isArray(foodItems)) return [];

  const results: LoggedFoodItemValue[] = [];

  for (const item of foodItems) {
    if (typeof item === 'string' && item.trim().length > 0) {
      results.push({
        name: item.trim(),
        estimated_calories: null,
      });
      continue;
    }

    if (typeof item === 'object' && item !== null) {
      const maybeName = 'name' in item ? item.name : null;
      const maybeEstimatedCalories =
        'estimated_calories' in item ? item.estimated_calories : null;

      if (typeof maybeName === 'string' && maybeName.trim().length > 0) {
        results.push({
          name: maybeName.trim(),
          estimated_calories:
            typeof maybeEstimatedCalories === 'number' && Number.isFinite(maybeEstimatedCalories)
              ? maybeEstimatedCalories
              : null,
        });
      }
    }
  }

  return results;
}

function deriveReferenceIngredientWeight(
  ingredient: EnrichedFoodReferenceIngredientRow
): number {
  if (
    typeof ingredient.ingredient_fraction === 'number' &&
    Number.isFinite(ingredient.ingredient_fraction) &&
    ingredient.ingredient_fraction > 0
  ) {
    return roundTo(clamp(ingredient.ingredient_fraction, 0.12, 1));
  }

  if (ingredient.is_primary) return 0.85;

  const rank = ingredient.prominence_rank ?? 5;
  if (rank <= 1) return 0.72;
  if (rank === 2) return 0.56;
  if (rank === 3) return 0.42;
  if (rank === 4) return 0.32;
  return 0.22;
}

function deriveReferenceIngredientConfidence(
  ingredient: EnrichedFoodReferenceIngredientRow
): number {
  if (
    typeof ingredient.ingredient_fraction === 'number' &&
    Number.isFinite(ingredient.ingredient_fraction) &&
    ingredient.ingredient_fraction > 0
  ) {
    return 0.95;
  }

  if (ingredient.is_primary) return 0.9;
  if (ingredient.prominence_rank !== null) return 0.85;
  return 0.8;
}

function deriveLoggedIngredientWeight(
  ingredient: EnrichedFoodLogItemIngredientRow
): number {
  if (
    typeof ingredient.confidence_score === 'number' &&
    Number.isFinite(ingredient.confidence_score)
  ) {
    return roundTo(clamp(ingredient.confidence_score, 0.2, 1));
  }

  if (ingredient.source_method === 'catalog_match') return 0.6;
  if (ingredient.source_method === 'manual_entry') return 0.45;
  return 0.35;
}

function deriveLoggedIngredientConfidence(
  ingredient: EnrichedFoodLogItemIngredientRow
): number {
  if (
    typeof ingredient.confidence_score === 'number' &&
    Number.isFinite(ingredient.confidence_score)
  ) {
    return clamp(ingredient.confidence_score, 0.2, 1);
  }

  if (ingredient.source_method === 'catalog_match') return 0.7;
  if (ingredient.source_method === 'manual_entry') return 0.55;
  return 0.45;
}

function getReferenceIngredientSignals(
  ingredient: EnrichedFoodReferenceIngredientRow
): IngredientSignalKey[] {
  return (ingredient.ingredient_reference?.default_signals ?? []).filter(
    isIngredientSignalKey
  );
}

function getLoggedIngredientSignals(
  ingredient: EnrichedFoodLogItemIngredientRow
): IngredientSignalKey[] {
  const sourceSignals =
    ingredient.gut_signals_override.length > 0
      ? ingredient.gut_signals_override
      : ingredient.ingredient_reference?.default_signals ?? [];

  return sourceSignals.filter(isIngredientSignalKey);
}

function deriveFoodIntelligenceFromNormalizedItems(
  row: EnrichedFoodLogRow
): DerivedFoodIntelligence | null {
  const normalizedItems = row.normalized_items ?? [];
  if (normalizedItems.length === 0) return null;

  const signalCounts: Record<IngredientSignalKey, number> = {
    high_fodmap: 0,
    dairy: 0,
    gluten: 0,
    artificial_sweetener: 0,
    high_fat: 0,
    spicy: 0,
    caffeine_food: 0,
    alcohol: 0,
    fiber_dense: 0,
  };

  const foodItemNames: string[] = [];
  const matchedIngredientIds = new Set<string>();
  const ingredientSignals = new Set<IngredientSignalKey>();
  const commonGutEffects = new Set<string>();

  for (const item of normalizedItems) {
    if (item.display_name.trim().length > 0) {
      foodItemNames.push(item.display_name.trim());
    }

    const itemSignals = new Set<IngredientSignalKey>();

    const referenceIngredients = item.reference_ingredients ?? [];
    const normalizedIngredients =
      referenceIngredients.length === 0 ? item.normalized_ingredients ?? [] : [];

    if (referenceIngredients.length > 0) {
      for (const ingredient of referenceIngredients) {
        matchedIngredientIds.add(ingredient.ingredient_reference_id);

        for (const effect of ingredient.ingredient_reference?.typical_gut_reactions ?? []) {
          if (effect.trim().length > 0) {
            commonGutEffects.add(effect.trim());
          }
        }

        for (const signal of getReferenceIngredientSignals(ingredient)) {
          itemSignals.add(signal);
          ingredientSignals.add(signal);
        }
      }
    } else if (normalizedIngredients.length > 0) {
      for (const ingredient of normalizedIngredients) {
        if (ingredient.ingredient_reference_id) {
          matchedIngredientIds.add(ingredient.ingredient_reference_id);
        }

        for (const effect of ingredient.ingredient_reference?.typical_gut_reactions ?? []) {
          if (effect.trim().length > 0) {
            commonGutEffects.add(effect.trim());
          }
        }

        for (const signal of getLoggedIngredientSignals(ingredient)) {
          itemSignals.add(signal);
          ingredientSignals.add(signal);
        }
      }
    } else {
      for (const signal of (item.food_reference?.default_signals ?? []).filter(
        isIngredientSignalKey
      )) {
        itemSignals.add(signal);
        ingredientSignals.add(signal);
      }
    }

    for (const signal of itemSignals) {
      signalCounts[signal] += 1;
    }
  }

  return {
    food_item_names: uniqueSortedStrings(foodItemNames),
    matched_ingredient_ids: [...matchedIngredientIds].sort(),
    ingredient_signals: [...ingredientSignals].sort(),
    gut_trigger_load: ingredientSignals.size,
    high_fodmap_food_count: signalCounts.high_fodmap,
    dairy_food_count: signalCounts.dairy,
    gluten_food_count: signalCounts.gluten,
    artificial_sweetener_food_count: signalCounts.artificial_sweetener,
    high_fat_food_count: signalCounts.high_fat,
    spicy_food_count: signalCounts.spicy,
    caffeine_food_count: signalCounts.caffeine_food,
    alcohol_food_count: signalCounts.alcohol,
    fiber_dense_food_count: signalCounts.fiber_dense,
    common_gut_effects: [...commonGutEffects].sort(),
  };
}

function deriveFoodSignalBurdenFromNormalizedItems(
  row: EnrichedFoodLogRow
): DerivedFoodSignalBurden | null {
  const normalizedItems = row.normalized_items ?? [];
  if (normalizedItems.length === 0) return null;

  const signalBurdens = emptySignalScoreMap();
  const confidenceValues: number[] = [];
  let structuredFoodItemCount = 0;
  let structuredIngredientCount = 0;

  for (const item of normalizedItems) {
    const referenceIngredients = item.reference_ingredients ?? [];
    const normalizedIngredients =
      referenceIngredients.length === 0 ? item.normalized_ingredients ?? [] : [];
    let itemHasStructuredSignals = false;

    if (referenceIngredients.length > 0) {
      structuredFoodItemCount += 1;
      structuredIngredientCount += referenceIngredients.length;

      for (const ingredient of referenceIngredients) {
        const signals = getReferenceIngredientSignals(ingredient);
        if (signals.length === 0) continue;

        itemHasStructuredSignals = true;
        const weight = deriveReferenceIngredientWeight(ingredient);
        confidenceValues.push(deriveReferenceIngredientConfidence(ingredient));

        for (const signal of signals) {
          signalBurdens[signal] += weight;
        }
      }
    } else if (normalizedIngredients.length > 0) {
      structuredFoodItemCount += 1;
      structuredIngredientCount += normalizedIngredients.length;

      for (const ingredient of normalizedIngredients) {
        const signals = getLoggedIngredientSignals(ingredient);
        if (signals.length === 0) continue;

        itemHasStructuredSignals = true;
        const weight = deriveLoggedIngredientWeight(ingredient);
        confidenceValues.push(deriveLoggedIngredientConfidence(ingredient));

        for (const signal of signals) {
          signalBurdens[signal] += weight;
        }
      }
    } else {
      const defaultSignals = (item.food_reference?.default_signals ?? []).filter(
        isIngredientSignalKey
      );

      if (defaultSignals.length > 0) {
        structuredFoodItemCount += 1;
        confidenceValues.push(0.55);
        itemHasStructuredSignals = true;

        for (const signal of defaultSignals) {
          signalBurdens[signal] += 0.45;
        }
      }
    }

    if (!itemHasStructuredSignals) {
      continue;
    }
  }

  for (const signal of FOOD_SIGNAL_KEYS) {
    signalBurdens[signal] = roundTo(signalBurdens[signal]);
  }

  return {
    food_item_count_total: normalizedItems.length,
    structured_food_item_count: structuredFoodItemCount,
    structured_ingredient_count: structuredIngredientCount,
    structured_food_coverage_ratio:
      normalizedItems.length > 0
        ? roundTo(structuredFoodItemCount / normalizedItems.length)
        : null,
    ingredient_signal_confidence_avg: numericAvg(confidenceValues),
    signal_burdens: signalBurdens,
  };
}

function deriveFallbackFoodSignalBurden(
  row: EnrichedFoodLogRow,
  fallbackDerived: DerivedFoodIntelligence
): DerivedFoodSignalBurden | null {
  const loggedItemCount = readLoggedFoodItems(row.food_items).length;
  const signalBurdens = emptySignalScoreMap();
  const fallbackSignalCounts: Record<IngredientSignalKey, number> = {
    high_fodmap: fallbackDerived.high_fodmap_food_count,
    dairy: fallbackDerived.dairy_food_count,
    gluten: fallbackDerived.gluten_food_count,
    artificial_sweetener: fallbackDerived.artificial_sweetener_food_count,
    high_fat: fallbackDerived.high_fat_food_count,
    spicy: fallbackDerived.spicy_food_count,
    caffeine_food: fallbackDerived.caffeine_food_count,
    alcohol: fallbackDerived.alcohol_food_count,
    fiber_dense: fallbackDerived.fiber_dense_food_count,
  };

  for (const signal of fallbackDerived.ingredient_signals) {
    const signalCount = fallbackSignalCounts[signal] > 0 ? fallbackSignalCounts[signal] : 1;
    signalBurdens[signal] = roundTo(signalCount * 0.35);
  }

  const hasSignals = Object.values(signalBurdens).some((value) => value > 0);
  if (!hasSignals) return null;

  return {
    food_item_count_total: loggedItemCount,
    structured_food_item_count: 0,
    structured_ingredient_count: 0,
    structured_food_coverage_ratio: loggedItemCount > 0 ? 0 : null,
    ingredient_signal_confidence_avg: 0.25,
    signal_burdens: signalBurdens,
  };
}

function hasReferenceNutrition(reference: FoodReferenceItemRow): boolean {
  return [
    reference.calories_kcal,
    reference.protein_g,
    reference.fat_g,
    reference.carbs_g,
    reference.fiber_g,
    reference.sugar_g,
    reference.sodium_mg,
  ].some((value) => typeof value === 'number' && Number.isFinite(value));
}

function deriveFoodNutritionFromNormalizedItems(
  row: EnrichedFoodLogRow
): DerivedFoodNutrition | null {
  const normalizedItems = row.normalized_items ?? [];
  if (normalizedItems.length === 0) return null;

  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  let fiber = 0;
  let sugar = 0;
  let sodium = 0;
  let coveredItemCount = 0;
  let missingItemCount = 0;
  const confidenceValues: number[] = [];
  const matchedFoodReferenceIds = new Set<string>();
  const sourceLabels = new Set<string>();

  for (const item of normalizedItems) {
    const reference = item.food_reference;

    if (item.normalized_food_id) {
      matchedFoodReferenceIds.add(item.normalized_food_id);
    }

    if (!reference || !hasReferenceNutrition(reference)) {
      missingItemCount += 1;
      continue;
    }

    coveredItemCount += 1;
    calories += reference.calories_kcal ?? 0;
    protein += reference.protein_g ?? 0;
    fat += reference.fat_g ?? 0;
    carbs += reference.carbs_g ?? 0;
    fiber += reference.fiber_g ?? 0;
    sugar += reference.sugar_g ?? 0;
    sodium += reference.sodium_mg ?? 0;

    if (
      typeof reference.nutrition_confidence === 'number' &&
      Number.isFinite(reference.nutrition_confidence)
    ) {
      confidenceValues.push(reference.nutrition_confidence);
    }

    const sourceLabel = reference.nutrition_source_label ?? reference.source_label;
    if (typeof sourceLabel === 'string' && sourceLabel.trim().length > 0) {
      sourceLabels.add(sourceLabel.trim());
    }
  }

  return {
    matched_food_reference_ids: [...matchedFoodReferenceIds].sort(),
    nutrition: {
      serving_label: row.portion_size ?? null,
      calories_kcal: coveredItemCount > 0 ? calories : null,
      protein_g: coveredItemCount > 0 ? protein : null,
      fat_g: coveredItemCount > 0 ? fat : null,
      carbs_g: coveredItemCount > 0 ? carbs : null,
      fiber_g: coveredItemCount > 0 ? fiber : null,
      sugar_g: coveredItemCount > 0 ? sugar : null,
      sodium_mg: coveredItemCount > 0 ? sodium : null,
      confidence: numericAvg(confidenceValues),
      source_label: null,
      source_ref: null,
    },
    covered_item_count: coveredItemCount,
    missing_item_count: missingItemCount,
    source_labels: [...sourceLabels].sort(),
  };
}

function deriveFoodNutritionFromLegacyRow(row: EnrichedFoodLogRow): DerivedFoodNutrition | null {
  const loggedItems = readLoggedFoodItems(row.food_items);
  if (loggedItems.length === 0 && typeof row.calories !== 'number') return null;

  const caloriesFromItems = loggedItems.reduce(
    (sum, item) => sum + (item.estimated_calories ?? 0),
    0
  );
  const coveredItemCount = loggedItems.filter(
    (item) => typeof item.estimated_calories === 'number'
  ).length;
  const missingItemCount = Math.max(loggedItems.length - coveredItemCount, 0);
  const totalCalories =
    caloriesFromItems > 0
      ? caloriesFromItems
      : typeof row.calories === 'number' && Number.isFinite(row.calories)
        ? row.calories
        : 0;

  return {
    matched_food_reference_ids: [],
    nutrition: {
      serving_label: row.portion_size ?? null,
      calories_kcal: totalCalories > 0 ? totalCalories : null,
      protein_g: null,
      fat_g: null,
      carbs_g: null,
      fiber_g: null,
      sugar_g: null,
      sodium_mg: null,
      confidence: totalCalories > 0 ? 0.35 : null,
      source_label: totalCalories > 0 ? 'legacy_log_estimate' : null,
      source_ref: null,
    },
    covered_item_count:
      coveredItemCount > 0
        ? coveredItemCount
        : totalCalories > 0 && loggedItems.length === 0
          ? 1
          : coveredItemCount,
    missing_item_count: loggedItems.length > 0 ? missingItemCount : 0,
    source_labels: totalCalories > 0 ? ['legacy_log_estimate'] : [],
  };
}

function mergeMedicationIntelligence(
  primary: ReturnType<typeof deriveMedicationIntelligence>,
  secondary: ReturnType<typeof deriveMedicationIntelligence>
): ReturnType<typeof deriveMedicationIntelligence> {
  const mergedFamilies = uniqueSortedStrings([
    ...primary.medication_families,
    ...secondary.medication_families,
  ]);
  const mergedGutEffects = uniqueSortedStrings([
    ...primary.medication_gut_effects,
    ...secondary.medication_gut_effects,
  ]);

  return {
    matched_medication_ids: uniqueSortedStrings([
      ...primary.matched_medication_ids,
      ...secondary.matched_medication_ids,
    ]),
    medication_families: mergedFamilies as ReturnType<
      typeof deriveMedicationIntelligence
    >['medication_families'],
    medication_gut_effects: mergedGutEffects as ReturnType<
      typeof deriveMedicationIntelligence
    >['medication_gut_effects'],
    gi_risk_medication_count: Math.max(
      primary.gi_risk_medication_count,
      secondary.gi_risk_medication_count
    ),
    motility_slowing_medication_count: Math.max(
      primary.motility_slowing_medication_count,
      secondary.motility_slowing_medication_count
    ),
    motility_speeding_medication_count: Math.max(
      primary.motility_speeding_medication_count,
      secondary.motility_speeding_medication_count
    ),
    acid_suppression_medication_count: Math.max(
      primary.acid_suppression_medication_count,
      secondary.acid_suppression_medication_count
    ),
    microbiome_disruption_medication_count: Math.max(
      primary.microbiome_disruption_medication_count,
      secondary.microbiome_disruption_medication_count
    ),
    common_gut_effects: uniqueSortedStrings([
      ...primary.common_gut_effects,
      ...secondary.common_gut_effects,
    ]),
  };
}

function deriveMedicationIntelligenceFromReference(
  row: EnrichedMedicationLogRow
): ReturnType<typeof deriveMedicationIntelligence> | null {
  const reference = row.medication_reference;
  if (!reference) return null;

  const referenceNames = uniqueSortedStrings([
    reference.display_name,
    reference.generic_name,
    ...reference.brand_names,
  ]);

  const referenceContext = uniqueSortedStrings([
    reference.medication_class ?? '',
    reference.medication_type ?? '',
    reference.gut_relevance ?? '',
    reference.route ?? '',
    ...reference.common_gut_effects,
    ...reference.interaction_flags,
  ]);

  return deriveMedicationIntelligence({
    medication_name: referenceNames.join(' '),
    side_effects: row.side_effects,
    notes: referenceContext.join(' '),
  });
}

export function normalizeBMEvent(row: BMLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'bm'),
    payload: {
      bristol_type: row.bristol_type,
      urgency: row.urgency,
      incomplete_evacuation: row.incomplete_evacuation,
      blood_present: row.blood_present,
      mucus_present: row.mucus_present,
      pain_level: row.pain_level,
      difficulty_level: row.difficulty_level,
      amount: row.amount,
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeSymptomEvent(row: SymptomLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'symptom'),
    payload: {
      symptom_type: row.symptom_type,
      severity: row.severity,
      ...(row.duration_minutes != null && { duration_minutes: row.duration_minutes }),
      ...(row.location != null && { location: row.location }),
      ...(row.triggers != null && { triggers: row.triggers }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeFoodEvent(row: EnrichedFoodLogRow): CanonicalEvent {
  const fallbackDerived = deriveFoodIntelligence({
    food_items: row.food_items,
    tags: row.tags,
  });
  const normalizedDerived = deriveFoodIntelligenceFromNormalizedItems(row);
  const derived =
    normalizedDerived && normalizedDerived.ingredient_signals.length > 0
      ? {
          ...normalizedDerived,
          food_item_names: uniqueSortedStrings([
            ...normalizedDerived.food_item_names,
            ...fallbackDerived.food_item_names,
          ]),
        }
      : fallbackDerived;
  const structuredSignalBurden = deriveFoodSignalBurdenFromNormalizedItems(row);
  const fallbackSignalBurden = deriveFallbackFoodSignalBurden(row, fallbackDerived);
  const activeSignalBurden =
    structuredSignalBurden &&
    Object.values(structuredSignalBurden.signal_burdens).some((value) => value > 0)
      ? structuredSignalBurden
      : fallbackSignalBurden;
  const normalizedNutrition = deriveFoodNutritionFromNormalizedItems(row);
  const fallbackNutrition = deriveFoodNutritionFromLegacyRow(row);
  const nutrition =
    normalizedNutrition && normalizedNutrition.covered_item_count > 0
      ? normalizedNutrition
      : fallbackNutrition;
  const matchedFoodReferenceIds = uniqueSortedStrings([
    ...(normalizedNutrition?.matched_food_reference_ids ?? []),
    ...(nutrition?.matched_food_reference_ids ?? []),
  ]);

  return {
    ...baseEvent(row, 'food'),
    payload: {
      food_items: row.food_items,
      meal_type: row.meal_type,
      food_item_names: derived.food_item_names,
      matched_ingredient_ids: derived.matched_ingredient_ids,
      ...(matchedFoodReferenceIds.length > 0 && {
        matched_food_reference_ids: matchedFoodReferenceIds,
      }),
      ...(nutrition && {
        meal_calories_kcal: nutrition.nutrition.calories_kcal,
        meal_protein_g: nutrition.nutrition.protein_g,
        meal_fat_g: nutrition.nutrition.fat_g,
        meal_carbs_g: nutrition.nutrition.carbs_g,
        meal_fiber_g: nutrition.nutrition.fiber_g,
        meal_sugar_g: nutrition.nutrition.sugar_g,
        meal_sodium_mg: nutrition.nutrition.sodium_mg,
        nutrition_covered_item_count: nutrition.covered_item_count,
        nutrition_missing_item_count: nutrition.missing_item_count,
        nutrition_source_labels: nutrition.source_labels,
        nutrition_confidence_avg: nutrition.nutrition.confidence,
      }),
      ...(activeSignalBurden && {
        food_item_count_total: activeSignalBurden.food_item_count_total,
        structured_food_item_count: activeSignalBurden.structured_food_item_count,
        structured_ingredient_count: activeSignalBurden.structured_ingredient_count,
        structured_food_coverage_ratio:
          activeSignalBurden.structured_food_coverage_ratio,
        ingredient_signal_confidence_avg:
          activeSignalBurden.ingredient_signal_confidence_avg,
        gut_trigger_burden_score: roundTo(
          FOOD_SIGNAL_KEYS.reduce(
            (sum, signal) => sum + activeSignalBurden.signal_burdens[signal],
            0
          )
        ),
        high_fodmap_burden_score:
          activeSignalBurden.signal_burdens.high_fodmap,
        dairy_burden_score: activeSignalBurden.signal_burdens.dairy,
        gluten_burden_score: activeSignalBurden.signal_burdens.gluten,
        artificial_sweetener_burden_score:
          activeSignalBurden.signal_burdens.artificial_sweetener,
        high_fat_burden_score: activeSignalBurden.signal_burdens.high_fat,
        spicy_burden_score: activeSignalBurden.signal_burdens.spicy,
        caffeine_food_burden_score:
          activeSignalBurden.signal_burdens.caffeine_food,
        alcohol_food_burden_score: activeSignalBurden.signal_burdens.alcohol,
        fiber_dense_burden_score:
          activeSignalBurden.signal_burdens.fiber_dense,
      }),
      ingredient_signals: derived.ingredient_signals,
      gut_trigger_load: derived.gut_trigger_load,
      high_fodmap_food_count: derived.high_fodmap_food_count,
      dairy_food_count: derived.dairy_food_count,
      gluten_food_count: derived.gluten_food_count,
      artificial_sweetener_food_count: derived.artificial_sweetener_food_count,
      high_fat_food_count: derived.high_fat_food_count,
      spicy_food_count: derived.spicy_food_count,
      caffeine_food_count: derived.caffeine_food_count,
      alcohol_food_count: derived.alcohol_food_count,
      fiber_dense_food_count: derived.fiber_dense_food_count,
      common_gut_effects: derived.common_gut_effects,
      ...(row.tags != null && { tags: row.tags }),
      ...(row.portion_size != null && { portion_size: row.portion_size }),
      ...(row.calories != null && { calories: row.calories }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeHydrationEvent(row: HydrationLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'hydration'),
    payload: {
      amount_ml: row.amount_ml,
      beverage_type: row.beverage_type,
      ...(row.beverage_category != null && { beverage_category: row.beverage_category }),
      ...(row.caffeine_content != null && { caffeine_content: row.caffeine_content }),
      ...(row.caffeine_mg != null && { caffeine_mg: row.caffeine_mg }),
      ...(row.effective_hydration_ml != null && {
        effective_hydration_ml: row.effective_hydration_ml,
      }),
      ...(row.water_goal_contribution_ml != null && {
        water_goal_contribution_ml: row.water_goal_contribution_ml,
      }),
      ...(row.electrolyte_present != null && {
        electrolyte_present: row.electrolyte_present,
      }),
      ...(row.alcohol_present != null && { alcohol_present: row.alcohol_present }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeSleepEvent(row: SleepLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'sleep'),
    payload: {
      duration_minutes: row.duration_minutes,
      quality: row.quality,
      sleep_start: row.sleep_start,
      sleep_end: row.sleep_end,
      ...(row.interruptions != null && { interruptions: row.interruptions }),
      ...(row.felt_rested != null && { felt_rested: row.felt_rested }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeStressEvent(row: StressLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'stress'),
    payload: {
      stress_level: row.stress_level,
      ...(row.triggers != null && { triggers: row.triggers }),
      ...(row.coping_methods != null && { coping_methods: row.coping_methods }),
      ...(row.physical_symptoms != null && { physical_symptoms: row.physical_symptoms }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeMedicationEvent(row: EnrichedMedicationLogRow): CanonicalEvent {
  const fallbackDerived = deriveMedicationIntelligence({
    medication_name: row.medication_name,
    side_effects: row.side_effects,
    notes: row.notes,
  });
  const referenceDerived = deriveMedicationIntelligenceFromReference(row);
  const derived = referenceDerived
    ? mergeMedicationIntelligence(referenceDerived, fallbackDerived)
    : fallbackDerived;

  return {
    ...baseEvent(row, 'medication'),
    payload: {
      medication_name: row.medication_name,
      dosage: row.dosage,
      taken_as_prescribed: row.taken_as_prescribed,
      medication_type: row.medication_type,
      ...(row.normalized_medication_id != null && {
        normalized_medication_id: row.normalized_medication_id,
      }),
      ...(row.dose_value != null && { dose_value: row.dose_value }),
      ...(row.dose_unit != null && { dose_unit: row.dose_unit }),
      ...(row.route != null && { route: row.route }),
      ...(row.reason_for_use != null && { reason_for_use: row.reason_for_use }),
      ...(row.regimen_status != null && { regimen_status: row.regimen_status }),
      ...(row.timing_context != null && { timing_context: row.timing_context }),
      ...(row.medication_reference?.display_name != null && {
        normalized_medication_name: row.medication_reference.display_name,
      }),
      ...(row.medication_reference?.generic_name != null && {
        medication_generic_name: row.medication_reference.generic_name,
      }),
      ...(row.medication_reference?.medication_class != null && {
        medication_class: row.medication_reference.medication_class,
      }),
      ...(row.medication_reference?.rxnorm_code != null && {
        rxnorm_code: row.medication_reference.rxnorm_code,
      }),
      ...(row.medication_reference?.gut_relevance != null && {
        gut_relevance: row.medication_reference.gut_relevance,
      }),
      ...(row.medication_reference?.interaction_flags != null && {
        interaction_flags: row.medication_reference.interaction_flags,
      }),
      matched_medication_ids: derived.matched_medication_ids,
      medication_families: derived.medication_families,
      medication_gut_effects: derived.medication_gut_effects,
      gi_risk_medication_count: derived.gi_risk_medication_count,
      motility_slowing_medication_count: derived.motility_slowing_medication_count,
      motility_speeding_medication_count: derived.motility_speeding_medication_count,
      acid_suppression_medication_count: derived.acid_suppression_medication_count,
      microbiome_disruption_medication_count: derived.microbiome_disruption_medication_count,
      common_gut_effects: derived.common_gut_effects,
      ...(row.side_effects != null && { side_effects: row.side_effects }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeMenstrualCycleEvent(row: MenstrualCycleLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'menstrual_cycle'),
    payload: {
      cycle_day: row.cycle_day,
      flow_intensity: row.flow_intensity,
      ...(row.estimated_cycle_length != null && { estimated_cycle_length: row.estimated_cycle_length }),
      ...(row.pain_level != null && { pain_level: row.pain_level }),
      ...(row.symptoms != null && { symptoms: row.symptoms }),
      ...(row.mood_notes != null && { mood_notes: row.mood_notes }),
      ...(row.color != null && { color: row.color }),
      ...(row.tissue_passed != null && { tissue_passed: row.tissue_passed }),
      ...(row.ovulation_indicators != null && { ovulation_indicators: row.ovulation_indicators }),
      ...(row.basal_temp != null && { basal_temp: row.basal_temp }),
      ...(row.cervical_mucus_type != null && { cervical_mucus_type: row.cervical_mucus_type }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeExerciseEvent(row: ExerciseLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'exercise'),
    payload: {
      exercise_type: row.exercise_type,
      duration_minutes: row.duration_minutes,
      intensity_level: row.intensity_level,
      ...(row.perceived_exertion != null && { perceived_exertion: row.perceived_exertion }),
      ...(row.indoor_outdoor != null && { indoor_outdoor: row.indoor_outdoor }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

type LogRowUnion =
  | BMLogRow
  | SymptomLogRow
  | FoodLogRow
  | HydrationLogRow
  | SleepLogRow
  | StressLogRow
  | MedicationLogRow
  | MenstrualCycleLogRow
  | ExerciseLogRow;

const NORMALIZERS: Record<EventType, (row: never) => CanonicalEvent> = {
  bm: normalizeBMEvent as (row: never) => CanonicalEvent,
  symptom: normalizeSymptomEvent as (row: never) => CanonicalEvent,
  food: normalizeFoodEvent as (row: never) => CanonicalEvent,
  hydration: normalizeHydrationEvent as (row: never) => CanonicalEvent,
  sleep: normalizeSleepEvent as (row: never) => CanonicalEvent,
  stress: normalizeStressEvent as (row: never) => CanonicalEvent,
  medication: normalizeMedicationEvent as (row: never) => CanonicalEvent,
  menstrual_cycle: normalizeMenstrualCycleEvent as (row: never) => CanonicalEvent,
  exercise: normalizeExerciseEvent as (row: never) => CanonicalEvent,
};

export function normalizeLogRowToCanonicalEvent(
  row: LogRowUnion,
  eventType: EventType
): CanonicalEvent {
  const normalizer = NORMALIZERS[eventType];
  return normalizer(row as never);
}

export function validateCanonicalEvent(event: CanonicalEvent): string[] {
  const errors: string[] = [];
  if (!event.id) errors.push('missing id');
  if (!event.user_id) errors.push('missing user_id');
  if (!event.event_type) errors.push('missing event_type');
  if (!event.occurred_at) errors.push('missing occurred_at');
  if (!event.local_date) errors.push('missing local_date');
  if (event.local_hour < 0 || event.local_hour > 23) errors.push('local_hour out of range');
  if (!event.source_table) errors.push('missing source_table');
  if (!event.payload || typeof event.payload !== 'object') errors.push('missing or invalid payload');
  return errors;
}

export function exampleNormalizationDemo(): void {
  const sampleBM: BMLogRow = {
    id: 'bm-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T09:30:00Z',
    bristol_type: 4,
    urgency: 2,
    pain_level: 1,
    difficulty_level: 1,
    amount: 'medium',
    incomplete_evacuation: false,
    blood_present: false,
    mucus_present: false,
  };

  const sampleSymptom: SymptomLogRow = {
    id: 'sym-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T10:00:00Z',
    symptom_type: 'bloating',
    severity: 3,
    local_date: '2026-04-08',
    local_hour: 10,
  };

  const sampleFood: FoodLogRow = {
    id: 'food-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T12:30:00Z',
    meal_type: 'lunch',
    food_items: ['salad', 'chicken'],
    tags: ['high-fiber'],
  };

  const sampleHydration: HydrationLogRow = {
    id: 'hyd-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T08:00:00Z',
    amount_ml: 500,
    beverage_type: 'water',
  };

  const sampleSleep: SleepLogRow = {
    id: 'slp-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T07:00:00Z',
    sleep_start: '2026-04-07T23:00:00Z',
    sleep_end: '2026-04-08T07:00:00Z',
    duration_minutes: 480,
    quality: 4,
  };

  const sampleStress: StressLogRow = {
    id: 'str-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T14:00:00Z',
    stress_level: 6,
    notes: 'work deadline',
  };

  const sampleMedication: MedicationLogRow = {
    id: 'med-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T08:15:00Z',
    medication_name: 'Probiotic',
    dosage: '1 capsule',
    medication_type: 'supplement',
    taken_as_prescribed: true,
  };

  const sampleMenstrual: MenstrualCycleLogRow = {
    id: 'mc-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T09:00:00Z',
    cycle_start_date: '2026-04-05',
    cycle_day: 4,
    flow_intensity: 'medium',
  };

  const allSamples: [LogRowUnion, EventType][] = [
    [sampleBM, 'bm'],
    [sampleSymptom, 'symptom'],
    [sampleFood, 'food'],
    [sampleHydration, 'hydration'],
    [sampleSleep, 'sleep'],
    [sampleStress, 'stress'],
    [sampleMedication, 'medication'],
    [sampleMenstrual, 'menstrual_cycle'],
  ];

  for (const [row, eventType] of allSamples) {
    const event = normalizeLogRowToCanonicalEvent(row, eventType);
    const errors = validateCanonicalEvent(event);
    console.log(`[${eventType}] valid=${errors.length === 0}`, errors.length ? errors : '', event);
  }
}
