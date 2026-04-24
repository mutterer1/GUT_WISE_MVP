import type { ExplanationInsightItem, RankedExplanationBundle } from '../../types/explanationBundle';
import type {
  LLMBundleMeta,
  LLMEvidenceSummary,
  LLMExplanationConstraintSet,
  LLMExplanationInput,
  LLMInsightItem,
  LLMSafetyNote,
  LLMStyleGuidance,
} from '../../types/llmExplanationContract';
import type { ValidationResult } from '../../types/llmExplanationOutput';

const OBJECTIVE: LLMExplanationInput['objective'] = {
  mode: 'structured_findings_only',
  task: 'explain_ranked_gut_health_findings',
  focus: 'top_ranked_items',
  audience: 'patient_facing',
};

const CONSTRAINTS: LLMExplanationConstraintSet = {
  allowed: [
    'explain_structured_findings',
    'describe_observed_associations',
    'note_uncertainty_when_evidence_limited',
    'mention_caution_context_from_annotations',
    'prioritize_high_ranked_items',
    'use_calm_clinical_language',
  ],
  disallowed: [
    'invent_diagnoses',
    'claim_causation_beyond_evidence',
    'introduce_findings_not_in_bundle',
    'include_generic_wellness_filler',
    'reference_raw_logs_or_documents',
    'use_alarmist_language',
    'recommend_medications_or_treatments',
  ],
  uncertainty_behavior: 'acknowledge_and_continue',
  caution_behavior: 'include_only_when_annotation_present',
  evidence_floor: 'respect_data_sufficiency_field',
};

const STYLE_GUIDANCE: LLMStyleGuidance = {
  tone: 'calm_clinical',
  length: 'concise',
  format: 'per_item_explanation',
  prioritization: 'highest_ranked_first',
  avoid: [
    'generic_advice',
    'unsupported_causal_claims',
    'medical_diagnoses',
    'alarmist_phrasing',
  ],
};

const MEDICATION_RETRY_FLAG_TYPES = new Set([
  'medication_detail_unused',
  'medication_detail_invented',
]);

function buildEvidenceSummary(item: ExplanationInsightItem): LLMEvidenceSummary {
  return {
    support_count: item.evidence.support_count,
    exposure_count: item.evidence.exposure_count,
    baseline_rate: item.evidence.baseline_rate,
    exposed_rate: item.evidence.exposed_rate,
    lift: item.evidence.lift,
    contradiction_level: item.evidence.contradiction.level,
    ...(item.evidence.statistics !== undefined ? { statistics: item.evidence.statistics } : {}),
  };
}

function deriveCautionSignals(item: ExplanationInsightItem): string[] {
  const signals: string[] = [];
  if (item.data_sufficiency === 'insufficient' || item.data_sufficiency === 'partial') {
    signals.push(`limited_evidence:${item.data_sufficiency}`);
  }
  if (item.evidence.contradiction.level === 'moderate' || item.evidence.contradiction.level === 'high') {
    signals.push(`contradictions:${item.evidence.contradiction.level}`);
  }
  if (item.status === 'insufficient' || item.status === 'exploratory') {
    signals.push(`candidate_status:${item.status}`);
  }
  if (item.confidence_score !== null && item.confidence_score < 0.4) {
    signals.push('low_confidence_score');
  }
  if (item.signal_source.kind === 'fallback_heuristic') {
    signals.push('heuristic_food_signal');
  }
  if (item.signal_source.kind === 'fallback_medication_heuristic') {
    signals.push('heuristic_medication_signal');
  }
  if (
    item.signal_source.nutrition_coverage_ratio !== null &&
    item.signal_source.nutrition_coverage_ratio < 0.65
  ) {
    signals.push('nutrition_coverage_partial');
  }
  if (
    item.signal_source.structured_food_coverage_ratio !== null &&
    item.signal_source.structured_food_coverage_ratio < 0.65
  ) {
    signals.push('ingredient_structure_partial');
  }
  if (
    item.signal_source.nutrition_confidence !== null &&
    item.signal_source.nutrition_confidence < 0.6
  ) {
    signals.push('nutrition_confidence_low');
  }
  if (
    item.signal_source.ingredient_signal_confidence !== null &&
    item.signal_source.ingredient_signal_confidence < 0.6
  ) {
    signals.push('ingredient_signal_confidence_low');
  }
  if (
    item.signal_source.medication_coverage_ratio !== null &&
    item.signal_source.medication_coverage_ratio < 0.65
  ) {
    signals.push('medication_coverage_partial');
  }
  if (
    item.signal_source.medication_signal_confidence !== null &&
    item.signal_source.medication_signal_confidence < 0.6
  ) {
    signals.push('medication_signal_confidence_low');
  }
  if (
    item.signal_source.structured_medication_profile_ratio !== null &&
    item.signal_source.structured_medication_profile_ratio < 0.65
  ) {
    signals.push('medication_profile_structure_partial');
  }
  return signals;
}

function toInsightItem(item: ExplanationInsightItem): LLMInsightItem {
  return {
    insight_key: item.insight_key,
    category: item.category,
    subtype: item.subtype,
    trigger_factors: item.trigger_factors,
    target_outcomes: item.target_outcomes,
    status: item.status,
    confidence_score: item.confidence_score,
    data_sufficiency: item.data_sufficiency,
    priority_tier: item.priority_tier,
    priority_score: item.priority_score,
    ranking_reasons: item.ranking_reasons,
    evidence: buildEvidenceSummary(item),
    analysis_window: item.analysis_window,
    signal_source: item.signal_source,
    medication_reference_detail: item.medication_reference_detail,
    medical_context_annotations: item.medical_context_annotations,
    medical_context_modifier_applied: item.medical_context_modifier_applied,
    caution_signals: deriveCautionSignals(item),
  };
}

function buildSafetyNotes(items: ExplanationInsightItem[]): LLMSafetyNote[] {
  const notes: LLMSafetyNote[] = [];
  for (const item of items) {
    const signals = deriveCautionSignals(item);
    if (signals.length > 0) {
      notes.push({
        insight_key: item.insight_key,
        note: `Caution: ${signals.join(', ')}. Explanation must acknowledge limited evidence where applicable.`,
      });
    }
  }
  return notes;
}

function buildBundleMeta(bundle: RankedExplanationBundle): LLMBundleMeta {
  return {
    item_count: bundle.items.length,
    total_candidates_available: bundle.meta.total_candidates_available,
    analyzed_from: bundle.meta.analyzed_from,
    analyzed_to: bundle.meta.analyzed_to,
    input_day_count: bundle.meta.input_day_count,
    has_medical_context: bundle.meta.has_medical_context,
  };
}

export function buildLLMExplanationInput(bundle: RankedExplanationBundle): LLMExplanationInput {
  return {
    objective: OBJECTIVE,
    bundle_meta: buildBundleMeta(bundle),
    insight_items: bundle.items.map(toInsightItem),
    constraints: CONSTRAINTS,
    style_guidance: STYLE_GUIDANCE,
    safety_notes: buildSafetyNotes(bundle.items),
  };
}

function formatMedicationRetryDetail(
  detail: NonNullable<LLMInsightItem['medication_reference_detail']>
): string {
  return [
    `label=${detail.label}`,
    `family=${detail.family ?? 'unspecified'}`,
    `route=${detail.route ?? 'unspecified'}`,
    `timing=${detail.timing_context ?? 'unspecified'}`,
    `regimen=${detail.regimen_status ?? 'unspecified'}`,
    `dose=${detail.dose_context ?? 'unspecified'}`,
  ].join('; ');
}

function buildMedicationRetryNote(
  item: LLMInsightItem,
  flagTypes: Set<string>
): string | null {
  const detail = item.medication_reference_detail;
  if (!detail) return null;

  const instructions: string[] = [];

  if (flagTypes.has('medication_detail_unused')) {
    instructions.push(
      'Use the available medication_reference_detail directly in plain language instead of generic medication wording.'
    );
  }

  if (flagTypes.has('medication_detail_invented')) {
    instructions.push(
      'Do not mention any medication route, timing, regimen, or dose that is not present in medication_reference_detail.'
    );
  }

  instructions.push(
    `Allowed medication detail for this item: ${formatMedicationRetryDetail(detail)}.`
  );

  return `Retry requirement: ${instructions.join(' ')}`;
}

export function buildMedicationValidationRetryInput(
  input: LLMExplanationInput,
  validation: ValidationResult
): LLMExplanationInput | null {
  const flaggedByKey = new Map<string, Set<string>>();

  for (const flag of validation.flags) {
    if (!flag.insight_key || !MEDICATION_RETRY_FLAG_TYPES.has(flag.type)) continue;

    const existing = flaggedByKey.get(flag.insight_key) ?? new Set<string>();
    existing.add(flag.type);
    flaggedByKey.set(flag.insight_key, existing);
  }

  if (flaggedByKey.size === 0) {
    return null;
  }

  const safetyNotesByKey = new Map(input.safety_notes.map(note => [note.insight_key, note.note]));
  let changed = false;

  for (const item of input.insight_items) {
    const flagTypes = flaggedByKey.get(item.insight_key);
    if (!flagTypes) continue;

    const retryNote = buildMedicationRetryNote(item, flagTypes);
    if (!retryNote) continue;

    const existing = safetyNotesByKey.get(item.insight_key);
    safetyNotesByKey.set(
      item.insight_key,
      existing ? `${existing} ${retryNote}` : retryNote
    );
    changed = true;
  }

  if (!changed) {
    return null;
  }

  const updatedSafetyNotes: LLMSafetyNote[] = [];
  for (const item of input.insight_items) {
    const note = safetyNotesByKey.get(item.insight_key);
    if (note) {
      updatedSafetyNotes.push({
        insight_key: item.insight_key,
        note,
      });
    }
  }

  return {
    ...input,
    style_guidance: {
      ...input.style_guidance,
      avoid: Array.from(
        new Set([
          ...input.style_guidance.avoid,
          'generic_medication_wording',
          'unsupported_medication_detail',
        ])
      ),
    },
    safety_notes: updatedSafetyNotes,
  };
}
