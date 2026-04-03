export interface DashboardMetrics {
  todayBMCount: number;
  averageBristolScale: number | null;
  todaySymptoms: Array<{
    symptom_type: string;
    severity: number;
    logged_at: string;
  }>;
  todayHydration: {
    total_ml: number;
    target_ml: number;
    entries: number;
  };
  recentMedications: Array<{
    id: string;
    medication_name: string;
    dosage: string;
    logged_at: string;
    taken_as_prescribed: boolean;
  }>;
  todayFood: {
    meals: number;
    snacks: number;
  };
  lastSleep: {
    duration_minutes: number | null;
    quality: number | null;
    felt_rested: boolean;
  } | null;
  todayStress: {
    average_level: number | null;
    count: number;
  };
}

export const DEFAULT_HYDRATION_TARGET_ML = 2000;
