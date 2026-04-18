import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate, PrioritizedInsightCandidate } from '../../types/insightCandidates';
import { runCoreCandidateAnalyzers } from './runCoreCandidateAnalyzers';
import { prioritizeInsightCandidates } from './prioritizeInsightCandidates';

export interface RankedInsightPipelineParams {
  dailyFeatures: UserDailyFeatures[];
  baselines: UserBaselineSet;
}

export interface CandidateEvidenceGapSummary {
  insight_key: string;
  category: string;
  subtype: string;
  reasons: string[];
  supporting_log_types: string[];
  missing_log_types: string[];
}

export interface RankedInsightPipelineResult {
  candidates: PrioritizedInsightCandidate[];
  input_day_count: number;
  analyzed_from: string | null;
  analyzed_to: string | null;
  evidence_gap_count: number;
  evidence_gap_summaries: CandidateEvidenceGapSummary[];
  missing_log_types: string[];
}

function collectMissingLogTypes(candidates: InsightCandidate[]): string[] {
  const set = new Set<string>();

  for (const candidate of candidates) {
    for (const logType of candidate.evidence.missing_log_types ?? []) {
      set.add(logType);
    }
  }

  return [...set].sort();
}

function buildEvidenceGapSummary(candidate: InsightCandidate): CandidateEvidenceGapSummary {
  const gapReasons = [
    ...(candidate.evidence.evidence_gaps?.map((gap) => gap.message) ?? []),
  ];

  if (candidate.status === 'insufficient') {
    gapReasons.unshift('This pattern does not meet the minimum evidence threshold yet.');
  }

  if (candidate.data_sufficiency === 'insufficient') {
    gapReasons.unshift('There is not enough overlap across recent days to compare this pattern well.');
  }

  return {
    insight_key: candidate.insight_key,
    category: candidate.category,
    subtype: candidate.subtype,
    reasons: [...new Set(gapReasons)],
    supporting_log_types: candidate.evidence.supporting_log_types ?? [],
    missing_log_types: candidate.evidence.missing_log_types ?? [],
  };
}

function getEvidenceGapCandidates(
  rawCandidates: InsightCandidate[],
  rankedCandidates: PrioritizedInsightCandidate[]
): CandidateEvidenceGapSummary[] {
  const rankedKeys = new Set(rankedCandidates.map((candidate) => candidate.insight_key));

  return rawCandidates
    .filter((candidate) => !rankedKeys.has(candidate.insight_key))
    .filter((candidate) => {
      const gaps = candidate.evidence.evidence_gaps ?? [];
      return (
        candidate.status === 'insufficient' ||
        candidate.data_sufficiency === 'insufficient' ||
        gaps.length > 0
      );
    })
    .map(buildEvidenceGapSummary)
    .sort((a, b) => {
      if (b.reasons.length !== a.reasons.length) return b.reasons.length - a.reasons.length;
      return a.insight_key.localeCompare(b.insight_key);
    });
}

export function runRankedInsightPipeline(
  params: RankedInsightPipelineParams
): RankedInsightPipelineResult {
  const { dailyFeatures, baselines } = params;

  if (dailyFeatures.length === 0) {
    return {
      candidates: [],
      input_day_count: 0,
      analyzed_from: null,
      analyzed_to: null,
      evidence_gap_count: 0,
      evidence_gap_summaries: [],
      missing_log_types: [],
    };
  }

  const rawCandidates = runCoreCandidateAnalyzers(dailyFeatures, baselines);
  const ranked = prioritizeInsightCandidates(rawCandidates);
  const evidenceGapSummaries = getEvidenceGapCandidates(rawCandidates, ranked);

  const dates = dailyFeatures.map((f) => f.date).sort();

  return {
    candidates: ranked,
    input_day_count: dailyFeatures.length,
    analyzed_from: dates[0],
    analyzed_to: dates[dates.length - 1],
    evidence_gap_count: evidenceGapSummaries.length,
    evidence_gap_summaries: evidenceGapSummaries,
    missing_log_types: collectMissingLogTypes(rawCandidates),
  };
}
