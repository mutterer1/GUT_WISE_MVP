import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate } from '../../types/insightCandidates';
import {
  analyzeMedicationSignalCandidate,
  hasMedicationAndSymptomContext,
  hasMedicationFamily,
  hasElevatedSymptomBurden,
} from './medicationSignalCandidateUtils';

export function analyzeMedicationAntibioticSameDaySymptomShiftCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (
    baselines.symptoms.high_burden_threshold === null &&
    baselines.symptoms.median_max_severity === null
  ) {
    return null;
  }

  return analyzeMedicationSignalCandidate(features, baselines, {
    insightKey: 'medication_antibiotic_same_day_symptom_shift',
    subtype: 'medication_antibiotic_same_day_symptom_shift',
    triggerFactors: ['matched_medication_ids', 'medication_families', 'microbiome_disruption_medication_count'],
    targetOutcomes: ['symptom_burden_score', 'max_symptom_severity'],
    eligibleDay: (day) => hasMedicationAndSymptomContext(day),
    exposureDay: (day) => hasMedicationFamily(day, 'antibiotic'),
    supportDay: (day, baselineSet) => hasElevatedSymptomBurden(day, baselineSet),
    supportingLogTypes: ['medication', 'symptom'],
    recommendedMissingLogTypes: ['food', 'hydration', 'sleep'],
    notes: [
      'Exposure days are days with antibiotic-family medication signals, using normalized medication matches when available and family heuristics otherwise.',
    ],
  });
}