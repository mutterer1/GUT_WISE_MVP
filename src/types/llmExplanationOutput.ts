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

export interface LLMExplanationMeta {
  generated_at: string;
  item_count: number;
  explanation_mode: ExplanationOutputMode;
  validation_flags: OutputValidationFlag[];
}

export interface LLMExplanationOutput {
  explanations: LLMPerItemExplanation[];
  meta: LLMExplanationMeta;
}
