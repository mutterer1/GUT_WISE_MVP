import { assembleRankedInsightInputsForDateRange } from './rankedInsightsAssembler';
import {
  runRankedInsightPipeline,
  type CandidateEvidenceGapSummary,
} from '../lib/insightCandidates/runRankedInsightPipeline';
import { applyMedicalContextModifiers } from '../lib/insightCandidates/applyMedicalContextModifiers';
import { buildRankedExplanationBundle } from '../lib/insightCandidates/buildRankedExplanationBundle';
import { fetchMedicalContextSummary } from './medicalContextService';
import type { RankedExplanationBundle } from '../types/explanationBundle';
import type { MedicalContextAnnotatedCandidate } from '../types/insightCandidates';

export interface ReportInsightDateRange {
  startDate: string;
  endDate: string;
}

export interface ReportInsightSummary {
  candidates: MedicalContextAnnotatedCandidate[];
  explanationBundle: RankedExplanationBundle;
  input_day_count: number;
  analyzed_from: string | null;
  analyzed_to: string | null;
  medical_context_applied: boolean;
  evidence_gap_summaries: CandidateEvidenceGapSummary[];
  missing_log_types: string[];
}

export async function fetchReportInsightSummary(
  userId: string,
  dateRange: ReportInsightDateRange
): Promise<ReportInsightSummary> {
  const [inputs, medicalContext] = await Promise.all([
    assembleRankedInsightInputsForDateRange(userId, dateRange.startDate, dateRange.endDate),
    fetchMedicalContextSummary(userId).catch(() => null),
  ]);

  if (!inputs) {
    const emptyBundle = buildRankedExplanationBundle([], {
      top_n: 0,
      analyzed_from: dateRange.startDate,
      analyzed_to: dateRange.endDate,
      input_day_count: 0,
      has_medical_context: false,
    });

    return {
      candidates: [],
      explanationBundle: emptyBundle,
      input_day_count: 0,
      analyzed_from: dateRange.startDate,
      analyzed_to: dateRange.endDate,
      medical_context_applied: false,
      evidence_gap_summaries: [],
      missing_log_types: [],
    };
  }

  const pipelineResult = runRankedInsightPipeline({
    dailyFeatures: inputs.dailyFeatures,
    baselines: inputs.baselines,
  });

  const annotatedCandidates = applyMedicalContextModifiers(
    pipelineResult.candidates,
    medicalContext
  );

  const hasMedicalContext =
    medicalContext !== null &&
    (
      medicalContext.active_diagnoses.length > 0 ||
      medicalContext.suspected_conditions.length > 0 ||
      medicalContext.current_medications.length > 0 ||
      medicalContext.surgeries_procedures.length > 0 ||
      medicalContext.allergies_intolerances.length > 0 ||
      medicalContext.active_diet_guidance.length > 0 ||
      medicalContext.red_flag_history.length > 0 ||
      medicalContext.pending_candidates_count > 0
    );

  return {
    candidates: annotatedCandidates,
    explanationBundle: buildRankedExplanationBundle(annotatedCandidates, {
      analyzed_from: pipelineResult.analyzed_from,
      analyzed_to: pipelineResult.analyzed_to,
      input_day_count: pipelineResult.input_day_count,
      has_medical_context: hasMedicalContext,
    }),
    input_day_count: pipelineResult.input_day_count,
    analyzed_from: pipelineResult.analyzed_from,
    analyzed_to: pipelineResult.analyzed_to,
    medical_context_applied: hasMedicalContext,
    evidence_gap_summaries: pipelineResult.evidence_gap_summaries,
    missing_log_types: pipelineResult.missing_log_types,
  };
}