import {
  MEDICATION_CATALOG,
  type MedicationFamilyKey,
  type MedicationGutEffectKey,
} from '../data/medicationCatalog';

export interface MedicationIntelligenceInput {
  medication_name: string;
  side_effects?: string[] | null;
  notes?: string | null;
}

export interface DerivedMedicationIntelligence {
  matched_medication_ids: string[];
  medication_families: MedicationFamilyKey[];
  medication_gut_effects: MedicationGutEffectKey[];
  gi_risk_medication_count: number;
  motility_slowing_medication_count: number;
  motility_speeding_medication_count: number;
  acid_suppression_medication_count: number;
  microbiome_disruption_medication_count: number;
  common_gut_effects: string[];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export function deriveMedicationIntelligence(
  input: MedicationIntelligenceInput
): DerivedMedicationIntelligence {
  const searchText = [
    input.medication_name,
    ...(input.side_effects ?? []),
    input.notes ?? '',
  ]
    .join(' ')
    .toLowerCase();

  const matchedEntries = MEDICATION_CATALOG.filter((entry) =>
    entry.matchTerms.some((term) => searchText.includes(term))
  );

  const gutEffects = unique(
    matchedEntries.flatMap((entry) => entry.gutEffects)
  ) as MedicationGutEffectKey[];

  const commonGutEffects = unique(
    matchedEntries.flatMap((entry) => entry.commonGutEffects)
  );

  return {
    matched_medication_ids: matchedEntries.map((entry) => entry.id).sort(),
    medication_families: unique(
      matchedEntries.map((entry) => entry.family)
    ) as MedicationFamilyKey[],
    medication_gut_effects: gutEffects,
    gi_risk_medication_count: matchedEntries.length,
    motility_slowing_medication_count: gutEffects.includes('motility_slowing') ? 1 : 0,
    motility_speeding_medication_count: gutEffects.includes('motility_speeding') ? 1 : 0,
    acid_suppression_medication_count: gutEffects.includes('acid_suppression') ? 1 : 0,
    microbiome_disruption_medication_count: gutEffects.includes('microbiome_disruption') ? 1 : 0,
    common_gut_effects: commonGutEffects,
  };
}
