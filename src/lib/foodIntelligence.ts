import {
  INGREDIENT_CATALOG,
  type IngredientCatalogEntry,
  type IngredientSignalKey,
} from '../data/ingredientCatalog';

interface FoodNameLike {
  name?: unknown;
}

export interface FoodIntelligenceInput {
  food_items: unknown;
  tags?: string[] | null;
}

export interface DerivedFoodIntelligence {
  food_item_names: string[];
  matched_ingredient_ids: string[];
  ingredient_signals: IngredientSignalKey[];
  gut_trigger_load: number;
  high_fodmap_food_count: number;
  dairy_food_count: number;
  gluten_food_count: number;
  artificial_sweetener_food_count: number;
  high_fat_food_count: number;
  spicy_food_count: number;
  caffeine_food_count: number;
  alcohol_food_count: number;
  fiber_dense_food_count: number;
  common_gut_effects: string[];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function extractFoodNames(foodItems: unknown): string[] {
  if (!Array.isArray(foodItems)) return [];

  return foodItems
    .flatMap((item) => {
      if (typeof item === 'string') return [item];
      if (item && typeof item === 'object') {
        const maybeName = (item as FoodNameLike).name;
        if (typeof maybeName === 'string') return [maybeName];
      }
      return [];
    })
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function tagSignals(tags: string[] | null | undefined): IngredientSignalKey[] {
  if (!tags || tags.length === 0) return [];

  const lookup: Record<string, IngredientSignalKey> = {
    dairy: 'dairy',
    gluten: 'gluten',
    spicy: 'spicy',
    fried: 'high_fat',
    'high fat': 'high_fat',
    fodmap: 'high_fodmap',
    caffeine: 'caffeine_food',
    alcohol: 'alcohol',
    'artificial sweetener': 'artificial_sweetener',
    'high fiber': 'fiber_dense',
  };

  return tags
    .map((tag) => lookup[normalize(tag)])
    .filter((value): value is IngredientSignalKey => value !== undefined);
}

function matchesEntry(foodName: string, entry: IngredientCatalogEntry): boolean {
  const lowered = normalize(foodName);
  return entry.matchTerms.some((term) => lowered.includes(term));
}

export function deriveFoodIntelligence(
  input: FoodIntelligenceInput
): DerivedFoodIntelligence {
  const foodNames = extractFoodNames(input.food_items);
  const matchedEntries = new Map<string, IngredientCatalogEntry>();

  for (const name of foodNames) {
    for (const entry of INGREDIENT_CATALOG) {
      if (matchesEntry(name, entry)) {
        matchedEntries.set(entry.id, entry);
      }
    }
  }

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

  for (const entry of matchedEntries.values()) {
    for (const signal of entry.signals) {
      signalCounts[signal] += 1;
    }
  }

  for (const signal of tagSignals(input.tags)) {
    signalCounts[signal] += 1;
  }

  const ingredientSignals = Object.entries(signalCounts)
    .filter(([, count]) => count > 0)
    .map(([signal]) => signal as IngredientSignalKey)
    .sort();

  const commonGutEffects = unique(
    [...matchedEntries.values()].flatMap((entry) => entry.commonGutEffects)
  );

  return {
    food_item_names: unique(foodNames),
    matched_ingredient_ids: [...matchedEntries.keys()].sort(),
    ingredient_signals: ingredientSignals,
    gut_trigger_load: ingredientSignals.length,
    high_fodmap_food_count: signalCounts.high_fodmap,
    dairy_food_count: signalCounts.dairy,
    gluten_food_count: signalCounts.gluten,
    artificial_sweetener_food_count: signalCounts.artificial_sweetener,
    high_fat_food_count: signalCounts.high_fat,
    spicy_food_count: signalCounts.spicy,
    caffeine_food_count: signalCounts.caffeine_food,
    alcohol_food_count: signalCounts.alcohol,
    fiber_dense_food_count: signalCounts.fiber_dense,
    common_gut_effects: commonGutEffects,
  };
}
