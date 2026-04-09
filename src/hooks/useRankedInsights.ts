import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { assembleRankedInsightInputs } from '../services/rankedInsightsAssembler';
import { runRankedInsightPipeline, type RankedInsightPipelineResult } from '../lib/insightCandidates/runRankedInsightPipeline';

export interface RankedInsightsState {
  insights: RankedInsightPipelineResult | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface UseRankedInsightsOptions {
  lookbackDays?: number;
  enabled?: boolean;
}

export function useRankedInsights(options: UseRankedInsightsOptions = {}): RankedInsightsState {
  const { lookbackDays = 90, enabled = true } = options;
  const { user } = useAuth();

  const [insights, setInsights] = useState<RankedInsightPipelineResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  const run = useCallback(async () => {
    if (!user?.id || !enabled) return;

    const currentRun = ++runId.current;
    setLoading(true);
    setError(null);

    try {
      const inputs = await assembleRankedInsightInputs(user.id, lookbackDays);

      if (currentRun !== runId.current) return;

      if (!inputs) {
        setInsights({
          candidates: [],
          input_day_count: 0,
          analyzed_from: null,
          analyzed_to: null,
        });
        return;
      }

      const result = runRankedInsightPipeline({
        dailyFeatures: inputs.dailyFeatures,
        baselines: inputs.baselines,
      });

      if (currentRun !== runId.current) return;

      setInsights(result);
    } catch (err) {
      if (currentRun !== runId.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      if (currentRun === runId.current) setLoading(false);
    }
  }, [user?.id, lookbackDays, enabled]);

  useEffect(() => {
    run();
  }, [run]);

  return { insights, loading, error, refresh: run };
}
