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

const INSIGHT_KEY = 'food_low_meal_regularity_symptom_burden';

function hasFoodData(day: UserDailyFeatures): boolean {
  return day.meal_count > 0;
}

function computeMedianMealCount(days: UserDailyFeatures[]): number | null {
  const counts = days.map((d) => d.meal_count).filter((c) => c > 0);
  if (counts.length === 0) return null;
  const sorted = [...counts].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function isLowMealRegularityDay(
  day: UserDailyFeatures,
  medianMealCount: number
): boolean {
  return day.meal_count < medianMealCount;
}

function isElevatedSymptomBurdenDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const threshold = baselines.symptoms.high_burden_threshold;
  if (threshold !== null) {
    return day.symptom_burden_score > threshold;
  }
  return day.symptom_burden_score > 0;
}

export function analyzeFoodMealRegularitySymptomBurdenCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  const eligibleDays = features.filter(hasFoodData);
  if (eligibleDays.length < 5) return null;

  const medianMealCount = computeMedianMealCount(eligibleDays);
  if (medianMealCount === null || medianMealCount <= 1) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  const supportDates: string[] = [];

  let nonExposedCount = 0;
  let nonExposedElevatedCount = 0;

  for (const day of eligibleDays) {
    const lowRegularity = isLowMealRegularityDay(day, medianMealCount);
    const elevatedBurden = isElevatedSymptomBurdenDay(day, baselines);

    if (lowRegularity) {
      exposureCount++;
      if (elevatedBurden) {
        supportCount++;
        supportDates.push(day.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      if (elevatedBurden) {
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
      median_meal_count: medianMealCount,
      non_exposed_count: nonExposedCount,
      non_exposed_elevated_count: nonExposedElevatedCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'food',
    subtype: 'low_meal_regularity_symptom_burden',
    trigger_factors: ['meal_count'],
    target_outcomes: ['symptom_burden_score'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: sorted[sorted.length - 1].date,
  };
}
