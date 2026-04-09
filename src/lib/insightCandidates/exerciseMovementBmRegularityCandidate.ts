import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type {
  InsightCandidate,
  CandidateEvidence,
} from '../../types/insightCandidates';
import {
  safeRate,
  computeDataSufficiency,
  computeStatus,
  computeConfidence,
  computeLift,
} from './sharedCandidateUtils';

const INSIGHT_KEY = 'exercise_low_movement_same_day_bm_regularity';

export function isLowMovementDay(day: UserDailyFeatures): boolean {
  return day.movement_low_day === true;
}

export function isReducedBmDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const median = baselines.bowel_movement.median_bm_count;
  if (median === null) {
    return day.bm_count === 0;
  }
  return day.bm_count < median;
}

function hasExerciseData(day: UserDailyFeatures): boolean {
  return day.exercise_sessions_count > 0 || day.exercise_minutes_total > 0 || day.movement_low_day === true;
}

export function analyzeExerciseMovementBmRegularityCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  const eligibleDays = features.filter(hasExerciseData);
  if (eligibleDays.length < 5) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  const supportDates: string[] = [];

  let nonExposedCount = 0;
  let nonExposedReducedCount = 0;

  for (const day of eligibleDays) {
    const lowMovement = isLowMovementDay(day);
    const reducedBm = isReducedBmDay(day, baselines);

    if (lowMovement) {
      exposureCount++;
      if (reducedBm) {
        supportCount++;
        supportDates.push(day.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      if (reducedBm) {
        nonExposedReducedCount++;
      }
    }
  }

  if (exposureCount < 2) return null;

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedReducedCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);

  const sufficiency = computeDataSufficiency(eligibleDays.length, exposureCount);
  const status = computeStatus(sufficiency, supportCount, exposedRate, baselineRate);
  const confidence = computeConfidence(sufficiency, supportCount, contradictionCount, lift);

  const sorted = [...eligibleDays].sort((a, b) => a.date.localeCompare(b.date));

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: exposureCount,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    statistics: {
      eligible_day_count: eligibleDays.length,
      non_exposed_count: nonExposedCount,
      non_exposed_reduced_count: nonExposedReducedCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'exercise',
    subtype: 'low_movement_bm_regularity',
    trigger_factors: ['movement_low_day'],
    target_outcomes: ['bm_count'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: sorted[sorted.length - 1].date,
  };
}
