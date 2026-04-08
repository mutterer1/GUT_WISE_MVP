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

const INSIGHT_KEY = 'sleep_poor_next_day_symptom_burden';

interface DayPair {
  sleepDay: UserDailyFeatures;
  nextDay: UserDailyFeatures;
}

export function isPoorSleepDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const { sleep } = baselines;

  const belowDuration =
    day.sleep_duration_minutes !== null &&
    sleep.low_duration_threshold !== null &&
    day.sleep_duration_minutes < sleep.low_duration_threshold;

  const belowQuality =
    day.sleep_quality !== null &&
    sleep.low_quality_threshold !== null &&
    day.sleep_quality < sleep.low_quality_threshold;

  return belowDuration || belowQuality;
}

export function isElevatedNextDaySymptoms(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const { symptoms } = baselines;

  const burdenAboveThreshold =
    symptoms.high_burden_threshold !== null &&
    day.symptom_burden_score > symptoms.high_burden_threshold;

  const severityAboveMedian =
    day.max_symptom_severity !== null &&
    symptoms.median_max_severity !== null &&
    day.max_symptom_severity > symptoms.median_max_severity;

  return burdenAboveThreshold || severityAboveMedian;
}

export function getNextDayPairings(
  features: UserDailyFeatures[]
): DayPair[] {
  if (features.length < 2) return [];

  const sorted = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const pairs: DayPair[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const currentDate = new Date(current.date);
    const nextDate = new Date(next.date);
    const diffMs = nextDate.getTime() - currentDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (Math.abs(diffDays - 1) < 0.01) {
      pairs.push({ sleepDay: current, nextDay: next });
    }
  }

  return pairs;
}

function hasSleepData(day: UserDailyFeatures): boolean {
  return (
    day.sleep_entry_count > 0 &&
    (day.sleep_duration_minutes !== null || day.sleep_quality !== null)
  );
}

export function analyzeSleepSymptomCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < 2) return null;

  if (
    baselines.sleep.low_duration_threshold === null &&
    baselines.sleep.low_quality_threshold === null
  ) {
    return null;
  }

  if (
    baselines.symptoms.high_burden_threshold === null &&
    baselines.symptoms.median_max_severity === null
  ) {
    return null;
  }

  const pairs = getNextDayPairings(features);
  if (pairs.length === 0) return null;

  const eligiblePairs = pairs.filter((p) => hasSleepData(p.sleepDay));
  if (eligiblePairs.length === 0) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  const supportDates: string[] = [];

  let nonExposedCount = 0;
  let nonExposedElevatedCount = 0;

  for (const pair of eligiblePairs) {
    const poorSleep = isPoorSleepDay(pair.sleepDay, baselines);
    const elevatedSymptoms = isElevatedNextDaySymptoms(pair.nextDay, baselines);

    if (poorSleep) {
      exposureCount++;
      if (elevatedSymptoms) {
        supportCount++;
        supportDates.push(pair.sleepDay.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      if (elevatedSymptoms) {
        nonExposedElevatedCount++;
      }
    }
  }

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedElevatedCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);

  const sufficiency = computeDataSufficiency(eligiblePairs.length, exposureCount);
  const status = computeStatus(sufficiency, supportCount, exposedRate, baselineRate);
  const confidence = computeConfidence(sufficiency, supportCount, contradictionCount, lift);

  const sorted = [...features].sort((a, b) => a.date.localeCompare(b.date));

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: exposureCount,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    statistics: {
      eligible_pair_count: eligiblePairs.length,
      non_exposed_count: nonExposedCount,
      non_exposed_elevated_count: nonExposedElevatedCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'sleep',
    subtype: 'poor_sleep_next_day_symptom_burden',
    trigger_factors: ['sleep_duration', 'sleep_quality'],
    target_outcomes: ['symptom_burden_score', 'max_symptom_severity'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: sorted[sorted.length - 1].date,
  };
}
