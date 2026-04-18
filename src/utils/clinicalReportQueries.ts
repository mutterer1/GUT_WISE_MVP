import { supabase } from '../lib/supabase';
import type {
  DateRange,
  BMAnalytics,
  BristolDistribution,
  SymptomTrend,
  HealthMarkerCorrelation,
  TriggerPattern,
  MedicationCorrelation,
  ClinicalAlert,
} from '../types/domain';

export type {
  DateRange,
  BMAnalytics,
  BristolDistribution,
  SymptomTrend,
  HealthMarkerCorrelation,
  TriggerPattern,
  MedicationCorrelation,
  ClinicalAlert,
};

type LoggedAtRow = {
  logged_at: string;
};

function getDateKey(value: string): string {
  return value.split('T')[0];
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function getInclusiveDayCount(dateRange: DateRange): number {
  const start = new Date(dateRange.startDate);
  const end = new Date(dateRange.endDate);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function groupByDate<T extends LoggedAtRow>(rows: T[]): Record<string, T[]> {
  return rows.reduce(
    (acc, row) => {
      const date = getDateKey(row.logged_at);
      if (!acc[date]) acc[date] = [];
      acc[date].push(row);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

export async function fetchBMAnalytics(
  userId: string,
  dateRange: DateRange
): Promise<BMAnalytics> {
  const { data, error } = await supabase
    .from('bm_logs')
    .select('id, logged_at')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate)
    .order('logged_at');

  if (error) throw error;

  const totalCount = data?.length ?? 0;
  const dayCount = getInclusiveDayCount(dateRange);
  const averagePerDay = totalCount / dayCount;
  const averagePerWeek = averagePerDay * 7;

  const standardError = Math.sqrt(Math.max(averagePerDay, 0)) / Math.sqrt(dayCount);
  const confidenceInterval = {
    lower: Math.max(0, averagePerDay - 1.96 * standardError),
    upper: averagePerDay + 1.96 * standardError,
  };

  return {
    totalCount,
    averagePerDay,
    averagePerWeek,
    confidenceInterval,
  };
}

export async function fetchBristolDistribution(
  userId: string,
  dateRange: DateRange
): Promise<BristolDistribution[]> {
  const { data, error } = await supabase
    .from('bm_logs')
    .select('bristol_type')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate)
    .not('bristol_type', 'is', null);

  if (error) throw error;

  const total = data?.length ?? 0;
  const distribution: Record<number, number> = {};

  for (const log of data ?? []) {
    const type = log.bristol_type ?? 0;
    if (type > 0) {
      distribution[type] = (distribution[type] ?? 0) + 1;
    }
  }

  return Object.entries(distribution)
    .map(([type, count]) => ({
      type: Number(type),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => a.type - b.type);
}

export async function fetchSymptomTrends(
  userId: string,
  dateRange: DateRange
): Promise<SymptomTrend[]> {
  const { data, error } = await supabase
    .from('symptom_logs')
    .select('logged_at, symptom_type, severity')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate)
    .order('logged_at');

  if (error) throw error;

  const trendMap: Record<string, { totalSeverity: number; count: number }> = {};

  for (const log of data ?? []) {
    const dateKey = getDateKey(log.logged_at);
    const key = `${dateKey}__${log.symptom_type}`;

    if (!trendMap[key]) {
      trendMap[key] = { totalSeverity: 0, count: 0 };
    }

    trendMap[key].totalSeverity += log.severity;
    trendMap[key].count += 1;
  }

  return Object.entries(trendMap)
    .map(([key, value]) => {
      const [date, symptomType] = key.split('__');
      return {
        date,
        symptomType,
        avgSeverity: value.totalSeverity / value.count,
        count: value.count,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchHealthMarkerCorrelation(
  userId: string,
  dateRange: DateRange
): Promise<HealthMarkerCorrelation[]> {
  const [sleepResult, stressResult, symptomResult, bmResult] = await Promise.all([
    supabase
      .from('sleep_logs')
      .select('logged_at, quality')
      .eq('user_id', userId)
      .gte('logged_at', dateRange.startDate)
      .lte('logged_at', dateRange.endDate),
    supabase
      .from('stress_logs')
      .select('logged_at, stress_level')
      .eq('user_id', userId)
      .gte('logged_at', dateRange.startDate)
      .lte('logged_at', dateRange.endDate),
    supabase
      .from('symptom_logs')
      .select('logged_at, severity')
      .eq('user_id', userId)
      .gte('logged_at', dateRange.startDate)
      .lte('logged_at', dateRange.endDate),
    supabase
      .from('bm_logs')
      .select('logged_at')
      .eq('user_id', userId)
      .gte('logged_at', dateRange.startDate)
      .lte('logged_at', dateRange.endDate),
  ]);

  if (sleepResult.error) throw sleepResult.error;
  if (stressResult.error) throw stressResult.error;
  if (symptomResult.error) throw symptomResult.error;
  if (bmResult.error) throw bmResult.error;

  const dateMap: Record<string, HealthMarkerCorrelation> = {};

  const ensureDate = (date: string) => {
    if (!dateMap[date]) {
      dateMap[date] = {
        date,
        sleepQuality: null,
        stressLevel: null,
        symptomSeverity: null,
        bmCount: 0,
      };
    }
  };

  for (const log of sleepResult.data ?? []) {
    const date = getDateKey(log.logged_at);
    ensureDate(date);
    dateMap[date].sleepQuality = log.quality;
  }

  for (const log of stressResult.data ?? []) {
    const date = getDateKey(log.logged_at);
    ensureDate(date);
    dateMap[date].stressLevel = log.stress_level;
  }

  const symptomsByDate = groupByDate(symptomResult.data ?? []);
  for (const [date, rows] of Object.entries(symptomsByDate)) {
    ensureDate(date);
    const severities = rows.map((row) => row.severity);
    const avgSeverity = average(severities);
    dateMap[date].symptomSeverity = avgSeverity === null ? null : round(avgSeverity, 1);
  }

  for (const log of bmResult.data ?? []) {
    const date = getDateKey(log.logged_at);
    ensureDate(date);
    dateMap[date].bmCount += 1;
  }

  return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchTriggerPatterns(
  userId: string,
  dateRange: DateRange
): Promise<TriggerPattern[]> {
  const { data: foodData, error: foodError } = await supabase
    .from('food_logs')
    .select('logged_at, food_items, tags')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate);

  if (foodError) throw foodError;

  const { data: symptomData, error: symptomError } = await supabase
    .from('symptom_logs')
    .select('logged_at, severity')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate);

  if (symptomError) throw symptomError;

  const triggerMap: Record<
    string,
    { occurrences: number; totalSeverity: number; severityCount: number }
  > = {};

  for (const foodLog of foodData ?? []) {
    const foodTime = new Date(foodLog.logged_at);
    const tags = Array.isArray(foodLog.tags) ? foodLog.tags.filter(Boolean) : [];
    const triggerLabel = tags.join(', ') || 'mixed items';

    if (!triggerMap[triggerLabel]) {
      triggerMap[triggerLabel] = { occurrences: 0, totalSeverity: 0, severityCount: 0 };
    }

    triggerMap[triggerLabel].occurrences += 1;

    const relatedSymptoms = (symptomData ?? []).filter((symptom) => {
      const symptomTime = new Date(symptom.logged_at);
      const timeDiff = symptomTime.getTime() - foodTime.getTime();
      return timeDiff >= 0 && timeDiff <= 8 * 60 * 60 * 1000;
    });

    for (const symptom of relatedSymptoms) {
      triggerMap[triggerLabel].totalSeverity += symptom.severity;
      triggerMap[triggerLabel].severityCount += 1;
    }
  }

  return Object.entries(triggerMap)
    .map(([trigger, data]) => ({
      trigger,
      category: 'dietary',
      occurrences: data.occurrences,
      avgSymptomSeverity:
        data.severityCount > 0 ? data.totalSeverity / data.severityCount : 0,
      correlationStrength:
        data.occurrences > 0 ? data.severityCount / data.occurrences : 0,
    }))
    .filter((item) => item.correlationStrength > 0.3)
    .sort((a, b) => b.correlationStrength - a.correlationStrength)
    .slice(0, 10);
}

export async function fetchMedicationCorrelation(
  userId: string,
  dateRange: DateRange
): Promise<MedicationCorrelation[]> {
  const { data: medData, error: medError } = await supabase
    .from('medication_logs')
    .select('logged_at, medication_name, dosage')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate)
    .order('logged_at');

  if (medError) throw medError;

  const { data: symptomData, error: symptomError } = await supabase
    .from('symptom_logs')
    .select('logged_at, severity')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate);

  if (symptomError) throw symptomError;

  return (medData ?? []).map((med) => {
    const medTime = new Date(med.logged_at);
    const date = getDateKey(med.logged_at);
    const timeTaken = medTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const symptomsBefore = (symptomData ?? []).filter((symptom) => {
      const symptomTime = new Date(symptom.logged_at);
      const diff = medTime.getTime() - symptomTime.getTime();
      return diff >= 0 && diff <= 2 * 60 * 60 * 1000;
    });

    const symptomsAfter = (symptomData ?? []).filter((symptom) => {
      const symptomTime = new Date(symptom.logged_at);
      const diff = symptomTime.getTime() - medTime.getTime();
      return diff >= 0 && diff <= 4 * 60 * 60 * 1000;
    });

    const avgBefore = average(symptomsBefore.map((symptom) => symptom.severity));
    const avgAfter = average(symptomsAfter.map((symptom) => symptom.severity));

    return {
      date,
      medicationName: med.medication_name,
      dosage: med.dosage,
      timeTaken,
      symptomSeverityBefore: avgBefore === null ? null : round(avgBefore, 1),
      symptomSeverityAfter: avgAfter === null ? null : round(avgAfter, 1),
    };
  });
}

export async function generateClinicalAlerts(
  userId: string,
  dateRange: DateRange
): Promise<ClinicalAlert[]> {
  const alerts: ClinicalAlert[] = [];

  const bmAnalytics = await fetchBMAnalytics(userId, dateRange);
  if (bmAnalytics.averagePerDay > 6) {
    alerts.push({
      type: 'high_frequency',
      severity: 'high',
      message: 'Frequent bowel movements recorded',
      details: `You logged an average of ${bmAnalytics.averagePerDay.toFixed(
        1
      )} bowel movements per day during this period. This may be worth reviewing with your clinician, especially if it feels unusual for you or came with other symptoms.`,
      affectedDates: [dateRange.startDate, dateRange.endDate],
    });
  }

  const { data: bloodData, error: bloodError } = await supabase
    .from('bm_logs')
    .select('logged_at, blood_present')
    .eq('user_id', userId)
    .eq('blood_present', true)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate);

  if (!bloodError && bloodData && bloodData.length > 0) {
    alerts.push({
      type: 'blood_present',
      severity: 'critical',
      message: 'Blood was marked in one or more stool logs',
      details: `Blood was recorded in ${bloodData.length} stool entr${
        bloodData.length === 1 ? 'y' : 'ies'
      }. Consider seeking prompt medical guidance, especially if this is new, repeated, or paired with pain, dizziness, or worsening symptoms.`,
      affectedDates: bloodData.map((log) => getDateKey(log.logged_at)),
    });
  }

  const { data: severeSymptoms, error: symptomError } = await supabase
    .from('symptom_logs')
    .select('logged_at, symptom_type, severity')
    .eq('user_id', userId)
    .gte('severity', 8)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate);

  if (!symptomError && severeSymptoms && severeSymptoms.length > 0) {
    const painEpisodes = severeSymptoms.filter(
      (symptom) => symptom.symptom_type === 'Abdominal Pain'
    );

    if (painEpisodes.length > 0) {
      alerts.push({
        type: 'severe_pain',
        severity: 'high',
        message: 'Severe abdominal pain was logged',
        details: `${painEpisodes.length} episode(s) of severe abdominal pain (severity 8/10 or higher) were logged in this period. This pattern may be worth discussing promptly with your clinician, especially if the pain was new, persistent, or came with other concerning symptoms.`,
        affectedDates: painEpisodes.map((log) => getDateKey(log.logged_at)),
      });
    }
  }

  const bristolDistribution = await fetchBristolDistribution(userId, dateRange);
  const extremeTypes = bristolDistribution.filter((item) => item.type === 1 || item.type === 7);
  const extremePercentage = extremeTypes.reduce((sum, item) => sum + item.percentage, 0);

  if (extremePercentage > 40) {
    alerts.push({
      type: 'concerning_pattern',
      severity: 'medium',
      message: 'A large share of stool logs were at the extreme ends of the Bristol scale',
      details: `${extremePercentage.toFixed(
        1
      )}% of stool logs were Bristol Type 1 or Type 7 in this window. That pattern may be useful to review with your clinician alongside your symptoms and recent routine changes.`,
      affectedDates: [dateRange.startDate, dateRange.endDate],
    });
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}
