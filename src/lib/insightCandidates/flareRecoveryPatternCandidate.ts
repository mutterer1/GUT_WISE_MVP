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
  const summaryDateIndex = new Map(summaries.map((s, i) => [s.date, i]));

  const flareEndToRecovery = new Map<string, RecoveryWindow>();
  for (const rec of recoveryWindows) {
    const recStartIdx = summaryDateIndex.get(rec.startDate);
    if (recStartIdx === undefined || recStartIdx === 0) continue;
    const precedingDate = summaries[recStartIdx - 1].date;
    flareEndToRecovery.set(precedingDate, rec);
  }

  let flaresWithRecovery = 0;
  let flaresWithoutRecovery = 0;
  let prolongedRecoveryCount = 0;
  let totalRecoveryDuration = 0;
  const problemFlareStartDates: string[] = [];

  for (const flare of flareWindows) {
    const recovery = flareEndToRecovery.get(flare.endDate);
    if (!recovery) {
      flaresWithoutRecovery++;
      problemFlareStartDates.push(flare.startDate);
    } else {
      flaresWithRecovery++;
      totalRecoveryDuration += recovery.durationDays;
      if (recovery.durationDays >= flare.durationDays * PROLONGED_RECOVERY_MULTIPLIER) {
        prolongedRecoveryCount++;
        if (!problemFlareStartDates.includes(flare.startDate)) {
          problemFlareStartDates.push(flare.startDate);
        }
      }
    }
  }

  const problemFlareCount = flaresWithoutRecovery + prolongedRecoveryCount;
  const problemRate = problemFlareCount / flareWindows.length;

  if (problemRate < MIN_PROBLEM_RATE) return null;

  const avgFlareDuration =
    Math.round(
      (flareWindows.reduce((s, w) => s + w.durationDays, 0) / flareWindows.length) * 10
    ) / 10;

  const avgRecoveryDuration =
    flaresWithRecovery > 0
      ? Math.round((totalRecoveryDuration / flaresWithRecovery) * 10) / 10
      : null;

  const exposedRate = safeRate(problemFlareCount, flareWindows.length);
  const baselineRate = EXPECTED_BASELINE_PROBLEM_RATE;
  const lift = computeLift(exposedRate, baselineRate);

  const supportCount = problemFlareCount;
  const contradictionCount = flaresWithRecovery - prolongedRecoveryCount;

  const sufficiency = computeDataSufficiency(orderedDays.length, flareWindows.length);
  const status = computeStatus(sufficiency, supportCount, exposedRate, baselineRate);
  const confidence = computeConfidence(sufficiency, supportCount, contradictionCount, lift);

  const sampleDates = problemFlareStartDates
    .slice()
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 10);

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: flareWindows.length,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: sampleDates,
    statistics: {
      total_days_analyzed: orderedDays.length,
      flare_window_count: flareWindows.length,
      flares_with_immediate_recovery: flaresWithRecovery,
      flares_without_immediate_recovery: flaresWithoutRecovery,
      prolonged_recovery_count: prolongedRecoveryCount,
      incomplete_recovery_rate: exposedRate,
      avg_flare_duration_days: avgFlareDuration,
      avg_recovery_duration_days: avgRecoveryDuration,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'symptom',
    subtype: 'flare_recovery_pattern',
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
