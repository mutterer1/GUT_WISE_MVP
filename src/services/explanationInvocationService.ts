import type { LLMExplanationInput } from '../types/llmExplanationContract';
import type { ExplanationInvocationResponse } from '../types/explanationInvocation';
import type { ValidationResult } from '../types/llmExplanationOutput';
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

  return {
    ...response,
    validation: localValidation,
    success: response.success && localValidation.is_safe_to_use,
  };
}

function countMedicationValidationFlags(validation: ValidationResult): number {
  return validation.flags.filter(flag => MEDICATION_RETRY_FLAG_TYPES.has(flag.type)).length;
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

  if (!shouldAttemptMedicationRetry(initialResponse)) {
    return initialResponse;
  }

  const retryInput = buildMedicationValidationRetryInput(
    llmInput,
    initialResponse.validation
  );

  if (!retryInput) {
    return initialResponse;
  }

  try {
    const retriedResponse = await invokeWithTransportRetry(retryInput, accessToken);
    return choosePreferredInvocationResponse(initialResponse, retriedResponse);
  } catch {
    return initialResponse;
  }
}
