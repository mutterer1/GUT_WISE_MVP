import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate, CandidateEvidence } from '../../types/insightCandidates';
import {
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
} from './sharedCandidateUtils';

const INSIGHT_KEY = 'hydration_low_next_day_hard_stool';

interface DayPair {
  hydrationDay: UserDailyFeatures;
  nextDay: UserDailyFeatures;
}

export function isLowHydrationDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const effectiveThreshold = baselines.hydration.low_hydration_threshold;
  const waterGoalThreshold = baselines.hydration.low_water_goal_threshold ?? null;

  if (effectiveThreshold !== null) {
    return day.hydration_total_ml < effectiveThreshold;
  }

  if (waterGoalThreshold !== null) {
    return (day.hydration_water_goal_ml ?? 0) < waterGoalThreshold;
  }

  return false;
}

export function isHarderStoolNextDay(
  day: UserDailyFeatures,
  baselines: UserBaselineSet
): boolean {
  const medianBristol = baselines.bowel_movement.median_bristol;

  const bristolBelowMedian =
    day.avg_bristol !== null &&
    medianBristol !== null &&
    day.avg_bristol < medianBristol;

  const hasHardStool = day.hard_stool_count > 0;

  return bristolBelowMedian || hasHardStool;
}

export function getNextDayPairings(features: UserDailyFeatures[]): DayPair[] {
  if (features.length < 2) return [];

  const sorted = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const pairs: DayPair[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const currentDate = new Date(current.date);
    const nextDate = new Date(next.date);
    const diffMs = nextDate.getTime() - currentDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (Math.abs(diffDays - 1) < 0.01) {
      pairs.push({ hydrationDay: current, nextDay: next });
    }
  }

  return pairs;
}

function hasHydrationData(day: UserDailyFeatures): boolean {
  return day.hydration_event_count > 0;
}

function hasStoolContext(day: UserDailyFeatures): boolean {
  return day.bm_count > 0 && (day.avg_bristol !== null || day.hard_stool_count > 0);
}

export function analyzeHydrationStoolConsistencyCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length < 2) return null;
  if (
    baselines.hydration.low_hydration_threshold === null &&
    baselines.hydration.low_water_goal_threshold === null
  ) {
    return null;
  }
  if (baselines.bowel_movement.median_bristol === null) return null;

  const sorted = [...features].sort((a, b) => a.date.localeCompare(b.date));
  const pairs = getNextDayPairings(sorted);
  if (pairs.length === 0) return null;

  const eligiblePairs = pairs.filter(
    (pair) => hasHydrationData(pair.hydrationDay) && hasStoolContext(pair.nextDay)
  );
  if (eligiblePairs.length === 0) return null;

  let exposureCount = 0;
  let supportCount = 0;
  let contradictionCount = 0;
  let nonExposedCount = 0;
  let nonExposedHarderCount = 0;

  const supportDates: string[] = [];
  const exposedDates: string[] = [];
  const baselineDates: string[] = [];

  for (const pair of eligiblePairs) {
    const lowHydration = isLowHydrationDay(pair.hydrationDay, baselines);
    const harderStool = isHarderStoolNextDay(pair.nextDay, baselines);

    if (lowHydration) {
      exposureCount++;
      exposedDates.push(pair.hydrationDay.date);

      if (harderStool) {
        supportCount++;
        supportDates.push(pair.hydrationDay.date);
      } else {
        contradictionCount++;
      }
    } else {
      nonExposedCount++;
      baselineDates.push(pair.hydrationDay.date);

      if (harderStool) {
        nonExposedHarderCount++;
      }
    }
  }

  const exposedRate = safeRate(supportCount, exposureCount);
  const baselineRate = safeRate(nonExposedHarderCount, nonExposedCount);
  const lift = computeLift(exposedRate, baselineRate);

  const supportingLogTypes = ['hydration', 'bm'];
  const missingLogTypes: string[] = [];

  if (pairs.some((pair) => !hasHydrationData(pair.hydrationDay))) {
    missingLogTypes.push('hydration');
  }

  if (pairs.some((pair) => !hasStoolContext(pair.nextDay))) {
    missingLogTypes.push('bm');
  }

  const sufficiency = computeDataSufficiency(
    eligiblePairs.length,
    exposureCount,
    nonExposedCount
  );

  const recencyWeight = computeRecencyWeight(
    supportDates,
    sorted[sorted.length - 1].date
  );

  const evidenceGaps = buildEvidenceGaps({
    eligibleDayCount: eligiblePairs.length,
    exposureCount,
    contrastCount: nonExposedCount,
    supportCount,
    contradictionCount,
    supportingLogTypes,
    endDate: sorted[sorted.length - 1].date,
    sampleDates: supportDates,
  });

  const evidenceQuality = computeEvidenceQuality(
    sufficiency,
    supportCount,
    contradictionCount,
    exposureCount,
    nonExposedCount,
    recencyWeight,
    supportingLogTypes
  );

  const status = computeStatus(
    sufficiency,
    supportCount,
    exposedRate,
    baselineRate,
    contradictionCount,
    exposureCount,
    nonExposedCount,
    evidenceQuality
  );

  const confidence = computeConfidence(
    sufficiency,
    supportCount,
    contradictionCount,
    lift,
    exposureCount,
    nonExposedCount,
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
    contrast_count: nonExposedCount,
    eligible_day_count: eligiblePairs.length,
    exposed_day_count: exposureCount,
    baseline_day_count: nonExposedCount,
    contradiction_rate: computeContradictionRate(contradictionCount, exposureCount),
    recency_weight: recencyWeight,
    evidence_quality: evidenceQuality,
    supporting_log_types: supportingLogTypes,
    missing_log_types: missingLogTypes,
    exposed_dates: exposedDates.slice(0, 10),
    baseline_dates: baselineDates.slice(0, 10),
    uncertainty_statement: buildUncertaintyStatement(evidenceGaps),
    evidence_gaps: evidenceGaps,
    notes: [
      'Paired-day analysis using effective hydration as the primary exposure measure.',
      'Water-goal totals remain available for interpretation but do not replace effective hydration in this rule.',
    ],
    statistics: {
      eligible_pair_count: eligiblePairs.length,
      non_exposed_count: nonExposedCount,
      non_exposed_harder_count: nonExposedHarderCount,
      total_pair_count: pairs.length,
      average_exposed_effective_hydration_ml:
        exposureCount > 0
          ? Math.round(
              eligiblePairs
                .filter((pair) => isLowHydrationDay(pair.hydrationDay, baselines))
                .reduce((sum, pair) => sum + pair.hydrationDay.hydration_total_ml, 0) /
                exposureCount
            )
          : 0,
      average_exposed_water_goal_ml:
        exposureCount > 0
          ? Math.round(
              eligiblePairs
                .filter((pair) => isLowHydrationDay(pair.hydrationDay, baselines))
                .reduce(
                  (sum, pair) => sum + (pair.hydrationDay.hydration_water_goal_ml ?? 0),
                  0
                ) / exposureCount
            )
          : 0,
    },
  };

  return {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'hydration',
    subtype: 'hydration_stool_consistency',
    trigger_factors: ['hydration_total_ml', 'hydration_water_goal_ml'],
    target_outcomes: ['avg_bristol', 'hard_stool_count'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: sorted[sorted.length - 1].date,
  };
}
