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
  convertDoseToMilligrams,
  getMatchingMedicationProfiles,
  hasMedicationData,
  isOralOrUnknownRoute,
  isSameDayLooseStoolPattern,
  profileHasFamily,
} from './medicationSignalCandidateUtils';

const INSIGHT_KEY = 'medication_oral_magnesium_same_day_loose_stool';
const MIN_ELIGIBLE_DAYS = 6;
const MIN_EXPOSURE_DAYS = 3;
const MIN_MAGNESIUM_DOSE_MG = 150;

function hasBmContext(day: UserDailyFeatures): boolean {
  return day.bm_count > 0 || day.avg_bristol !== null || day.urgency_event_count > 0;
}

function getExposureProfiles(day: UserDailyFeatures) {
  return getMatchingMedicationProfiles(
    day,
    (profile) =>
      profileHasFamily(profile, 'magnesium') &&
      isOralOrUnknownRoute(profile) &&
      (() => {
        const doseMg = convertDoseToMilligrams(profile);
        return doseMg !== null && doseMg >= MIN_MAGNESIUM_DOSE_MG;
      })()
  );
}

export function analyzeMedicationOralMagnesiumSameDayLooseStoolCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  const eligibleDays = [...features]
    .filter((day) => hasMedicationData(day) && hasBmContext(day))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (eligibleDays.length < MIN_ELIGIBLE_DAYS) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedLooseStoolCount = 0;

  const supportDates: string[] = [];
  const exposedDates: string[] = [];
  const baselineDates: string[] = [];
  const exposureCoverageValues: number[] = [];
  const exposureSignalConfidenceValues: number[] = [];
  const exposureStructuredShareValues: number[] = [];
  const exposureDoseMgValues: number[] = [];

  for (const day of eligibleDays) {
    const exposedProfiles = getExposureProfiles(day);
    const exposed = exposedProfiles.length > 0;
    const looseStoolPattern = isSameDayLooseStoolPattern(day);

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

      if (looseStoolPattern) {
        supportCount++;
        supportDates.push(day.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      baselineDates.push(day.date);

      if (looseStoolPattern) {
        nonExposedLooseStoolCount++;
      }
    }
  }

  if (exposureCount < MIN_EXPOSURE_DAYS) return null;

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedLooseStoolCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);
  const supportingLogTypes = ['medication', 'gut'];
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
      'Exposure is restricted to quantified oral magnesium doses of at least 150 mg-equivalent so this rule stays dose-aware rather than treating any magnesium mention as equal.',
      'Magnesium formulation still matters. Interpret this alongside formulation notes and hydration context rather than as a diagnosis.',
    ],
    statistics: {
      eligible_day_count: eligibleDays.length,
      non_exposed_count: nonExposedCount,
      non_exposed_loose_stool_count: nonExposedLooseStoolCount,
      average_exposed_medication_coverage_ratio: averageExposureCoverage,
      average_exposed_medication_signal_confidence: averageSignalConfidence,
      average_exposed_structured_profile_share: averageStructuredShare,
      average_exposed_magnesium_dose_mg: average(exposureDoseMgValues),
      minimum_exposure_dose_mg: MIN_MAGNESIUM_DOSE_MG,
      bowel_movement_median_bristol: baselines.bowel_movement.median_bristol,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'medication',
    subtype: 'medication_oral_magnesium_same_day_loose_stool',
    trigger_factors: [
      'medication_families',
      'route',
      'dose_value',
      'dose_unit',
      'structured_medication_coverage_ratio',
    ],
    target_outcomes: ['loose_stool_count', 'urgency_event_count', 'avg_bristol'],
    status,
    confidence_score: adjustedConfidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: eligibleDays[0].date,
    created_from_end_date: analysisEndDate,
  };
}