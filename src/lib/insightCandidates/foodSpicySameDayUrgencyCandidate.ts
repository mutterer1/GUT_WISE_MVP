import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate } from '../../types/insightCandidates';
import {
  analyzeIngredientSignalCandidate,
  hasFoodAndGutContext,
  hasUrgencyPattern,
} from './ingredientSignalCandidateUtils';

export function analyzeFoodSpicySameDayUrgencyCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  return analyzeIngredientSignalCandidate(features, baselines, {
    insightKey: 'food_spicy_same_day_urgency',
    subtype: 'food_spicy_same_day_urgency',
    triggerFactors: ['spicy_food_count', 'ingredient_signals', 'matched_ingredient_ids'],
    targetOutcomes: ['urgency_event_count'],
    eligibleDay: (day) => hasFoodAndGutContext(day),
    exposureDay: (day) => day.spicy_food_count >= 1,
    supportDay: (day) => hasUrgencyPattern(day),
    supportingLogTypes: ['food', 'gut'],
    recommendedMissingLogTypes: ['hydration', 'stress'],
    notes: [
      'Exposure days are days with spicy-ingredient signals from normalized ingredient rows when available, with fallback to legacy tags when needed.',
    ],
  });
}