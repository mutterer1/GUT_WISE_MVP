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
import { isHighStressDay } from './stressUrgencyCandidate';
import { isPoorSleepDay } from './sleepSymptomCandidate';
import { isLowHydrationDay } from './hydrationStoolConsistencyCandidate';

const INSIGHT_KEY = 'multifactor_stress_sleep_hydration_compound_risk_symptom_burden';

const MIN_ELIGIBLE_DAYS = 7;
const MIN_EXPOSURE_DAYS = 2;

function isCompoundRiskDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  return (
    isHighStressDay(day, baselines) &&
    isPoorSleepDay(day, baselines) &&
    isLowHydrationDay(day, baselines)
  );
}

function isElevatedSameDayOutcome(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const burdenThreshold = baselines.symptoms.high_burden_threshold;
  if (burdenThreshold !== null && day.symptom_burden_score > burdenThreshold) {
    return true;
  }

  const urgencyThreshold = baselines.bowel_movement.high_urgency_threshold;
  if (urgencyThreshold !== null) {
    return day.urgency_event_count > urgencyThreshold;
  }

  return day.urgency_event_count >= 1;
}

function hasTripleDomainData(day: UserDailyFeatures): boolean {
  const hasStress = day.stress_avg !== null || day.stress_peak !== null;
  const hasSleep =
    day.sleep_entry_count > 0 &&
    (day.sleep_duration_minutes !== null || day.sleep_quality !== null);
  const hasHydration = day.hydration_event_count > 0;
  return hasStress && hasSleep && hasHydration;
}

export function analyzeMultifactorStressSleepHydrationRiskCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  if (
    baselines.stress.high_stress_threshold === null &&
    baselines.stress.median_peak === null
  ) return null;

  if (
    baselines.sleep.low_duration_threshold === null &&
    baselines.sleep.low_quality_threshold === null
  ) return null;

  if (baselines.hydration.low_hydration_threshold === null) return null;

  const eligibleDays = features.filter(hasTripleDomainData);
  if (eligibleDays.length < MIN_ELIGIBLE_DAYS) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  const supportDates: string[] = [];

  let nonExposedCount = 0;
  let nonExposedElevatedCount = 0;

  for (const day of eligibleDays) {
    const compoundRisk = isCompoundRiskDay(day, baselines);
    const elevatedOutcome = isElevatedSameDayOutcome(day, baselines);

    if (compoundRisk) {
      exposureCount++;
      if (elevatedOutcome) {
        supportCount++;
        supportDates.push(day.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      if (elevatedOutcome) {
        nonExposedElevatedCount++;
      }
    }
  }

  if (exposureCount < MIN_EXPOSURE_DAYS) return null;

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedElevatedCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);

  const sufficiency = computeDataSufficiency(eligibleDays.length, exposureCount);
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
      eligible_day_count: eligibleDays.length,
      non_exposed_count: nonExposedCount,
      non_exposed_elevated_count: nonExposedElevatedCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'multifactor',
    subtype: 'compound_risk_day',
    trigger_factors: ['stress_avg', 'stress_peak', 'sleep_duration_minutes', 'sleep_quality', 'hydration_total_ml'],
    target_outcomes: ['symptom_burden_score', 'urgency_event_count'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: sorted[sorted.length - 1].date,
  };
}
