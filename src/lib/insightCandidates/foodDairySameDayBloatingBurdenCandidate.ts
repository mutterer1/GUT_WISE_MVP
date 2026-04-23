import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate } from '../../types/insightCandidates';
import {
  analyzeIngredientSignalCandidate,
  hasFoodAndSymptomContext,
  hasBloatingOrGasSymptoms,
} from './ingredientSignalCandidateUtils';

export function analyzeFoodDairySameDayBloatingBurdenCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  return analyzeIngredientSignalCandidate(features, baselines, {
    insightKey: 'food_dairy_same_day_bloating_burden',
    subtype: 'food_dairy_same_day_bloating_burden',
    triggerFactors: ['dairy_food_count', 'ingredient_signals', 'matched_ingredient_ids'],
    targetOutcomes: ['symptom_types', 'symptom_burden_score'],
    eligibleDay: (day) => hasFoodAndSymptomContext(day),
    exposureDay: (day) => day.dairy_food_count >= 1,
    supportDay: (day) => hasBloatingOrGasSymptoms(day),
    supportingLogTypes: ['food', 'symptom'],
    recommendedMissingLogTypes: ['hydration', 'stress', 'sleep'],
    notes: [
      'Exposure days are days with dairy ingredient signals detected from normalized ingredient rows when available, with fallback to legacy tags when needed.',
    ],
  });
}
