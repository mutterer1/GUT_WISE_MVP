import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import { analyzeSleepSymptomCandidate } from './sleepSymptomCandidate';

function makeDay(
  date: string,
  overrides: Partial<UserDailyFeatures>
): UserDailyFeatures {
  return {
    user_id: 'demo-user',
    date,
    event_count: 5,
    logging_completeness_score: 0.8,
    bm_count: 1,
    avg_bristol: 4,
    hard_stool_count: 0,
    loose_stool_count: 0,
    urgency_event_count: 0,
    incomplete_evacuation_count: 0,
    blood_present_count: 0,
    mucus_present_count: 0,
    first_bm_hour: 8,
    last_bm_hour: 8,
    symptom_event_count: 1,
    symptom_burden_score: 3,
    max_symptom_severity: 2,
    symptom_types: ['bloating'],
    meal_count: 3,
    food_tag_set: [],
    late_meal: false,
    hydration_total_ml: 2000,
    hydration_event_count: 4,
    caffeine_beverage_count: 1,
    alcohol_beverage_count: 0,
    sleep_entry_count: 1,
    sleep_duration_minutes: 420,
    sleep_quality: 4,
    stress_event_count: 1,
    stress_avg: 3,
    stress_peak: 4,
    medication_event_count: 0,
    medications_taken: [],
    cycle_entry_count: 0,
    cycle_day: null,
    cycle_phase: null,
    exercise_minutes_total: 0,
    exercise_sessions_count: 0,
    moderate_vigorous_minutes: 0,
    movement_low_day: false,
    timezone: 'America/New_York',
    ...overrides,
  };
}

function makeDemoBaselines(): UserBaselineSet {
  return {
    user_id: 'demo-user',
    computed_from_start_date: '2026-03-01',
    computed_from_end_date: '2026-03-21',
    day_count: 21,
    sleep: {
      median_duration_minutes: 420,
      median_quality: 4,
      low_duration_threshold: 336,
      low_quality_threshold: 3,
    },
    hydration: {
      median_total_ml: 2000,
      low_hydration_threshold: 1500,
      high_hydration_threshold: 2500,
    },
    stress: {
      median_avg: 3,
      high_stress_threshold: 5,
      median_peak: 4,
    },
    symptoms: {
      median_burden: 3,
      high_burden_threshold: 6,
      median_max_severity: 2,
    },
    bowel_movement: {
      median_bm_count: 1,
      median_bristol: 4,
      typical_first_bm_hour: 8,
      high_urgency_threshold: 2,
    },
    routine: {
      late_meal_rate: 0.1,
      caffeine_beverage_rate: 0.5,
      alcohol_beverage_rate: 0.05,
    },
    data_quality: {
      average_event_count: 6,
      average_logging_completeness_score: 0.8,
    },
    exercise: {
      median_exercise_minutes: 0,
      median_moderate_vigorous_minutes: 0,
      active_day_rate: 0,
      low_movement_day_rate: 0,
    },
    cycle: {
      menstrual_phase_symptom_burden_median: null,
      luteal_phase_symptom_burden_median: null,
      menstrual_phase_bm_count_median: null,
      luteal_phase_bm_count_median: null,
      menstrual_phase_loose_stool_rate: null,
      luteal_phase_loose_stool_rate: null,
    },
    timezone: 'America/New_York',
  };
}

export function sleepSymptomCandidateDemo() {
  const features: UserDailyFeatures[] = [
    makeDay('2026-03-22', { sleep_duration_minutes: 300, sleep_quality: 2 }),
    makeDay('2026-03-23', { symptom_burden_score: 8, max_symptom_severity: 4 }),
    makeDay('2026-03-24', { sleep_duration_minutes: 420, sleep_quality: 4 }),
    makeDay('2026-03-25', { symptom_burden_score: 2, max_symptom_severity: 1 }),
    makeDay('2026-03-26', { sleep_duration_minutes: 280, sleep_quality: 2 }),
    makeDay('2026-03-27', { symptom_burden_score: 9, max_symptom_severity: 5 }),
    makeDay('2026-03-28', { sleep_duration_minutes: 400, sleep_quality: 4 }),
    makeDay('2026-03-29', { symptom_burden_score: 3, max_symptom_severity: 2 }),
    makeDay('2026-03-30', { sleep_duration_minutes: 310, sleep_quality: 2 }),
    makeDay('2026-03-31', { symptom_burden_score: 7, max_symptom_severity: 4 }),
    makeDay('2026-04-01', { sleep_duration_minutes: 450, sleep_quality: 5 }),
    makeDay('2026-04-02', { symptom_burden_score: 2, max_symptom_severity: 1 }),
    makeDay('2026-04-03', { sleep_duration_minutes: 320, sleep_quality: 2 }),
    makeDay('2026-04-04', { symptom_burden_score: 7, max_symptom_severity: 3 }),
    makeDay('2026-04-05', { sleep_duration_minutes: 430, sleep_quality: 4 }),
    makeDay('2026-04-06', { symptom_burden_score: 4, max_symptom_severity: 2 }),
  ];

  const baselines = makeDemoBaselines();
  const candidate = analyzeSleepSymptomCandidate(features, baselines);

  return { features, baselines, candidate };
}
