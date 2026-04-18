import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate, CandidateEvidence } from '../../types/insightCandidates';
import {
  safeRate,
  computeDataSufficiency,
  computeStatus,
  computeConfidence,
  computeLift,
  computeContradictionRate,
  computeRecencyWeight,
  computeEvidenceQuality,
  buildEvidenceGaps,
  buildUncertaintyStatement,
} from './sharedCandidateUtils';
import { getNextDayPairings } from './hydrationStoolConsistencyCandidate';

const INSIGHT_KEY = 'food_late_meal_next_day_bm_shift';

function hasFoodData(day: UserDailyFeatures): boolean {
  return day.meal_count > 0;
}

function isLateMealDay(day: UserDailyFeatures): boolean {
  return day.late_meal === true;
}

function hasBmContext(day: UserDailyFeatures): boolean {
  return day.bm_count > 0 && (day.avg_bristol !== null || day.first_bm_hour !== null);
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

  const sorted = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const pairs = getNextDayPairings(sorted);
  if (pairs.length === 0) return null;

  const eligiblePairs = pairs.filter(
    (pair) => hasFoodData(pair.hydrationDay) && hasBmContext(pair.nextDay)
  );
  if (eligiblePairs.length === 0) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedShiftCount = 0;

  const supportDates: string[] = [];
  const exposedDates: string[] = [];
  const baselineDates: string[] = [];

  for (const pair of eligiblePairs) {
    const lateMeal = isLateMealDay(pair.hydrationDay);
    const bmShift = hasBmShiftNextDay(pair.nextDay, baselines);

    if (lateMeal) {
      exposureCount++;
      exposedDates.push(pair.hydrationDay.date);

      if (bmShift) {
        supportCount++;
        supportDates.push(pair.hydrationDay.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      baselineDates.push(pair.hydrationDay.date);

      if (bmShift) {
        nonExposedShiftCount++;
      }
    }
  }

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedShiftCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);

  const supportingLogTypes = ['food', 'bm'];
  const missingLogTypes: string[] = [];

  if (pairs.some((pair) => !hasFoodData(pair.hydrationDay))) {
    missingLogTypes.push('food');
  }

  if (pairs.some((pair) => !hasBmContext(pair.nextDay))) {
    missingLogTypes.push('bm');
  }

  const sufficiency = computeDataSufficiency(
    eligiblePairs.length,
    exposureCount,
    nonExposedCount
  );

  const recencyWeight = computeRecencyWeight(
    supportDates,
    sorted[sorted.length - 1].date
  );

  const evidenceGaps = buildEvidenceGaps({
    eligibleDayCount: eligiblePairs.length,
    exposureCount,
    contrastCount: nonExposedCount,
    supportCount,
    contradictionCount,
    supportingLogTypes,
    endDate: sorted[sorted.length - 1].date,
    sampleDates: supportDates,
  });

  const evidenceQuality = computeEvidenceQuality(
    sufficiency,
    supportCount,
    contradictionCount,
    exposureCount,
    nonExposedCount,
    recencyWeight,
    supportingLogTypes
  );

  const status = computeStatus(
    sufficiency,
    supportCount,
    exposedRate,
    baselineRate,
    contradictionCount,
    exposureCount,
    nonExposedCount,
    evidenceQuality
  );

  const confidence = computeConfidence(
    sufficiency,
    supportCount,
    contradictionCount,
    lift,
    exposureCount,
    nonExposedCount,
    recencyWeight,
    supportingLogTypes
  );

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: exposureCount,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    contrast_count: nonExposedCount,
    eligible_day_count: eligiblePairs.length,
    exposed_day_count: exposureCount,
    baseline_day_count: nonExposedCount,
    contradiction_rate: computeContradictionRate(contradictionCount, exposureCount),
    recency_weight: recencyWeight,
    evidence_quality: evidenceQuality,
    supporting_log_types: supportingLogTypes,
    missing_log_types: missingLogTypes,
    exposed_dates: exposedDates.slice(0, 10),
    baseline_dates: baselineDates.slice(0, 10),
    uncertainty_statement: buildUncertaintyStatement(evidenceGaps),
    evidence_gaps: evidenceGaps,
    notes: ['Paired-day analysis comparing late-meal days against the following day.'],
    statistics: {
      eligible_pair_count: eligiblePairs.length,
      non_exposed_count: nonExposedCount,
      non_exposed_shift_count: nonExposedShiftCount,
      total_pair_count: pairs.length,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'food',
    subtype: 'food_late_meal_next_day_bm_shift',
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
