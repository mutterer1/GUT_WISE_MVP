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
import {
  hasFoodData,
  hasSymptomContext,
  isElevatedSymptomBurdenDay,
  hasUsableNutritionCoverage,
  average,
  adjustConfidenceForCoverage,
} from './nutritionSignalCandidateUtils';

const INSIGHT_KEY = 'food_high_fat_same_day_symptom_burden';

function isHighFatDay(day: UserDailyFeatures): boolean {
  if (hasUsableNutritionCoverage(day)) {
    const fatTotal = day.fat_g_total ?? 0;
    const fatShare = day.fat_calorie_share_ratio ?? 0;
    const calories = day.calories_kcal_total ?? 0;

    return fatTotal >= 35 || (calories >= 350 && fatShare >= 0.38);
  }

  return (day.high_fat_burden_score ?? 0) >= 1.1;
}

export function analyzeFoodHighFatSameDaySymptomBurdenCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (
    baselines.symptoms.high_burden_threshold === null &&
    baselines.symptoms.median_max_severity === null
  ) {
    return null;
  }

  const eligibleDays = features
    .filter((day) => hasFoodData(day) && hasSymptomContext(day))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (eligibleDays.length < 6) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedElevatedCount = 0;

  const supportDates: string[] = [];
  const exposedDates: string[] = [];
  const baselineDates: string[] = [];
  const exposureFatTotals: number[] = [];
  const exposureFatShareRatios: number[] = [];
  const exposureCoverageValues: number[] = [];
  const exposureNutritionConfidenceValues: number[] = [];

  for (const day of eligibleDays) {
    const highFat = isHighFatDay(day);
    const elevatedBurden = isElevatedSymptomBurdenDay(day, baselines);

    if (highFat) {
      exposureCount++;
      exposedDates.push(day.date);
      exposureFatTotals.push(day.fat_g_total ?? 0);
      if (day.fat_calorie_share_ratio !== null && day.fat_calorie_share_ratio !== undefined) {
        exposureFatShareRatios.push(day.fat_calorie_share_ratio);
      }
      if (day.nutrition_coverage_ratio !== null && day.nutrition_coverage_ratio !== undefined) {
        exposureCoverageValues.push(day.nutrition_coverage_ratio);
      }
      if (day.nutrition_confidence_avg !== null && day.nutrition_confidence_avg !== undefined) {
        exposureNutritionConfidenceValues.push(day.nutrition_confidence_avg);
      }

      if (elevatedBurden) {
        supportCount++;
        supportDates.push(day.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      baselineDates.push(day.date);

      if (elevatedBurden) {
        nonExposedElevatedCount++;
      }
    }
  }

  if (exposureCount === 0) return null;

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedElevatedCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);

  const supportingLogTypes = ['food', 'symptom'];
  const missingLogTypes: string[] = [];

  if (features.some((day) => !hasFoodData(day))) {
    missingLogTypes.push('food');
  }

  if (features.some((day) => !hasSymptomContext(day))) {
    missingLogTypes.push('symptom');
  }

  const sufficiency = computeDataSufficiency(
    eligibleDays.length,
    exposureCount,
    nonExposedCount
  );

  const recencyWeight = computeRecencyWeight(
    supportDates,
    eligibleDays[eligibleDays.length - 1].date
  );

  const evidenceGaps = buildEvidenceGaps({
    eligibleDayCount: eligibleDays.length,
    exposureCount,
    contrastCount: nonExposedCount,
    supportCount,
    contradictionCount,
    supportingLogTypes,
    endDate: eligibleDays[eligibleDays.length - 1].date,
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
    eligible_day_count: eligibleDays.length,
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
      'Same-day comparison of higher-fat intake days against lower-fat days.',
      'This rule prefers reviewed nutrition totals and only falls back to ingredient burden when structured nutrition coverage is missing.',
    ],
    statistics: {
      eligible_day_count: eligibleDays.length,
      non_exposed_count: nonExposedCount,
      non_exposed_elevated_count: nonExposedElevatedCount,
      average_exposed_fat_g: average(exposureFatTotals),
      average_exposed_fat_share_ratio: average(exposureFatShareRatios),
      average_exposed_nutrition_coverage_ratio: avgExposureCoverage,
      average_exposed_nutrition_confidence: avgNutritionConfidence,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'food',
    subtype: 'food_high_fat_same_day_symptom_burden',
    trigger_factors: [
      'fat_g_total',
      'fat_calorie_share_ratio',
      'high_fat_burden_score',
      'nutrition_coverage_ratio',
    ],
    target_outcomes: ['symptom_burden_score', 'max_symptom_severity'],
    status,
    confidence_score: adjustedConfidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: eligibleDays[0].date,
    created_from_end_date: eligibleDays[eligibleDays.length - 1].date,
  };
}