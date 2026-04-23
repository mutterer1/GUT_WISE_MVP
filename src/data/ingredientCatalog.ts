export type IngredientSignalKey =
  | 'high_fodmap'
  | 'dairy'
  | 'gluten'
  | 'artificial_sweetener'
  | 'high_fat'
  | 'spicy'
  | 'caffeine_food'
  | 'alcohol'
  | 'fiber_dense';

export interface IngredientCatalogEntry {
  id: string;
  label: string;
  matchTerms: string[];
  signals: IngredientSignalKey[];
  commonGutEffects: string[];
}

export const INGREDIENT_CATALOG: IngredientCatalogEntry[] = [
  {
    id: 'onion_garlic',
    label: 'Onion / Garlic',
    matchTerms: ['onion', 'garlic', 'shallot', 'leek'],
    signals: ['high_fodmap'],
    commonGutEffects: ['bloating', 'gas', 'abdominal discomfort'],
  },
  {
    id: 'wheat_gluten',
    label: 'Wheat / Gluten',
    matchTerms: ['wheat', 'gluten', 'bread', 'pasta', 'bagel', 'flour', 'pizza'],
    signals: ['gluten', 'high_fodmap'],
    commonGutEffects: ['bloating', 'cramping'],
  },
  {
    id: 'dairy_lactose',
    label: 'Dairy / Lactose',
    matchTerms: ['milk', 'cheese', 'yogurt', 'ice cream', 'cream', 'lactose'],
    signals: ['dairy', 'high_fodmap'],
    commonGutEffects: ['bloating', 'gas', 'diarrhea'],
  },
  {
    id: 'beans_legumes',
    label: 'Beans / Legumes',
    matchTerms: ['beans', 'lentils', 'chickpea', 'hummus'],
    signals: ['high_fodmap', 'fiber_dense'],
    commonGutEffects: ['gas', 'bloating'],
  },
  {
    id: 'cruciferous',
    label: 'Cruciferous Vegetables',
    matchTerms: ['broccoli', 'cauliflower', 'cabbage', 'brussels sprouts'],
    signals: ['fiber_dense'],
    commonGutEffects: ['gas', 'bloating'],
  },
  {
    id: 'fried_food',
    label: 'Fried / Greasy Foods',
    matchTerms: ['fried', 'burger', 'fries', 'pizza', 'greasy'],
    signals: ['high_fat'],
    commonGutEffects: ['nausea', 'urgency', 'reflux'],
  },
  {
    id: 'spicy_food',
    label: 'Spicy Foods',
    matchTerms: ['spicy', 'hot sauce', 'chili', 'jalapeno', 'curry'],
    signals: ['spicy'],
    commonGutEffects: ['burning', 'urgency', 'abdominal pain'],
  },
  {
    id: 'sweeteners',
    label: 'Artificial Sweeteners',
    matchTerms: ['diet soda', 'sucralose', 'aspartame', 'sorbitol', 'xylitol', 'sweetener'],
    signals: ['artificial_sweetener', 'high_fodmap'],
    commonGutEffects: ['bloating', 'gas', 'diarrhea'],
  },
  {
    id: 'coffee_caffeine_food',
    label: 'Caffeine',
    matchTerms: ['coffee', 'espresso', 'energy drink', 'cola', 'caffeine', 'tea'],
    signals: ['caffeine_food'],
    commonGutEffects: ['urgency', 'reflux', 'stimulation'],
  },
  {
    id: 'alcohol_food',
    label: 'Alcohol',
    matchTerms: ['beer', 'wine', 'cocktail', 'vodka', 'whiskey', 'alcohol'],
    signals: ['alcohol'],
    commonGutEffects: ['diarrhea', 'reflux', 'irritation'],
  },
];
