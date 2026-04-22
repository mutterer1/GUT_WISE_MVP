import { supabase } from '../lib/supabase';

export interface FoodLogNormalizationItemInput {
  name: string;
  estimated_calories?: number;
}

interface ReplaceFoodLogItemsParams {
  userId: string;
  foodLogId: string;
  foodItems: FoodLogNormalizationItemInput[];
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

function buildFoodLogItemRows({
  userId,
  foodLogId,
  foodItems,
}: ReplaceFoodLogItemsParams) {
  return sanitizeFoodItems(foodItems).map((item, index) => ({
    user_id: userId,
    food_log_id: foodLogId,
    display_name: item.name,
    normalized_food_id: null,
    quantity_value: null,
    quantity_unit: null,
    preparation_method: null,
    brand_name: null,
    restaurant_name: null,
    consumed_order: index + 1,
    source_method:
      typeof item.estimated_calories === 'number' ? 'autocomplete_match' : 'manual_entry',
    confidence_score:
      typeof item.estimated_calories === 'number' ? 0.6 : null,
    notes: null,
  }));
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

  const rows = buildFoodLogItemRows(params);
  if (rows.length === 0) return;

  const { error: insertError } = await supabase
    .from('food_log_items')
    .insert(rows);

  if (insertError) throw insertError;
}
