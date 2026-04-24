export interface MedicationExposureProfile {
  medication_name: string;
  normalized_medication_id: string | null;
  matched_medication_ids: string[];
  medication_families: string[];
  medication_gut_effects: string[];
  route: string | null;
  regimen_status: string | null;
  timing_context: string | null;
  dose_value: number | null;
  dose_unit: string | null;
  taken_as_prescribed: boolean | null;
  structured_match: boolean;
}

export interface UserDailyFeatures {
  user_id: string;
  date: string;

  event_count: number;
  logging_completeness_score: number | null;

  bm_count: number;
  avg_bristol: number | null;
  hard_stool_count: number;
  loose_stool_count: number;
  urgency_event_count: number;
  incomplete_evacuation_count: number;
  blood_present_count: number;
  mucus_present_count: number;
  first_bm_hour: number | null;
  last_bm_hour: number | null;

  symptom_event_count: number;
  symptom_burden_score: number;
  max_symptom_severity: number | null;
  symptom_types: string[];

  meal_count: number;
  food_item_names: string[];
  food_tag_set: string[];
  matched_ingredient_ids?: string[];
  matched_food_reference_ids?: string[];
  ingredient_signals: string[];
  food_common_gut_effects?: string[];
  gut_trigger_load: number;
  gut_trigger_burden_score?: number;
  high_fodmap_food_count: number;
  high_fodmap_burden_score?: number;
  dairy_food_count: number;
  dairy_burden_score?: number;
  gluten_food_count: number;
  gluten_burden_score?: number;
  artificial_sweetener_food_count: number;
  artificial_sweetener_burden_score?: number;
  high_fat_food_count: number;
  high_fat_burden_score?: number;
  spicy_food_count: number;
  spicy_burden_score?: number;
  caffeine_food_count: number;
  caffeine_food_burden_score?: number;
  alcohol_food_count: number;
  alcohol_food_burden_score?: number;
  fiber_dense_food_count: number;
  fiber_dense_burden_score?: number;
  food_item_count_total?: number;
  structured_food_item_count?: number;
  structured_ingredient_count?: number;
  structured_food_coverage_ratio?: number | null;
  ingredient_signal_confidence_avg?: number | null;
  calories_kcal_total?: number;
  protein_g_total?: number;
  protein_g_per_1000kcal?: number | null;
  fat_g_total?: number;
  fat_calorie_share_ratio?: number | null;
  carbs_g_total?: number;
  carbs_g_per_1000kcal?: number | null;
  fiber_g_total?: number;
  fiber_g_per_1000kcal?: number | null;
  sugar_g_total?: number;
  sugar_g_per_1000kcal?: number | null;
  sodium_mg_total?: number;
  sodium_mg_per_1000kcal?: number | null;
  nutrition_covered_item_count?: number;
  nutrition_missing_item_count?: number;
  nutrition_coverage_ratio?: number | null;
  nutrition_source_labels?: string[];
  nutrition_confidence_avg?: number | null;
  late_meal: boolean;

  hydration_total_ml: number;
  hydration_event_count: number;
  hydration_raw_total_ml?: number;
  hydration_water_goal_ml?: number;
  hydration_caffeine_mg?: number;
  caffeine_beverage_count: number;
  alcohol_beverage_count: number;

  sleep_entry_count: number;
  sleep_duration_minutes: number | null;
  sleep_quality: number | null;

  stress_event_count: number;
  stress_avg: number | null;
  stress_peak: number | null;

  medication_event_count: number;
  medications_taken: string[];
  matched_medication_ids?: string[];
  medication_families: string[];
  medication_gut_effects: string[];
  medication_routes?: string[];
  medication_regimen_statuses?: string[];
  medication_timing_contexts?: string[];
  medication_dose_units?: string[];
  medication_exposure_profiles?: MedicationExposureProfile[];
  structured_medication_event_count?: number;
  structured_medication_coverage_ratio?: number | null;
  medication_signal_confidence_avg?: number | null;
  oral_medication_count?: number;
  scheduled_medication_count?: number;
  as_needed_medication_count?: number;
  one_time_medication_count?: number;
  off_plan_medication_count?: number;
  with_food_medication_count?: number;
  before_meal_medication_count?: number;
  after_meal_medication_count?: number;
  bedtime_medication_count?: number;
  known_dose_medication_count?: number;
  gi_risk_medication_count: number;
  motility_slowing_medication_count: number;
  motility_speeding_medication_count: number;
  acid_suppression_medication_count: number;
  microbiome_disruption_medication_count: number;

  cycle_entry_count: number;
  cycle_day: number | null;
  cycle_phase: string | null;

  exercise_minutes_total: number;
  exercise_sessions_count: number;
  moderate_vigorous_minutes: number;
  movement_low_day: boolean;

  timezone: string | null;
}
