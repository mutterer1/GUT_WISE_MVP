import type { UserBaselineSet } from '../../types/baselines';
import type {
  MedicationExposureProfile,
  UserDailyFeatures,
} from '../../types/dailyFeatures';

export function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return roundMetric(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export function hasMedicationData(day: UserDailyFeatures): boolean {
  return day.medication_event_count > 0;
}

export function hasStructuredMedicationCoverage(
  day: UserDailyFeatures,
  minCoverage = 0.34
): boolean {
  return (
    hasMedicationData(day) &&
    (day.structured_medication_coverage_ratio ?? 0) >= minCoverage
  );
}

export function getMedicationExposureProfiles(
  day: UserDailyFeatures
): MedicationExposureProfile[] {
  return day.medication_exposure_profiles ?? [];
}

export function getMatchingMedicationProfiles(
  day: UserDailyFeatures,
  matcher: (profile: MedicationExposureProfile) => boolean
): MedicationExposureProfile[] {
  return getMedicationExposureProfiles(day).filter(matcher);
}

export function dayHasMedicationExposure(
  day: UserDailyFeatures,
  matcher: (profile: MedicationExposureProfile) => boolean
): boolean {
  return getMatchingMedicationProfiles(day, matcher).length > 0;
}

export function profileHasFamily(
  profile: MedicationExposureProfile,
  family: string
): boolean {
  const normalizedFamily = normalizeToken(family);
  return profile.medication_families.some(
    (candidateFamily) => normalizeToken(candidateFamily) === normalizedFamily
  );
}

export function profileHasGutEffect(
  profile: MedicationExposureProfile,
  gutEffect: string
): boolean {
  const normalizedEffect = normalizeToken(gutEffect);
  return profile.medication_gut_effects.some(
    (candidateEffect) => normalizeToken(candidateEffect) === normalizedEffect
  );
}

export function isOralOrUnknownRoute(profile: MedicationExposureProfile): boolean {
  return profile.route === null || normalizeToken(profile.route) === 'oral';
}

export function matchesTimingContext(
  profile: MedicationExposureProfile,
  timingContext: string
): boolean {
  if (!profile.timing_context) return false;
  return normalizeToken(profile.timing_context) === normalizeToken(timingContext);
}

export function matchesRegimenStatus(
  profile: MedicationExposureProfile,
  regimenStatus: string
): boolean {
  if (!profile.regimen_status) return false;
  return normalizeToken(profile.regimen_status) === normalizeToken(regimenStatus);
}

export function convertDoseToMilligrams(
  profile: MedicationExposureProfile
): number | null {
  if (profile.dose_value === null || profile.dose_unit === null) return null;

  const normalizedUnit = normalizeToken(profile.dose_unit);

  if (normalizedUnit === 'mg') return profile.dose_value;
  if (normalizedUnit === 'g' || normalizedUnit === 'gram' || normalizedUnit === 'grams') {
    return profile.dose_value * 1000;
  }
  if (
    normalizedUnit === 'mcg' ||
    normalizedUnit === 'ug' ||
    normalizedUnit === 'microgram' ||
    normalizedUnit === 'micrograms'
  ) {
    return profile.dose_value / 1000;
  }

  return null;
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

export function isSameDayNauseaSymptom(day: UserDailyFeatures): boolean {
  return day.symptom_types.some((symptomType) => {
    const normalizedType = normalizeToken(symptomType);
    return (
      normalizedType.includes('nausea') ||
      normalizedType.includes('queasy') ||
      normalizedType.includes('upset_stomach')
    );
  });
}

export function isSameDayLooseStoolPattern(day: UserDailyFeatures): boolean {
  return (
    day.loose_stool_count > 0 ||
    day.urgency_event_count > 0 ||
    (day.avg_bristol !== null && day.avg_bristol >= 6)
  );
}

export function isNextDayHardStoolPattern(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const medianBristol = baselines.bowel_movement.median_bristol;
  const belowTypicalBristol =
    day.avg_bristol !== null &&
    medianBristol !== null &&
    day.avg_bristol < medianBristol;

  return (
    day.hard_stool_count > 0 ||
    day.incomplete_evacuation_count > 0 ||
    (day.avg_bristol !== null && day.avg_bristol <= 3) ||
    belowTypicalBristol
  );
}

export function adjustConfidenceForMedicationCoverage(
  confidence: number | null,
  averageCoverage: number | null,
  averageSignalConfidence: number | null = null,
  averageStructuredExposureShare: number | null = null
): number | null {
  if (confidence === null) return null;

  const coverageFactor =
    averageCoverage === null ? 0.9 : 0.8 + 0.2 * Math.max(0, Math.min(1, averageCoverage));
  const signalFactor =
    averageSignalConfidence === null
      ? 0.92
      : 0.82 + 0.18 * Math.max(0, Math.min(1, averageSignalConfidence));
  const exposureFactor =
    averageStructuredExposureShare === null
      ? 0.94
      : 0.84 +
        0.16 * Math.max(0, Math.min(1, averageStructuredExposureShare));

  return (
    Math.round(
      Math.max(0, Math.min(1, confidence * coverageFactor * signalFactor * exposureFactor)) *
        100
    ) / 100
  );
}