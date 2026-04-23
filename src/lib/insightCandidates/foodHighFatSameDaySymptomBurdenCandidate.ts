import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate } from '../../types/insightCandidates';
import {
  analyzeIngredientSignalCandidate,
  hasFoodAndSymptomContext,
  hasElevatedSymptomBurden,
} from './ingredientSignalCandidateUtils';

export function analyzeFoodHighFatSameDaySymptomBurdenCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (
    baselines.symptoms.high_burden_threshold === null &&
    baselines.symptoms.median_max_severity === null
  ) {
    return null;
  }

  return analyzeIngredientSignalCandidate(features, baselines, {
    insightKey: 'food_high_fat_same_day_symptom_burden',
    subtype: 'food_high_fat_same_day_symptom_burden',
    triggerFactors: ['high_fat_food_count', 'ingredient_signals', 'matched_ingredient_ids'],
    targetOutcomes: ['symptom_burden_score', 'max_symptom_severity'],
    eligibleDay: (day) => hasFoodAndSymptomContext(day),
    exposureDay: (day) => day.high_fat_food_count >= 1,
    supportDay: (day, baselineSet) => hasElevatedSymptomBurden(day, baselineSet),
    supportingLogTypes: ['food', 'symptom'],
    recommendedMissingLogTypes: ['hydration', 'stress', 'sleep'],
    notes: [
      'Exposure days are days with high-fat ingredient signals from normalized ingredient rows when available, with fallback to legacy tags when needed.',
    ],
  });
}