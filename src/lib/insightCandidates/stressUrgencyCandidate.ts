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

const INSIGHT_KEY = 'stress_high_same_day_urgency';

export function isHighStressDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const { stress } = baselines;

  const avgAboveThreshold =
    day.stress_avg !== null &&
    stress.high_stress_threshold !== null &&
    day.stress_avg > stress.high_stress_threshold;

  const peakAboveMedian =
    day.stress_peak !== null &&
    stress.median_peak !== null &&
    day.stress_peak > stress.median_peak;

  return avgAboveThreshold || peakAboveMedian;
}

export function isElevatedUrgencyDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const threshold = baselines.bowel_movement.high_urgency_threshold;

  if (threshold !== null) {
    return day.urgency_event_count > threshold;
  }

  return day.urgency_event_count >= 1;
}

function hasStressData(day: UserDailyFeatures): boolean {
  return day.stress_avg !== null || day.stress_peak !== null;
}

function hasUrgencyContext(day: UserDailyFeatures): boolean {
  return day.bm_count > 0 || day.urgency_event_count > 0;
}

export function analyzeStressUrgencyCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  const eligibleDays = features
    .filter((day) => hasStressData(day) && hasUrgencyContext(day))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (eligibleDays.length === 0) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedElevatedCount = 0;

  const supportDates: string[] = [];
  const exposedDates: string[] = [];
  const baselineDates: string[] = [];

  for (const day of eligibleDays) {
    const highStress = isHighStressDay(day, baselines);
    const elevatedUrgency = isElevatedUrgencyDay(day, baselines);

    if (highStress) {
      exposureCount++;
      exposedDates.push(day.date);

      if (elevatedUrgency) {
        supportCount++;
        supportDates.push(day.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      baselineDates.push(day.date);

      if (elevatedUrgency) {
        nonExposedElevatedCount++;
      }
    }
  }

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedElevatedCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);

  const supportingLogTypes = ['stress', 'gut'];
  const missingLogTypes: string[] = [];

  if (features.some((day) => !hasStressData(day))) {
    missingLogTypes.push('stress');
  }

  if (features.some((day) => !hasUrgencyContext(day))) {
    missingLogTypes.push('bm');
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
    notes: ['Same-day comparison of high-stress days against lower-stress days.'],
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
    subtype: 'stress_urgency',
    trigger_factors: ['stress_avg', 'stress_peak'],
    target_outcomes: ['urgency_event_count'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: eligibleDays[0].date,
    created_from_end_date: eligibleDays[eligibleDays.length - 1].date,
  };
}
