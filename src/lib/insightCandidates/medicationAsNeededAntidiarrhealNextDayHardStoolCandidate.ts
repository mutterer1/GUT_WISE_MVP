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
import { getNextDayPairings } from './hydrationStoolConsistencyCandidate';
import {
  adjustConfidenceForMedicationCoverage,
  average,
  getMatchingMedicationProfiles,
  hasMedicationData,
  isNextDayHardStoolPattern,
  isOralOrUnknownRoute,
  matchesRegimenStatus,
  profileHasFamily,
} from './medicationSignalCandidateUtils';

const INSIGHT_KEY = 'medication_as_needed_antidiarrheal_next_day_hard_stool';
const MIN_ELIGIBLE_PAIRS = 5;
const MIN_EXPOSURE_DAYS = 3;

function hasBmContext(day: UserDailyFeatures): boolean {
  return (
    day.bm_count > 0 &&
    (day.avg_bristol !== null ||
      day.hard_stool_count > 0 ||
      day.incomplete_evacuation_count > 0)
  );
}

export function analyzeMedicationAsNeededAntidiarrhealNextDayHardStoolCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < 2) return null;
  if (baselines.bowel_movement.median_bristol === null) return null;

  const sorted = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const pairs = getNextDayPairings(sorted);
  const eligiblePairs = pairs.filter(
    (pair) => hasMedicationData(pair.hydrationDay) && hasBmContext(pair.nextDay)
  );

  if (eligiblePairs.length < MIN_ELIGIBLE_PAIRS) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedHardStoolCount = 0;

  const supportDates: string[] = [];
  const exposedDates: string[] = [];
  const baselineDates: string[] = [];
  const exposureCoverageValues: number[] = [];
  const exposureSignalConfidenceValues: number[] = [];
  const exposureStructuredShareValues: number[] = [];
  const exposureProfileCounts: number[] = [];

  for (const pair of eligiblePairs) {
    const exposedProfiles = getMatchingMedicationProfiles(
      pair.hydrationDay,
      (profile) =>
        profileHasFamily(profile, 'antidiarrheal') &&
        matchesRegimenStatus(profile, 'as_needed') &&
        isOralOrUnknownRoute(profile)
    );
    const exposed = exposedProfiles.length > 0;
    const harderNextDay = isNextDayHardStoolPattern(pair.nextDay, baselines);

    if (exposed) {
      exposureCount++;
      exposedDates.push(pair.hydrationDay.date);
      exposureProfileCounts.push(exposedProfiles.length);

      if (
        pair.hydrationDay.structured_medication_coverage_ratio !== null &&
        pair.hydrationDay.structured_medication_coverage_ratio !== undefined
      ) {
        exposureCoverageValues.push(pair.hydrationDay.structured_medication_coverage_ratio);
      }

      if (
        pair.hydrationDay.medication_signal_confidence_avg !== null &&
        pair.hydrationDay.medication_signal_confidence_avg !== undefined
      ) {
        exposureSignalConfidenceValues.push(
          pair.hydrationDay.medication_signal_confidence_avg
        );
      }

      exposureStructuredShareValues.push(
        exposedProfiles.filter((profile) => profile.structured_match).length /
          exposedProfiles.length
      );

      if (harderNextDay) {
        supportCount++;
        supportDates.push(pair.hydrationDay.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      baselineDates.push(pair.hydrationDay.date);

      if (harderNextDay) {
        nonExposedHardStoolCount++;
      }
    }
  }

  if (exposureCount < MIN_EXPOSURE_DAYS) return null;

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedHardStoolCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);
  const supportingLogTypes = ['medication', 'gut'];
  const missingLogTypes = ['food', 'hydration', 'stress'].filter((logType) =>
    !sorted.some((day) => {
      if (logType === 'food') return day.meal_count > 0;
      if (logType === 'hydration') return day.hydration_event_count > 0;
      return day.stress_event_count > 0;
    })
  );

  const sufficiency = computeDataSufficiency(
    eligiblePairs.length,
    exposureCount,
    nonExposedCount
  );
  const analysisEndDate = sorted[sorted.length - 1].date;
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
    eligibleDayCount: eligiblePairs.length,
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
    eligible_day_count: eligiblePairs.length,
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
      'Exposure is limited to as-needed antidiarrheal doses so rescue-medication use is separated from chronic baseline medication days.',
      'This is a next-day bowel-pattern association and should be interpreted as medication-context evidence, not proof of medication causation.',
    ],
    statistics: {
      eligible_pair_count: eligiblePairs.length,
      non_exposed_count: nonExposedCount,
      non_exposed_hard_stool_count: nonExposedHardStoolCount,
      average_exposed_medication_coverage_ratio: averageExposureCoverage,
      average_exposed_medication_signal_confidence: averageSignalConfidence,
      average_exposed_structured_profile_share: averageStructuredShare,
      average_exposed_matching_profile_count: average(exposureProfileCounts),
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'medication',
    subtype: 'medication_as_needed_antidiarrheal_next_day_hard_stool',
    trigger_factors: [
      'medication_families',
      'regimen_status',
      'route',
      'structured_medication_coverage_ratio',
    ],
    target_outcomes: ['hard_stool_count', 'avg_bristol', 'incomplete_evacuation_count'],
    status,
    confidence_score: adjustedConfidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: analysisEndDate,
  };
}