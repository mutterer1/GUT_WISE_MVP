import type { LLMExplanationInput } from '../../types/llmExplanationContract';
import type { LLMExplanationOutput } from '../../types/llmExplanationOutput';
import type { ValidationFlag, ValidationResult, ValidationStatus } from '../../types/llmExplanationOutput';

const INVALID_FLAG_TYPES = new Set<string>([
  'missing_item',
  'unexpected_item',
  'count_mismatch',
  'duplicate_item',
]);

export function validateLLMExplanationOutput(
  input: LLMExplanationInput,
  output: LLMExplanationOutput
): ValidationResult {
  const flags: ValidationFlag[] = [];

  const expectedKeys = new Set(input.insight_items.map(i => i.insight_key));
  const cautionKeySet = new Set(
    input.insight_items
      .filter(i => i.caution_signals.length > 0)
      .map(i => i.insight_key)
  );

  const seenKeys = new Map<string, number>();
  for (const exp of output.explanations) {
    seenKeys.set(exp.insight_key, (seenKeys.get(exp.insight_key) ?? 0) + 1);
  }

  for (const [key, count] of seenKeys) {
    if (count > 1) {
      flags.push({ type: 'duplicate_item', insight_key: key, detail: `appears ${count} times` });
    }
  }

  for (const key of expectedKeys) {
    if (!seenKeys.has(key)) {
      flags.push({ type: 'missing_item', insight_key: key });
    }
  }

  for (const key of seenKeys.keys()) {
    if (!expectedKeys.has(key)) {
      flags.push({ type: 'unexpected_item', insight_key: key });
    }
  }

  const expectedCount = input.bundle_meta.item_count;
  const actualCount = output.explanations.length;

  if (expectedCount !== actualCount) {
    flags.push({
      type: 'count_mismatch',
      detail: `bundle_meta.item_count=${expectedCount} vs explanations.length=${actualCount}`,
    });
  }

  if (output.meta.item_count !== actualCount) {
    flags.push({
      type: 'count_mismatch',
      detail: `meta.item_count=${output.meta.item_count} vs explanations.length=${actualCount}`,
    });
  }

  const ranks = output.explanations.map(e => e.display_rank);
  const uniqueRanks = new Set(ranks);

  if (uniqueRanks.size !== ranks.length) {
    flags.push({ type: 'invalid_rank', detail: 'duplicate display_rank values' });
  }

  const n = output.explanations.length;
  let rankRangeViolation = false;
  for (const rank of uniqueRanks) {
    if (!Number.isInteger(rank) || rank < 1 || rank > n) {
      rankRangeViolation = true;
      break;
    }
  }
  if (rankRangeViolation) {
    flags.push({ type: 'invalid_rank', detail: `display_rank values must be unique integers in [1..${n}]` });
  }

  for (const exp of output.explanations) {
    if (!exp.summary?.trim()) {
      flags.push({ type: 'empty_field', insight_key: exp.insight_key, detail: 'summary' });
    }
    if (!exp.evidence_statement?.trim()) {
      flags.push({ type: 'empty_field', insight_key: exp.insight_key, detail: 'evidence_statement' });
    }
    if (!exp.uncertainty_statement?.trim()) {
      flags.push({ type: 'empty_field', insight_key: exp.insight_key, detail: 'uncertainty_statement' });
    }
    if (exp.caution_statement !== undefined && !cautionKeySet.has(exp.insight_key)) {
      flags.push({
        type: 'caution_mismatch',
        insight_key: exp.insight_key,
        detail: 'caution_statement present but no caution_signals in input',
      });
    }
  }

  const hasInvalidFlag = flags.some(f => INVALID_FLAG_TYPES.has(f.type));
  const status: ValidationStatus = hasInvalidFlag
    ? 'invalid'
    : flags.length > 0
    ? 'valid_with_warnings'
    : 'valid';

  return {
    status,
    flags,
    is_safe_to_use: status !== 'invalid',
  };
}
