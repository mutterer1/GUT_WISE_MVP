import {
  BEVERAGE_TYPES,
  HYDRATION_BEVERAGE_LOOKUP,
  type HydrationBeverageCategory,
  type HydrationBeverageDefinition,
} from '../constants/domain';

export interface HydrationClassificationInput {
  beverage_type: string;
  amount_ml: number;
  beverage_category?: HydrationBeverageCategory | null;
  caffeine_content?: boolean | null;
  caffeine_mg?: number | null;
  electrolyte_present?: boolean | null;
  alcohol_present?: boolean | null;
}

export interface HydrationDerivedFields {
  beverage_category: HydrationBeverageCategory;
  caffeine_mg: number;
  effective_hydration_ml: number;
  water_goal_contribution_ml: number;
  electrolyte_present: boolean;
  alcohol_present: boolean;
}

function clampMl(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.max(0, Math.round(value));
}

function getFallbackDefinition(): HydrationBeverageDefinition {
  return (
    HYDRATION_BEVERAGE_LOOKUP.other ??
    BEVERAGE_TYPES.find((beverage) => beverage.category === 'other') ??
    BEVERAGE_TYPES[0]
  );
}

export function getHydrationBeverageDefinition(
  beverageType: string,
  beverageCategory?: HydrationBeverageCategory | null
): HydrationBeverageDefinition {
  if (beverageCategory) {
    const categoryMatch = BEVERAGE_TYPES.find((beverage) => beverage.category === beverageCategory);
    if (categoryMatch) return categoryMatch;
  }

  const normalizedType = beverageType.trim().toLowerCase();
  if (!normalizedType) return getFallbackDefinition();

  return HYDRATION_BEVERAGE_LOOKUP[normalizedType] ?? getFallbackDefinition();
}

export function classifyHydrationEntry(
  input: HydrationClassificationInput
): HydrationDerivedFields {
  const definition = getHydrationBeverageDefinition(input.beverage_type, input.beverage_category);
  const amountMl = clampMl(input.amount_ml);
  const explicitCaffeineMg =
    typeof input.caffeine_mg === 'number' && input.caffeine_mg >= 0
      ? Math.round(input.caffeine_mg)
      : null;

  const caffeineMg =
    explicitCaffeineMg ??
    ((input.caffeine_content ?? definition.defaultCaffeineMg > 0)
      ? definition.defaultCaffeineMg
      : 0);

  const alcoholPresent = input.alcohol_present ?? definition.alcoholPresent;
  const electrolytePresent = input.electrolyte_present ?? definition.electrolytePresent;
  const effectiveHydrationMl = alcoholPresent
    ? 0
    : Math.round(amountMl * definition.effectiveHydrationRatio);
  const waterGoalContributionMl = alcoholPresent
    ? 0
    : Math.round(amountMl * definition.waterGoalContributionRatio);

  return {
    beverage_category: definition.category,
    caffeine_mg: caffeineMg,
    effective_hydration_ml: effectiveHydrationMl,
    water_goal_contribution_ml: waterGoalContributionMl,
    electrolyte_present: electrolytePresent,
    alcohol_present: alcoholPresent,
  };
}

export function hydrateLogWithDerivedFields<T extends HydrationClassificationInput>(
  input: T
): T & HydrationDerivedFields {
  return {
    ...input,
    ...classifyHydrationEntry(input),
  };
}
