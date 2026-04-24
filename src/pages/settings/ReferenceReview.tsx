import type { InputHTMLAttributes } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Clock3,
  FileSearch,
  Pill,
  Plus,
  ShieldCheck,
  Sparkles,
  Utensils,
  X,
  XCircle,
} from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import {
  acceptReferenceReviewCandidate,
  fetchReferenceReviewCandidates,
  readFoodCandidateDetail,
  readMedicationCandidateDetail,
  refreshFoodReferenceCandidateEnrichment,
  refreshMedicationReferenceCandidateEnrichment,
  rejectReferenceReviewCandidate,
  updateFoodReferenceCandidateDetail,
  updateMedicationReferenceCandidateDetail,
} from '../../services/referenceReviewService';
import type {
  FoodReferenceCandidateDetail,
  FoodReferenceCandidateIngredient,
  MedicationGutRelevance,
  MedicationReferenceCandidateDetail,
  MedicationReferenceType,
  MedicationRegimenStatus,
  ReferenceReviewCandidateRow,
} from '../../types/intelligence';

const STATUS_META = {
  pending_review: {
    label: 'Pending',
    className:
      'border-[rgba(245,158,11,0.22)] bg-[rgba(245,158,11,0.12)] text-[rgba(245,190,80,0.98)]',
  },
  accepted: {
    label: 'Accepted',
    className:
      'border-[rgba(52,211,153,0.22)] bg-[rgba(52,211,153,0.12)] text-[rgba(110,231,183,0.98)]',
  },
  rejected: {
    label: 'Rejected',
    className:
      'border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.12)] text-[rgba(252,165,165,0.98)]',
  },
  merged: {
    label: 'Merged',
    className:
      'border-[rgba(84,160,255,0.22)] bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]',
  },
} as const;

const ENRICHMENT_STATUS_META = {
  not_started: {
    label: 'Pending lookup',
    className:
      'border-[rgba(148,163,184,0.18)] bg-[rgba(148,163,184,0.08)] text-[var(--color-text-tertiary)]',
  },
  enriched: {
    label: 'Source matched',
    className:
      'border-[rgba(52,211,153,0.22)] bg-[rgba(52,211,153,0.12)] text-[rgba(110,231,183,0.98)]',
  },
  fallback: {
    label: 'Fallback estimate',
    className:
      'border-[rgba(245,158,11,0.22)] bg-[rgba(245,158,11,0.12)] text-[rgba(245,190,80,0.98)]',
  },
  failed: {
    label: 'Lookup failed',
    className:
      'border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.12)] text-[rgba(252,165,165,0.98)]',
  },
} as const;

interface FoodDetailDraft {
  suggested_food_category: string;
  suggested_brand_name: string;
  suggested_common_aliases: string;
  suggested_serving_label: string;
  suggested_calories_kcal: string;
  suggested_protein_g: string;
  suggested_fat_g: string;
  suggested_carbs_g: string;
  suggested_fiber_g: string;
  suggested_sugar_g: string;
  suggested_sodium_mg: string;
  suggested_default_signals: string;
  suggested_ingredients: FoodIngredientDraft[];
}

interface FoodIngredientDraft {
  local_id: string;
  name: string;
  confidence: string;
  prominence_rank: string;
  ingredient_fraction: string;
  is_primary: boolean;
  suggested_signals: string;
  notes: string;
}

interface MedicationDetailDraft {
  dosage: string;
  medication_type: MedicationReferenceType | '';
  route: string;
  reason_for_use: string;
  regimen_status: MedicationRegimenStatus | '';
  timing_context: string;
  suggested_generic_name: string;
  suggested_brand_names: string;
  suggested_medication_class: string;
  suggested_medication_family: string;
  suggested_rxnorm_code: string;
  suggested_gut_relevance: MedicationGutRelevance | '';
  suggested_common_gut_effects: string;
  suggested_interaction_flags: string;
  suggested_active_ingredients: string;
  suggested_common_dose_units: string;
  suggested_dosage_form: string;
  suggested_route: string;
  enrichment_source_label: string;
  enrichment_source_ref: string;
  enrichment_confidence: string;
  enrichment_notes: string;
}

const MEDICATION_TYPE_OPTIONS: Array<{
  value: MedicationReferenceType | '';
  label: string;
}> = [
  { value: '', label: 'Unspecified' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'otc', label: 'OTC' },
  { value: 'supplement', label: 'Supplement' },
  { value: 'unknown', label: 'Unknown' },
];

const REGIMEN_STATUS_OPTIONS: Array<{
  value: MedicationRegimenStatus | '';
  label: string;
}> = [
  { value: '', label: 'Unspecified' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'as_needed', label: 'As needed' },
  { value: 'one_time', label: 'One time' },
  { value: 'unknown', label: 'Unknown' },
];

const GUT_RELEVANCE_OPTIONS: Array<{
  value: MedicationGutRelevance | '';
  label: string;
}> = [
  { value: '', label: 'Unspecified' },
  { value: 'primary', label: 'Primary GI relevance' },
  { value: 'secondary', label: 'Secondary GI relevance' },
  { value: 'indirect', label: 'Indirect GI relevance' },
  { value: 'unknown', label: 'Unknown' },
];

function numberToDraft(value: number | null): string {
  return typeof value === 'number' ? String(value) : '';
}

function parseDraftNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toCommaSeparated(values: string[]): string {
  return values.join(', ');
}

function parseCommaSeparated(value: string): string[] {
  return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
}

function createIngredientDraftId(): string {
  return `ingredient-${Math.random().toString(36).slice(2, 10)}`;
}

function createFoodIngredientDraft(
  ingredient?: FoodReferenceCandidateIngredient,
  fallbackRank?: number
): FoodIngredientDraft {
  return {
    local_id: createIngredientDraftId(),
    name: ingredient?.name ?? '',
    confidence: numberToDraft(ingredient?.confidence ?? null),
    prominence_rank: numberToDraft(ingredient?.prominence_rank ?? fallbackRank ?? null),
    ingredient_fraction: numberToDraft(ingredient?.ingredient_fraction ?? null),
    is_primary: ingredient?.is_primary ?? fallbackRank === 1,
    suggested_signals: toCommaSeparated(ingredient?.suggested_signals ?? []),
    notes: ingredient?.notes ?? '',
  };
}

function normalizeDraftIngredients(
  ingredients: FoodReferenceCandidateIngredient[]
): FoodReferenceCandidateIngredient[] {
  const sorted = [...ingredients].sort((left, right) => {
    const leftRank = left.prominence_rank ?? Number.MAX_SAFE_INTEGER;
    const rightRank = right.prominence_rank ?? Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });

  let primaryAssigned = false;

  return sorted.map((ingredient, index) => {
    const isPrimary =
      (ingredient.is_primary && !primaryAssigned) || (!primaryAssigned && index === 0);
    if (isPrimary) {
      primaryAssigned = true;
    }

    return {
      ...ingredient,
      prominence_rank: ingredient.prominence_rank ?? index + 1,
      is_primary: isPrimary,
    };
  });
}

function parseFoodIngredientDrafts(
  ingredients: FoodIngredientDraft[]
): FoodReferenceCandidateIngredient[] {
  return normalizeDraftIngredients(
    ingredients
      .map((ingredient) => {
        const name = ingredient.name.trim();
        if (!name) return null;

        const confidence = parseDraftNumber(ingredient.confidence);
        const ingredientFraction = parseDraftNumber(ingredient.ingredient_fraction);

        return {
          name,
          confidence:
            confidence !== null && confidence >= 0 && confidence <= 1 ? confidence : null,
          prominence_rank: (() => {
            const parsed = parseDraftNumber(ingredient.prominence_rank);
            return parsed !== null && parsed > 0 ? Math.round(parsed) : null;
          })(),
          is_primary: ingredient.is_primary,
          ingredient_fraction:
            ingredientFraction !== null &&
            ingredientFraction >= 0 &&
            ingredientFraction <= 1
              ? ingredientFraction
              : null,
          suggested_signals: parseCommaSeparated(ingredient.suggested_signals),
          notes: ingredient.notes.trim() || null,
        };
      })
      .filter((ingredient): ingredient is FoodReferenceCandidateIngredient => ingredient !== null)
  );
}

function formatIngredientCandidateSummary(
  ingredient: FoodReferenceCandidateIngredient
): string {
  const details = [
    ingredient.is_primary
      ? 'primary'
      : ingredient.prominence_rank !== null
        ? `rank ${ingredient.prominence_rank}`
        : null,
    ingredient.confidence !== null
      ? `${Math.round(ingredient.confidence * 100)}% confidence`
      : null,
    ingredient.ingredient_fraction !== null
      ? `${Math.round(ingredient.ingredient_fraction * 100)}% serving`
      : null,
  ].filter((detail): detail is string => detail !== null);

  return details.length > 0
    ? `${ingredient.name} (${details.join(', ')})`
    : ingredient.name;
}

function createFoodDetailDraft(detail: FoodReferenceCandidateDetail): FoodDetailDraft {
  return {
    suggested_food_category: detail.suggested_food_category ?? '',
    suggested_brand_name: detail.suggested_brand_name ?? '',
    suggested_common_aliases: toCommaSeparated(detail.suggested_common_aliases),
    suggested_serving_label: detail.suggested_serving_label ?? '',
    suggested_calories_kcal: numberToDraft(detail.suggested_calories_kcal),
    suggested_protein_g: numberToDraft(detail.suggested_protein_g),
    suggested_fat_g: numberToDraft(detail.suggested_fat_g),
    suggested_carbs_g: numberToDraft(detail.suggested_carbs_g),
    suggested_fiber_g: numberToDraft(detail.suggested_fiber_g),
    suggested_sugar_g: numberToDraft(detail.suggested_sugar_g),
    suggested_sodium_mg: numberToDraft(detail.suggested_sodium_mg),
    suggested_default_signals: toCommaSeparated(detail.suggested_default_signals),
    suggested_ingredients:
      detail.suggested_ingredients.length > 0
        ? detail.suggested_ingredients.map((ingredient, index) =>
            createFoodIngredientDraft(ingredient, index + 1)
          )
        : detail.suggested_ingredient_names.map((ingredientName, index) =>
            createFoodIngredientDraft(
              {
                name: ingredientName,
                confidence: detail.enrichment_confidence,
                prominence_rank: index + 1,
                is_primary: index === 0,
                ingredient_fraction: null,
                suggested_signals: [],
                notes: null,
              },
              index + 1
            )
          ),
  };
}

function applyFoodDetailDraft(
  base: FoodReferenceCandidateDetail,
  draft: FoodDetailDraft
): FoodReferenceCandidateDetail {
  const suggestedIngredients = parseFoodIngredientDrafts(draft.suggested_ingredients);

  return {
    ...base,
    suggested_food_category: draft.suggested_food_category.trim() || null,
    suggested_brand_name: draft.suggested_brand_name.trim() || null,
    suggested_common_aliases: parseCommaSeparated(draft.suggested_common_aliases),
    suggested_serving_label: draft.suggested_serving_label.trim() || null,
    suggested_calories_kcal: parseDraftNumber(draft.suggested_calories_kcal),
    suggested_protein_g: parseDraftNumber(draft.suggested_protein_g),
    suggested_fat_g: parseDraftNumber(draft.suggested_fat_g),
    suggested_carbs_g: parseDraftNumber(draft.suggested_carbs_g),
    suggested_fiber_g: parseDraftNumber(draft.suggested_fiber_g),
    suggested_sugar_g: parseDraftNumber(draft.suggested_sugar_g),
    suggested_sodium_mg: parseDraftNumber(draft.suggested_sodium_mg),
    suggested_ingredient_names: suggestedIngredients.map((ingredient) => ingredient.name),
    suggested_ingredients: suggestedIngredients,
    suggested_default_signals: parseCommaSeparated(draft.suggested_default_signals),
  };
}

function createMedicationDetailDraft(
  detail: MedicationReferenceCandidateDetail
): MedicationDetailDraft {
  return {
    dosage: detail.dosage ?? '',
    medication_type: detail.medication_type ?? '',
    route: detail.route ?? '',
    reason_for_use: detail.reason_for_use ?? '',
    regimen_status: detail.regimen_status ?? '',
    timing_context: detail.timing_context ?? '',
    suggested_generic_name: detail.suggested_generic_name ?? '',
    suggested_brand_names: toCommaSeparated(detail.suggested_brand_names),
    suggested_medication_class: detail.suggested_medication_class ?? '',
    suggested_medication_family: detail.suggested_medication_family ?? '',
    suggested_rxnorm_code: detail.suggested_rxnorm_code ?? '',
    suggested_gut_relevance: detail.suggested_gut_relevance ?? '',
    suggested_common_gut_effects: toCommaSeparated(detail.suggested_common_gut_effects),
    suggested_interaction_flags: toCommaSeparated(detail.suggested_interaction_flags),
    suggested_active_ingredients: toCommaSeparated(detail.suggested_active_ingredients),
    suggested_common_dose_units: toCommaSeparated(detail.suggested_common_dose_units),
    suggested_dosage_form: detail.suggested_dosage_form ?? '',
    suggested_route: detail.suggested_route ?? '',
    enrichment_source_label: detail.enrichment_source_label ?? '',
    enrichment_source_ref: detail.enrichment_source_ref ?? '',
    enrichment_confidence: numberToDraft(detail.enrichment_confidence),
    enrichment_notes: detail.enrichment_notes ?? '',
  };
}

function applyMedicationDetailDraft(
  base: MedicationReferenceCandidateDetail,
  draft: MedicationDetailDraft
): MedicationReferenceCandidateDetail {
  return {
    ...base,
    dosage: draft.dosage.trim() || null,
    medication_type: draft.medication_type || null,
    route: draft.route.trim() || null,
    reason_for_use: draft.reason_for_use.trim() || null,
    regimen_status: draft.regimen_status || null,
    timing_context: draft.timing_context.trim() || null,
    suggested_generic_name: draft.suggested_generic_name.trim() || null,
    suggested_brand_names: parseCommaSeparated(draft.suggested_brand_names),
    suggested_medication_class: draft.suggested_medication_class.trim() || null,
    suggested_medication_family: draft.suggested_medication_family.trim() || null,
    suggested_rxnorm_code: draft.suggested_rxnorm_code.trim() || null,
    suggested_gut_relevance: draft.suggested_gut_relevance || null,
    suggested_common_gut_effects: parseCommaSeparated(draft.suggested_common_gut_effects),
    suggested_interaction_flags: parseCommaSeparated(draft.suggested_interaction_flags),
    suggested_active_ingredients: parseCommaSeparated(draft.suggested_active_ingredients),
    suggested_common_dose_units: parseCommaSeparated(draft.suggested_common_dose_units),
    suggested_dosage_form: draft.suggested_dosage_form.trim() || null,
    suggested_route: draft.suggested_route.trim() || null,
    enrichment_source_label: draft.enrichment_source_label.trim() || null,
    enrichment_source_ref: draft.enrichment_source_ref.trim() || null,
    enrichment_confidence: parseDraftNumber(draft.enrichment_confidence),
    enrichment_notes: draft.enrichment_notes.trim() || null,
  };
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Recently';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatKind(value: ReferenceReviewCandidateRow['candidate_kind']): string {
  return value === 'food' ? 'Food' : 'Medication';
}

function formatMacroSummary(detail: FoodReferenceCandidateDetail): string | null {
  const parts = [
    typeof detail.suggested_protein_g === 'number' ? `Protein ${detail.suggested_protein_g}g` : null,
    typeof detail.suggested_fat_g === 'number' ? `Fat ${detail.suggested_fat_g}g` : null,
    typeof detail.suggested_carbs_g === 'number' ? `Carbs ${detail.suggested_carbs_g}g` : null,
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join(' | ') : null;
}

function formatSecondaryNutritionSummary(detail: FoodReferenceCandidateDetail): string | null {
  const parts = [
    typeof detail.suggested_fiber_g === 'number' ? `Fiber ${detail.suggested_fiber_g}g` : null,
    typeof detail.suggested_sugar_g === 'number' ? `Sugar ${detail.suggested_sugar_g}g` : null,
    typeof detail.suggested_sodium_mg === 'number' ? `Sodium ${detail.suggested_sodium_mg}mg` : null,
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join(' | ') : null;
}

function renderDetailList(candidate: ReferenceReviewCandidateRow): Array<{ label: string; value: string }> {
  if (candidate.candidate_kind === 'food') {
    const detail = readFoodCandidateDetail(candidate.detail);
    const rows: Array<{ label: string; value: string }> = [];

    if (Array.isArray(detail.tags) && detail.tags.length > 0) {
      rows.push({ label: 'Observed tags', value: detail.tags.join(', ') });
    }
    if (typeof detail.estimated_calories === 'number') {
      rows.push({ label: 'Estimated calories', value: `${detail.estimated_calories}` });
    }
    if (detail.portion_size) {
      rows.push({ label: 'Observed portion', value: detail.portion_size });
    }
    if (detail.suggested_brand_name) {
      rows.push({ label: 'Suggested brand', value: detail.suggested_brand_name });
    }
    if (detail.suggested_serving_label) {
      rows.push({ label: 'Suggested serving', value: detail.suggested_serving_label });
    }
    if (typeof detail.suggested_calories_kcal === 'number') {
      rows.push({ label: 'Suggested calories', value: `${detail.suggested_calories_kcal} kcal` });
    }

    const macroSummary = formatMacroSummary(detail);
    if (macroSummary) {
      rows.push({ label: 'Suggested macros', value: macroSummary });
    }

    const secondaryNutrition = formatSecondaryNutritionSummary(detail);
    if (secondaryNutrition) {
      rows.push({ label: 'Secondary nutrition', value: secondaryNutrition });
    }

    if (detail.suggested_ingredients.length > 0) {
      rows.push({
        label: 'Suggested ingredients',
        value: detail.suggested_ingredients
          .map((ingredient) => formatIngredientCandidateSummary(ingredient))
          .join(' | '),
      });
    }

    if (Array.isArray(detail.suggested_common_aliases) && detail.suggested_common_aliases.length > 0) {
      rows.push({
        label: 'Suggested aliases',
        value: detail.suggested_common_aliases.join(', '),
      });
    }

    if (Array.isArray(detail.suggested_default_signals) && detail.suggested_default_signals.length > 0) {
      rows.push({
        label: 'Suggested gut signals',
        value: detail.suggested_default_signals.join(', '),
      });
    }

    if (detail.enrichment_source_label) {
      const value = detail.enrichment_source_ref
        ? `${detail.enrichment_source_label} | ${detail.enrichment_source_ref}`
        : detail.enrichment_source_label;
      rows.push({ label: 'Enrichment source', value });
    }

    if (typeof detail.enrichment_confidence === 'number') {
      rows.push({
        label: 'Enrichment confidence',
        value: `${Math.round(detail.enrichment_confidence * 100)}%`,
      });
    }

    if (detail.enrichment_last_attempt_at) {
      rows.push({
        label: 'Last lookup',
        value: formatDate(detail.enrichment_last_attempt_at),
      });
    }

    if (detail.enrichment_notes) {
      rows.push({
        label: 'Lookup note',
        value: detail.enrichment_notes,
      });
    }

    return rows;
  }

  const detail = readMedicationCandidateDetail(candidate.detail);
  const rows: Array<{ label: string; value: string }> = [];

  if (detail.dosage) rows.push({ label: 'Observed dosage', value: detail.dosage });
  if (detail.route) rows.push({ label: 'Observed route', value: detail.route });
  if (detail.medication_type) {
    rows.push({ label: 'Medication type', value: detail.medication_type.replace(/_/g, ' ') });
  }
  if (detail.reason_for_use) rows.push({ label: 'Reason for use', value: detail.reason_for_use });
  if (detail.regimen_status) {
    rows.push({ label: 'Regimen', value: detail.regimen_status.replace(/_/g, ' ') });
  }
  if (detail.timing_context) {
    rows.push({ label: 'Timing context', value: detail.timing_context.replace(/_/g, ' ') });
  }
  if (detail.suggested_generic_name) {
    rows.push({ label: 'Suggested generic', value: detail.suggested_generic_name });
  }
  if (detail.suggested_brand_names.length > 0) {
    rows.push({ label: 'Suggested brands', value: detail.suggested_brand_names.join(', ') });
  }
  if (detail.suggested_medication_class) {
    rows.push({ label: 'Suggested class', value: detail.suggested_medication_class });
  }
  if (detail.suggested_medication_family) {
    rows.push({ label: 'Suggested family', value: detail.suggested_medication_family });
  }
  if (detail.suggested_dosage_form) {
    rows.push({ label: 'Suggested dosage form', value: detail.suggested_dosage_form });
  }
  if (detail.suggested_route) {
    rows.push({ label: 'Suggested route', value: detail.suggested_route });
  }
  if (detail.suggested_common_dose_units.length > 0) {
    rows.push({
      label: 'Common dose units',
      value: detail.suggested_common_dose_units.join(', '),
    });
  }
  if (detail.suggested_active_ingredients.length > 0) {
    rows.push({
      label: 'Active ingredients',
      value: detail.suggested_active_ingredients.join(', '),
    });
  }
  if (detail.suggested_common_gut_effects.length > 0) {
    rows.push({
      label: 'Common gut effects',
      value: detail.suggested_common_gut_effects.join(', '),
    });
  }
  if (detail.suggested_interaction_flags.length > 0) {
    rows.push({
      label: 'Interaction flags',
      value: detail.suggested_interaction_flags.join(', '),
    });
  }
  if (detail.suggested_gut_relevance) {
    rows.push({
      label: 'Gut relevance',
      value: detail.suggested_gut_relevance.replace(/_/g, ' '),
    });
  }
  if (detail.suggested_rxnorm_code) {
    rows.push({ label: 'RxNorm code', value: detail.suggested_rxnorm_code });
  }
  if (detail.enrichment_source_label) {
    const value = detail.enrichment_source_ref
      ? `${detail.enrichment_source_label} | ${detail.enrichment_source_ref}`
      : detail.enrichment_source_label;
    rows.push({ label: 'Knowledge source', value });
  }
  if (typeof detail.enrichment_confidence === 'number') {
    rows.push({
      label: 'Enrichment confidence',
      value: `${Math.round(detail.enrichment_confidence * 100)}%`,
    });
  }
  if (detail.enrichment_last_attempt_at) {
    rows.push({
      label: 'Last lookup',
      value: formatDate(detail.enrichment_last_attempt_at),
    });
  }
  if (detail.enrichment_notes) {
    rows.push({ label: 'Lookup note', value: detail.enrichment_notes });
  }

  return rows;
}

export default function ReferenceReview() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<ReferenceReviewCandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<{
    candidateId: string;
    action: 'accept' | 'reject' | 'refresh' | 'save';
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending_review' | 'all'>('pending_review');
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [foodDraft, setFoodDraft] = useState<FoodDetailDraft | null>(null);
  const [medicationDraft, setMedicationDraft] = useState<MedicationDetailDraft | null>(null);

  const loadCandidates = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');
      const data = await fetchReferenceReviewCandidates(
        user.id,
        statusFilter === 'pending_review' ? 'pending_review' : undefined
      );
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reference review queue.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, user?.id]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleAccept = async (candidateId: string) => {
    if (!user?.id) return;

    setProcessing({ candidateId, action: 'accept' });
    setError('');

    try {
      await acceptReferenceReviewCandidate(user.id, candidateId);
      await loadCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept reference candidate.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (candidateId: string) => {
    if (!user?.id) return;

    setProcessing({ candidateId, action: 'reject' });
    setError('');

    try {
      await rejectReferenceReviewCandidate(user.id, candidateId);
      await loadCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject reference candidate.');
    } finally {
      setProcessing(null);
    }
  };

  const beginFoodEditing = (candidate: ReferenceReviewCandidateRow) => {
    if (candidate.candidate_kind !== 'food') return;
    const detail = readFoodCandidateDetail(candidate.detail);
    setEditingCandidateId(candidate.id);
    setFoodDraft(createFoodDetailDraft(detail));
    setMedicationDraft(null);
  };

  const beginMedicationEditing = (candidate: ReferenceReviewCandidateRow) => {
    if (candidate.candidate_kind !== 'medication') return;
    const detail = readMedicationCandidateDetail(candidate.detail);
    setFoodDraft(null);
    setEditingCandidateId(candidate.id);
    setMedicationDraft(createMedicationDetailDraft(detail));
  };

  const cancelEditing = () => {
    setEditingCandidateId(null);
    setFoodDraft(null);
    setMedicationDraft(null);
  };

  const handleFoodDraftChange = (field: keyof FoodDetailDraft, value: string) => {
    setFoodDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleMedicationDraftChange = (
    field: keyof MedicationDetailDraft,
    value: string
  ) => {
    setMedicationDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleFoodIngredientDraftChange = (
    localId: string,
    field: keyof Omit<FoodIngredientDraft, 'local_id'>,
    value: string | boolean
  ) => {
    setFoodDraft((current) =>
      current
        ? {
            ...current,
            suggested_ingredients: current.suggested_ingredients.map((ingredient) =>
              ingredient.local_id === localId
                ? field === 'is_primary'
                  ? {
                      ...ingredient,
                      is_primary: Boolean(value),
                    }
                  : {
                      ...ingredient,
                      [field]: String(value),
                    }
                : field === 'is_primary' && value === true
                  ? {
                      ...ingredient,
                      is_primary: false,
                    }
                  : ingredient
            ),
          }
        : current
    );
  };

  const handleAddFoodIngredient = () => {
    setFoodDraft((current) =>
      current
        ? {
            ...current,
            suggested_ingredients: [
              ...current.suggested_ingredients,
              createFoodIngredientDraft(undefined, current.suggested_ingredients.length + 1),
            ],
          }
        : current
    );
  };

  const handleRemoveFoodIngredient = (localId: string) => {
    setFoodDraft((current) => {
      if (!current) return current;

      const remainingIngredients = current.suggested_ingredients.filter(
        (ingredient) => ingredient.local_id !== localId
      );

      if (remainingIngredients.length > 0 && !remainingIngredients.some((ingredient) => ingredient.is_primary)) {
        remainingIngredients[0] = {
          ...remainingIngredients[0],
          is_primary: true,
        };
      }

      return {
        ...current,
        suggested_ingredients: remainingIngredients,
      };
    });
  };

  const handleRefreshFoodCandidate = async (candidateId: string) => {
    if (!user?.id) return;

    setProcessing({ candidateId, action: 'refresh' });
    setError('');

    try {
      const refreshed = await refreshFoodReferenceCandidateEnrichment(user.id, candidateId);
      setCandidates((current) =>
        current.map((candidate) => (candidate.id === refreshed.id ? refreshed : candidate))
      );

      if (editingCandidateId === candidateId) {
        setFoodDraft(createFoodDetailDraft(readFoodCandidateDetail(refreshed.detail)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh food enrichment.');
    } finally {
      setProcessing(null);
    }
  };

  const handleRefreshMedicationCandidate = async (candidateId: string) => {
    if (!user?.id) return;

    setProcessing({ candidateId, action: 'refresh' });
    setError('');

    try {
      const refreshed = await refreshMedicationReferenceCandidateEnrichment(user.id, candidateId);
      setCandidates((current) =>
        current.map((candidate) => (candidate.id === refreshed.id ? refreshed : candidate))
      );

      if (editingCandidateId === candidateId) {
        setMedicationDraft(createMedicationDetailDraft(readMedicationCandidateDetail(refreshed.detail)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh medication enrichment.');
    } finally {
      setProcessing(null);
    }
  };

  const handleSaveFoodDraft = async (candidate: ReferenceReviewCandidateRow) => {
    if (!user?.id || !foodDraft) return;

    setProcessing({ candidateId: candidate.id, action: 'save' });
    setError('');

    try {
      const baseDetail = readFoodCandidateDetail(candidate.detail);
      const updated = await updateFoodReferenceCandidateDetail({
        userId: user.id,
        candidateId: candidate.id,
        detail: applyFoodDetailDraft(baseDetail, foodDraft),
      });

      setCandidates((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry))
      );
      cancelEditing();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save food suggestion.');
    } finally {
      setProcessing(null);
    }
  };

  const handleSaveMedicationDraft = async (candidate: ReferenceReviewCandidateRow) => {
    if (!user?.id || !medicationDraft) return;

    setProcessing({ candidateId: candidate.id, action: 'save' });
    setError('');

    try {
      const baseDetail = readMedicationCandidateDetail(candidate.detail);
      const updated = await updateMedicationReferenceCandidateDetail({
        userId: user.id,
        candidateId: candidate.id,
        detail: applyMedicationDetailDraft(baseDetail, medicationDraft),
      });

      setCandidates((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry))
      );
      cancelEditing();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save medication suggestion.');
    } finally {
      setProcessing(null);
    }
  };

  const summary = useMemo(() => {
    const pending = candidates.filter((candidate) => candidate.review_status === 'pending_review').length;
    const foods = candidates.filter((candidate) => candidate.candidate_kind === 'food').length;
    const medications = candidates.filter((candidate) => candidate.candidate_kind === 'medication').length;
    return { pending, foods, medications };
  }, [candidates]);

  return (
    <SettingsPageLayout
      title="Reference Review Queue"
      description="Review custom foods and medications that did not match the current live reference tables before promoting them into shared intelligence."
    >
      {error && (
        <Card variant="flat" className="rounded-[24px] border-[rgba(248,113,113,0.18)] bg-[rgba(248,113,113,0.08)]">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 text-[rgba(252,165,165,0.98)]" />
            <p className="text-sm leading-6 text-[var(--color-text-primary)]">{error}</p>
          </div>
        </Card>
      )}

      {loading ? (
        <Card variant="elevated" className="rounded-[28px]">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Loading reference review queue...
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card variant="elevated" className="overflow-hidden rounded-[30px]">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div>
                <span className="badge-secondary mb-3 inline-flex">Reviewable Intake Loop</span>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                  Let the reference library learn from your own entries
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                  When a food or medication does not match the current reference tables, GutWise
                  now queues it here for review instead of silently leaving it as raw text forever.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <MetricTile
                    label="Pending"
                    value={String(summary.pending)}
                    helper="Waiting for review"
                    tone="primary"
                  />
                  <MetricTile
                    label="Foods"
                    value={String(summary.foods)}
                    helper="Food candidates in this view"
                    tone="secondary"
                  />
                  <MetricTile
                    label="Medications"
                    value={String(summary.medications)}
                    helper="Medication candidates in this view"
                    tone="neutral"
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <Card
                  variant="discovery"
                  glowIntensity="subtle"
                  className="rounded-[26px] border-[rgba(133,93,255,0.14)]"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 text-[var(--color-accent-secondary)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Review standard
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Accept only entries you want promoted into the live autocomplete and
                        normalization layer.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card variant="flat" className="rounded-[26px]">
                  <div className="flex items-start gap-3">
                    <FileSearch className="mt-0.5 h-5 w-5 text-[var(--color-accent-primary)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        What acceptance does
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Accepted items are promoted into the live reference table and exact-matching
                        old logs are backfilled to that new reference row.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              variant={statusFilter === 'pending_review' ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter('pending_review')}
            >
              <Clock3 className="h-4 w-4" />
              Pending only
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter('all')}
            >
              <ShieldCheck className="h-4 w-4" />
              All reviewed states
            </Button>
          </div>

          {candidates.length === 0 ? (
            <Card variant="flat" className="rounded-[26px]">
              <div className="flex items-start gap-3 py-1">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)] text-[var(--color-text-tertiary)]">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    No reference candidates in this view
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Custom foods and medications that miss the live reference tables will appear
                    here automatically.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => {
                const statusMeta = STATUS_META[candidate.review_status];
                const isPending = candidate.review_status === 'pending_review';
                const processingAction =
                  processing?.candidateId === candidate.id ? processing.action : null;
                const isProcessing = processingAction !== null;
                const detailRows = renderDetailList(candidate);
                const KindIcon = candidate.candidate_kind === 'food' ? Utensils : Pill;
                const foodDetail =
                  candidate.candidate_kind === 'food'
                    ? readFoodCandidateDetail(candidate.detail)
                    : null;
                const medicationDetail =
                  candidate.candidate_kind === 'medication'
                    ? readMedicationCandidateDetail(candidate.detail)
                    : null;
                const enrichmentStatusMeta =
                  foodDetail
                    ? ENRICHMENT_STATUS_META[foodDetail.enrichment_status]
                    : medicationDetail
                      ? ENRICHMENT_STATUS_META[medicationDetail.enrichment_status]
                      : null;
                const isEditingFood = editingCandidateId === candidate.id && foodDraft !== null;
                const isEditingMedication =
                  editingCandidateId === candidate.id && medicationDraft !== null;

                return (
                  <Card
                    key={candidate.id}
                    variant={isPending ? 'elevated' : 'flat'}
                    className="rounded-[28px]"
                  >
                    <div className="space-y-5">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)] text-[var(--color-text-tertiary)]">
                              <KindIcon className="h-4 w-4" />
                            </span>
                            <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                              {candidate.display_name}
                            </p>
                            <span className="inline-flex items-center rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                              {formatKind(candidate.candidate_kind)}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${statusMeta.className}`}
                            >
                              {statusMeta.label}
                            </span>
                            {(foodDetail || medicationDetail) && (
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${enrichmentStatusMeta?.className}`}
                              >
                                {enrichmentStatusMeta?.label}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-tertiary)]">
                            <span>Seen {candidate.times_seen} time{candidate.times_seen === 1 ? '' : 's'}</span>
                            <span>Last seen {formatDate(candidate.last_seen_at)}</span>
                            <span>Source: {candidate.source_log_type.replace(/_/g, ' ')}</span>
                          </div>
                        </div>

                        {isPending && (
                          <div className="grid grid-cols-2 gap-2 xl:w-[196px] xl:grid-cols-1">
                            <Button
                              size="sm"
                              onClick={() => handleAccept(candidate.id)}
                              disabled={isProcessing}
                              className="w-full"
                            >
                              <Check className="h-3.5 w-3.5" />
                              {processingAction === 'accept' ? 'Accepting...' : 'Accept'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(candidate.id)}
                              disabled={isProcessing}
                              className="w-full border-[rgba(248,113,113,0.18)] text-[rgba(252,165,165,0.98)] hover:bg-[rgba(248,113,113,0.08)]"
                            >
                              <X className="h-3.5 w-3.5" />
                              {processingAction === 'reject' ? 'Rejecting...' : 'Reject'}
                            </Button>
                          </div>
                        )}
                      </div>

                      {detailRows.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {detailRows.map((row) => (
                            <div
                              key={row.label}
                              className="rounded-[20px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-4 py-4"
                            >
                              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                                {row.label}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
                                {row.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {candidate.candidate_kind === 'food' && isPending && foodDetail && (
                        <div className="space-y-4 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.02)] p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRefreshFoodCandidate(candidate.id)}
                              disabled={isProcessing}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              {processingAction === 'refresh'
                                ? 'Refreshing source...'
                                : 'Refresh source lookup'}
                            </Button>

                            {isEditingFood ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveFoodDraft(candidate)}
                                  disabled={isProcessing || !foodDraft}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  {processingAction === 'save' ? 'Saving...' : 'Save suggestion'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditing}
                                  disabled={isProcessing}
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Cancel edit
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => beginFoodEditing(candidate)}
                                disabled={isProcessing}
                              >
                                <FileSearch className="h-3.5 w-3.5" />
                                Edit suggestion
                              </Button>
                            )}
                          </div>

                          {isEditingFood && foodDraft && (
                            <div className="grid gap-3 sm:grid-cols-2">
                              <EditableField
                                label="Category"
                                value={foodDraft.suggested_food_category}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_food_category', value)
                                }
                              />
                              <EditableField
                                label="Brand"
                                value={foodDraft.suggested_brand_name}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_brand_name', value)
                                }
                              />
                              <EditableField
                                label="Serving"
                                value={foodDraft.suggested_serving_label}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_serving_label', value)
                                }
                              />
                              <EditableField
                                label="Common aliases"
                                value={foodDraft.suggested_common_aliases}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_common_aliases', value)
                                }
                                placeholder="e.g. lasagne, meat lasagna"
                              />
                              <EditableField
                                label="Calories (kcal)"
                                value={foodDraft.suggested_calories_kcal}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_calories_kcal', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Protein (g)"
                                value={foodDraft.suggested_protein_g}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_protein_g', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Fat (g)"
                                value={foodDraft.suggested_fat_g}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_fat_g', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Carbs (g)"
                                value={foodDraft.suggested_carbs_g}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_carbs_g', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Fiber (g)"
                                value={foodDraft.suggested_fiber_g}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_fiber_g', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Sugar (g)"
                                value={foodDraft.suggested_sugar_g}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_sugar_g', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Sodium (mg)"
                                value={foodDraft.suggested_sodium_mg}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_sodium_mg', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Suggested gut signals"
                                value={foodDraft.suggested_default_signals}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_default_signals', value)
                                }
                                placeholder="Comma-separated signals"
                              />
                            </div>
                          )}

                          {isEditingFood && foodDraft && (
                            <div className="rounded-[20px] border border-white/8 bg-black/[0.12] p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                                    Ingredient review
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">
                                    Edit the ingredient stack directly before promotion. Confidence
                                    and fraction fields should use values between 0 and 1.
                                  </p>
                                </div>

                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={handleAddFoodIngredient}
                                  disabled={isProcessing}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Add ingredient
                                </Button>
                              </div>

                              {foodDraft.suggested_ingredients.length === 0 ? (
                                <div className="mt-4 rounded-[18px] border border-dashed border-white/10 px-4 py-4 text-sm leading-6 text-[var(--color-text-tertiary)]">
                                  No structured ingredients yet. Add ingredients here before
                                  accepting this food into the live reference layer.
                                </div>
                              ) : (
                                <div className="mt-4 space-y-3">
                                  {foodDraft.suggested_ingredients.map((ingredient, index) => (
                                    <div
                                      key={ingredient.local_id}
                                      className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.025)] p-4"
                                    >
                                      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                                            Ingredient {index + 1}
                                          </p>
                                          <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">
                                            Review prominence, confidence, and gut signal context.
                                          </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                          <label className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--color-text-secondary)]">
                                            <input
                                              type="checkbox"
                                              checked={ingredient.is_primary}
                                              onChange={(event) =>
                                                handleFoodIngredientDraftChange(
                                                  ingredient.local_id,
                                                  'is_primary',
                                                  event.target.checked
                                                )
                                              }
                                              className="h-3.5 w-3.5 rounded border-white/20 bg-transparent"
                                            />
                                            Primary ingredient
                                          </label>

                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRemoveFoodIngredient(ingredient.local_id)}
                                            disabled={isProcessing}
                                          >
                                            <X className="h-3.5 w-3.5" />
                                            Remove
                                          </Button>
                                        </div>
                                      </div>

                                      <div className="grid gap-3 sm:grid-cols-2">
                                        <EditableField
                                          label="Ingredient name"
                                          value={ingredient.name}
                                          onChange={(value) =>
                                            handleFoodIngredientDraftChange(
                                              ingredient.local_id,
                                              'name',
                                              value
                                            )
                                          }
                                        />
                                        <EditableField
                                          label="Signals"
                                          value={ingredient.suggested_signals}
                                          onChange={(value) =>
                                            handleFoodIngredientDraftChange(
                                              ingredient.local_id,
                                              'suggested_signals',
                                              value
                                            )
                                          }
                                          placeholder="Comma-separated signals"
                                        />
                                        <EditableField
                                          label="Confidence (0-1)"
                                          value={ingredient.confidence}
                                          onChange={(value) =>
                                            handleFoodIngredientDraftChange(
                                              ingredient.local_id,
                                              'confidence',
                                              value
                                            )
                                          }
                                          inputMode="decimal"
                                          placeholder="e.g. 0.82"
                                        />
                                        <EditableField
                                          label="Prominence rank"
                                          value={ingredient.prominence_rank}
                                          onChange={(value) =>
                                            handleFoodIngredientDraftChange(
                                              ingredient.local_id,
                                              'prominence_rank',
                                              value
                                            )
                                          }
                                          inputMode="numeric"
                                          placeholder="1"
                                        />
                                        <EditableField
                                          label="Fraction of serving (0-1)"
                                          value={ingredient.ingredient_fraction}
                                          onChange={(value) =>
                                            handleFoodIngredientDraftChange(
                                              ingredient.local_id,
                                              'ingredient_fraction',
                                              value
                                            )
                                          }
                                          inputMode="decimal"
                                          placeholder="e.g. 0.25"
                                        />
                                        <EditableField
                                          label="Review note"
                                          value={ingredient.notes}
                                          onChange={(value) =>
                                            handleFoodIngredientDraftChange(
                                              ingredient.local_id,
                                              'notes',
                                              value
                                            )
                                          }
                                          placeholder="Optional ingredient note"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {candidate.candidate_kind === 'medication' && isPending && medicationDetail && (
                        <div className="space-y-4 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.02)] p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRefreshMedicationCandidate(candidate.id)}
                              disabled={isProcessing}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              {processingAction === 'refresh'
                                ? 'Refreshing knowledge...'
                                : 'Refresh knowledge lookup'}
                            </Button>

                            {isEditingMedication ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveMedicationDraft(candidate)}
                                  disabled={isProcessing || !medicationDraft}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  {processingAction === 'save' ? 'Saving...' : 'Save suggestion'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditing}
                                  disabled={isProcessing}
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Cancel edit
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => beginMedicationEditing(candidate)}
                                disabled={isProcessing}
                              >
                                <FileSearch className="h-3.5 w-3.5" />
                                Edit suggestion
                              </Button>
                            )}
                          </div>

                          {isEditingMedication && medicationDraft && (
                            <div className="grid gap-3 sm:grid-cols-2">
                              <EditableField
                                label="Observed dosage"
                                value={medicationDraft.dosage}
                                onChange={(value) => handleMedicationDraftChange('dosage', value)}
                                placeholder="e.g. 20 mg"
                              />
                              <EditableSelectField
                                label="Medication type"
                                value={medicationDraft.medication_type}
                                onChange={(value) =>
                                  handleMedicationDraftChange(
                                    'medication_type',
                                    value as MedicationDetailDraft['medication_type']
                                  )
                                }
                                options={MEDICATION_TYPE_OPTIONS}
                              />
                              <EditableField
                                label="Observed route"
                                value={medicationDraft.route}
                                onChange={(value) => handleMedicationDraftChange('route', value)}
                                placeholder="e.g. oral"
                              />
                              <EditableSelectField
                                label="Regimen"
                                value={medicationDraft.regimen_status}
                                onChange={(value) =>
                                  handleMedicationDraftChange(
                                    'regimen_status',
                                    value as MedicationDetailDraft['regimen_status']
                                  )
                                }
                                options={REGIMEN_STATUS_OPTIONS}
                              />
                              <EditableField
                                label="Reason for use"
                                value={medicationDraft.reason_for_use}
                                onChange={(value) =>
                                  handleMedicationDraftChange('reason_for_use', value)
                                }
                              />
                              <EditableField
                                label="Timing context"
                                value={medicationDraft.timing_context}
                                onChange={(value) =>
                                  handleMedicationDraftChange('timing_context', value)
                                }
                              />
                              <EditableField
                                label="Suggested generic"
                                value={medicationDraft.suggested_generic_name}
                                onChange={(value) =>
                                  handleMedicationDraftChange('suggested_generic_name', value)
                                }
                              />
                              <EditableField
                                label="Suggested brands"
                                value={medicationDraft.suggested_brand_names}
                                onChange={(value) =>
                                  handleMedicationDraftChange('suggested_brand_names', value)
                                }
                                placeholder="Comma-separated brand names"
                              />
                              <EditableField
                                label="Medication class"
                                value={medicationDraft.suggested_medication_class}
                                onChange={(value) =>
                                  handleMedicationDraftChange('suggested_medication_class', value)
                                }
                              />
                              <EditableField
                                label="Medication family"
                                value={medicationDraft.suggested_medication_family}
                                onChange={(value) =>
                                  handleMedicationDraftChange('suggested_medication_family', value)
                                }
                              />
                              <EditableField
                                label="Suggested route"
                                value={medicationDraft.suggested_route}
                                onChange={(value) =>
                                  handleMedicationDraftChange('suggested_route', value)
                                }
                              />
                              <EditableField
                                label="Dosage form"
                                value={medicationDraft.suggested_dosage_form}
                                onChange={(value) =>
                                  handleMedicationDraftChange('suggested_dosage_form', value)
                                }
                              />
                              <EditableField
                                label="Common dose units"
                                value={medicationDraft.suggested_common_dose_units}
                                onChange={(value) =>
                                  handleMedicationDraftChange('suggested_common_dose_units', value)
                                }
                                placeholder="Comma-separated units"
                              />
                              <EditableField
                                label="Active ingredients"
                                value={medicationDraft.suggested_active_ingredients}
                                onChange={(value) =>
                                  handleMedicationDraftChange('suggested_active_ingredients', value)
                                }
                                placeholder="Comma-separated active ingredients"
                              />
                              <EditableSelectField
                                label="Gut relevance"
                                value={medicationDraft.suggested_gut_relevance}
                                onChange={(value) =>
                                  handleMedicationDraftChange(
                                    'suggested_gut_relevance',
                                    value as MedicationDetailDraft['suggested_gut_relevance']
                                  )
                                }
                                options={GUT_RELEVANCE_OPTIONS}
                              />
                              <EditableField
                                label="Common gut effects"
                                value={medicationDraft.suggested_common_gut_effects}
                                onChange={(value) =>
                                  handleMedicationDraftChange(
                                    'suggested_common_gut_effects',
                                    value
                                  )
                                }
                                placeholder="Comma-separated gut effects"
                              />
                              <EditableField
                                label="Interaction flags"
                                value={medicationDraft.suggested_interaction_flags}
                                onChange={(value) =>
                                  handleMedicationDraftChange(
                                    'suggested_interaction_flags',
                                    value
                                  )
                                }
                                placeholder="Comma-separated flags"
                              />
                              <EditableField
                                label="RxNorm code"
                                value={medicationDraft.suggested_rxnorm_code}
                                onChange={(value) =>
                                  handleMedicationDraftChange('suggested_rxnorm_code', value)
                                }
                                placeholder="Optional RxNorm code"
                              />
                              <EditableField
                                label="Source label"
                                value={medicationDraft.enrichment_source_label}
                                onChange={(value) =>
                                  handleMedicationDraftChange('enrichment_source_label', value)
                                }
                              />
                              <EditableField
                                label="Source ref"
                                value={medicationDraft.enrichment_source_ref}
                                onChange={(value) =>
                                  handleMedicationDraftChange('enrichment_source_ref', value)
                                }
                              />
                              <EditableField
                                label="Confidence (0-1)"
                                value={medicationDraft.enrichment_confidence}
                                onChange={(value) =>
                                  handleMedicationDraftChange('enrichment_confidence', value)
                                }
                                inputMode="decimal"
                                placeholder="e.g. 0.84"
                              />
                              <EditableField
                                label="Knowledge note"
                                value={medicationDraft.enrichment_notes}
                                onChange={(value) =>
                                  handleMedicationDraftChange('enrichment_notes', value)
                                }
                                placeholder="Optional enrichment note"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {candidate.review_notes && (
                        <div className="rounded-[20px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                          {candidate.review_notes}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </SettingsPageLayout>
  );
}

function MetricTile({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: 'primary' | 'secondary' | 'neutral';
}) {
  const toneClassName =
    tone === 'primary'
      ? 'border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)]'
      : tone === 'secondary'
        ? 'border-[rgba(133,93,255,0.18)] bg-[rgba(133,93,255,0.08)]'
        : 'border-white/8 bg-white/[0.03]';

  return (
    <div className={`rounded-[24px] border px-4 py-4 ${toneClassName}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{helper}</p>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
  className = '',
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="mt-2 w-full rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-accent-primary)] focus:bg-black/[0.18]"
      />
    </label>
  );
}

function EditableSelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-accent-primary)] focus:bg-black/[0.18]"
      >
        {options.map((option) => (
          <option key={option.value || 'empty'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
