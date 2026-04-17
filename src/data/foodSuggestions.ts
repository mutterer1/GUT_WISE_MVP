export interface FoodSuggestion {
  name: string;
  calories: number;
  portionLabel: string;
}

export const FOOD_SUGGESTIONS: FoodSuggestion[] = [
  { name: 'Eggs', calories: 155, portionLabel: '2 large eggs' },
  { name: 'Scrambled eggs', calories: 200, portionLabel: '2 eggs with butter' },
  { name: 'Oatmeal', calories: 150, portionLabel: '1 cup cooked' },
  { name: 'Yogurt', calories: 120, portionLabel: '1 cup plain' },
  { name: 'Greek yogurt', calories: 100, portionLabel: '1 cup 0% fat' },
  { name: 'Banana', calories: 105, portionLabel: '1 medium' },
  { name: 'Apple', calories: 95, portionLabel: '1 medium' },
  { name: 'Berries', calories: 50, portionLabel: '1/2 cup mixed' },
  { name: 'Smoothie', calories: 250, portionLabel: '12 oz blended' },
  { name: 'Protein shake', calories: 200, portionLabel: '1 scoop in water/milk' },
  { name: 'Protein bar', calories: 220, portionLabel: '1 bar ~60g' },
  { name: 'Coffee', calories: 5, portionLabel: '1 cup black' },
  { name: 'Coffee with milk', calories: 50, portionLabel: '1 cup with milk' },
  { name: 'Tea', calories: 2, portionLabel: '1 cup black' },
  { name: 'Orange juice', calories: 110, portionLabel: '1 cup (8 oz)' },
  { name: 'Milk', calories: 150, portionLabel: '1 cup whole' },
  { name: 'Almond milk', calories: 40, portionLabel: '1 cup unsweetened' },
  { name: 'Toast', calories: 85, portionLabel: '1 slice' },
  { name: 'Bread', calories: 170, portionLabel: '2 slices' },
  { name: 'Avocado toast', calories: 280, portionLabel: '2 slices with avocado' },
  { name: 'Bagel', calories: 270, portionLabel: '1 plain bagel' },
  { name: 'Granola', calories: 200, portionLabel: '1/2 cup' },
  { name: 'Cereal', calories: 150, portionLabel: '1 cup with milk' },
  { name: 'Pancakes', calories: 350, portionLabel: '3 medium pancakes' },
  { name: 'Chicken', calories: 165, portionLabel: '100g breast' },
  { name: 'Chicken breast', calories: 165, portionLabel: '100g grilled' },
  { name: 'Grilled chicken', calories: 165, portionLabel: '100g' },
  { name: 'Salmon', calories: 208, portionLabel: '100g fillet' },
  { name: 'Tuna', calories: 130, portionLabel: '100g canned in water' },
  { name: 'Beef', calories: 250, portionLabel: '100g cooked' },
  { name: 'Turkey', calories: 135, portionLabel: '100g sliced' },
  { name: 'Rice', calories: 195, portionLabel: '1 cup cooked' },
  { name: 'Brown rice', calories: 215, portionLabel: '1 cup cooked' },
  { name: 'Pasta', calories: 220, portionLabel: '1 cup cooked' },
  { name: 'Quinoa', calories: 220, portionLabel: '1 cup cooked' },
  { name: 'Potato', calories: 160, portionLabel: '1 medium baked' },
  { name: 'Sweet potato', calories: 130, portionLabel: '1 medium baked' },
  { name: 'Salad', calories: 80, portionLabel: 'large green salad' },
  { name: 'Caesar salad', calories: 180, portionLabel: '2 cups with dressing' },
  { name: 'Soup', calories: 150, portionLabel: '1 cup' },
  { name: 'Sandwich', calories: 350, portionLabel: '1 deli sandwich' },
  { name: 'Wrap', calories: 300, portionLabel: '1 medium wrap' },
  { name: 'Burger', calories: 500, portionLabel: '1 beef patty with bun' },
  { name: 'Pizza', calories: 285, portionLabel: '1 slice' },
  { name: 'Cheese', calories: 115, portionLabel: '1 oz slice' },
  { name: 'Cottage cheese', calories: 110, portionLabel: '1/2 cup' },
  { name: 'Beans', calories: 220, portionLabel: '1 cup cooked' },
  { name: 'Black beans', calories: 225, portionLabel: '1 cup cooked' },
  { name: 'Lentils', calories: 230, portionLabel: '1 cup cooked' },
  { name: 'Hummus', calories: 130, portionLabel: '4 tbsp' },
  { name: 'Tofu', calories: 80, portionLabel: '100g firm' },
  { name: 'Broccoli', calories: 55, portionLabel: '1 cup steamed' },
  { name: 'Spinach', calories: 7, portionLabel: '1 cup raw' },
  { name: 'Carrots', calories: 50, portionLabel: '1 cup' },
  { name: 'Cucumber', calories: 16, portionLabel: '1 cup sliced' },
  { name: 'Tomato', calories: 22, portionLabel: '1 medium' },
  { name: 'Almonds', calories: 165, portionLabel: '1 oz / ~23 nuts' },
  { name: 'Peanut butter', calories: 190, portionLabel: '2 tbsp' },
  { name: 'Almond butter', calories: 200, portionLabel: '2 tbsp' },
  { name: 'Mixed nuts', calories: 170, portionLabel: '1 oz' },
  { name: 'Dark chocolate', calories: 170, portionLabel: '1 oz / 28g' },
  { name: 'Ice cream', calories: 270, portionLabel: '1 cup' },
];

export function searchFoodSuggestions(query: string): FoodSuggestion[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return FOOD_SUGGESTIONS.filter((f) =>
    f.name.toLowerCase().includes(q)
  ).slice(0, 6);
}
