import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type {
  DayBurdenSummary,
  FlareWindow,
  RecoveryWindow,
  FlareDetectionOptions,
  RecoveryDetectionOptions,
} from '../../types/flareRecoveryWindow';

const FLARE_MIN_DAYS = 2;
const RECOVERY_MIN_DAYS = 2;
const BURDEN_ELEVATION_MULTIPLIER = 1.3;

function buildBurdenSummaries(
  orderedDays: UserDailyFeatures[],
  baselines: UserBaselineSet
): DayBurdenSummary[] {
  const highBurdenThreshold =
    baselines.symptoms.high_burden_threshold ??
    (baselines.symptoms.median_burden !== null
      ? baselines.symptoms.median_burden * 1.5
      : null);

  const highUrgencyThreshold =
    baselines.bowel_movement.high_urgency_threshold ?? 1;

  return orderedDays.map((day) => {
    const burdenElevated =
      highBurdenThreshold !== null &&
      day.symptom_burden_score > highBurdenThreshold * BURDEN_ELEVATION_MULTIPLIER;

    const urgencyElevated = day.urgency_event_count > highUrgencyThreshold;
    const looseElevated = day.loose_stool_count >= 2;

    return {
      date: day.date,
      symptomBurden: day.symptom_burden_score,
      urgencyCount: day.urgency_event_count,
      looseStoolCount: day.loose_stool_count,
      isElevated: burdenElevated || urgencyElevated || looseElevated,
    };
  });
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function segmentConsecutiveRuns(
  summaries: DayBurdenSummary[],
  predicate: (s: DayBurdenSummary) => boolean,
  minLength: number
): DayBurdenSummary[][] {
  const segments: DayBurdenSummary[][] = [];
  let current: DayBurdenSummary[] = [];

  for (const s of summaries) {
    if (predicate(s)) {
      current.push(s);
    } else {
      if (current.length >= minLength) segments.push(current);
      current = [];
    }
  }
  if (current.length >= minLength) segments.push(current);

  return segments;
}

export function detectFlareWindows(
  orderedDays: UserDailyFeatures[],
  baselines: UserBaselineSet,
  options: FlareDetectionOptions = {}
): FlareWindow[] {
  const minDays = options.minDays ?? FLARE_MIN_DAYS;

  const summaries = buildBurdenSummaries(orderedDays, baselines);
  const segments = segmentConsecutiveRuns(summaries, (s) => s.isElevated, minDays);

  return segments.map((seg) => ({
    startDate: seg[0].date,
    endDate: seg[seg.length - 1].date,
    durationDays: seg.length,
    days: seg,
    peakBurden: Math.max(...seg.map((s) => s.symptomBurden)),
    avgBurden: avg(seg.map((s) => s.symptomBurden)),
    peakUrgency: Math.max(...seg.map((s) => s.urgencyCount)),
  }));
}

export function detectRecoveryWindows(
  orderedDays: UserDailyFeatures[],
  baselines: UserBaselineSet,
  flareWindows: FlareWindow[] = [],
  options: RecoveryDetectionOptions = {}
): RecoveryWindow[] {
  const minDays = options.minDays ?? RECOVERY_MIN_DAYS;
  const requireFollowsFlare = options.requireFollowsFlare ?? false;

  const medianBurden = baselines.symptoms.median_burden ?? 0;
  const summaries = buildBurdenSummaries(orderedDays, baselines);

  const flareEndDates = new Set(flareWindows.map((f) => f.endDate));

  const segments = segmentConsecutiveRuns(
    summaries,
    (s) => !s.isElevated && s.symptomBurden <= medianBurden * 1.1,
    minDays
  );

  return segments
    .map((seg): RecoveryWindow => {
      const precedingIdx = summaries.findIndex((s) => s.date === seg[0].date) - 1;
      const precedingDate =
        precedingIdx >= 0 ? summaries[precedingIdx].date : null;
      const followsFlare =
        precedingDate !== null && flareEndDates.has(precedingDate);

      return {
        startDate: seg[0].date,
        endDate: seg[seg.length - 1].date,
        durationDays: seg.length,
        days: seg,
        avgBurden: avg(seg.map((s) => s.symptomBurden)),
        followsFlare,
      };
    })
    .filter((w) => !requireFollowsFlare || w.followsFlare);
}
