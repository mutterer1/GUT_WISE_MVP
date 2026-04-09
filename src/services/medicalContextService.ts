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
