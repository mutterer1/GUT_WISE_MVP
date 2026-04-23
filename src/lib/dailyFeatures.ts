import type { CanonicalEvent } from '../types/canonicalEvents';
import type { UserDailyFeatures } from '../types/dailyFeatures';

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

function numericAvg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function numericMax(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.max(...values);
}

function numericMin(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.min(...values);
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function lastEventByOccurredAt(events: CanonicalEvent[]): CanonicalEvent | null {
  if (events.length === 0) return null;
  return events.reduce((latest, e) => (e.occurred_at > latest.occurred_at ? e : latest));
}

function payloadNum(payload: Record<string, unknown>, key: string): number | null {
  const v = payload[key];
  if (typeof v === 'number' && !isNaN(v)) return v;
  return null;
}

function payloadBool(payload: Record<string, unknown>, key: string): boolean {
  return payload[key] === true;
}

function payloadStr(payload: Record<string, unknown>, key: string): string | null {
  const v = payload[key];
  if (typeof v === 'string' && v.length > 0) return v;
  return null;
}

function payloadStrArray(payload: Record<string, unknown>, key: string): string[] {
  const v = payload[key];
  if (Array.isArray(v)) return v.filter((item): item is string => typeof item === 'string');
  return [];
}

const CAFFEINE_KEYWORDS = [
  'coffee',
  'espresso',
  'latte',
  'cappuccino',
  'americano',
  'mocha',
  'tea',
  'green tea',
  'black tea',
  'matcha',
  'energy drink',
  'energy',
  'cola',
  'soda',
  'caffeine',
];

const ALCOHOL_KEYWORDS = [
  'beer',
  'wine',
  'spirits',
  'cocktail',
  'alcohol',
  'whiskey',
  'vodka',
  'rum',
  'gin',
  'tequila',
  'champagne',
  'cider',
  'sake',
  'mead',
];

function matchesKeywords(value: string, keywords: string[]): boolean {
  const lower = value.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

// ---------------------------------------------------------------------------
// Per-type aggregators
// ---------------------------------------------------------------------------

function aggregateBM(events: CanonicalEvent[]) {
  const bristolValues: number[] = [];
  let hardCount = 0;
  let looseCount = 0;
  let urgencyCount = 0;
  let incompleteCount = 0;
  let bloodCount = 0;
  let mucusCount = 0;
  const hours: number[] = [];

  for (const e of events) {
    const bristol = payloadNum(e.payload, 'bristol_type');
    if (bristol !== null) {
      bristolValues.push(bristol);
      if (bristol <= 2) hardCount++;
      if (bristol >= 6) looseCount++;
    }

    const urgency = payloadNum(e.payload, 'urgency');
    if (urgency !== null && urgency >= 4) urgencyCount++;

    if (payloadBool(e.payload, 'incomplete_evacuation')) incompleteCount++;
    if (payloadBool(e.payload, 'blood_present')) bloodCount++;
    if (payloadBool(e.payload, 'mucus_present')) mucusCount++;

    hours.push(e.local_hour);
  }

  return {
    bm_count: events.length,
    avg_bristol: numericAvg(bristolValues),
    hard_stool_count: hardCount,
    loose_stool_count: looseCount,
    urgency_event_count: urgencyCount,
    incomplete_evacuation_count: incompleteCount,
    blood_present_count: bloodCount,
    mucus_present_count: mucusCount,
    first_bm_hour: numericMin(hours),
    last_bm_hour: numericMax(hours),
  };
}

function aggregateSymptoms(events: CanonicalEvent[]) {
  const severities: number[] = [];
  const types: string[] = [];

  for (const e of events) {
    const sev = payloadNum(e.payload, 'severity');
    if (sev !== null) severities.push(sev);

    const st = payloadStr(e.payload, 'symptom_type');
    if (st) types.push(st);
  }

  return {
    symptom_event_count: events.length,
    symptom_burden_score: severities.reduce((sum, v) => sum + v, 0),
    max_symptom_severity: numericMax(severities),
    symptom_types: uniqueSorted(types),
  };
}

function aggregateFood(events: CanonicalEvent[]) {
  const allFoodItemNames: string[] = [];
  const allTags: string[] = [];
  const allIngredientSignals: string[] = [];
  const allMatchedIngredientIds: string[] = [];
  let gutTriggerLoad = 0;
  let highFodmapCount = 0;
  let dairyCount = 0;
  let glutenCount = 0;
  let artificialSweetenerCount = 0;
  let highFatCount = 0;
  let spicyCount = 0;
  let caffeineFoodCount = 0;
  let alcoholFoodCount = 0;
  let fiberDenseCount = 0;
  let lateMeal = false;

  for (const e of events) {
    const foodItemNames =
      payloadStrArray(e.payload, 'food_item_names').length > 0
        ? payloadStrArray(e.payload, 'food_item_names')
        : payloadStrArray(e.payload, 'food_items');
    const tags = payloadStrArray(e.payload, 'tags');
    const ingredientSignals = payloadStrArray(e.payload, 'ingredient_signals');
    const matchedIngredientIds = payloadStrArray(e.payload, 'matched_ingredient_ids');

    allFoodItemNames.push(...foodItemNames);
    allTags.push(...tags);
    allIngredientSignals.push(...ingredientSignals);
    allMatchedIngredientIds.push(...matchedIngredientIds);

    gutTriggerLoad += payloadNum(e.payload, 'gut_trigger_load') ?? 0;
    highFodmapCount += payloadNum(e.payload, 'high_fodmap_food_count') ?? 0;
    dairyCount += payloadNum(e.payload, 'dairy_food_count') ?? 0;
    glutenCount += payloadNum(e.payload, 'gluten_food_count') ?? 0;
    artificialSweetenerCount += payloadNum(e.payload, 'artificial_sweetener_food_count') ?? 0;
    highFatCount += payloadNum(e.payload, 'high_fat_food_count') ?? 0;
    spicyCount += payloadNum(e.payload, 'spicy_food_count') ?? 0;
    caffeineFoodCount += payloadNum(e.payload, 'caffeine_food_count') ?? 0;
    alcoholFoodCount += payloadNum(e.payload, 'alcohol_food_count') ?? 0;
    fiberDenseCount += payloadNum(e.payload, 'fiber_dense_food_count') ?? 0;

    if (e.local_hour >= 20) lateMeal = true;
  }

  return {
    meal_count: events.length,
    food_item_names: uniqueSorted(allFoodItemNames),
    food_tag_set: uniqueSorted(allTags),
    ingredient_signals: uniqueSorted(allIngredientSignals),
    matched_ingredient_ids: uniqueSorted(allMatchedIngredientIds),
    gut_trigger_load: gutTriggerLoad,
    high_fodmap_food_count: highFodmapCount,
    dairy_food_count: dairyCount,
    gluten_food_count: glutenCount,
    artificial_sweetener_food_count: artificialSweetenerCount,
    high_fat_food_count: highFatCount,
    spicy_food_count: spicyCount,
    caffeine_food_count: caffeineFoodCount,
    alcohol_food_count: alcoholFoodCount,
    fiber_dense_food_count: fiberDenseCount,
    late_meal: lateMeal,
  };
}

function aggregateHydration(events: CanonicalEvent[]) {
  let effectiveMl = 0;
  let rawMl = 0;
  let waterGoalMl = 0;
  let totalCaffeineMg = 0;
  let caffeineCount = 0;
  let alcoholCount = 0;

  for (const e of events) {
    const ml = payloadNum(e.payload, 'amount_ml') ?? 0;
    const explicitEffectiveMl = payloadNum(e.payload, 'effective_hydration_ml');
    const explicitWaterGoalMl = payloadNum(e.payload, 'water_goal_contribution_ml');
    const explicitCaffeineMg = payloadNum(e.payload, 'caffeine_mg');
    const beverageType = payloadStr(e.payload, 'beverage_type') ?? '';
    const beverageCategory = payloadStr(e.payload, 'beverage_category');
    const alcoholPresent = payloadBool(e.payload, 'alcohol_present');
    const caffeineContent = payloadBool(e.payload, 'caffeine_content');

    const isAlcohol =
      alcoholPresent ||
      beverageCategory === 'alcohol' ||
      matchesKeywords(beverageType, ALCOHOL_KEYWORDS);

    const isWater = beverageCategory === 'water' || beverageType.toLowerCase() === 'water';

    const isCaffeinated =
      (explicitCaffeineMg ?? 0) > 0 ||
      caffeineContent ||
      beverageCategory === 'coffee' ||
      beverageCategory === 'tea' ||
      beverageCategory === 'soda' ||
      matchesKeywords(beverageType, CAFFEINE_KEYWORDS);

    rawMl += ml;
    effectiveMl += explicitEffectiveMl ?? (isAlcohol ? 0 : ml);
    waterGoalMl += explicitWaterGoalMl ?? (isWater ? ml : 0);

    const caffeineMg = explicitCaffeineMg ?? (isCaffeinated ? 25 : 0);
    totalCaffeineMg += caffeineMg;

    if (isCaffeinated) caffeineCount++;
    if (isAlcohol) alcoholCount++;
  }

  return {
    hydration_total_ml: effectiveMl,
    hydration_event_count: events.length,
    hydration_raw_total_ml: rawMl,
    hydration_water_goal_ml: waterGoalMl,
    hydration_caffeine_mg: totalCaffeineMg,
    caffeine_beverage_count: caffeineCount,
    alcohol_beverage_count: alcoholCount,
  };
}

function aggregateSleep(events: CanonicalEvent[]) {
  const latest = lastEventByOccurredAt(events);

  return {
    sleep_entry_count: events.length,
    sleep_duration_minutes: latest ? payloadNum(latest.payload, 'duration_minutes') : null,
    sleep_quality: latest ? payloadNum(latest.payload, 'quality') : null,
  };
}

function aggregateStress(events: CanonicalEvent[]) {
  const levels: number[] = [];

  for (const e of events) {
    const lvl = payloadNum(e.payload, 'stress_level');
    if (lvl !== null) levels.push(lvl);
  }

  return {
    stress_event_count: events.length,
    stress_avg: numericAvg(levels),
    stress_peak: numericMax(levels),
  };
}

function aggregateMedication(events: CanonicalEvent[]) {
  const names: string[] = [];
  const matchedMedicationIds: string[] = [];
  const families: string[] = [];
  const gutEffects: string[] = [];
  let giRiskMedicationCount = 0;
  let motilitySlowingMedicationCount = 0;
  let motilitySpeedingMedicationCount = 0;
  let acidSuppressionMedicationCount = 0;
  let microbiomeDisruptionMedicationCount = 0;

  for (const e of events) {
    const name = payloadStr(e.payload, 'medication_name');
    if (name) names.push(name);

    matchedMedicationIds.push(...payloadStrArray(e.payload, 'matched_medication_ids'));
    families.push(...payloadStrArray(e.payload, 'medication_families'));
    gutEffects.push(...payloadStrArray(e.payload, 'medication_gut_effects'));
    giRiskMedicationCount += payloadNum(e.payload, 'gi_risk_medication_count') ?? 0;
    motilitySlowingMedicationCount +=
      payloadNum(e.payload, 'motility_slowing_medication_count') ?? 0;
    motilitySpeedingMedicationCount +=
      payloadNum(e.payload, 'motility_speeding_medication_count') ?? 0;
    acidSuppressionMedicationCount +=
      payloadNum(e.payload, 'acid_suppression_medication_count') ?? 0;
    microbiomeDisruptionMedicationCount +=
      payloadNum(e.payload, 'microbiome_disruption_medication_count') ?? 0;
  }

  return {
    medication_event_count: events.length,
    medications_taken: uniqueSorted(names),
    matched_medication_ids: uniqueSorted(matchedMedicationIds),
    medication_families: uniqueSorted(families),
    medication_gut_effects: uniqueSorted(gutEffects),
    gi_risk_medication_count: giRiskMedicationCount,
    motility_slowing_medication_count: motilitySlowingMedicationCount,
    motility_speeding_medication_count: motilitySpeedingMedicationCount,
    acid_suppression_medication_count: acidSuppressionMedicationCount,
    microbiome_disruption_medication_count: microbiomeDisruptionMedicationCount,
  };
}

function aggregateExercise(events: CanonicalEvent[]) {
  let totalMinutes = 0;
  let moderateVigorousMinutes = 0;

  for (const e of events) {
    const dur = payloadNum(e.payload, 'duration_minutes');
    const intensity = payloadNum(e.payload, 'intensity_level');

    if (dur !== null) {
      totalMinutes += dur;
      if (intensity !== null && intensity >= 3) {
        moderateVigorousMinutes += dur;
      }
    }
  }

  return {
    exercise_minutes_total: totalMinutes,
    exercise_sessions_count: events.length,
    moderate_vigorous_minutes: moderateVigorousMinutes,
    movement_low_day: totalMinutes < 20,
  };
}

function aggregateMenstrualCycle(events: CanonicalEvent[]) {
  const latest = lastEventByOccurredAt(events);

  return {
    cycle_entry_count: events.length,
    cycle_day: latest ? payloadNum(latest.payload, 'cycle_day') : null,
    cycle_phase: latest ? payloadStr(latest.payload, 'phase') : null,
  };
}

// ---------------------------------------------------------------------------
// Coverage / metadata
// ---------------------------------------------------------------------------

function resolveTimezone(events: CanonicalEvent[]): string | null {
  const nonNull = events.map((e) => e.timezone).filter((tz): tz is string => tz !== null);
  if (nonNull.length === 0) return null;
  const allSame = nonNull.every((tz) => tz === nonNull[0]);
  if (allSame) return nonNull[0];
  return nonNull[0];
}

function computeCompletenessScore(events: CanonicalEvent[]): number | null {
  const scores = events
    .map((e) => e.completeness_score)
    .filter((s): s is number => s !== null);
  return numericAvg(scores);
}

// ---------------------------------------------------------------------------
// Grouping
// ---------------------------------------------------------------------------

type GroupKey = string;

function makeGroupKey(userId: string, localDate: string): GroupKey {
  return `${userId}||${localDate}`;
}

function parseGroupKey(key: GroupKey): { user_id: string; date: string } {
  const [user_id, date] = key.split('||');
  return { user_id, date };
}

export function groupCanonicalEventsByUserAndDate(
  events: CanonicalEvent[]
): Map<GroupKey, CanonicalEvent[]> {
  const groups = new Map<GroupKey, CanonicalEvent[]>();
  for (const e of events) {
    const key = makeGroupKey(e.user_id, e.local_date);
    const list = groups.get(key);
    if (list) {
      list.push(e);
    } else {
      groups.set(key, [e]);
    }
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Core builder
// ---------------------------------------------------------------------------

function filterByType(events: CanonicalEvent[], type: string): CanonicalEvent[] {
  return events.filter((e) => e.event_type === type);
}

export function buildDailyFeaturesForGroup(
  userId: string,
  date: string,
  events: CanonicalEvent[]
): UserDailyFeatures {
  const bm = aggregateBM(filterByType(events, 'bm'));
  const symptom = aggregateSymptoms(filterByType(events, 'symptom'));
  const food = aggregateFood(filterByType(events, 'food'));
  const hydration = aggregateHydration(filterByType(events, 'hydration'));
  const sleep = aggregateSleep(filterByType(events, 'sleep'));
  const stress = aggregateStress(filterByType(events, 'stress'));
  const medication = aggregateMedication(filterByType(events, 'medication'));
  const cycle = aggregateMenstrualCycle(filterByType(events, 'menstrual_cycle'));
  const exercise = aggregateExercise(filterByType(events, 'exercise'));

  return {
    user_id: userId,
    date,
    event_count: events.length,
    logging_completeness_score: computeCompletenessScore(events),
    ...bm,
    ...symptom,
    ...food,
    ...hydration,
    ...sleep,
    ...stress,
    ...medication,
    ...cycle,
    ...exercise,
    timezone: resolveTimezone(events),
  };
}

export function buildDailyFeatures(events: CanonicalEvent[]): UserDailyFeatures[] {
  const groups = groupCanonicalEventsByUserAndDate(events);
  const results: UserDailyFeatures[] = [];

  for (const [key, groupEvents] of groups) {
    const { user_id, date } = parseGroupKey(key);
    results.push(buildDailyFeaturesForGroup(user_id, date, groupEvents));
  }

  results.sort((a, b) => {
    const userCmp = a.user_id.localeCompare(b.user_id);
    if (userCmp !== 0) return userCmp;
    return a.date.localeCompare(b.date);
  });

  return results;
}

// ---------------------------------------------------------------------------
// Validation / demo helper (developer-safe, no test framework needed)
// ---------------------------------------------------------------------------

export function dailyFeaturesDemo(): UserDailyFeatures[] {
  const sampleEvents: CanonicalEvent[] = [
    {
      id: 'bm-001',
      user_id: 'user-abc',
      event_type: 'bm',
      occurred_at: '2026-04-08T09:30:00Z',
      local_date: '2026-04-08',
      local_hour: 9,
      timezone: 'America/New_York',
      source_table: 'bm_logs',
      payload: {
        bristol_type: 4,
        urgency: 2,
        incomplete_evacuation: false,
        blood_present: false,
        mucus_present: false,
      },
      completeness_score: 0.9,
    },
    {
      id: 'bm-002',
      user_id: 'user-abc',
      event_type: 'bm',
      occurred_at: '2026-04-08T17:00:00Z',
      local_date: '2026-04-08',
      local_hour: 17,
      timezone: 'America/New_York',
      source_table: 'bm_logs',
      payload: {
        bristol_type: 2,
        urgency: 5,
        incomplete_evacuation: true,
        blood_present: false,
        mucus_present: true,
      },
      completeness_score: 0.85,
    },
    {
      id: 'sym-001',
      user_id: 'user-abc',
      event_type: 'symptom',
      occurred_at: '2026-04-08T10:00:00Z',
      local_date: '2026-04-08',
      local_hour: 10,
      timezone: 'America/New_York',
      source_table: 'symptom_logs',
      payload: { symptom_type: 'bloating', severity: 3 },
      completeness_score: 0.8,
    },
    {
      id: 'sym-002',
      user_id: 'user-abc',
      event_type: 'symptom',
      occurred_at: '2026-04-08T14:00:00Z',
      local_date: '2026-04-08',
      local_hour: 14,
      timezone: 'America/New_York',
      source_table: 'symptom_logs',
      payload: { symptom_type: 'cramping', severity: 5 },
      completeness_score: null,
    },
    {
      id: 'food-001',
      user_id: 'user-abc',
      event_type: 'food',
      occurred_at: '2026-04-08T12:30:00Z',
      local_date: '2026-04-08',
      local_hour: 12,
      timezone: 'America/New_York',
      source_table: 'food_logs',
      payload: {
        meal_type: 'lunch',
        food_items: ['salad', 'chicken'],
        food_item_names: ['salad', 'chicken'],
        tags: ['high-fiber'],
        ingredient_signals: ['fiber_dense'],
        gut_trigger_load: 1,
        fiber_dense_food_count: 1,
      },
      completeness_score: 0.7,
    },
    {
      id: 'food-002',
      user_id: 'user-abc',
      event_type: 'food',
      occurred_at: '2026-04-08T21:00:00Z',
      local_date: '2026-04-08',
      local_hour: 21,
      timezone: 'America/New_York',
      source_table: 'food_logs',
      payload: {
        meal_type: 'dinner',
        food_items: ['pasta'],
        food_item_names: ['pasta'],
        tags: ['gluten'],
        ingredient_signals: ['gluten'],
        gut_trigger_load: 1,
        gluten_food_count: 1,
      },
      completeness_score: 0.6,
    },
    {
      id: 'hyd-001',
      user_id: 'user-abc',
      event_type: 'hydration',
      occurred_at: '2026-04-08T08:00:00Z',
      local_date: '2026-04-08',
      local_hour: 8,
      timezone: 'America/New_York',
      source_table: 'hydration_logs',
      payload: {
        amount_ml: 500,
        beverage_type: 'water',
        beverage_category: 'water',
        effective_hydration_ml: 500,
        water_goal_contribution_ml: 500,
        caffeine_mg: 0,
        alcohol_present: false,
      },
      completeness_score: 1.0,
    },
    {
      id: 'hyd-002',
      user_id: 'user-abc',
      event_type: 'hydration',
      occurred_at: '2026-04-08T10:30:00Z',
      local_date: '2026-04-08',
      local_hour: 10,
      timezone: 'America/New_York',
      source_table: 'hydration_logs',
      payload: {
        amount_ml: 350,
        beverage_type: 'coffee',
        beverage_category: 'coffee',
        effective_hydration_ml: 350,
        water_goal_contribution_ml: 0,
        caffeine_mg: 95,
        alcohol_present: false,
      },
      completeness_score: 1.0,
    },
    {
      id: 'slp-001',
      user_id: 'user-abc',
      event_type: 'sleep',
      occurred_at: '2026-04-08T07:00:00Z',
      local_date: '2026-04-08',
      local_hour: 7,
      timezone: 'America/New_York',
      source_table: 'sleep_logs',
      payload: { duration_minutes: 480, quality: 4 },
      completeness_score: 0.95,
    },
    {
      id: 'str-001',
      user_id: 'user-abc',
      event_type: 'stress',
      occurred_at: '2026-04-08T14:00:00Z',
      local_date: '2026-04-08',
      local_hour: 14,
      timezone: 'America/New_York',
      source_table: 'stress_logs',
      payload: { stress_level: 6 },
      completeness_score: 0.8,
    },
    {
      id: 'med-001',
      user_id: 'user-abc',
      event_type: 'medication',
      occurred_at: '2026-04-08T08:15:00Z',
      local_date: '2026-04-08',
      local_hour: 8,
      timezone: 'America/New_York',
      source_table: 'medication_logs',
      payload: {
        medication_name: 'Probiotic',
        medication_families: ['probiotic'],
        medication_gut_effects: ['microbiome_disruption'],
        gi_risk_medication_count: 1,
        microbiome_disruption_medication_count: 1,
      },
      completeness_score: 1.0,
    },
    {
      id: 'mc-001',
      user_id: 'user-abc',
      event_type: 'menstrual_cycle',
      occurred_at: '2026-04-08T09:00:00Z',
      local_date: '2026-04-08',
      local_hour: 9,
      timezone: 'America/New_York',
      source_table: 'menstrual_cycle_logs',
      payload: { cycle_day: 4, flow_intensity: 'medium' },
      completeness_score: 0.9,
    },
  ];

  return buildDailyFeatures(sampleEvents);
}
