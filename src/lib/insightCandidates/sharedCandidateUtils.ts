import type {
  CandidateStatus,
  DataSufficiency,
  CandidateEvidenceGap,
  CandidateEvidenceQuality,
} from '../../types/insightCandidates';
import type { UserDailyFeatures } from '../../types/dailyFeatures';

export interface RollingWindow {
  days: UserDailyFeatures[];
  startDate: string;
  endDate: string;
  count: number;
}

export interface CandidateThresholdInputs {
  eligibleDayCount: number;
  exposureCount: number;
  contrastCount: number;
  supportCount: number;
  contradictionCount: number;
  supportingLogTypes?: string[];
  endDate?: string;
  sampleDates?: string[];
}

const MIN_EXPOSURE_DAYS = 3;
const MIN_CONTRAST_DAYS = 3;
const MIN_SUPPORT_COUNT = 2;
const RELIABLE_SUPPORT_COUNT = 4;
const HIGH_CONTRADICTION_RATE = 0.45;
const STALE_PATTERN_DAYS = 21;
const VERY_STALE_PATTERN_DAYS = 35;

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

export function computeContradictionRate(
  contradictionCount: number,
  exposureCount: number
): number | null {
  if (exposureCount <= 0) return null;
  return Math.round((contradictionCount / exposureCount) * 1000) / 1000;
}

export function computeRecencyWeight(
  sampleDates: string[],
  analysisEndDate: string
): number | null {
  if (sampleDates.length === 0) return null;

  const latestSample = [...sampleDates].sort().at(-1);
  if (!latestSample) return null;

  const daysSinceLatest = Math.max(
    0,
    Math.round(
      (new Date(analysisEndDate).getTime() - new Date(latestSample).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  if (daysSinceLatest <= 7) return 1;
  if (daysSinceLatest <= 14) return 0.85;
  if (daysSinceLatest <= STALE_PATTERN_DAYS) return 0.7;
  if (daysSinceLatest <= VERY_STALE_PATTERN_DAYS) return 0.5;
  return 0.3;
}

export function buildEvidenceGaps(
  inputs: CandidateThresholdInputs
): CandidateEvidenceGap[] {
  const gaps: CandidateEvidenceGap[] = [];
  const supportingLogTypes = inputs.supportingLogTypes ?? [];
  const contradictionRate = computeContradictionRate(
    inputs.contradictionCount,
    inputs.exposureCount
  );
  const recencyWeight =
    inputs.endDate && inputs.sampleDates
      ? computeRecencyWeight(inputs.sampleDates, inputs.endDate)
      : null;

  if (inputs.exposureCount < MIN_EXPOSURE_DAYS) {
    gaps.push({
      type: 'missing_exposure_days',
      message: `Only ${inputs.exposureCount} exposure day${
        inputs.exposureCount === 1 ? '' : 's'
      } matched this pattern so far.`,
    });
  }

  if (inputs.contrastCount < MIN_CONTRAST_DAYS) {
    gaps.push({
      type: 'missing_baseline_days',
      message: `Only ${inputs.contrastCount} comparison day${
        inputs.contrastCount === 1 ? '' : 's'
      } were available without the trigger.`,
    });
  }

  if (inputs.supportCount < MIN_SUPPORT_COUNT) {
    gaps.push({
      type: 'missing_overlap',
      message: `The pattern only appeared ${inputs.supportCount} time${
        inputs.supportCount === 1 ? '' : 's'
      } in the available overlap.`,
    });
  }

  if (contradictionRate !== null && contradictionRate >= HIGH_CONTRADICTION_RATE) {
    gaps.push({
      type: 'high_contradiction',
      message: `Contradictory days were common (${Math.round(
        contradictionRate * 100
      )}% of exposure days).`,
    });
  }

  if (recencyWeight !== null && recencyWeight <= 0.5) {
    gaps.push({
      type: 'stale_pattern',
      message: 'The strongest supporting examples are not recent.',
    });
  }

  if (supportingLogTypes.length > 0 && supportingLogTypes.length < 2) {
    gaps.push({
      type: 'narrow_signal',
      message: 'This pattern is supported by a narrow set of log categories.',
    });
  }

  return gaps;
}

export function computeDataSufficiency(
  eligibleDayCount: number,
  exposureCount: number,
  contrastCount = 0
): DataSufficiency {
  if (
    eligibleDayCount < 6 ||
    exposureCount < MIN_EXPOSURE_DAYS ||
    contrastCount < MIN_CONTRAST_DAYS
  ) {
    return 'insufficient';
  }

  if (eligibleDayCount >= 18 && exposureCount >= 6 && contrastCount >= 6) {
    return 'strong';
  }

  if (eligibleDayCount >= 12 && exposureCount >= 4 && contrastCount >= 4) {
    return 'adequate';
  }

  return 'partial';
}

export function computeEvidenceQuality(
  sufficiency: DataSufficiency,
  supportCount: number,
  contradictionCount: number,
  exposureCount: number,
  contrastCount: number,
  recencyWeight: number | null,
  supportingLogTypes: string[] = []
): CandidateEvidenceQuality {
  const contradictionRate = computeContradictionRate(contradictionCount, exposureCount) ?? 0;
  const narrowSignalPenalty = supportingLogTypes.length > 0 && supportingLogTypes.length < 2;
  const stalePenalty = recencyWeight !== null && recencyWeight <= 0.5;

  if (
    sufficiency === 'strong' &&
    supportCount >= RELIABLE_SUPPORT_COUNT &&
    contrastCount >= 5 &&
    contradictionRate < 0.25 &&
    !narrowSignalPenalty &&
    !stalePenalty
  ) {
    return 'high';
  }

  if (
    (sufficiency === 'adequate' || sufficiency === 'strong') &&
    supportCount >= 3 &&
    contrastCount >= 3 &&
    contradictionRate < 0.4
  ) {
    return 'moderate';
  }

  if (sufficiency === 'partial' || supportCount >= 2) {
    return 'low';
  }

  return 'very_low';
}

export function computeStatus(
  sufficiency: DataSufficiency,
  supportCount: number,
  exposedRate: number | null,
  baselineRate: number | null,
  contradictionCount = 0,
  exposureCount = 0,
  contrastCount = 0,
  evidenceQuality: CandidateEvidenceQuality = 'very_low'
): CandidateStatus {
  if (sufficiency === 'insufficient') return 'insufficient';
  if (contrastCount < MIN_CONTRAST_DAYS || exposureCount < MIN_EXPOSURE_DAYS) {
    return 'insufficient';
  }

  const contradictionRate = computeContradictionRate(contradictionCount, exposureCount) ?? 0;

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
    supportCount >= RELIABLE_SUPPORT_COUNT &&
    contradictionRate < 0.3 &&
    (evidenceQuality === 'moderate' || evidenceQuality === 'high') &&
    (sufficiency === 'adequate' || sufficiency === 'strong')
  ) {
    return 'reliable';
  }

  if (
    meaningfulLift &&
    supportCount >= 3 &&
    contradictionRate < 0.45 &&
    evidenceQuality !== 'very_low'
  ) {
    return 'emerging';
  }

  if (supportCount >= MIN_SUPPORT_COUNT && contradictionRate < 0.6) {
    return 'exploratory';
  }

  return 'insufficient';
}

export function computeConfidence(
  sufficiency: DataSufficiency,
  supportCount: number,
  contradictionCount: number,
  lift: number | null,
  exposureCount = 0,
  contrastCount = 0,
  recencyWeight: number | null = null,
  supportingLogTypes: string[] = []
): number | null {
  if (sufficiency === 'insufficient') return null;
  if (exposureCount < MIN_EXPOSURE_DAYS || contrastCount < MIN_CONTRAST_DAYS) {
    return null;
  }

  let score = 0;

  const sufficiencyWeights: Record<DataSufficiency, number> = {
    insufficient: 0,
    partial: 0.16,
    adequate: 0.27,
    strong: 0.34,
  };
  score += sufficiencyWeights[sufficiency];

  const supportComponent = Math.min(supportCount / 6, 1) * 0.22;
  score += supportComponent;

  const contrastComponent = Math.min(contrastCount / 6, 1) * 0.12;
  score += contrastComponent;

  if (lift !== null && lift > 1) {
    const liftComponent = Math.min((lift - 1) / 2, 1) * 0.18;
    score += liftComponent;
  }

  const contradictionRate = computeContradictionRate(contradictionCount, exposureCount);
  if (contradictionRate !== null) {
    score -= contradictionRate * 0.2;
  }

  if (recencyWeight !== null) {
    score *= recencyWeight;
  }

  if (supportingLogTypes.length > 0 && supportingLogTypes.length < 2) {
    score -= 0.08;
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

export function buildUncertaintyStatement(
  gaps: CandidateEvidenceGap[]
): string {
  if (gaps.length === 0) {
    return 'This pattern has enough repeated overlap to be worth watching, but it is still not a diagnosis.';
  }

  return gaps
    .slice(0, 2)
    .map((gap) => gap.message)
    .join(' ');
}
