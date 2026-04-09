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

const INSIGHT_KEY = 'cycle_phase_symptom_shift';
const ELEVATION_THRESHOLD = 2.0;
const MIN_PHASE_DAYS = 5;

type SupportedPhase = 'menstrual' | 'luteal';

interface PhaseResult {
  candidate: InsightCandidate;
  confidence: number;
}

function analyzeOnePhase(
  phase: SupportedPhase,
  phaseDays: UserDailyFeatures[],
  phaseMedian: number,
  nonPhaseDays: UserDailyFeatures[],
  baselines: UserBaselineSet,
  sorted: UserDailyFeatures[]
): PhaseResult | null {
  if (phaseDays.length < MIN_PHASE_DAYS) return null;

  const elevationLine = phaseMedian + ELEVATION_THRESHOLD;

  let supportCount = 0;
  let contradictionCount = 0;
  const supportDates: string[] = [];

  for (const day of phaseDays) {
    if (day.symptom_burden_score > elevationLine) {
      supportCount++;
      supportDates.push(day.date);
    } else {
      contradictionCount++;
    }
  }

  const nonPhaseElevatedCount = nonPhaseDays.filter(
    (d) => d.symptom_burden_score > elevationLine
  ).length;

  const exposedRate = safeRate(supportCount, phaseDays.length);
  const baselineRate = safeRate(nonPhaseElevatedCount, nonPhaseDays.length);
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
      phase_median_burden: phaseMedian,
      elevation_threshold: ELEVATION_THRESHOLD,
      elevation_line: elevationLine,
      non_phase_day_count: nonPhaseDays.length,
      non_phase_elevated_count: nonPhaseElevatedCount,
    },
  };

  const candidate: InsightCandidate = {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'cycle',
    subtype: 'cycle_phase_symptom_shift',
    trigger_factors: [`cycle_phase_${phase}`],
    target_outcomes: ['symptom_burden_score'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: sorted[sorted.length - 1].date,
  };

  return { candidate, confidence: confidence ?? 0 };
}

export function analyzeCyclePhaseSymptomShiftCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  const { cycle } = baselines;

  const hasMenstrualBaseline = cycle.menstrual_phase_symptom_burden_median !== null;
  const hasLutealBaseline = cycle.luteal_phase_symptom_burden_median !== null;

  if (!hasMenstrualBaseline && !hasLutealBaseline) return null;

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
      cycle.menstrual_phase_symptom_burden_median!,
      nonPhaseDays,
      baselines,
      sorted
    );
    if (result !== null) results.push(result);
  }

  if (hasLutealBaseline) {
    const result = analyzeOnePhase(
      'luteal',
      lutealDays,
      cycle.luteal_phase_symptom_burden_median!,
      nonPhaseDays,
      baselines,
      sorted
    );
    if (result !== null) results.push(result);
  }

  if (results.length === 0) return null;

  results.sort((a, b) => b.confidence - a.confidence);
  return results[0].candidate;
}
