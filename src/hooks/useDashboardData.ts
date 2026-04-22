import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchDashboardMetrics } from '../services/dashboard/fetchDashboardMetrics';
import { saveEventManager, SaveEvent } from '../services/saveEventManager';
import { DashboardMetrics, DEFAULT_HYDRATION_TARGET_ML } from '../types/dashboard';

export type { DashboardMetrics } from '../types/dashboard';

const EMPTY_METRICS: DashboardMetrics = {
  todayBMCount: 0,
  averageBristolScale: null,
  todaySymptoms: [],
  todayHydration: {
    total_fluids_ml: 0,
    effective_hydration_ml: 0,
    water_goal_ml: 0,
    target_ml: DEFAULT_HYDRATION_TARGET_ML,
    entries: 0,
    caffeinated_entries: 0,
    alcohol_entries: 0,
  },
  recentMedications: [],
  todayFood: { meals: 0, snacks: 0 },
  lastSleep: null,
  todayStress: { average_level: null, count: 0 },
};

export function useDashboardData() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await fetchDashboardMetrics(user.id);

      if (!mountedRef.current) return;

      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);

      if (!mountedRef.current) return;

      setError('Failed to load dashboard data');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setMetrics(EMPTY_METRICS);
      setError(null);
      setLoading(false);
      return;
    }

    refresh();
  }, [user?.id, refresh]);

  useEffect(() => {
    if (!user?.id) return;

    const refreshableLogTypes = new Set<SaveEvent['logType']>([
      'bm',
      'food',
      'symptoms',
      'sleep',
      'stress',
      'hydration',
      'medication',
    ]);

    const unsubscribe = saveEventManager.subscribe((event) => {
      if (refreshableLogTypes.has(event.logType)) {
        refresh();
      }
    });

    return unsubscribe;
  }, [user?.id, refresh]);

  return { metrics, loading, error, refresh };
}
