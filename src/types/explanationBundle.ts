import type {
  CandidateCategory,
  CandidateStatus,
  DataSufficiency,
  MedicalContextSource,
  PriorityTier,
} from './insightCandidates';

export type ContradictionLevel = 'none' | 'low' | 'moderate' | 'high';

export interface ContradictionSummary {
  count: number;
  exposure_count: number;
  ratio: number | null;
  level: ContradictionLevel;
}

export interface ExplanationEvidenceSummary {
  support_count: number;
  exposure_count: number;
  baseline_rate: number | null;
  exposed_rate: number | null;
  lift: number | null;
  contradiction: ContradictionSummary;
  statistics?: Record<string, unknown>;
}

export interface ExplanationInsightItem {
  insight_key: string;
  category: CandidateCategory;
  subtype: string;
  trigger_factors: string[];
  target_outcomes: string[];
  status: CandidateStatus;
  confidence_score: number | null;
  data_sufficiency: DataSufficiency;
  priority_score: number;
  priority_tier: PriorityTier;
  ranking_reasons: string[];
  evidence: ExplanationEvidenceSummary;
  analysis_window: {
    from: string;
    to: string;
  };
  medical_context_annotations: string[];
  medical_context_modifier_applied: boolean;
  medical_context_score_delta: number;
  medical_context_sources: MedicalContextSource[];
}

export interface RankedExplanationBundleMeta {
  top_n: number;
  total_candidates_available: number;
  analyzed_from: string | null;
  analyzed_to: string | null;
  input_day_count: number;
  has_medical_context: boolean;
  built_at: string;
}

export interface RankedExplanationBundle {
  items: ExplanationInsightItem[];
  meta: RankedExplanationBundleMeta;
}
