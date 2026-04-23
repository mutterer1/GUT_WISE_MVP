import { supabase } from '../lib/supabase';
import { fetchFoodEnrichment } from './foodEnrichmentService';
import type {
  FoodReferenceCandidateDetail,
  FoodReferenceItemRow,
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

export function readFoodCandidateDetail(
  detail: Record<string, unknown>
): FoodReferenceCandidateDetail {
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
    suggested_ingredient_names: Array.isArray(detail.suggested_ingredient_names)
      ? dedupeStrings(
          detail.suggested_ingredient_names.filter(
            (ingredient): ingredient is string => typeof ingredient === 'string'
          )
        )
      : [],
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
    enrichment_confidence: cleanOptionalConfidence(detail.enrichment_confidence),
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

function readMedicationCandidateDetail(
  detail: Record<string, unknown>
): MedicationReferenceCandidateDetail {
  return {
    dosage: cleanOptionalText(typeof detail.dosage === 'string' ? detail.dosage : null),
    medication_type:
      detail.medication_type === 'prescription' ||
      detail.medication_type === 'otc' ||
      detail.medication_type === 'supplement' ||
      detail.medication_type === 'unknown'
        ? detail.medication_type
        : null,
    route: cleanOptionalText(typeof detail.route === 'string' ? detail.route : null),
    reason_for_use: cleanOptionalText(
      typeof detail.reason_for_use === 'string' ? detail.reason_for_use : null
    ),
    regimen_status:
      detail.regimen_status === 'scheduled' ||
      detail.regimen_status === 'as_needed' ||
      detail.regimen_status === 'one_time' ||
      detail.regimen_status === 'unknown'
        ? detail.regimen_status
        : null,
    timing_context: cleanOptionalText(
      typeof detail.timing_context === 'string' ? detail.timing_context : null
    ),
  };
}

function mergeFoodCandidateDetails(
  existing: Record<string, unknown>,
  incoming: FoodReferenceCandidateDetail
): FoodReferenceCandidateDetail {
  const existingDetail = readFoodCandidateDetail(existing);

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
    suggested_ingredient_names: dedupeStrings([
      ...existingDetail.suggested_ingredient_names,
      ...incoming.suggested_ingredient_names,
    ]),
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
    suggested_ingredient_names: enriched.suggested_ingredient_names,
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

function mergeMedicationCandidateDetails(
  existing: Record<string, unknown>,
  incoming: MedicationReferenceCandidateDetail
): MedicationReferenceCandidateDetail {
  const existingDetail = readMedicationCandidateDetail(existing);

  return {
    dosage: existingDetail.dosage ?? incoming.dosage ?? null,
    medication_type: existingDetail.medication_type ?? incoming.medication_type ?? null,
    route: existingDetail.route ?? incoming.route ?? null,
    reason_for_use: existingDetail.reason_for_use ?? incoming.reason_for_use ?? null,
    regimen_status: existingDetail.regimen_status ?? incoming.regimen_status ?? null,
    timing_context: existingDetail.timing_context ?? incoming.timing_context ?? null,
  };
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

  if (detail.suggested_ingredient_names.length > 0) {
    parts.push(`Suggested ingredients: ${detail.suggested_ingredient_names.join(', ')}`);
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
  if (detail.reason_for_use) parts.push(`Observed reason: ${detail.reason_for_use}`);
  if (detail.regimen_status) parts.push(`Observed regimen: ${detail.regimen_status}`);
  if (detail.timing_context) parts.push(`Observed timing: ${detail.timing_context}`);

  return parts.join(' | ');
}

function deriveFoodSignalsFromTags(tags: string[]): string[] {
  const signals = tags.flatMap((tag) => FOOD_TAG_TO_SIGNAL[normalizeLookupKey(tag)] ?? []);
  return dedupeStrings(signals);
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

  const detail: MedicationReferenceCandidateDetail = {
    dosage: cleanOptionalText(input.dosage),
    medication_type: input.medicationType ?? null,
    route: cleanOptionalText(input.route),
    reason_for_use: cleanOptionalText(input.reasonForUse),
    regimen_status: input.regimenStatus ?? null,
    timing_context: cleanOptionalText(input.timingContext),
  };

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

  return {
    status: 'accepted',
    promotedReferenceId: promoted.id,
  };
}

async function promoteMedicationCandidate(
  userId: string,
  candidate: ReferenceReviewCandidateRow
): Promise<{ status: ReferenceCandidateReviewStatus; promotedReferenceId: string }> {
  const existingReference = await resolveExistingMedicationReference(candidate.display_name);
  if (existingReference) {
    const { error: updateMedicationLogsError } = await supabase
      .from('medication_logs')
      .update({
        normalized_medication_id: existingReference.id,
        route: existingReference.route,
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

  const detail = readMedicationCandidateDetail(candidate.detail);

  const { data, error } = await supabase
    .from('medication_reference_items')
    .insert({
      generic_name: candidate.display_name,
      display_name: candidate.display_name,
      brand_names: [],
      rxnorm_code: null,
      medication_class: null,
      route: detail.route,
      medication_type: detail.medication_type ?? 'unknown',
      gut_relevance: 'unknown',
      common_gut_effects: [],
      interaction_flags: [],
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
      route: detail.route ?? promoted.route,
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
