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
} from './sharedCandidateUtils';
import {
  detectFlareWindows,
  buildBurdenSummaries,
} from './flareRecoveryDetection';

const INSIGHT_KEY = 'flare_symptom_burden_episode';
const MIN_TOTAL_DAYS = 14;
const MIN_FLARE_WINDOWS = 2;

export function analyzeFlareSymptomBurdenEpisodeCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < MIN_TOTAL_DAYS) return null;

  const orderedDays = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const flareWindows = detectFlareWindows(orderedDays, baselines);

  if (flareWindows.length < MIN_FLARE_WINDOWS) return null;

  const flareDayDates = new Set(
    flareWindows.flatMap((w) => w.days.map((d) => d.date))
  );
  const flareDayCount = flareDayDates.size;

  const allSummaries = buildBurdenSummaries(orderedDays, baselines);
  const nonFlareSummaries = allSummaries.filter((s) => !flareDayDates.has(s.date));
  const nonFlareElevatedCount = nonFlareSummaries.filter((s) => s.isElevated).length;

  const exposedRate = 1.0;
  const baselineRate = safeRate(nonFlareElevatedCount, nonFlareSummaries.length);
  const lift = computeLift(exposedRate, baselineRate);

  const supportCount = flareWindows.length;
  const contradictionCount = 0;

  const sufficiency = computeDataSufficiency(orderedDays.length, flareDayCount);
  const status = computeStatus(sufficiency, supportCount, exposedRate, baselineRate);
  const confidence = computeConfidence(sufficiency, supportCount, contradictionCount, lift);

  const avgFlareDuration =
    Math.round(
      (flareWindows.reduce((s, w) => s + w.durationDays, 0) / flareWindows.length) * 10
    ) / 10;
  const maxFlareDuration = Math.max(...flareWindows.map((w) => w.durationDays));
  const peakBurdenOverall = Math.max(...flareWindows.map((w) => w.peakBurden));

  const sampleDates = flareWindows
    .slice()
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map((w) => w.startDate)
    .slice(0, 10);

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: flareDayCount,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: sampleDates,
    statistics: {
      total_days_analyzed: orderedDays.length,
      flare_window_count: flareWindows.length,
      total_flare_days: flareDayCount,
      avg_flare_duration_days: avgFlareDuration,
      max_flare_duration_days: maxFlareDuration,
      peak_burden_in_flare: peakBurdenOverall,
      non_flare_days: nonFlareSummaries.length,
      non_flare_elevated_days: nonFlareElevatedCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'symptom',
    subtype: 'flare_symptom_burden_episode',
    trigger_factors: ['symptom_burden_score', 'urgency_event_count', 'loose_stool_count'],
    target_outcomes: ['symptom_burden_score'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: orderedDays[0].date,
    created_from_end_date: orderedDays[orderedDays.length - 1].date,
  };
}
