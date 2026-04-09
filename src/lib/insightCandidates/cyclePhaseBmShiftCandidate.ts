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
} from './sharedCandidateUtils';

const INSIGHT_KEY = 'cycle_phase_bm_shift';
const BM_DEVIATION_THRESHOLD = 1.0;
const MIN_PHASE_DAYS = 5;

type SupportedPhase = 'menstrual' | 'luteal';

interface PhaseResult {
  candidate: InsightCandidate;
  confidence: number;
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
  if (phaseDays.length < MIN_PHASE_DAYS) return null;

  let supportCount = 0;
  let contradictionCount = 0;
  const supportDates: string[] = [];

  for (const day of phaseDays) {
    if (Math.abs(day.bm_count - phaseBmMedian) >= BM_DEVIATION_THRESHOLD) {
      supportCount++;
      supportDates.push(day.date);
    } else {
      contradictionCount++;
    }
  }

  const nonPhaseDeviantCount = nonPhaseDays.filter(
    (d) => Math.abs(d.bm_count - globalBmMedian) >= BM_DEVIATION_THRESHOLD
  ).length;

  const exposedRate = safeRate(supportCount, phaseDays.length);
  const baselineRate = safeRate(nonPhaseDeviantCount, nonPhaseDays.length);
  const lift = computeLift(exposedRate, baselineRate);

  const sufficiency = computeDataSufficiency(phaseDays.length, supportCount);
  const status = computeStatus(sufficiency, supportCount, exposedRate, baselineRate);
  const confidence = computeConfidence(sufficiency, supportCount, contradictionCount, lift);

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: phaseDays.length,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    statistics: {
      phase,
      phase_day_count: phaseDays.length,
      phase_bm_count_median: phaseBmMedian,
      bm_deviation_threshold: BM_DEVIATION_THRESHOLD,
      non_phase_day_count: nonPhaseDays.length,
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
    created_from_end_date: sorted[sorted.length - 1].date,
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

  if ((!hasMenstrualBaseline && !hasLutealBaseline) || globalBmMedian === null) return null;

  const sorted = [...features].sort((a, b) => a.date.localeCompare(b.date));

  const menstrualDays = sorted.filter((d) => d.cycle_phase === 'menstrual');
  const lutealDays = sorted.filter((d) => d.cycle_phase === 'luteal');
  const nonPhaseDays = sorted.filter(
    (d) => d.cycle_phase !== 'menstrual' && d.cycle_phase !== 'luteal'
  );

  const results: PhaseResult[] = [];

  if (hasMenstrualBaseline) {
    const result = analyzeOnePhase(
      'menstrual',
      menstrualDays,
      cycle.menstrual_phase_bm_count_median!,
      nonPhaseDays,
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
      nonPhaseDays,
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
