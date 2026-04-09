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

const INSIGHT_KEY = 'medication_any_same_day_bm_shift';

const MIN_ELIGIBLE_DAYS = 5;
const MIN_EXPOSURE_DAYS = 2;

export function isMedicationDay(day: UserDailyFeatures): boolean {
  return day.medication_event_count > 0;
}

export function isBmShiftDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const median = baselines.bowel_movement.median_bm_count;
  if (median === null) return false;
  return Math.abs(day.bm_count - median) >= 1;
}

export function analyzeMedicationAnyBmShiftCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  if (baselines.bowel_movement.median_bm_count === null) return null;

  const eligibleDays = features.filter((d) => d.bm_count >= 0);
  if (eligibleDays.length < MIN_ELIGIBLE_DAYS) return null;

  const exposureDays = eligibleDays.filter(isMedicationDay);
  if (exposureDays.length < MIN_EXPOSURE_DAYS) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  const supportDates: string[] = [];

  let nonExposedCount = 0;
  let nonExposedShiftCount = 0;

  for (const day of eligibleDays) {
    const medDay = isMedicationDay(day);
    const bmShift = isBmShiftDay(day, baselines);

    if (medDay) {
      exposureCount++;
      if (bmShift) {
        supportCount++;
        supportDates.push(day.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      if (bmShift) {
        nonExposedShiftCount++;
      }
    }
  }

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedShiftCount, nonExposedCount);
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
      non_exposed_shift_count: nonExposedShiftCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'medication',
    subtype: 'medication_any_bm_shift',
    trigger_factors: ['medication_event_count'],
    target_outcomes: ['bm_count'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: sorted[sorted.length - 1].date,
  };
}
