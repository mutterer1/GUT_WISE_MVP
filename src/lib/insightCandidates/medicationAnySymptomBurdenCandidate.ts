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
import { isMedicationDay } from './medicationAnyBmShiftCandidate';

const INSIGHT_KEY = 'medication_any_same_day_symptom_burden';

const MIN_ELIGIBLE_DAYS = 7;
const MIN_EXPOSURE_DAYS = 3;

function isElevatedSymptomBurdenDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const burdenAboveThreshold =
    baselines.symptoms.high_burden_threshold !== null &&
    day.symptom_burden_score > baselines.symptoms.high_burden_threshold;

  const severityAboveMedian =
    day.max_symptom_severity !== null &&
    baselines.symptoms.median_max_severity !== null &&
    day.max_symptom_severity > baselines.symptoms.median_max_severity;

  return burdenAboveThreshold || severityAboveMedian;
}

function hasSymptomData(day: UserDailyFeatures): boolean {
  return day.symptom_event_count >= 0;
}

export function analyzeMedicationAnySymptomBurdenCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  const { symptoms } = baselines;
  if (symptoms.high_burden_threshold === null && symptoms.median_max_severity === null) {
    return null;
  }

  const eligibleDays = features.filter(hasSymptomData);
  if (eligibleDays.length < MIN_ELIGIBLE_DAYS) return null;

  const exposureDays = eligibleDays.filter(isMedicationDay);
  if (exposureDays.length < MIN_EXPOSURE_DAYS) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  const supportDates: string[] = [];

  let nonExposedCount = 0;
  let nonExposedElevatedCount = 0;

  for (const day of eligibleDays) {
    const medDay = isMedicationDay(day);
    const elevated = isElevatedSymptomBurdenDay(day, baselines);

    if (medDay) {
      exposureCount++;
      if (elevated) {
        supportCount++;
        supportDates.push(day.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      if (elevated) {
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
    category: 'medication',
    subtype: 'medication_any_symptom_burden',
    trigger_factors: ['medication_event_count'],
    target_outcomes: ['symptom_burden_score', 'max_symptom_severity'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: sorted[sorted.length - 1].date,
  };
}
