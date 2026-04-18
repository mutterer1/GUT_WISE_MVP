import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate, CandidateEvidence } from '../../types/insightCandidates';
import type { RecoveryWindow } from '../../types/flareRecoveryWindow';
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
import {
  detectFlareWindows,
  detectRecoveryWindows,
  buildBurdenSummaries,
} from './flareRecoveryDetection';

const INSIGHT_KEY = 'flare_recovery_pattern';
const MIN_TOTAL_DAYS = 21;
const MIN_FLARE_WINDOWS = 2;
const MIN_PROBLEM_RATE = 0.4;
const PROLONGED_RECOVERY_MULTIPLIER = 1.5;
const EXPECTED_BASELINE_PROBLEM_RATE = 0.2;

function getSupportingLogTypes(days: UserDailyFeatures[]): string[] {
  const logTypes = new Set<string>();

  for (const day of days) {
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
      day.loose_stool_count > 0 ||
      day.avg_bristol !== null
    ) {
      logTypes.add('gut');
    }

    if (day.meal_count > 0) {
      logTypes.add('food');
    }

    if (day.hydration_event_count > 0) {
      logTypes.add('hydration');
    }

    if (
      day.stress_event_count > 0 ||
      day.stress_avg !== null ||
      day.stress_peak !== null
    ) {
      logTypes.add('stress');
    }
  }

  return Array.from(logTypes);
}

export function analyzeFlareRecoveryPatternCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < MIN_TOTAL_DAYS) return null;

  const orderedDays = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const flareWindows = detectFlareWindows(orderedDays, baselines);
  if (flareWindows.length < MIN_FLARE_WINDOWS) return null;

  const recoveryWindows = detectRecoveryWindows(orderedDays, baselines, flareWindows, {
    requireFollowsFlare: true,
  });

  const summaries = buildBurdenSummaries(orderedDays, baselines);
  const summaryDateIndex = new Map(summaries.map((summary, index) => [summary.date, index]));

  const flareEndToRecovery = new Map<string, RecoveryWindow>();
  for (const recovery of recoveryWindows) {
    const recStartIdx = summaryDateIndex.get(recovery.startDate);
    if (recStartIdx === undefined || recStartIdx === 0) continue;

    const precedingDate = summaries[recStartIdx - 1].date;
    flareEndToRecovery.set(precedingDate, recovery);
  }

  let flaresWithRecovery = 0;
  let flaresWithoutRecovery = 0;
  let prolongedRecoveryCount = 0;
  let totalRecoveryDuration = 0;

  const problemFlareStartDates: string[] = [];
  const resolvedFlareStartDates: string[] = [];

  for (const flare of flareWindows) {
    const recovery = flareEndToRecovery.get(flare.endDate);

    if (!recovery) {
      flaresWithoutRecovery++;
      problemFlareStartDates.push(flare.startDate);
      continue;
    }

    flaresWithRecovery++;
    totalRecoveryDuration += recovery.durationDays;

    if (recovery.durationDays >= flare.durationDays * PROLONGED_RECOVERY_MULTIPLIER) {
      prolongedRecoveryCount++;
      problemFlareStartDates.push(flare.startDate);
    } else {
      resolvedFlareStartDates.push(flare.startDate);
    }
  }

  const problemFlareCount = flaresWithoutRecovery + prolongedRecoveryCount;
  const problemRate = safeRate(problemFlareCount, flareWindows.length);

  if (problemRate === null || problemRate < MIN_PROBLEM_RATE) return null;

  const supportCount = problemFlareCount;
  const exposureCount = flareWindows.length;
  const contradictionCount = resolvedFlareStartDates.length;
  const contrastCount = resolvedFlareStartDates.length;

  const avgFlareDuration =
    Math.round(
      (flareWindows.reduce((sum, window) => sum + window.durationDays, 0) / flareWindows.length) *
        10
    ) / 10;

  const totalFlareDays = flareWindows.reduce((sum, window) => sum + window.durationDays, 0);
  const maxFlareDuration = Math.max(...flareWindows.map((window) => window.durationDays));
  const peakBurdenOverall = Math.max(...flareWindows.map((window) => window.peakBurden));
  const mostRecentFlareDate =
    flareWindows.slice().sort((a, b) => b.startDate.localeCompare(a.startDate))[0]?.startDate ??
    null;

  const avgRecoveryDuration =
    flaresWithRecovery > 0
      ? Math.round((totalRecoveryDuration / flaresWithRecovery) * 10) / 10
      : null;

  const exposedRate = safeRate(problemFlareCount, flareWindows.length);
  const baselineRate = EXPECTED_BASELINE_PROBLEM_RATE;
  const lift = computeLift(exposedRate, baselineRate);

  const sampleDates = problemFlareStartDates
    .slice()
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 10);

  const analysisEndDate = orderedDays[orderedDays.length - 1].date;
  const supportingLogTypes = getSupportingLogTypes(orderedDays);
  const missingLogTypes = ['food', 'hydration', 'stress'].filter(
    (logType) => !supportingLogTypes.includes(logType)
  );

  const sufficiency = computeDataSufficiency(
    orderedDays.length,
    exposureCount,
    contrastCount
  );

  const recencyWeight = computeRecencyWeight(sampleDates, analysisEndDate);
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
    sampleDates,
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
    sample_dates: sampleDates,
    contrast_count: contrastCount,
    eligible_day_count: orderedDays.length,
    exposed_day_count: exposureCount,
    baseline_day_count: contrastCount,
    contradiction_rate: contradictionRate,
    recency_weight: recencyWeight,
    evidence_quality: evidenceQuality,
    supporting_log_types: supportingLogTypes,
    missing_log_types: missingLogTypes,
    exposed_dates: flareWindows.map((window) => window.startDate).slice(0, 10),
    baseline_dates: resolvedFlareStartDates.slice(0, 10),
    uncertainty_statement: uncertaintyStatement,
    evidence_gaps: evidenceGaps,
    statistics: {
      total_days_analyzed: orderedDays.length,
      flare_window_count: flareWindows.length,
      total_flare_days: totalFlareDays,
      avg_flare_duration_days: avgFlareDuration,
      max_flare_duration_days: maxFlareDuration,
      peak_burden_in_flare: peakBurdenOverall,
      most_recent_flare_date: mostRecentFlareDate,
      flares_with_immediate_recovery: flaresWithRecovery,
      flares_without_immediate_recovery: flaresWithoutRecovery,
      prolonged_recovery_count: prolongedRecoveryCount,
      incomplete_recovery_rate: exposedRate,
      avg_recovery_duration_days: avgRecoveryDuration,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'symptom',
    subtype: 'flare_recovery_pattern',
    trigger_factors: [
      'symptom_burden_score',
      'urgency_event_count',
      'loose_stool_count',
    ],
    target_outcomes: ['symptom_burden_score'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: orderedDays[0].date,
    created_from_end_date: analysisEndDate,
  };
}
