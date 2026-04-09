import type {
  CandidateStatus,
  DataSufficiency,
} from '../../types/insightCandidates';
import type { UserDailyFeatures } from '../../types/dailyFeatures';

export interface RollingWindow {
  days: UserDailyFeatures[];
  startDate: string;
  endDate: string;
  count: number;
}

export function buildRollingWindows(
  orderedDays: UserDailyFeatures[],
  windowSize: number
): RollingWindow[] {
  if (windowSize < 1 || orderedDays.length < windowSize) return [];
  const windows: RollingWindow[] = [];
  for (let i = 0; i <= orderedDays.length - windowSize; i++) {
    const slice = orderedDays.slice(i, i + windowSize);
    windows.push({
      days: slice,
      startDate: slice[0].date,
      endDate: slice[slice.length - 1].date,
      count: slice.length,
    });
  }
  return windows;
}

export function safeRate(count: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((count / total) * 1000) / 1000;
}

export function computeDataSufficiency(
  eligibleDayCount: number,
  exposureCount: number
): DataSufficiency {
  if (eligibleDayCount < 5 || exposureCount < 2) return 'insufficient';
  if (eligibleDayCount >= 14 && exposureCount >= 4) return 'strong';
  if (eligibleDayCount >= 10 && exposureCount >= 3) return 'adequate';
  return 'partial';
}

export function computeStatus(
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

export function computeConfidence(
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

export function computeLift(
  exposedRate: number | null,
  baselineRate: number | null
): number | null {
  if (exposedRate === null || baselineRate === null || baselineRate <= 0) {
    return null;
  }
  return Math.round((exposedRate / baselineRate) * 100) / 100;
}
