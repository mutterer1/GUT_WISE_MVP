import { DashboardMetrics, DEFAULT_HYDRATION_TARGET_ML } from '../../types/dashboard';

interface RawBMLog {
  bristol_type: number;
}

interface RawSymptomLog {
  symptom_type: string;
  severity: number;
  logged_at: string;
}

interface RawHydrationLog {
  amount_ml: number;
}

interface RawMedicationLog {
  id: string;
  medication_name: string;
  dosage: string;
  logged_at: string;
  taken_as_prescribed: boolean;
}

interface RawFoodLog {
  meal_type: string;
}

interface RawSleepLog {
  duration_minutes: number | null;
  quality: number | null;
  felt_rested: boolean;
}

interface RawStressLog {
  stress_level: number;
}

export interface RawDashboardQueryResults {
  bmLogs: RawBMLog[];
  symptomLogs: RawSymptomLog[];
  hydrationLogs: RawHydrationLog[];
  medicationLogs: RawMedicationLog[];
  foodLogs: RawFoodLog[];
  sleepLogs: RawSleepLog[];
  stressLogs: RawStressLog[];
}

export function calculateAverageBristol(logs: RawBMLog[]): number | null {
  if (logs.length === 0) return null;
  return logs.reduce((sum, log) => sum + log.bristol_scale, 0) / logs.length;
}

export function calculateHydrationSummary(
  logs: RawHydrationLog[],
  targetMl = DEFAULT_HYDRATION_TARGET_ML
): DashboardMetrics['todayHydration'] {
  return {
    total_ml: logs.reduce((sum, log) => sum + log.amount_ml, 0),
    target_ml: targetMl,
    entries: logs.length,
  };
}

export function calculateFoodSummary(logs: RawFoodLog[]): DashboardMetrics['todayFood'] {
  const meals = logs.filter((log) =>
    ['breakfast', 'lunch', 'dinner'].includes(log.meal_type)
  ).length;
  const snacks = logs.filter((log) => log.meal_type === 'snack').length;
  return { meals, snacks };
}

export function mapLastSleep(logs: RawSleepLog[]): DashboardMetrics['lastSleep'] {
  const log = logs[0] ?? null;
  if (!log) return null;
  return {
    duration_minutes: log.duration_minutes,
    quality: log.quality,
    felt_rested: log.felt_rested,
  };
}

export function calculateAverageStress(
  logs: RawStressLog[]
): DashboardMetrics['todayStress'] {
  const average_level =
    logs.length > 0
      ? logs.reduce((sum, log) => sum + log.stress_level, 0) / logs.length
      : null;
  return { average_level, count: logs.length };
}

export function transformDashboardMetrics(raw: RawDashboardQueryResults): DashboardMetrics {
  return {
    todayBMCount: raw.bmLogs.length,
    averageBristolScale: calculateAverageBristol(raw.bmLogs),
    todaySymptoms: raw.symptomLogs,
    todayHydration: calculateHydrationSummary(raw.hydrationLogs),
    recentMedications: raw.medicationLogs,
    todayFood: calculateFoodSummary(raw.foodLogs),
    lastSleep: mapLastSleep(raw.sleepLogs),
    todayStress: calculateAverageStress(raw.stressLogs),
  };
}
