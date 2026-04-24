import type { LLMExplanationInput } from '../types/llmExplanationContract';
import type { ExplanationInvocationResponse } from '../types/explanationInvocation';
import type {
  ExplanationGenerationMeta,
  OutputValidationFlag,
  ValidationResult,
} from '../types/llmExplanationOutput';
import {
  buildMedicationValidationRetryInput,
} from '../lib/insightCandidates/buildLLMExplanationInput';
import { validateLLMExplanationOutput } from '../lib/insightCandidates/validateLLMExplanationOutput';
import { withRetry } from '../utils/retryHelper';

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-insight-explanations`;
const REQUEST_TIMEOUT_MS = 30_000;
const MEDICATION_RETRY_FLAG_TYPES = new Set([
  'medication_detail_unused',
  'medication_detail_invented',
]);

function shouldRetryEdgeFunction(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('timeout') ||
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504')
  );
}

async function attemptInvocation(
  llmInput: LLMExplanationInput,
  accessToken: string,
): Promise<ExplanationInvocationResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(llmInput),
      signal: controller.signal,
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 502 || status === 503 || status === 504) {
        throw new Error(`502: Edge function temporarily unavailable`);
      }
      throw new Error(`Edge function responded with status ${status}`);
    }

    const data: ExplanationInvocationResponse = await response.json();
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeInvocationResponse(
  llmInput: LLMExplanationInput,
  response: ExplanationInvocationResponse
): ExplanationInvocationResponse {
  if (!response.explanation_output) {
    return response;
  }

  const localValidation = validateLLMExplanationOutput(llmInput, response.explanation_output);
  const validationFlags = Array.from(
    new Set(localValidation.flags.map(flag => flag.type))
  ) as OutputValidationFlag[];

  return {
    ...response,
    explanation_output: {
      ...response.explanation_output,
      meta: {
        ...response.explanation_output.meta,
        validation_flags: validationFlags,
      },
    },
    validation: localValidation,
    success: response.success && localValidation.is_safe_to_use,
  };
}

function countMedicationValidationFlags(validation: ValidationResult): number {
  return validation.flags.filter(flag => MEDICATION_RETRY_FLAG_TYPES.has(flag.type)).length;
}

function extractMedicationWarningKeys(validation: ValidationResult): string[] {
  return Array.from(
    new Set(
      validation.flags
        .filter(flag => MEDICATION_RETRY_FLAG_TYPES.has(flag.type) && flag.insight_key)
        .map(flag => flag.insight_key as string)
    )
  );
}

function applyGenerationMeta(
  response: ExplanationInvocationResponse,
  generationMeta: ExplanationGenerationMeta
): ExplanationInvocationResponse {
  if (!response.explanation_output) {
    return response;
  }

  return {
    ...response,
    explanation_output: {
      ...response.explanation_output,
      meta: {
        ...response.explanation_output.meta,
        generation_meta: generationMeta,
      },
    },
  };
}

function shouldAttemptMedicationRetry(response: ExplanationInvocationResponse): boolean {
  return (
    response.success &&
    !!response.explanation_output &&
    countMedicationValidationFlags(response.validation) > 0
  );
}

function choosePreferredInvocationResponse(
  initial: ExplanationInvocationResponse,
  retried: ExplanationInvocationResponse
): ExplanationInvocationResponse {
  if (!retried.success || !retried.explanation_output) {
    return initial;
  }

  const initialMedicationFlags = countMedicationValidationFlags(initial.validation);
  const retriedMedicationFlags = countMedicationValidationFlags(retried.validation);

  if (retriedMedicationFlags < initialMedicationFlags) {
    return retried;
  }

  if (
    retriedMedicationFlags === initialMedicationFlags &&
    retried.validation.flags.length < initial.validation.flags.length
  ) {
    return retried;
  }

  return initial;
}

async function invokeWithTransportRetry(
  llmInput: LLMExplanationInput,
  accessToken: string,
): Promise<ExplanationInvocationResponse> {
  const response = await withRetry(() => attemptInvocation(llmInput, accessToken), {
    maxRetries: 2,
    initialDelay: 1500,
    maxDelay: 6000,
    shouldRetry: shouldRetryEdgeFunction,
  });

  return normalizeInvocationResponse(llmInput, response);
}

export async function invokeExplanationGeneration(
  llmInput: LLMExplanationInput,
  accessToken: string,
): Promise<ExplanationInvocationResponse> {
  const initialResponse = await invokeWithTransportRetry(llmInput, accessToken);
  const initialMedicationWarningCount = countMedicationValidationFlags(initialResponse.validation);
  const initialMedicationWarningKeys = extractMedicationWarningKeys(initialResponse.validation);

  if (!shouldAttemptMedicationRetry(initialResponse)) {
    return applyGenerationMeta(initialResponse, {
      generation_path: 'single_pass',
      medication_validation_retry_attempted: false,
      medication_validation_retry_applied: false,
      medication_validation_retry_improved: false,
      initial_medication_validation_warning_count: initialMedicationWarningCount,
      final_medication_validation_warning_count: initialMedicationWarningCount,
      retry_target_insight_keys: initialMedicationWarningKeys,
      remaining_medication_warning_keys: initialMedicationWarningKeys,
    });
  }

  const retryInput = buildMedicationValidationRetryInput(
    llmInput,
    initialResponse.validation
  );

  if (!retryInput) {
    return applyGenerationMeta(initialResponse, {
      generation_path: 'single_pass',
      medication_validation_retry_attempted: false,
      medication_validation_retry_applied: false,
      medication_validation_retry_improved: false,
      initial_medication_validation_warning_count: initialMedicationWarningCount,
      final_medication_validation_warning_count: initialMedicationWarningCount,
      retry_target_insight_keys: initialMedicationWarningKeys,
      remaining_medication_warning_keys: initialMedicationWarningKeys,
    });
  }

  try {
    const retriedResponse = await invokeWithTransportRetry(retryInput, accessToken);
    const chosenResponse = choosePreferredInvocationResponse(initialResponse, retriedResponse);
    const finalMedicationWarningCount = countMedicationValidationFlags(chosenResponse.validation);
    const finalMedicationWarningKeys = extractMedicationWarningKeys(chosenResponse.validation);
    const retryApplied = chosenResponse === retriedResponse;

    return applyGenerationMeta(chosenResponse, {
      generation_path: retryApplied
        ? 'medication_retry_selected'
        : 'medication_retry_discarded',
      medication_validation_retry_attempted: true,
      medication_validation_retry_applied: retryApplied,
      medication_validation_retry_improved:
        finalMedicationWarningCount < initialMedicationWarningCount,
      initial_medication_validation_warning_count: initialMedicationWarningCount,
      final_medication_validation_warning_count: finalMedicationWarningCount,
      retry_target_insight_keys: initialMedicationWarningKeys,
      remaining_medication_warning_keys: finalMedicationWarningKeys,
    });
  } catch {
    return applyGenerationMeta(initialResponse, {
      generation_path: 'medication_retry_discarded',
      medication_validation_retry_attempted: true,
      medication_validation_retry_applied: false,
      medication_validation_retry_improved: false,
      initial_medication_validation_warning_count: initialMedicationWarningCount,
      final_medication_validation_warning_count: initialMedicationWarningCount,
      retry_target_insight_keys: initialMedicationWarningKeys,
      remaining_medication_warning_keys: initialMedicationWarningKeys,
    });
  }
}
