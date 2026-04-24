import type { UserBaselineSet } from '../../types/baselines';
import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { CandidateEvidence, InsightCandidate } from '../../types/insightCandidates';
import {
  buildEvidenceGaps,
  buildUncertaintyStatement,
  computeConfidence,
  computeContradictionRate,
  computeDataSufficiency,
  computeEvidenceQuality,
  computeLift,
  computeRecencyWeight,
  computeStatus,
  safeRate,
} from './sharedCandidateUtils';
import {
  adjustConfidenceForMedicationCoverage,
  average,
  getMatchingMedicationProfiles,
  hasMedicationData,
  isOralOrUnknownRoute,
  isSameDayNauseaSymptom,
  matchesTimingContext,
  profileHasFamily,
  convertDoseToMilligrams,
} from './medicationSignalCandidateUtils';

const INSIGHT_KEY = 'medication_before_meal_iron_same_day_nausea';
const MIN_ELIGIBLE_DAYS = 6;
const MIN_EXPOSURE_DAYS = 3;

function hasSymptomContext(day: UserDailyFeatures): boolean {
  return day.symptom_event_count >= 0;
}

function isExposureDay(day: UserDailyFeatures) {
  return getMatchingMedicationProfiles(
    day,
    (profile) =>
      profileHasFamily(profile, 'iron') &&
      matchesTimingContext(profile, 'before_meal') &&
      isOralOrUnknownRoute(profile)
  );
}

export function analyzeMedicationBeforeMealIronSameDayNauseaCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  const eligibleDays = [...features]
    .filter((day) => hasMedicationData(day) && hasSymptomContext(day))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (eligibleDays.length < MIN_ELIGIBLE_DAYS) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedNauseaCount = 0;

  const supportDates: string[] = [];
  const exposedDates: string[] = [];
  const baselineDates: string[] = [];
  const exposureCoverageValues: number[] = [];
  const exposureSignalConfidenceValues: number[] = [];
  const exposureStructuredShareValues: number[] = [];
  const exposureDoseMgValues: number[] = [];

  for (const day of eligibleDays) {
    const exposedProfiles = isExposureDay(day);
    const exposed = exposedProfiles.length > 0;
    const hasNausea = isSameDayNauseaSymptom(day);

    if (exposed) {
      exposureCount++;
      exposedDates.push(day.date);

      if (
        day.structured_medication_coverage_ratio !== null &&
        day.structured_medication_coverage_ratio !== undefined
      ) {
        exposureCoverageValues.push(day.structured_medication_coverage_ratio);
      }

      if (
        day.medication_signal_confidence_avg !== null &&
        day.medication_signal_confidence_avg !== undefined
      ) {
        exposureSignalConfidenceValues.push(day.medication_signal_confidence_avg);
      }

      exposureStructuredShareValues.push(
        exposedProfiles.filter((profile) => profile.structured_match).length /
          exposedProfiles.length
      );

      for (const profile of exposedProfiles) {
        const doseMg = convertDoseToMilligrams(profile);
        if (doseMg !== null) {
          exposureDoseMgValues.push(doseMg);
        }
      }

      if (hasNausea) {
        supportCount++;
        supportDates.push(day.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      baselineDates.push(day.date);

      if (hasNausea) {
        nonExposedNauseaCount++;
      }
    }
  }

  if (exposureCount < MIN_EXPOSURE_DAYS) return null;

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedNauseaCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);
  const supportingLogTypes = ['medication', 'symptom'];
  const missingLogTypes = ['food', 'hydration'].filter((logType) =>
    !eligibleDays.some((day) => {
      if (logType === 'food') return day.meal_count > 0;
      return day.hydration_event_count > 0;
    })
  );

  const sufficiency = computeDataSufficiency(
    eligibleDays.length,
    exposureCount,
    nonExposedCount
  );
  const analysisEndDate = eligibleDays[eligibleDays.length - 1].date;
  const recencyWeight = computeRecencyWeight(supportDates, analysisEndDate);
  const evidenceQuality = computeEvidenceQuality(
    sufficiency,
    supportCount,
    contradictionCount,
    exposureCount,
    nonExposedCount,
    recencyWeight,
    supportingLogTypes
  );
  const evidenceGaps = buildEvidenceGaps({
    eligibleDayCount: eligibleDays.length,
    exposureCount,
    contrastCount: nonExposedCount,
    supportCount,
    contradictionCount,
    supportingLogTypes,
    endDate: analysisEndDate,
    sampleDates: supportDates,
  });

  const status = computeStatus(
    sufficiency,
    supportCount,
    exposedRate,
    baselineRate,
    contradictionCount,
    exposureCount,
    nonExposedCount,
    evidenceQuality
  );

  const confidence = computeConfidence(
    sufficiency,
    supportCount,
    contradictionCount,
    lift,
    exposureCount,
    nonExposedCount,
    recencyWeight,
    supportingLogTypes
  );

  const averageExposureCoverage = average(exposureCoverageValues);
  const averageSignalConfidence = average(exposureSignalConfidenceValues);
  const averageStructuredShare = average(exposureStructuredShareValues);
  const adjustedConfidence = adjustConfidenceForMedicationCoverage(
    confidence,
    averageExposureCoverage,
    averageSignalConfidence,
    averageStructuredShare
  );

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: exposureCount,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    contrast_count: nonExposedCount,
    eligible_day_count: eligibleDays.length,
    exposed_day_count: exposureCount,
    baseline_day_count: nonExposedCount,
    contradiction_rate: computeContradictionRate(contradictionCount, exposureCount),
    recency_weight: recencyWeight,
    evidence_quality: evidenceQuality,
    supporting_log_types: supportingLogTypes,
    missing_log_types: missingLogTypes,
    exposed_dates: exposedDates.slice(0, 10),
    baseline_dates: baselineDates.slice(0, 10),
    uncertainty_statement: buildUncertaintyStatement(evidenceGaps),
    evidence_gaps: evidenceGaps,
    notes: [
      'Exposure is limited to before-meal oral iron doses so timing-related GI irritation is separated from general iron use.',
      'Before-meal iron may be intentional for absorption. Interpret this alongside food logs and the reason-for-use context, not as a diagnosis.',
    ],
    statistics: {
      eligible_day_count: eligibleDays.length,
      non_exposed_count: nonExposedCount,
      non_exposed_nausea_count: nonExposedNauseaCount,
      average_exposed_medication_coverage_ratio: averageExposureCoverage,
      average_exposed_medication_signal_confidence: averageSignalConfidence,
      average_exposed_structured_profile_share: averageStructuredShare,
      average_exposed_iron_dose_mg: average(exposureDoseMgValues),
      median_symptom_high_burden_threshold: baselines.symptoms.high_burden_threshold,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'medication',
    subtype: 'medication_before_meal_iron_same_day_nausea',
    trigger_factors: [
      'medication_families',
      'timing_context',
      'route',
      'dose_value',
      'dose_unit',
    ],
    target_outcomes: ['symptom_types', 'symptom_burden_score'],
    status,
    confidence_score: adjustedConfidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: eligibleDays[0].date,
    created_from_end_date: analysisEndDate,
  };
}