import type {
  BMLogRow,
  SymptomLogRow,
  FoodLogRow,
  HydrationLogRow,
  SleepLogRow,
  StressLogRow,
  MedicationLogRow,
  MenstrualCycleLogRow,
  ExerciseLogRow,
} from '../types/logs';
import type { CanonicalEvent, EventType } from '../types/canonicalEvents';
import { EVENT_TYPE_TO_SOURCE_TABLE } from '../types/canonicalEvents';

function deriveLocalDate(occurredAt: string): string {
  const iso = occurredAt.split('T')[0];
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  try {
    return new Date(occurredAt).toISOString().split('T')[0];
  } catch {
    return '1970-01-01';
  }
}

function deriveLocalHour(occurredAt: string): number {
  try {
    const timePart = occurredAt.split('T')[1];
    if (timePart) {
      const hour = parseInt(timePart.split(':')[0], 10);
      if (!isNaN(hour)) return hour;
    }
    return new Date(occurredAt).getUTCHours();
  } catch {
    return 0;
  }
}

interface TimestampMeta {
  local_date?: string | null;
  local_hour?: number | null;
  timezone?: string | null;
  completeness_score?: number | null;
}

function resolveTimestampFields(
  occurredAt: string,
  meta: TimestampMeta
): Pick<CanonicalEvent, 'local_date' | 'local_hour' | 'timezone' | 'completeness_score'> {
  return {
    local_date: meta.local_date ?? deriveLocalDate(occurredAt),
    local_hour: meta.local_hour ?? deriveLocalHour(occurredAt),
    timezone: meta.timezone ?? null,
    completeness_score: meta.completeness_score ?? null,
  };
}

function baseEvent(
  row: { id?: string; logged_at: string; user_id: string } & TimestampMeta,
  eventType: EventType
): Omit<CanonicalEvent, 'payload'> {
  const occurredAt = row.logged_at;
  const resolved = resolveTimestampFields(occurredAt, row);

  return {
    id: row.id ?? '',
    user_id: row.user_id,
    event_type: eventType,
    occurred_at: occurredAt,
    local_date: resolved.local_date,
    local_hour: resolved.local_hour,
    timezone: resolved.timezone,
    source_table: EVENT_TYPE_TO_SOURCE_TABLE[eventType],
    completeness_score: resolved.completeness_score,
  };
}

export function normalizeBMEvent(row: BMLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'bm'),
    payload: {
      bristol_type: row.bristol_type,
      urgency: row.urgency,
      incomplete_evacuation: row.incomplete_evacuation,
      blood_present: row.blood_present,
      mucus_present: row.mucus_present,
      pain_level: row.pain_level,
      difficulty_level: row.difficulty_level,
      amount: row.amount,
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeSymptomEvent(row: SymptomLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'symptom'),
    payload: {
      symptom_type: row.symptom_type,
      severity: row.severity,
      ...(row.duration_minutes != null && { duration_minutes: row.duration_minutes }),
      ...(row.location != null && { location: row.location }),
      ...(row.triggers != null && { triggers: row.triggers }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeFoodEvent(row: FoodLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'food'),
    payload: {
      food_items: row.food_items,
      meal_type: row.meal_type,
      ...(row.tags != null && { tags: row.tags }),
      ...(row.portion_size != null && { portion_size: row.portion_size }),
      ...(row.calories != null && { calories: row.calories }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeHydrationEvent(row: HydrationLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'hydration'),
    payload: {
      amount_ml: row.amount_ml,
      beverage_type: row.beverage_type,
      ...(row.beverage_category != null && { beverage_category: row.beverage_category }),
      ...(row.caffeine_content != null && { caffeine_content: row.caffeine_content }),
      ...(row.caffeine_mg != null && { caffeine_mg: row.caffeine_mg }),
      ...(row.effective_hydration_ml != null && {
        effective_hydration_ml: row.effective_hydration_ml,
      }),
      ...(row.water_goal_contribution_ml != null && {
        water_goal_contribution_ml: row.water_goal_contribution_ml,
      }),
      ...(row.electrolyte_present != null && {
        electrolyte_present: row.electrolyte_present,
      }),
      ...(row.alcohol_present != null && { alcohol_present: row.alcohol_present }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeSleepEvent(row: SleepLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'sleep'),
    payload: {
      duration_minutes: row.duration_minutes,
      quality: row.quality,
      sleep_start: row.sleep_start,
      sleep_end: row.sleep_end,
      ...(row.interruptions != null && { interruptions: row.interruptions }),
      ...(row.felt_rested != null && { felt_rested: row.felt_rested }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeStressEvent(row: StressLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'stress'),
    payload: {
      stress_level: row.stress_level,
      ...(row.triggers != null && { triggers: row.triggers }),
      ...(row.coping_methods != null && { coping_methods: row.coping_methods }),
      ...(row.physical_symptoms != null && { physical_symptoms: row.physical_symptoms }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeMedicationEvent(row: MedicationLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'medication'),
    payload: {
      medication_name: row.medication_name,
      dosage: row.dosage,
      taken_as_prescribed: row.taken_as_prescribed,
      medication_type: row.medication_type,
      ...(row.side_effects != null && { side_effects: row.side_effects }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeMenstrualCycleEvent(row: MenstrualCycleLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'menstrual_cycle'),
    payload: {
      cycle_day: row.cycle_day,
      flow_intensity: row.flow_intensity,
      ...(row.estimated_cycle_length != null && {
        estimated_cycle_length: row.estimated_cycle_length,
      }),
      ...(row.pain_level != null && { pain_level: row.pain_level }),
      ...(row.symptoms != null && { symptoms: row.symptoms }),
      ...(row.mood_notes != null && { mood_notes: row.mood_notes }),
      ...(row.color != null && { color: row.color }),
      ...(row.tissue_passed != null && { tissue_passed: row.tissue_passed }),
      ...(row.ovulation_indicators != null && {
        ovulation_indicators: row.ovulation_indicators,
      }),
      ...(row.basal_temp != null && { basal_temp: row.basal_temp }),
      ...(row.cervical_mucus_type != null && { cervical_mucus_type: row.cervical_mucus_type }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

export function normalizeExerciseEvent(row: ExerciseLogRow): CanonicalEvent {
  return {
    ...baseEvent(row, 'exercise'),
    payload: {
      exercise_type: row.exercise_type,
      duration_minutes: row.duration_minutes,
      intensity_level: row.intensity_level,
      ...(row.perceived_exertion != null && { perceived_exertion: row.perceived_exertion }),
      ...(row.indoor_outdoor != null && { indoor_outdoor: row.indoor_outdoor }),
      ...(row.notes != null && { notes: row.notes }),
    },
  };
}

type LogRowUnion =
  | BMLogRow
  | SymptomLogRow
  | FoodLogRow
  | HydrationLogRow
  | SleepLogRow
  | StressLogRow
  | MedicationLogRow
  | MenstrualCycleLogRow
  | ExerciseLogRow;

const NORMALIZERS: Record<EventType, (row: never) => CanonicalEvent> = {
  bm: normalizeBMEvent as (row: never) => CanonicalEvent,
  symptom: normalizeSymptomEvent as (row: never) => CanonicalEvent,
  food: normalizeFoodEvent as (row: never) => CanonicalEvent,
  hydration: normalizeHydrationEvent as (row: never) => CanonicalEvent,
  sleep: normalizeSleepEvent as (row: never) => CanonicalEvent,
  stress: normalizeStressEvent as (row: never) => CanonicalEvent,
  medication: normalizeMedicationEvent as (row: never) => CanonicalEvent,
  menstrual_cycle: normalizeMenstrualCycleEvent as (row: never) => CanonicalEvent,
  exercise: normalizeExerciseEvent as (row: never) => CanonicalEvent,
};

export function normalizeLogRowToCanonicalEvent(
  row: LogRowUnion,
  eventType: EventType
): CanonicalEvent {
  const normalizer = NORMALIZERS[eventType];
  return normalizer(row as never);
}

export function validateCanonicalEvent(event: CanonicalEvent): string[] {
  const errors: string[] = [];
  if (!event.id) errors.push('missing id');
  if (!event.user_id) errors.push('missing user_id');
  if (!event.event_type) errors.push('missing event_type');
  if (!event.occurred_at) errors.push('missing occurred_at');
  if (!event.local_date) errors.push('missing local_date');
  if (event.local_hour < 0 || event.local_hour > 23) errors.push('local_hour out of range');
  if (!event.source_table) errors.push('missing source_table');
  if (!event.payload || typeof event.payload !== 'object') errors.push('missing or invalid payload');
  return errors;
}

export function exampleNormalizationDemo(): void {
  const sampleBM: BMLogRow = {
    id: 'bm-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T09:30:00Z',
    bristol_type: 4,
    urgency: 2,
    pain_level: 1,
    difficulty_level: 1,
    amount: 'medium',
    incomplete_evacuation: false,
    blood_present: false,
    mucus_present: false,
  };

  const sampleSymptom: SymptomLogRow = {
    id: 'sym-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T10:00:00Z',
    symptom_type: 'bloating',
    severity: 3,
    local_date: '2026-04-08',
    local_hour: 10,
  };

  const sampleFood: FoodLogRow = {
    id: 'food-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T12:30:00Z',
    meal_type: 'lunch',
    food_items: ['salad', 'chicken'],
    tags: ['high-fiber'],
  };

  const sampleHydration: HydrationLogRow = {
    id: 'hyd-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T08:00:00Z',
    amount_ml: 500,
    beverage_type: 'water',
    beverage_category: 'water',
    caffeine_mg: 0,
    effective_hydration_ml: 500,
    water_goal_contribution_ml: 500,
    alcohol_present: false,
    electrolyte_present: false,
  };

  const sampleSleep: SleepLogRow = {
    id: 'slp-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T07:00:00Z',
    sleep_start: '2026-04-07T23:00:00Z',
    sleep_end: '2026-04-08T07:00:00Z',
    duration_minutes: 480,
    quality: 4,
  };

  const sampleStress: StressLogRow = {
    id: 'str-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T14:00:00Z',
    stress_level: 6,
    notes: 'work deadline',
  };

  const sampleMedication: MedicationLogRow = {
    id: 'med-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T08:15:00Z',
    medication_name: 'Probiotic',
    dosage: '1 capsule',
    medication_type: 'supplement',
    taken_as_prescribed: true,
  };

  const sampleMenstrual: MenstrualCycleLogRow = {
    id: 'mc-001',
    user_id: 'user-abc',
    logged_at: '2026-04-08T09:00:00Z',
    cycle_start_date: '2026-04-05',
    cycle_day: 4,
    flow_intensity: 'medium',
  };

  const allSamples: [LogRowUnion, EventType][] = [
    [sampleBM, 'bm'],
    [sampleSymptom, 'symptom'],
    [sampleFood, 'food'],
    [sampleHydration, 'hydration'],
    [sampleSleep, 'sleep'],
    [sampleStress, 'stress'],
    [sampleMedication, 'medication'],
    [sampleMenstrual, 'menstrual_cycle'],
  ];

  for (const [row, eventType] of allSamples) {
    const event = normalizeLogRowToCanonicalEvent(row, eventType);
    const errors = validateCanonicalEvent(event);
    console.log(`[${eventType}] valid=${errors.length === 0}`, errors.length ? errors : '', event);
  }
}
