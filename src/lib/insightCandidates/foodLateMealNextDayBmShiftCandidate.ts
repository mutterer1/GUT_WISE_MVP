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
import { getNextDayPairings } from './hydrationStoolConsistencyCandidate';

const INSIGHT_KEY = 'food_late_meal_next_day_bm_shift';

function hasFoodData(day: UserDailyFeatures): boolean {
  return day.meal_count > 0;
}

function isLateMealDay(day: UserDailyFeatures): boolean {
  return day.late_meal === true;
}

function hasBmShiftNextDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const medianBristol = baselines.bowel_movement.median_bristol;
  const typicalFirstBmHour = baselines.bowel_movement.typical_first_bm_hour;

  const harderStool =
    day.avg_bristol !== null &&
    medianBristol !== null &&
    day.avg_bristol < medianBristol;

  const earlierFirstBm =
    day.first_bm_hour !== null &&
    typicalFirstBmHour !== null &&
    day.first_bm_hour < typicalFirstBmHour - 1;

  return harderStool || earlierFirstBm;
}

export function analyzeFoodLateMealNextDayBmShiftCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < 2) return null;

  if (
    baselines.bowel_movement.median_bristol === null &&
    baselines.bowel_movement.typical_first_bm_hour === null
  ) {
    return null;
  }

  const pairs = getNextDayPairings(features);
  if (pairs.length === 0) return null;

  const eligiblePairs = pairs.filter((p) => hasFoodData(p.hydrationDay));
  if (eligiblePairs.length === 0) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  const supportDates: string[] = [];

  let nonExposedCount = 0;
  let nonExposedShiftCount = 0;

  for (const pair of eligiblePairs) {
    const lateMeal = isLateMealDay(pair.hydrationDay);
    const bmShift = hasBmShiftNextDay(pair.nextDay, baselines);

    if (lateMeal) {
      exposureCount++;
      if (bmShift) {
        supportCount++;
        supportDates.push(pair.hydrationDay.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      if (bmShift) {
        nonExposedShiftCount++;
      }
    }
  }

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedShiftCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);

  const sufficiency = computeDataSufficiency(eligiblePairs.length, exposureCount);
  const status = computeStatus(sufficiency, supportCount, exposedRate, baselineRate);
  const confidence = computeConfidence(sufficiency, supportCount, contradictionCount, lift);

  const sorted = [...features].sort((a, b) => a.date.localeCompare(b.date));

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: exposureCount,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    statistics: {
      eligible_pair_count: eligiblePairs.length,
      non_exposed_count: nonExposedCount,
      non_exposed_shift_count: nonExposedShiftCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'food',
    subtype: 'late_meal_next_day_bm_shift',
    trigger_factors: ['late_meal'],
    target_outcomes: ['avg_bristol', 'first_bm_hour'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: sorted[sorted.length - 1].date,
  };
}
