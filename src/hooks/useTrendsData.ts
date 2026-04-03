import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface TimeRange {
  days: 7 | 14 | 30;
  label: string;
}

interface BMFrequencyData {
  date: string;
  count: number;
}

interface BristolDistribution {
  type: number;
  count: number;
  percentage: number;
}

interface SymptomTrend {
  date: string;
  symptomType: string;
  avgSeverity: number;
}

interface HydrationCorrelation {
  date: string;
  totalHydration: number;
  avgBristolScale: number | null;
}

interface SleepSymptomCorrelation {
  date: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  avgSymptomSeverity: number | null;
}

interface StressUrgencyCorrelation {
  date: string;
  avgStressLevel: number | null;
  avgUrgency: number | null;
  urgencyEpisodes: number;
}

export interface TrendsData {
  bmFrequency: BMFrequencyData[];
  bristolDistribution: BristolDistribution[];
  symptomTrends: SymptomTrend[];
  hydrationCorrelation: HydrationCorrelation[];
  sleepSymptomCorrelation: SleepSymptomCorrelation[];
  stressUrgencyCorrelation: StressUrgencyCorrelation[];
}

export function useTrendsData(timeRange: TimeRange) {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrendsData() {
      setLoading(true);
      setError(null);

      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange.days);
        const startDateStr = startDate.toISOString();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const [bmLogs, symptomLogs, hydrationLogs, sleepLogs, stressLogs] = await Promise.all([
          supabase
            .from('bm_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('logged_at', startDateStr)
            .order('logged_at', { ascending: true }),
          supabase
            .from('symptom_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('logged_at', startDateStr)
            .order('logged_at', { ascending: true }),
          supabase
            .from('hydration_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('logged_at', startDateStr)
            .order('logged_at', { ascending: true }),
          supabase
            .from('sleep_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('sleep_start', startDateStr)
            .order('sleep_start', { ascending: true }),
          supabase
            .from('stress_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('logged_at', startDateStr)
            .order('logged_at', { ascending: true }),
        ]);

        if (bmLogs.error) throw bmLogs.error;
        if (symptomLogs.error) throw symptomLogs.error;
        if (hydrationLogs.error) throw hydrationLogs.error;
        if (sleepLogs.error) throw sleepLogs.error;
        if (stressLogs.error) throw stressLogs.error;

        const bmFrequency = calculateBMFrequency(bmLogs.data || [], timeRange.days);
        const bristolDistribution = calculateBristolDistribution(bmLogs.data || []);
        const symptomTrends = calculateSymptomTrends(symptomLogs.data || [], timeRange.days);
        const hydrationCorrelation = calculateHydrationCorrelation(
          hydrationLogs.data || [],
          bmLogs.data || [],
          timeRange.days
        );
        const sleepSymptomCorrelation = calculateSleepSymptomCorrelation(
          sleepLogs.data || [],
          symptomLogs.data || [],
          timeRange.days
        );
        const stressUrgencyCorrelation = calculateStressUrgencyCorrelation(
          stressLogs.data || [],
          bmLogs.data || [],
          timeRange.days
        );

        setData({
          bmFrequency,
          bristolDistribution,
          symptomTrends,
          hydrationCorrelation,
          sleepSymptomCorrelation,
          stressUrgencyCorrelation,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trends data');
      } finally {
        setLoading(false);
      }
    }

    fetchTrendsData();
  }, [timeRange]);

  return { data, loading, error };
}

function calculateBMFrequency(logs: any[], days: number): BMFrequencyData[] {
  const dateMap = new Map<string, number>();

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateMap.set(date.toISOString().split('T')[0], 0);
  }

  logs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });

  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateBristolDistribution(logs: any[]): BristolDistribution[] {
  const bristolCount = new Map<number, number>();

  logs.forEach(log => {
    const type = log.bristol_type;
    if (type) {
      bristolCount.set(type, (bristolCount.get(type) || 0) + 1);
    }
  });

  const total = logs.length;
  const distribution: BristolDistribution[] = [];

  for (let i = 1; i <= 7; i++) {
    const count = bristolCount.get(i) || 0;
    distribution.push({
      type: i,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    });
  }

  return distribution;
}

function calculateSymptomTrends(logs: any[], days: number): SymptomTrend[] {
  const symptomDateMap = new Map<string, Map<string, number[]>>();

  logs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    if (!symptomDateMap.has(date)) {
      symptomDateMap.set(date, new Map());
    }
    const dateSymptoms = symptomDateMap.get(date)!;
    if (!dateSymptoms.has(log.symptom_type)) {
      dateSymptoms.set(log.symptom_type, []);
    }
    dateSymptoms.get(log.symptom_type)!.push(log.severity);
  });

  const trends: SymptomTrend[] = [];
  symptomDateMap.forEach((symptoms, date) => {
    symptoms.forEach((severities, symptomType) => {
      const avgSeverity = severities.reduce((a, b) => a + b, 0) / severities.length;
      trends.push({ date, symptomType, avgSeverity });
    });
  });

  return trends.sort((a, b) => a.date.localeCompare(b.date));
}

function calculateHydrationCorrelation(
  hydrationLogs: any[],
  bmLogs: any[],
  days: number
): HydrationCorrelation[] {
  const dateMap = new Map<string, { hydration: number; bristolScales: number[] }>();

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateMap.set(date.toISOString().split('T')[0], { hydration: 0, bristolScales: [] });
  }

  hydrationLogs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    const existing = dateMap.get(date);
    if (existing) {
      existing.hydration += log.amount_ml;
    }
  });

  bmLogs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    const existing = dateMap.get(date);
    const bristolScale = log.bristol_type;
    if (existing && bristolScale) {
      existing.bristolScales.push(bristolScale);
    }
  });

  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      totalHydration: data.hydration,
      avgBristolScale: data.bristolScales.length > 0
        ? data.bristolScales.reduce((a, b) => a + b, 0) / data.bristolScales.length
        : null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateSleepSymptomCorrelation(
  sleepLogs: any[],
  symptomLogs: any[],
  days: number
): SleepSymptomCorrelation[] {
  const dateMap = new Map<string, { sleepHours: number | null; sleepQuality: number | null; symptoms: number[] }>();

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateMap.set(date.toISOString().split('T')[0], { sleepHours: null, sleepQuality: null, symptoms: [] });
  }

  sleepLogs.forEach(log => {
    const date = new Date(log.sleep_start).toISOString().split('T')[0];
    const existing = dateMap.get(date);
    if (existing) {
      existing.sleepHours = log.duration_minutes ? log.duration_minutes / 60 : null;
      existing.sleepQuality = log.quality;
    }
  });

  symptomLogs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    const existing = dateMap.get(date);
    if (existing) {
      existing.symptoms.push(log.severity);
    }
  });

  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      sleepHours: data.sleepHours,
      sleepQuality: data.sleepQuality,
      avgSymptomSeverity: data.symptoms.length > 0
        ? data.symptoms.reduce((a, b) => a + b, 0) / data.symptoms.length
        : null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateStressUrgencyCorrelation(
  stressLogs: any[],
  bmLogs: any[],
  days: number
): StressUrgencyCorrelation[] {
  const dateMap = new Map<string, { stressLevels: number[]; urgencyLevels: number[]; urgencyCount: number }>();

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateMap.set(date.toISOString().split('T')[0], { stressLevels: [], urgencyLevels: [], urgencyCount: 0 });
  }

  stressLogs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    const existing = dateMap.get(date);
    if (existing) {
      existing.stressLevels.push(log.stress_level);
    }
  });

  bmLogs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    const existing = dateMap.get(date);
    const urgency = log.urgency;
    if (existing && urgency) {
      existing.urgencyLevels.push(urgency);
      if (urgency >= 4) {
        existing.urgencyCount++;
      }
    }
  });

  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      avgStressLevel: data.stressLevels.length > 0
        ? data.stressLevels.reduce((a, b) => a + b, 0) / data.stressLevels.length
        : null,
      avgUrgency: data.urgencyLevels.length > 0
        ? data.urgencyLevels.reduce((a, b) => a + b, 0) / data.urgencyLevels.length
        : null,
      urgencyEpisodes: data.urgencyCount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
