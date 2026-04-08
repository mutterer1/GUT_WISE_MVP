import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type {
  InsightCandidate,
  CandidateEvidence,
  CandidateStatus,
  DataSufficiency,
} from '../../types/insightCandidates';

const INSIGHT_KEY = 'hydration_low_next_day_hard_stool';

interface DayPair {
  hydrationDay: UserDailyFeatures;
  nextDay: UserDailyFeatures;
}

export function isLowHydrationDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const threshold = baselines.hydration.low_hydration_threshold;
  if (threshold === null) return false;
  return day.hydration_total_ml < threshold;
}

export function isHarderStoolNextDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const medianBristol = baselines.bowel_movement.median_bristol;

  const bristolBelowMedian =
    day.avg_bristol !== null &&
    medianBristol !== null &&
    day.avg_bristol < medianBristol;

  const hasHardStool = day.hard_stool_count > 0;

  return bristolBelowMedian || hasHardStool;
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
      pairs.push({ hydrationDay: current, nextDay: next });
    }
  }

  return pairs;
}

function hasHydrationData(day: UserDailyFeatures): boolean {
  return day.hydration_event_count > 0;
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

export function analyzeHydrationStoolConsistencyCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < 2) return null;

  if (baselines.hydration.low_hydration_threshold === null) return null;

  if (baselines.bowel_movement.median_bristol === null) return null;

  const pairs = getNextDayPairings(features);
  if (pairs.length === 0) return null;

  const eligiblePairs = pairs.filter((p) => hasHydrationData(p.hydrationDay));
  if (eligiblePairs.length === 0) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  const supportDates: string[] = [];

  let nonExposedCount = 0;
  let nonExposedHarderCount = 0;

  for (const pair of eligiblePairs) {
    const lowHydration = isLowHydrationDay(pair.hydrationDay, baselines);
    const harderStool = isHarderStoolNextDay(pair.nextDay, baselines);

    if (lowHydration) {
      exposureCount++;
      if (harderStool) {
        supportCount++;
        supportDates.push(pair.hydrationDay.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      if (harderStool) {
        nonExposedHarderCount++;
      }
    }
  }

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedHarderCount, nonExposedCount);

  let lift: number | null = null;
  if (exposedRate !== null && baselineRate !== null && baselineRate > 0) {
    lift = Math.round((exposedRate / baselineRate) * 100) / 100;
  }

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
      non_exposed_harder_count: nonExposedHarderCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'hydration',
    subtype: 'low_hydration_next_day_hard_stool',
    trigger_factors: ['hydration_total_ml'],
    target_outcomes: ['avg_bristol', 'hard_stool_count'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: sorted[sorted.length - 1].date,
  };
}
