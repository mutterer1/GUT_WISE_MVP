# Code Review Summary - Meal Tracking Application Updates

## Overview
This document provides a complete code summary of all changes made to the meal tracking application for external review. Copy the entire content and paste into ChatGPT.

---

## PROJECT CONTEXT

**Application:** Health Meal Tracking Application (React + TypeScript + Supabase)
**Purpose:** Track daily meals, food intake, and calorie consumption with automatic calorie estimation

---

## CHANGES MADE

### 1. NAVIGATION FIX - Meal Type Parameter Passing

#### File: `src/pages/Meals.tsx` (Line 64)
**Change:** Added meal type parameter to navigation URL

```typescript
// BEFORE:
<Button variant="outline" size="sm" onClick={() => navigate('/food-log')}>Add</Button>

// AFTER:
<Button variant="outline" size="sm" onClick={() => navigate(`/food-log?meal=${meal.toLowerCase()}`)}>Add</Button>
```

**Purpose:** When users click "Add Breakfast/Lunch/Dinner", the meal type is now passed as a query parameter to pre-select the correct meal type in the form.

#### File: `src/pages/FoodLog.tsx` (Lines 1-2, 48-53)
**Changes:**
1. Import useSearchParams hook
2. Extract and use meal type parameter

```typescript
// Added import:
import { useNavigate, useSearchParams } from 'react-router-dom';

// Added logic:
const [searchParams] = useSearchParams();

const getMealTypeFromParam = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
  const mealParam = searchParams.get('meal');
  if (mealParam === 'breakfast' || mealParam === 'lunch' || mealParam === 'dinner' || mealParam === 'snack') {
    return mealParam;
  }
  return 'lunch';
};

// Updated initial form state to use parameter:
const [formData, setFormData] = useState<FoodLog>({
  logged_at: getLocalDateTimeString(),
  meal_type: getMealTypeFromParam(),
  food_items: [],
  portion_size: 'Medium',
  notes: '',
});
```

---

### 2. MEAL STATISTICS - Dynamic Calorie and Meal Count Display

#### New File: `src/hooks/useMealStatistics.ts`
**Purpose:** Custom hook to fetch real-time meal statistics from database

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface MealStatistics {
  todayMealCount: number;
  totalCalories: number;
}

export function useMealStatistics() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<MealStatistics>({
    todayMealCount: 0,
    totalCalories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchMealStatistics();
    const interval = setInterval(fetchMealStatistics, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchMealStatistics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data, error: queryError } = await supabase
        .from('food_logs')
        .select('meal_type, calories')
        .eq('user_id', user.id)
        .gte('logged_at', todayISO);

      if (queryError) throw queryError;

      const meals = data || [];
      const mealCount = meals.filter((log) =>
        ['breakfast', 'lunch', 'dinner'].includes(log.meal_type)
      ).length;
      const totalCalories = meals.reduce((sum, log) => sum + (log.calories || 0), 0);

      setStatistics({
        todayMealCount: mealCount,
        totalCalories,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching meal statistics:', err);
      setError('Failed to load meal statistics');
    } finally {
      setLoading(false);
    }
  };

  return { statistics, loading, error, refresh: fetchMealStatistics };
}
```

**Key Features:**
- Fetches meal count (breakfast, lunch, dinner only - excludes snacks)
- Calculates total calories from all meals
- Auto-refreshes every 60 seconds
- Error handling with loading states

#### File: `src/pages/Meals.tsx` (Lines 6, 10, 29-40)
**Changes:**
1. Import the new hook
2. Use hook to get statistics
3. Replace placeholder cards with real data
4. Remove fiber card (no fiber tracking in app)

```typescript
// Import:
import { useMealStatistics } from '../hooks/useMealStatistics';

// Use hook:
const { statistics } = useMealStatistics();

// Updated JSX (removed 3-column grid, now 2-column with real data):
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  <Card>
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-1">Today's Meals</p>
      <p className="text-3xl font-bold text-gray-900">{statistics.todayMealCount}</p>
    </div>
  </Card>
  <Card>
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-1">Total Calories</p>
      <p className="text-3xl font-bold text-gray-900">{statistics.totalCalories}</p>
    </div>
  </Card>
</div>
```

---

### 3. CALORIE ESTIMATOR - Automatic Calorie Calculation

#### New File: `src/utils/calorieEstimator.ts`
**Purpose:** Estimate calories for food items based on common food database

**Core Components:**

**A. Food Database (25+ Common Foods)**
```typescript
const commonFoods: Record<string, FoodItem> = {
  apple: { name: 'apple', caloriesPer100g: 52, defaultPortionSize: 182 },
  banana: { name: 'banana', caloriesPer100g: 89, defaultPortionSize: 118 },
  orange: { name: 'orange', caloriesPer100g: 47, defaultPortionSize: 154 },
  // ... 22 more foods including:
  // - Vegetables: carrot, broccoli, spinach, potato, tomato, lettuce
  // - Proteins: chicken, beef, fish, salmon, egg
  // - Grains: bread, rice, pasta, pizza
  // - Dairy: cheese, milk, yogurt
  // - Nuts/Fats: peanuts, almonds, butter, oil, chocolate
};
```

**B. Quantity Extraction**
```typescript
function extractQuantity(input: string): { quantity: number; foodPart: string }

// Examples:
// "1 apple" → { quantity: 1, foodPart: "apple" }
// "2 eggs" → { quantity: 2, foodPart: "eggs" }
// "medium chicken" → { quantity: 1, foodPart: "chicken" }
// "large pizza" → { quantity: 1.5, foodPart: "pizza" }
```

**C. Food Matching**
```typescript
function findFoodMatch(foodInput: string): FoodItem | null

// Handles:
// - Exact matches: "apple" → apple
// - Partial matches: "chicken breast" → chicken
// - Case-insensitive matching
```

**D. Calorie Calculation**
```typescript
export function estimateCalories(input: string): {
  calories: number;
  foodName: string;
  found: boolean;
}

// Formula: (caloriesPer100g × defaultPortionSize ÷ 100) × quantity
// Example: "1 medium apple"
//   - caloriesPer100g: 52
//   - defaultPortionSize: 182g
//   - quantity: 1
//   - Result: (52 × 182 ÷ 100) × 1 = 95 calories
```

**E. Batch Processing**
```typescript
export function estimateCaloriesForMultipleFoods(items: string[]): {
  totalCalories: number;
  itemBreakdown: Array<{ item: string; calories: number; found: boolean }>;
}
```

**Example Use Cases:**
- Input: "1 apple" → 95 calories
- Input: "chicken breast" → 165 calories (100g default)
- Input: "2 eggs" → 140 calories (50g per egg)
- Input: "large pizza" → 428 calories (1.5x slice multiplier)
- Input: "unknown food" → 0 calories + found: false

---

### 4. FOODLOG INTEGRATION - Real-Time Calorie Display

#### File: `src/pages/FoodLog.tsx` Updates

**A. Updated Interface (Line 20)**
```typescript
// BEFORE:
food_items: { name: string; quantity?: string }[];

// AFTER:
food_items: { name: string; quantity?: string; estimated_calories?: number }[];
```

**B. Import Estimator (Line 14)**
```typescript
import { estimateCalories } from '../utils/calorieEstimator';
```

**C. Enhanced addFoodItem Function (Lines 83-98)**
```typescript
const addFoodItem = () => {
  if (foodItemInput.trim()) {
    const estimate = estimateCalories(foodItemInput.trim());
    setFormData({
      ...formData,
      food_items: [
        ...formData.food_items,
        {
          name: foodItemInput.trim(),
          estimated_calories: estimate.calories,
        },
      ],
    });
    setFoodItemInput('');
  }
};
```

**D. Calculate Total Calories on Submit (Lines 114-118)**
```typescript
const totalCalories = formData.food_items.reduce(
  (sum, item) => sum + (item.estimated_calories || 0),
  0
);
```

**E. Save Calories to Database (Lines 128, 147)**
```typescript
// In update request:
calories: totalCalories,

// In insert request:
calories: totalCalories,
```

**F. Enhanced Food Items Display (Lines 313-340)**
```typescript
{formData.food_items.length > 0 && (
  <div className="space-y-2">
    {formData.food_items.map((item, index) => (
      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{item.name}</span>
            {item.estimated_calories !== undefined && (
              <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                {item.estimated_calories} cal
              </span>
            )}
          </div>
        </div>
        <button type="button" onClick={() => removeFoodItem(index)} className="text-sm text-red-600 hover:text-red-700">
          Remove
        </button>
      </div>
    ))}
  </div>
)}
```

**G. Total Calories Summary (Lines 379-390)**
```typescript
{formData.food_items.length > 0 && (
  <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
    <p className="text-sm text-teal-700">
      <span className="font-semibold">Total Estimated Calories:</span>{' '}
      {formData.food_items.reduce(
        (sum, item) => sum + (item.estimated_calories || 0),
        0
      )}{' '}
      cal
    </p>
  </div>
)}
```

---

## WORKFLOW SUMMARY

### User Journey - Meal Entry with Automatic Calorie Estimation

1. **User clicks "Add Breakfast" from Meals tab**
   - Navigates to `/food-log?meal=breakfast`
   - Form pre-selects "Breakfast" meal type

2. **User enters food items**
   - Types "1 apple" and clicks Add
   - Estimator calculates: 95 calories
   - Item displays: "1 apple" with "95 cal" badge

3. **User adds more items**
   - Types "2 eggs" → 140 calories added
   - Types "chicken breast" → 165 calories added
   - Display shows: Total 400 calories

4. **User saves entry**
   - Form calculates total: 400 calories
   - Entry saved to database with calories field

5. **Meals tab updates automatically**
   - Statistics hook queries today's meals
   - "Today's Meals": 1 (breakfast)
   - "Total Calories": 400

---

## TECHNICAL DETAILS

### Database Usage
- **Table:** `food_logs`
- **New Field Used:** `calories` (integer)
- **Query:** Filters by user_id and logged_at date

### Performance
- Statistics refresh: 60-second interval
- Calorie estimation: O(n) where n = number of foods in database (25 foods)
- No network requests for estimation (local calculation)

### Error Handling
- Unrecognized foods: Returns 0 calories, returns `found: false`
- Missing user: Stats show 0 values with graceful fallbacks
- Database errors: Caught and logged to console

---

## TESTING CHECKLIST

- [ ] Click "Add Breakfast" from Meals tab → Form opens with Breakfast pre-selected
- [ ] Click "Add Lunch" from Meals tab → Form opens with Lunch pre-selected
- [ ] Click "Add Dinner" from Meals tab → Form opens with Dinner pre-selected
- [ ] Enter "1 apple" → Shows 95 calories
- [ ] Enter "2 eggs" → Shows 140 calories
- [ ] Enter "chicken breast" → Shows 165 calories
- [ ] Add multiple items → Total updates correctly
- [ ] Save entry → Calories saved to database
- [ ] Go to Meals tab → "Total Calories" card shows correct sum
- [ ] Wait 60 seconds → Statistics update automatically
- [ ] Enter unknown food → Shows 0 calories (graceful fallback)

---

## CODE QUALITY NOTES

**Strengths:**
- Modular design (separate hook and utility)
- Type-safe with TypeScript interfaces
- Error handling and loading states
- No external dependencies for calorie estimation
- Graceful degradation for unrecognized foods
- Real-time UI updates

**Considerations:**
- Food database is hardcoded (could be moved to database for easier updates)
- Calorie values are approximations (acceptable for prototype)
- Quantity extraction uses regex (handles most common formats)
- No manual calorie entry option (users can only use estimates)

---

## FILES CHANGED

1. `src/utils/calorieEstimator.ts` - NEW
2. `src/hooks/useMealStatistics.ts` - NEW
3. `src/pages/Meals.tsx` - MODIFIED
4. `src/pages/FoodLog.tsx` - MODIFIED

---

## COMPATIBILITY

- No breaking changes to existing functionality
- Backward compatible with existing food_logs entries (calories field is optional)
- Works with current Supabase schema
- No new dependencies added

---

## NEXT STEPS (Optional Enhancements)

1. Add manual calorie override for specific entries
2. Move food database to Supabase for easier updates
3. Add food search/autocomplete in input field
4. Implement custom food items per user
5. Add macronutrient estimation (protein, carbs, fats)
6. Create calorie goal settings and progress tracking

---

**End of Code Review Summary**
