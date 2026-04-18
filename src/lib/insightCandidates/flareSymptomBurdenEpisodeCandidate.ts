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
import {
  detectFlareWindows,
  buildBurdenSummaries,
} from './flareRecoveryDetection';

const INSIGHT_KEY = 'flare_symptom_burden_episode';
const MIN_TOTAL_DAYS = 14;
const MIN_FLARE_WINDOWS = 2;

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

export function analyzeFlareSymptomBurdenEpisodeCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < MIN_TOTAL_DAYS) return null;

  const orderedDays = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const flareWindows = detectFlareWindows(orderedDays, baselines);

  if (flareWindows.length < MIN_FLARE_WINDOWS) return null;

  const flareDayDates = new Set(
    flareWindows.flatMap((window) => window.days.map((day) => day.date))
  );
  const flareDayCount = flareDayDates.size;

  const allSummaries = buildBurdenSummaries(orderedDays, baselines);
  const nonFlareSummaries = allSummaries.filter((summary) => !flareDayDates.has(summary.date));
  const nonFlareElevatedCount = nonFlareSummaries.filter((summary) => summary.isElevated).length;

  const supportCount = flareWindows.length;
  const exposureCount = flareWindows.length;
  const contradictionCount = 0;
  const contrastCount = nonFlareSummaries.length;

  const exposedRate = 1;
  const baselineRate = safeRate(nonFlareElevatedCount, contrastCount);
  const lift = computeLift(exposedRate, baselineRate);

  const avgFlareDuration =
    Math.round(
      (flareWindows.reduce((sum, window) => sum + window.durationDays, 0) / flareWindows.length) *
        10
    ) / 10;
  const maxFlareDuration = Math.max(...flareWindows.map((window) => window.durationDays));
  const peakBurdenOverall = Math.max(...flareWindows.map((window) => window.peakBurden));

  const flareStarts = flareWindows
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((window) => window.startDate);

  const sampleDates = [...flareStarts].reverse().slice(0, 10);
  const exposedDates = flareStarts.slice(0, 10);
  const baselineDates = nonFlareSummaries.map((summary) => summary.date).slice(0, 10);
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
    exposed_dates: exposedDates,
    baseline_dates: baselineDates,
    uncertainty_statement: uncertaintyStatement,
    evidence_gaps: evidenceGaps,
    statistics: {
      total_days_analyzed: orderedDays.length,
      flare_window_count: flareWindows.length,
      total_flare_days: flareDayCount,
      avg_flare_duration_days: avgFlareDuration,
      max_flare_duration_days: maxFlareDuration,
      peak_burden_in_flare: peakBurdenOverall,
      most_recent_flare_date: sampleDates[0] ?? null,
      non_flare_days: nonFlareSummaries.length,
      non_flare_elevated_days: nonFlareElevatedCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'symptom',
    subtype: 'flare_symptom_burden_episode',
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
