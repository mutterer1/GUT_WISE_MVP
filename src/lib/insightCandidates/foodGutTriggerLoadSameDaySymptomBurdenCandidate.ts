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

const INSIGHT_KEY = 'food_gut_trigger_load_same_day_symptom_burden';
const MIN_ELIGIBLE_DAYS = 7;
const MIN_EXPOSURE_DAYS = 3;

function hasFoodAndSymptomContext(day: UserDailyFeatures): boolean {
  return day.meal_count > 0 && (
    day.symptom_event_count > 0 ||
    day.max_symptom_severity !== null ||
    day.symptom_types.length > 0
  );
}

function isGutTriggerExposureDay(day: UserDailyFeatures): boolean {
  return (
    day.gut_trigger_load >= 2 ||
    day.high_fodmap_food_count >= 1 ||
    day.artificial_sweetener_food_count >= 1 ||
    day.high_fat_food_count >= 1 ||
    day.spicy_food_count >= 1
  );
}

function isElevatedSymptomBurden(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const burdenAboveThreshold =
    baselines.symptoms.high_burden_threshold !== null &&
    day.symptom_burden_score > baselines.symptoms.high_burden_threshold;

  const severityAboveMedian =
    day.max_symptom_severity !== null &&
    baselines.symptoms.median_max_severity !== null &&
    day.max_symptom_severity > baselines.symptoms.median_max_severity;

  return burdenAboveThreshold || severityAboveMedian;
}

export function analyzeFoodGutTriggerLoadSameDaySymptomBurdenCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  if (
    baselines.symptoms.high_burden_threshold === null &&
    baselines.symptoms.median_max_severity === null
  ) {
    return null;
  }

  const eligibleDays = features
    .filter(hasFoodAndSymptomContext)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (eligibleDays.length < MIN_ELIGIBLE_DAYS) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedElevatedCount = 0;

  const supportDates: string[] = [];
  const exposedDates: string[] = [];
  const baselineDates: string[] = [];

  for (const day of eligibleDays) {
    const triggerExposure = isGutTriggerExposureDay(day);
    const elevatedBurden = isElevatedSymptomBurden(day, baselines);

    if (triggerExposure) {
      exposureCount++;
      exposedDates.push(day.date);

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

  if (exposureCount < MIN_EXPOSURE_DAYS) return null;

  const contrastCount = nonExposedCount;
  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedElevatedCount, contrastCount);
  const lift = computeLift(exposedRate, baselineRate);
  const analysisEndDate = eligibleDays[eligibleDays.length - 1].date;
  const supportingLogTypes = ['food', 'symptom'];
  const missingLogTypes = ['hydration', 'stress', 'sleep'].filter((logType) =>
    !features.some((day) => {
      if (logType === 'hydration') return day.hydration_event_count > 0;
      if (logType === 'stress') return day.stress_event_count > 0;
      return day.sleep_entry_count > 0;
    })
  );

  const sufficiency = computeDataSufficiency(
    eligibleDays.length,
    exposureCount,
    contrastCount
  );

  const recencyWeight = computeRecencyWeight(supportDates, analysisEndDate);
  const contradictionRate = computeContradictionRate(contradictionCount, exposureCount);

  const evidenceQuality = computeEvidenceQuality(
    sufficiency,
    supportCount,
    contradictionCount,
    exposureCount,
    contrastCount,
    recencyWeight,
    supportingLogTypes
  );

  const evidenceGaps = buildEvidenceGaps({
    eligibleDayCount: eligibleDays.length,
    exposureCount,
    contrastCount,
    supportCount,
    contradictionCount,
    supportingLogTypes,
    endDate: analysisEndDate,
    sampleDates: supportDates,
  });

  const uncertaintyStatement = buildUncertaintyStatement(evidenceGaps);

  const status = computeStatus(
    sufficiency,
    supportCount,
    exposedRate,
    baselineRate,
    contradictionCount,
    exposureCount,
    contrastCount,
    evidenceQuality
  );

  const confidence = computeConfidence(
    sufficiency,
    supportCount,
    contradictionCount,
    lift,
    exposureCount,
    contrastCount,
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
    contrast_count: contrastCount,
    eligible_day_count: eligibleDays.length,
    exposed_day_count: exposureCount,
    baseline_day_count: contrastCount,
    contradiction_rate: contradictionRate,
    recency_weight: recencyWeight,
    evidence_quality: evidenceQuality,
    supporting_log_types: supportingLogTypes,
    missing_log_types: missingLogTypes,
    exposed_dates: exposedDates.slice(0, 10),
    baseline_dates: baselineDates.slice(0, 10),
    uncertainty_statement: uncertaintyStatement,
    evidence_gaps: evidenceGaps,
    notes: [
      'Exposure days are derived from normalized ingredient rows when available, with fallback to legacy tags and free-text food signals when needed.',
      'This is still not portion-adjusted or brand-specific.',
    ],
    statistics: {
      eligible_day_count: eligibleDays.length,
      non_exposed_count: nonExposedCount,
      non_exposed_elevated_count: nonExposedElevatedCount,
      trigger_exposure_day_count: exposureCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'food',
    subtype: 'food_gut_trigger_load_same_day_symptom_burden',
    trigger_factors: ['gut_trigger_load', 'ingredient_signals', 'high_fodmap_food_count'],
    target_outcomes: ['symptom_burden_score', 'max_symptom_severity'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: eligibleDays[0].date,
    created_from_end_date: analysisEndDate,
  };
}
