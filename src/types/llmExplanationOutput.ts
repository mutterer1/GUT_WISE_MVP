export type ExplanationOutputMode = 'structured_findings_only';

export type OutputValidationFlag =
  | 'missing_item'
  | 'duplicate_item'
  | 'unexpected_item'
  | 'count_mismatch'
  | 'empty_field'
  | 'invalid_rank'
  | 'caution_mismatch'
  | 'item_count_mismatch'
  | 'missing_insight_key'
  | 'disallowed_field_present'
  | 'summary_empty'
  | 'caution_without_annotation'
  | 'medication_detail_unused'
  | 'medication_detail_invented';

export type ValidationStatus = 'valid' | 'valid_with_warnings' | 'invalid';

export interface ValidationFlag {
  type: OutputValidationFlag;
  insight_key?: string;
  detail?: string;
}

export interface ValidationResult {
  status: ValidationStatus;
  flags: ValidationFlag[];
  is_safe_to_use: boolean;
}

export interface LLMPerItemExplanation {
  insight_key: string;
  display_rank: number;
  summary: string;
  evidence_statement: string;
  uncertainty_statement: string;
  caution_statement?: string;
}

export interface ExplanationGenerationMeta {
  generation_path:
    | 'single_pass'
    | 'medication_retry_selected'
    | 'medication_retry_discarded';
  medication_validation_retry_attempted: boolean;
  medication_validation_retry_applied: boolean;
  medication_validation_retry_improved: boolean;
  initial_medication_validation_warning_count: number;
  final_medication_validation_warning_count: number;
  retry_target_insight_keys: string[];
  remaining_medication_warning_keys: string[];
}

export interface LLMExplanationMeta {
  generated_at: string;
  item_count: number;
  explanation_mode: ExplanationOutputMode;
  validation_flags: OutputValidationFlag[];
  generation_meta?: ExplanationGenerationMeta;
}

export interface LLMExplanationOutput {
  explanations: LLMPerItemExplanation[];
  meta: LLMExplanationMeta;
}
