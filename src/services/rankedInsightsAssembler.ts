import { supabase } from '../lib/supabase';
import type { CanonicalEvent } from '../types/canonicalEvents';
import type { UserDailyFeatures } from '../types/dailyFeatures';
import type { UserBaselineSet } from '../types/baselines';
import {
  normalizeBMEvent,
  normalizeSymptomEvent,
  normalizeFoodEvent,
  normalizeHydrationEvent,
  normalizeSleepEvent,
  normalizeStressEvent,
  normalizeMedicationEvent,
  normalizeMenstrualCycleEvent,
  normalizeExerciseEvent,
} from '../lib/canonicalEvents';
import { buildDailyFeatures } from '../lib/dailyFeatures';
import { computeUserBaselines } from '../lib/baselines';

export interface AssembledInsightInputs {
  dailyFeatures: UserDailyFeatures[];
  baselines: UserBaselineSet;
}

function lookbackDateISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function fetchTable<T>(
  table: string,
  userId: string,
  since: string
): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', since)
    .order('logged_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
  return (data ?? []) as T[];
}

export async function assembleRankedInsightInputs(
  userId: string,
  lookbackDays = 90
): Promise<AssembledInsightInputs | null> {
  const since = lookbackDateISO(lookbackDays);

  const [bmRows, symptomRows, foodRows, hydrationRows, sleepRows, stressRows, medicationRows, menstrualRows, exerciseRows] =
    await Promise.all([
      fetchTable<Parameters<typeof normalizeBMEvent>[0]>('bm_logs', userId, since),
      fetchTable<Parameters<typeof normalizeSymptomEvent>[0]>('symptom_logs', userId, since),
      fetchTable<Parameters<typeof normalizeFoodEvent>[0]>('food_logs', userId, since),
      fetchTable<Parameters<typeof normalizeHydrationEvent>[0]>('hydration_logs', userId, since),
      fetchTable<Parameters<typeof normalizeSleepEvent>[0]>('sleep_logs', userId, since),
      fetchTable<Parameters<typeof normalizeStressEvent>[0]>('stress_logs', userId, since),
      fetchTable<Parameters<typeof normalizeMedicationEvent>[0]>('medication_logs', userId, since),
      fetchTable<Parameters<typeof normalizeMenstrualCycleEvent>[0]>('menstrual_cycle_logs', userId, since),
      fetchTable<Parameters<typeof normalizeExerciseEvent>[0]>('exercise_logs', userId, since),
    ]);

  const allEvents: CanonicalEvent[] = [
    ...bmRows.map(normalizeBMEvent),
    ...symptomRows.map(normalizeSymptomEvent),
    ...foodRows.map(normalizeFoodEvent),
    ...hydrationRows.map(normalizeHydrationEvent),
    ...sleepRows.map(normalizeSleepEvent),
    ...stressRows.map(normalizeStressEvent),
    ...medicationRows.map(normalizeMedicationEvent),
    ...menstrualRows.map(normalizeMenstrualCycleEvent),
    ...exerciseRows.map(normalizeExerciseEvent),
  ];

  if (allEvents.length === 0) return null;

  const dailyFeatures = buildDailyFeatures(allEvents);
  const baselines = computeUserBaselines(dailyFeatures);

  if (!baselines) return null;

  return { dailyFeatures, baselines };
}
