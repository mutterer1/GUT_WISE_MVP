import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type {
  InsightCandidate,
  CandidateEvidence,
} from '../../types/insightCandidates';
import {
  safeRate,
  computeDataSufficiency,
  computeStatus,
  computeConfidence,
  computeLift,
  computeRecencyWeight,
  computeContradictionRate,
  computeEvidenceQuality,
  buildEvidenceGaps,
  buildUncertaintyStatement,
} from './sharedCandidateUtils';

const INSIGHT_KEY = 'cycle_phase_bm_shift';
const BM_DEVIATION_THRESHOLD = 1.0;
const MIN_PHASE_DAYS = 5;

type SupportedPhase = 'menstrual' | 'luteal';

interface PhaseResult {
  candidate: InsightCandidate;
  confidence: number;
}

function hasBmAndCycleContext(day: UserDailyFeatures): boolean {
  return day.cycle_phase !== null && day.bm_count >= 0;
}

function getSupportingLogTypes(phaseDays: UserDailyFeatures[]): string[] {
  const logTypes = new Set<string>();

  for (const day of phaseDays) {
    if (day.cycle_entry_count > 0 || day.cycle_phase !== null || day.cycle_day !== null) {
      logTypes.add('cycle');
    }

    if (
      day.bm_count > 0 ||
      day.avg_bristol !== null ||
      day.urgency_event_count > 0 ||
      day.incomplete_evacuation_count > 0
    ) {
      logTypes.add('gut');
    }

    if (day.symptom_event_count > 0 || day.symptom_types.length > 0) {
      logTypes.add('symptom');
    }
  }

  return Array.from(logTypes);
}

function analyzeOnePhase(
  phase: SupportedPhase,
  phaseDays: UserDailyFeatures[],
  phaseBmMedian: number,
  nonPhaseDays: UserDailyFeatures[],
  globalBmMedian: number,
  baselines: UserBaselineSet,
  sorted: UserDailyFeatures[]
): PhaseResult | null {
  if (phaseDays.length < MIN_PHASE_DAYS || nonPhaseDays.length === 0) return null;

  let supportCount = 0;
  let contradictionCount = 0;
  let nonPhaseDeviantCount = 0;

  const supportDates: string[] = [];
  const exposureDates: string[] = [];
  const baselineDates: string[] = [];

  for (const day of phaseDays) {
    exposureDates.push(day.date);

    if (Math.abs(day.bm_count - phaseBmMedian) >= BM_DEVIATION_THRESHOLD) {
      supportCount++;
      supportDates.push(day.date);
    } else {
      contradictionCount++;
    }
  }

  for (const day of nonPhaseDays) {
    baselineDates.push(day.date);

    if (Math.abs(day.bm_count - globalBmMedian) >= BM_DEVIATION_THRESHOLD) {
      nonPhaseDeviantCount++;
    }
  }

  const contrastCount = nonPhaseDays.length;
  const exposedRate = safeRate(supportCount, phaseDays.length);
  const baselineRate = safeRate(nonPhaseDeviantCount, contrastCount);
  const lift = computeLift(exposedRate, baselineRate);

  const supportingLogTypes = getSupportingLogTypes(phaseDays);
  const missingLogTypes = ['symptom'].filter(
    (logType) => !supportingLogTypes.includes(logType)
  );

  const sufficiency = computeDataSufficiency(
    sorted.length,
    phaseDays.length,
    contrastCount
  );

  const analysisEndDate = sorted[sorted.length - 1].date;
  const recencyWeight = computeRecencyWeight(supportDates, analysisEndDate);
  const contradictionRate = computeContradictionRate(
    contradictionCount,
    phaseDays.length
  );

  const evidenceQuality = computeEvidenceQuality(
    sufficiency,
    supportCount,
    contradictionCount,
    phaseDays.length,
    contrastCount,
    recencyWeight,
    supportingLogTypes
  );

  const evidenceGaps = buildEvidenceGaps({
    eligibleDayCount: sorted.length,
    exposureCount: phaseDays.length,
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
    phaseDays.length,
    contrastCount,
    evidenceQuality
  );

  const confidence = computeConfidence(
    sufficiency,
    supportCount,
    contradictionCount,
    lift,
    phaseDays.length,
    contrastCount,
    recencyWeight,
    supportingLogTypes
  );

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: phaseDays.length,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    contrast_count: contrastCount,
    eligible_day_count: sorted.length,
    exposed_day_count: phaseDays.length,
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
      phase,
      phase_day_count: phaseDays.length,
      phase_bm_count_median: phaseBmMedian,
      bm_deviation_threshold: BM_DEVIATION_THRESHOLD,
      non_phase_day_count: contrastCount,
      non_phase_deviant_count: nonPhaseDeviantCount,
      global_bm_median: globalBmMedian,
    },
  };

  const candidate: InsightCandidate = {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'cycle',
    subtype: 'cycle_phase_bm_shift',
    trigger_factors: [`cycle_phase_${phase}`],
    target_outcomes: ['bm_count'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: analysisEndDate,
  };

  return { candidate, confidence: confidence ?? 0 };
}

export function analyzeCyclePhaseBmShiftCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  const { cycle, bowel_movement } = baselines;
  const hasMenstrualBaseline = cycle.menstrual_phase_bm_count_median !== null;
  const hasLutealBaseline = cycle.luteal_phase_bm_count_median !== null;
  const globalBmMedian = bowel_movement.median_bm_count;

  if ((!hasMenstrualBaseline && !hasLutealBaseline) || globalBmMedian === null) {
    return null;
  }

  const sorted = [...features]
    .filter(hasBmAndCycleContext)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) return null;

  const menstrualDays = sorted.filter((day) => day.cycle_phase === 'menstrual');
  const lutealDays = sorted.filter((day) => day.cycle_phase === 'luteal');
  const nonMenstrualDays = sorted.filter((day) => day.cycle_phase !== 'menstrual');
  const nonLutealDays = sorted.filter((day) => day.cycle_phase !== 'luteal');

  const results: PhaseResult[] = [];

  if (hasMenstrualBaseline) {
    const result = analyzeOnePhase(
      'menstrual',
      menstrualDays,
      cycle.menstrual_phase_bm_count_median!,
      nonMenstrualDays,
      globalBmMedian,
      baselines,
      sorted
    );
    if (result !== null) results.push(result);
  }

  if (hasLutealBaseline) {
    const result = analyzeOnePhase(
      'luteal',
      lutealDays,
      cycle.luteal_phase_bm_count_median!,
      nonLutealDays,
      globalBmMedian,
      baselines,
      sorted
    );
    if (result !== null) results.push(result);
  }

  if (results.length === 0) return null;

  results.sort((a, b) => b.confidence - a.confidence);
  return results[0].candidate;
}
