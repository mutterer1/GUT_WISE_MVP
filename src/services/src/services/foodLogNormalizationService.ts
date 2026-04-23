import { supabase } from '../lib/supabase';
import type {
  FoodReferenceIngredientRow,
  FoodReferenceItemRow,
  FoodLogItemRow,
  IngredientReferenceItemRow,
} from '../types/intelligence';

export interface FoodLogNormalizationItemInput {
  name: string;
  estimated_calories?: number;
}

interface ReplaceFoodLogItemsParams {
  userId: string;
  foodLogId: string;
  foodItems: FoodLogNormalizationItemInput[];
  tags?: string[];
}

interface FoodReferenceMatch {
  normalizedFoodId: string | null;
  confidenceScore: number | null;
  sourceMethod: 'manual_entry' | 'autocomplete_match';
}

type FoodLogItemInsertRow = {
  user_id: string;
  food_log_id: string;
  display_name: string;
  normalized_food_id: string | null;
  quantity_value: null;
  quantity_unit: null;
  preparation_method: null;
  brand_name: null;
  restaurant_name: null;
  consumed_order: number;
  source_method: 'manual_entry' | 'autocomplete_match';
  confidence_score: number | null;
  notes: null;
};

type FoodLogItemIngredientInsertRow = {
  user_id: string;
  food_log_item_id: string;
  ingredient_reference_id: string | null;
  ingredient_name_text: string;
  quantity_estimate: number | null;
  quantity_unit: string | null;
  source_method: 'manual_entry' | 'catalog_match';
  confidence_score: number | null;
  gut_signals_override: string[];
  notes: string | null;
};

type TagFallbackDefinition = {
  ingredientName: string;
  gutSignals: string[];
  notes?: string;
};

const TAG_TO_FALLBACK_INGREDIENT: Record<string, TagFallbackDefinition> = {
  dairy: {
    ingredientName: 'dairy',
    gutSignals: ['dairy'],
  },
  gluten: {
    ingredientName: 'gluten',
    gutSignals: ['gluten'],
  },
  spicy: {
    ingredientName: 'spicy seasoning',
    gutSignals: ['spicy'],
  },
  fried: {
    ingredientName: 'fried cooking fat',
    gutSignals: ['high_fat'],
  },
  'high fiber': {
    ingredientName: 'fiber dense ingredient',
    gutSignals: ['fiber_dense'],
  },
  caffeine: {
    ingredientName: 'caffeine',
    gutSignals: ['caffeine_food'],
  },
  'artificial sweetener': {
    ingredientName: 'artificial sweetener',
    gutSignals: ['artificial_sweetener'],
  },
  'high fat': {
    ingredientName: 'high fat ingredient',
    gutSignals: ['high_fat'],
  },
  fodmap: {
    ingredientName: 'high fodmap ingredient',
    gutSignals: ['high_fodmap'],
  },
  alcohol: {
    ingredientName: 'alcohol',
    gutSignals: ['alcohol'],
  },
};

function sanitizeFoodItems(
  foodItems: FoodLogNormalizationItemInput[]
): FoodLogNormalizationItemInput[] {
  return foodItems
    .map((item) => ({
      ...item,
      name: item.name.trim(),
    }))
    .filter((item) => item.name.length > 0);
}

function normalizeLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

function pickBestFoodReferenceMatch(
  item: FoodLogNormalizationItemInput,
  candidates: FoodReferenceItemRow[]
): FoodReferenceMatch {
  const normalizedName = normalizeLookupKey(item.name);

  const exactDisplay = candidates.find(
    (candidate) => normalizeLookupKey(candidate.display_name) === normalizedName
  );
  if (exactDisplay) {
    return {
      normalizedFoodId: exactDisplay.id,
      confidenceScore: 0.96,
      sourceMethod: 'autocomplete_match',
    };
  }

  const exactCanonical = candidates.find(
    (candidate) => normalizeLookupKey(candidate.canonical_name) === normalizedName
  );
  if (exactCanonical) {
    return {
      normalizedFoodId: exactCanonical.id,
      confidenceScore: 0.94,
      sourceMethod: 'autocomplete_match',
    };
  }

  const aliasMatch = candidates.find((candidate) =>
    candidate.common_aliases.some((alias) => normalizeLookupKey(alias) === normalizedName)
  );
  if (aliasMatch) {
    return {
      normalizedFoodId: aliasMatch.id,
      confidenceScore: 0.9,
      sourceMethod: 'autocomplete_match',
    };
  }

  return {
    normalizedFoodId: null,
    confidenceScore: typeof item.estimated_calories === 'number' ? 0.6 : null,
    sourceMethod:
      typeof item.estimated_calories === 'number' ? 'autocomplete_match' : 'manual_entry',
  };
}

function getFallbackDefinitionsFromTags(tags: string[]): TagFallbackDefinition[] {
  const seen = new Set<string>();
  const results: TagFallbackDefinition[] = [];

  for (const tag of tags) {
    const key = normalizeLookupKey(tag);
    const fallback = TAG_TO_FALLBACK_INGREDIENT[key];
    if (!fallback) continue;

    const dedupeKey = `${fallback.ingredientName}::${fallback.gutSignals.join('|')}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    results.push(fallback);
  }

  return results;
}

function aliasMatchesFoodReference(
  itemName: string,
  candidate: FoodReferenceItemRow
): boolean {
  const normalizedName = normalizeLookupKey(itemName);
  return candidate.common_aliases.some((alias) => {
    const normalizedAlias = normalizeLookupKey(alias);
    return (
      normalizedAlias === normalizedName ||
      normalizedAlias.includes(normalizedName) ||
      normalizedName.includes(normalizedAlias)
    );
  });
}

async function fetchCandidateFoodReferences(
  foodItems: FoodLogNormalizationItemInput[]
): Promise<Map<string, FoodReferenceItemRow[]>> {
  const sanitizedItems = sanitizeFoodItems(foodItems);
  const itemNames = [...new Set(sanitizedItems.map((item) => item.name))];
  const matchMap = new Map<string, FoodReferenceItemRow[]>();
  let fallbackReferenceCache: FoodReferenceItemRow[] | null = null;

  await Promise.all(
    itemNames.map(async (itemName) => {
      const escapedName = itemName.replace(/[%_,'"]/g, '').trim();
      if (!escapedName) {
        matchMap.set(itemName, []);
        return;
      }

      const { data, error } = await supabase
        .from('food_reference_items')
        .select('*')
        .or(
          [
            `display_name.ilike.${escapedName}`,
            `canonical_name.ilike.${escapedName}`,
            `display_name.ilike.%${escapedName}%`,
            `canonical_name.ilike.%${escapedName}%`,
          ].join(',')
        )
        .limit(8);

      if (error) throw error;
      let candidates = (data ?? []) as FoodReferenceItemRow[];

      if (candidates.length === 0) {
        if (fallbackReferenceCache === null) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('food_reference_items')
            .select('*')
            .limit(300);

          if (fallbackError) throw fallbackError;
          fallbackReferenceCache = (fallbackData ?? []) as FoodReferenceItemRow[];
        }

        candidates = fallbackReferenceCache
          .filter((candidate) => aliasMatchesFoodReference(itemName, candidate))
          .slice(0, 8);
      }

      matchMap.set(itemName, candidates);
    })
  );

  return matchMap;
}

async function fetchFoodReferenceIngredientsByFoodIds(
  foodReferenceIds: string[]
): Promise<Map<string, FoodReferenceIngredientRow[]>> {
  const uniqueIds = [...new Set(foodReferenceIds.filter(Boolean))];
  const resultMap = new Map<string, FoodReferenceIngredientRow[]>();

  if (uniqueIds.length === 0) return resultMap;

  const { data, error } = await supabase
    .from('food_reference_ingredients')
    .select('*')
    .in('food_reference_id', uniqueIds)
    .order('prominence_rank', { ascending: true });

  if (error) throw error;

  for (const row of (data ?? []) as FoodReferenceIngredientRow[]) {
    const current = resultMap.get(row.food_reference_id) ?? [];
    current.push(row);
    resultMap.set(row.food_reference_id, current);
  }

  return resultMap;
}

async function fetchIngredientReferenceLookup(
  ingredientIds: string[],
  ingredientNames: string[]
): Promise<{
  byId: Map<string, IngredientReferenceItemRow>;
  byLookupKey: Map<string, IngredientReferenceItemRow>;
}> {
  const byId = new Map<string, IngredientReferenceItemRow>();
  const byLookupKey = new Map<string, IngredientReferenceItemRow>();

  const uniqueIds = [...new Set(ingredientIds.filter(Boolean))];
  if (uniqueIds.length > 0) {
    const { data, error } = await supabase
      .from('ingredient_reference_items')
      .select('*')
      .in('id', uniqueIds);

    if (error) throw error;

    for (const row of (data ?? []) as IngredientReferenceItemRow[]) {
      byId.set(row.id, row);
      byLookupKey.set(normalizeLookupKey(row.canonical_name), row);
      byLookupKey.set(normalizeLookupKey(row.display_name), row);
      for (const alias of row.common_aliases) {
        byLookupKey.set(normalizeLookupKey(alias), row);
      }
    }
  }

  const uniqueNames = [...new Set(ingredientNames.map(normalizeLookupKey).filter(Boolean))];
  for (const nameKey of uniqueNames) {
    if (byLookupKey.has(nameKey)) continue;

    const rawName = nameKey.replace(/\s+/g, ' ').trim();
    if (!rawName) continue;

    const escapedName = rawName.replace(/[%_,'"]/g, '').trim();
    if (!escapedName) continue;

    const { data, error } = await supabase
      .from('ingredient_reference_items')
      .select('*')
      .or(
        [
          `canonical_name.ilike.${escapedName}`,
          `display_name.ilike.${escapedName}`,
          `canonical_name.ilike.%${escapedName}%`,
          `display_name.ilike.%${escapedName}%`,
        ].join(',')
      )
      .limit(8);

    if (error) throw error;

    for (const row of (data ?? []) as IngredientReferenceItemRow[]) {
      byId.set(row.id, row);
      byLookupKey.set(normalizeLookupKey(row.canonical_name), row);
      byLookupKey.set(normalizeLookupKey(row.display_name), row);
      for (const alias of row.common_aliases) {
        byLookupKey.set(normalizeLookupKey(alias), row);
      }
    }
  }

  return { byId, byLookupKey };
}

async function buildFoodLogItemRows({
  userId,
  foodLogId,
  foodItems,
}: ReplaceFoodLogItemsParams): Promise<FoodLogItemInsertRow[]> {
  const sanitizedItems = sanitizeFoodItems(foodItems);
  const candidateMatchMap = await fetchCandidateFoodReferences(sanitizedItems);

  return sanitizedItems.map((item, index) => {
    const candidates = candidateMatchMap.get(item.name) ?? [];
    const match = pickBestFoodReferenceMatch(item, candidates);

    return {
      user_id: userId,
      food_log_id: foodLogId,
      display_name: item.name,
      normalized_food_id: match.normalizedFoodId,
      quantity_value: null,
      quantity_unit: null,
      preparation_method: null,
      brand_name: null,
      restaurant_name: null,
      consumed_order: index + 1,
      source_method: match.sourceMethod,
      confidence_score: match.confidenceScore,
      notes: null,
    };
  });
}

async function buildIngredientRowsForInsertedItems(params: {
  userId: string;
  insertedFoodLogItems: FoodLogItemRow[];
  tags: string[];
}): Promise<FoodLogItemIngredientInsertRow[]> {
  const { userId, insertedFoodLogItems, tags } = params;

  const normalizedFoodIds = insertedFoodLogItems
    .map((item) => item.normalized_food_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const referenceIngredientsByFoodId = await fetchFoodReferenceIngredientsByFoodIds(normalizedFoodIds);
  const referenceIngredientIds = [
    ...new Set(
      [...referenceIngredientsByFoodId.values()]
        .flat()
        .map((row) => row.ingredient_reference_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
    ),
  ];

  const fallbackDefinitions = getFallbackDefinitionsFromTags(tags);
  const fallbackIngredientNames = fallbackDefinitions.map((definition) => definition.ingredientName);

  const ingredientLookup = await fetchIngredientReferenceLookup(
    referenceIngredientIds,
    fallbackIngredientNames
  );

  const ingredientRows: FoodLogItemIngredientInsertRow[] = [];

  for (const foodLogItem of insertedFoodLogItems) {
    const referenceIngredients =
      (foodLogItem.normalized_food_id &&
        referenceIngredientsByFoodId.get(foodLogItem.normalized_food_id)) ||
      [];

    if (referenceIngredients.length > 0) {
      for (const referenceIngredient of referenceIngredients) {
        const ingredientReference =
          ingredientLookup.byId.get(referenceIngredient.ingredient_reference_id);

        ingredientRows.push({
          user_id: userId,
          food_log_item_id: foodLogItem.id,
          ingredient_reference_id: referenceIngredient.ingredient_reference_id,
          ingredient_name_text:
            ingredientReference?.display_name ??
            ingredientReference?.canonical_name ??
            'ingredient',
          quantity_estimate: referenceIngredient.grams_per_default_serving,
          quantity_unit: referenceIngredient.grams_per_default_serving !== null ? 'g' : null,
          source_method: 'catalog_match',
          confidence_score: 0.92,
          gut_signals_override: [],
          notes: referenceIngredient.notes,
        });
      }
      continue;
    }

    for (const fallbackDefinition of fallbackDefinitions) {
      const matchedIngredientReference = ingredientLookup.byLookupKey.get(
        normalizeLookupKey(fallbackDefinition.ingredientName)
      );

      ingredientRows.push({
        user_id: userId,
        food_log_item_id: foodLogItem.id,
        ingredient_reference_id: matchedIngredientReference?.id ?? null,
        ingredient_name_text:
          matchedIngredientReference?.display_name ??
          matchedIngredientReference?.canonical_name ??
          fallbackDefinition.ingredientName,
        quantity_estimate: null,
        quantity_unit: null,
        source_method: 'manual_entry',
        confidence_score: 0.5,
        gut_signals_override: fallbackDefinition.gutSignals,
        notes: fallbackDefinition.notes ?? 'Fallback ingredient created from digestive tags.',
      });
    }
  }

  return ingredientRows;
}

export async function replaceFoodLogItemsForLog(
  params: ReplaceFoodLogItemsParams
): Promise<void> {
  const { userId, foodLogId, tags = [] } = params;

  const { error: deleteError } = await supabase
    .from('food_log_items')
    .delete()
    .eq('user_id', userId)
    .eq('food_log_id', foodLogId);

  if (deleteError) throw deleteError;

  const rows = await buildFoodLogItemRows(params);
  if (rows.length === 0) return;

  const { data: insertedRows, error: insertError } = await supabase
    .from('food_log_items')
    .insert(rows)
    .select('*');

  if (insertError) throw insertError;

  const insertedFoodLogItems = (insertedRows ?? []) as FoodLogItemRow[];
  if (insertedFoodLogItems.length === 0) return;

  const ingredientRows = await buildIngredientRowsForInsertedItems({
    userId,
    insertedFoodLogItems,
    tags,
  });

  if (ingredientRows.length === 0) return;

  const { error: ingredientInsertError } = await supabase
    .from('food_log_item_ingredients')
    .insert(ingredientRows);

  if (ingredientInsertError) throw ingredientInsertError;
}
