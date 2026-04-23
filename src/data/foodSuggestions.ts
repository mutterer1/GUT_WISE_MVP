export interface FoodSuggestion {
  name: string;
  calories: number;
  portionLabel: string;
}

const foodSuggestions: FoodSuggestion[] = [
  { name: 'apple', calories: 95, portionLabel: 'medium apple' },
  { name: 'banana', calories: 105, portionLabel: 'medium banana' },
  { name: 'blueberries', calories: 85, portionLabel: '1 cup blueberries' },
  { name: 'avocado toast', calories: 260, portionLabel: '1 slice toast with avocado' },
  { name: 'oatmeal', calories: 150, portionLabel: '1 cup cooked oatmeal' },
  { name: 'white rice', calories: 205, portionLabel: '1 cup cooked rice' },
  { name: 'scrambled eggs', calories: 180, portionLabel: '2 large eggs' },
  { name: 'grilled chicken', calories: 165, portionLabel: '100g chicken breast' },
  { name: 'salmon and rice', calories: 360, portionLabel: '1 plate' },
  { name: 'turkey sandwich', calories: 320, portionLabel: '1 sandwich' },
  { name: 'greek yogurt', calories: 130, portionLabel: '1 cup yogurt' },
  { name: 'cheddar cheese', calories: 113, portionLabel: '1 oz cheese' },
  { name: 'whole milk latte', calories: 190, portionLabel: '12 oz latte' },
  { name: 'pizza', calories: 285, portionLabel: '1 slice pizza' },
  { name: 'mac and cheese', calories: 350, portionLabel: '1 cup macaroni and cheese' },
  { name: 'cheeseburger', calories: 535, portionLabel: '1 burger' },
  { name: 'french fries', calories: 365, portionLabel: 'medium fries' },
  { name: 'pasta with tomato sauce', calories: 320, portionLabel: '1 bowl pasta' },
  { name: 'black bean burrito', calories: 420, portionLabel: '1 burrito' },
  { name: 'hummus and pita', calories: 280, portionLabel: '1 snack plate' },
  { name: 'broccoli side', calories: 55, portionLabel: '1 cup broccoli' },
  { name: 'cauliflower bowl', calories: 180, portionLabel: '1 bowl cauliflower rice mix' },
  { name: 'salad with onion', calories: 140, portionLabel: '1 entree salad' },
  { name: 'ice cream', calories: 260, portionLabel: '1 cup ice cream' },
  { name: 'diet soda', calories: 5, portionLabel: '12 oz can' },
  { name: 'cold brew coffee', calories: 5, portionLabel: '12 oz coffee' },
  { name: 'protein bar', calories: 210, portionLabel: '1 bar' },
  { name: 'ipa beer', calories: 190, portionLabel: '12 oz beer' },
  { name: 'red wine', calories: 125, portionLabel: '5 oz glass' },
  { name: 'spicy curry', calories: 420, portionLabel: '1 bowl curry' },
  { name: 'chili bowl', calories: 310, portionLabel: '1 bowl chili' },
  { name: 'chocolate bar', calories: 230, portionLabel: '1 bar' },
  { name: 'bagel with cream cheese', calories: 330, portionLabel: '1 bagel' },
  { name: 'broccoli cheddar soup', calories: 240, portionLabel: '1 bowl soup' },
  { name: 'fried chicken sandwich', calories: 540, portionLabel: '1 sandwich' },
  { name: 'taco bowl', calories: 430, portionLabel: '1 bowl' },
  { name: 'overnight oats', calories: 280, portionLabel: '1 jar' },
  { name: 'smoothie', calories: 250, portionLabel: '16 oz smoothie' },
  { name: 'sushi roll', calories: 300, portionLabel: '1 roll' },
  { name: 'baked potato', calories: 160, portionLabel: '1 medium potato' },
];

export function searchFoodSuggestions(query: string): FoodSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const starts: FoodSuggestion[] = [];
  const contains: FoodSuggestion[] = [];

  for (const item of foodSuggestions) {
    if (item.name.startsWith(q)) {
      starts.push(item);
    } else if (item.name.includes(q)) {
      contains.push(item);
    }
  }

  return [...starts, ...contains].slice(0, 7);
}
