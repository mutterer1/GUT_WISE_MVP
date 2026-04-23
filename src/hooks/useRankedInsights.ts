import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { assembleRankedInsightInputs } from '../services/rankedInsightsAssembler';
import {
  runRankedInsightPipeline,
  type CandidateEvidenceGapSummary,
} from '../lib/insightCandidates/runRankedInsightPipeline';
import { applyMedicalContextModifiers } from '../lib/insightCandidates/applyMedicalContextModifiers';
import { buildRankedExplanationBundle } from '../lib/insightCandidates/buildRankedExplanationBundle';
import { buildLLMExplanationInput } from '../lib/insightCandidates/buildLLMExplanationInput';
import { fetchMedicalContextSummary } from '../services/medicalContextService';
import { invokeExplanationGeneration } from '../services/explanationInvocationService';
import {
  loadPersistedExplanation,
  persistExplanation,
} from '../services/explanationPersistenceService';
import type { MedicalContextAnnotatedCandidate } from '../types/insightCandidates';
import type { RankedExplanationBundle } from '../types/explanationBundle';
import type { LLMExplanationInput } from '../types/llmExplanationContract';
import type { ExplanationInvocationResponse } from '../types/explanationInvocation';

export interface AnnotatedInsightResult {
  candidates: MedicalContextAnnotatedCandidate[];
  explanationBundle: RankedExplanationBundle;
  llmInput: LLMExplanationInput;
  input_day_count: number;
  analyzed_from: string | null;
  analyzed_to: string | null;
  medical_context_applied: boolean;
  evidence_gap_count: number;
  evidence_gap_summaries: CandidateEvidenceGapSummary[];
  missing_log_types: string[];
}

export type ExplanationOrigin = 'none' | 'cache' | 'live_generation';

export interface RankedInsightsState {
  insights: AnnotatedInsightResult | null;
  loading: boolean;
  error: string | null;
  firstRunCompleted: boolean;
  refresh: () => void;
  explanationResult: ExplanationInvocationResponse | null;
  explanationLoading: boolean;
  explanationError: string | null;
  explanationOrigin: ExplanationOrigin;
  generateExplanations: () => Promise<void>;
}

export interface UseRankedInsightsOptions {
  lookbackDays?: number;
  enabled?: boolean;
}

function hasAnyMedicalContext(summary: Awaited<ReturnType<typeof fetchMedicalContextSummary>>): boolean {
  return summary !== null && (
    summary.active_diagnoses.length > 0 ||
    summary.suspected_conditions.length > 0 ||
    summary.current_medications.length > 0 ||
    summary.surgeries_procedures.length > 0 ||
    summary.allergies_intolerances.length > 0 ||
    summary.active_diet_guidance.length > 0 ||
    summary.red_flag_history.length > 0 ||
    summary.pending_candidates_count > 0
  );
}

export function useRankedInsights(options: UseRankedInsightsOptions = {}): RankedInsightsState {
  const { lookbackDays = 90, enabled = true } = options;
  const { user } = useAuth();

  const [insights, setInsights] = useState<AnnotatedInsightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstRunCompleted, setFirstRunCompleted] = useState(false);
  const runId = useRef(0);
  const lastFingerprintRef = useRef<string>('');

  const [explanationResult, setExplanationResult] =
    useState<ExplanationInvocationResponse | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [explanationOrigin, setExplanationOrigin] = useState<ExplanationOrigin>('none');

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

        if (lastFingerprintRef.current !== '') {
          lastFingerprintRef.current = '';
          setExplanationResult(null);
          setExplanationError(null);
          setExplanationOrigin('none');
        }

        setInsights({
          candidates: [],
          explanationBundle: emptyBundle,
          llmInput: buildLLMExplanationInput(emptyBundle),
          input_day_count: 0,
          analyzed_from: null,
          analyzed_to: null,
          medical_context_applied: false,
          evidence_gap_count: 0,
          evidence_gap_summaries: [],
          missing_log_types: [],
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

      const hasMedicalContext = hasAnyMedicalContext(medicalContext);

      const explanationBundle = buildRankedExplanationBundle(annotatedCandidates, {
        analyzed_from: pipelineResult.analyzed_from,
        analyzed_to: pipelineResult.analyzed_to,
        input_day_count: pipelineResult.input_day_count,
        has_medical_context: hasMedicalContext,
      });

      const newFingerprint = annotatedCandidates
        .map((c, idx) =>
          [
            idx,
            c.insight_key,
            c.priority_score.toFixed(4),
            c.priority_tier,
            c.medical_context_modifier_applied ? '1' : '0',
            c.medical_context_score_delta.toFixed(4),
            c.medical_context_annotations.join('~'),
            c.medical_context_sources
              .map((source) => `${source.kind}/${source.context_type}/${source.label}`)
              .join('~'),
          ].join(':')
        )
        .join('|');

      if (newFingerprint !== lastFingerprintRef.current) {
        lastFingerprintRef.current = newFingerprint;
        setExplanationResult(null);
        setExplanationError(null);
        setExplanationOrigin('none');

        if (newFingerprint !== '') {
          const cached = await loadPersistedExplanation(user.id, newFingerprint);
          if (currentRun === runId.current && cached) {
            setExplanationResult(cached);
            setExplanationOrigin('cache');
          }
        }
      }

      if (currentRun !== runId.current) return;

      setInsights({
        candidates: annotatedCandidates,
        explanationBundle,
        llmInput: buildLLMExplanationInput(explanationBundle),
        input_day_count: pipelineResult.input_day_count,
        analyzed_from: pipelineResult.analyzed_from,
        analyzed_to: pipelineResult.analyzed_to,
        medical_context_applied: hasMedicalContext,
        evidence_gap_count: pipelineResult.evidence_gap_count,
        evidence_gap_summaries: pipelineResult.evidence_gap_summaries,
        missing_log_types: pipelineResult.missing_log_types,
      });
    } catch (err) {
      if (currentRun !== runId.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      if (currentRun === runId.current) {
        setLoading(false);
        setFirstRunCompleted(true);
      }
    }
  }, [user?.id, lookbackDays, enabled]);

  const generateExplanations = useCallback(async () => {
    const llmInput = insights?.llmInput ?? null;
    if (!llmInput) {
      setExplanationError('Insight analysis is not ready yet. Please try again in a moment.');
      return;
    }

    const session = await import('../lib/supabase').then((m) => m.supabase.auth.getSession());
    const accessToken = session.data.session?.access_token;
    if (!accessToken) {
      setExplanationError('Your session has expired. Please sign in again.');
      return;
    }

    setExplanationLoading(true);
    setExplanationError(null);

    try {
      const result = await invokeExplanationGeneration(llmInput, accessToken);
      if (!result.success) {
        setExplanationError(
          'Insight generation is temporarily unavailable. Your logs have been saved.'
        );
        return;
      }

      setExplanationResult(result);
      setExplanationOrigin('live_generation');

      if (result.validation.is_safe_to_use && user?.id && lastFingerprintRef.current) {
        persistExplanation(user.id, lastFingerprintRef.current, result).catch(() => undefined);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      const isTransient =
        msg.includes('timeout') ||
        msg.includes('network') ||
        msg.includes('fetch') ||
        msg.includes('502') ||
        msg.includes('503') ||
        msg.includes('504') ||
        msg.includes('aborted') ||
        msg.includes('unavailable');

      if (isTransient) {
        setExplanationError(
          'Insight generation is temporarily unavailable. Your logs have been saved - try again shortly.'
        );
      } else {
        setExplanationError('Unable to generate insights right now. Your logs have been saved.');
      }

      console.error('Explanation generation failed:', err);
    } finally {
      setExplanationLoading(false);
    }
  }, [insights, user?.id]);

  useEffect(() => {
    run();
  }, [run]);

  return {
    insights,
    loading,
    error,
    firstRunCompleted,
    refresh: run,
    explanationResult,
    explanationLoading,
    explanationError,
    explanationOrigin,
    generateExplanations,
  };
}
