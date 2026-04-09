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
    (sum, d) => sum + d.urgency_event_count,
    0
  );
  const daysWithUrgency = window.days.filter(
    (d) => d.urgency_event_count > 0
  ).length;

  if (daysWithUrgency < MIN_URGENCY_DAYS_IN_WINDOW) return false;

  if (threshold !== null && threshold > 0) {
    return totalUrgency > threshold * window.count;
  }

  return totalUrgency > 0;
}

export function analyzeBmUrgencyRollingElevationCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < WINDOW_SIZE) return null;

  const orderedDays = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const windows = buildRollingWindows(orderedDays, WINDOW_SIZE);
  if (windows.length === 0) return null;

  const threshold = baselines.bowel_movement.high_urgency_threshold;

  let positiveWindowCount = 0;
  let totalUrgencyInPositive = 0;
  const supportDates: string[] = [];

  for (const window of windows) {
    if (isElevatedUrgencyWindow(window, threshold)) {
      positiveWindowCount++;
      totalUrgencyInPositive += window.days.reduce(
        (sum, d) => sum + d.urgency_event_count,
        0
      );
      supportDates.push(window.startDate);
    }
  }

  const nonPositiveCount = windows.length - positiveWindowCount;

  const exposedRate =
    positiveWindowCount > 0
      ? safeRate(totalUrgencyInPositive, positiveWindowCount * WINDOW_SIZE)
      : null;

  const baselineRate = threshold;
  const lift = computeLift(exposedRate, baselineRate);

  const sufficiency = computeDataSufficiency(orderedDays.length, positiveWindowCount);
  const status = computeStatus(sufficiency, positiveWindowCount, exposedRate, baselineRate);
  const confidence = computeConfidence(sufficiency, positiveWindowCount, nonPositiveCount, lift);

  const evidence: CandidateEvidence = {
    support_count: positiveWindowCount,
    exposure_count: windows.length,
    contradiction_count: nonPositiveCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    statistics: {
      total_days_analyzed: orderedDays.length,
      total_windows: windows.length,
      positive_windows: positiveWindowCount,
      total_urgency_in_positive_windows: totalUrgencyInPositive,
      urgency_threshold_per_day: threshold,
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
    created_from_end_date: orderedDays[orderedDays.length - 1].date,
  };
}
