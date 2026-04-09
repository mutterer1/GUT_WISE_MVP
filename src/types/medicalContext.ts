export type MedicalFactCategory =
  | 'diagnosis'
  | 'suspected_condition'
  | 'medication'
  | 'surgery_procedure'
  | 'allergy_intolerance'
  | 'diet_guidance'
  | 'red_flag_history';

export type ConfirmationState =
  | 'confirmed'
  | 'user_reported'
  | 'candidate';

export type ProvenanceSource =
  | 'manual_entry'
  | 'document_extraction'
  | 'clinician_shared';

export interface FactProvenance {
  source: ProvenanceSource;
  entered_at: string;
  confirmed_at: string | null;
  source_document_id: string | null;
  notes: string | null;
}

export interface MedicalFactBase {
  id: string;
  user_id: string;
  category: MedicalFactCategory;
  confirmation_state: ConfirmationState;
  provenance: FactProvenance;
  is_active: boolean;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiagnosisFact extends MedicalFactBase {
  category: 'diagnosis';
  detail: {
    condition_name: string;
    icd_code: string | null;
    diagnosed_date: string | null;
    diagnosing_provider: string | null;
    severity: 'mild' | 'moderate' | 'severe' | null;
    gi_relevance: 'primary' | 'secondary' | 'indirect';
  };
}

export interface SuspectedConditionFact extends MedicalFactBase {
  category: 'suspected_condition';
  detail: {
    condition_name: string;
    suspicion_basis: string | null;
    under_investigation: boolean;
    gi_relevance: 'primary' | 'secondary' | 'indirect';
  };
}

export interface MedicationFact extends MedicalFactBase {
  category: 'medication';
  detail: {
    medication_name: string;
    dosage: string | null;
    frequency: string | null;
    prescribing_reason: string | null;
    gi_side_effects_known: boolean;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
  };
}

export interface SurgeryProcedureFact extends MedicalFactBase {
  category: 'surgery_procedure';
  detail: {
    procedure_name: string;
    procedure_date: string | null;
    body_region: string | null;
    gi_relevance: 'primary' | 'secondary' | 'indirect';
    complications: string | null;
  };
}

export interface AllergyIntoleranceFact extends MedicalFactBase {
  category: 'allergy_intolerance';
  detail: {
    substance: string;
    reaction_type: 'allergy' | 'intolerance' | 'sensitivity';
    severity: 'mild' | 'moderate' | 'severe' | 'life_threatening' | null;
    confirmed_by_testing: boolean;
    gi_symptoms: string[] | null;
  };
}

export interface DietGuidanceFact extends MedicalFactBase {
  category: 'diet_guidance';
  detail: {
    guidance_type: string;
    prescribed_by: string | null;
    prescribed_date: string | null;
    foods_to_avoid: string[] | null;
    foods_to_include: string[] | null;
    rationale: string | null;
    is_current: boolean;
  };
}

export interface RedFlagHistoryFact extends MedicalFactBase {
  category: 'red_flag_history';
  detail: {
    flag_type: string;
    description: string;
    occurrence_date: string | null;
    resolved: boolean;
    clinical_action_taken: string | null;
  };
}

export type MedicalFact =
  | DiagnosisFact
  | SuspectedConditionFact
  | MedicationFact
  | SurgeryProcedureFact
  | AllergyIntoleranceFact
  | DietGuidanceFact
  | RedFlagHistoryFact;

export interface MedicalFactRow {
  id: string;
  user_id: string;
  category: MedicalFactCategory;
  confirmation_state: ConfirmationState;
  detail: Record<string, unknown>;
  provenance_source: ProvenanceSource;
  provenance_entered_at: string;
  provenance_confirmed_at: string | null;
  provenance_source_document_id: string | null;
  provenance_notes: string | null;
  is_active: boolean;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalContextSummary {
  user_id: string;
  active_diagnoses: DiagnosisFact[];
  suspected_conditions: SuspectedConditionFact[];
  current_medications: MedicationFact[];
  surgeries_procedures: SurgeryProcedureFact[];
  allergies_intolerances: AllergyIntoleranceFact[];
  active_diet_guidance: DietGuidanceFact[];
  red_flag_history: RedFlagHistoryFact[];
  has_confirmed_facts: boolean;
  last_updated: string | null;
}

export type ConfirmedFactFilter = {
  categories?: MedicalFactCategory[];
  active_only?: boolean;
  confirmed_only?: boolean;
};

export type ProfileStatus = 'empty' | 'partial' | 'reviewed';

export interface MedicalContextProfileRow {
  id: string;
  user_id: string;
  profile_status: ProfileStatus;
  last_reviewed_at: string | null;
  has_red_flags: boolean;
  active_fact_count: number;
  caution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ExtractionSource =
  | 'document_extraction'
  | 'clinician_shared'
  | 'inference';

export type CandidateReviewStatus =
  | 'pending_review'
  | 'accepted'
  | 'rejected'
  | 'merged';

export interface CandidateMedicalFactRow {
  id: string;
  user_id: string;
  category: MedicalFactCategory;
  detail: Record<string, unknown>;
  extraction_source: ExtractionSource;
  source_document_id: string | null;
  extraction_confidence: number | null;
  extraction_notes: string | null;
  review_status: CandidateReviewStatus;
  reviewed_at: string | null;
  promoted_fact_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalContextProfile extends MedicalContextProfileRow {
  summary: MedicalContextSummary;
  pending_candidates_count: number;
}
