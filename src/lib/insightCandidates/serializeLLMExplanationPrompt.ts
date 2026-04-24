import type { LLMExplanationInput, LLMInsightItem } from '../../types/llmExplanationContract';

function serializeItem(item: LLMInsightItem, index: number): string {
  const sourceParts = [
    `kind=${item.signal_source.kind}`,
    `nutrition_coverage=${item.signal_source.nutrition_coverage_ratio !== null ? item.signal_source.nutrition_coverage_ratio.toFixed(3) : 'null'}`,
    `nutrition_confidence=${item.signal_source.nutrition_confidence !== null ? item.signal_source.nutrition_confidence.toFixed(3) : 'null'}`,
    `structured_coverage=${item.signal_source.structured_food_coverage_ratio !== null ? item.signal_source.structured_food_coverage_ratio.toFixed(3) : 'null'}`,
    `ingredient_confidence=${item.signal_source.ingredient_signal_confidence !== null ? item.signal_source.ingredient_signal_confidence.toFixed(3) : 'null'}`,
    `medication_coverage=${item.signal_source.medication_coverage_ratio !== null ? item.signal_source.medication_coverage_ratio.toFixed(3) : 'null'}`,
    `medication_confidence=${item.signal_source.medication_signal_confidence !== null ? item.signal_source.medication_signal_confidence.toFixed(3) : 'null'}`,
    `medication_profile_structure=${item.signal_source.structured_medication_profile_ratio !== null ? item.signal_source.structured_medication_profile_ratio.toFixed(3) : 'null'}`,
  ].join(' ');

  const lines: string[] = [
    `[ITEM_${index + 1}]`,
    `key: ${item.insight_key}`,
    `category: ${item.category} | subtype: ${item.subtype}`,
    `status: ${item.status} | tier: ${item.priority_tier} | score: ${item.priority_score}`,
    `confidence: ${item.confidence_score !== null ? item.confidence_score.toFixed(3) : 'null'} | sufficiency: ${item.data_sufficiency}`,
    `triggers: ${item.trigger_factors.join(', ') || 'none'}`,
    `outcomes: ${item.target_outcomes.join(', ') || 'none'}`,
    `window: ${item.analysis_window.from} to ${item.analysis_window.to}`,
    `evidence: support=${item.evidence.support_count} exposure=${item.evidence.exposure_count}` +
      ` baseline_rate=${item.evidence.baseline_rate !== null ? item.evidence.baseline_rate.toFixed(3) : 'null'}` +
      ` exposed_rate=${item.evidence.exposed_rate !== null ? item.evidence.exposed_rate.toFixed(3) : 'null'}` +
      ` lift=${item.evidence.lift !== null ? item.evidence.lift.toFixed(3) : 'null'}` +
      ` contradictions=${item.evidence.contradiction_level}`,
    `ranking_reasons: ${item.ranking_reasons.join('; ') || 'none'}`,
    `signal_source: ${sourceParts}`,
    `signal_source_summary: ${item.signal_source.summary}`,
  ];

  if (item.evidence.statistics !== undefined) {
    const statParts = Object.entries(item.evidence.statistics)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ');
    if (statParts.length > 0) {
      lines.push(`evidence_statistics: ${statParts}`);
    }
  }

  if (item.medical_context_modifier_applied && item.medical_context_annotations.length > 0) {
    lines.push(`medical_annotations: ${item.medical_context_annotations.join('; ')}`);
  }

  if (item.caution_signals.length > 0) {
    lines.push(`caution_signals: ${item.caution_signals.join(', ')}`);
  }

  return lines.join('\n');
}

function buildSystemPrompt(input: LLMExplanationInput): string {
  const { constraints } = input;

  return [
    'ROLE: Gut-health insight explainer.',
    'TASK: Produce patient-facing plain-language explanations of pre-ranked structured findings only.',
    '',
    'ALLOWED:',
    ...constraints.allowed.map((a) => `  - ${a}`),
    '',
    'DISALLOWED:',
    ...constraints.disallowed.map((d) => `  - ${d}`),
    '',
    `UNCERTAINTY: ${constraints.uncertainty_behavior}`,
    `CAUTION: ${constraints.caution_behavior}`,
    `EVIDENCE_FLOOR: ${constraints.evidence_floor}`,
    '',
    'HARD RULES:',
    '  - Explain only the insight_items present in the user message.',
    '  - Do not introduce any finding, pattern, or condition not listed.',
    '  - Do not recommend medications, supplements, or clinical interventions.',
    '  - Do not claim causation. Use association language only.',
    '  - When caution_signals are present for an item, acknowledge limited evidence.',
    '  - If signal_source is present, explicitly reflect whether the item is driven by reviewed nutrition, structured ingredients, reviewed medication references, mixed evidence, or fallback heuristics.',
    '  - Do not imply reviewed nutrition coverage when signal_source.kind is fallback_heuristic.',
    '  - Do not imply reviewed medication reference coverage when signal_source.kind is fallback_medication_heuristic.',
    '  - Prioritize highest-scored items first in the output.',
    '  - Output only per-item explanations. No preamble. No summary section unless items are empty.',
  ].join('\n');
}

function buildUserPrompt(input: LLMExplanationInput): string {
  const { objective, bundle_meta, insight_items, style_guidance, safety_notes } = input;

  const sections: string[] = [];

  sections.push(
    [
      '## OBJECTIVE',
      `mode: ${objective.mode}`,
      `task: ${objective.task}`,
      `focus: ${objective.focus}`,
      `audience: ${objective.audience}`,
    ].join('\n'),
  );

  sections.push(
    [
      '## BUNDLE_META',
      `item_count: ${bundle_meta.item_count}`,
      `total_candidates: ${bundle_meta.total_candidates_available}`,
      `analyzed_from: ${bundle_meta.analyzed_from ?? 'unknown'}`,
      `analyzed_to: ${bundle_meta.analyzed_to ?? 'unknown'}`,
      `input_days: ${bundle_meta.input_day_count}`,
      `has_medical_context: ${bundle_meta.has_medical_context}`,
    ].join('\n'),
  );

  if (insight_items.length === 0) {
    sections.push('## INSIGHT_ITEMS\nnone');
  } else {
    sections.push(
      '## INSIGHT_ITEMS\n' + insight_items.map((item, i) => serializeItem(item, i)).join('\n\n'),
    );
  }

  sections.push(
    [
      '## STYLE',
      `tone: ${style_guidance.tone}`,
      `length: ${style_guidance.length}`,
      `format: ${style_guidance.format}`,
      `prioritization: ${style_guidance.prioritization}`,
      `avoid: ${style_guidance.avoid.join(', ')}`,
    ].join('\n'),
  );

  if (safety_notes.length > 0) {
    const noteLines = safety_notes.map((n) => `  ${n.insight_key}: ${n.note}`);
    sections.push('## SAFETY_NOTES\n' + noteLines.join('\n'));
  }

  sections.push(
    [
      '## OUTPUT_INSTRUCTION',
      'Produce one explanation per ITEM above, highest priority_score first.',
      'Each explanation: 1-3 sentences. Calm, clinical, patient-readable.',
      'Reference trigger_factors, target_outcomes, and evidence associations only.',
      'If caution_signals exist for an item, include one hedging sentence.',
      'If signal_source_summary exists for an item, incorporate it in plain language so the user can tell whether the finding is based on reviewed nutrition, structured ingredients, reviewed medication references, or heuristic fallback.',
      'If medical_annotations exist for an item, incorporate context where relevant.',
      'Do not produce any text outside the per-item explanations.',
    ].join('\n'),
  );

  return sections.join('\n\n');
}

export function serializeLLMExplanationPrompt(
  input: LLMExplanationInput,
): { system: string; user: string } {
  return {
    system: buildSystemPrompt(input),
    user: buildUserPrompt(input),
  };
}
