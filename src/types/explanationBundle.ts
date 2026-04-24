import type {
  CandidateCategory,
  CandidateStatus,
  DataSufficiency,
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

export type ExplanationSignalSourceKind =
  | 'reviewed_nutrition'
  | 'structured_ingredients'
  | 'mixed_structured_and_nutrition'
  | 'reviewed_medication_reference'
  | 'fallback_medication_heuristic'
  | 'fallback_heuristic'
  | 'generic_logs';

export interface ExplanationSignalSourceSummary {
  kind: ExplanationSignalSourceKind;
  summary: string;
  nutrition_coverage_ratio: number | null;
  nutrition_confidence: number | null;
  structured_food_coverage_ratio: number | null;
  ingredient_signal_confidence: number | null;
  medication_coverage_ratio: number | null;
  medication_signal_confidence: number | null;
  structured_medication_profile_ratio: number | null;
}

export interface ExplanationMedicationReferenceDetail {
  label: string;
  family: string | null;
  route: string | null;
  timing_context: string | null;
  regimen_status: string | null;
  dose_context: string | null;
  summary: string;
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
  signal_source: ExplanationSignalSourceSummary;
  medication_reference_detail: ExplanationMedicationReferenceDetail | null;
  medical_context_annotations: string[];
  medical_context_modifier_applied: boolean;
  medical_context_score_delta: number;
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
