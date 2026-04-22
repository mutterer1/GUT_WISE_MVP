import type { HydrationBeverageCategory } from '../constants/domain';

export type LogType =
  | 'bm'
  | 'food'
  | 'symptoms'
  | 'sleep'
  | 'stress'
  | 'hydration'
  | 'medication'
  | 'menstrual'
  | 'exercise';

export interface BaseLogEntry {
  id?: string;
  logged_at: string;
}

export interface NormalizedTimestampMeta {
  local_date?: string;
  local_hour?: number;
  timezone?: string;
  completeness_score?: number;
}

export interface BMLogRow extends BaseLogEntry, NormalizedTimestampMeta {
  user_id: string;
  bristol_type: number;
  urgency: number;
  pain_level: number;
  difficulty_level: number;
  amount: 'small' | 'medium' | 'large';
  incomplete_evacuation: boolean;
  blood_present: boolean;
  mucus_present: boolean;
  notes?: string | null;
}

export interface SymptomLogRow extends BaseLogEntry, NormalizedTimestampMeta {
  user_id: string;
  symptom_type: string;
  severity: number;
  duration_minutes?: number | null;
  location?: string | null;
  triggers?: string[] | null;
  notes?: string | null;
}

export interface FoodLogRow extends BaseLogEntry, NormalizedTimestampMeta {
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: unknown;
  portion_size?: string | null;
  calories?: number | null;
  tags?: string[] | null;
  location?: string | null;
  notes?: string | null;
}

export interface SleepLogRow extends BaseLogEntry, NormalizedTimestampMeta {
  user_id: string;
  sleep_start: string;
  sleep_end: string;
  duration_minutes?: number | null;
  quality?: number | null;
  interruptions?: number;
  felt_rested?: boolean | null;
  notes?: string | null;
}

export interface StressLogRow extends BaseLogEntry, NormalizedTimestampMeta {
  user_id: string;
  stress_level: number;
  triggers?: string[] | null;
  coping_methods?: string[] | null;
  physical_symptoms?: string[] | null;
  notes?: string | null;
}

export interface HydrationLogRow extends BaseLogEntry, NormalizedTimestampMeta {
  user_id: string;
  amount_ml: number;
  beverage_type: string;
  beverage_category?: HydrationBeverageCategory | null;
  caffeine_content?: boolean | null;
  caffeine_mg?: number | null;
  effective_hydration_ml?: number | null;
  water_goal_contribution_ml?: number | null;
  electrolyte_present?: boolean | null;
  alcohol_present?: boolean | null;
  notes?: string | null;
}

export interface MedicationLogRow extends BaseLogEntry, NormalizedTimestampMeta {
  user_id: string;
  medication_name: string;
  dosage: string;
  medication_type: 'prescription' | 'otc' | 'supplement';
  normalized_medication_id?: string | null;
  dose_value?: number | null;
  dose_unit?: string | null;
  route?: string | null;
  reason_for_use?: string | null;
  regimen_status?: 'scheduled' | 'as_needed' | 'one_time' | 'unknown' | null;
  timing_context?: string | null;
  taken_as_prescribed?: boolean;
  side_effects?: string[] | null;
  notes?: string | null;
}

export interface MenstrualCycleLogRow extends BaseLogEntry, NormalizedTimestampMeta {
  user_id: string;
  cycle_start_date: string;
  cycle_day: number;
  estimated_cycle_length?: number | null;
  flow_intensity: 'light' | 'medium' | 'heavy' | 'spotting' | 'none';
  color?: string | null;
  tissue_passed?: boolean;
  pain_level?: number | null;
  symptoms?: string[] | null;
  mood_notes?: string | null;
  ovulation_indicators?: string[] | null;
  basal_temp?: number | null;
  cervical_mucus_type?: string | null;
  contraceptive_method?: string | null;
  sexual_activity?: boolean;
  sleep_quality?: number | null;
  energy_level?: number | null;
  notes?: string | null;
}

export interface ExerciseLogRow extends BaseLogEntry, NormalizedTimestampMeta {
  user_id: string;
  exercise_type: string;
  duration_minutes: number;
  intensity_level: number;
  perceived_exertion?: number | null;
  indoor_outdoor?: 'indoor' | 'outdoor' | null;
  notes?: string | null;
}

export interface LogCrudConfig<TForm extends BaseLogEntry, THistory = TForm> {
  table: string;
  logType: LogType;
  emptyMessageCategory: LogType;
  defaultValues: TForm;
  historyLimit?: number;
  mapHistoryToForm?: (item: THistory) => TForm;
  buildInsertPayload: (formData: TForm, userId: string) => Record<string, unknown>;
  buildUpdatePayload: (formData: TForm) => Record<string, unknown>;
  historyQuery?: string;
  orderBy?: { column: string; ascending?: boolean };
}
