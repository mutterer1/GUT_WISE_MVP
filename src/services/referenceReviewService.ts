import { supabase } from '../lib/supabase';
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

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function readFoodCandidateDetail(detail: Record<string, unknown>): FoodReferenceCandidateDetail {
  return {
    tags: Array.isArray(detail.tags)
      ? dedupeStrings(detail.tags.filter((tag): tag is string => typeof tag === 'string'))
      : [],
    estimated_calories:
      typeof detail.estimated_calories === 'number' ? detail.estimated_calories : null,
    portion_size:
      typeof detail.portion_size === 'string' && detail.portion_size.trim().length > 0
        ? detail.portion_size.trim()
        : null,
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
  };

  const existing = await findPendingCandidate({
    userId: input.userId,
    candidateKind: 'food',
    normalizedNameKey,
  });

  const now = new Date().toISOString();

  if (existing) {
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
    return;
  }

  const { error } = await supabase
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
    });

  if (error) throw error;
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
      brand_name: null,
      food_category: null,
      default_serving_amount: null,
      default_serving_unit: null,
      common_aliases: [],
      default_signals: deriveFoodSignalsFromTags(detail.tags),
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