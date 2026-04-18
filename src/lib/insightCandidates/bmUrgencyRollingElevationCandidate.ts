import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type {
  InsightCandidate,
  CandidateEvidence,
} from '../../types/insightCandidates';
import {
  buildRollingWindows,
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
  type RollingWindow,
} from './sharedCandidateUtils';

const INSIGHT_KEY = 'bm_urgency_rolling_elevation';
const WINDOW_SIZE = 7;
const MIN_URGENCY_DAYS_IN_WINDOW = 2;

function isElevatedUrgencyWindow(
  window: RollingWindow,
  threshold: number | null
): boolean {
  const totalUrgency = window.days.reduce(
    (sum, day) => sum + day.urgency_event_count,
    0
  );
  const daysWithUrgency = window.days.filter(
    (day) => day.urgency_event_count > 0
  ).length;

  if (daysWithUrgency < MIN_URGENCY_DAYS_IN_WINDOW) return false;

  if (threshold !== null && threshold > 0) {
    return totalUrgency > threshold * window.count;
  }

  return totalUrgency > 0;
}

function hasGutContext(day: UserDailyFeatures): boolean {
  return day.bm_count > 0 || day.urgency_event_count > 0;
}

export function analyzeBmUrgencyRollingElevationCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < WINDOW_SIZE) return null;

  const orderedDays = [...features]
    .filter(hasGutContext)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (orderedDays.length < WINDOW_SIZE) return null;

  const windows = buildRollingWindows(orderedDays, WINDOW_SIZE);
  if (windows.length === 0) return null;

  const threshold = baselines.bowel_movement.high_urgency_threshold;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedUrgencyDays = 0;
  let totalUrgencyInPositive = 0;

  const supportDates: string[] = [];
  const exposureDates: string[] = [];
  const baselineDates: string[] = [];

  for (const window of windows) {
    const elevatedWindow = isElevatedUrgencyWindow(window, threshold);
    const totalUrgency = window.days.reduce(
      (sum, day) => sum + day.urgency_event_count,
      0
    );
    const daysWithUrgency = window.days.filter(
      (day) => day.urgency_event_count > 0
    ).length;

    if (elevatedWindow) {
      exposureCount++;
      supportCount++;
      totalUrgencyInPositive += totalUrgency;
      supportDates.push(window.startDate);
      exposureDates.push(window.startDate);
    } else {
      nonExposedCount++;
      contradictionCount++;
      baselineDates.push(window.startDate);
      nonExposedUrgencyDays += daysWithUrgency;
    }
  }

  if (exposureCount < 2) return null;

  const contrastCount = nonExposedCount;
  const exposedRate = safeRate(totalUrgencyInPositive, exposureCount * WINDOW_SIZE);
  const baselineRate =
    threshold !== null && threshold > 0
      ? threshold
      : safeRate(nonExposedUrgencyDays, contrastCount * WINDOW_SIZE);
  const lift = computeLift(exposedRate, baselineRate);

  const analysisEndDate = orderedDays[orderedDays.length - 1].date;
  const supportingLogTypes = ['gut'];
  const missingLogTypes: string[] = [];

  if (features.some((day) => !hasGutContext(day))) {
    missingLogTypes.push('gut');
  }

  const sufficiency = computeDataSufficiency(
    orderedDays.length,
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
    eligibleDayCount: orderedDays.length,
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
    eligible_day_count: orderedDays.length,
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
      total_days_analyzed: orderedDays.length,
      total_windows: windows.length,
      positive_windows: exposureCount,
      non_positive_windows: nonExposedCount,
      total_urgency_in_positive_windows: totalUrgencyInPositive,
      urgency_threshold_per_day: threshold,
      non_positive_window_urgency_days: nonExposedUrgencyDays,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'gut',
    subtype: 'bm_urgency_rolling_elevation',
    trigger_factors: ['urgency_event_count'],
    target_outcomes: ['urgency_event_count'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: orderedDays[0].date,
    created_from_end_date: analysisEndDate,
  };
}
