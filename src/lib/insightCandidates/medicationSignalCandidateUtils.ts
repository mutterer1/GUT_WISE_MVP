import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate, CandidateEvidence } from '../../types/insightCandidates';
import type {
  MedicationFamilyKey,
  MedicationGutEffectKey,
} from '../../data/medicationCatalog';
import {
  safeRate,
  computeDataSufficiency,
  computeStatus,
  computeConfidence,
  computeLift,
  computeRecencyWeight,
  computeContradictionRate,
  computeEvidenceQuality,
  buildEvidenceGaps,
  buildUncertaintyStatement,
} from './sharedCandidateUtils';

interface ConsecutiveDayPair {
  exposureDay: UserDailyFeatures;
  nextDay: UserDailyFeatures;
}

export interface MedicationSignalCandidateConfig {
  insightKey: string;
  subtype: string;
  triggerFactors: string[];
  targetOutcomes: string[];
  eligibleDay: (day: UserDailyFeatures, baselines: UserBaselineSet) => boolean;
  exposureDay: (day: UserDailyFeatures) => boolean;
  supportDay: (day: UserDailyFeatures, baselines: UserBaselineSet) => boolean;
  supportingLogTypes?: string[];
  recommendedMissingLogTypes?: string[];
  minimumEligibleDays?: number;
  minimumExposureDays?: number;
  notes?: string[];
}

export interface MedicationNextDaySignalCandidateConfig {
  insightKey: string;
  subtype: string;
  triggerFactors: string[];
  targetOutcomes: string[];
  eligiblePair: (
    exposureDay: UserDailyFeatures,
    nextDay: UserDailyFeatures,
    baselines: UserBaselineSet
  ) => boolean;
  exposureDay: (day: UserDailyFeatures) => boolean;
  supportNextDay: (day: UserDailyFeatures, baselines: UserBaselineSet) => boolean;
  supportingLogTypes?: string[];
  recommendedMissingLogTypes?: string[];
  minimumEligiblePairs?: number;
  minimumExposureDays?: number;
  notes?: string[];
}

function normalizeSymptomTypes(day: UserDailyFeatures): string[] {
  return day.symptom_types.map((item) => item.toLowerCase());
}

function adjustConfidenceForMedicationSource(
  confidence: number | null,
  exposureCount: number,
  referenceBackedExposureCount: number
): number | null {
  if (confidence === null || exposureCount === 0) return confidence;

  const supportRatio = referenceBackedExposureCount / exposureCount;
  let adjusted = confidence;

  if (referenceBackedExposureCount === 0) {
    adjusted -= 0.12;
  } else if (supportRatio < 0.5) {
    adjusted -= 0.06;
  } else if (supportRatio < 0.8) {
    adjusted -= 0.03;
  }

  return Math.round(Math.max(0, Math.min(1, adjusted)) * 100) / 100;
}

function buildSourceNote(
  exposureCount: number,
  referenceBackedExposureCount: number
): string {
  if (referenceBackedExposureCount === 0) {
    return 'All exposure days relied on heuristic medication classification rather than matched medication reference rows.';
  }

  if (referenceBackedExposureCount === exposureCount) {
    return 'All exposure days included matched medication reference rows.';
  }

  return `${exposureCount - referenceBackedExposureCount} of ${exposureCount} exposure days relied on heuristic medication classification instead of matched medication reference rows.`;
}

function getObservedSupportingLogTypes(days: UserDailyFeatures[]): string[] {
  const logTypes = new Set<string>();

  for (const day of days) {
    if (day.medication_event_count > 0) {
      logTypes.add('medication');
    }

    if (
      day.symptom_event_count > 0 ||
      day.symptom_burden_score > 0 ||
      day.max_symptom_severity !== null
    ) {
      logTypes.add('symptom');
    }

    if (
      day.bm_count > 0 ||
      day.avg_bristol !== null ||
      day.urgency_event_count > 0 ||
      day.loose_stool_count > 0 ||
      day.hard_stool_count > 0
    ) {
      logTypes.add('gut');
    }

    if (day.meal_count > 0) {
      logTypes.add('food');
    }

    if (day.hydration_event_count > 0) {
      logTypes.add('hydration');
    }

    if (
      day.stress_event_count > 0 ||
      day.stress_avg !== null ||
      day.stress_peak !== null
    ) {
      logTypes.add('stress');
    }

    if (day.sleep_entry_count > 0) {
      logTypes.add('sleep');
    }
  }

  return Array.from(logTypes);
}

function hasReferenceBackedMedication(day: UserDailyFeatures): boolean {
  return (day.matched_medication_ids ?? []).length > 0;
}

function getConsecutiveDayPairs(features: UserDailyFeatures[]): ConsecutiveDayPair[] {
  if (features.length < 2) return [];

  const sorted = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const pairs: ConsecutiveDayPair[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const currentDate = new Date(current.date);
    const nextDate = new Date(next.date);
    const diffMs = nextDate.getTime() - currentDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (Math.abs(diffDays - 1) < 0.01) {
      pairs.push({ exposureDay: current, nextDay: next });
    }
  }

  return pairs;
}

export function hasMedicationAndGutContext(day: UserDailyFeatures): boolean {
  return (
    day.medication_event_count > 0 &&
    (day.bm_count > 0 ||
      day.avg_bristol !== null ||
      day.urgency_event_count > 0 ||
      day.loose_stool_count > 0 ||
      day.hard_stool_count > 0)
  );
}

export function hasMedicationAndSymptomContext(day: UserDailyFeatures): boolean {
  return (
    day.medication_event_count > 0 &&
    (day.symptom_event_count > 0 ||
      day.max_symptom_severity !== null ||
      day.symptom_types.length > 0)
  );
}

export function hasMedicationData(day: UserDailyFeatures): boolean {
  return day.medication_event_count > 0;
}

export function hasGutContext(day: UserDailyFeatures): boolean {
  return (
    day.bm_count > 0 ||
    day.avg_bristol !== null ||
    day.urgency_event_count > 0 ||
    day.loose_stool_count > 0 ||
    day.hard_stool_count > 0
  );
}

export function hasSymptomContext(day: UserDailyFeatures): boolean {
  return (
    day.symptom_event_count > 0 ||
    day.max_symptom_severity !== null ||
    day.symptom_types.length > 0
  );
}

export function hasMedicationFamily(
  day: UserDailyFeatures,
  family: MedicationFamilyKey
): boolean {
  return day.medication_families.includes(family);
}

export function hasMedicationGutEffect(
  day: UserDailyFeatures,
  effect: MedicationGutEffectKey
): boolean {
  return day.medication_gut_effects.includes(effect);
}

export function hasElevatedSymptomBurden(
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

export function hasBloatingLikeSymptoms(day: UserDailyFeatures): boolean {
  return normalizeSymptomTypes(day).some((symptom) =>
    ['bloating', 'gas', 'distension', 'abdominal fullness'].includes(symptom)
  );
}

export function hasRefluxLikeSymptoms(day: UserDailyFeatures): boolean {
  return normalizeSymptomTypes(day).some((symptom) =>
    ['reflux', 'heartburn', 'acid reflux', 'indigestion'].includes(symptom)
  );
}

export function hasLooseStoolPattern(day: UserDailyFeatures): boolean {
  return day.loose_stool_count > 0 || (day.avg_bristol !== null && day.avg_bristol >= 6);
}

export function hasConstipationPattern(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const lowBmCount =
    baselines.bowel_movement.median_bm_count !== null &&
    day.bm_count < baselines.bowel_movement.median_bm_count;

  const harderThanBaseline =
    baselines.bowel_movement.median_bristol !== null &&
    day.avg_bristol !== null &&
    day.avg_bristol < baselines.bowel_movement.median_bristol;

  return day.hard_stool_count > 0 || harderThanBaseline || lowBmCount;
}

export function hasBmDisruptionPattern(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const countShift =
    baselines.bowel_movement.median_bm_count !== null &&
    Math.abs(day.bm_count - baselines.bowel_movement.median_bm_count) >= 1;

  const bristolShift =
    baselines.bowel_movement.median_bristol !== null &&
    day.avg_bristol !== null &&
    Math.abs(day.avg_bristol - baselines.bowel_movement.median_bristol) >= 1;

  return (
    countShift ||
    bristolShift ||
    day.loose_stool_count > 0 ||
    day.hard_stool_count > 0 ||
    day.urgency_event_count > 0
  );
}

export function analyzeMedicationSignalCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet,
  config: MedicationSignalCandidateConfig
): InsightCandidate | null {
  const minimumEligibleDays = config.minimumEligibleDays ?? 7;
  const minimumExposureDays = config.minimumExposureDays ?? 3;

  if (features.length === 0) return null;

  const eligibleDays = features
    .filter((day) => config.eligibleDay(day, baselines))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (eligibleDays.length < minimumEligibleDays) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedSupportCount = 0;
  let referenceBackedExposureCount = 0;
  let referenceBackedSupportCount = 0;

  const supportDates: string[] = [];
  const exposedDates: string[] = [];
  const baselineDates: string[] = [];

  for (const day of eligibleDays) {
    const exposed = config.exposureDay(day);
    const supported = config.supportDay(day, baselines);
    const referenceBacked = hasReferenceBackedMedication(day);

    if (exposed) {
      exposureCount++;
      exposedDates.push(day.date);

      if (referenceBacked) {
        referenceBackedExposureCount++;
      }

      if (supported) {
        supportCount++;
        supportDates.push(day.date);

        if (referenceBacked) {
          referenceBackedSupportCount++;
        }
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      baselineDates.push(day.date);

      if (supported) {
        nonExposedSupportCount++;
      }
    }
  }

  if (exposureCount < minimumExposureDays) return null;

  const contrastCount = nonExposedCount;
  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedSupportCount, contrastCount);
  const lift = computeLift(exposedRate, baselineRate);
  const analysisEndDate = eligibleDays[eligibleDays.length - 1].date;
  const observedSupportingLogTypes = getObservedSupportingLogTypes(eligibleDays);
  const supportingLogTypes =
    config.supportingLogTypes && config.supportingLogTypes.length > 0
      ? config.supportingLogTypes.filter((logType) =>
          observedSupportingLogTypes.includes(logType)
        )
      : observedSupportingLogTypes;
  const missingLogTypes = (config.recommendedMissingLogTypes ?? []).filter(
    (logType) => !observedSupportingLogTypes.includes(logType)
  );

  const sufficiency = computeDataSufficiency(
    eligibleDays.length,
    exposureCount,
    contrastCount
  );
  const recencyWeight = computeRecencyWeight(supportDates, analysisEndDate);
  const contradictionRate = computeContradictionRate(contradictionCount, exposureCount);
  const evidenceQuality = computeEvidenceQuality(
    sufficiency,
    supportCount,
    contradictionCount,
    exposureCount,
    contrastCount,
    recencyWeight,
    supportingLogTypes
  );
  const evidenceGaps = buildEvidenceGaps({
    eligibleDayCount: eligibleDays.length,
    exposureCount,
    contrastCount,
    supportCount,
    contradictionCount,
    supportingLogTypes,
    endDate: analysisEndDate,
    sampleDates: supportDates,
  });
  const uncertaintyStatement = buildUncertaintyStatement(evidenceGaps);
  const status = computeStatus(
    sufficiency,
    supportCount,
    exposedRate,
    baselineRate,
    contradictionCount,
    exposureCount,
    contrastCount,
    evidenceQuality
  );
  const confidence = adjustConfidenceForMedicationSource(
    computeConfidence(
      sufficiency,
      supportCount,
      contradictionCount,
      lift,
      exposureCount,
      contrastCount,
      recencyWeight,
      supportingLogTypes
    ),
    exposureCount,
    referenceBackedExposureCount
  );

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: exposureCount,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    contrast_count: contrastCount,
    eligible_day_count: eligibleDays.length,
    exposed_day_count: exposureCount,
    baseline_day_count: contrastCount,
    contradiction_rate: contradictionRate,
    recency_weight: recencyWeight,
    evidence_quality: evidenceQuality,
    supporting_log_types: supportingLogTypes,
    missing_log_types: missingLogTypes,
    exposed_dates: exposedDates.slice(0, 10),
    baseline_dates: baselineDates.slice(0, 10),
    uncertainty_statement: uncertaintyStatement,
    evidence_gaps: evidenceGaps,
    notes: [...(config.notes ?? []), buildSourceNote(exposureCount, referenceBackedExposureCount)],
    statistics: {
      eligible_day_count: eligibleDays.length,
      non_exposed_count: nonExposedCount,
      non_exposed_support_count: nonExposedSupportCount,
      reference_backed_exposure_count: referenceBackedExposureCount,
      reference_backed_support_count: referenceBackedSupportCount,
      heuristic_only_exposure_count: exposureCount - referenceBackedExposureCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: config.insightKey,
    category: 'medication',
    subtype: config.subtype,
    trigger_factors: config.triggerFactors,
    target_outcomes: config.targetOutcomes,
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: eligibleDays[0].date,
    created_from_end_date: analysisEndDate,
  };
}

export function analyzeMedicationNextDaySignalCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet,
  config: MedicationNextDaySignalCandidateConfig
): InsightCandidate | null {
  const minimumEligiblePairs = config.minimumEligiblePairs ?? 6;
  const minimumExposureDays = config.minimumExposureDays ?? 3;

  if (features.length < 2) return null;

  const sorted = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const pairs = getConsecutiveDayPairs(sorted);
  if (pairs.length === 0) return null;

  const eligiblePairs = pairs.filter((pair) =>
    config.eligiblePair(pair.exposureDay, pair.nextDay, baselines)
  );
  if (eligiblePairs.length < minimumEligiblePairs) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedSupportCount = 0;
  let referenceBackedExposureCount = 0;
  let referenceBackedSupportCount = 0;

  const supportDates: string[] = [];
  const exposedDates: string[] = [];
  const baselineDates: string[] = [];

  for (const pair of eligiblePairs) {
    const exposed = config.exposureDay(pair.exposureDay);
    const supported = config.supportNextDay(pair.nextDay, baselines);
    const referenceBacked = hasReferenceBackedMedication(pair.exposureDay);

    if (exposed) {
      exposureCount++;
      exposedDates.push(pair.exposureDay.date);

      if (referenceBacked) {
        referenceBackedExposureCount++;
      }

      if (supported) {
        supportCount++;
        supportDates.push(pair.exposureDay.date);

        if (referenceBacked) {
          referenceBackedSupportCount++;
        }
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      baselineDates.push(pair.exposureDay.date);

      if (supported) {
        nonExposedSupportCount++;
      }
    }
  }

  if (exposureCount < minimumExposureDays) return null;

  const contrastCount = nonExposedCount;
  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedSupportCount, contrastCount);
  const lift = computeLift(exposedRate, baselineRate);
  const analysisEndDate = sorted[sorted.length - 1].date;
  const observedSupportingLogTypes = getObservedSupportingLogTypes(
    eligiblePairs.flatMap((pair) => [pair.exposureDay, pair.nextDay])
  );
  const supportingLogTypes =
    config.supportingLogTypes && config.supportingLogTypes.length > 0
      ? config.supportingLogTypes.filter((logType) =>
          observedSupportingLogTypes.includes(logType)
        )
      : observedSupportingLogTypes;
  const missingLogTypes = (config.recommendedMissingLogTypes ?? []).filter(
    (logType) => !observedSupportingLogTypes.includes(logType)
  );

  const sufficiency = computeDataSufficiency(
    eligiblePairs.length,
    exposureCount,
    contrastCount
  );
  const recencyWeight = computeRecencyWeight(supportDates, analysisEndDate);
  const contradictionRate = computeContradictionRate(contradictionCount, exposureCount);
  const evidenceQuality = computeEvidenceQuality(
    sufficiency,
    supportCount,
    contradictionCount,
    exposureCount,
    contrastCount,
    recencyWeight,
    supportingLogTypes
  );
  const evidenceGaps = buildEvidenceGaps({
    eligibleDayCount: eligiblePairs.length,
    exposureCount,
    contrastCount,
    supportCount,
    contradictionCount,
    supportingLogTypes,
    endDate: analysisEndDate,
    sampleDates: supportDates,
  });
  const uncertaintyStatement = buildUncertaintyStatement(evidenceGaps);
  const status = computeStatus(
    sufficiency,
    supportCount,
    exposedRate,
    baselineRate,
    contradictionCount,
    exposureCount,
    contrastCount,
    evidenceQuality
  );
  const confidence = adjustConfidenceForMedicationSource(
    computeConfidence(
      sufficiency,
      supportCount,
      contradictionCount,
      lift,
      exposureCount,
      contrastCount,
      recencyWeight,
      supportingLogTypes
    ),
    exposureCount,
    referenceBackedExposureCount
  );

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: exposureCount,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    contrast_count: contrastCount,
    eligible_day_count: eligiblePairs.length,
    exposed_day_count: exposureCount,
    baseline_day_count: contrastCount,
    contradiction_rate: contradictionRate,
    recency_weight: recencyWeight,
    evidence_quality: evidenceQuality,
    supporting_log_types: supportingLogTypes,
    missing_log_types: missingLogTypes,
    exposed_dates: exposedDates.slice(0, 10),
    baseline_dates: baselineDates.slice(0, 10),
    uncertainty_statement: uncertaintyStatement,
    evidence_gaps: evidenceGaps,
    notes: [...(config.notes ?? []), buildSourceNote(exposureCount, referenceBackedExposureCount)],
    statistics: {
      eligible_pair_count: eligiblePairs.length,
      non_exposed_count: nonExposedCount,
      non_exposed_support_count: nonExposedSupportCount,
      reference_backed_exposure_count: referenceBackedExposureCount,
      reference_backed_support_count: referenceBackedSupportCount,
      heuristic_only_exposure_count: exposureCount - referenceBackedExposureCount,
      total_pair_count: pairs.length,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: config.insightKey,
    category: 'medication',
    subtype: config.subtype,
    trigger_factors: config.triggerFactors,
    target_outcomes: config.targetOutcomes,
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: analysisEndDate,
  };
}