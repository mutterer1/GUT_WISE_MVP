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
  computeRecencyWeight,
  computeContradictionRate,
  computeEvidenceQuality,
  buildEvidenceGaps,
  buildUncertaintyStatement,
} from './sharedCandidateUtils';
import { isHighStressDay } from './stressUrgencyCandidate';

const INSIGHT_KEY = 'stress_high_day_symptom_burden';
const MIN_ELIGIBLE_DAYS = 7;
const MIN_EXPOSURE_DAYS = 3;

function hasStressData(day: UserDailyFeatures): boolean {
  return day.stress_avg !== null || day.stress_peak !== null;
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

function getSupportingLogTypes(eligibleDays: UserDailyFeatures[]): string[] {
  const logTypes = new Set<string>();

  for (const day of eligibleDays) {
    if (day.stress_avg !== null || day.stress_peak !== null) {
      logTypes.add('stress');
    }

    if (
      day.symptom_event_count > 0 ||
      day.symptom_burden_score > 0 ||
      day.max_symptom_severity !== null
    ) {
      logTypes.add('symptom');
    }

    if (day.sleep_entry_count > 0) {
      logTypes.add('sleep');
    }

    if (day.hydration_event_count > 0) {
      logTypes.add('hydration');
    }

    if (day.meal_count > 0) {
      logTypes.add('food');
    }
  }

  return Array.from(logTypes);
}

export function analyzeStressHighDaySymptomBurdenCandidate(
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

  const eligibleDays = features.filter(hasStressData);
  if (eligibleDays.length < MIN_ELIGIBLE_DAYS) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedElevatedCount = 0;

  const supportDates: string[] = [];
  const exposureDates: string[] = [];
  const baselineDates: string[] = [];

  for (const day of eligibleDays) {
    const highStress = isHighStressDay(day, baselines);
    const elevatedBurden = isElevatedSymptomBurden(day, baselines);

    if (highStress) {
      exposureCount++;
      exposureDates.push(day.date);

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

  const sorted = [...eligibleDays].sort((a, b) => a.date.localeCompare(b.date));
  const analysisEndDate = sorted[sorted.length - 1].date;

  const supportingLogTypes = getSupportingLogTypes(eligibleDays);
  const missingLogTypes = ['sleep', 'hydration', 'food'].filter(
    (logType) => !supportingLogTypes.includes(logType)
  );

  const sufficiency = computeDataSufficiency(
    eligibleDays.length,
    exposureCount,
    contrastCount
  );

  const recencyWeight = computeRecencyWeight(supportDates, analysisEndDate);
  const contradictionRate = computeContradictionRate(
    contradictionCount,
    exposureCount
  );

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
    exposed_dates: exposureDates.slice(0, 10),
    baseline_dates: baselineDates.slice(0, 10),
    uncertainty_statement: uncertaintyStatement,
    evidence_gaps: evidenceGaps,
    statistics: {
      eligible_day_count: eligibleDays.length,
      non_exposed_count: nonExposedCount,
      non_exposed_elevated_count: nonExposedElevatedCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'stress',
    subtype: 'high_stress_day_symptom_burden',
    trigger_factors: ['stress_avg', 'stress_peak'],
    target_outcomes: ['symptom_burden_score', 'max_symptom_severity'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: analysisEndDate,
  };
}
