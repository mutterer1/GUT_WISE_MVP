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

const INSIGHT_KEY = 'cycle_phase_recurrent_symptom_burden';
const ELEVATION_THRESHOLD = 1.5;
const MIN_PHASE_DAYS = 5;
const MIN_EPISODES = 3;
const MAX_INTRA_EPISODE_GAP_DAYS = 2;

type SupportedPhase = 'menstrual' | 'luteal';

interface PhaseResult {
  candidate: InsightCandidate;
  confidence: number;
}

function groupIntoEpisodes(days: UserDailyFeatures[]): UserDailyFeatures[][] {
  if (days.length === 0) return [];

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const episodes: UserDailyFeatures[][] = [];
  let current: UserDailyFeatures[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const msGap = new Date(curr.date).getTime() - new Date(prev.date).getTime();
    const dayGap = msGap / (1000 * 60 * 60 * 24);

    if (dayGap <= MAX_INTRA_EPISODE_GAP_DAYS) {
      current.push(curr);
    } else {
      episodes.push(current);
      current = [curr];
    }
  }

  episodes.push(current);
  return episodes;
}

function hasSymptomAndCycleContext(day: UserDailyFeatures): boolean {
  return day.cycle_phase !== null && day.symptom_event_count >= 0;
}

function getSupportingLogTypes(phaseDays: UserDailyFeatures[]): string[] {
  const logTypes = new Set<string>();

  for (const day of phaseDays) {
    if (day.cycle_entry_count > 0 || day.cycle_phase !== null || day.cycle_day !== null) {
      logTypes.add('cycle');
    }

    if (
      day.symptom_event_count > 0 ||
      day.symptom_burden_score > 0 ||
      day.max_symptom_severity !== null
    ) {
      logTypes.add('symptom');
    }

    if (
      day.bm_count > 0 ||
      day.avg_bristol !== null ||
      day.urgency_event_count > 0
    ) {
      logTypes.add('gut');
    }
  }

  return Array.from(logTypes);
}

function analyzeOnePhase(
  phase: SupportedPhase,
  phaseDays: UserDailyFeatures[],
  phaseMedian: number,
  nonPhaseDays: UserDailyFeatures[],
  baselines: UserBaselineSet,
  sorted: UserDailyFeatures[]
): PhaseResult | null {
  if (phaseDays.length < MIN_PHASE_DAYS || nonPhaseDays.length === 0) return null;

  const elevationLine = phaseMedian + ELEVATION_THRESHOLD;
  const episodes = groupIntoEpisodes(phaseDays);

  if (episodes.length < MIN_EPISODES) return null;

  let supportCount = 0;
  let contradictionCount = 0;
  let nonPhaseElevatedCount = 0;

  const supportDates: string[] = [];
  const exposureDates: string[] = [];
  const baselineDates: string[] = [];

  for (const episode of episodes) {
    exposureDates.push(episode[0].date);

    const avgBurden =
      episode.reduce((sum, day) => sum + day.symptom_burden_score, 0) / episode.length;

    if (avgBurden > elevationLine) {
      supportCount++;
      supportDates.push(episode[0].date);
    } else {
      contradictionCount++;
    }
  }

  for (const day of nonPhaseDays) {
    baselineDates.push(day.date);

    if (day.symptom_burden_score > elevationLine) {
      nonPhaseElevatedCount++;
    }
  }

  const contrastCount = nonPhaseDays.length;
  const exposedRate = safeRate(supportCount, episodes.length);
  const baselineRate = safeRate(nonPhaseElevatedCount, contrastCount);
  const lift = computeLift(exposedRate, baselineRate);

  const supportingLogTypes = getSupportingLogTypes(phaseDays);
  const missingLogTypes = ['gut'].filter(
    (logType) => !supportingLogTypes.includes(logType)
  );

  const sufficiency = computeDataSufficiency(
    sorted.length,
    episodes.length,
    contrastCount
  );

  const analysisEndDate = sorted[sorted.length - 1].date;
  const recencyWeight = computeRecencyWeight(supportDates, analysisEndDate);
  const contradictionRate = computeContradictionRate(
    contradictionCount,
    episodes.length
  );

  const evidenceQuality = computeEvidenceQuality(
    sufficiency,
    supportCount,
    contradictionCount,
    episodes.length,
    contrastCount,
    recencyWeight,
    supportingLogTypes
  );

  const evidenceGaps = buildEvidenceGaps({
    eligibleDayCount: sorted.length,
    exposureCount: episodes.length,
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
    episodes.length,
    contrastCount,
    evidenceQuality
  );

  const confidence = computeConfidence(
    sufficiency,
    supportCount,
    contradictionCount,
    lift,
    episodes.length,
    contrastCount,
    recencyWeight,
    supportingLogTypes
  );

  const evidence: CandidateEvidence = {
    support_count: supportCount,
    exposure_count: episodes.length,
    contradiction_count: contradictionCount,
    baseline_rate: baselineRate,
    exposed_rate: exposedRate,
    lift,
    sample_dates: supportDates.slice(0, 10),
    contrast_count: contrastCount,
    eligible_day_count: sorted.length,
    exposed_day_count: episodes.length,
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
      phase_episode_count: episodes.length,
      phase_median_burden: phaseMedian,
      elevation_threshold: ELEVATION_THRESHOLD,
      elevation_line: elevationLine,
      non_phase_day_count: contrastCount,
      non_phase_elevated_count: nonPhaseElevatedCount,
    },
  };

  const candidate: InsightCandidate = {
    user_id: baselines.user_id,
    insight_key: INSIGHT_KEY,
    category: 'cycle',
    subtype: 'cycle_phase_recurrent_symptom_burden',
    trigger_factors: [`cycle_phase_${phase}`],
    target_outcomes: ['symptom_burden_score'],
    status,
    confidence_score: confidence,
    data_sufficiency: sufficiency,
    evidence,
    created_from_start_date: sorted[0].date,
    created_from_end_date: analysisEndDate,
  };

  return { candidate, confidence: confidence ?? 0 };
}

export function analyzeCyclePhaseRecurrentSymptomBurdenCandidate(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate | null {
  if (features.length === 0) return null;

  const { cycle } = baselines;
  const hasMenstrualBaseline = cycle.menstrual_phase_symptom_burden_median !== null;
  const hasLutealBaseline = cycle.luteal_phase_symptom_burden_median !== null;

  if (!hasMenstrualBaseline && !hasLutealBaseline) return null;

  const sorted = [...features]
    .filter(hasSymptomAndCycleContext)
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
      cycle.menstrual_phase_symptom_burden_median!,
      nonMenstrualDays,
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
      nonLutealDays,
      baselines,
      sorted
    );
    if (result !== null) results.push(result);
  }

  if (results.length === 0) return null;

  results.sort((a, b) => b.confidence - a.confidence);
  return results[0].candidate;
}
