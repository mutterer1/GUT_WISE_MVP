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
  computeContradictionRate,
  computeRecencyWeight,
  computeEvidenceQuality,
  buildEvidenceGaps,
  buildUncertaintyStatement,
} from './sharedCandidateUtils';
import { isHighStressDay } from './stressUrgencyCandidate';
import { isPoorSleepDay } from './sleepSymptomCandidate';
import { isLowHydrationDay } from './hydrationStoolConsistencyCandidate';

const INSIGHT_KEY = 'multifactor_stress_sleep_hydration_compound_risk_symptom_burden';
const MIN_ELIGIBLE_DAYS = 7;
const MIN_EXPOSURE_DAYS = 2;

function isCompoundRiskDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  return (
    isHighStressDay(day, baselines) &&
    isPoorSleepDay(day, baselines) &&
    isLowHydrationDay(day, baselines)
  );
}

function isElevatedSameDayOutcome(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const burdenThreshold = baselines.symptoms.high_burden_threshold;
  if (burdenThreshold !== null && day.symptom_burden_score > burdenThreshold) {
    return true;
  }

  const urgencyThreshold = baselines.bowel_movement.high_urgency_threshold;
  if (urgencyThreshold !== null) {
    return day.urgency_event_count > urgencyThreshold;
  }

  return day.urgency_event_count >= 1;
}

function hasTripleDomainData(day: UserDailyFeatures): boolean {
  const hasStress = day.stress_avg !== null || day.stress_peak !== null;
  const hasSleep =
    day.sleep_entry_count > 0 &&
    (day.sleep_duration_minutes !== null || day.sleep_quality !== null);
  const hasHydration = day.hydration_event_count > 0;

  return hasStress && hasSleep && hasHydration;
}

function getSupportingLogTypes(eligibleDays: UserDailyFeatures[]): string[] {
  const logTypes = new Set<string>();

  for (const day of eligibleDays) {
    if (day.stress_avg !== null || day.stress_peak !== null) {
      logTypes.add('stress');
    }

    if (
      day.sleep_entry_count > 0 &&
      (day.sleep_duration_minutes !== null || day.sleep_quality !== null)
    ) {
      logTypes.add('sleep');
    }

    if (day.hydration_event_count > 0) {
      logTypes.add('hydration');
    }

    if (
      day.symptom_event_count > 0 ||
      day.symptom_burden_score > 0 ||
      day.max_symptom_severity !== null
    ) {
      logTypes.add('symptom');
    }

    if (
      day.bm_count > 0 ||
      day.urgency_event_count > 0 ||
      day.avg_bristol !== null
    ) {
      logTypes.add('gut');
    }
  }

  return Array.from(logTypes);
}

export function analyzeMultifactorStressSleepHydrationRiskCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  if (
    baselines.stress.high_stress_threshold === null &&
    baselines.stress.median_peak === null
  ) {
    return null;
  }

  if (
    baselines.sleep.low_duration_threshold === null &&
    baselines.sleep.low_quality_threshold === null
  ) {
    return null;
  }

  if (
    baselines.hydration.low_hydration_threshold === null &&
    baselines.hydration.low_water_goal_threshold === null
  ) {
    return null;
  }

  const eligibleDays = features
    .filter(hasTripleDomainData)
    .sort((a, b) => a.date.localeCompare(b.date));

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
    const compoundRisk = isCompoundRiskDay(day, baselines);
    const elevatedOutcome = isElevatedSameDayOutcome(day, baselines);

    if (compoundRisk) {
      exposureCount++;
      exposureDates.push(day.date);

      if (elevatedOutcome) {
        supportCount++;
        supportDates.push(day.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      baselineDates.push(day.date);

      if (elevatedOutcome) {
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
  const supportingLogTypes = getSupportingLogTypes(eligibleDays);
  const missingLogTypes = ['food'].filter(
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

  const exposedDays = eligibleDays.filter((day) => isCompoundRiskDay(day, baselines));

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
    notes: [
      'Compound-risk days require high stress, poor sleep, and low effective hydration together.',
      'Hydration remains the effective-hydration signal first, with water-goal totals preserved as supporting context.',
    ],
    statistics: {
      eligible_day_count: eligibleDays.length,
      non_exposed_count: nonExposedCount,
      non_exposed_elevated_count: nonExposedElevatedCount,
      average_exposed_effective_hydration_ml:
        exposureCount > 0
          ? Math.round(
              exposedDays.reduce((sum, day) => sum + day.hydration_total_ml, 0) / exposureCount
            )
          : 0,
      average_exposed_water_goal_ml:
        exposureCount > 0
          ? Math.round(
              exposedDays.reduce((sum, day) => sum + (day.hydration_water_goal_ml ?? 0), 0) /
                exposureCount
            )
          : 0,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'multifactor',
    subtype: 'compound_risk_day',
    trigger_factors: [
      'stress_avg',
      'stress_peak',
      'sleep_duration_minutes',
      'sleep_quality',
      'hydration_total_ml',
      'hydration_water_goal_ml',
    ],
    target_outcomes: ['symptom_burden_score', 'urgency_event_count'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: eligibleDays[0].date,
    created_from_end_date: analysisEndDate,
  };
}
