export type EventType =
  | 'bm'
  | 'symptom'
  | 'food'
  | 'hydration'
  | 'sleep'
  | 'stress'
  | 'medication'
  | 'menstrual_cycle'
  | 'exercise';

export interface CanonicalEvent {
  id: string;
  user_id: string;
  event_type: EventType;
  occurred_at: string;
  local_date: string;
  local_hour: number;
  timezone: string | null;
  source_table: string;
  payload: Record<string, unknown>;
  completeness_score: number | null;
}

export const EVENT_TYPE_TO_SOURCE_TABLE: Record<EventType, string> = {
  bm: 'bm_logs',
  symptom: 'symptom_logs',
  food: 'food_logs',
  hydration: 'hydration_logs',
  sleep: 'sleep_logs',
  stress: 'stress_logs',
  medication: 'medication_logs',
  menstrual_cycle: 'menstrual_cycle_logs',
  exercise: 'exercise_logs',
};
