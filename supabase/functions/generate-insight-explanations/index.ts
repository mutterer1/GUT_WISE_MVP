import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ── Inlined types ──────────────────────────────────────────────────────────────

type CandidateCategory = string;
type CandidateStatus = string;
type DataSufficiency = string;
type PriorityTier = string;
type ContradictionLevel = string;
type ExplanationMode = "structured_findings_only";
type ExplanationOutputMode = "structured_findings_only";
type OutputValidationFlag =
  | "missing_item"
  | "duplicate_item"
  | "unexpected_item"
  | "count_mismatch"
  | "empty_field"
  | "invalid_rank"
  | "caution_mismatch"
  | "item_count_mismatch"
  | "missing_insight_key"
  | "disallowed_field_present"
  | "summary_empty"
  | "caution_without_annotation";
type ValidationStatus = "valid" | "valid_with_warnings" | "invalid";

interface ValidationFlag {
  type: OutputValidationFlag;
  insight_key?: string;
  detail?: string;
}

interface ValidationResult {
  status: ValidationStatus;
  flags: ValidationFlag[];
  is_safe_to_use: boolean;
}

interface LLMEvidenceSummary {
  support_count: number;
  exposure_count: number;
  baseline_rate: number | null;
  exposed_rate: number | null;
  lift: number | null;
  contradiction_level: ContradictionLevel;
  statistics?: Record<string, unknown>;
}

interface LLMInsightItem {
  insight_key: string;
  category: CandidateCategory;
  subtype: string;
  trigger_factors: string[];
  target_outcomes: string[];
  status: CandidateStatus;
  confidence_score: number | null;
  data_sufficiency: DataSufficiency;
  priority_tier: PriorityTier;
  priority_score: number;
  ranking_reasons: string[];
  evidence: LLMEvidenceSummary;
  analysis_window: { from: string; to: string };
  medical_context_annotations: string[];
  medical_context_modifier_applied: boolean;
  caution_signals: string[];
}

interface LLMBundleMeta {
  item_count: number;
  total_candidates_available: number;
  analyzed_from: string | null;
  analyzed_to: string | null;
  input_day_count: number;
  has_medical_context: boolean;
}

interface LLMExplanationConstraintSet {
  allowed: string[];
  disallowed: string[];
  uncertainty_behavior: string;
  caution_behavior: string;
  evidence_floor: string;
}

interface LLMStyleGuidance {
  tone: string;
  length: string;
  format: string;
  prioritization: string;
  avoid: string[];
}

interface LLMSafetyNote {
  insight_key: string;
  note: string;
}

interface LLMExplanationInput {
  objective: {
    mode: ExplanationMode;
    task: string;
    focus: string;
    audience: string;
  };
  bundle_meta: LLMBundleMeta;
  insight_items: LLMInsightItem[];
  constraints: LLMExplanationConstraintSet;
  style_guidance: LLMStyleGuidance;
  safety_notes: LLMSafetyNote[];
}

interface LLMPerItemExplanation {
  insight_key: string;
  display_rank: number;
  summary: string;
  evidence_statement: string;
  uncertainty_statement: string;
  caution_statement?: string;
}

interface LLMExplanationMeta {
  generated_at: string;
  item_count: number;
  explanation_mode: ExplanationOutputMode;
  validation_flags: OutputValidationFlag[];
}

interface LLMExplanationOutput {
  explanations: LLMPerItemExplanation[];
  meta: LLMExplanationMeta;
}

interface ExplanationInvocationResponse {
  explanation_output?: LLMExplanationOutput;
  validation: ValidationResult;
  success: boolean;
  error?: string;
}

// ── Serializer (mirrors src/lib/insightCandidates/serializeLLMExplanationPrompt.ts) ──

function serializeItem(item: LLMInsightItem, index: number): string {
  const lines: string[] = [
    `[ITEM_${index + 1}]`,
    `key: ${item.insight_key}`,
    `category: ${item.category} | subtype: ${item.subtype}`,
    `status: ${item.status} | tier: ${item.priority_tier} | score: ${item.priority_score}`,
    `confidence: ${item.confidence_score !== null ? item.confidence_score.toFixed(3) : "null"} | sufficiency: ${item.data_sufficiency}`,
    `triggers: ${item.trigger_factors.join(", ") || "none"}`,
    `outcomes: ${item.target_outcomes.join(", ") || "none"}`,
    `window: ${item.analysis_window.from} to ${item.analysis_window.to}`,
    `evidence: support=${item.evidence.support_count} exposure=${item.evidence.exposure_count}` +
      ` baseline_rate=${item.evidence.baseline_rate !== null ? item.evidence.baseline_rate.toFixed(3) : "null"}` +
      ` exposed_rate=${item.evidence.exposed_rate !== null ? item.evidence.exposed_rate.toFixed(3) : "null"}` +
      ` lift=${item.evidence.lift !== null ? item.evidence.lift.toFixed(3) : "null"}` +
      ` contradictions=${item.evidence.contradiction_level}`,
    `ranking_reasons: ${item.ranking_reasons.join("; ") || "none"}`,
  ];

  if (item.evidence.statistics !== undefined) {
    const statParts = Object.entries(item.evidence.statistics)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .join(" ");
    if (statParts.length > 0) {
      lines.push(`evidence_statistics: ${statParts}`);
    }
  }

  if (item.medical_context_modifier_applied && item.medical_context_annotations.length > 0) {
    lines.push(`medical_annotations: ${item.medical_context_annotations.join("; ")}`);
  }

  if (item.caution_signals.length > 0) {
    lines.push(`caution_signals: ${item.caution_signals.join(", ")}`);
  }

  return lines.join("\n");
}

function buildSystemPrompt(input: LLMExplanationInput): string {
  const { constraints } = input;

  return [
    "ROLE: Gut-health insight explainer.",
    "TASK: Produce patient-facing plain-language explanations of pre-ranked structured findings only.",
    "",
    "ALLOWED:",
    ...constraints.allowed.map((a) => `  - ${a}`),
    "",
    "DISALLOWED:",
    ...constraints.disallowed.map((d) => `  - ${d}`),
    "",
    `UNCERTAINTY: ${constraints.uncertainty_behavior}`,
    `CAUTION: ${constraints.caution_behavior}`,
    `EVIDENCE_FLOOR: ${constraints.evidence_floor}`,
    "",
    "HARD RULES:",
    "  - Explain only the insight_items present in the user message.",
    "  - Do not introduce any finding, pattern, or condition not listed.",
    "  - Do not recommend medications, supplements, or clinical interventions.",
    "  - Do not claim causation. Use association language only.",
    "  - When caution_signals are present for an item, acknowledge limited evidence.",
    "  - Prioritize highest-scored items first in the output.",
    "  - Output only per-item explanations. No preamble. No summary section unless items are empty.",
  ].join("\n");
}

function buildUserPrompt(input: LLMExplanationInput): string {
  const { objective, bundle_meta, insight_items, style_guidance, safety_notes } = input;

  const sections: string[] = [];

  sections.push(
    [
      "## OBJECTIVE",
      `mode: ${objective.mode}`,
      `task: ${objective.task}`,
      `focus: ${objective.focus}`,
      `audience: ${objective.audience}`,
    ].join("\n"),
  );

  sections.push(
    [
      "## BUNDLE_META",
      `item_count: ${bundle_meta.item_count}`,
      `total_candidates: ${bundle_meta.total_candidates_available}`,
      `analyzed_from: ${bundle_meta.analyzed_from ?? "unknown"}`,
      `analyzed_to: ${bundle_meta.analyzed_to ?? "unknown"}`,
      `input_days: ${bundle_meta.input_day_count}`,
      `has_medical_context: ${bundle_meta.has_medical_context}`,
    ].join("\n"),
  );

  if (insight_items.length === 0) {
    sections.push("## INSIGHT_ITEMS\nnone");
  } else {
    sections.push(
      "## INSIGHT_ITEMS\n" + insight_items.map((item, i) => serializeItem(item, i)).join("\n\n"),
    );
  }

  sections.push(
    [
      "## STYLE",
      `tone: ${style_guidance.tone}`,
      `length: ${style_guidance.length}`,
      `format: ${style_guidance.format}`,
      `prioritization: ${style_guidance.prioritization}`,
      `avoid: ${style_guidance.avoid.join(", ")}`,
    ].join("\n"),
  );

  if (safety_notes.length > 0) {
    const noteLines = safety_notes.map((n) => `  ${n.insight_key}: ${n.note}`);
    sections.push("## SAFETY_NOTES\n" + noteLines.join("\n"));
  }

  sections.push(
    [
      "## OUTPUT_INSTRUCTION",
      "Produce one explanation per ITEM above, highest priority_score first.",
      "Each explanation: 1-3 sentences. Calm, clinical, patient-readable.",
      "Reference trigger_factors, target_outcomes, and evidence associations only.",
      "If caution_signals exist for an item, include one hedging sentence.",
      "If medical_annotations exist for an item, incorporate context where relevant.",
      "Do not produce any text outside the per-item explanations.",
    ].join("\n"),
  );

  sections.push(
    [
      "## OUTPUT_FORMAT",
      "Respond with valid JSON only. No prose, no markdown fences.",
      "Schema:",
      JSON.stringify(
        {
          explanations: [
            {
              insight_key: "string",
              display_rank: "integer starting at 1",
              summary: "string",
              evidence_statement: "string",
              uncertainty_statement: "string",
              caution_statement: "string | omit if no caution_signals for this item",
            },
          ],
          meta: {
            generated_at: "ISO8601 timestamp",
            item_count: "integer matching explanations.length",
            explanation_mode: "structured_findings_only",
            validation_flags: [],
          },
        },
        null,
        2,
      ),
    ].join("\n"),
  );

  return sections.join("\n\n");
}

function serializeLLMExplanationPrompt(input: LLMExplanationInput): { system: string; user: string } {
  return {
    system: buildSystemPrompt(input),
    user: buildUserPrompt(input),
  };
}

// ── Validator (mirrors src/lib/insightCandidates/validateLLMExplanationOutput.ts) ──

const INVALID_FLAG_TYPES = new Set<string>([
  "missing_item",
  "unexpected_item",
  "count_mismatch",
  "duplicate_item",
]);

function validateLLMExplanationOutput(
  input: LLMExplanationInput,
  output: LLMExplanationOutput,
): ValidationResult {
  const flags: ValidationFlag[] = [];

  const expectedKeys = new Set(input.insight_items.map((i) => i.insight_key));
  const cautionKeySet = new Set(
    input.insight_items.filter((i) => i.caution_signals.length > 0).map((i) => i.insight_key),
  );

  const seenKeys = new Map<string, number>();
  for (const exp of output.explanations) {
    seenKeys.set(exp.insight_key, (seenKeys.get(exp.insight_key) ?? 0) + 1);
  }

  for (const [key, count] of seenKeys) {
    if (count > 1) {
      flags.push({ type: "duplicate_item", insight_key: key, detail: `appears ${count} times` });
    }
  }

  for (const key of expectedKeys) {
    if (!seenKeys.has(key)) {
      flags.push({ type: "missing_item", insight_key: key });
    }
  }

  for (const key of seenKeys.keys()) {
    if (!expectedKeys.has(key)) {
      flags.push({ type: "unexpected_item", insight_key: key });
    }
  }

  const expectedCount = input.bundle_meta.item_count;
  const actualCount = output.explanations.length;

  if (expectedCount !== actualCount) {
    flags.push({
      type: "count_mismatch",
      detail: `bundle_meta.item_count=${expectedCount} vs explanations.length=${actualCount}`,
    });
  }

  if (output.meta.item_count !== actualCount) {
    flags.push({
      type: "count_mismatch",
      detail: `meta.item_count=${output.meta.item_count} vs explanations.length=${actualCount}`,
    });
  }

  const ranks = output.explanations.map((e) => e.display_rank);
  const uniqueRanks = new Set(ranks);

  if (uniqueRanks.size !== ranks.length) {
    flags.push({ type: "invalid_rank", detail: "duplicate display_rank values" });
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
    flags.push({
      type: "invalid_rank",
      detail: `display_rank values must be unique integers in [1..${n}]`,
    });
  }

  for (const exp of output.explanations) {
    if (!exp.summary?.trim()) {
      flags.push({ type: "empty_field", insight_key: exp.insight_key, detail: "summary" });
    }
    if (!exp.evidence_statement?.trim()) {
      flags.push({ type: "empty_field", insight_key: exp.insight_key, detail: "evidence_statement" });
    }
    if (!exp.uncertainty_statement?.trim()) {
      flags.push({
        type: "empty_field",
        insight_key: exp.insight_key,
        detail: "uncertainty_statement",
      });
    }
    if (exp.caution_statement !== undefined && !cautionKeySet.has(exp.insight_key)) {
      flags.push({
        type: "caution_mismatch",
        insight_key: exp.insight_key,
        detail: "caution_statement present but no caution_signals in input",
      });
    }
  }

  const hasInvalidFlag = flags.some((f) => INVALID_FLAG_TYPES.has(f.type));
  const status: ValidationStatus = hasInvalidFlag
    ? "invalid"
    : flags.length > 0
    ? "valid_with_warnings"
    : "valid";

  return {
    status,
    flags,
    is_safe_to_use: status !== "invalid",
  };
}

// ── Model invocation ───────────────────────────────────────────────────────────

const MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o";

async function callOpenAI(
  system: string,
  user: string,
): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Unexpected OpenAI response shape");
  }
  return content;
}

function parseModelOutput(raw: string): LLMExplanationOutput {
  const stripped = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(stripped);

  if (!Array.isArray(parsed?.explanations) || typeof parsed?.meta !== "object") {
    throw new Error("Model output missing required fields: explanations, meta");
  }

  return parsed as LLMExplanationOutput;
}

// ── Handler ────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    let llmInput: LLMExplanationInput;
    try {
      llmInput = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!llmInput?.insight_items || !llmInput?.bundle_meta || !llmInput?.objective) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid LLMExplanationInput: missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { system, user } = serializeLLMExplanationPrompt(llmInput);

    const rawText = await callOpenAI(system, user);

    let parsed: LLMExplanationOutput;
    try {
      parsed = parseModelOutput(rawText);
    } catch (parseErr) {
      const failedValidation: ValidationResult = {
        status: "invalid",
        flags: [{ type: "missing_item", detail: `JSON parse failure: ${String(parseErr)}` }],
        is_safe_to_use: false,
      };
      const body: ExplanationInvocationResponse = {
        success: false,
        validation: failedValidation,
        error: `Model output could not be parsed: ${String(parseErr)}`,
      };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validation = validateLLMExplanationOutput(llmInput, parsed);

    if (!validation.is_safe_to_use) {
      const body: ExplanationInvocationResponse = {
        success: false,
        validation,
        error: `Validation failed: ${validation.status}`,
      };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ExplanationInvocationResponse = {
      explanation_output: parsed,
      validation,
      success: true,
    };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const body: ExplanationInvocationResponse = {
      success: false,
      validation: {
        status: "invalid",
        flags: [],
        is_safe_to_use: false,
      },
      error: err instanceof Error ? err.message : "Internal error",
    };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
