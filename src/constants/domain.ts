export const BRISTOL_SCALE = [
  { value: 1, label: 'Type 1', desc: 'Separate hard lumps' },
  { value: 2, label: 'Type 2', desc: 'Lumpy sausage' },
  { value: 3, label: 'Type 3', desc: 'Cracked sausage' },
  { value: 4, label: 'Type 4', desc: 'Smooth snake' },
  { value: 5, label: 'Type 5', desc: 'Soft blobs' },
  { value: 6, label: 'Type 6', desc: 'Fluffy pieces' },
  { value: 7, label: 'Type 7', desc: 'Watery liquid' },
];

export const COMMON_SYMPTOMS = [
  'Abdominal Pain',
  'Bloating',
  'Nausea',
  'Cramping',
  'Gas',
  'Headache',
  'Fatigue',
  'Dizziness',
];

export const COMMON_TRIGGERS = [
  'Food',
  'Stress',
  'Lack of Sleep',
  'Exercise',
  'Weather',
  'Medication',
  'Dehydration',
];

export const COMMON_SIDE_EFFECTS = [
  'Drowsiness',
  'Nausea',
  'Dizziness',
  'Headache',
  'Dry Mouth',
  'Upset Stomach',
  'Fatigue',
  'None',
];

export type HydrationBeverageCategory =
  | 'water'
  | 'electrolyte'
  | 'coffee'
  | 'tea'
  | 'juice'
  | 'soda'
  | 'milk'
  | 'alcohol'
  | 'other';

export interface HydrationBeverageDefinition {
  label: string;
  value: string;
  ml: number;
  category: HydrationBeverageCategory;
  defaultCaffeineMg: number;
  effectiveHydrationRatio: number;
  waterGoalContributionRatio: number;
  electrolytePresent: boolean;
  alcoholPresent: boolean;
}

export const HYDRATION_BEVERAGE_CATEGORIES: HydrationBeverageCategory[] = [
  'water',
  'electrolyte',
  'coffee',
  'tea',
  'juice',
  'soda',
  'milk',
  'alcohol',
  'other',
];

export const BEVERAGE_TYPES: HydrationBeverageDefinition[] = [
  {
    label: 'Water',
    value: 'Water',
    ml: 250,
    category: 'water',
    defaultCaffeineMg: 0,
    effectiveHydrationRatio: 1,
    waterGoalContributionRatio: 1,
    electrolytePresent: false,
    alcoholPresent: false,
  },
  {
    label: 'Coffee',
    value: 'Coffee',
    ml: 240,
    category: 'coffee',
    defaultCaffeineMg: 95,
    effectiveHydrationRatio: 1,
    waterGoalContributionRatio: 0,
    electrolytePresent: false,
    alcoholPresent: false,
  },
  {
    label: 'Tea',
    value: 'Tea',
    ml: 240,
    category: 'tea',
    defaultCaffeineMg: 40,
    effectiveHydrationRatio: 1,
    waterGoalContributionRatio: 0,
    electrolytePresent: false,
    alcoholPresent: false,
  },
  {
    label: 'Juice',
    value: 'Juice',
    ml: 200,
    category: 'juice',
    defaultCaffeineMg: 0,
    effectiveHydrationRatio: 1,
    waterGoalContributionRatio: 0,
    electrolytePresent: false,
    alcoholPresent: false,
  },
  {
    label: 'Soda',
    value: 'Soda',
    ml: 330,
    category: 'soda',
    defaultCaffeineMg: 35,
    effectiveHydrationRatio: 1,
    waterGoalContributionRatio: 0,
    electrolytePresent: false,
    alcoholPresent: false,
  },
  {
    label: 'Sports Drink',
    value: 'Sports Drink',
    ml: 500,
    category: 'electrolyte',
    defaultCaffeineMg: 0,
    effectiveHydrationRatio: 1,
    waterGoalContributionRatio: 0,
    electrolytePresent: true,
    alcoholPresent: false,
  },
  {
    label: 'Milk',
    value: 'Milk',
    ml: 250,
    category: 'milk',
    defaultCaffeineMg: 0,
    effectiveHydrationRatio: 1,
    waterGoalContributionRatio: 0,
    electrolytePresent: false,
    alcoholPresent: false,
  },
  {
    label: 'Alcohol',
    value: 'Alcohol',
    ml: 150,
    category: 'alcohol',
    defaultCaffeineMg: 0,
    effectiveHydrationRatio: 0,
    waterGoalContributionRatio: 0,
    electrolytePresent: false,
    alcoholPresent: true,
  },
  {
    label: 'Other',
    value: 'Other',
    ml: 250,
    category: 'other',
    defaultCaffeineMg: 0,
    effectiveHydrationRatio: 1,
    waterGoalContributionRatio: 0,
    electrolytePresent: false,
    alcoholPresent: false,
  },
];

export const HYDRATION_BEVERAGE_LOOKUP = BEVERAGE_TYPES.reduce<
  Record<string, HydrationBeverageDefinition>
>((acc, beverage) => {
  acc[beverage.value.toLowerCase()] = beverage;
  acc[beverage.label.toLowerCase()] = beverage;
  acc[beverage.category] = beverage;
  return acc;
}, {});

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

export const PORTION_SIZES = ['Small', 'Medium', 'Large', 'Extra Large'];

export const QUICK_HYDRATION_AMOUNTS = [250, 350, 500, 750, 1000];

export const MEDICATION_TYPES = [
  { value: 'prescription', label: 'Prescription' },
  { value: 'otc', label: 'Over-the-Counter' },
  { value: 'supplement', label: 'Supplement' },
];

export const STRESS_TRIGGERS = [
  'Work',
  'Relationships',
  'Finances',
  'Health',
  'Family',
  'Deadlines',
  'Social Events',
  'Traffic',
];

export const STRESS_COPING_METHODS = [
  'Deep Breathing',
  'Exercise',
  'Meditation',
  'Talk to Someone',
  'Music',
  'Walk',
  'Journaling',
  'Rest',
];

export const STRESS_PHYSICAL_SYMPTOMS = [
  'Headache',
  'Tension',
  'Rapid Heartbeat',
  'Fatigue',
  'Stomach Issues',
  'Sweating',
  'Muscle Pain',
  'Sleep Issues',
];
