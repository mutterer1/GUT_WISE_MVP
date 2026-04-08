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
  food_tag_set: string[];
  late_meal: boolean;

  hydration_total_ml: number;
  hydration_event_count: number;
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

  cycle_entry_count: number;
  cycle_day: number | null;
  cycle_phase: string | null;

  timezone: string | null;
}
