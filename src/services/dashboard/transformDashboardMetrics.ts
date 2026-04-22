import { DashboardMetrics, DEFAULT_HYDRATION_TARGET_ML } from '../../types/dashboard';

interface BMLogRow {
  bristol_type: number;
}

interface SymptomLogRow {
  symptom_type: string;
  severity: number;
  logged_at: string;
}

interface HydrationLogRow {
  amount_ml: number;
}

interface MedicationLogRow {
  id: string;
  medication_name: string;
  dosage: string;
  logged_at: string;
  taken_as_prescribed: boolean;
}

interface FoodLogRow {
  meal_type: string;
}

interface SleepLogRow {
  duration_minutes: number | null;
  quality: number | null;
  felt_rested: boolean;
  logged_at: string;
}

interface StressLogRow {
  stress_level: number;
}

export interface RawDashboardQueryResults {
  bmLogs: BMLogRow[];
  symptomLogs: SymptomLogRow[];
  hydrationLogs: HydrationLogRow[];
  medicationLogs: MedicationLogRow[];
  foodLogs: FoodLogRow[];
  sleepLogs: SleepLogRow[];
  stressLogs: StressLogRow[];
}

const MEAL_TYPES = new Set(['breakfast', 'lunch', 'dinner']);

export function calculateAverageBristol(logs: BMLogRow[]): number | null {
  if (logs.length === 0) return null;
  const sum = logs.reduce((acc, log) => acc + log.bristol_type, 0);
  return Math.round((sum / logs.length) * 10) / 10;
}

export function calculateHydrationSummary(
  logs: HydrationLogRow[],
  targetMl = DEFAULT_HYDRATION_TARGET_ML
): DashboardMetrics['todayHydration'] {
  return {
    total_ml: logs.reduce((sum, log) => sum + log.amount_ml, 0),
    target_ml: targetMl,
    entries: logs.length,
  };
}

export function calculateFoodSummary(logs: FoodLogRow[]): DashboardMetrics['todayFood'] {
  const meals = logs.filter((log) => MEAL_TYPES.has(log.meal_type)).length;
  const snacks = logs.filter((log) => log.meal_type === 'snack').length;
  return { meals, snacks };
}

export function mapLastSleep(logs: SleepLogRow[]): DashboardMetrics['lastSleep'] {
  const log = logs[0] ?? null;
  if (!log) return null;
  return {
    duration_minutes: log.duration_minutes,
    quality: log.quality,
    felt_rested: log.felt_rested,
  };
}

export function calculateAverageStress(logs: StressLogRow[]): DashboardMetrics['todayStress'] {
  const average_level =
    logs.length > 0
      ? Math.round((logs.reduce((sum, log) => sum + log.stress_level, 0) / logs.length) * 10) / 10
      : null;
  return { average_level, count: logs.length };
}

export function mapTodaySymptoms(logs: SymptomLogRow[]): DashboardMetrics['todaySymptoms'] {
  return logs.map((log) => ({
    symptom_type: log.symptom_type,
    severity: log.severity,
    logged_at: log.logged_at,
  }));
}

export function mapRecentMedications(
  logs: MedicationLogRow[]
): DashboardMetrics['recentMedications'] {
  return logs.map((log) => ({
    id: log.id,
    medication_name: log.medication_name,
    dosage: log.dosage,
    logged_at: log.logged_at,
    taken_as_prescribed: log.taken_as_prescribed,
  }));
}

export function transformDashboardMetrics(raw: RawDashboardQueryResults): DashboardMetrics {
  return {
    todayBMCount: raw.bmLogs.length,
    averageBristolScale: calculateAverageBristol(raw.bmLogs),
    todaySymptoms: mapTodaySymptoms(raw.symptomLogs),
    todayHydration: calculateHydrationSummary(raw.hydrationLogs),
    recentMedications: mapRecentMedications(raw.medicationLogs),
    todayFood: calculateFoodSummary(raw.foodLogs),
    lastSleep: mapLastSleep(raw.sleepLogs),
    todayStress: calculateAverageStress(raw.stressLogs),
  };
}
