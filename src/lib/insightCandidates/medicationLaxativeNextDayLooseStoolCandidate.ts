import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate } from '../../types/insightCandidates';
import {
  analyzeMedicationNextDaySignalCandidate,
  hasMedicationData,
  hasGutContext,
  hasMedicationFamily,
  hasLooseStoolPattern,
} from './medicationSignalCandidateUtils';

export function analyzeMedicationLaxativeNextDayLooseStoolCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  return analyzeMedicationNextDaySignalCandidate(features, baselines, {
    insightKey: 'medication_laxative_next_day_loose_stool',
    subtype: 'medication_laxative_next_day_loose_stool',
    triggerFactors: ['matched_medication_ids', 'medication_families', 'medication_gut_effects'],
    targetOutcomes: ['loose_stool_count', 'avg_bristol', 'urgency_event_count'],
    eligiblePair: (exposureDay, nextDay) =>
      hasMedicationData(exposureDay) && hasGutContext(nextDay),
    exposureDay: (day) => hasMedicationFamily(day, 'laxative'),
    supportNextDay: (day) => hasLooseStoolPattern(day) || day.urgency_event_count > 0,
    supportingLogTypes: ['medication', 'gut'],
    recommendedMissingLogTypes: ['hydration', 'food'],
    notes: [
      'Paired-day analysis comparing laxative medication days against the following day.',
      'Exposure days prefer normalized medication reference matches when available and fall back to medication-family heuristics otherwise.',
    ],
  });
}