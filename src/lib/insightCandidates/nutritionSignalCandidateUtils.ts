import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';

export function hasFoodData(day: UserDailyFeatures): boolean {
  return day.meal_count > 0;
}

export function hasSymptomContext(day: UserDailyFeatures): boolean {
  return (
    day.symptom_event_count > 0 ||
    day.max_symptom_severity !== null ||
    day.symptom_types.length > 0
  );
}

export function isElevatedSymptomBurdenDay(
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

export function hasUsableNutritionCoverage(
  day: UserDailyFeatures,
  minCoverage = 0.5
): boolean {
  return (
    hasFoodData(day) &&
    (day.nutrition_coverage_ratio ?? 0) >= minCoverage &&
    (day.calories_kcal_total ?? 0) > 0
  );
}

export function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return roundMetric(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function adjustConfidenceForCoverage(
  confidence: number | null,
  averageCoverage: number | null,
  averageNutritionConfidence: number | null = null
): number | null {
  if (confidence === null) return null;

  const coverageFactor =
    averageCoverage === null ? 0.88 : 0.82 + 0.18 * Math.max(0, Math.min(1, averageCoverage));
  const nutritionFactor =
    averageNutritionConfidence === null
      ? 0.92
      : 0.84 + 0.16 * Math.max(0, Math.min(1, averageNutritionConfidence));

  return (
    Math.round(
      Math.max(0, Math.min(1, confidence * coverageFactor * nutritionFactor)) * 100
    ) / 100
  );
}