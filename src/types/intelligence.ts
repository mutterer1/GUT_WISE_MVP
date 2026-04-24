export type IngredientFodmapLevel = 'low' | 'moderate' | 'high' | 'unknown';

export interface IngredientReferenceItemRow {
  id: string;
  canonical_name: string;
  display_name: string;
  ingredient_category: string | null;
  fodmap_level: IngredientFodmapLevel | null;
  common_aliases: string[];
  default_signals: string[];
  typical_gut_reactions: string[];
  evidence_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodReferenceItemRow {
  id: string;
  canonical_name: string;
  display_name: string;
  brand_name: string | null;
  food_category: string | null;
  default_serving_amount: number | null;
  default_serving_unit: string | null;
  reviewed_serving_label: string | null;
  calories_kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  nutrition_confidence: number | null;
  nutrition_source_label: string | null;
  nutrition_source_ref: string | null;
  common_aliases: string[];
  default_signals: string[];
  source_label: string;
  evidence_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodNutritionSnapshot {
  serving_label: string | null;
  calories_kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  confidence: number | null;
  source_label: string | null;
  source_ref: string | null;
}

export interface FoodReferenceCandidateIngredient {
  name: string;
  confidence: number | null;
  prominence_rank: number | null;
  is_primary: boolean;
  ingredient_fraction: number | null;
  suggested_signals: string[];
  notes: string | null;
}

export interface FoodReferenceIngredientRow {
  id: string;
  food_reference_id: string;
  ingredient_reference_id: string;
  grams_per_default_serving: number | null;
  ingredient_fraction: number | null;
  prominence_rank: number | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type FoodItemSourceMethod =
  | 'manual_entry'
  | 'autocomplete_match'
  | 'import_candidate'
  | 'derived_from_note';

export interface FoodLogItemRow {
  id: string;
  user_id: string;
  food_log_id: string;
  display_name: string;
  normalized_food_id: string | null;
  quantity_value: number | null;
  quantity_unit: string | null;
  preparation_method: string | null;
  brand_name: string | null;
  restaurant_name: string | null;
  consumed_order: number | null;
  source_method: FoodItemSourceMethod;
  confidence_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type FoodIngredientSourceMethod =
  | 'manual_entry'
  | 'catalog_match'
  | 'document_extraction'
  | 'llm_inference';

export interface FoodLogItemIngredientRow {
  id: string;
  user_id: string;
  food_log_item_id: string;
  ingredient_reference_id: string | null;
  ingredient_name_text: string;
  quantity_estimate: number | null;
  quantity_unit: string | null;
  source_method: FoodIngredientSourceMethod;
  confidence_score: number | null;
  gut_signals_override: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type MedicationReferenceType =
  | 'prescription'
  | 'otc'
  | 'supplement'
  | 'unknown';

export type MedicationGutRelevance =
  | 'primary'
  | 'secondary'
  | 'indirect'
  | 'unknown';

export interface MedicationReferenceItemRow {
  id: string;
  generic_name: string;
  display_name: string;
  brand_names: string[];
  rxnorm_code: string | null;
  medication_class: string | null;
  medication_family: string | null;
  route: string | null;
  dosage_form: string | null;
  medication_type: MedicationReferenceType | null;
  gut_relevance: MedicationGutRelevance | null;
  common_gut_effects: string[];
  interaction_flags: string[];
  active_ingredients: string[];
  common_dose_units: string[];
  source_label: string | null;
  source_ref: string | null;
  source_confidence: number | null;
  evidence_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type MedicationRegimenStatus =
  | 'scheduled'
  | 'as_needed'
  | 'one_time'
  | 'unknown';

export type ReferenceCandidateKind = 'food' | 'medication';

export type ReferenceCandidateSourceLogType = 'food_log' | 'medication_log';

export type ReferenceCandidateReviewStatus =
  | 'pending_review'
  | 'accepted'
  | 'rejected'
  | 'merged';

export interface FoodReferenceCandidateDetail {
  tags: string[];
  estimated_calories: number | null;
  portion_size: string | null;
  suggested_food_category: string | null;
  suggested_brand_name: string | null;
  suggested_common_aliases: string[];
  suggested_serving_label: string | null;
  suggested_calories_kcal: number | null;
  suggested_protein_g: number | null;
  suggested_fat_g: number | null;
  suggested_carbs_g: number | null;
  suggested_fiber_g: number | null;
  suggested_sugar_g: number | null;
  suggested_sodium_mg: number | null;
  suggested_ingredient_names: string[];
  suggested_ingredients: FoodReferenceCandidateIngredient[];
  suggested_default_signals: string[];
  enrichment_source_label: string | null;
  enrichment_source_ref: string | null;
  enrichment_confidence: number | null;
  enrichment_status: 'not_started' | 'enriched' | 'fallback' | 'failed';
  enrichment_last_attempt_at: string | null;
  enrichment_notes: string | null;
}

export interface MedicationReferenceCandidateDetail {
  dosage: string | null;
  medication_type: MedicationReferenceType | null;
  route: string | null;
  reason_for_use: string | null;
  regimen_status: MedicationRegimenStatus | null;
  timing_context: string | null;
  suggested_generic_name: string | null;
  suggested_brand_names: string[];
  suggested_medication_class: string | null;
  suggested_medication_family: string | null;
  suggested_rxnorm_code: string | null;
  suggested_gut_relevance: MedicationGutRelevance | null;
  suggested_common_gut_effects: string[];
  suggested_interaction_flags: string[];
  suggested_active_ingredients: string[];
  suggested_common_dose_units: string[];
  suggested_dosage_form: string | null;
  suggested_route: string | null;
  enrichment_source_label: string | null;
  enrichment_source_ref: string | null;
  enrichment_confidence: number | null;
  enrichment_status: 'not_started' | 'enriched' | 'fallback' | 'failed';
  enrichment_last_attempt_at: string | null;
  enrichment_notes: string | null;
}

export interface ReferenceReviewCandidateRow {
  id: string;
  user_id: string;
  candidate_kind: ReferenceCandidateKind;
  display_name: string;
  normalized_name_key: string;
  source_log_type: ReferenceCandidateSourceLogType;
  source_log_id: string | null;
  source_item_id: string | null;
  detail: Record<string, unknown>;
  review_status: ReferenceCandidateReviewStatus;
  review_notes: string | null;
  times_seen: number;
  last_seen_at: string;
  reviewed_at: string | null;
  promoted_reference_id: string | null;
  created_at: string;
  updated_at: string;
}
