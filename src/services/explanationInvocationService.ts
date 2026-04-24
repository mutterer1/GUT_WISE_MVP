import type { LLMExplanationInput } from '../types/llmExplanationContract';
import type { ExplanationInvocationResponse } from '../types/explanationInvocation';
import { withRetry } from '../utils/retryHelper';

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-insight-explanations`;
const REQUEST_TIMEOUT_MS = 30_000;

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

export async function invokeExplanationGeneration(
  llmInput: LLMExplanationInput,
  accessToken: string,
): Promise<ExplanationInvocationResponse> {
  return withRetry(() => attemptInvocation(llmInput, accessToken), {
    maxRetries: 2,
    initialDelay: 1500,
    maxDelay: 6000,
    shouldRetry: shouldRetryEdgeFunction,
  });
}
