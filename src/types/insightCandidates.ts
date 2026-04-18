export type CandidateCategory =
  | 'sleep'
  | 'stress'
  | 'hydration'
  | 'food'
  | 'gut'
  | 'symptom'
  | 'routine'
  | 'cycle'
  | 'exercise'
  | 'medication'
  | 'multifactor'
  | 'protective'
  | 'recovery';

export type CandidateStatus =
  | 'insufficient'
  | 'exploratory'
  | 'emerging'
  | 'reliable';

export type DataSufficiency =
  | 'insufficient'
  | 'partial'
  | 'adequate'
  | 'strong';

export type PriorityTier = 'low' | 'medium' | 'high';

export type CandidateEvidenceQuality =
  | 'very_low'
  | 'low'
  | 'moderate'
  | 'high';

export interface CandidateEvidenceGap {
  type:
    | 'missing_exposure_days'
    | 'missing_baseline_days'
    | 'missing_overlap'
    | 'high_contradiction'
    | 'stale_pattern'
    | 'narrow_signal';
  message: string;
}

export interface CandidateEvidence {
  support_count: number;
  exposure_count: number;
  contradiction_count: number;
  baseline_rate: number | null;
  exposed_rate: number | null;
  lift: number | null;
  sample_dates: string[];

  contrast_count?: number;
  eligible_day_count?: number;
  exposed_day_count?: number;
  baseline_day_count?: number;
  contradiction_rate?: number | null;
  recency_weight?: number | null;
  evidence_quality?: CandidateEvidenceQuality;
  supporting_log_types?: string[];
  missing_log_types?: string[];
  exposed_dates?: string[];
  baseline_dates?: string[];
  uncertainty_statement?: string;
  evidence_gaps?: CandidateEvidenceGap[];
  notes?: string[];
  statistics?: Record<string, unknown>;
}

export interface InsightCandidate {
  user_id: string;
  insight_key: string;
  category: CandidateCategory;
  subtype: string;
  trigger_factors: string[];
  target_outcomes: string[];
  status: CandidateStatus;
  confidence_score: number | null;
  data_sufficiency: DataSufficiency;
  evidence: CandidateEvidence;
  created_from_start_date: string;
  created_from_end_date: string;
}

export interface PrioritizedInsightCandidate extends InsightCandidate {
  priority_score: number;
  priority_tier: PriorityTier;
  ranking_reasons: string[];
  not_enough_evidence_reasons?: string[];
}

export interface MedicalContextAnnotatedCandidate extends PrioritizedInsightCandidate {
  medical_context_annotations: string[];
  medical_context_modifier_applied: boolean;
  medical_context_score_delta: number;
}
