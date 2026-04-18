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

const INSIGHT_KEY = 'exercise_low_movement_same_day_bm_regularity';
const MIN_ELIGIBLE_DAYS = 5;
const MIN_EXPOSURE_DAYS = 2;

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
  return (
    day.exercise_sessions_count > 0 ||
    day.exercise_minutes_total > 0 ||
    day.movement_low_day === true
  );
}

function getSupportingLogTypes(eligibleDays: UserDailyFeatures[]): string[] {
  const logTypes = new Set<string>();

  for (const day of eligibleDays) {
    if (
      day.exercise_sessions_count > 0 ||
      day.exercise_minutes_total > 0 ||
      day.movement_low_day === true
    ) {
      logTypes.add('exercise');
    }

    if (
      day.bm_count > 0 ||
      day.avg_bristol !== null ||
      day.urgency_event_count > 0 ||
      day.incomplete_evacuation_count > 0 ||
      day.blood_present_count > 0 ||
      day.mucus_present_count > 0
    ) {
      logTypes.add('gut');
    }

    if (day.hydration_event_count > 0) {
      logTypes.add('hydration');
    }

    if (day.meal_count > 0) {
      logTypes.add('food');
    }

    if (
      day.stress_event_count > 0 ||
      day.stress_avg !== null ||
      day.stress_peak !== null
    ) {
      logTypes.add('stress');
    }

    if (day.sleep_entry_count > 0) {
      logTypes.add('sleep');
    }
  }

  return Array.from(logTypes);
}

export function analyzeExerciseMovementBmRegularityCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  const eligibleDays = features.filter(hasExerciseData);
  if (eligibleDays.length < MIN_ELIGIBLE_DAYS) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedReducedCount = 0;

  const supportDates: string[] = [];
  const exposureDates: string[] = [];
  const baselineDates: string[] = [];

  for (const day of eligibleDays) {
    const lowMovement = isLowMovementDay(day);
    const reducedBm = isReducedBmDay(day, baselines);

    if (lowMovement) {
      exposureCount++;
      exposureDates.push(day.date);

      if (reducedBm) {
        supportCount++;
        supportDates.push(day.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      baselineDates.push(day.date);

      if (reducedBm) {
        nonExposedReducedCount++;
      }
    }
  }

  if (exposureCount < MIN_EXPOSURE_DAYS) return null;

  const contrastCount = nonExposedCount;
  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedReducedCount, contrastCount);
  const lift = computeLift(exposedRate, baselineRate);

  const sorted = [...eligibleDays].sort((a, b) => a.date.localeCompare(b.date));
  const analysisEndDate = sorted[sorted.length - 1].date;

  const supportingLogTypes = getSupportingLogTypes(eligibleDays);
  const missingLogTypes = ['hydration', 'food', 'stress', 'sleep'].filter(
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
      non_exposed_reduced_count: nonExposedReducedCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'exercise',
    subtype: 'low_movement_bm_regularity',
    trigger_factors: [
      'movement_low_day',
      'exercise_minutes_total',
      'exercise_sessions_count',
    ],
    target_outcomes: ['bm_count'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: analysisEndDate,
  };
}
