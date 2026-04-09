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

export interface CandidateEvidence {
  support_count: number;
  exposure_count: number;
  contradiction_count: number;
  baseline_rate: number | null;
  exposed_rate: number | null;
  lift: number | null;
  sample_dates: string[];
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

export type PriorityTier = 'low' | 'medium' | 'high';

export interface PrioritizedInsightCandidate extends InsightCandidate {
  priority_score: number;
  priority_tier: PriorityTier;
  ranking_reasons: string[];
}

export interface MedicalContextAnnotatedCandidate extends PrioritizedInsightCandidate {
  medical_context_annotations: string[];
  medical_context_modifier_applied: boolean;
  medical_context_score_delta: number;
}
