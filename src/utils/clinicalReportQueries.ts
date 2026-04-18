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

export type { DateRange, BMAnalytics, BristolDistribution, SymptomTrend, HealthMarkerCorrelation, TriggerPattern, MedicationCorrelation, ClinicalAlert };

export async function fetchBMAnalytics(userId: string, dateRange: DateRange): Promise<BMAnalytics> {
  const { data, error } = await supabase
    .from('bm_logs')
    .select('id, logged_at')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate)
    .order('logged_at');

  if (error) throw error;

  const totalCount = data?.length || 0;
  const daysDiff = Math.max(1, Math.ceil(
    (new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1);

  const averagePerDay = totalCount / daysDiff;
  const averagePerWeek = averagePerDay * 7;

  const standardError = Math.sqrt(averagePerDay) / Math.sqrt(daysDiff);
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

export async function fetchBristolDistribution(userId: string, dateRange: DateRange): Promise<BristolDistribution[]> {
  const { data, error } = await supabase
    .from('bm_logs')
    .select('bristol_type')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate)
    .not('bristol_type', 'is', null);

  if (error) throw error;

  const total = data?.length || 0;
  const distribution: { [key: number]: number } = {};

  data?.forEach(log => {
    const type = log.bristol_type || 0;
    if (type > 0) {
      distribution[type] = (distribution[type] || 0) + 1;
    }
  });

  return Object.entries(distribution).map(([type, count]) => ({
    type: parseInt(type),
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  })).sort((a, b) => a.type - b.type);
}

export async function fetchSymptomTrends(userId: string, dateRange: DateRange): Promise<SymptomTrend[]> {
  const { data, error } = await supabase
    .from('symptom_logs')
    .select('logged_at, symptom_type, severity')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate)
    .order('logged_at');

  if (error) throw error;

  const trendMap: { [key: string]: { totalSeverity: number; count: number } } = {};

  data?.forEach(log => {
    const dateKey = log.logged_at.split('T')[0];
    const key = `${dateKey}-${log.symptom_type}`;

    if (!trendMap[key]) {
      trendMap[key] = { totalSeverity: 0, count: 0 };
    }
    trendMap[key].totalSeverity += log.severity;
    trendMap[key].count += 1;
  });

  return Object.entries(trendMap).map(([key, value]) => {
    const [date, symptomType] = key.split('-', 2);
    return {
      date,
      symptomType,
      avgSeverity: value.totalSeverity / value.count,
      count: value.count,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchHealthMarkerCorrelation(userId: string, dateRange: DateRange): Promise<HealthMarkerCorrelation[]> {
  const [sleepData, stressData, symptomData, bmData] = await Promise.all([
    supabase.from('sleep_logs').select('logged_at, quality').eq('user_id', userId)
      .gte('logged_at', dateRange.startDate).lte('logged_at', dateRange.endDate),
    supabase.from('stress_logs').select('logged_at, stress_level').eq('user_id', userId)
      .gte('logged_at', dateRange.startDate).lte('logged_at', dateRange.endDate),
    supabase.from('symptom_logs').select('logged_at, severity').eq('user_id', userId)
      .gte('logged_at', dateRange.startDate).lte('logged_at', dateRange.endDate),
    supabase.from('bm_logs').select('logged_at').eq('user_id', userId)
      .gte('logged_at', dateRange.startDate).lte('logged_at', dateRange.endDate),
  ]);

  const dateMap: { [date: string]: HealthMarkerCorrelation } = {};

  const initDate = (date: string) => {
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

  sleepData.data?.forEach(log => {
    const date = log.logged_at.split('T')[0];
    initDate(date);
    dateMap[date].sleepQuality = log.quality;
  });

  stressData.data?.forEach(log => {
    const date = log.logged_at.split('T')[0];
    initDate(date);
    dateMap[date].stressLevel = log.stress_level;
  });

  symptomData.data?.forEach(log => {
    const date = log.logged_at.split('T')[0];
    initDate(date);
    if (dateMap[date].symptomSeverity === null) {
      dateMap[date].symptomSeverity = log.severity;
    } else {
      dateMap[date].symptomSeverity = Math.max(dateMap[date].symptomSeverity!, log.severity);
    }
  });

  bmData.data?.forEach(log => {
    const date = log.logged_at.split('T')[0];
    initDate(date);
    dateMap[date].bmCount += 1;
  });

  return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchTriggerPatterns(userId: string, dateRange: DateRange): Promise<TriggerPattern[]> {
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

  const triggerMap: { [food: string]: { occurrences: number; totalSeverity: number; severityCount: number } } = {};

  foodData?.forEach(foodLog => {
    const foodDate = new Date(foodLog.logged_at);
    const tags = foodLog.tags || [];
    const tagString = tags.join(', ') || 'mixed items';

    if (!triggerMap[tagString]) {
      triggerMap[tagString] = { occurrences: 0, totalSeverity: 0, severityCount: 0 };
    }
    triggerMap[tagString].occurrences += 1;

    const relatedSymptoms = symptomData?.filter(symptom => {
      const symptomDate = new Date(symptom.logged_at);
      const timeDiff = symptomDate.getTime() - foodDate.getTime();
      return timeDiff >= 0 && timeDiff <= 8 * 60 * 60 * 1000;
    });

    relatedSymptoms?.forEach(symptom => {
      triggerMap[tagString].totalSeverity += symptom.severity;
      triggerMap[tagString].severityCount += 1;
    });
  });

  return Object.entries(triggerMap)
    .map(([food, data]) => ({
      trigger: food,
      category: 'dietary',
      occurrences: data.occurrences,
      avgSymptomSeverity: data.severityCount > 0 ? data.totalSeverity / data.severityCount : 0,
      correlationStrength: data.severityCount / data.occurrences,
    }))
    .filter(trigger => trigger.correlationStrength > 0.3)
    .sort((a, b) => b.correlationStrength - a.correlationStrength)
    .slice(0, 10);
}

export async function fetchMedicationCorrelation(userId: string, dateRange: DateRange): Promise<MedicationCorrelation[]> {
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

  return medData?.map(med => {
    const medTime = new Date(med.logged_at);
    const date = med.logged_at.split('T')[0];
    const timeTaken = medTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const symptomsBefore = symptomData?.filter(s => {
      const sTime = new Date(s.logged_at);
      const diff = medTime.getTime() - sTime.getTime();
      return diff >= 0 && diff <= 2 * 60 * 60 * 1000;
    });

    const symptomsAfter = symptomData?.filter(s => {
      const sTime = new Date(s.logged_at);
      const diff = sTime.getTime() - medTime.getTime();
      return diff >= 0 && diff <= 4 * 60 * 60 * 1000;
    });

    const avgBefore = symptomsBefore && symptomsBefore.length > 0
      ? symptomsBefore.reduce((sum, s) => sum + s.severity, 0) / symptomsBefore.length
      : null;

    const avgAfter = symptomsAfter && symptomsAfter.length > 0
      ? symptomsAfter.reduce((sum, s) => sum + s.severity, 0) / symptomsAfter.length
      : null;

    return {
      date,
      medicationName: med.medication_name,
      dosage: med.dosage,
      timeTaken,
      symptomSeverityBefore: avgBefore,
      symptomSeverityAfter: avgAfter,
    };
  }) || [];
}

export async function generateClinicalAlerts(userId: string, dateRange: DateRange): Promise<ClinicalAlert[]> {
  const alerts: ClinicalAlert[] = [];

  const bmAnalytics = await fetchBMAnalytics(userId, dateRange);
  if (bmAnalytics.averagePerDay > 6) {
    alerts.push({
      type: 'high_frequency',
      severity: 'high',
      message: 'Frequent bowel movements recorded',
      details: `An average of ${bmAnalytics.averagePerDay.toFixed(1)} bowel movements per day was recorded during this period. This pattern may be worth discussing with your clinician.`,
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
      details: `Blood was logged in ${bloodData.length} stool entry(s) during this period. Please discuss this with your clinician at your earliest opportunity.`,
      affectedDates: bloodData.map(log => log.logged_at.split('T')[0]),
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
    const painEpisodes = severeSymptoms.filter(s => s.symptom_type === 'Abdominal Pain');
    if (painEpisodes.length > 0) {
      alerts.push({
        type: 'severe_pain',
        severity: 'high',
        message: 'Severe abdominal pain was logged',
        details: `${painEpisodes.length} episode(s) of abdominal pain rated 8/10 or above were logged during this period. Consider discussing these episodes with your clinician.`,
        affectedDates: painEpisodes.map(log => log.logged_at.split('T')[0]),
      });
    }
  }

  const bristolDistribution = await fetchBristolDistribution(userId, dateRange);
  const extremeTypes = bristolDistribution.filter(d => d.type === 1 || d.type === 7);
  const extremePercentage = extremeTypes.reduce((sum, d) => sum + d.percentage, 0);

  if (extremePercentage > 40) {
    alerts.push({
      type: 'concerning_pattern',
      severity: 'medium',
      message: 'A large share of stool logs were at the extreme ends of the Bristol scale',
      details: `${extremePercentage.toFixed(1)}% of logged stools were recorded as Bristol Type 1 or Type 7 during this period. This pattern may be useful to share with your clinician.`,
      affectedDates: [dateRange.startDate, dateRange.endDate],
    });
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}
