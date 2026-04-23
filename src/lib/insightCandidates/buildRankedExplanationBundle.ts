import type { MedicalContextAnnotatedCandidate } from '../../types/insightCandidates';
import type {
  ContradictionLevel,
  ContradictionSummary,
  ExplanationEvidenceSummary,
  ExplanationInsightItem,
  RankedExplanationBundle,
  RankedExplanationBundleMeta,
} from '../../types/explanationBundle';

const DEFAULT_TOP_N = 5;

export interface BuildRankedExplanationBundleOptions {
  top_n?: number;
  analyzed_from?: string | null;
  analyzed_to?: string | null;
  input_day_count?: number;
  has_medical_context?: boolean;
}

function deriveContradictionLevel(ratio: number | null): ContradictionLevel {
  if (ratio === null || ratio === 0) return 'none';
  if (ratio < 0.15) return 'low';
  if (ratio < 0.35) return 'moderate';
  return 'high';
}

function buildContradictionSummary(
  contradiction_count: number,
  exposure_count: number
): ContradictionSummary {
  const ratio =
    exposure_count > 0 ? Math.round((contradiction_count / exposure_count) * 1000) / 1000 : null;
  return {
    count: contradiction_count,
    exposure_count,
    ratio,
    level: deriveContradictionLevel(ratio),
  };
}

function buildEvidenceSummary(
  c: MedicalContextAnnotatedCandidate
): ExplanationEvidenceSummary {
  const { support_count, exposure_count, contradiction_count, baseline_rate, exposed_rate, lift, statistics } =
    c.evidence;
  return {
    support_count,
    exposure_count,
    baseline_rate,
    exposed_rate,
    lift,
    contradiction: buildContradictionSummary(contradiction_count, exposure_count),
    ...(statistics !== undefined ? { statistics } : {}),
  };
}

function toExplanationItem(c: MedicalContextAnnotatedCandidate): ExplanationInsightItem {
  return {
    insight_key: c.insight_key,
    category: c.category,
    subtype: c.subtype,
    trigger_factors: c.trigger_factors,
    target_outcomes: c.target_outcomes,
    status: c.status,
    confidence_score: c.confidence_score,
    data_sufficiency: c.data_sufficiency,
    priority_score: c.priority_score,
    priority_tier: c.priority_tier,
    ranking_reasons: c.ranking_reasons,
    evidence: buildEvidenceSummary(c),
    analysis_window: {
      from: c.created_from_start_date,
      to: c.created_from_end_date,
    },
    medical_context_annotations: c.medical_context_annotations,
    medical_context_modifier_applied: c.medical_context_modifier_applied,
    medical_context_score_delta: c.medical_context_score_delta,
    medical_context_sources: c.medical_context_sources,
  };
}

export function buildRankedExplanationBundle(
  candidates: MedicalContextAnnotatedCandidate[],
  options: BuildRankedExplanationBundleOptions = {}
): RankedExplanationBundle {
  const {
    top_n = DEFAULT_TOP_N,
    analyzed_from = null,
    analyzed_to = null,
    input_day_count = 0,
    has_medical_context = false,
  } = options;

  const selected = candidates.slice(0, top_n);
  const items = selected.map(toExplanationItem);

  const meta: RankedExplanationBundleMeta = {
    top_n: items.length,
    total_candidates_available: candidates.length,
    analyzed_from,
    analyzed_to,
    input_day_count,
    has_medical_context,
    built_at: new Date().toISOString(),
  };

  return { items, meta };
}
