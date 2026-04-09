import type { LLMExplanationOutput, ValidationResult } from './llmExplanationOutput';

export interface ExplanationInvocationResponse {
  explanation_output?: LLMExplanationOutput;
  validation: ValidationResult;
  success: boolean;
  error?: string;
}
