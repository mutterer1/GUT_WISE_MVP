import { supabase } from '../lib/supabase';
import type { ExplanationInvocationResponse } from '../types/explanationInvocation';
import type { LLMExplanationOutput } from '../types/llmExplanationOutput';
import type { ValidationStatus } from '../types/llmExplanationOutput';

const CACHE_MAX_AGE_DAYS = 7;
const CACHE_MAX_AGE_MS = CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

const SAFE_STATUSES: ValidationStatus[] = ['valid', 'valid_with_warnings'];

export async function loadPersistedExplanation(
  userId: string,
  fingerprint: string,
): Promise<ExplanationInvocationResponse | null> {
  const { data, error } = await supabase
    .from('ranked_explanation_cache')
    .select('fingerprint, explanation_output, validation_status, item_count, updated_at')
    .eq('user_id', userId)
    .eq('fingerprint', fingerprint)
    .maybeSingle();

  if (error || !data) return null;

  const status = data.validation_status as ValidationStatus;
  if (!SAFE_STATUSES.includes(status)) return null;

  const ageMs = Date.now() - new Date(data.updated_at as string).getTime();
  if (ageMs > CACHE_MAX_AGE_MS) return null;

  return {
    success: true,
    explanation_output: data.explanation_output as LLMExplanationOutput,
    validation: {
      status,
      flags: [],
      is_safe_to_use: true,
    },
  };
}

export async function persistExplanation(
  userId: string,
  fingerprint: string,
  result: ExplanationInvocationResponse,
): Promise<void> {
  if (!result.success || !result.validation.is_safe_to_use || !result.explanation_output) return;

  const { explanation_output, validation } = result;
  const now = new Date().toISOString();

  await supabase.from('ranked_explanation_cache').upsert(
    {
      user_id: userId,
      fingerprint,
      explanation_output,
      validation_status: validation.status,
      item_count: explanation_output.meta.item_count,
      updated_at: now,
    },
    { onConflict: 'user_id,fingerprint' },
  );

  const cutoff = new Date(Date.now() - CACHE_MAX_AGE_MS).toISOString();
  await supabase
    .from('ranked_explanation_cache')
    .delete()
    .eq('user_id', userId)
    .lt('updated_at', cutoff);
}
