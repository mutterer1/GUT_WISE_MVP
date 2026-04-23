import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate } from '../../types/insightCandidates';
import {
  analyzeMedicationSignalCandidate,
  hasMedicationAndSymptomContext,
  hasMedicationGutEffect,
  hasBloatingLikeSymptoms,
  hasRefluxLikeSymptoms,
} from './medicationSignalCandidateUtils';

export function analyzeMedicationAcidSuppressionSameDayBloatingCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  return analyzeMedicationSignalCandidate(features, baselines, {
    insightKey: 'medication_acid_suppression_same_day_bloating',
    subtype: 'medication_acid_suppression_same_day_bloating',
    triggerFactors: ['matched_medication_ids', 'medication_families', 'acid_suppression_medication_count'],
    targetOutcomes: ['symptom_types', 'symptom_burden_score'],
    eligibleDay: (day) => hasMedicationAndSymptomContext(day),
    exposureDay: (day) => hasMedicationGutEffect(day, 'acid_suppression'),
    supportDay: (day) => hasBloatingLikeSymptoms(day) && !hasRefluxLikeSymptoms(day),
    supportingLogTypes: ['medication', 'symptom'],
    recommendedMissingLogTypes: ['food', 'sleep', 'stress'],
    notes: [
      'This rule focuses on bloating-like symptoms on acid-suppression medication days and excludes days where the symptom picture is only reflux-like.',
      'Exposure days prefer normalized medication reference matches when available and fall back to gut-effect heuristics otherwise.',
    ],
  });
}