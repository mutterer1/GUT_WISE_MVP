import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type {
  InsightCandidate,
  CandidateEvidence,
} from '../../types/insightCandidates';
import {
  buildRollingWindows,
  safeRate,
  computeDataSufficiency,
  computeStatus,
  computeConfidence,
  computeLift,
  type RollingWindow,
} from './sharedCandidateUtils';

const INSIGHT_KEY = 'symptom_type_persistence';
const WINDOW_SIZE = 7;
const MIN_RECURRENCE_DAYS = 3;

interface DominantSymptom {
  type: string;
  dayCount: number;
}

function getDominantSymptomType(window: RollingWindow): DominantSymptom | null {
  const typeCounts = new Map<string, number>();

  for (const day of window.days) {
    const seen = new Set<string>();
    for (const type of day.symptom_types) {
      if (!seen.has(type)) {
        seen.add(type);
        typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
      }
    }
  }

  let best: DominantSymptom | null = null;
  for (const [type, count] of typeCounts) {
    if (count >= MIN_RECURRENCE_DAYS) {
      if (best === null || count > best.dayCount) {
        best = { type, dayCount: count };
      }
    }
  }

  return best;
}

export function analyzeSymptomTypePersistenceCandidate(
  features: UserDailyFeatures[],
  _baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < WINDOW_SIZE) return null;

  const orderedDays = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const windows = buildRollingWindows(orderedDays, WINDOW_SIZE);
  if (windows.length === 0) return null;

  let positiveWindowCount = 0;
  let totalRecurrenceDays = 0;
  const supportDates: string[] = [];
  let globalDominantType: string | null = null;
  let globalDominantDayCount = 0;

  for (const window of windows) {
    const dominant = getDominantSymptomType(window);
    if (dominant !== null) {
      positiveWindowCount++;
      totalRecurrenceDays += dominant.dayCount;
      supportDates.push(window.startDate);
      if (dominant.dayCount > globalDominantDayCount) {
        globalDominantDayCount = dominant.dayCount;
        globalDominantType = dominant.type;
      }
    }
  }

  const nonPositiveCount = windows.length - positiveWindowCount;

  const exposedRate =
    positiveWindowCount > 0
      ? safeRate(totalRecurrenceDays, positiveWindowCount * WINDOW_SIZE)
      : null;

  const baselineRate = Math.round((MIN_RECURRENCE_DAYS / WINDOW_SIZE) * 1000) / 1000;
  const lift = computeLift(exposedRate, baselineRate);

  const sufficiency = computeDataSufficiency(orderedDays.length, positiveWindowCount);
  const status = computeStatus(sufficiency, positiveWindowCount, exposedRate, baselineRate);
  const confidence = computeConfidence(sufficiency, positiveWindowCount, nonPositiveCount, lift);

  const evidence: CandidateEvidence = {
    support_count: positiveWindowCount,
    exposure_count: windows.length,
    contradiction_count: nonPositiveCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    statistics: {
      total_days_analyzed: orderedDays.length,
      total_windows: windows.length,
      positive_windows: positiveWindowCount,
      dominant_symptom_type: globalDominantType,
      dominant_symptom_max_day_count: globalDominantDayCount,
      min_recurrence_days_threshold: MIN_RECURRENCE_DAYS,
    },
  };

  return {
    user_id: _baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'symptom',
    subtype: 'symptom_type_persistence',
    trigger_factors: globalDominantType !== null ? [globalDominantType] : ['symptom_types'],
    target_outcomes: ['symptom_types'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: orderedDays[0].date,
    created_from_end_date: orderedDays[orderedDays.length - 1].date,
  };
}
