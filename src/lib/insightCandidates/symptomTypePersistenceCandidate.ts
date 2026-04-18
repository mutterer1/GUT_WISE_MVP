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
  computeContradictionRate,
  computeRecencyWeight,
  computeEvidenceQuality,
  buildEvidenceGaps,
  buildUncertaintyStatement,
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

function hasSymptomContext(day: UserDailyFeatures): boolean {
  return (
    day.symptom_event_count > 0 ||
    day.symptom_types.length > 0 ||
    day.max_symptom_severity !== null
  );
}

export function analyzeSymptomTypePersistenceCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < WINDOW_SIZE) return null;

  const orderedDays = [...features]
    .filter(hasSymptomContext)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (orderedDays.length < WINDOW_SIZE) return null;

  const windows = buildRollingWindows(orderedDays, WINDOW_SIZE);
  if (windows.length === 0) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let totalRecurrenceDays = 0;

  let globalDominantType: string | null = null;
  let globalDominantDayCount = 0;

  const supportDates: string[] = [];
  const exposureDates: string[] = [];
  const baselineDates: string[] = [];

  for (const window of windows) {
    const dominant = getDominantSymptomType(window);

    if (dominant !== null) {
      exposureCount++;
      supportCount++;
      totalRecurrenceDays += dominant.dayCount;
      supportDates.push(window.startDate);
      exposureDates.push(window.startDate);

      if (dominant.dayCount > globalDominantDayCount) {
        globalDominantDayCount = dominant.dayCount;
        globalDominantType = dominant.type;
      }
    } else {
      nonExposedCount++;
      contradictionCount++;
      baselineDates.push(window.startDate);
    }
  }

  if (exposureCount < 2) return null;

  const contrastCount = nonExposedCount;
  const exposedRate = safeRate(totalRecurrenceDays, exposureCount * WINDOW_SIZE);
  const baselineRate = Math.round((MIN_RECURRENCE_DAYS / WINDOW_SIZE) * 1000) / 1000;
  const lift = computeLift(exposedRate, baselineRate);

  const analysisEndDate = orderedDays[orderedDays.length - 1].date;
  const supportingLogTypes = ['symptom'];
  const missingLogTypes: string[] = [];

  if (features.some((day) => !hasSymptomContext(day))) {
    missingLogTypes.push('symptom');
  }

  const sufficiency = computeDataSufficiency(
    orderedDays.length,
    exposureCount,
    contrastCount
  );

  const recencyWeight = computeRecencyWeight(supportDates, analysisEndDate);
  const contradictionRate = computeContradictionRate(
    contradictionCount,
    exposureCount
  );

  const evidenceQuality = computeEvidenceQuality(
    sufficiency,
    supportCount,
    contradictionCount,
    exposureCount,
    contrastCount,
    recencyWeight,
    supportingLogTypes
  );

  const evidenceGaps = buildEvidenceGaps({
    eligibleDayCount: orderedDays.length,
    exposureCount,
    contrastCount,
    supportCount,
    contradictionCount,
    supportingLogTypes,
    endDate: analysisEndDate,
    sampleDates: supportDates,
  });

  const uncertaintyStatement = buildUncertaintyStatement(evidenceGaps);

  const status = computeStatus(
    sufficiency,
    supportCount,
    exposedRate,
    baselineRate,
    contradictionCount,
    exposureCount,
    contrastCount,
    evidenceQuality
  );

  const confidence = computeConfidence(
    sufficiency,
    supportCount,
    contradictionCount,
    lift,
    exposureCount,
    contrastCount,
    recencyWeight,
    supportingLogTypes
  );

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: exposureCount,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    contrast_count: contrastCount,
    eligible_day_count: orderedDays.length,
    exposed_day_count: exposureCount,
    baseline_day_count: contrastCount,
    contradiction_rate: contradictionRate,
    recency_weight: recencyWeight,
    evidence_quality: evidenceQuality,
    supporting_log_types: supportingLogTypes,
    missing_log_types: missingLogTypes,
    exposed_dates: exposureDates.slice(0, 10),
    baseline_dates: baselineDates.slice(0, 10),
    uncertainty_statement: uncertaintyStatement,
    evidence_gaps: evidenceGaps,
    statistics: {
      total_days_analyzed: orderedDays.length,
      total_windows: windows.length,
      positive_windows: exposureCount,
      non_positive_windows: nonExposedCount,
      dominant_symptom_type: globalDominantType,
      dominant_symptom_max_day_count: globalDominantDayCount,
      total_recurrence_days: totalRecurrenceDays,
      min_recurrence_days_threshold: MIN_RECURRENCE_DAYS,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'symptom',
    subtype: 'symptom_type_persistence',
    trigger_factors:
      globalDominantType !== null ? [globalDominantType] : ['symptom_types'],
    target_outcomes: ['symptom_types'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: orderedDays[0].date,
    created_from_end_date: analysisEndDate,
  };
}
