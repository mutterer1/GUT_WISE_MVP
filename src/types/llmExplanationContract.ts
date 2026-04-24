import type { CandidateCategory, CandidateStatus, DataSufficiency, PriorityTier } from './insightCandidates';
import type {
  ContradictionLevel,
  ExplanationSignalSourceKind,
} from './explanationBundle';

export type ExplanationMode = 'structured_findings_only';

export interface ExplanationObjective {
  mode: ExplanationMode;
  task: 'explain_ranked_gut_health_findings';
  focus: 'top_ranked_items';
  audience: 'patient_facing';
}

export interface LLMEvidenceSummary {
  support_count: number;
  exposure_count: number;
  baseline_rate: number | null;
  exposed_rate: number | null;
  lift: number | null;
  contradiction_level: ContradictionLevel;
  statistics?: Record<string, unknown>;
}

export interface LLMInsightItem {
  insight_key: string;
  category: CandidateCategory;
  subtype: string;
  trigger_factors: string[];
  target_outcomes: string[];
  status: CandidateStatus;
  confidence_score: number | null;
  data_sufficiency: DataSufficiency;
  priority_tier: PriorityTier;
  priority_score: number;
  ranking_reasons: string[];
  evidence: LLMEvidenceSummary;
  analysis_window: { from: string; to: string };
  signal_source: {
    kind: ExplanationSignalSourceKind;
    summary: string;
    nutrition_coverage_ratio: number | null;
    nutrition_confidence: number | null;
    structured_food_coverage_ratio: number | null;
    ingredient_signal_confidence: number | null;
  };
  medical_context_annotations: string[];
  medical_context_modifier_applied: boolean;
  caution_signals: string[];
}

export interface LLMBundleMeta {
  item_count: number;
  total_candidates_available: number;
  analyzed_from: string | null;
  analyzed_to: string | null;
  input_day_count: number;
  has_medical_context: boolean;
}

export type ConstraintAllowed =
  | 'explain_structured_findings'
  | 'describe_observed_associations'
  | 'note_uncertainty_when_evidence_limited'
  | 'mention_caution_context_from_annotations'
  | 'prioritize_high_ranked_items'
  | 'use_calm_clinical_language';

export type ConstraintDisallowed =
  | 'invent_diagnoses'
  | 'claim_causation_beyond_evidence'
  | 'introduce_findings_not_in_bundle'
  | 'include_generic_wellness_filler'
  | 'reference_raw_logs_or_documents'
  | 'use_alarmist_language'
  | 'recommend_medications_or_treatments';

export interface LLMExplanationConstraintSet {
  allowed: ConstraintAllowed[];
  disallowed: ConstraintDisallowed[];
  uncertainty_behavior: 'acknowledge_and_continue';
  caution_behavior: 'include_only_when_annotation_present';
  evidence_floor: 'respect_data_sufficiency_field';
}

export interface LLMStyleGuidance {
  tone: 'calm_clinical';
  length: 'concise';
  format: 'per_item_explanation';
  prioritization: 'highest_ranked_first';
  avoid: string[];
}

export interface LLMSafetyNote {
  insight_key: string;
  note: string;
}

export interface LLMExplanationInput {
  objective: ExplanationObjective;
  bundle_meta: LLMBundleMeta;
  insight_items: LLMInsightItem[];
  constraints: LLMExplanationConstraintSet;
  style_guidance: LLMStyleGuidance;
  safety_notes: LLMSafetyNote[];
}
