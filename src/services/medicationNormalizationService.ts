import { supabase } from '../lib/supabase';
import type {
  MedicationReferenceItemRow,
  MedicationRegimenStatus,
} from '../types/intelligence';

export interface MedicationNormalizationInput {
  medication_name: string;
  dosage: string;
  medication_type: 'prescription' | 'otc' | 'supplement';
  route?: string | null;
  reason_for_use?: string | null;
  regimen_status?: MedicationRegimenStatus | null;
  timing_context?: string | null;
}

interface ParsedDose {
  dose_value: number | null;
  dose_unit: string | null;
}

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

export function parseDosageComponents(dosage: string): ParsedDose {
  const cleaned = dosage.trim();
  if (!cleaned) {
    return { dose_value: null, dose_unit: null };
  }

  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z][a-zA-Z0-9/%-]*)?/);
  if (!match) {
    return { dose_value: null, dose_unit: null };
  }

  return {
    dose_value: Number.parseFloat(match[1]),
    dose_unit: match[2] ? match[2].toLowerCase() : null,
  };
}

function pickBestMedicationReferenceMatch(
  medicationName: string,
  candidates: MedicationReferenceItemRow[]
): MedicationReferenceItemRow | null {
  const normalizedName = normalizeLookupKey(medicationName);

  const exactDisplay = candidates.find(
    (candidate) => normalizeLookupKey(candidate.display_name) === normalizedName
  );
  if (exactDisplay) return exactDisplay;

  const exactGeneric = candidates.find(
    (candidate) => normalizeLookupKey(candidate.generic_name) === normalizedName
  );
  if (exactGeneric) return exactGeneric;

  const brandAlias = candidates.find((candidate) =>
    candidate.brand_names.some((brand) => normalizeLookupKey(brand) === normalizedName)
  );
  if (brandAlias) return brandAlias;

  const partialDisplay = candidates.find((candidate) =>
    normalizeLookupKey(candidate.display_name).includes(normalizedName)
  );
  if (partialDisplay) return partialDisplay;

  const partialGeneric = candidates.find((candidate) =>
    normalizeLookupKey(candidate.generic_name).includes(normalizedName)
  );
  if (partialGeneric) return partialGeneric;

  return null;
}

async function resolveMedicationReference(
  medicationName: string
): Promise<MedicationReferenceItemRow | null> {
  const cleanedName = medicationName.replace(/[%_,'"]/g, '').trim();
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

  return pickBestMedicationReferenceMatch(
    medicationName,
    (data ?? []) as MedicationReferenceItemRow[]
  );
}

export async function syncMedicationNormalizationForLog(params: {
  medicationLogId: string;
  userId: string;
  formData: MedicationNormalizationInput;
}): Promise<void> {
  const { medicationLogId, userId, formData } = params;
  const parsedDose = parseDosageComponents(formData.dosage);
  const matchedReference = await resolveMedicationReference(formData.medication_name);

  const { error } = await supabase
    .from('medication_logs')
    .update({
      normalized_medication_id: matchedReference?.id ?? null,
      dose_value: parsedDose.dose_value,
      dose_unit: parsedDose.dose_unit,
      route: cleanOptionalText(formData.route) ?? matchedReference?.route ?? null,
      reason_for_use: cleanOptionalText(formData.reason_for_use),
      regimen_status: formData.regimen_status ?? 'unknown',
      timing_context: cleanOptionalText(formData.timing_context),
      updated_at: new Date().toISOString(),
    })
    .eq('id', medicationLogId)
    .eq('user_id', userId);

  if (error) throw error;
}
