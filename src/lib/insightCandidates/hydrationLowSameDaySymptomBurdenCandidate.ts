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
import { isLowHydrationDay } from './hydrationStoolConsistencyCandidate';

const INSIGHT_KEY = 'hydration_low_same_day_symptom_burden';

const MIN_ELIGIBLE_DAYS = 7;
const MIN_EXPOSURE_DAYS = 3;

function hasHydrationData(day: UserDailyFeatures): boolean {
  return day.hydration_event_count > 0;
}

function hasSymptomContext(day: UserDailyFeatures): boolean {
  return (
    day.symptom_event_count > 0 ||
    day.max_symptom_severity !== null ||
    day.symptom_types.length > 0
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

export function analyzeHydrationLowSameDaySymptomBurdenCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;
  if (baselines.hydration.low_hydration_threshold === null) return null;

  if (
    baselines.symptoms.high_burden_threshold === null &&
    baselines.symptoms.median_max_severity === null
  ) {
    return null;
  }

  const eligibleDays = features
    .filter((day) => hasHydrationData(day) && hasSymptomContext(day))
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
    const lowHydration = isLowHydrationDay(day, baselines);
    const elevatedBurden = isElevatedSymptomBurden(day, baselines);

    if (lowHydration) {
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

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedElevatedCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);

  const supportingLogTypes = ['hydration', 'symptom'];
  const missingLogTypes: string[] = [];

  if (features.some((day) => !hasHydrationData(day))) {
    missingLogTypes.push('hydration');
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
    notes: ['Same-day comparison of low-hydration days against better-hydrated days.'],
    statistics: {
      eligible_day_count: eligibleDays.length,
      non_exposed_count: nonExposedCount,
      non_exposed_elevated_count: nonExposedElevatedCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'hydration',
    subtype: 'hydration_low_same_day_symptom_burden',
    trigger_factors: ['hydration_total_ml'],
    target_outcomes: ['symptom_burden_score', 'max_symptom_severity'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: eligibleDays[0].date,
    created_from_end_date: eligibleDays[eligibleDays.length - 1].date,
  };
}
