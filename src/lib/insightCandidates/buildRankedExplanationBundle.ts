import type { MedicalContextAnnotatedCandidate } from '../../types/insightCandidates';
import type {
  ContradictionLevel,
  ContradictionSummary,
  ExplanationEvidenceSummary,
  ExplanationInsightItem,
  ExplanationSignalSourceSummary,
  RankedExplanationBundle,
  RankedExplanationBundleMeta,
} from '../../types/explanationBundle';

const DEFAULT_TOP_N = 5;

export interface BuildRankedExplanationBundleOptions {
  top_n?: number;
  analyzed_from?: string | null;
  analyzed_to?: string | null;
  input_day_count?: number;
  has_medical_context?: boolean;
}

function deriveContradictionLevel(ratio: number | null): ContradictionLevel {
  if (ratio === null || ratio === 0) return 'none';
  if (ratio < 0.15) return 'low';
  if (ratio < 0.35) return 'moderate';
  return 'high';
}

function buildContradictionSummary(
  contradiction_count: number,
  exposure_count: number
): ContradictionSummary {
  const ratio =
    exposure_count > 0 ? Math.round((contradiction_count / exposure_count) * 1000) / 1000 : null;
  return {
    count: contradiction_count,
    exposure_count,
    ratio,
    level: deriveContradictionLevel(ratio),
  };
}

function buildEvidenceSummary(
  c: MedicalContextAnnotatedCandidate
): ExplanationEvidenceSummary {
  const { support_count, exposure_count, contradiction_count, baseline_rate, exposed_rate, lift, statistics } =
    c.evidence;
  return {
    support_count,
    exposure_count,
    baseline_rate,
    exposed_rate,
    lift,
    contradiction: buildContradictionSummary(contradiction_count, exposure_count),
    ...(statistics !== undefined ? { statistics } : {}),
  };
}

function readStatisticNumber(
  statistics: Record<string, unknown> | undefined,
  key: string
): number | null {
  const value = statistics?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function formatPercent(value: number | null): string {
  if (value === null) return 'unknown';
  return `${Math.round(value * 100)}%`;
}

function appendCoverageDetail(
  label: string,
  value: number | null
): string {
  if (value === null) return `${label} was not quantified in the current evidence.`;
  return `${label} was about ${formatPercent(value)} on exposed days.`;
}

function derivesNutritionSignal(candidate: MedicalContextAnnotatedCandidate): boolean {
  return candidate.trigger_factors.some((factor) =>
    [
      'calories_kcal_total',
      'protein_g_total',
      'protein_g_per_1000kcal',
      'fat_g_total',
      'fat_calorie_share_ratio',
      'carbs_g_total',
      'carbs_g_per_1000kcal',
      'fiber_g_total',
      'fiber_g_per_1000kcal',
      'sugar_g_total',
      'sugar_g_per_1000kcal',
      'sodium_mg_total',
      'sodium_mg_per_1000kcal',
      'nutrition_coverage_ratio',
    ].includes(factor)
  );
}

function derivesStructuredIngredientSignal(
  candidate: MedicalContextAnnotatedCandidate
): boolean {
  return candidate.trigger_factors.some((factor) =>
    factor.includes('ingredient') ||
    factor.includes('burden_score') ||
    factor.includes('high_fat_burden') ||
    factor.includes('high_fodmap_burden') ||
    factor.includes('structured_food_coverage_ratio')
  );
}

function buildSignalSourceSummary(
  candidate: MedicalContextAnnotatedCandidate
): ExplanationSignalSourceSummary {
  const statistics = candidate.evidence.statistics;
  const nutritionCoverage =
    readStatisticNumber(statistics, 'average_exposed_nutrition_coverage_ratio') ??
    readStatisticNumber(statistics, 'avg_exposed_nutrition_coverage_ratio');
  const nutritionConfidence =
    readStatisticNumber(statistics, 'average_exposed_nutrition_confidence') ??
    readStatisticNumber(statistics, 'avg_exposed_nutrition_confidence');
  const structuredCoverage =
    readStatisticNumber(statistics, 'average_exposed_structured_coverage_ratio') ??
    readStatisticNumber(statistics, 'avg_exposed_structured_coverage_ratio');
  const ingredientSignalConfidence =
    readStatisticNumber(statistics, 'average_exposed_signal_confidence') ??
    readStatisticNumber(statistics, 'avg_exposed_signal_confidence');

  const usesNutrition = derivesNutritionSignal(candidate) || nutritionCoverage !== null;
  const usesStructuredIngredients =
    derivesStructuredIngredientSignal(candidate) ||
    structuredCoverage !== null ||
    ingredientSignalConfidence !== null;

  if (usesNutrition && usesStructuredIngredients) {
    return {
      kind: 'mixed_structured_and_nutrition',
      summary:
        `This finding combines reviewed nutrition totals with structured ingredient context. ` +
        `${appendCoverageDetail('Nutrition coverage', nutritionCoverage)} ` +
        `${appendCoverageDetail('Structured ingredient coverage', structuredCoverage)}`,
      nutrition_coverage_ratio: nutritionCoverage,
      nutrition_confidence: nutritionConfidence,
      structured_food_coverage_ratio: structuredCoverage,
      ingredient_signal_confidence: ingredientSignalConfidence,
    };
  }

  if (usesNutrition) {
    return {
      kind: 'reviewed_nutrition',
      summary:
        `This finding is mainly driven by reviewed nutrition totals. ` +
        `${appendCoverageDetail('Nutrition coverage', nutritionCoverage)}`,
      nutrition_coverage_ratio: nutritionCoverage,
      nutrition_confidence: nutritionConfidence,
      structured_food_coverage_ratio: structuredCoverage,
      ingredient_signal_confidence: ingredientSignalConfidence,
    };
  }

  if (usesStructuredIngredients) {
    return {
      kind: 'structured_ingredients',
      summary:
        `This finding is mainly driven by structured ingredient matches and burden scoring. ` +
        `${appendCoverageDetail('Structured ingredient coverage', structuredCoverage)}`,
      nutrition_coverage_ratio: nutritionCoverage,
      nutrition_confidence: nutritionConfidence,
      structured_food_coverage_ratio: structuredCoverage,
      ingredient_signal_confidence: ingredientSignalConfidence,
    };
  }

  if (candidate.category === 'food') {
    return {
      kind: 'fallback_heuristic',
      summary:
        'This finding relies more on fallback food heuristics than on reviewed nutrition or structured ingredient coverage.',
      nutrition_coverage_ratio: nutritionCoverage,
      nutrition_confidence: nutritionConfidence,
      structured_food_coverage_ratio: structuredCoverage,
      ingredient_signal_confidence: ingredientSignalConfidence,
    };
  }

  return {
    kind: 'generic_logs',
    summary: 'This finding is based on the available structured logs for this category.',
    nutrition_coverage_ratio: nutritionCoverage,
    nutrition_confidence: nutritionConfidence,
    structured_food_coverage_ratio: structuredCoverage,
    ingredient_signal_confidence: ingredientSignalConfidence,
  };
}

function toExplanationItem(c: MedicalContextAnnotatedCandidate): ExplanationInsightItem {
  return {
    insight_key: c.insight_key,
    category: c.category,
    subtype: c.subtype,
    trigger_factors: c.trigger_factors,
    target_outcomes: c.target_outcomes,
    status: c.status,
    confidence_score: c.confidence_score,
    data_sufficiency: c.data_sufficiency,
    priority_score: c.priority_score,
    priority_tier: c.priority_tier,
    ranking_reasons: c.ranking_reasons,
    evidence: buildEvidenceSummary(c),
    analysis_window: {
      from: c.created_from_start_date,
      to: c.created_from_end_date,
    },
    signal_source: buildSignalSourceSummary(c),
    medical_context_annotations: c.medical_context_annotations,
    medical_context_modifier_applied: c.medical_context_modifier_applied,
    medical_context_score_delta: c.medical_context_score_delta,
  };
}

export function buildRankedExplanationBundle(
  candidates: MedicalContextAnnotatedCandidate[],
  options: BuildRankedExplanationBundleOptions = {}
): RankedExplanationBundle {
  const {
    top_n = DEFAULT_TOP_N,
    analyzed_from = null,
    analyzed_to = null,
    input_day_count = 0,
    has_medical_context = false,
  } = options;

  const selected = candidates.slice(0, top_n);
  const items = selected.map(toExplanationItem);

  const meta: RankedExplanationBundleMeta = {
    top_n: items.length,
    total_candidates_available: candidates.length,
    analyzed_from,
    analyzed_to,
    input_day_count,
    has_medical_context,
    built_at: new Date().toISOString(),
  };

  return { items, meta };
}
