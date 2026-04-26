import { supabase } from '../lib/supabase';
import type { SaveEvent } from './saveEventManager';

export type LogRoutineType = SaveEvent['logType'];

export interface LogRoutine {
  id: string;
  user_id: string;
  log_type: LogRoutineType;
  routine_name: string;
  source_log_id: string | null;
  routine_payload: Record<string, unknown>;
  usage_count: number;
  last_used_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface CreateLogRoutineInput {
  userId: string;
  logType: LogRoutineType;
  routineName: string;
  entry: Record<string, unknown>;
  sourceLogId?: string | null;
}

const OMITTED_ROUTINE_KEYS = new Set([
  'id',
  'user_id',
  'created_at',
  'updated_at',
]);

const LOG_TYPE_LABELS: Record<LogRoutineType, string> = {
  bm: 'BM',
  food: 'Food',
  symptoms: 'Symptom',
  sleep: 'Sleep',
  stress: 'Stress',
  hydration: 'Hydration',
  medication: 'Medication',
  'menstrual-cycle': 'Cycle',
  exercise: 'Exercise',
};

function stringValue(entry: Record<string, unknown>, key: string): string {
  const value = entry[key];
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(entry: Record<string, unknown>, key: string): number | null {
  const value = entry[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function getFoodRoutineName(entry: Record<string, unknown>): string {
  const foodItems = entry.food_items;
  if (!Array.isArray(foodItems)) return '';

  const names = foodItems
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (typeof item === 'object' && item !== null && 'name' in item) {
        const name = (item as { name?: unknown }).name;
        return typeof name === 'string' ? name.trim() : '';
      }
      return '';
    })
    .filter(Boolean);

  return names.slice(0, 2).join(', ');
}

export function buildRoutinePayload(entry: Record<string, unknown>): Record<string, unknown> {
  return Object.entries(entry).reduce<Record<string, unknown>>((payload, [key, value]) => {
    if (!OMITTED_ROUTINE_KEYS.has(key)) {
      payload[key] = value;
    }

    return payload;
  }, {});
}

export function buildDefaultRoutineName(
  logType: LogRoutineType,
  entry: Record<string, unknown>
): string {
  const candidate =
    logType === 'food'
      ? getFoodRoutineName(entry)
      : logType === 'medication'
        ? stringValue(entry, 'medication_name')
        : logType === 'symptoms'
          ? stringValue(entry, 'symptom_type')
          : logType === 'hydration'
            ? stringValue(entry, 'beverage_type')
            : logType === 'exercise'
              ? stringValue(entry, 'exercise_type')
              : logType === 'stress'
                ? `Stress ${numberValue(entry, 'stress_level') ?? ''}`.trim()
                : logType === 'bm'
                  ? `Bristol Type ${numberValue(entry, 'bristol_type') ?? ''}`.trim()
                  : logType === 'menstrual-cycle'
                    ? `Cycle day ${numberValue(entry, 'cycle_day') ?? ''}`.trim()
                    : '';

  if (candidate.length > 0) {
    return candidate;
  }

  return `${LOG_TYPE_LABELS[logType]} routine`;
}

export async function fetchLogRoutines(userId: string, limit = 8): Promise<LogRoutine[]> {
  const { data, error } = await supabase
    .from('user_log_routines')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('usage_count', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []) as LogRoutine[];
}

export async function createLogRoutine(input: CreateLogRoutineInput): Promise<LogRoutine> {
  const routineName = input.routineName.trim();
  if (!routineName) {
    throw new Error('Routine name is required');
  }

  const { data, error } = await supabase
    .from('user_log_routines')
    .insert({
      user_id: input.userId,
      log_type: input.logType,
      routine_name: routineName,
      source_log_id: input.sourceLogId ?? null,
      routine_payload: buildRoutinePayload(input.entry),
    })
    .select('*')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Saved routine but did not receive it back from Supabase');

  return data as LogRoutine;
}

export async function markLogRoutineUsed(routineId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_user_log_routine_usage', {
    p_routine_id: routineId,
  });

  if (error) throw error;
}

export async function deleteLogRoutine(userId: string, routineId: string): Promise<void> {
  const { error } = await supabase
    .from('user_log_routines')
    .delete()
    .eq('id', routineId)
    .eq('user_id', userId);

  if (error) throw error;
}