import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { PrioritizedInsightCandidate } from '../../types/insightCandidates';
import { runCoreCandidateAnalyzers } from './runCoreCandidateAnalyzers';
import { prioritizeInsightCandidates } from './prioritizeInsightCandidates';

export interface RankedInsightPipelineParams {
  dailyFeatures: UserDailyFeatures[];
  baselines: UserBaselineSet;
}

export interface RankedInsightPipelineResult {
  candidates: PrioritizedInsightCandidate[];
  input_day_count: number;
  analyzed_from: string | null;
  analyzed_to: string | null;
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
    };
  }

  const rawCandidates = runCoreCandidateAnalyzers(dailyFeatures, baselines);
  const ranked = prioritizeInsightCandidates(rawCandidates);

  const dates = dailyFeatures.map((f) => f.date).sort();

  return {
    candidates: ranked,
    input_day_count: dailyFeatures.length,
    analyzed_from: dates[0],
    analyzed_to: dates[dates.length - 1],
  };
}
