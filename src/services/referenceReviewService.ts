import {
  INGREDIENT_CATALOG,
  type IngredientSignalKey,
} from '../data/ingredientCatalog';
import { supabase } from '../lib/supabase';
import { fetchFoodEnrichment } from './foodEnrichmentService';
import { fetchMedicationEnrichment } from './medicationEnrichmentService';
import type {
  FoodReferenceCandidateDetail,
  FoodReferenceCandidateIngredient,
  FoodReferenceIngredientRow,
  FoodReferenceItemRow,
  FoodLogItemRow,
  IngredientFodmapLevel,
  IngredientReferenceItemRow,
  MedicationGutRelevance,
  MedicationReferenceCandidateDetail,
  MedicationReferenceItemRow,
  MedicationReferenceType,
  MedicationRegimenStatus,
  ReferenceCandidateKind,
  ReferenceCandidateReviewStatus,
  ReferenceReviewCandidateRow,
} from '../types/intelligence';

interface QueueFoodReferenceCandidateInput {
  userId: string;
  foodLogId: string;
  foodLogItemId: string;
  displayName: string;
  estimatedCalories?: number;
  tags?: string[];
  portionSize?: string | null;
}

interface QueueMedicationReferenceCandidateInput {
  userId: string;
  medicationLogId: string;
  displayName: string;
  dosage?: string;
  medicationType?: MedicationReferenceType | null;
  route?: string | null;
  reasonForUse?: string | null;
  regimenStatus?: MedicationRegimenStatus | null;
  timingContext?: string | null;
}

interface UpdateFoodReferenceCandidateDetailInput {
  userId: string;
  candidateId: string;
  detail: FoodReferenceCandidateDetail;
}

interface UpdateMedicationReferenceCandidateDetailInput {
  userId: string;
  candidateId: string;
  detail: MedicationReferenceCandidateDetail;
}

const FOOD_TAG_TO_SIGNAL: Record<string, string[]> = {
  dairy: ['dairy'],
  gluten: ['gluten'],
  spicy: ['spicy'],
  fried: ['high_fat'],
  'high fiber': ['fiber_dense'],
  caffeine: ['caffeine_food'],
  sugar: ['high_sugar'],
  'artificial sweetener': ['artificial_sweetener'],
  'high fat': ['high_fat'],
  fodmap: ['high_fodmap'],
  alcohol: ['alcohol'],
};

function normalizeLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

function cleanOptionalText(value?: string | null): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanOptionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function cleanOptionalConfidence(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value < 0 || value > 1) return null;
  return value;
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function buildFoodCandidateIngredient(params: {
  name: string;
  confidence?: number | null;
  prominenceRank?: number | null;
  isPrimary?: boolean;
  ingredientFraction?: number | null;
  suggestedSignals?: string[];
  notes?: string | null;
}): FoodReferenceCandidateIngredient | null {
  const name = cleanOptionalText(params.name);
  if (!name) return null;

  const derived = matchIngredientCatalogSignals(name);
  const suggestedSignals = dedupeStrings([
    ...(params.suggestedSignals ?? []),
    ...derived.signals,
  ]);

  return {
    name,
    confidence: cleanOptionalConfidence(params.confidence),
    prominence_rank:
      typeof params.prominenceRank === 'number' &&
      Number.isFinite(params.prominenceRank) &&
      params.prominenceRank > 0
        ? Math.round(params.prominenceRank)
        : null,
    is_primary: Boolean(params.isPrimary),
    ingredient_fraction: cleanOptionalConfidence(params.ingredientFraction),
    suggested_signals: suggestedSignals,
    notes: cleanOptionalText(params.notes),
  };
}

function normalizeFoodCandidateIngredients(
  ingredients: FoodReferenceCandidateIngredient[],
  fallbackConfidence: number | null = null
): FoodReferenceCandidateIngredient[] {
  const sorted = [...ingredients]
    .filter((ingredient) => cleanOptionalText(ingredient.name) !== null)
    .sort((left, right) => {
      const leftRank = left.prominence_rank ?? Number.MAX_SAFE_INTEGER;
      const rightRank = right.prominence_rank ?? Number.MAX_SAFE_INTEGER;
      return leftRank - rightRank;
    });

  const normalized = sorted
    .map((ingredient, index) =>
      buildFoodCandidateIngredient({
        name: ingredient.name,
        confidence: ingredient.confidence ?? fallbackConfidence,
        prominenceRank: ingredient.prominence_rank ?? index + 1,
        isPrimary: ingredient.is_primary || index === 0,
        ingredientFraction: ingredient.ingredient_fraction,
        suggestedSignals: ingredient.suggested_signals,
        notes: ingredient.notes,
      })
    )
    .filter((ingredient): ingredient is FoodReferenceCandidateIngredient => ingredient !== null);

  if (normalized.length > 0 && !normalized.some((ingredient) => ingredient.is_primary)) {
    normalized[0] = {
      ...normalized[0],
      is_primary: true,
    };
  }

  return normalized;
}

function buildFallbackFoodCandidateIngredients(
  ingredientNames: string[],
  fallbackConfidence: number | null = null
): FoodReferenceCandidateIngredient[] {
  return normalizeFoodCandidateIngredients(
    ingredientNames
      .map((ingredientName, index) =>
        buildFoodCandidateIngredient({
          name: ingredientName,
          confidence:
            fallbackConfidence !== null
              ? Math.max(0.2, Math.min(0.95, fallbackConfidence - index * 0.04))
              : null,
          prominenceRank: index + 1,
          isPrimary: index === 0,
        })
      )
      .filter((ingredient): ingredient is FoodReferenceCandidateIngredient => ingredient !== null),
    fallbackConfidence
  );
}

function mergeFoodCandidateIngredients(
  existingIngredients: FoodReferenceCandidateIngredient[],
  incomingIngredients: FoodReferenceCandidateIngredient[],
  fallbackConfidence: number | null = null
): FoodReferenceCandidateIngredient[] {
  const merged = new Map<string, FoodReferenceCandidateIngredient>();

  for (const ingredient of existingIngredients) {
    merged.set(normalizeLookupKey(ingredient.name), ingredient);
  }

  for (const ingredient of incomingIngredients) {
    const key = normalizeLookupKey(ingredient.name);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, ingredient);
      continue;
    }

    merged.set(key, {
      ...existing,
      confidence: existing.confidence ?? ingredient.confidence ?? fallbackConfidence,
      prominence_rank: existing.prominence_rank ?? ingredient.prominence_rank,
      is_primary: existing.is_primary || ingredient.is_primary,
      ingredient_fraction: existing.ingredient_fraction ?? ingredient.ingredient_fraction,
      suggested_signals: dedupeStrings([
        ...existing.suggested_signals,
        ...ingredient.suggested_signals,
      ]),
      notes: existing.notes ?? ingredient.notes ?? null,
    });
  }

  return normalizeFoodCandidateIngredients([...merged.values()], fallbackConfidence);
}

function formatIngredientSuggestionSummary(
  ingredients: FoodReferenceCandidateIngredient[]
): string | null {
  if (ingredients.length === 0) return null;

  return ingredients
    .slice(0, 6)
    .map((ingredient) => {
      const parts = [ingredient.name];

      if (ingredient.is_primary) {
        parts.push('primary');
      } else if (ingredient.prominence_rank !== null) {
        parts.push(`#${ingredient.prominence_rank}`);
      }

      if (ingredient.confidence !== null) {
        parts.push(`${Math.round(ingredient.confidence * 100)}%`);
      }

      if (ingredient.ingredient_fraction !== null) {
        parts.push(`${Math.round(ingredient.ingredient_fraction * 100)}% of serving`);
      }

      return `${parts[0]} (${parts.slice(1).join(', ')})`;
    })
    .join(', ');
}

export function readFoodCandidateDetail(
  detail: Record<string, unknown>
): FoodReferenceCandidateDetail {
  const suggestedIngredientNames = Array.isArray(detail.suggested_ingredient_names)
    ? dedupeStrings(
        detail.suggested_ingredient_names.filter(
          (ingredient): ingredient is string => typeof ingredient === 'string'
        )
      )
    : [];
  const enrichmentConfidence = cleanOptionalConfidence(detail.enrichment_confidence);
  const rawSuggestedIngredients = Array.isArray(detail.suggested_ingredients)
    ? detail.suggested_ingredients
    : [];
  const parsedSuggestedIngredients = rawSuggestedIngredients
    .map((value) => {
      if (!value || typeof value !== 'object') return null;

      const candidate = value as Record<string, unknown>;
      return buildFoodCandidateIngredient({
        name: typeof candidate.name === 'string' ? candidate.name : '',
        confidence: cleanOptionalConfidence(candidate.confidence),
        prominenceRank:
          typeof candidate.prominence_rank === 'number' ? candidate.prominence_rank : null,
        isPrimary: candidate.is_primary === true,
        ingredientFraction: cleanOptionalConfidence(candidate.ingredient_fraction),
        suggestedSignals: Array.isArray(candidate.suggested_signals)
          ? candidate.suggested_signals.filter(
              (signal): signal is string => typeof signal === 'string'
            )
          : [],
        notes: typeof candidate.notes === 'string' ? candidate.notes : null,
      });
    })
    .filter((ingredient): ingredient is FoodReferenceCandidateIngredient => ingredient !== null);
  const suggestedIngredients =
    parsedSuggestedIngredients.length > 0 || suggestedIngredientNames.length === 0
      ? normalizeFoodCandidateIngredients(parsedSuggestedIngredients, enrichmentConfidence)
      : buildFallbackFoodCandidateIngredients(
          suggestedIngredientNames,
          enrichmentConfidence
        );

  return {
    tags: Array.isArray(detail.tags)
      ? dedupeStrings(detail.tags.filter((tag): tag is string => typeof tag === 'string'))
      : [],
    estimated_calories: cleanOptionalNumber(detail.estimated_calories),
    portion_size:
      typeof detail.portion_size === 'string' && detail.portion_size.trim().length > 0
        ? detail.portion_size.trim()
        : null,
    suggested_food_category: cleanOptionalText(
      typeof detail.suggested_food_category === 'string' ? detail.suggested_food_category : null
    ),
    suggested_brand_name: cleanOptionalText(
      typeof detail.suggested_brand_name === 'string' ? detail.suggested_brand_name : null
    ),
    suggested_common_aliases: Array.isArray(detail.suggested_common_aliases)
      ? dedupeStrings(
          detail.suggested_common_aliases.filter(
            (alias): alias is string => typeof alias === 'string'
          )
        )
      : [],
    suggested_serving_label: cleanOptionalText(
      typeof detail.suggested_serving_label === 'string' ? detail.suggested_serving_label : null
    ),
    suggested_calories_kcal: cleanOptionalNumber(detail.suggested_calories_kcal),
    suggested_protein_g: cleanOptionalNumber(detail.suggested_protein_g),
    suggested_fat_g: cleanOptionalNumber(detail.suggested_fat_g),
    suggested_carbs_g: cleanOptionalNumber(detail.suggested_carbs_g),
    suggested_fiber_g: cleanOptionalNumber(detail.suggested_fiber_g),
    suggested_sugar_g: cleanOptionalNumber(detail.suggested_sugar_g),
    suggested_sodium_mg: cleanOptionalNumber(detail.suggested_sodium_mg),
    suggested_ingredient_names: suggestedIngredients.map((ingredient) => ingredient.name),
    suggested_ingredients: suggestedIngredients,
    suggested_default_signals: Array.isArray(detail.suggested_default_signals)
      ? dedupeStrings(
          detail.suggested_default_signals.filter(
            (signal): signal is string => typeof signal === 'string'
          )
        )
      : [],
    enrichment_source_label: cleanOptionalText(
      typeof detail.enrichment_source_label === 'string' ? detail.enrichment_source_label : null
    ),
    enrichment_source_ref: cleanOptionalText(
      typeof detail.enrichment_source_ref === 'string' ? detail.enrichment_source_ref : null
    ),
    enrichment_confidence: enrichmentConfidence,
    enrichment_status:
      detail.enrichment_status === 'not_started' ||
      detail.enrichment_status === 'enriched' ||
      detail.enrichment_status === 'fallback' ||
      detail.enrichment_status === 'failed'
        ? detail.enrichment_status
        : 'not_started',
    enrichment_last_attempt_at: cleanOptionalText(
      typeof detail.enrichment_last_attempt_at === 'string'
        ? detail.enrichment_last_attempt_at
        : null
    ),
    enrichment_notes: cleanOptionalText(
      typeof detail.enrichment_notes === 'string' ? detail.enrichment_notes : null
    ),
  };
}

function parseMedicationType(value: unknown): MedicationReferenceType | null {
  return value === 'prescription' ||
    value === 'otc' ||
    value === 'supplement' ||
    value === 'unknown'
    ? value
    : null;
}

function parseMedicationRegimenStatus(value: unknown): MedicationRegimenStatus | null {
  return value === 'scheduled' ||
    value === 'as_needed' ||
    value === 'one_time' ||
    value === 'unknown'
    ? value
    : null;
}

function parseMedicationGutRelevance(value: unknown): MedicationGutRelevance | null {
  return value === 'primary' ||
    value === 'secondary' ||
    value === 'indirect' ||
    value === 'unknown'
    ? value
    : null;
}

function parseMedicationEnrichmentStatus(
  value: unknown
): MedicationReferenceCandidateDetail['enrichment_status'] {
  return value === 'enriched' ||
    value === 'fallback' ||
    value === 'failed' ||
    value === 'not_started'
    ? value
    : 'not_started';
}

export function readMedicationCandidateDetail(
  detail: Record<string, unknown>
): MedicationReferenceCandidateDetail {
  return {
    dosage: cleanOptionalText(typeof detail.dosage === 'string' ? detail.dosage : null),
    medication_type: parseMedicationType(detail.medication_type),
    route: cleanOptionalText(typeof detail.route === 'string' ? detail.route : null),
    reason_for_use: cleanOptionalText(
      typeof detail.reason_for_use === 'string' ? detail.reason_for_use : null
    ),
    regimen_status: parseMedicationRegimenStatus(detail.regimen_status),
    timing_context: cleanOptionalText(
      typeof detail.timing_context === 'string' ? detail.timing_context : null
    ),
    suggested_generic_name: cleanOptionalText(
      typeof detail.suggested_generic_name === 'string' ? detail.suggested_generic_name : null
    ),
    suggested_brand_names: Array.isArray(detail.suggested_brand_names)
      ? dedupeStrings(
          detail.suggested_brand_names.filter(
            (brand): brand is string => typeof brand === 'string'
          )
        )
      : [],
    suggested_medication_class: cleanOptionalText(
      typeof detail.suggested_medication_class === 'string'
        ? detail.suggested_medication_class
        : null
    ),
    suggested_medication_family: cleanOptionalText(
      typeof detail.suggested_medication_family === 'string'
        ? detail.suggested_medication_family
        : null
    ),
    suggested_rxnorm_code: cleanOptionalText(
      typeof detail.suggested_rxnorm_code === 'string' ? detail.suggested_rxnorm_code : null
    ),
    suggested_gut_relevance: parseMedicationGutRelevance(detail.suggested_gut_relevance),
    suggested_common_gut_effects: Array.isArray(detail.suggested_common_gut_effects)
      ? dedupeStrings(
          detail.suggested_common_gut_effects.filter(
            (effect): effect is string => typeof effect === 'string'
          )
        )
      : [],
    suggested_interaction_flags: Array.isArray(detail.suggested_interaction_flags)
      ? dedupeStrings(
          detail.suggested_interaction_flags.filter(
            (flag): flag is string => typeof flag === 'string'
          )
        )
      : [],
    suggested_active_ingredients: Array.isArray(detail.suggested_active_ingredients)
      ? dedupeStrings(
          detail.suggested_active_ingredients.filter(
            (ingredient): ingredient is string => typeof ingredient === 'string'
          )
        )
      : [],
    suggested_common_dose_units: Array.isArray(detail.suggested_common_dose_units)
      ? dedupeStrings(
          detail.suggested_common_dose_units.filter(
            (unit): unit is string => typeof unit === 'string'
          )
        )
      : [],
    suggested_dosage_form: cleanOptionalText(
      typeof detail.suggested_dosage_form === 'string' ? detail.suggested_dosage_form : null
    ),
    suggested_route: cleanOptionalText(
      typeof detail.suggested_route === 'string' ? detail.suggested_route : null
    ),
    enrichment_source_label: cleanOptionalText(
      typeof detail.enrichment_source_label === 'string' ? detail.enrichment_source_label : null
    ),
    enrichment_source_ref: cleanOptionalText(
      typeof detail.enrichment_source_ref === 'string' ? detail.enrichment_source_ref : null
    ),
    enrichment_confidence: cleanOptionalConfidence(detail.enrichment_confidence),
    enrichment_status: parseMedicationEnrichmentStatus(detail.enrichment_status),
    enrichment_last_attempt_at: cleanOptionalText(
      typeof detail.enrichment_last_attempt_at === 'string'
        ? detail.enrichment_last_attempt_at
        : null
    ),
    enrichment_notes: cleanOptionalText(
      typeof detail.enrichment_notes === 'string' ? detail.enrichment_notes : null
    ),
  };
}

function mergeFoodCandidateDetails(
  existing: Record<string, unknown>,
  incoming: FoodReferenceCandidateDetail
): FoodReferenceCandidateDetail {
  const existingDetail = readFoodCandidateDetail(existing);
  const mergedIngredients = mergeFoodCandidateIngredients(
    existingDetail.suggested_ingredients,
    incoming.suggested_ingredients,
    existingDetail.enrichment_confidence ?? incoming.enrichment_confidence ?? null
  );

  return {
    tags: dedupeStrings([...existingDetail.tags, ...(incoming.tags ?? [])]),
    estimated_calories: existingDetail.estimated_calories ?? incoming.estimated_calories ?? null,
    portion_size: existingDetail.portion_size ?? incoming.portion_size ?? null,
    suggested_food_category:
      existingDetail.suggested_food_category ?? incoming.suggested_food_category ?? null,
    suggested_brand_name:
      existingDetail.suggested_brand_name ?? incoming.suggested_brand_name ?? null,
    suggested_common_aliases: dedupeStrings([
      ...existingDetail.suggested_common_aliases,
      ...incoming.suggested_common_aliases,
    ]),
    suggested_serving_label:
      existingDetail.suggested_serving_label ?? incoming.suggested_serving_label ?? null,
    suggested_calories_kcal:
      existingDetail.suggested_calories_kcal ??
      incoming.suggested_calories_kcal ??
      incoming.estimated_calories ??
      null,
    suggested_protein_g:
      existingDetail.suggested_protein_g ?? incoming.suggested_protein_g ?? null,
    suggested_fat_g: existingDetail.suggested_fat_g ?? incoming.suggested_fat_g ?? null,
    suggested_carbs_g: existingDetail.suggested_carbs_g ?? incoming.suggested_carbs_g ?? null,
    suggested_fiber_g: existingDetail.suggested_fiber_g ?? incoming.suggested_fiber_g ?? null,
    suggested_sugar_g: existingDetail.suggested_sugar_g ?? incoming.suggested_sugar_g ?? null,
    suggested_sodium_mg:
      existingDetail.suggested_sodium_mg ?? incoming.suggested_sodium_mg ?? null,
    suggested_ingredient_names: mergedIngredients.map((ingredient) => ingredient.name),
    suggested_ingredients: mergedIngredients,
    suggested_default_signals: dedupeStrings([
      ...existingDetail.suggested_default_signals,
      ...incoming.suggested_default_signals,
    ]),
    enrichment_source_label:
      existingDetail.enrichment_source_label ?? incoming.enrichment_source_label ?? null,
    enrichment_source_ref:
      existingDetail.enrichment_source_ref ?? incoming.enrichment_source_ref ?? null,
    enrichment_confidence:
      existingDetail.enrichment_confidence ?? incoming.enrichment_confidence ?? null,
    enrichment_status:
      existingDetail.enrichment_status !== 'not_started'
        ? existingDetail.enrichment_status
        : incoming.enrichment_status,
    enrichment_last_attempt_at:
      existingDetail.enrichment_last_attempt_at ?? incoming.enrichment_last_attempt_at ?? null,
    enrichment_notes: existingDetail.enrichment_notes ?? incoming.enrichment_notes ?? null,
  };
}

function applyFoodEnrichmentResult(
  existing: FoodReferenceCandidateDetail,
  enriched: FoodReferenceCandidateDetail
): FoodReferenceCandidateDetail {
  const refreshedIngredients =
    enriched.suggested_ingredients.length > 0
      ? normalizeFoodCandidateIngredients(
          enriched.suggested_ingredients,
          enriched.enrichment_confidence
        )
      : buildFallbackFoodCandidateIngredients(
          enriched.suggested_ingredient_names,
          enriched.enrichment_confidence
        );

  return {
    ...existing,
    suggested_food_category: enriched.suggested_food_category,
    suggested_brand_name: enriched.suggested_brand_name,
    suggested_common_aliases: enriched.suggested_common_aliases,
    suggested_serving_label:
      enriched.suggested_serving_label ?? existing.suggested_serving_label ?? existing.portion_size,
    suggested_calories_kcal:
      enriched.suggested_calories_kcal ??
      existing.suggested_calories_kcal ??
      existing.estimated_calories,
    suggested_protein_g: enriched.suggested_protein_g,
    suggested_fat_g: enriched.suggested_fat_g,
    suggested_carbs_g: enriched.suggested_carbs_g,
    suggested_fiber_g: enriched.suggested_fiber_g,
    suggested_sugar_g: enriched.suggested_sugar_g,
    suggested_sodium_mg: enriched.suggested_sodium_mg,
    suggested_ingredient_names: refreshedIngredients.map((ingredient) => ingredient.name),
    suggested_ingredients: refreshedIngredients,
    suggested_default_signals: dedupeStrings([
      ...existing.suggested_default_signals,
      ...enriched.suggested_default_signals,
    ]),
    enrichment_source_label: enriched.enrichment_source_label,
    enrichment_source_ref: enriched.enrichment_source_ref,
    enrichment_confidence: enriched.enrichment_confidence,
    enrichment_status: enriched.enrichment_status,
    enrichment_last_attempt_at: enriched.enrichment_last_attempt_at,
    enrichment_notes: enriched.enrichment_notes,
  };
}

function applyMedicationEnrichmentResult(
  existing: MedicationReferenceCandidateDetail,
  enriched: MedicationReferenceCandidateDetail
): MedicationReferenceCandidateDetail {
  return {
    ...existing,
    suggested_generic_name:
      enriched.suggested_generic_name ?? existing.suggested_generic_name ?? null,
    suggested_brand_names: dedupeStrings([
      ...existing.suggested_brand_names,
      ...enriched.suggested_brand_names,
    ]),
    suggested_medication_class:
      enriched.suggested_medication_class ?? existing.suggested_medication_class ?? null,
    suggested_medication_family:
      enriched.suggested_medication_family ?? existing.suggested_medication_family ?? null,
    suggested_rxnorm_code:
      enriched.suggested_rxnorm_code ?? existing.suggested_rxnorm_code ?? null,
    suggested_gut_relevance:
      enriched.suggested_gut_relevance ?? existing.suggested_gut_relevance ?? null,
    suggested_common_gut_effects: dedupeStrings([
      ...existing.suggested_common_gut_effects,
      ...enriched.suggested_common_gut_effects,
    ]),
    suggested_interaction_flags: dedupeStrings([
      ...existing.suggested_interaction_flags,
      ...enriched.suggested_interaction_flags,
    ]),
    suggested_active_ingredients: dedupeStrings([
      ...existing.suggested_active_ingredients,
      ...enriched.suggested_active_ingredients,
    ]),
    suggested_common_dose_units: dedupeStrings([
      ...existing.suggested_common_dose_units,
      ...enriched.suggested_common_dose_units,
    ]),
    suggested_dosage_form:
      enriched.suggested_dosage_form ?? existing.suggested_dosage_form ?? null,
    suggested_route: enriched.suggested_route ?? existing.suggested_route ?? existing.route,
    enrichment_source_label:
      enriched.enrichment_source_label ?? existing.enrichment_source_label ?? null,
    enrichment_source_ref:
      enriched.enrichment_source_ref ?? existing.enrichment_source_ref ?? null,
    enrichment_confidence:
      enriched.enrichment_confidence ?? existing.enrichment_confidence ?? null,
    enrichment_status:
      enriched.enrichment_status !== 'not_started'
        ? enriched.enrichment_status
        : existing.enrichment_status,
    enrichment_last_attempt_at:
      enriched.enrichment_last_attempt_at ?? existing.enrichment_last_attempt_at ?? null,
    enrichment_notes: enriched.enrichment_notes ?? existing.enrichment_notes ?? null,
  };
}

function mergeMedicationCandidateDetails(
  existing: Record<string, unknown>,
  incoming: MedicationReferenceCandidateDetail
): MedicationReferenceCandidateDetail {
  const existingDetail = readMedicationCandidateDetail(existing);

  return applyMedicationEnrichmentResult(existingDetail, {
    dosage: existingDetail.dosage ?? incoming.dosage ?? null,
    medication_type: existingDetail.medication_type ?? incoming.medication_type ?? null,
    route: existingDetail.route ?? incoming.route ?? null,
    reason_for_use: existingDetail.reason_for_use ?? incoming.reason_for_use ?? null,
    regimen_status: existingDetail.regimen_status ?? incoming.regimen_status ?? null,
    timing_context: existingDetail.timing_context ?? incoming.timing_context ?? null,
    suggested_generic_name:
      existingDetail.suggested_generic_name ?? incoming.suggested_generic_name ?? null,
    suggested_brand_names: dedupeStrings([
      ...existingDetail.suggested_brand_names,
      ...incoming.suggested_brand_names,
    ]),
    suggested_medication_class:
      existingDetail.suggested_medication_class ?? incoming.suggested_medication_class ?? null,
    suggested_medication_family:
      existingDetail.suggested_medication_family ?? incoming.suggested_medication_family ?? null,
    suggested_rxnorm_code:
      existingDetail.suggested_rxnorm_code ?? incoming.suggested_rxnorm_code ?? null,
    suggested_gut_relevance:
      existingDetail.suggested_gut_relevance ?? incoming.suggested_gut_relevance ?? null,
    suggested_common_gut_effects: dedupeStrings([
      ...existingDetail.suggested_common_gut_effects,
      ...incoming.suggested_common_gut_effects,
    ]),
    suggested_interaction_flags: dedupeStrings([
      ...existingDetail.suggested_interaction_flags,
      ...incoming.suggested_interaction_flags,
    ]),
    suggested_active_ingredients: dedupeStrings([
      ...existingDetail.suggested_active_ingredients,
      ...incoming.suggested_active_ingredients,
    ]),
    suggested_common_dose_units: dedupeStrings([
      ...existingDetail.suggested_common_dose_units,
      ...incoming.suggested_common_dose_units,
    ]),
    suggested_dosage_form:
      existingDetail.suggested_dosage_form ?? incoming.suggested_dosage_form ?? null,
    suggested_route: existingDetail.suggested_route ?? incoming.suggested_route ?? null,
    enrichment_source_label:
      existingDetail.enrichment_source_label ?? incoming.enrichment_source_label ?? null,
    enrichment_source_ref:
      existingDetail.enrichment_source_ref ?? incoming.enrichment_source_ref ?? null,
    enrichment_confidence:
      existingDetail.enrichment_confidence ?? incoming.enrichment_confidence ?? null,
    enrichment_status:
      existingDetail.enrichment_status !== 'not_started'
        ? existingDetail.enrichment_status
        : incoming.enrichment_status,
    enrichment_last_attempt_at:
      existingDetail.enrichment_last_attempt_at ?? incoming.enrichment_last_attempt_at ?? null,
    enrichment_notes:
      existingDetail.enrichment_notes ?? incoming.enrichment_notes ?? null,
  });
}

function buildFoodEvidenceNotes(detail: FoodReferenceCandidateDetail): string | null {
  const parts: string[] = ['Accepted from reference review queue'];

  if (detail.tags.length > 0) {
    parts.push(`Observed tags: ${detail.tags.join(', ')}`);
  }

  if (detail.estimated_calories !== null) {
    parts.push(`Observed estimated calories: ${detail.estimated_calories}`);
  }

  if (detail.portion_size) {
    parts.push(`Observed portion size: ${detail.portion_size}`);
  }

  if (detail.suggested_brand_name) {
    parts.push(`Suggested brand: ${detail.suggested_brand_name}`);
  }

  if (detail.suggested_serving_label) {
    parts.push(`Suggested serving: ${detail.suggested_serving_label}`);
  }

  if (detail.suggested_calories_kcal !== null) {
    parts.push(`Suggested calories: ${detail.suggested_calories_kcal} kcal`);
  }

  const macroParts = [
    detail.suggested_protein_g !== null ? `protein ${detail.suggested_protein_g}g` : null,
    detail.suggested_fat_g !== null ? `fat ${detail.suggested_fat_g}g` : null,
    detail.suggested_carbs_g !== null ? `carbs ${detail.suggested_carbs_g}g` : null,
  ].filter((part): part is string => part !== null);

  if (macroParts.length > 0) {
    parts.push(`Suggested macros: ${macroParts.join(', ')}`);
  }

  const ingredientSummary = formatIngredientSuggestionSummary(detail.suggested_ingredients);
  if (ingredientSummary) {
    parts.push(`Suggested ingredients: ${ingredientSummary}`);
  }

  if (detail.suggested_common_aliases.length > 0) {
    parts.push(`Suggested aliases: ${detail.suggested_common_aliases.join(', ')}`);
  }

  if (detail.enrichment_source_label) {
    parts.push(`Enrichment source: ${detail.enrichment_source_label}`);
  }

  if (detail.enrichment_notes) {
    parts.push(`Enrichment notes: ${detail.enrichment_notes}`);
  }

  return parts.join(' | ');
}

function buildMedicationEvidenceNotes(detail: MedicationReferenceCandidateDetail): string | null {
  const parts: string[] = ['Accepted from reference review queue'];

  if (detail.dosage) parts.push(`Observed dosage: ${detail.dosage}`);
  if (detail.route) parts.push(`Observed route: ${detail.route}`);
  if (detail.reason_for_use) parts.push(`Observed reason: ${detail.reason_for_use}`);
  if (detail.regimen_status) parts.push(`Observed regimen: ${detail.regimen_status}`);
  if (detail.timing_context) parts.push(`Observed timing: ${detail.timing_context}`);
  if (detail.suggested_generic_name) {
    parts.push(`Suggested generic: ${detail.suggested_generic_name}`);
  }
  if (detail.suggested_brand_names.length > 0) {
    parts.push(`Suggested brands: ${detail.suggested_brand_names.join(', ')}`);
  }
  if (detail.suggested_medication_class) {
    parts.push(`Suggested class: ${detail.suggested_medication_class}`);
  }
  if (detail.suggested_medication_family) {
    parts.push(`Suggested family: ${detail.suggested_medication_family}`);
  }
  if (detail.suggested_common_dose_units.length > 0) {
    parts.push(`Common dose units: ${detail.suggested_common_dose_units.join(', ')}`);
  }
  if (detail.suggested_active_ingredients.length > 0) {
    parts.push(`Active ingredients: ${detail.suggested_active_ingredients.join(', ')}`);
  }
  if (detail.suggested_common_gut_effects.length > 0) {
    parts.push(`Gut effects: ${detail.suggested_common_gut_effects.join(', ')}`);
  }
  if (detail.enrichment_source_label) {
    parts.push(`Enrichment source: ${detail.enrichment_source_label}`);
  }
  if (detail.enrichment_notes) {
    parts.push(`Enrichment notes: ${detail.enrichment_notes}`);
  }

  return parts.join(' | ');
}

function deriveFoodSignalsFromTags(tags: string[]): string[] {
  const signals = tags.flatMap((tag) => FOOD_TAG_TO_SIGNAL[normalizeLookupKey(tag)] ?? []);
  return dedupeStrings(signals);
}

function matchIngredientCatalogSignals(name: string): {
  signals: IngredientSignalKey[];
  gutReactions: string[];
} {
  const normalizedName = normalizeLookupKey(name);
  const matchedEntries = INGREDIENT_CATALOG.filter((entry) =>
    entry.matchTerms.some((term) => {
      const normalizedTerm = normalizeLookupKey(term);
      return (
        normalizedName.includes(normalizedTerm) ||
        normalizedTerm.includes(normalizedName)
      );
    })
  );

  return {
    signals: dedupeStrings(matchedEntries.flatMap((entry) => entry.signals)) as IngredientSignalKey[],
    gutReactions: dedupeStrings(
      matchedEntries.flatMap((entry) => entry.commonGutEffects)
    ),
  };
}

function inferIngredientCategory(
  ingredientName: string,
  signals: string[]
): string | null {
  const normalizedName = normalizeLookupKey(ingredientName);

  if (signals.includes('dairy')) return 'dairy';
  if (signals.includes('gluten')) return 'grain';
  if (signals.includes('spicy')) return 'seasoning';
  if (signals.includes('artificial_sweetener')) return 'sweetener';
  if (signals.includes('alcohol')) return 'alcohol';
  if (signals.includes('caffeine_food')) return 'stimulant';

  if (
    normalizedName.includes('beef') ||
    normalizedName.includes('chicken') ||
    normalizedName.includes('pork') ||
    normalizedName.includes('turkey') ||
    normalizedName.includes('sausage') ||
    normalizedName.includes('bacon')
  ) {
    return 'protein';
  }

  if (
    normalizedName.includes('onion') ||
    normalizedName.includes('garlic') ||
    normalizedName.includes('tomato') ||
    normalizedName.includes('pepper') ||
    normalizedName.includes('spinach') ||
    normalizedName.includes('broccoli')
  ) {
    return 'vegetable';
  }

  if (
    normalizedName.includes('bean') ||
    normalizedName.includes('lentil') ||
    normalizedName.includes('chickpea')
  ) {
    return 'legume';
  }

  if (
    normalizedName.includes('oil') ||
    normalizedName.includes('butter') ||
    normalizedName.includes('cream')
  ) {
    return 'fat';
  }

  return null;
}

function inferIngredientFodmapLevel(signals: string[]): IngredientFodmapLevel | null {
  if (signals.includes('high_fodmap')) return 'high';
  if (signals.length > 0) return 'unknown';
  return null;
}

function buildIngredientEvidenceNotes(params: {
  ingredientName: string;
  foodDisplayName: string;
  sourceLabel: string | null;
  sourceRef: string | null;
}): string {
  const parts = [
    `Promoted from accepted food review for ${params.foodDisplayName}.`,
  ];

  if (params.sourceLabel) {
    parts.push(`Enrichment source: ${params.sourceLabel}`);
  }

  if (params.sourceRef) {
    parts.push(`Source ref: ${params.sourceRef}`);
  }

  return parts.join(' | ');
}

function buildFoodReferenceIngredientLinkNotes(
  suggestion: FoodReferenceCandidateIngredient
): string {
  const parts = ['Promoted from accepted food review candidate.'];

  if (suggestion.confidence !== null) {
    parts.push(`Confidence ${Math.round(suggestion.confidence * 100)}%.`);
  }

  if (suggestion.ingredient_fraction !== null) {
    parts.push(`Estimated fraction ${Math.round(suggestion.ingredient_fraction * 100)}% of serving.`);
  }

  if (suggestion.suggested_signals.length > 0) {
    parts.push(`Signals: ${suggestion.suggested_signals.join(', ')}.`);
  }

  if (suggestion.notes) {
    parts.push(`Reviewed note: ${suggestion.notes}`);
  }

  return parts.join(' ');
}

function buildBackfilledIngredientNote(
  suggestion: FoodReferenceCandidateIngredient,
  isFirstIngredient: boolean
): string | null {
  const parts = [isFirstIngredient ? 'Backfilled from accepted food reference ingredients.' : ''];

  if (suggestion.confidence !== null) {
    parts.push(`Confidence ${Math.round(suggestion.confidence * 100)}%.`);
  }

  if (suggestion.ingredient_fraction !== null) {
    parts.push(`Estimated fraction ${Math.round(suggestion.ingredient_fraction * 100)}% of serving.`);
  }

  if (suggestion.notes) {
    parts.push(`Reviewed note: ${suggestion.notes}`);
  }

  const cleaned = parts.map((part) => part.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned.join(' ') : null;
}

async function resolveExistingIngredientReference(
  ingredientName: string
): Promise<IngredientReferenceItemRow | null> {
  const cleanedName = ingredientName.replace(/[%_,'"]/g, '').trim();
  if (!cleanedName) return null;

  const { data, error } = await supabase
    .from('ingredient_reference_items')
    .select('*')
    .or(
      [
        `display_name.ilike.${cleanedName}`,
        `canonical_name.ilike.${cleanedName}`,
        `display_name.ilike.%${cleanedName}%`,
        `canonical_name.ilike.%${cleanedName}%`,
      ].join(',')
    )
    .limit(12);

  if (error) throw error;

  const normalizedName = normalizeLookupKey(ingredientName);
  const candidates = (data ?? []) as IngredientReferenceItemRow[];

  return (
    candidates.find(
      (candidate) =>
        normalizeLookupKey(candidate.display_name) === normalizedName ||
        normalizeLookupKey(candidate.canonical_name) === normalizedName ||
        candidate.common_aliases.some((alias) => normalizeLookupKey(alias) === normalizedName)
    ) ?? null
  );
}

async function promoteIngredientReferencesForFood(params: {
  userId: string;
  foodReferenceId: string;
  foodDisplayName: string;
  detail: FoodReferenceCandidateDetail;
}): Promise<void> {
  const ingredientSuggestions =
    params.detail.suggested_ingredients.length > 0
      ? normalizeFoodCandidateIngredients(
          params.detail.suggested_ingredients,
          params.detail.enrichment_confidence
        )
      : buildFallbackFoodCandidateIngredients(
          params.detail.suggested_ingredient_names,
          params.detail.enrichment_confidence
        );
  const suggestionByNormalizedName = new Map(
    ingredientSuggestions.map((suggestion) => [normalizeLookupKey(suggestion.name), suggestion])
  );

  if (ingredientSuggestions.length > 0) {
    const ingredientReferencesByKey = new Map<string, IngredientReferenceItemRow>();
    const missingIngredientRows: Array<{
      canonical_name: string;
      display_name: string;
      ingredient_category: string | null;
      fodmap_level: IngredientFodmapLevel | null;
      common_aliases: string[];
      default_signals: string[];
      typical_gut_reactions: string[];
      evidence_notes: string;
    }> = [];

    for (const suggestion of ingredientSuggestions) {
      const ingredientName = suggestion.name;
      const existingReference = await resolveExistingIngredientReference(ingredientName);
      if (existingReference) {
        ingredientReferencesByKey.set(normalizeLookupKey(ingredientName), existingReference);
        continue;
      }

      const normalizedKey = normalizeLookupKey(ingredientName);
      if (missingIngredientRows.some((row) => row.canonical_name === normalizedKey)) {
        continue;
      }

      const derived = matchIngredientCatalogSignals(ingredientName);
      const mergedSignals = dedupeStrings([
        ...suggestion.suggested_signals,
        ...derived.signals,
      ]);

      missingIngredientRows.push({
        canonical_name: normalizedKey,
        display_name: ingredientName.trim(),
        ingredient_category: inferIngredientCategory(ingredientName, mergedSignals),
        fodmap_level: inferIngredientFodmapLevel(mergedSignals),
        common_aliases: [],
        default_signals: mergedSignals,
        typical_gut_reactions: derived.gutReactions,
        evidence_notes: buildIngredientEvidenceNotes({
          ingredientName,
          foodDisplayName: params.foodDisplayName,
          sourceLabel: params.detail.enrichment_source_label,
          sourceRef: params.detail.enrichment_source_ref,
        }),
      });
    }

    if (missingIngredientRows.length > 0) {
      const { data, error } = await supabase
        .from('ingredient_reference_items')
        .insert(missingIngredientRows)
        .select('*');

      if (error) throw error;

      for (const row of (data ?? []) as IngredientReferenceItemRow[]) {
        ingredientReferencesByKey.set(normalizeLookupKey(row.display_name), row);
        ingredientReferencesByKey.set(normalizeLookupKey(row.canonical_name), row);
      }
    }

    const orderedIngredientReferences = ingredientSuggestions
      .map((suggestion, index) => {
        const normalizedKey = normalizeLookupKey(suggestion.name);
        const ingredientReference = ingredientReferencesByKey.get(normalizedKey) ?? null;

        if (!ingredientReference) return null;

        return {
          ingredientReference,
          suggestion,
          fallbackRank: index + 1,
        };
      })
      .filter(
        (
          row
        ): row is {
          ingredientReference: IngredientReferenceItemRow;
          suggestion: FoodReferenceCandidateIngredient;
          fallbackRank: number;
        } => row !== null
      );

    if (orderedIngredientReferences.length > 0) {
      const { data: existingLinks, error: existingLinksError } = await supabase
        .from('food_reference_ingredients')
        .select('*')
        .eq('food_reference_id', params.foodReferenceId);

      if (existingLinksError) throw existingLinksError;

      const existingLinksByIngredientId = new Map(
        ((existingLinks ?? []) as FoodReferenceIngredientRow[]).map((row) => [
          row.ingredient_reference_id,
          row,
        ])
      );

      const newFoodReferenceLinks: Array<{
        food_reference_id: string;
        ingredient_reference_id: string;
        grams_per_default_serving: number | null;
        ingredient_fraction: number | null;
        prominence_rank: number | null;
        is_primary: boolean;
        notes: string;
      }> = [];

      for (const {
        ingredientReference,
        suggestion,
        fallbackRank,
      } of orderedIngredientReferences) {
        const existingLink = existingLinksByIngredientId.get(ingredientReference.id);
        const nextLink = {
          food_reference_id: params.foodReferenceId,
          ingredient_reference_id: ingredientReference.id,
          grams_per_default_serving: null,
          ingredient_fraction:
            suggestion.ingredient_fraction ?? existingLink?.ingredient_fraction ?? null,
          prominence_rank:
            suggestion.prominence_rank ?? existingLink?.prominence_rank ?? fallbackRank,
          is_primary: suggestion.is_primary || existingLink?.is_primary || fallbackRank === 1,
          notes: buildFoodReferenceIngredientLinkNotes({
            ...suggestion,
            notes: suggestion.notes ?? existingLink?.notes ?? null,
          }),
        };

        if (!existingLink) {
          newFoodReferenceLinks.push(nextLink);
          continue;
        }

        const hasMeaningfulChange =
          existingLink.ingredient_fraction !== nextLink.ingredient_fraction ||
          existingLink.prominence_rank !== nextLink.prominence_rank ||
          existingLink.is_primary !== nextLink.is_primary ||
          existingLink.notes !== nextLink.notes;

        if (hasMeaningfulChange) {
          const { error } = await supabase
            .from('food_reference_ingredients')
            .update({
              ingredient_fraction: nextLink.ingredient_fraction,
              prominence_rank: nextLink.prominence_rank,
              is_primary: nextLink.is_primary,
              notes: nextLink.notes,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingLink.id);

          if (error) throw error;
        }
      }

      if (newFoodReferenceLinks.length > 0) {
        const { error } = await supabase
          .from('food_reference_ingredients')
          .insert(newFoodReferenceLinks);

        if (error) throw error;
      }
    }
  }

  const { data: finalFoodReferenceLinks, error: finalLinksError } = await supabase
    .from('food_reference_ingredients')
    .select('*')
    .eq('food_reference_id', params.foodReferenceId)
    .order('prominence_rank', { ascending: true });

  if (finalLinksError) throw finalLinksError;

  const finalLinks = (finalFoodReferenceLinks ?? []) as FoodReferenceIngredientRow[];
  if (finalLinks.length === 0) return;

  const ingredientReferenceIds = [
    ...new Set(finalLinks.map((row) => row.ingredient_reference_id)),
  ];

  const { data: ingredientReferenceRows, error: ingredientReferenceRowsError } = await supabase
    .from('ingredient_reference_items')
    .select('*')
    .in('id', ingredientReferenceIds);

  if (ingredientReferenceRowsError) throw ingredientReferenceRowsError;

  const ingredientReferenceById = new Map(
    ((ingredientReferenceRows ?? []) as IngredientReferenceItemRow[]).map((row) => [
      row.id,
      row,
    ])
  );

  const orderedIngredientReferences = finalLinks
    .map((link, index) => {
      const ingredientReference = ingredientReferenceById.get(link.ingredient_reference_id) ?? null;
      if (!ingredientReference) return null;

      const fallbackSuggestion = buildFoodCandidateIngredient({
        name: ingredientReference.display_name ?? ingredientReference.canonical_name,
        confidence: params.detail.enrichment_confidence ?? 0.78,
        prominenceRank: link.prominence_rank ?? index + 1,
        isPrimary: link.is_primary,
        ingredientFraction: link.ingredient_fraction,
        suggestedSignals: ingredientReference.default_signals,
        notes: link.notes,
      });

      if (!fallbackSuggestion) return null;

      return {
        ingredientReference,
        suggestion:
          suggestionByNormalizedName.get(
            normalizeLookupKey(
              ingredientReference.display_name ?? ingredientReference.canonical_name
            )
          ) ?? fallbackSuggestion,
      };
    })
    .filter(
      (
        row
      ): row is {
        ingredientReference: IngredientReferenceItemRow;
        suggestion: FoodReferenceCandidateIngredient;
      } => row !== null
    );

  if (orderedIngredientReferences.length === 0) return;

  const { data: foodLogItems, error: foodLogItemsError } = await supabase
    .from('food_log_items')
    .select('*')
    .eq('user_id', params.userId)
    .eq('normalized_food_id', params.foodReferenceId);

  if (foodLogItemsError) throw foodLogItemsError;

  const normalizedFoodLogItems = (foodLogItems ?? []) as FoodLogItemRow[];
  if (normalizedFoodLogItems.length === 0) return;

  const foodLogItemIds = normalizedFoodLogItems.map((item) => item.id);
  const { data: existingLogIngredients, error: existingLogIngredientsError } = await supabase
    .from('food_log_item_ingredients')
    .select('food_log_item_id')
    .eq('user_id', params.userId)
    .in('food_log_item_id', foodLogItemIds);

  if (existingLogIngredientsError) throw existingLogIngredientsError;

  const foodLogItemsWithIngredients = new Set(
    (existingLogIngredients ?? []).map((row) => row.food_log_item_id as string)
  );

  const backfillIngredientRows = normalizedFoodLogItems
    .filter((foodLogItem) => !foodLogItemsWithIngredients.has(foodLogItem.id))
    .flatMap((foodLogItem) =>
      orderedIngredientReferences.map(({ ingredientReference, suggestion }, index) => ({
        user_id: params.userId,
        food_log_item_id: foodLogItem.id,
        ingredient_reference_id: ingredientReference.id,
        ingredient_name_text:
          ingredientReference.display_name ?? ingredientReference.canonical_name,
        quantity_estimate: null,
        quantity_unit: null,
        source_method: 'catalog_match' as const,
        confidence_score:
          suggestion.confidence ?? params.detail.enrichment_confidence ?? 0.9,
        gut_signals_override: suggestion.suggested_signals,
        notes: buildBackfilledIngredientNote(suggestion, index === 0),
      }))
    );

  if (backfillIngredientRows.length > 0) {
    const { error } = await supabase
      .from('food_log_item_ingredients')
      .insert(backfillIngredientRows);

    if (error) throw error;
  }
}

async function findPendingCandidate(params: {
  userId: string;
  candidateKind: ReferenceCandidateKind;
  normalizedNameKey: string;
}): Promise<ReferenceReviewCandidateRow | null> {
  const { data, error } = await supabase
    .from('reference_review_candidates')
    .select('*')
    .eq('user_id', params.userId)
    .eq('candidate_kind', params.candidateKind)
    .eq('normalized_name_key', params.normalizedNameKey)
    .eq('review_status', 'pending_review')
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ReferenceReviewCandidateRow | null;
}

async function resolveExistingFoodReference(
  displayName: string
): Promise<FoodReferenceItemRow | null> {
  const cleanedName = displayName.replace(/[%_,'"]/g, '').trim();
  if (!cleanedName) return null;

  const { data, error } = await supabase
    .from('food_reference_items')
    .select('*')
    .or(
      [
        `display_name.ilike.${cleanedName}`,
        `canonical_name.ilike.${cleanedName}`,
        `display_name.ilike.%${cleanedName}%`,
        `canonical_name.ilike.%${cleanedName}%`,
      ].join(',')
    )
    .limit(12);

  if (error) throw error;

  const normalizedName = normalizeLookupKey(displayName);
  const candidates = (data ?? []) as FoodReferenceItemRow[];

  return (
    candidates.find(
      (candidate) =>
        normalizeLookupKey(candidate.display_name) === normalizedName ||
        normalizeLookupKey(candidate.canonical_name) === normalizedName ||
        candidate.common_aliases.some((alias) => normalizeLookupKey(alias) === normalizedName)
    ) ?? null
  );
}

async function resolveExistingMedicationReference(
  displayName: string
): Promise<MedicationReferenceItemRow | null> {
  const cleanedName = displayName.replace(/[%_,'"]/g, '').trim();
  if (!cleanedName) return null;

  const { data, error } = await supabase
    .from('medication_reference_items')
    .select('*')
    .or(
      [
        `display_name.ilike.${cleanedName}`,
        `generic_name.ilike.${cleanedName}`,
        `display_name.ilike.%${cleanedName}%`,
        `generic_name.ilike.%${cleanedName}%`,
      ].join(',')
    )
    .limit(12);

  if (error) throw error;

  const normalizedName = normalizeLookupKey(displayName);
  const candidates = (data ?? []) as MedicationReferenceItemRow[];

  return (
    candidates.find(
      (candidate) =>
        normalizeLookupKey(candidate.display_name) === normalizedName ||
        normalizeLookupKey(candidate.generic_name) === normalizedName ||
        candidate.brand_names.some((brand) => normalizeLookupKey(brand) === normalizedName)
    ) ?? null
  );
}

export async function queueFoodReferenceCandidate(
  input: QueueFoodReferenceCandidateInput
): Promise<void> {
  const displayName = input.displayName.trim();
  if (!displayName) return;

  const normalizedNameKey = normalizeLookupKey(displayName);
  if (!normalizedNameKey) return;

  const detail: FoodReferenceCandidateDetail = {
    tags: dedupeStrings(input.tags ?? []),
    estimated_calories:
      typeof input.estimatedCalories === 'number' ? input.estimatedCalories : null,
    portion_size: cleanOptionalText(input.portionSize),
    suggested_food_category: null,
    suggested_brand_name: null,
    suggested_common_aliases: [],
    suggested_serving_label: cleanOptionalText(input.portionSize),
    suggested_calories_kcal:
      typeof input.estimatedCalories === 'number' ? input.estimatedCalories : null,
    suggested_protein_g: null,
    suggested_fat_g: null,
    suggested_carbs_g: null,
    suggested_fiber_g: null,
    suggested_sugar_g: null,
    suggested_sodium_mg: null,
    suggested_ingredient_names: [],
    suggested_ingredients: [],
    suggested_default_signals: deriveFoodSignalsFromTags(dedupeStrings(input.tags ?? [])),
    enrichment_source_label:
      typeof input.estimatedCalories === 'number' ? 'log_autocomplete' : null,
    enrichment_source_ref: null,
    enrichment_confidence: typeof input.estimatedCalories === 'number' ? 0.35 : null,
    enrichment_status: 'not_started',
    enrichment_last_attempt_at: null,
    enrichment_notes: null,
  };

  const existing = await findPendingCandidate({
    userId: input.userId,
    candidateKind: 'food',
    normalizedNameKey,
  });

  const now = new Date().toISOString();

  if (existing) {
    const existingDetail = readFoodCandidateDetail(existing.detail);
    const mergedDetail = mergeFoodCandidateDetails(existing.detail, detail);

    const { error } = await supabase
      .from('reference_review_candidates')
      .update({
        display_name: displayName,
        source_log_id: input.foodLogId,
        source_item_id: input.foodLogItemId,
        detail: mergedDetail,
        review_notes:
          'Custom food entry captured from your logs because it did not match the current reference table.',
        times_seen: existing.times_seen + 1,
        last_seen_at: now,
        updated_at: now,
      })
      .eq('id', existing.id)
      .eq('user_id', input.userId);

    if (error) throw error;

    if (
      existingDetail.enrichment_status === 'not_started' ||
      existingDetail.enrichment_source_label === null
    ) {
      void refreshFoodReferenceCandidateEnrichment(input.userId, existing.id).catch(() => {});
    }
    return;
  }

  const { data, error } = await supabase
    .from('reference_review_candidates')
    .insert({
      user_id: input.userId,
      candidate_kind: 'food',
      display_name: displayName,
      normalized_name_key: normalizedNameKey,
      source_log_type: 'food_log',
      source_log_id: input.foodLogId,
      source_item_id: input.foodLogItemId,
      detail,
      review_status: 'pending_review',
      review_notes:
        'Custom food entry captured from your logs because it did not match the current reference table.',
      times_seen: 1,
      last_seen_at: now,
    })
    .select('id')
    .maybeSingle();

  if (error) throw error;

  const insertedCandidateId =
    data && typeof data.id === 'string' && data.id.length > 0 ? data.id : null;

  if (insertedCandidateId) {
    void refreshFoodReferenceCandidateEnrichment(input.userId, insertedCandidateId).catch(
      () => {}
    );
  }
}

export async function queueMedicationReferenceCandidate(
  input: QueueMedicationReferenceCandidateInput
): Promise<void> {
  const displayName = input.displayName.trim();
  if (!displayName) return;

  const normalizedNameKey = normalizeLookupKey(displayName);
  if (!normalizedNameKey) return;

  let detail: MedicationReferenceCandidateDetail = {
    dosage: cleanOptionalText(input.dosage),
    medication_type: input.medicationType ?? null,
    route: cleanOptionalText(input.route),
    reason_for_use: cleanOptionalText(input.reasonForUse),
    regimen_status: input.regimenStatus ?? null,
    timing_context: cleanOptionalText(input.timingContext),
    suggested_generic_name: null,
    suggested_brand_names: [],
    suggested_medication_class: null,
    suggested_medication_family: null,
    suggested_rxnorm_code: null,
    suggested_gut_relevance: null,
    suggested_common_gut_effects: [],
    suggested_interaction_flags: [],
    suggested_active_ingredients: [],
    suggested_common_dose_units: [],
    suggested_dosage_form: null,
    suggested_route: cleanOptionalText(input.route),
    enrichment_source_label: null,
    enrichment_source_ref: null,
    enrichment_confidence: null,
    enrichment_status: 'not_started',
    enrichment_last_attempt_at: null,
    enrichment_notes: null,
  };

  try {
    const enriched = await fetchMedicationEnrichment({
      displayName,
      observedMedicationType: detail.medication_type,
      observedRoute: detail.route,
      observedDosage: detail.dosage,
      reasonForUse: detail.reason_for_use,
    });

    detail = applyMedicationEnrichmentResult(detail, {
      ...detail,
      suggested_generic_name: enriched.suggestedGenericName,
      suggested_brand_names: enriched.suggestedBrandNames,
      suggested_medication_class: enriched.suggestedMedicationClass,
      suggested_medication_family: enriched.suggestedMedicationFamily,
      suggested_rxnorm_code: enriched.suggestedRxnormCode,
      suggested_gut_relevance: enriched.suggestedGutRelevance,
      suggested_common_gut_effects: enriched.suggestedCommonGutEffects,
      suggested_interaction_flags: enriched.suggestedInteractionFlags,
      suggested_active_ingredients: enriched.suggestedActiveIngredients,
      suggested_common_dose_units: enriched.suggestedCommonDoseUnits,
      suggested_dosage_form: enriched.suggestedDosageForm,
      suggested_route: enriched.suggestedRoute,
      enrichment_source_label: enriched.enrichmentSourceLabel,
      enrichment_source_ref: enriched.enrichmentSourceRef,
      enrichment_confidence: enriched.enrichmentConfidence,
      enrichment_status: enriched.enrichmentStatus,
      enrichment_last_attempt_at: enriched.enrichmentLastAttemptAt,
      enrichment_notes: enriched.enrichmentNotes,
    });
  } catch (error) {
    detail = {
      ...detail,
      enrichment_status: 'failed',
      enrichment_last_attempt_at: new Date().toISOString(),
      enrichment_notes:
        error instanceof Error
          ? error.message
          : 'Medication enrichment failed before the candidate entered review.',
    };
  }

  const existing = await findPendingCandidate({
    userId: input.userId,
    candidateKind: 'medication',
    normalizedNameKey,
  });

  const now = new Date().toISOString();

  if (existing) {
    const mergedDetail = mergeMedicationCandidateDetails(existing.detail, detail);

    const { error } = await supabase
      .from('reference_review_candidates')
      .update({
        display_name: displayName,
        source_log_id: input.medicationLogId,
        source_item_id: input.medicationLogId,
        detail: mergedDetail,
        review_notes:
          'Custom medication entry captured from your logs because it did not match the current reference table.',
        times_seen: existing.times_seen + 1,
        last_seen_at: now,
        updated_at: now,
      })
      .eq('id', existing.id)
      .eq('user_id', input.userId);

    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('reference_review_candidates')
    .insert({
      user_id: input.userId,
      candidate_kind: 'medication',
      display_name: displayName,
      normalized_name_key: normalizedNameKey,
      source_log_type: 'medication_log',
      source_log_id: input.medicationLogId,
      source_item_id: input.medicationLogId,
      detail,
      review_status: 'pending_review',
      review_notes:
        'Custom medication entry captured from your logs because it did not match the current reference table.',
      times_seen: 1,
      last_seen_at: now,
    });

  if (error) throw error;
}

async function fetchReferenceReviewCandidateById(
  userId: string,
  candidateId: string
): Promise<ReferenceReviewCandidateRow> {
  const { data, error } = await supabase
    .from('reference_review_candidates')
    .select('*')
    .eq('id', candidateId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Reference candidate not found.');

  return data as ReferenceReviewCandidateRow;
}

export async function refreshFoodReferenceCandidateEnrichment(
  userId: string,
  candidateId: string
): Promise<ReferenceReviewCandidateRow> {
  const candidate = await fetchReferenceReviewCandidateById(userId, candidateId);
  if (candidate.candidate_kind !== 'food') {
    throw new Error('Only food reference candidates can be enriched from external food sources.');
  }

  const existingDetail = readFoodCandidateDetail(candidate.detail);
  const enriched = await fetchFoodEnrichment({
    displayName: candidate.display_name,
    observedTags: existingDetail.tags,
    observedPortionSize: existingDetail.portion_size,
    observedCalories: existingDetail.estimated_calories,
    forceRefresh: true,
  });

  const enrichedDetail = applyFoodEnrichmentResult(existingDetail, {
    ...existingDetail,
    suggested_food_category: enriched.suggestedFoodCategory,
    suggested_brand_name: enriched.suggestedBrandName,
    suggested_common_aliases: enriched.suggestedCommonAliases,
    suggested_serving_label: enriched.suggestedServingLabel,
    suggested_calories_kcal: enriched.suggestedCaloriesKcal,
    suggested_protein_g: enriched.suggestedProteinG,
    suggested_fat_g: enriched.suggestedFatG,
    suggested_carbs_g: enriched.suggestedCarbsG,
    suggested_fiber_g: enriched.suggestedFiberG,
    suggested_sugar_g: enriched.suggestedSugarG,
    suggested_sodium_mg: enriched.suggestedSodiumMg,
    suggested_ingredient_names: enriched.suggestedIngredientNames,
    suggested_ingredients: buildFallbackFoodCandidateIngredients(
      enriched.suggestedIngredientNames,
      enriched.enrichmentConfidence
    ),
    suggested_default_signals: enriched.suggestedDefaultSignals,
    enrichment_source_label: enriched.enrichmentSourceLabel,
    enrichment_source_ref: enriched.enrichmentSourceRef,
    enrichment_confidence: enriched.enrichmentConfidence,
    enrichment_status: enriched.enrichmentStatus,
    enrichment_last_attempt_at: enriched.enrichmentLastAttemptAt,
    enrichment_notes: enriched.enrichmentNotes,
  });

  const { data, error } = await supabase
    .from('reference_review_candidates')
    .update({
      detail: enrichedDetail,
      updated_at: new Date().toISOString(),
    })
    .eq('id', candidateId)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Food enrichment update did not return the refreshed candidate.');

  return data as ReferenceReviewCandidateRow;
}

export async function updateFoodReferenceCandidateDetail(
  input: UpdateFoodReferenceCandidateDetailInput
): Promise<ReferenceReviewCandidateRow> {
  const candidate = await fetchReferenceReviewCandidateById(input.userId, input.candidateId);
  if (candidate.candidate_kind !== 'food') {
    throw new Error('Only food reference candidates can be edited with food enrichment fields.');
  }

  const normalizedDetail = readFoodCandidateDetail(input.detail);

  const { data, error } = await supabase
    .from('reference_review_candidates')
    .update({
      detail: normalizedDetail,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.candidateId)
    .eq('user_id', input.userId)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Food reference candidate update did not return a row.');

  return data as ReferenceReviewCandidateRow;
}

export async function refreshMedicationReferenceCandidateEnrichment(
  userId: string,
  candidateId: string
): Promise<ReferenceReviewCandidateRow> {
  const candidate = await fetchReferenceReviewCandidateById(userId, candidateId);
  if (candidate.candidate_kind !== 'medication') {
    throw new Error('Only medication reference candidates can be enriched with medication knowledge.');
  }

  const existingDetail = readMedicationCandidateDetail(candidate.detail);
  const enriched = await fetchMedicationEnrichment({
    displayName: candidate.display_name,
    observedMedicationType: existingDetail.medication_type,
    observedRoute: existingDetail.route,
    observedDosage: existingDetail.dosage,
    reasonForUse: existingDetail.reason_for_use,
    forceRefresh: true,
  });

  const enrichedDetail = applyMedicationEnrichmentResult(existingDetail, {
    ...existingDetail,
    suggested_generic_name: enriched.suggestedGenericName,
    suggested_brand_names: enriched.suggestedBrandNames,
    suggested_medication_class: enriched.suggestedMedicationClass,
    suggested_medication_family: enriched.suggestedMedicationFamily,
    suggested_rxnorm_code: enriched.suggestedRxnormCode,
    suggested_gut_relevance: enriched.suggestedGutRelevance,
    suggested_common_gut_effects: enriched.suggestedCommonGutEffects,
    suggested_interaction_flags: enriched.suggestedInteractionFlags,
    suggested_active_ingredients: enriched.suggestedActiveIngredients,
    suggested_common_dose_units: enriched.suggestedCommonDoseUnits,
    suggested_dosage_form: enriched.suggestedDosageForm,
    suggested_route: enriched.suggestedRoute,
    enrichment_source_label: enriched.enrichmentSourceLabel,
    enrichment_source_ref: enriched.enrichmentSourceRef,
    enrichment_confidence: enriched.enrichmentConfidence,
    enrichment_status: enriched.enrichmentStatus,
    enrichment_last_attempt_at: enriched.enrichmentLastAttemptAt,
    enrichment_notes: enriched.enrichmentNotes,
  });

  const { data, error } = await supabase
    .from('reference_review_candidates')
    .update({
      detail: enrichedDetail,
      updated_at: new Date().toISOString(),
    })
    .eq('id', candidateId)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('Medication enrichment update did not return the refreshed candidate.');
  }

  return data as ReferenceReviewCandidateRow;
}

export async function updateMedicationReferenceCandidateDetail(
  input: UpdateMedicationReferenceCandidateDetailInput
): Promise<ReferenceReviewCandidateRow> {
  const candidate = await fetchReferenceReviewCandidateById(input.userId, input.candidateId);
  if (candidate.candidate_kind !== 'medication') {
    throw new Error('Only medication reference candidates can be edited with medication enrichment fields.');
  }

  const normalizedDetail = readMedicationCandidateDetail(input.detail);

  const { data, error } = await supabase
    .from('reference_review_candidates')
    .update({
      detail: normalizedDetail,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.candidateId)
    .eq('user_id', input.userId)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Medication reference candidate update did not return a row.');

  return data as ReferenceReviewCandidateRow;
}

export async function fetchReferenceReviewCandidates(
  userId: string,
  statusFilter?: ReferenceCandidateReviewStatus
): Promise<ReferenceReviewCandidateRow[]> {
  let query = supabase
    .from('reference_review_candidates')
    .select('*')
    .eq('user_id', userId);

  if (statusFilter) {
    query = query.eq('review_status', statusFilter);
  }

  const { data, error } = await query
    .order('last_seen_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReferenceReviewCandidateRow[];
}

export async function fetchPendingReferenceCandidateCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('reference_review_candidates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('review_status', 'pending_review');

  if (error) throw error;
  return count ?? 0;
}

async function markCandidateReviewed(params: {
  userId: string;
  candidateId: string;
  status: ReferenceCandidateReviewStatus;
  promotedReferenceId: string | null;
  reviewNotes: string;
}): Promise<void> {
  const { error } = await supabase
    .from('reference_review_candidates')
    .update({
      review_status: params.status,
      promoted_reference_id: params.promotedReferenceId,
      review_notes: params.reviewNotes,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.candidateId)
    .eq('user_id', params.userId);

  if (error) throw error;
}

async function promoteFoodCandidate(
  userId: string,
  candidate: ReferenceReviewCandidateRow
): Promise<{ status: ReferenceCandidateReviewStatus; promotedReferenceId: string }> {
  const existingReference = await resolveExistingFoodReference(candidate.display_name);
  if (existingReference) {
    const detail = readFoodCandidateDetail(candidate.detail);

    const { error: updateFoodLogsError } = await supabase
      .from('food_log_items')
      .update({
        normalized_food_id: existingReference.id,
        confidence_score: 0.88,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .ilike('display_name', candidate.display_name)
      .is('normalized_food_id', null);

    if (updateFoodLogsError) throw updateFoodLogsError;

    await promoteIngredientReferencesForFood({
      userId,
      foodReferenceId: existingReference.id,
      foodDisplayName: candidate.display_name,
      detail,
    });

    return {
      status: 'merged',
      promotedReferenceId: existingReference.id,
    };
  }

  const detail = readFoodCandidateDetail(candidate.detail);
  const canonicalName = normalizeLookupKey(candidate.display_name);

  const { data, error } = await supabase
    .from('food_reference_items')
    .insert({
      canonical_name: canonicalName,
      display_name: candidate.display_name,
      brand_name: detail.suggested_brand_name,
      food_category: detail.suggested_food_category,
      default_serving_amount: null,
      default_serving_unit: null,
      reviewed_serving_label: detail.suggested_serving_label ?? detail.portion_size,
      calories_kcal: detail.suggested_calories_kcal ?? detail.estimated_calories,
      protein_g: detail.suggested_protein_g,
      fat_g: detail.suggested_fat_g,
      carbs_g: detail.suggested_carbs_g,
      fiber_g: detail.suggested_fiber_g,
      sugar_g: detail.suggested_sugar_g,
      sodium_mg: detail.suggested_sodium_mg,
      nutrition_confidence: detail.enrichment_confidence,
      nutrition_source_label: detail.enrichment_source_label,
      nutrition_source_ref: detail.enrichment_source_ref,
      common_aliases: detail.suggested_common_aliases,
      default_signals:
        detail.suggested_default_signals.length > 0
          ? detail.suggested_default_signals
          : deriveFoodSignalsFromTags(detail.tags),
      source_label: 'user_review',
      evidence_notes: buildFoodEvidenceNotes(detail),
    })
    .select('*')
    .maybeSingle();

  if (error) throw error;

  const promoted = data as FoodReferenceItemRow;

  const { error: updateFoodLogsError } = await supabase
    .from('food_log_items')
    .update({
      normalized_food_id: promoted.id,
      confidence_score: 0.88,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .ilike('display_name', candidate.display_name)
    .is('normalized_food_id', null);

  if (updateFoodLogsError) throw updateFoodLogsError;

  await promoteIngredientReferencesForFood({
    userId,
    foodReferenceId: promoted.id,
    foodDisplayName: candidate.display_name,
    detail,
  });

  return {
    status: 'accepted',
    promotedReferenceId: promoted.id,
  };
}

async function promoteMedicationCandidate(
  userId: string,
  candidate: ReferenceReviewCandidateRow
): Promise<{ status: ReferenceCandidateReviewStatus; promotedReferenceId: string }> {
  const detail = readMedicationCandidateDetail(candidate.detail);
  const lookupNames = [
    candidate.display_name,
    detail.suggested_generic_name,
    ...detail.suggested_brand_names,
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  let existingReference: MedicationReferenceItemRow | null = null;
  for (const lookupName of lookupNames) {
    existingReference = await resolveExistingMedicationReference(lookupName);
    if (existingReference) break;
  }

  if (existingReference) {
    const { error: updateMedicationLogsError } = await supabase
      .from('medication_logs')
      .update({
        normalized_medication_id: existingReference.id,
        route: detail.suggested_route ?? detail.route ?? existingReference.route,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .ilike('medication_name', candidate.display_name)
      .is('normalized_medication_id', null);

    if (updateMedicationLogsError) throw updateMedicationLogsError;

    return {
      status: 'merged',
      promotedReferenceId: existingReference.id,
    };
  }

  const { data, error } = await supabase
    .from('medication_reference_items')
    .insert({
      generic_name: detail.suggested_generic_name ?? candidate.display_name,
      display_name: candidate.display_name,
      brand_names: dedupeStrings(
        [
          ...detail.suggested_brand_names,
          detail.suggested_generic_name &&
          normalizeLookupKey(detail.suggested_generic_name) !== normalizeLookupKey(candidate.display_name)
            ? candidate.display_name
            : '',
        ].filter((brand) => brand.length > 0)
      ),
      rxnorm_code: detail.suggested_rxnorm_code,
      medication_class: detail.suggested_medication_class,
      medication_family: detail.suggested_medication_family,
      route: detail.suggested_route ?? detail.route,
      dosage_form: detail.suggested_dosage_form,
      medication_type: detail.medication_type ?? 'unknown',
      gut_relevance: detail.suggested_gut_relevance ?? 'unknown',
      common_gut_effects: detail.suggested_common_gut_effects,
      interaction_flags: detail.suggested_interaction_flags,
      active_ingredients: detail.suggested_active_ingredients,
      common_dose_units: detail.suggested_common_dose_units,
      source_label: detail.enrichment_source_label ?? 'user_review',
      source_ref: detail.enrichment_source_ref,
      source_confidence: detail.enrichment_confidence,
      evidence_notes: buildMedicationEvidenceNotes(detail),
    })
    .select('*')
    .maybeSingle();

  if (error) throw error;

  const promoted = data as MedicationReferenceItemRow;

  const { error: updateMedicationLogsError } = await supabase
    .from('medication_logs')
    .update({
      normalized_medication_id: promoted.id,
      route: detail.suggested_route ?? detail.route ?? promoted.route,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .ilike('medication_name', candidate.display_name)
    .is('normalized_medication_id', null);

  if (updateMedicationLogsError) throw updateMedicationLogsError;

  return {
    status: 'accepted',
    promotedReferenceId: promoted.id,
  };
}

export async function acceptReferenceReviewCandidate(
  userId: string,
  candidateId: string
): Promise<void> {
  const { data, error } = await supabase
    .from('reference_review_candidates')
    .select('*')
    .eq('id', candidateId)
    .eq('user_id', userId)
    .eq('review_status', 'pending_review')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Reference candidate not found or already reviewed.');

  const candidate = data as ReferenceReviewCandidateRow;

  const promotion =
    candidate.candidate_kind === 'food'
      ? await promoteFoodCandidate(userId, candidate)
      : await promoteMedicationCandidate(userId, candidate);

  await markCandidateReviewed({
    userId,
    candidateId,
    status: promotion.status,
    promotedReferenceId: promotion.promotedReferenceId,
    reviewNotes:
      promotion.status === 'merged'
        ? 'Matched to an existing live reference row during review.'
        : 'Promoted into the live reference table during review.',
  });
}

export async function rejectReferenceReviewCandidate(
  userId: string,
  candidateId: string
): Promise<void> {
  await markCandidateReviewed({
    userId,
    candidateId,
    status: 'rejected',
    promotedReferenceId: null,
    reviewNotes: 'Rejected during reference review.',
  });
}
