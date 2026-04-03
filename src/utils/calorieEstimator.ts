interface FoodItem {
  name: string;
  caloriesPer100g?: number;
  defaultPortionSize?: number;
  defaultPortionName?: string;
}

const commonFoods: Record<string, FoodItem> = {
  apple: {
    name: 'apple',
    caloriesPer100g: 52,
    defaultPortionSize: 182,
    defaultPortionName: 'medium apple',
  },
  banana: {
    name: 'banana',
    caloriesPer100g: 89,
    defaultPortionSize: 118,
    defaultPortionName: 'medium banana',
  },
  orange: {
    name: 'orange',
    caloriesPer100g: 47,
    defaultPortionSize: 154,
    defaultPortionName: 'medium orange',
  },
  carrot: {
    name: 'carrot',
    caloriesPer100g: 41,
    defaultPortionSize: 61,
    defaultPortionName: 'medium carrot',
  },
  broccoli: {
    name: 'broccoli',
    caloriesPer100g: 34,
    defaultPortionSize: 91,
    defaultPortionName: 'cup broccoli',
  },
  spinach: {
    name: 'spinach',
    caloriesPer100g: 23,
    defaultPortionSize: 30,
    defaultPortionName: 'cup spinach',
  },
  chicken: {
    name: 'chicken breast',
    caloriesPer100g: 165,
    defaultPortionSize: 100,
    defaultPortionName: '100g chicken breast',
  },
  beef: {
    name: 'beef',
    caloriesPer100g: 250,
    defaultPortionSize: 100,
    defaultPortionName: '100g beef',
  },
  fish: {
    name: 'fish',
    caloriesPer100g: 82,
    defaultPortionSize: 100,
    defaultPortionName: '100g fish',
  },
  salmon: {
    name: 'salmon',
    caloriesPer100g: 208,
    defaultPortionSize: 100,
    defaultPortionName: '100g salmon',
  },
  egg: {
    name: 'egg',
    caloriesPer100g: 155,
    defaultPortionSize: 50,
    defaultPortionName: 'large egg',
  },
  bread: {
    name: 'bread',
    caloriesPer100g: 265,
    defaultPortionSize: 32,
    defaultPortionName: 'slice of bread',
  },
  rice: {
    name: 'rice',
    caloriesPer100g: 130,
    defaultPortionSize: 150,
    defaultPortionName: 'cup cooked rice',
  },
  pasta: {
    name: 'pasta',
    caloriesPer100g: 131,
    defaultPortionSize: 150,
    defaultPortionName: 'cup cooked pasta',
  },
  pizza: {
    name: 'pizza',
    caloriesPer100g: 285,
    defaultPortionSize: 100,
    defaultPortionName: 'slice of pizza',
  },
  cheese: {
    name: 'cheese',
    caloriesPer100g: 402,
    defaultPortionSize: 28,
    defaultPortionName: '1 oz cheese',
  },
  milk: {
    name: 'milk',
    caloriesPer100g: 61,
    defaultPortionSize: 240,
    defaultPortionName: 'cup milk',
  },
  yogurt: {
    name: 'yogurt',
    caloriesPer100g: 59,
    defaultPortionSize: 200,
    defaultPortionName: 'cup yogurt',
  },
  peanut: {
    name: 'peanuts',
    caloriesPer100g: 567,
    defaultPortionSize: 28,
    defaultPortionName: '1 oz peanuts',
  },
  almonds: {
    name: 'almonds',
    caloriesPer100g: 579,
    defaultPortionSize: 28,
    defaultPortionName: '1 oz almonds',
  },
  butter: {
    name: 'butter',
    caloriesPer100g: 717,
    defaultPortionSize: 14,
    defaultPortionName: '1 tablespoon butter',
  },
  oil: {
    name: 'oil',
    caloriesPer100g: 884,
    defaultPortionSize: 14,
    defaultPortionName: '1 tablespoon oil',
  },
  chocolate: {
    name: 'chocolate',
    caloriesPer100g: 546,
    defaultPortionSize: 100,
    defaultPortionName: '100g chocolate',
  },
  potato: {
    name: 'potato',
    caloriesPer100g: 77,
    defaultPortionSize: 300,
    defaultPortionName: 'medium potato',
  },
  tomato: {
    name: 'tomato',
    caloriesPer100g: 18,
    defaultPortionSize: 123,
    defaultPortionName: 'medium tomato',
  },
  lettuce: {
    name: 'lettuce',
    caloriesPer100g: 15,
    defaultPortionSize: 47,
    defaultPortionName: 'cup lettuce',
  },
};

const quantityMultipliers: Record<string, number> = {
  small: 0.75,
  medium: 1,
  large: 1.5,
  extra: 2,
  double: 2,
  single: 1,
  half: 0.5,
};

function extractQuantity(input: string): { quantity: number; foodPart: string } {
  const trimmed = input.trim().toLowerCase();

  const numberMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*/);
  if (numberMatch) {
    return {
      quantity: parseFloat(numberMatch[1]),
      foodPart: trimmed.slice(numberMatch[0].length),
    };
  }

  const quantityMatch = trimmed.match(
    /^(small|medium|large|extra|double|single|half)\s+/
  );
  if (quantityMatch) {
    return {
      quantity: quantityMultipliers[quantityMatch[1]],
      foodPart: trimmed.slice(quantityMatch[0].length),
    };
  }

  return {
    quantity: 1,
    foodPart: trimmed,
  };
}

function findFoodMatch(foodInput: string): FoodItem | null {
  const normalized = foodInput.toLowerCase().trim();

  if (commonFoods[normalized]) {
    return commonFoods[normalized];
  }

  for (const [key, food] of Object.entries(commonFoods)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return food;
    }
  }

  return null;
}

export function estimateCalories(input: string): {
  calories: number;
  foodName: string;
  found: boolean;
} {
  if (!input || input.trim().length === 0) {
    return { calories: 0, foodName: '', found: false };
  }

  const { quantity, foodPart } = extractQuantity(input);
  const food = findFoodMatch(foodPart);

  if (!food) {
    return {
      calories: 0,
      foodName: input,
      found: false,
    };
  }

  const portionSize = food.defaultPortionSize || 100;
  const caloriesPer100g = food.caloriesPer100g || 0;
  const portionCalories = (caloriesPer100g * portionSize) / 100;
  const totalCalories = Math.round(portionCalories * quantity);

  return {
    calories: totalCalories,
    foodName: food.name,
    found: true,
  };
}

export function estimateCaloriesForMultipleFoods(items: string[]): {
  totalCalories: number;
  itemBreakdown: Array<{
    item: string;
    calories: number;
    found: boolean;
  }>;
} {
  const breakdown = items.map((item) => {
    const estimate = estimateCalories(item);
    return {
      item: estimate.foodName || item,
      calories: estimate.calories,
      found: estimate.found,
    };
  });

  const totalCalories = breakdown.reduce((sum, item) => sum + item.calories, 0);

  return {
    totalCalories,
    itemBreakdown: breakdown,
  };
}
