import { supabase } from '../lib/supabase';

export interface InsightEvidence {
  dates?: string[];
  frequency?: string;
  correlation?: string;
  examples?: string[];
  statistics?: Record<string, any>;
}

export interface Insight {
  id: string;
  user_id: string;
  insight_type: 'sleep_symptom' | 'stress_urgency' | 'hydration_consistency' | 'food_symptom' | 'temporal_pattern';
  summary: string;
  evidence: InsightEvidence;
  confidence_level: 'low' | 'medium' | 'high';
  occurrence_count: number;
  first_detected_at: string;
  last_detected_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SleepLog {
  logged_at: string;
  quality: number;
  duration_minutes: number;
}

interface SymptomLog {
  logged_at: string;
  symptom_type: string;
  severity: number;
}

interface StressLog {
  logged_at: string;
  stress_level: number;
}

interface BMLog {
  logged_at: string;
  urgency: number;
  bristol_type: number;
}

interface HydrationLog {
  logged_at: string;
  amount_ml: number;
  beverage_type: string;
}

interface FoodLog {
  logged_at: string;
  food_items: any;
  tags?: string[];
}

const DISCLAIMER = "This insight is for tracking purposes only and is not medical advice. Consult healthcare providers for persistent concerns.";

function getDateOnly(dateStr: string): string {
  return dateStr.split('T')[0];
}

function addHours(dateStr: string, hours: number): Date {
  const date = new Date(dateStr);
  date.setHours(date.getHours() + hours);
  return date;
}

function isWithinTimeWindow(targetDate: string, referenceDate: string, minHours: number, maxHours: number): boolean {
  const target = new Date(targetDate);
  const minTime = addHours(referenceDate, minHours);
  const maxTime = addHours(referenceDate, maxHours);
  return target >= minTime && target <= maxTime;
}

export async function analyzeSleepSymptomCorrelation(userId: string): Promise<Insight | null> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: sleepLogs } = await supabase
    .from('sleep_logs')
    .select('logged_at, quality, duration_minutes')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  const { data: symptomLogs } = await supabase
    .from('symptom_logs')
    .select('logged_at, symptom_type, severity')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  if (!sleepLogs || sleepLogs.length < 3 || !symptomLogs || symptomLogs.length < 3) {
    return null;
  }

  const poorSleepNights = sleepLogs.filter(
    (log: SleepLog) => log.quality < 6 || log.duration_minutes < 360
  );

  if (poorSleepNights.length < 2) {
    return null;
  }

  let correlationCount = 0;
  const evidenceDates: string[] = [];
  const symptomTypes: Record<string, number> = {};

  poorSleepNights.forEach((sleepLog: SleepLog) => {
    const followingSymptoms = symptomLogs.filter((symptom: SymptomLog) =>
      isWithinTimeWindow(symptom.logged_at, sleepLog.logged_at, 24, 48) && symptom.severity >= 6
    );

    if (followingSymptoms.length > 0) {
      correlationCount++;
      evidenceDates.push(getDateOnly(sleepLog.logged_at));
      followingSymptoms.forEach((s: SymptomLog) => {
        symptomTypes[s.symptom_type] = (symptomTypes[s.symptom_type] || 0) + 1;
      });
    }
  });

  if (correlationCount < 2) {
    return null;
  }

  const rate = (correlationCount / poorSleepNights.length) * 100;
  const topSymptom = Object.entries(symptomTypes).sort((a, b) => b[1] - a[1])[0];

  let confidenceLevel: 'low' | 'medium' | 'high';
  if (correlationCount >= 7) confidenceLevel = 'high';
  else if (correlationCount >= 4) confidenceLevel = 'medium';
  else confidenceLevel = 'low';

  const summary = `You tend to experience increased ${topSymptom[0]} on days following poor sleep. ${DISCLAIMER}`;

  const evidence: InsightEvidence = {
    frequency: `${correlationCount} out of ${poorSleepNights.length} nights with poor sleep were followed by symptoms`,
    correlation: `${rate.toFixed(0)}% correlation rate`,
    dates: evidenceDates,
    statistics: { symptomTypes, totalPoorSleepNights: poorSleepNights.length }
  };

  return {
    id: '',
    user_id: userId,
    insight_type: 'sleep_symptom',
    summary,
    evidence,
    confidence_level: confidenceLevel,
    occurrence_count: correlationCount,
    first_detected_at: poorSleepNights[0].logged_at,
    last_detected_at: poorSleepNights[poorSleepNights.length - 1].logged_at,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function analyzeStressUrgencyPattern(userId: string): Promise<Insight | null> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: stressLogs } = await supabase
    .from('stress_logs')
    .select('logged_at, stress_level')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  const { data: bmLogs } = await supabase
    .from('bm_logs')
    .select('logged_at, urgency, bristol_type')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  if (!stressLogs || stressLogs.length < 3 || !bmLogs || bmLogs.length < 3) {
    return null;
  }

  const highStressEvents = stressLogs.filter((log: StressLog) => log.stress_level >= 7);

  if (highStressEvents.length < 2) {
    return null;
  }

  let correlationCount = 0;
  const evidenceDates: string[] = [];
  let urgencyCount = 0;

  highStressEvents.forEach((stressLog: StressLog) => {
    const followingBMs = bmLogs.filter((bm: BMLog) =>
      isWithinTimeWindow(bm.logged_at, stressLog.logged_at, 2, 6)
    );

    const hasUrgency = followingBMs.some((bm: BMLog) => (bm.urgency || 0) >= 4);

    if (hasUrgency) {
      correlationCount++;
      evidenceDates.push(getDateOnly(stressLog.logged_at));
      urgencyCount++;
    }
  });

  if (correlationCount < 2) {
    return null;
  }

  const rate = (correlationCount / highStressEvents.length) * 100;

  let confidenceLevel: 'low' | 'medium' | 'high';
  if (correlationCount >= 7) confidenceLevel = 'high';
  else if (correlationCount >= 4) confidenceLevel = 'medium';
  else confidenceLevel = 'low';

  const summary = `High stress levels appear linked to bowel urgency episodes within 2-6 hours. ${DISCLAIMER}`;

  const evidence: InsightEvidence = {
    frequency: `${correlationCount} out of ${highStressEvents.length} high-stress periods were followed by urgency`,
    correlation: `${rate.toFixed(0)}% correlation rate`,
    dates: evidenceDates,
    statistics: { urgencyCount, totalHighStressEvents: highStressEvents.length }
  };

  return {
    id: '',
    user_id: userId,
    insight_type: 'stress_urgency',
    summary,
    evidence,
    confidence_level: confidenceLevel,
    occurrence_count: correlationCount,
    first_detected_at: highStressEvents[0].logged_at,
    last_detected_at: highStressEvents[highStressEvents.length - 1].logged_at,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function analyzeHydrationConsistencyPattern(userId: string): Promise<Insight | null> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: hydrationLogs } = await supabase
    .from('hydration_logs')
    .select('logged_at, amount_ml')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  const { data: bmLogs } = await supabase
    .from('bm_logs')
    .select('logged_at, bristol_type')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  if (!hydrationLogs || hydrationLogs.length < 3 || !bmLogs || bmLogs.length < 3) {
    return null;
  }

  const lowHydrationDays = hydrationLogs.filter(
    (log: HydrationLog) => log.amount_ml < 1500
  );

  if (lowHydrationDays.length < 2) {
    return null;
  }

  let correlationCount = 0;
  const evidenceDates: string[] = [];

  lowHydrationDays.forEach((hydrationLog: HydrationLog) => {
    const followingBMs = bmLogs.filter((bm: any) =>
      isWithinTimeWindow(bm.logged_at, hydrationLog.logged_at, 12, 24) && bm.bristol_type <= 2
    );

    if (followingBMs.length > 0) {
      correlationCount++;
      evidenceDates.push(getDateOnly(hydrationLog.logged_at));
    }
  });

  if (correlationCount < 2) {
    return null;
  }

  const rate = (correlationCount / lowHydrationDays.length) * 100;

  let confidenceLevel: 'low' | 'medium' | 'high';
  if (correlationCount >= 7) confidenceLevel = 'high';
  else if (correlationCount >= 4) confidenceLevel = 'medium';
  else confidenceLevel = 'low';

  const summary = `Low hydration days appear correlated with harder stool consistency within 12-24 hours. ${DISCLAIMER}`;

  const evidence: InsightEvidence = {
    frequency: `${correlationCount} out of ${lowHydrationDays.length} low-hydration days were followed by harder stools`,
    correlation: `${rate.toFixed(0)}% correlation rate`,
    dates: evidenceDates,
    statistics: { totalLowHydrationDays: lowHydrationDays.length }
  };

  return {
    id: '',
    user_id: userId,
    insight_type: 'hydration_consistency',
    summary,
    evidence,
    confidence_level: confidenceLevel,
    occurrence_count: correlationCount,
    first_detected_at: lowHydrationDays[0].logged_at,
    last_detected_at: lowHydrationDays[lowHydrationDays.length - 1].logged_at,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function analyzeFoodSymptomPattern(userId: string): Promise<Insight[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: foodLogs } = await supabase
    .from('food_logs')
    .select('logged_at, food_items, tags')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  const { data: symptomLogs } = await supabase
    .from('symptom_logs')
    .select('logged_at, symptom_type, severity')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  if (!foodLogs || foodLogs.length < 3 || !symptomLogs || symptomLogs.length < 3) {
    return [];
  }

  const tagCorrelations: Record<string, { count: number; dates: string[]; symptoms: Record<string, number> }> = {};

  foodLogs.forEach((food: FoodLog) => {
    const tags = food.tags || [];

    tags.forEach((tag: string) => {
      const followingSymptoms = symptomLogs.filter((symptom: SymptomLog) =>
        isWithinTimeWindow(symptom.logged_at, food.logged_at, 2, 8) && symptom.severity >= 5
      );

      if (followingSymptoms.length > 0) {
        if (!tagCorrelations[tag]) {
          tagCorrelations[tag] = { count: 0, dates: [], symptoms: {} };
        }
        tagCorrelations[tag].count++;
        tagCorrelations[tag].dates.push(getDateOnly(food.logged_at));
        followingSymptoms.forEach((s: SymptomLog) => {
          tagCorrelations[tag].symptoms[s.symptom_type] = (tagCorrelations[tag].symptoms[s.symptom_type] || 0) + 1;
        });
      }
    });
  });

  const insights: Insight[] = [];

  Object.entries(tagCorrelations).forEach(([tag, data]) => {
    if (data.count >= 3) {
      let confidenceLevel: 'low' | 'medium' | 'high';
      if (data.count >= 7) confidenceLevel = 'high';
      else if (data.count >= 4) confidenceLevel = 'medium';
      else confidenceLevel = 'low';

      const topSymptom = Object.entries(data.symptoms).sort((a, b) => b[1] - a[1])[0];

      const summary = `Foods tagged as "${tag}" appear linked to ${topSymptom[0]} within 2-8 hours after consumption. ${DISCLAIMER}`;

      const evidence: InsightEvidence = {
        frequency: `${data.count} occurrences observed`,
        dates: data.dates.slice(0, 5),
        statistics: { symptomTypes: data.symptoms, tag }
      };

      insights.push({
        id: '',
        user_id: userId,
        insight_type: 'food_symptom',
        summary,
        evidence,
        confidence_level: confidenceLevel,
        occurrence_count: data.count,
        first_detected_at: data.dates[0],
        last_detected_at: data.dates[data.dates.length - 1],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  });

  return insights;
}

export async function analyzeTemporalPattern(userId: string): Promise<Insight[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: bmLogs } = await supabase
    .from('bm_logs')
    .select('logged_at, urgency')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  if (!bmLogs || bmLogs.length < 7) {
    return [];
  }

  const weekdayPatterns: Record<number, number> = {};
  const hourPatterns: Record<number, number> = {};
  const weekendVsWeekday = { weekend: 0, weekday: 0 };

  bmLogs.forEach((bm: any) => {
    const date = new Date(bm.logged_at);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();

    weekdayPatterns[dayOfWeek] = (weekdayPatterns[dayOfWeek] || 0) + 1;
    hourPatterns[hour] = (hourPatterns[hour] || 0) + 1;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendVsWeekday.weekend++;
    } else {
      weekendVsWeekday.weekday++;
    }
  });

  const insights: Insight[] = [];

  const sortedWeekdays = Object.entries(weekdayPatterns)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count >= 3);

  if (sortedWeekdays.length > 0 && sortedWeekdays[0][1] >= 3) {
    const [day, count] = sortedWeekdays[0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const summary = `You have a consistent pattern of bowel movements on ${dayNames[parseInt(day)]}s. ${DISCLAIMER}`;

    const evidence: InsightEvidence = {
      frequency: `${count} occurrences on ${dayNames[parseInt(day)]}s`,
      statistics: { weekdayPatterns, dayName: dayNames[parseInt(day)] }
    };

    insights.push({
      id: '',
      user_id: userId,
      insight_type: 'temporal_pattern',
      summary,
      evidence,
      confidence_level: count >= 7 ? 'high' : count >= 4 ? 'medium' : 'low',
      occurrence_count: count,
      first_detected_at: bmLogs[0].logged_at,
      last_detected_at: bmLogs[bmLogs.length - 1].logged_at,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  const sortedHours = Object.entries(hourPatterns)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count >= 3);

  if (sortedHours.length > 0 && sortedHours[0][1] >= 3) {
    const [hour, count] = sortedHours[0];
    const hourInt = parseInt(hour);
    const timeOfDay = hourInt < 12 ? 'morning' : hourInt < 17 ? 'afternoon' : 'evening';

    const summary = `You have a consistent time-of-day pattern with most bowel movements occurring in the ${timeOfDay}. ${DISCLAIMER}`;

    const evidence: InsightEvidence = {
      frequency: `${count} occurrences around ${hourInt}:00`,
      statistics: { hourPatterns, peakHour: hourInt }
    };

    insights.push({
      id: '',
      user_id: userId,
      insight_type: 'temporal_pattern',
      summary,
      evidence,
      confidence_level: count >= 7 ? 'high' : count >= 4 ? 'medium' : 'low',
      occurrence_count: count,
      first_detected_at: bmLogs[0].logged_at,
      last_detected_at: bmLogs[bmLogs.length - 1].logged_at,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return insights;
}

export async function generateAllInsights(userId: string): Promise<Insight[]> {
  const insights: Insight[] = [];

  const sleepSymptom = await analyzeSleepSymptomCorrelation(userId);
  if (sleepSymptom) insights.push(sleepSymptom);

  const stressUrgency = await analyzeStressUrgencyPattern(userId);
  if (stressUrgency) insights.push(stressUrgency);

  const hydrationConsistency = await analyzeHydrationConsistencyPattern(userId);
  if (hydrationConsistency) insights.push(hydrationConsistency);

  const foodSymptoms = await analyzeFoodSymptomPattern(userId);
  insights.push(...foodSymptoms);

  const temporalPatterns = await analyzeTemporalPattern(userId);
  insights.push(...temporalPatterns);

  return insights;
}

export async function saveInsights(insights: Insight[]): Promise<void> {
  for (const insight of insights) {
    const { data: existing } = await supabase
      .from('user_insights')
      .select('id, occurrence_count')
      .eq('user_id', insight.user_id)
      .eq('insight_type', insight.insight_type)
      .eq('summary', insight.summary)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_insights')
        .update({
          occurrence_count: insight.occurrence_count,
          last_detected_at: insight.last_detected_at,
          confidence_level: insight.confidence_level,
          evidence: insight.evidence,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      const { id, ...insertData } = insight;
      await supabase
        .from('user_insights')
        .insert(insertData);
    }
  }
}

export async function getUserInsights(userId: string): Promise<Insight[]> {
  const { data, error } = await supabase
    .from('user_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('confidence_level', { ascending: false })
    .order('occurrence_count', { ascending: false });

  if (error) throw error;
  return data || [];
}
