import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { assembleRankedInsightInputs } from '../services/rankedInsightsAssembler';
import { runRankedInsightPipeline } from '../lib/insightCandidates/runRankedInsightPipeline';
import { applyMedicalContextModifiers } from '../lib/insightCandidates/applyMedicalContextModifiers';
import { buildRankedExplanationBundle } from '../lib/insightCandidates/buildRankedExplanationBundle';
import { buildLLMExplanationInput } from '../lib/insightCandidates/buildLLMExplanationInput';
import { fetchMedicalContextSummary } from '../services/medicalContextService';
import type { MedicalContextAnnotatedCandidate } from '../types/insightCandidates';
import type { RankedExplanationBundle } from '../types/explanationBundle';
import type { LLMExplanationInput } from '../types/llmExplanationContract';

export interface AnnotatedInsightResult {
  candidates: MedicalContextAnnotatedCandidate[];
  explanationBundle: RankedExplanationBundle;
  llmInput: LLMExplanationInput;
  input_day_count: number;
  analyzed_from: string | null;
  analyzed_to: string | null;
  medical_context_applied: boolean;
}

export interface RankedInsightsState {
  insights: AnnotatedInsightResult | null;
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

  const [insights, setInsights] = useState<AnnotatedInsightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  const run = useCallback(async () => {
    if (!user?.id || !enabled) return;

    const currentRun = ++runId.current;
    setLoading(true);
    setError(null);

    try {
      const [inputs, medicalContext] = await Promise.all([
        assembleRankedInsightInputs(user.id, lookbackDays),
        fetchMedicalContextSummary(user.id).catch(() => null),
      ]);

      if (currentRun !== runId.current) return;

      if (!inputs) {
        const emptyBundle = buildRankedExplanationBundle([], {
          top_n: 0,
          analyzed_from: null,
          analyzed_to: null,
          input_day_count: 0,
          has_medical_context: false,
        });
        setInsights({
          candidates: [],
          explanationBundle: emptyBundle,
          llmInput: buildLLMExplanationInput(emptyBundle),
          input_day_count: 0,
          analyzed_from: null,
          analyzed_to: null,
          medical_context_applied: false,
        });
        return;
      }

      const pipelineResult = runRankedInsightPipeline({
        dailyFeatures: inputs.dailyFeatures,
        baselines: inputs.baselines,
      });

      if (currentRun !== runId.current) return;

      const annotatedCandidates = applyMedicalContextModifiers(
        pipelineResult.candidates,
        medicalContext
      );

      const hasMedicalContext = medicalContext !== null && medicalContext.has_confirmed_facts;

      const explanationBundle = buildRankedExplanationBundle(annotatedCandidates, {
        analyzed_from: pipelineResult.analyzed_from,
        analyzed_to: pipelineResult.analyzed_to,
        input_day_count: pipelineResult.input_day_count,
        has_medical_context: hasMedicalContext,
      });

      setInsights({
        candidates: annotatedCandidates,
        explanationBundle,
        llmInput: buildLLMExplanationInput(explanationBundle),
        input_day_count: pipelineResult.input_day_count,
        analyzed_from: pipelineResult.analyzed_from,
        analyzed_to: pipelineResult.analyzed_to,
        medical_context_applied: hasMedicalContext,
      });
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
