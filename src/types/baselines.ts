export interface SleepBaseline {
  median_duration_minutes: number | null;
  median_quality: number | null;
  low_duration_threshold: number | null;
  low_quality_threshold: number | null;
}

export interface HydrationBaseline {
  median_total_ml: number | null;
  low_hydration_threshold: number | null;
  high_hydration_threshold: number | null;
}

export interface StressBaseline {
  median_avg: number | null;
  high_stress_threshold: number | null;
  median_peak: number | null;
}

export interface SymptomsBaseline {
  median_burden: number | null;
  high_burden_threshold: number | null;
  median_max_severity: number | null;
}

export interface BowelMovementBaseline {
  median_bm_count: number | null;
  median_bristol: number | null;
  typical_first_bm_hour: number | null;
  high_urgency_threshold: number | null;
}

export interface RoutineBaseline {
  late_meal_rate: number | null;
  caffeine_beverage_rate: number | null;
  alcohol_beverage_rate: number | null;
}

export interface DataQualityBaseline {
  average_event_count: number | null;
  average_logging_completeness_score: number | null;
}

export interface ExerciseBaseline {
  median_exercise_minutes: number | null;
  median_moderate_vigorous_minutes: number | null;
  active_day_rate: number | null;
  low_movement_day_rate: number | null;
}

export interface CycleBaseline {
  menstrual_phase_symptom_burden_median: number | null;
  luteal_phase_symptom_burden_median: number | null;
  menstrual_phase_bm_count_median: number | null;
  luteal_phase_bm_count_median: number | null;
  menstrual_phase_loose_stool_rate: number | null;
  luteal_phase_loose_stool_rate: number | null;
}

export interface UserBaselineSet {
  user_id: string;
  computed_from_start_date: string;
  computed_from_end_date: string;
  day_count: number;

  sleep: SleepBaseline;
  hydration: HydrationBaseline;
  stress: StressBaseline;
  symptoms: SymptomsBaseline;
  bowel_movement: BowelMovementBaseline;
  routine: RoutineBaseline;
  data_quality: DataQualityBaseline;
  exercise: ExerciseBaseline;
  cycle: CycleBaseline;

  timezone: string | null;
}

export interface BaselineWindowOptions {
  windowDays?: number;
}
