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

export function analyzeStressUrgencyCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  const eligibleDays = features.filter(hasStressData);
  if (eligibleDays.length === 0) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  const supportDates: string[] = [];

  let nonExposedCount = 0;
  let nonExposedElevatedCount = 0;

  for (const day of eligibleDays) {
    const highStress = isHighStressDay(day, baselines);
    const elevatedUrgency = isElevatedUrgencyDay(day, baselines);

    if (highStress) {
      exposureCount++;
      if (elevatedUrgency) {
        supportCount++;
        supportDates.push(day.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      if (elevatedUrgency) {
        nonExposedElevatedCount++;
      }
    }
  }

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedElevatedCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);

  const sufficiency = computeDataSufficiency(eligibleDays.length, exposureCount);
  const status = computeStatus(sufficiency, supportCount, exposedRate, baselineRate);
  const confidence = computeConfidence(sufficiency, supportCount, contradictionCount, lift);

  const sorted = [...eligibleDays].sort((a, b) => a.date.localeCompare(b.date));

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: exposureCount,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
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
    subtype: 'high_stress_same_day_urgency',
    trigger_factors: ['stress_avg', 'stress_peak'],
    target_outcomes: ['urgency_event_count'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: sorted[sorted.length - 1].date,
  };
}
