import { supabase } from '../../lib/supabase';
import { DashboardMetrics } from '../../types/dashboard';
import { RawDashboardQueryResults, transformDashboardMetrics } from './transformDashboardMetrics';

function getStartOfTodayISO(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

function assertNoQueryErrors(results: Array<{ error: unknown }>) {
  for (const result of results) {
    if (result.error) {
      throw result.error;
    }
  }
}

export async function fetchDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const todayISO = getStartOfTodayISO();

  const [
    bmResult,
    symptomsResult,
    hydrationResult,
    medicationResult,
    foodResult,
    sleepResult,
    stressResult,
  ] = await Promise.all([
    supabase
      .from('bm_logs')
      .select('bristol_type')
      .eq('user_id', userId)
      .gte('logged_at', todayISO),

    supabase
      .from('symptom_logs')
      .select('symptom_type, severity, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', todayISO)
      .order('logged_at', { ascending: false }),

    supabase
      .from('hydration_logs')
      .select('amount_ml')
      .eq('user_id', userId)
      .gte('logged_at', todayISO),

    supabase
      .from('medication_logs')
      .select('id, medication_name, dosage, logged_at, taken_as_prescribed')
      .eq('user_id', userId)
      .gte('logged_at', todayISO)
      .order('logged_at', { ascending: false })
      .limit(5),

    supabase
      .from('food_logs')
      .select('meal_type')
      .eq('user_id', userId)
      .gte('logged_at', todayISO),

    supabase
      .from('sleep_logs')
      .select('duration_minutes, quality, felt_rested, sleep_start')
      .eq('user_id', userId)
      .order('sleep_start', { ascending: false })
      .limit(1),

    supabase
      .from('stress_logs')
      .select('stress_level')
      .eq('user_id', userId)
      .gte('logged_at', todayISO),
  ]);

  assertNoQueryErrors([
    bmResult,
    symptomsResult,
    hydrationResult,
    medicationResult,
    foodResult,
    sleepResult,
    stressResult,
  ]);

  const raw: RawDashboardQueryResults = {
    bmLogs: bmResult.data ?? [],
    symptomLogs: symptomsResult.data ?? [],
    hydrationLogs: hydrationResult.data ?? [],
    medicationLogs: medicationResult.data ?? [],
    foodLogs: foodResult.data ?? [],
    sleepLogs: sleepResult.data ?? [],
    stressLogs: stressResult.data ?? [],
  };

  return transformDashboardMetrics(raw);
}
