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
  ingredient_signals: string[];
  matched_ingredient_ids?: string[];
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
