import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import { analyzeStressUrgencyCandidate } from './stressUrgencyCandidate';

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
      high_urgency_threshold: 1,
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
    timezone: 'America/New_York',
  };
}

// 16 days of data:
// - Days with high stress (avg > 5 or peak > 4) and urgency > 1 = support
// - Days with high stress but no urgency = contradiction
// - Days with normal stress = non-exposed comparison group
//
// Expected with these baselines (high_stress_threshold: 5, median_peak: 4,
// high_urgency_threshold: 1):
//   High stress days: Mar 22, 24, 26, 28, 30 (5 days)
//   Of those, urgency elevated (>1): Mar 22, 26, 28, 30 (4 support)
//   Contradiction: Mar 24 (1 day, high stress but urgency=0)
//   Non-exposed: 11 days, of which Mar 31 has urgency=2 (1 elevated)
//   exposed_rate = 4/5 = 0.800
//   baseline_rate = 1/11 = 0.091
//   lift = 0.800 / 0.091 = 8.79
//   sufficiency = strong (16 eligible, 5 exposure)
//   status = reliable (clear lift, support >= 4, sufficiency strong)
export function stressUrgencyCandidateDemo() {
  const features: UserDailyFeatures[] = [
    makeDay('2026-03-22', { stress_avg: 6, stress_peak: 7, urgency_event_count: 2 }),
    makeDay('2026-03-23', { stress_avg: 2, stress_peak: 3, urgency_event_count: 0 }),
    makeDay('2026-03-24', { stress_avg: 6, stress_peak: 5, urgency_event_count: 0 }),
    makeDay('2026-03-25', { stress_avg: 3, stress_peak: 4, urgency_event_count: 0 }),
    makeDay('2026-03-26', { stress_avg: 7, stress_peak: 8, urgency_event_count: 3 }),
    makeDay('2026-03-27', { stress_avg: 2, stress_peak: 3, urgency_event_count: 0 }),
    makeDay('2026-03-28', { stress_avg: 5.5, stress_peak: 6, urgency_event_count: 2 }),
    makeDay('2026-03-29', { stress_avg: 3, stress_peak: 4, urgency_event_count: 0 }),
    makeDay('2026-03-30', { stress_avg: 6, stress_peak: 7, urgency_event_count: 2 }),
    makeDay('2026-03-31', { stress_avg: 3, stress_peak: 3, urgency_event_count: 2 }),
    makeDay('2026-04-01', { stress_avg: 2, stress_peak: 3, urgency_event_count: 0 }),
    makeDay('2026-04-02', { stress_avg: 3, stress_peak: 4, urgency_event_count: 0 }),
    makeDay('2026-04-03', { stress_avg: 2, stress_peak: 3, urgency_event_count: 0 }),
    makeDay('2026-04-04', { stress_avg: 3, stress_peak: 4, urgency_event_count: 1 }),
    makeDay('2026-04-05', { stress_avg: 2, stress_peak: 2, urgency_event_count: 0 }),
    makeDay('2026-04-06', { stress_avg: 3, stress_peak: 3, urgency_event_count: 0 }),
  ];

  const baselines = makeDemoBaselines();
  const candidate = analyzeStressUrgencyCandidate(features, baselines);

  return { features, baselines, candidate };
}
