export interface FoodSuggestion {
  name: string;
  calories: number;
  portionLabel: string;
}

const foodSuggestions: FoodSuggestion[] = [
  { name: 'apple', calories: 95, portionLabel: 'medium apple' },
  { name: 'banana', calories: 105, portionLabel: 'medium banana' },
  { name: 'orange', calories: 72, portionLabel: 'medium orange' },
  { name: 'carrot', calories: 25, portionLabel: 'medium carrot' },
  { name: 'broccoli', calories: 31, portionLabel: 'cup broccoli' },
  { name: 'spinach', calories: 7, portionLabel: 'cup spinach' },
  { name: 'chicken breast', calories: 165, portionLabel: '100g chicken breast' },
  { name: 'beef', calories: 250, portionLabel: '100g beef' },
  { name: 'fish', calories: 82, portionLabel: '100g fish' },
  { name: 'salmon', calories: 208, portionLabel: '100g salmon' },
  { name: 'egg', calories: 78, portionLabel: 'large egg' },
  { name: 'bread', calories: 85, portionLabel: 'slice of bread' },
  { name: 'rice', calories: 195, portionLabel: 'cup cooked rice' },
  { name: 'pasta', calories: 197, portionLabel: 'cup cooked pasta' },
  { name: 'pizza', calories: 285, portionLabel: 'slice of pizza' },
  { name: 'cheese', calories: 113, portionLabel: '1 oz cheese' },
  { name: 'milk', calories: 146, portionLabel: 'cup milk' },
  { name: 'yogurt', calories: 118, portionLabel: 'cup yogurt' },
  { name: 'peanuts', calories: 159, portionLabel: '1 oz peanuts' },
  { name: 'almonds', calories: 162, portionLabel: '1 oz almonds' },
  { name: 'butter', calories: 100, portionLabel: '1 tablespoon butter' },
  { name: 'oil', calories: 124, portionLabel: '1 tablespoon oil' },
  { name: 'chocolate', calories: 546, portionLabel: '100g chocolate' },
  { name: 'potato', calories: 231, portionLabel: 'medium potato' },
  { name: 'tomato', calories: 22, portionLabel: 'medium tomato' },
  { name: 'lettuce', calories: 7, portionLabel: 'cup lettuce' },
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
