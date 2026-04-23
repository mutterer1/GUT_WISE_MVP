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
import {
  hasFoodData,
  hasUsableNutritionCoverage,
  average,
  adjustConfidenceForCoverage,
} from './nutritionSignalCandidateUtils';

const INSIGHT_KEY = 'food_low_fiber_next_day_hard_stool';

function hasBmContext(day: UserDailyFeatures): boolean {
  return (
    day.bm_count > 0 &&
    (day.avg_bristol !== null ||
      day.hard_stool_count > 0 ||
      day.incomplete_evacuation_count > 0)
  );
}

function isLowFiberDay(day: UserDailyFeatures): boolean {
  if (!hasUsableNutritionCoverage(day)) return false;

  const fiberTotal = day.fiber_g_total ?? 0;
  const fiberDensity = day.fiber_g_per_1000kcal ?? null;
  const calories = day.calories_kcal_total ?? 0;

  return (
    fiberTotal <= 10 ||
    (calories >= 400 && fiberDensity !== null && fiberDensity <= 7)
  );
}

function isHardStoolNextDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const medianBristol = baselines.bowel_movement.median_bristol;

  const belowTypicalBristol =
    day.avg_bristol !== null &&
    medianBristol !== null &&
    day.avg_bristol < medianBristol;

  const clearlyHardBristol = day.avg_bristol !== null && day.avg_bristol <= 3;

  return (
    day.hard_stool_count > 0 ||
    day.incomplete_evacuation_count > 0 ||
    clearlyHardBristol ||
    belowTypicalBristol
  );
}

export function analyzeFoodLowFiberNextDayHardStoolCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < 2) return null;

  const sorted = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const pairs = getNextDayPairings(sorted);
  if (pairs.length === 0) return null;

  const eligiblePairs = pairs.filter(
    (pair) => hasFoodData(pair.hydrationDay) && hasBmContext(pair.nextDay)
  );
  if (eligiblePairs.length < 5) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedHardStoolCount = 0;

  const supportDates: string[] = [];
  const exposedDates: string[] = [];
  const baselineDates: string[] = [];
  const exposureFiberTotals: number[] = [];
  const exposureFiberDensities: number[] = [];
  const exposureCoverageValues: number[] = [];
  const exposureNutritionConfidenceValues: number[] = [];

  for (const pair of eligiblePairs) {
    const lowFiber = isLowFiberDay(pair.hydrationDay);
    const hardStoolNextDay = isHardStoolNextDay(pair.nextDay, baselines);

    if (lowFiber) {
      exposureCount++;
      exposedDates.push(pair.hydrationDay.date);
      exposureFiberTotals.push(pair.hydrationDay.fiber_g_total ?? 0);
      if (pair.hydrationDay.fiber_g_per_1000kcal !== null && pair.hydrationDay.fiber_g_per_1000kcal !== undefined) {
        exposureFiberDensities.push(pair.hydrationDay.fiber_g_per_1000kcal);
      }
      if (pair.hydrationDay.nutrition_coverage_ratio !== null && pair.hydrationDay.nutrition_coverage_ratio !== undefined) {
        exposureCoverageValues.push(pair.hydrationDay.nutrition_coverage_ratio);
      }
      if (pair.hydrationDay.nutrition_confidence_avg !== null && pair.hydrationDay.nutrition_confidence_avg !== undefined) {
        exposureNutritionConfidenceValues.push(pair.hydrationDay.nutrition_confidence_avg);
      }

      if (hardStoolNextDay) {
        supportCount++;
        supportDates.push(pair.hydrationDay.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      baselineDates.push(pair.hydrationDay.date);

      if (hardStoolNextDay) {
        nonExposedHardStoolCount++;
      }
    }
  }

  if (exposureCount === 0) return null;

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedHardStoolCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);

  const supportingLogTypes = ['food', 'gut'];
  const missingLogTypes: string[] = [];

  if (pairs.some((pair) => !hasFoodData(pair.hydrationDay))) {
    missingLogTypes.push('food');
  }

  if (pairs.some((pair) => !hasBmContext(pair.nextDay))) {
    missingLogTypes.push('gut');
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

  const avgExposureCoverage = average(exposureCoverageValues);
  const avgNutritionConfidence = average(exposureNutritionConfidenceValues);
  const adjustedConfidence = adjustConfidenceForCoverage(
    confidence,
    avgExposureCoverage,
    avgNutritionConfidence
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
    notes: [
      'Paired-day analysis comparing lower-fiber days with the following day bowel pattern.',
      'Exposure requires usable nutrition coverage so this rule stays nutrient-backed rather than tag-backed.',
    ],
    statistics: {
      eligible_pair_count: eligiblePairs.length,
      non_exposed_count: nonExposedCount,
      non_exposed_hard_stool_count: nonExposedHardStoolCount,
      average_exposed_fiber_g: average(exposureFiberTotals),
      average_exposed_fiber_g_per_1000kcal: average(exposureFiberDensities),
      average_exposed_nutrition_coverage_ratio: avgExposureCoverage,
      average_exposed_nutrition_confidence: avgNutritionConfidence,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'food',
    subtype: 'food_low_fiber_next_day_hard_stool',
    trigger_factors: ['fiber_g_total', 'fiber_g_per_1000kcal', 'nutrition_coverage_ratio'],
    target_outcomes: ['hard_stool_count', 'avg_bristol', 'incomplete_evacuation_count'],
    status,
    confidence_score: adjustedConfidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: sorted[sorted.length - 1].date,
  };
}