import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type {
  InsightCandidate,
  CandidateEvidence,
  CandidateStatus,
  DataSufficiency,
} from '../../types/insightCandidates';

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

  // Fallback: when no baseline threshold exists, conservatively treat
  // any urgency event as elevated. This only fires when the user has
  // no established urgency baseline at all.
  return day.urgency_event_count >= 1;
}

function hasStressData(day: UserDailyFeatures): boolean {
  return day.stress_avg !== null || day.stress_peak !== null;
}

function computeDataSufficiency(
  eligibleDayCount: number,
  exposureCount: number
): DataSufficiency {
  if (eligibleDayCount < 5 || exposureCount < 2) return 'insufficient';
  if (eligibleDayCount >= 14 && exposureCount >= 4) return 'strong';
  if (eligibleDayCount >= 10 && exposureCount >= 3) return 'adequate';
  return 'partial';
}

function computeStatus(
  sufficiency: DataSufficiency,
  supportCount: number,
  exposedRate: number | null,
  baselineRate: number | null
): CandidateStatus {
  if (sufficiency === 'insufficient') return 'insufficient';

  const meaningfulLift =
    exposedRate !== null &&
    baselineRate !== null &&
    baselineRate > 0 &&
    exposedRate > baselineRate * 1.2;

  const clearLift =
    exposedRate !== null &&
    baselineRate !== null &&
    baselineRate > 0 &&
    exposedRate > baselineRate * 1.5;

  if (
    clearLift &&
    supportCount >= 4 &&
    (sufficiency === 'adequate' || sufficiency === 'strong')
  ) {
    return 'reliable';
  }

  if (meaningfulLift && supportCount >= 3) return 'emerging';

  if (supportCount >= 2) return 'exploratory';

  return 'insufficient';
}

function computeConfidence(
  sufficiency: DataSufficiency,
  supportCount: number,
  contradictionCount: number,
  lift: number | null
): number | null {
  if (sufficiency === 'insufficient') return null;

  let score = 0;

  const sufficiencyWeights: Record<DataSufficiency, number> = {
    insufficient: 0,
    partial: 0.15,
    adequate: 0.25,
    strong: 0.3,
  };
  score += sufficiencyWeights[sufficiency];

  const supportComponent = Math.min(supportCount / 6, 1) * 0.3;
  score += supportComponent;

  if (lift !== null && lift > 1) {
    const liftComponent = Math.min((lift - 1) / 2, 1) * 0.25;
    score += liftComponent;
  }

  const totalExposed = supportCount + contradictionCount;
  if (totalExposed > 0) {
    const contradictionPenalty = (contradictionCount / totalExposed) * 0.15;
    score -= contradictionPenalty;
  }

  return Math.round(Math.max(0, Math.min(1, score)) * 100) / 100;
}

function safeRate(count: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((count / total) * 1000) / 1000;
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

  let lift: number | null = null;
  if (exposedRate !== null && baselineRate !== null && baselineRate > 0) {
    lift = Math.round((exposedRate / baselineRate) * 100) / 100;
  }

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
