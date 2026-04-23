import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate } from '../../types/insightCandidates';
import {
  analyzeIngredientSignalCandidate,
  hasFoodAndGutContext,
  hasBowelPatternShift,
} from './ingredientSignalCandidateUtils';

export function analyzeFoodGlutenSameDayBowelPatternShiftCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (
    baselines.bowel_movement.median_bm_count === null &&
    baselines.bowel_movement.median_bristol === null
  ) {
    return null;
  }

  return analyzeIngredientSignalCandidate(features, baselines, {
    insightKey: 'food_gluten_same_day_bowel_pattern_shift',
    subtype: 'food_gluten_same_day_bowel_pattern_shift',
    triggerFactors: ['gluten_food_count', 'ingredient_signals', 'matched_ingredient_ids'],
    targetOutcomes: ['bm_count', 'avg_bristol', 'urgency_event_count'],
    eligibleDay: (day) => hasFoodAndGutContext(day),
    exposureDay: (day) => day.gluten_food_count >= 1,
    supportDay: (day, baselineSet) => hasBowelPatternShift(day, baselineSet),
    supportingLogTypes: ['food', 'gut'],
    recommendedMissingLogTypes: ['hydration', 'stress'],
    notes: [
      'Exposure days are days with gluten ingredient signals from normalized ingredient rows when available, with fallback to legacy tags when needed.',
    ],
  });
}