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
