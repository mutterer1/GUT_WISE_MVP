import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate } from '../../types/insightCandidates';
import {
  analyzeMedicationSignalCandidate,
  hasMedicationAndGutContext,
  hasMedicationFamily,
  hasConstipationPattern,
} from './medicationSignalCandidateUtils';

export function analyzeMedicationIronSameDayConstipationBurdenCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (
    baselines.bowel_movement.median_bm_count === null &&
    baselines.bowel_movement.median_bristol === null
  ) {
    return null;
  }

  return analyzeMedicationSignalCandidate(features, baselines, {
    insightKey: 'medication_iron_same_day_constipation_burden',
    subtype: 'medication_iron_same_day_constipation_burden',
    triggerFactors: ['matched_medication_ids', 'medication_families', 'medication_gut_effects'],
    targetOutcomes: ['hard_stool_count', 'avg_bristol', 'bm_count'],
    eligibleDay: (day) => hasMedicationAndGutContext(day),
    exposureDay: (day) => hasMedicationFamily(day, 'iron'),
    supportDay: (day, baselineSet) => hasConstipationPattern(day, baselineSet),
    supportingLogTypes: ['medication', 'gut'],
    recommendedMissingLogTypes: ['hydration', 'food'],
    notes: [
      'Exposure days are days with iron-family medication signals, using normalized medication matches when available and family heuristics otherwise.',
    ],
  });
}