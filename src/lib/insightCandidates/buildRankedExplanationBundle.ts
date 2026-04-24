import type { MedicalContextAnnotatedCandidate } from '../../types/insightCandidates';
import type {
  ContradictionLevel,
  ContradictionSummary,
  ExplanationEvidenceSummary,
  ExplanationInsightItem,
  ExplanationMedicationReferenceDetail,
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

function formatDose(value: number | null): string | null {
  if (value === null) return null;
  if (value >= 100) return `${Math.round(value)} mg`;
  return `${Math.round(value * 10) / 10} mg`;
}

function appendCoverageDetail(
  label: string,
  value: number | null
): string {
  if (value === null) return `${label} was not quantified in the current evidence.`;
  return `${label} was about ${formatPercent(value)} on exposed days.`;
}

function buildMedicationReferenceDetail(
  candidate: MedicalContextAnnotatedCandidate
): ExplanationMedicationReferenceDetail | null {
  if (candidate.category !== 'medication') return null;

  const statistics = candidate.evidence.statistics;
  const averageIronDoseMg = readStatisticNumber(statistics, 'average_exposed_iron_dose_mg');
  const averageMagnesiumDoseMg = readStatisticNumber(
    statistics,
    'average_exposed_magnesium_dose_mg'
  );
  const minimumExposureDoseMg = readStatisticNumber(statistics, 'minimum_exposure_dose_mg');

  switch (candidate.subtype) {
    case 'medication_as_needed_antidiarrheal_next_day_hard_stool':
      return {
        label: 'Antidiarrheal rescue use',
        family: 'Antidiarrheal',
        route: 'Oral or route not specified',
        timing_context: null,
        regimen_status: 'As needed',
        dose_context: null,
        summary:
          'This rule isolates rescue antidiarrheal use from general medication days and compares those exposures with next-day harder-stool patterns.',
      };

    case 'medication_before_meal_iron_same_day_nausea':
      return {
        label: 'Before-meal iron',
        family: 'Iron',
        route: 'Oral or route not specified',
        timing_context: 'Before meal',
        regimen_status: null,
        dose_context:
          averageIronDoseMg !== null
            ? `Average exposed dose about ${formatDose(averageIronDoseMg)}`
            : 'Dose detail was not consistent enough to summarize',
        summary:
          'This rule targets before-meal oral iron exposures so the report can separate timing-related GI irritation from general iron use.',
      };

    case 'medication_oral_magnesium_same_day_loose_stool': {
      const averageDose = formatDose(averageMagnesiumDoseMg);
      const minimumDose = formatDose(minimumExposureDoseMg);
      const doseContextParts = [
        averageDose ? `Average exposed dose about ${averageDose}` : null,
        minimumDose ? `qualifying doses were at least ${minimumDose}` : null,
      ].filter(Boolean);

      return {
        label: 'Oral magnesium',
        family: 'Magnesium',
        route: 'Oral',
        timing_context: null,
        regimen_status: null,
        dose_context:
          doseContextParts.length > 0
            ? doseContextParts.join('; ')
            : 'Dose detail was not consistent enough to summarize',
        summary:
          'This rule limits exposure to quantified oral magnesium doses so the report can distinguish dose-aware loose-stool patterns from generic magnesium mentions.',
      };
    }

    case 'medication_any_bm_shift':
      return {
        label: 'GI-relevant medication group',
        family: 'GI-relevant medications',
        route: null,
        timing_context: null,
        regimen_status: null,
        dose_context: null,
        summary:
          'This rule combines GI-relevant medication families and gut-effect flags when a single medication class was not isolated strongly enough.',
      };

    case 'medication_any_symptom_burden':
      return {
        label: 'GI-relevant medication group',
        family: 'GI-relevant medications',
        route: null,
        timing_context: null,
        regimen_status: null,
        dose_context: null,
        summary:
          'This rule combines GI-relevant medication families and gut-effect flags when symptom burden appears to move with broader medication exposure rather than one reviewed medication profile.',
      };

    default:
      return null;
  }
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

function derivesMedicationSignal(
  candidate: MedicalContextAnnotatedCandidate
): boolean {
  return candidate.category === 'medication' || candidate.trigger_factors.some((factor) =>
    [
      'matched_medication_ids',
      'medication_families',
      'medication_gut_effects',
      'route',
      'regimen_status',
      'timing_context',
      'dose_value',
      'dose_unit',
      'structured_medication_coverage_ratio',
      'medication_signal_confidence_avg',
    ].includes(factor)
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
  const medicationCoverage =
    readStatisticNumber(statistics, 'average_exposed_medication_coverage_ratio') ??
    readStatisticNumber(statistics, 'avg_exposed_medication_coverage_ratio');
  const medicationSignalConfidence =
    readStatisticNumber(statistics, 'average_exposed_medication_signal_confidence') ??
    readStatisticNumber(statistics, 'avg_exposed_medication_signal_confidence');
  const structuredMedicationProfileRatio =
    readStatisticNumber(statistics, 'average_exposed_structured_profile_share') ??
    readStatisticNumber(statistics, 'avg_exposed_structured_profile_share');

  const usesNutrition = derivesNutritionSignal(candidate) || nutritionCoverage !== null;
  const usesStructuredIngredients =
    derivesStructuredIngredientSignal(candidate) ||
    structuredCoverage !== null ||
    ingredientSignalConfidence !== null;
  const usesMedication =
    derivesMedicationSignal(candidate) ||
    medicationCoverage !== null ||
    medicationSignalConfidence !== null ||
    structuredMedicationProfileRatio !== null;

  if (candidate.category === 'medication' && usesMedication) {
    return {
      kind: 'reviewed_medication_reference',
      summary:
        `This finding is mainly driven by reviewed medication reference matches with structured dose, route, timing, or regimen context. ` +
        `${appendCoverageDetail('Reviewed medication coverage', medicationCoverage)} ` +
        `${appendCoverageDetail(
          'Structured medication profile coverage',
          structuredMedicationProfileRatio
        )}`,
      nutrition_coverage_ratio: nutritionCoverage,
      nutrition_confidence: nutritionConfidence,
      structured_food_coverage_ratio: structuredCoverage,
      ingredient_signal_confidence: ingredientSignalConfidence,
      medication_coverage_ratio: medicationCoverage,
      medication_signal_confidence: medicationSignalConfidence,
      structured_medication_profile_ratio: structuredMedicationProfileRatio,
    };
  }

  if (candidate.category === 'medication') {
    return {
      kind: 'fallback_medication_heuristic',
      summary:
        'This finding relies more on medication family or name heuristics than on reviewed medication reference matches with structured dose, route, timing, or regimen coverage.',
      nutrition_coverage_ratio: nutritionCoverage,
      nutrition_confidence: nutritionConfidence,
      structured_food_coverage_ratio: structuredCoverage,
      ingredient_signal_confidence: ingredientSignalConfidence,
      medication_coverage_ratio: medicationCoverage,
      medication_signal_confidence: medicationSignalConfidence,
      structured_medication_profile_ratio: structuredMedicationProfileRatio,
    };
  }

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
      medication_coverage_ratio: medicationCoverage,
      medication_signal_confidence: medicationSignalConfidence,
      structured_medication_profile_ratio: structuredMedicationProfileRatio,
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
      medication_coverage_ratio: medicationCoverage,
      medication_signal_confidence: medicationSignalConfidence,
      structured_medication_profile_ratio: structuredMedicationProfileRatio,
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
      medication_coverage_ratio: medicationCoverage,
      medication_signal_confidence: medicationSignalConfidence,
      structured_medication_profile_ratio: structuredMedicationProfileRatio,
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
      medication_coverage_ratio: medicationCoverage,
      medication_signal_confidence: medicationSignalConfidence,
      structured_medication_profile_ratio: structuredMedicationProfileRatio,
    };
  }

  return {
    kind: 'generic_logs',
    summary: 'This finding is based on the available structured logs for this category.',
    nutrition_coverage_ratio: nutritionCoverage,
    nutrition_confidence: nutritionConfidence,
    structured_food_coverage_ratio: structuredCoverage,
    ingredient_signal_confidence: ingredientSignalConfidence,
    medication_coverage_ratio: medicationCoverage,
    medication_signal_confidence: medicationSignalConfidence,
    structured_medication_profile_ratio: structuredMedicationProfileRatio,
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
    medication_reference_detail: buildMedicationReferenceDetail(c),
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
