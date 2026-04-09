import type { LLMExplanationInput } from '../types/llmExplanationContract';
import type { ExplanationInvocationResponse } from '../types/explanationInvocation';

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-insight-explanations`;

export async function invokeExplanationGeneration(
  llmInput: LLMExplanationInput,
  accessToken: string,
): Promise<ExplanationInvocationResponse> {
  const response = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(llmInput),
  });

  if (!response.ok) {
    throw new Error(`Edge function responded with status ${response.status}`);
  }

  const data: ExplanationInvocationResponse = await response.json();
  return data;
}
