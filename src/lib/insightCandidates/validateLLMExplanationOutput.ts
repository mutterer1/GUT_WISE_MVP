import type { LLMExplanationInput } from '../../types/llmExplanationContract';
import type { LLMExplanationOutput } from '../../types/llmExplanationOutput';
import type { ValidationFlag, ValidationResult, ValidationStatus } from '../../types/llmExplanationOutput';

const INVALID_FLAG_TYPES = new Set<string>([
  'missing_item',
  'unexpected_item',
  'count_mismatch',
  'duplicate_item',
]);

type MedicationContextDescriptor = {
  canonical: string;
  aliases: string[];
};

const ROUTE_CONTEXT_DESCRIPTORS: MedicationContextDescriptor[] = [
  { canonical: 'oral', aliases: ['oral', 'by mouth'] },
  { canonical: 'topical', aliases: ['topical'] },
  { canonical: 'intravenous', aliases: ['intravenous', 'iv'] },
  { canonical: 'injection', aliases: ['injection', 'injectable', 'shot'] },
  { canonical: 'sublingual', aliases: ['sublingual', 'under tongue'] },
  { canonical: 'rectal', aliases: ['rectal', 'suppository'] },
  { canonical: 'nasal', aliases: ['nasal'] },
  { canonical: 'inhaled', aliases: ['inhaled', 'inhaler', 'inhalation'] },
];

const TIMING_CONTEXT_DESCRIPTORS: MedicationContextDescriptor[] = [
  { canonical: 'before meal', aliases: ['before meal', 'before meals', 'pre meal', 'premeal'] },
  { canonical: 'after meal', aliases: ['after meal', 'after meals', 'post meal', 'postmeal'] },
  { canonical: 'with food', aliases: ['with food', 'with meals', 'with a meal'] },
  { canonical: 'bedtime', aliases: ['bedtime'] },
  { canonical: 'morning', aliases: ['morning'] },
  { canonical: 'evening', aliases: ['evening'] },
];

const REGIMEN_CONTEXT_DESCRIPTORS: MedicationContextDescriptor[] = [
  { canonical: 'as needed', aliases: ['as needed', 'rescue use', 'prn'] },
  { canonical: 'scheduled', aliases: ['scheduled'] },
  { canonical: 'one time', aliases: ['one time', 'one time use', 'single dose'] },
  { canonical: 'off plan', aliases: ['off plan'] },
];

const DOSE_CONTEXT_PATTERN = /\b\d+(?:\.\d+)?\s?(?:mg|mcg|g|ml|units?)\b/g;

function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function addNeedle(needles: Set<string>, value: string | null | undefined): void {
  const normalized = normalizeText(value);
  if (normalized.length >= 3) {
    needles.add(normalized);
  }
}

function extractDoseMarkers(value: string | null | undefined): string[] {
  const normalized = normalizeText(value);
  return Array.from(new Set(normalized.match(DOSE_CONTEXT_PATTERN) ?? []));
}

function descriptorMatches(
  value: string | null | undefined,
  descriptor: MedicationContextDescriptor
): boolean {
  const normalized = normalizeText(value);
  return (
    normalized.length > 0 &&
    descriptor.aliases.some(alias => normalized.includes(normalizeText(alias)))
  );
}

function collectDescriptorNeedles(
  value: string | null | undefined,
  descriptors: MedicationContextDescriptor[]
): string[] {
  const needles = new Set<string>();

  for (const descriptor of descriptors) {
    if (descriptorMatches(value, descriptor)) {
      for (const alias of descriptor.aliases) {
        addNeedle(needles, alias);
      }
    }
  }

  return Array.from(needles);
}

function collectMedicationPrimaryNeedles(
  detail: NonNullable<LLMExplanationInput['insight_items'][number]['medication_reference_detail']>
): string[] {
  const needles = new Set<string>();

  for (const needle of collectDescriptorNeedles(detail.route, ROUTE_CONTEXT_DESCRIPTORS)) {
    needles.add(needle);
  }

  for (const needle of collectDescriptorNeedles(detail.timing_context, TIMING_CONTEXT_DESCRIPTORS)) {
    needles.add(needle);
  }

  for (const needle of collectDescriptorNeedles(detail.regimen_status, REGIMEN_CONTEXT_DESCRIPTORS)) {
    needles.add(needle);
  }

  for (const doseMarker of extractDoseMarkers(detail.dose_context)) {
    needles.add(doseMarker);
  }

  return Array.from(needles);
}

function collectMedicationGeneralNeedles(
  detail: NonNullable<LLMExplanationInput['insight_items'][number]['medication_reference_detail']>
): string[] {
  const needles = new Set<string>();

  addNeedle(needles, detail.label);
  addNeedle(needles, detail.family);
  addNeedle(needles, detail.route);
  addNeedle(needles, detail.timing_context);
  addNeedle(needles, detail.regimen_status);

  for (const needle of collectMedicationPrimaryNeedles(detail)) {
    needles.add(needle);
  }

  return Array.from(needles);
}

function containsAnyNeedle(normalizedText: string, needles: string[]): boolean {
  return needles.some(needle => normalizedText.includes(needle));
}

function findMentionedMedicationContexts(
  normalizedText: string,
  descriptors: MedicationContextDescriptor[]
): Set<string> {
  return new Set(
    descriptors
      .filter(descriptor =>
        descriptor.aliases.some(alias => normalizedText.includes(normalizeText(alias)))
      )
      .map(descriptor => descriptor.canonical)
  );
}

function findSupportedMedicationContexts(
  value: string | null | undefined,
  descriptors: MedicationContextDescriptor[]
): Set<string> {
  return new Set(
    descriptors
      .filter(descriptor => descriptorMatches(value, descriptor))
      .map(descriptor => descriptor.canonical)
  );
}

function collectInventedMedicationContextLabels(
  normalizedText: string,
  detail: NonNullable<LLMExplanationInput['insight_items'][number]['medication_reference_detail']>
): string[] {
  const unsupportedLabels = new Set<string>();

  const routeMentions = findMentionedMedicationContexts(normalizedText, ROUTE_CONTEXT_DESCRIPTORS);
  const supportedRoutes = findSupportedMedicationContexts(detail.route, ROUTE_CONTEXT_DESCRIPTORS);
  for (const route of routeMentions) {
    if (!supportedRoutes.has(route)) {
      unsupportedLabels.add(`route:${route}`);
    }
  }

  const timingMentions = findMentionedMedicationContexts(normalizedText, TIMING_CONTEXT_DESCRIPTORS);
  const supportedTimings = findSupportedMedicationContexts(
    detail.timing_context,
    TIMING_CONTEXT_DESCRIPTORS
  );
  for (const timing of timingMentions) {
    if (!supportedTimings.has(timing)) {
      unsupportedLabels.add(`timing:${timing}`);
    }
  }

  const regimenMentions = findMentionedMedicationContexts(
    normalizedText,
    REGIMEN_CONTEXT_DESCRIPTORS
  );
  const supportedRegimens = findSupportedMedicationContexts(
    detail.regimen_status,
    REGIMEN_CONTEXT_DESCRIPTORS
  );
  for (const regimen of regimenMentions) {
    if (!supportedRegimens.has(regimen)) {
      unsupportedLabels.add(`regimen:${regimen}`);
    }
  }

  const outputDoseMarkers = extractDoseMarkers(normalizedText);
  if (outputDoseMarkers.length > 0) {
    const supportedDoseMarkers = new Set(extractDoseMarkers(detail.dose_context));
    for (const doseMarker of outputDoseMarkers) {
      if (!supportedDoseMarkers.has(doseMarker)) {
        unsupportedLabels.add(`dose:${doseMarker}`);
      }
    }
  }

  return Array.from(unsupportedLabels);
}

export function validateLLMExplanationOutput(
  input: LLMExplanationInput,
  output: LLMExplanationOutput
): ValidationResult {
  const flags: ValidationFlag[] = [];

  const inputItemsByKey = new Map(input.insight_items.map(item => [item.insight_key, item]));
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
    const inputItem = inputItemsByKey.get(exp.insight_key);

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

    const medicationDetail = inputItem?.medication_reference_detail;
    if (!medicationDetail) {
      continue;
    }

    const explanationText = normalizeText(
      [
        exp.summary,
        exp.evidence_statement,
        exp.uncertainty_statement,
        exp.caution_statement,
      ]
        .filter(Boolean)
        .join(' ')
    );

    const primaryNeedles = collectMedicationPrimaryNeedles(medicationDetail);
    const generalNeedles = collectMedicationGeneralNeedles(medicationDetail);
    const missingHighSignalDetail =
      (primaryNeedles.length > 0 && !containsAnyNeedle(explanationText, primaryNeedles)) ||
      (primaryNeedles.length === 0 &&
        generalNeedles.length > 0 &&
        !containsAnyNeedle(explanationText, generalNeedles));

    if (missingHighSignalDetail) {
      flags.push({
        type: 'medication_detail_unused',
        insight_key: exp.insight_key,
        detail: 'medication_reference_detail was available but the explanation did not reflect the available medication context',
      });
    }

    const inventedMedicationContexts = collectInventedMedicationContextLabels(
      explanationText,
      medicationDetail
    );
    if (inventedMedicationContexts.length > 0) {
      flags.push({
        type: 'medication_detail_invented',
        insight_key: exp.insight_key,
        detail: `unsupported medication context referenced: ${inventedMedicationContexts.join(', ')}`,
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
