export interface BowelMovementSection {
  enabled: boolean;
  bristol_type: number | null;
  blood_present: boolean;
  pain_level: number | null;
  notes: string;
  logged_at: string;
}

export interface SymptomsSection {
  enabled: boolean;
  symptom_type: string;
  severity: number;
  notes: string;
  logged_at: string;
}

export interface FoodSection {
  enabled: boolean;
  meal_type: string;
  food_items: string;
  notes: string;
  logged_at: string;
}

export interface HydrationSection {
  enabled: boolean;
  amount_ml: number;
  drink_type: string;
  logged_at: string;
}

export interface SleepSection {
  enabled: boolean;
  duration_minutes: number | null;
  quality: number | null;
  notes: string;
  logged_at: string;
}

export interface StressSection {
  enabled: boolean;
  stress_level: number;
  notes: string;
  logged_at: string;
}

export interface ExerciseSection {
  enabled: boolean;
  exercise_type: string;
  duration_minutes: number | null;
  intensity: string;
  notes: string;
  logged_at: string;
}

export interface MedicationSection {
  enabled: boolean;
  medication_name: string;
  dosage: string;
  notes: string;
  logged_at: string;
}

export interface MenstrualCycleSection {
  enabled: boolean;
  cycle_phase: string;
  flow_intensity: string;
  notes: string;
  logged_at: string;
}

export interface DailyCheckInDraft {
  bowelMovement: BowelMovementSection;
  symptoms: SymptomsSection;
  food: FoodSection;
  hydration: HydrationSection;
  sleep: SleepSection;
  stress: StressSection;
  exercise: ExerciseSection;
  medication: MedicationSection;
  menstrualCycle: MenstrualCycleSection;
}
