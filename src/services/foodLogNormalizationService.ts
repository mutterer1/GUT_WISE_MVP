import { supabase } from '../lib/supabase';
import type { FoodReferenceItemRow } from '../types/intelligence';

export interface FoodLogNormalizationItemInput {
  name: string;
  estimated_calories?: number;
}

interface ReplaceFoodLogItemsParams {
  userId: string;
  foodLogId: string;
  foodItems: FoodLogNormalizationItemInput[];
}

interface FoodReferenceMatch {
  normalizedFoodId: string | null;
  confidenceScore: number | null;
  sourceMethod: 'manual_entry' | 'autocomplete_match';
}

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

async function fetchCandidateFoodReferences(
  foodItems: FoodLogNormalizationItemInput[]
): Promise<Map<string, FoodReferenceItemRow[]>> {
  const sanitizedItems = sanitizeFoodItems(foodItems);
  const itemNames = [...new Set(sanitizedItems.map((item) => item.name))];
  const matchMap = new Map<string, FoodReferenceItemRow[]>();

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
      matchMap.set(itemName, (data ?? []) as FoodReferenceItemRow[]);
    })
  );

  return matchMap;
}

async function buildFoodLogItemRows({
  userId,
  foodLogId,
  foodItems,
}: ReplaceFoodLogItemsParams) {
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

export async function replaceFoodLogItemsForLog(
  params: ReplaceFoodLogItemsParams
): Promise<void> {
  const { userId, foodLogId } = params;

  const { error: deleteError } = await supabase
    .from('food_log_items')
    .delete()
    .eq('user_id', userId)
    .eq('food_log_id', foodLogId);

  if (deleteError) throw deleteError;

  const rows = await buildFoodLogItemRows(params);
  if (rows.length === 0) return;

  const { error: insertError } = await supabase
    .from('food_log_items')
    .insert(rows);

  if (insertError) throw insertError;
}
