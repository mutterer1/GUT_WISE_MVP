import { supabase } from '../lib/supabase';
import type {
  MedicalFactRow,
  MedicalFactCategory,
  ConfirmationState,
  MedicalContextSummary,
  MedicalContextProfileRow,
  ConfirmedFactFilter,
  MedicalFact,
  DiagnosisFact,
  SuspectedConditionFact,
  MedicationFact,
  SurgeryProcedureFact,
  AllergyIntoleranceFact,
  DietGuidanceFact,
  RedFlagHistoryFact,
  CandidateMedicalFactRow,
  CandidateReviewStatus,
  MedicalDocumentIntakeRow,
  MedicalDocumentEvidenceSegmentRow,
  CandidateMedicalFactEvidenceRow,
} from '../types/medicalContext';

function rowToFact(row: MedicalFactRow): MedicalFact {
  const base = {
    id: row.id,
    user_id: row.user_id,
    category: row.category,
    confirmation_state: row.confirmation_state,
    provenance: {
      source: row.provenance_source,
      entered_at: row.provenance_entered_at,
      confirmed_at: row.provenance_confirmed_at,
      source_document_id: row.provenance_source_document_id,
      notes: row.provenance_notes,
    },
    is_active: row.is_active,
    deactivated_at: row.deactivated_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  return { ...base, detail: row.detail } as MedicalFact;
}

function categorizeFacts(facts: MedicalFact[]): Omit<MedicalContextSummary, 'user_id' | 'has_confirmed_facts' | 'last_updated'> {
  const result = {
    active_diagnoses: [] as DiagnosisFact[],
    suspected_conditions: [] as SuspectedConditionFact[],
    current_medications: [] as MedicationFact[],
    surgeries_procedures: [] as SurgeryProcedureFact[],
    allergies_intolerances: [] as AllergyIntoleranceFact[],
    active_diet_guidance: [] as DietGuidanceFact[],
    red_flag_history: [] as RedFlagHistoryFact[],
  };

  for (const fact of facts) {
    switch (fact.category) {
      case 'diagnosis':
        result.active_diagnoses.push(fact as DiagnosisFact);
        break;
      case 'suspected_condition':
        result.suspected_conditions.push(fact as SuspectedConditionFact);
        break;
      case 'medication':
        result.current_medications.push(fact as MedicationFact);
        break;
      case 'surgery_procedure':
        result.surgeries_procedures.push(fact as SurgeryProcedureFact);
        break;
      case 'allergy_intolerance':
        result.allergies_intolerances.push(fact as AllergyIntoleranceFact);
        break;
      case 'diet_guidance':
        result.active_diet_guidance.push(fact as DietGuidanceFact);
        break;
      case 'red_flag_history':
        result.red_flag_history.push(fact as RedFlagHistoryFact);
        break;
    }
  }

  return result;
}

export async function fetchActiveMedicalFacts(
  userId: string,
  filter?: ConfirmedFactFilter
): Promise<MedicalFact[]> {
  let query = supabase
    .from('medical_facts')
    .select('*')
    .eq('user_id', userId);

  if (filter?.active_only !== false) {
    query = query.eq('is_active', true);
  }

  if (filter?.confirmed_only) {
    query = query.in('confirmation_state', ['confirmed', 'user_reported'] as ConfirmationState[]);
  }

  if (filter?.categories?.length) {
    query = query.in('category', filter.categories as MedicalFactCategory[]);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data as MedicalFactRow[]).map(rowToFact);
}

export async function fetchMedicalContextSummary(userId: string): Promise<MedicalContextSummary> {
  const facts = await fetchActiveMedicalFacts(userId, {
    active_only: true,
    confirmed_only: true,
  });

  const categorized = categorizeFacts(facts);
  const lastUpdated = facts.length > 0 ? facts[0].updated_at : null;

  return {
    user_id: userId,
    ...categorized,
    has_confirmed_facts: facts.some(f => f.confirmation_state === 'confirmed'),
    last_updated: lastUpdated,
  };
}

export async function fetchMedicalContextProfile(
  userId: string
): Promise<MedicalContextProfileRow | null> {
  const { data, error } = await supabase
    .from('medical_context_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as MedicalContextProfileRow | null;
}

export async function ensureMedicalContextProfile(
  userId: string
): Promise<MedicalContextProfileRow> {
  const existing = await fetchMedicalContextProfile(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('medical_context_profiles')
    .insert({ user_id: userId })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as MedicalContextProfileRow;
}

export async function syncProfileCounters(userId: string): Promise<void> {
  const facts = await fetchActiveMedicalFacts(userId, { active_only: true });

  const activeCount = facts.filter(
    f => f.confirmation_state !== 'candidate'
  ).length;
  const hasRedFlags = facts.some(f => f.category === 'red_flag_history');

  let profileStatus: 'empty' | 'partial' | 'reviewed' = 'empty';
  if (activeCount > 0) profileStatus = 'partial';

  const { error } = await supabase
    .from('medical_context_profiles')
    .update({
      active_fact_count: activeCount,
      has_red_flags: hasRedFlags,
      profile_status: profileStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) throw error;
}

export async function fetchFactsByCategory(
  userId: string,
  category: MedicalFactCategory
): Promise<MedicalFact[]> {
  return fetchActiveMedicalFacts(userId, {
    categories: [category],
    active_only: true,
  });
}

export async function hasRedFlagHistory(userId: string): Promise<boolean> {
  const profile = await fetchMedicalContextProfile(userId);
  if (profile) return profile.has_red_flags;

  const facts = await fetchFactsByCategory(userId, 'red_flag_history');
  return facts.length > 0;
}

export async function fetchPendingCandidatesCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('candidate_medical_facts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('review_status', 'pending_review');

  if (error) throw error;
  return count ?? 0;
}

export interface CreateMedicalFactInput {
  category: MedicalFactCategory;
  detail: Record<string, unknown>;
  notes?: string;
}

export async function createMedicalFact(
  userId: string,
  input: CreateMedicalFactInput
): Promise<MedicalFact> {
  await ensureMedicalContextProfile(userId);

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('medical_facts')
    .insert({
      user_id: userId,
      category: input.category,
      confirmation_state: 'user_reported',
      detail: input.detail,
      provenance_source: 'manual_entry',
      provenance_entered_at: now,
      provenance_notes: input.notes || null,
      is_active: true,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  await syncProfileCounters(userId);
  return rowToFact(data as MedicalFactRow);
}

export async function updateMedicalFact(
  userId: string,
  factId: string,
  input: Partial<CreateMedicalFactInput>
): Promise<MedicalFact> {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.detail !== undefined) updates.detail = input.detail;
  if (input.notes !== undefined) updates.provenance_notes = input.notes || null;

  const { data, error } = await supabase
    .from('medical_facts')
    .update(updates)
    .eq('id', factId)
    .eq('user_id', userId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return rowToFact(data as MedicalFactRow);
}

export async function deactivateMedicalFact(
  userId: string,
  factId: string
): Promise<void> {
  const { error } = await supabase
    .from('medical_facts')
    .update({
      is_active: false,
      deactivated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', factId)
    .eq('user_id', userId);

  if (error) throw error;
  await syncProfileCounters(userId);
}

export async function createDocumentIntake(
  userId: string,
  input: {
    file_name: string;
    file_type: string;
    file_size_bytes: number;
    document_notes?: string;
    storage_bucket?: string;
    storage_path?: string;
    content_sha256?: string;
  }
): Promise<MedicalDocumentIntakeRow> {
  const { data, error } = await supabase
    .from('medical_document_intakes')
    .insert({
      user_id: userId,
      file_name: input.file_name,
      file_type: input.file_type,
      file_size_bytes: input.file_size_bytes,
      document_notes: input.document_notes || null,
      storage_bucket: input.storage_bucket || null,
      storage_path: input.storage_path || null,
      content_sha256: input.content_sha256 || null,
      intake_status: 'uploaded',
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as MedicalDocumentIntakeRow;
}

export async function fetchDocumentIntakes(
  userId: string
): Promise<MedicalDocumentIntakeRow[]> {
  const { data, error } = await supabase
    .from('medical_document_intakes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as MedicalDocumentIntakeRow[];
}

export async function updateIntakeStatus(
  userId: string,
  intakeId: string,
  status: MedicalDocumentIntakeRow['intake_status']
): Promise<void> {
  const { error } = await supabase
    .from('medical_document_intakes')
    .update({ intake_status: status, updated_at: new Date().toISOString() })
    .eq('id', intakeId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function seedCandidateFromIntake(
  userId: string,
  intakeId: string,
  candidate: { category: MedicalFactCategory; detail: Record<string, unknown>; extraction_notes?: string }
): Promise<CandidateMedicalFactRow> {
  const { data, error } = await supabase
    .from('candidate_medical_facts')
    .insert({
      user_id: userId,
      category: candidate.category,
      detail: candidate.detail,
      extraction_source: 'document_extraction',
      source_document_id: intakeId,
      extraction_confidence: null,
      extraction_notes: candidate.extraction_notes || null,
      review_status: 'pending_review',
    })
    .select()
    .maybeSingle();

  if (error) throw error;

  await supabase
    .from('medical_document_intakes')
    .update({
      candidate_count: (await fetchCandidatesForIntake(userId, intakeId)).length,
      intake_status: 'review_ready',
      updated_at: new Date().toISOString(),
    })
    .eq('id', intakeId)
    .eq('user_id', userId);

  return data as CandidateMedicalFactRow;
}

export async function fetchPendingCandidates(
  userId: string
): Promise<CandidateMedicalFactRow[]> {
  const { data, error } = await supabase
    .from('candidate_medical_facts')
    .select('*')
    .eq('user_id', userId)
    .eq('review_status', 'pending_review')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CandidateMedicalFactRow[];
}

export async function fetchCandidatesForIntake(
  userId: string,
  intakeId: string
): Promise<CandidateMedicalFactRow[]> {
  const { data, error } = await supabase
    .from('candidate_medical_facts')
    .select('*')
    .eq('user_id', userId)
    .eq('source_document_id', intakeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CandidateMedicalFactRow[];
}

export async function fetchDocumentEvidenceSegments(
  userId: string,
  intakeId: string
): Promise<MedicalDocumentEvidenceSegmentRow[]> {
  const { data, error } = await supabase
    .from('medical_document_evidence_segments')
    .select('*')
    .eq('user_id', userId)
    .eq('document_intake_id', intakeId)
    .order('page_number', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as MedicalDocumentEvidenceSegmentRow[];
}

export async function fetchCandidateEvidence(
  userId: string,
  candidateId: string
): Promise<CandidateMedicalFactEvidenceRow[]> {
  const { data, error } = await supabase
    .from('candidate_medical_fact_evidence')
    .select('*')
    .eq('user_id', userId)
    .eq('candidate_medical_fact_id', candidateId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as CandidateMedicalFactEvidenceRow[];
}

export async function fetchAllCandidates(
  userId: string,
  statusFilter?: CandidateReviewStatus
): Promise<CandidateMedicalFactRow[]> {
  let query = supabase
    .from('candidate_medical_facts')
    .select('*')
    .eq('user_id', userId);

  if (statusFilter) {
    query = query.eq('review_status', statusFilter);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CandidateMedicalFactRow[];
}

export async function acceptCandidate(
  userId: string,
  candidateId: string
): Promise<MedicalFact> {
  const { data: candidate, error: fetchErr } = await supabase
    .from('candidate_medical_facts')
    .select('*')
    .eq('id', candidateId)
    .eq('user_id', userId)
    .eq('review_status', 'pending_review')
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (!candidate) throw new Error('Candidate not found or already reviewed');

  const row = candidate as CandidateMedicalFactRow;
  const now = new Date().toISOString();

  await ensureMedicalContextProfile(userId);

  const { data: newFact, error: insertErr } = await supabase
    .from('medical_facts')
    .insert({
      user_id: userId,
      category: row.category,
      confirmation_state: 'confirmed',
      detail: row.detail,
      provenance_source: 'document_extraction',
      provenance_entered_at: row.created_at,
      provenance_confirmed_at: now,
      provenance_source_document_id: row.source_document_id,
      provenance_notes: row.extraction_notes,
      is_active: true,
    })
    .select()
    .maybeSingle();

  if (insertErr) throw insertErr;

  const promoted = newFact as MedicalFactRow;

  const { error: updateErr } = await supabase
    .from('candidate_medical_facts')
    .update({
      review_status: 'accepted',
      reviewed_at: now,
      promoted_fact_id: promoted.id,
      updated_at: now,
    })
    .eq('id', candidateId)
    .eq('user_id', userId);

  if (updateErr) throw updateErr;

  await syncProfileCounters(userId);
  return rowToFact(promoted);
}

export async function rejectCandidate(
  userId: string,
  candidateId: string
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('candidate_medical_facts')
    .update({
      review_status: 'rejected',
      reviewed_at: now,
      updated_at: now,
    })
    .eq('id', candidateId)
    .eq('user_id', userId)
    .eq('review_status', 'pending_review');

  if (error) throw error;
}
