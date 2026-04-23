import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate, CandidateEvidence } from '../../types/insightCandidates';
import {
  safeRate,
  computeDataSufficiency,
  computeStatus,
  computeConfidence,
  computeLift,
  computeContradictionRate,
  computeRecencyWeight,
  computeEvidenceQuality,
  buildEvidenceGaps,
  buildUncertaintyStatement,
} from './sharedCandidateUtils';

export interface IngredientSignalCandidateConfig {
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

function normalizeSymptomSet(day: UserDailyFeatures): string[] {
  return day.symptom_types.map((item) => item.toLowerCase());
}

export function hasFoodAndSymptomContext(day: UserDailyFeatures): boolean {
  return (
    day.meal_count > 0 &&
    (day.symptom_event_count > 0 ||
      day.max_symptom_severity !== null ||
      day.symptom_types.length > 0)
  );
}

export function hasFoodAndGutContext(day: UserDailyFeatures): boolean {
  return (
    day.meal_count > 0 &&
    (day.bm_count > 0 ||
      day.avg_bristol !== null ||
      day.urgency_event_count > 0 ||
      day.loose_stool_count > 0 ||
      day.hard_stool_count > 0)
  );
}

export function hasBloatingOrGasSymptoms(day: UserDailyFeatures): boolean {
  const symptomSet = normalizeSymptomSet(day);
  return symptomSet.some((symptom) =>
    ['bloating', 'gas', 'distension', 'abdominal fullness'].includes(symptom)
  );
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

export function hasLooseStoolPattern(day: UserDailyFeatures): boolean {
  return day.loose_stool_count > 0 || (day.avg_bristol !== null && day.avg_bristol >= 6);
}

export function hasUrgencyPattern(day: UserDailyFeatures): boolean {
  return day.urgency_event_count > 0;
}

export function hasBowelPatternShift(
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

function getObservedSupportingLogTypes(days: UserDailyFeatures[]): string[] {
  const logTypes = new Set<string>();

  for (const day of days) {
    if (day.meal_count > 0) logTypes.add('food');

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

    if (day.hydration_event_count > 0) logTypes.add('hydration');

    if (
      day.stress_event_count > 0 ||
      day.stress_avg !== null ||
      day.stress_peak !== null
    ) {
      logTypes.add('stress');
    }

    if (day.sleep_entry_count > 0) logTypes.add('sleep');
  }

  return Array.from(logTypes);
}

function adjustConfidenceForIngredientSource(
  confidence: number | null,
  exposureCount: number,
  catalogSupportedExposureCount: number
): number | null {
  if (confidence === null || exposureCount === 0) return confidence;

  const supportRatio = catalogSupportedExposureCount / exposureCount;
  let adjusted = confidence;

  if (catalogSupportedExposureCount === 0) {
    adjusted -= 0.12;
  } else if (supportRatio < 0.5) {
    adjusted -= 0.06;
  } else if (supportRatio < 0.8) {
    adjusted -= 0.03;
  }

  return Math.round(Math.max(0, Math.min(1, adjusted)) * 100) / 100;
}

export function analyzeIngredientSignalCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet,
  config: IngredientSignalCandidateConfig
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
  let catalogSupportedExposureCount = 0;
  let catalogSupportedSupportCount = 0;

  const supportDates: string[] = [];
  const exposedDates: string[] = [];
  const baselineDates: string[] = [];

  for (const day of eligibleDays) {
    const exposed = config.exposureDay(day);
    const supported = config.supportDay(day, baselines);
    const hasCatalogSupport = (day.matched_ingredient_ids ?? []).length > 0;

    if (exposed) {
      exposureCount++;
      exposedDates.push(day.date);

      if (hasCatalogSupport) {
        catalogSupportedExposureCount++;
      }

      if (supported) {
        supportCount++;
        supportDates.push(day.date);

        if (hasCatalogSupport) {
          catalogSupportedSupportCount++;
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
  const confidence = adjustConfidenceForIngredientSource(
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
    catalogSupportedExposureCount
  );

  const sourceNote =
    catalogSupportedExposureCount === 0
      ? 'All exposure days relied on fallback tag or free-text ingredient inference rather than matched ingredient catalog rows.'
      : catalogSupportedExposureCount === exposureCount
        ? 'All exposure days included catalog-backed ingredient matches.'
        : `${exposureCount - catalogSupportedExposureCount} of ${exposureCount} exposure days relied on fallback tag or free-text ingredient inference.`;

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
    notes: [...(config.notes ?? []), sourceNote],
    statistics: {
      eligible_day_count: eligibleDays.length,
      non_exposed_count: nonExposedCount,
      non_exposed_support_count: nonExposedSupportCount,
      catalog_supported_exposure_count: catalogSupportedExposureCount,
      catalog_supported_support_count: catalogSupportedSupportCount,
      fallback_only_exposure_count: exposureCount - catalogSupportedExposureCount,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: config.insightKey,
    category: 'food',
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