export interface DailyCheckInSectionState {
  enabled: boolean;
}

export interface DailyCheckInDraft {
  logged_at: string;
  bowelMovement: DailyCheckInSectionState & {
    bristol_type: number;
    urgency: number;
    pain_level: number;
    blood_present: boolean;
    mucus_present: boolean;
    notes: string;
  };
  symptoms: DailyCheckInSectionState & {
    symptom_type: string;
    severity: number;
    duration_minutes: number;
    notes: string;
  };
  food: DailyCheckInSectionState & {
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: string;
    tags: string;
    notes: string;
  };
  hydration: DailyCheckInSectionState & {
    amount_ml: number;
    beverage_type: string;
    caffeine_content: boolean;
  };
  sleep: DailyCheckInSectionState & {
    sleep_start: string;
    sleep_end: string;
    quality: number;
    felt_rested: boolean;
  };
  stress: DailyCheckInSectionState & {
    stress_level: number;
    notes: string;
  };
  exercise: DailyCheckInSectionState & {
    exercise_type: string;
    duration_minutes: number;
    intensity_level: number;
  };
  medication: DailyCheckInSectionState & {
    medication_name: string;
    dosage: string;
    medication_type: 'prescription' | 'otc' | 'supplement';
  };
  menstrualCycle: DailyCheckInSectionState & {
    cycle_start_date: string;
    cycle_day: number;
    flow_intensity: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
    pain_level: number;
  };
}
