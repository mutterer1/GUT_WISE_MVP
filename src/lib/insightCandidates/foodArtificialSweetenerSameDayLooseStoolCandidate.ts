import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate } from '../../types/insightCandidates';
import {
  analyzeIngredientSignalCandidate,
  hasFoodAndGutContext,
  hasLooseStoolPattern,
} from './ingredientSignalCandidateUtils';

export function analyzeFoodArtificialSweetenerSameDayLooseStoolCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  return analyzeIngredientSignalCandidate(features, baselines, {
    insightKey: 'food_artificial_sweetener_same_day_loose_stool',
    subtype: 'food_artificial_sweetener_same_day_loose_stool',
    triggerFactors: [
      'artificial_sweetener_food_count',
      'ingredient_signals',
      'matched_ingredient_ids',
    ],
    targetOutcomes: ['loose_stool_count', 'avg_bristol'],
    eligibleDay: (day) => hasFoodAndGutContext(day),
    exposureDay: (day) => day.artificial_sweetener_food_count >= 1,
    supportDay: (day) => hasLooseStoolPattern(day),
    supportingLogTypes: ['food', 'gut'],
    recommendedMissingLogTypes: ['hydration', 'stress'],
    notes: [
      'Exposure days are days with artificial-sweetener ingredient signals from normalized ingredient rows when available, with fallback to legacy tags when needed.',
    ],
  });
}