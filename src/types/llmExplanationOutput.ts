export type ExplanationOutputMode = 'structured_findings_only';

export type OutputValidationFlag =
  | 'item_count_mismatch'
  | 'missing_insight_key'
  | 'disallowed_field_present'
  | 'summary_empty'
  | 'caution_without_annotation';

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
