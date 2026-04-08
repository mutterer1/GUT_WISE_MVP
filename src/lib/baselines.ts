import type { UserDailyFeatures } from '../types/dailyFeatures';
import type {
  UserBaselineSet,
  SleepBaseline,
  HydrationBaseline,
  StressBaseline,
  SymptomsBaseline,
  BowelMovementBaseline,
  RoutineBaseline,
  DataQualityBaseline,
  BaselineWindowOptions,
} from '../types/baselines';

// ---------------------------------------------------------------------------
// Statistical helpers
// ---------------------------------------------------------------------------

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  if (p < 0 || p > 100) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const fraction = index - lower;
  return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function proportionTrue(days: UserDailyFeatures[], predicate: (d: UserDailyFeatures) => boolean): number | null {
  if (days.length === 0) return null;
  const count = days.filter(predicate).length;
  return Math.round((count / days.length) * 1000) / 1000;
}

function filterNonNull<T>(values: (T | null | undefined)[]): T[] {
  return values.filter((v): v is T => v !== null && v !== undefined);
}

// ---------------------------------------------------------------------------
// Timezone resolution
// ---------------------------------------------------------------------------

export function selectStableTimezone(days: UserDailyFeatures[]): string | null {
  const nonNull = filterNonNull(days.map((d) => d.timezone));
  if (nonNull.length === 0) return null;

  const freq = new Map<string, number>();
  for (const tz of nonNull) {
    freq.set(tz, (freq.get(tz) ?? 0) + 1);
  }

  let best: string = nonNull[0];
  let bestCount = 0;
  for (const [tz, count] of freq) {
    if (count > bestCount) {
      best = tz;
      bestCount = count;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Window trimming
// ---------------------------------------------------------------------------

export function trimDailyFeaturesWindow(
  features: UserDailyFeatures[],
  windowDays: number
): UserDailyFeatures[] {
  if (features.length === 0) return [];
  const sorted = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const latestDate = sorted[sorted.length - 1].date;
  const cutoff = new Date(latestDate);
  cutoff.setDate(cutoff.getDate() - windowDays + 1);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return sorted.filter((d) => d.date >= cutoffStr);
}

// ---------------------------------------------------------------------------
// Per-domain baseline computations
// ---------------------------------------------------------------------------

function computeSleepBaseline(days: UserDailyFeatures[]): SleepBaseline {
  const durations = filterNonNull(days.map((d) => d.sleep_duration_minutes));
  const qualities = filterNonNull(days.map((d) => d.sleep_quality));

  const medDuration = median(durations);
  const medQuality = median(qualities);

  return {
    median_duration_minutes: medDuration,
    median_quality: medQuality,
    low_duration_threshold: medDuration !== null ? Math.round(medDuration * 0.8) : null,
    low_quality_threshold: medQuality !== null ? Math.max(1, medQuality - 1) : null,
  };
}

function computeHydrationBaseline(days: UserDailyFeatures[]): HydrationBaseline {
  const totals = days.map((d) => d.hydration_total_ml);

  return {
    median_total_ml: median(totals),
    low_hydration_threshold: percentile(totals, 25),
    high_hydration_threshold: percentile(totals, 75),
  };
}

function computeStressBaseline(days: UserDailyFeatures[]): StressBaseline {
  const avgs = filterNonNull(days.map((d) => d.stress_avg));
  const peaks = filterNonNull(days.map((d) => d.stress_peak));

  return {
    median_avg: median(avgs),
    high_stress_threshold: percentile(avgs, 75),
    median_peak: median(peaks),
  };
}

function computeSymptomsBaseline(days: UserDailyFeatures[]): SymptomsBaseline {
  const burdens = days.map((d) => d.symptom_burden_score);
  const maxSeverities = filterNonNull(days.map((d) => d.max_symptom_severity));

  return {
    median_burden: median(burdens),
    high_burden_threshold: percentile(burdens, 75),
    median_max_severity: median(maxSeverities),
  };
}

function computeBowelMovementBaseline(days: UserDailyFeatures[]): BowelMovementBaseline {
  const bmCounts = days.map((d) => d.bm_count);
  const bristols = filterNonNull(days.map((d) => d.avg_bristol));
  const firstHours = filterNonNull(days.map((d) => d.first_bm_hour));
  const urgencies = days.map((d) => d.urgency_event_count);

  return {
    median_bm_count: median(bmCounts),
    median_bristol: median(bristols),
    typical_first_bm_hour: median(firstHours),
    high_urgency_threshold: percentile(urgencies, 75),
  };
}

function computeRoutineBaseline(days: UserDailyFeatures[]): RoutineBaseline {
  return {
    late_meal_rate: proportionTrue(days, (d) => d.late_meal),
    caffeine_beverage_rate: proportionTrue(days, (d) => d.caffeine_beverage_count > 0),
    alcohol_beverage_rate: proportionTrue(days, (d) => d.alcohol_beverage_count > 0),
  };
}

function computeDataQualityBaseline(days: UserDailyFeatures[]): DataQualityBaseline {
  const eventCounts = days.map((d) => d.event_count);
  const completeness = filterNonNull(days.map((d) => d.logging_completeness_score));

  return {
    average_event_count: average(eventCounts),
    average_logging_completeness_score: average(completeness),
  };
}

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

export function computeUserBaselines(featuresForOneUser: UserDailyFeatures[]): UserBaselineSet | null {
  if (featuresForOneUser.length === 0) return null;

  const userId = featuresForOneUser[0].user_id;
  const sorted = [...featuresForOneUser].sort((a, b) => a.date.localeCompare(b.date));

  return {
    user_id: userId,
    computed_from_start_date: sorted[0].date,
    computed_from_end_date: sorted[sorted.length - 1].date,
    day_count: sorted.length,

    sleep: computeSleepBaseline(sorted),
    hydration: computeHydrationBaseline(sorted),
    stress: computeStressBaseline(sorted),
    symptoms: computeSymptomsBaseline(sorted),
    bowel_movement: computeBowelMovementBaseline(sorted),
    routine: computeRoutineBaseline(sorted),
    data_quality: computeDataQualityBaseline(sorted),

    timezone: selectStableTimezone(sorted),
  };
}

export function computeUserBaselinesForWindow(
  features: UserDailyFeatures[],
  options?: BaselineWindowOptions
): UserBaselineSet | null {
  if (features.length === 0) return null;

  const windowDays = options?.windowDays;
  const trimmed = windowDays ? trimDailyFeaturesWindow(features, windowDays) : features;

  return computeUserBaselines(trimmed);
}

export function groupDailyFeaturesByUser(
  features: UserDailyFeatures[]
): Map<string, UserDailyFeatures[]> {
  const groups = new Map<string, UserDailyFeatures[]>();
  for (const f of features) {
    const list = groups.get(f.user_id);
    if (list) {
      list.push(f);
    } else {
      groups.set(f.user_id, [f]);
    }
  }
  return groups;
}
