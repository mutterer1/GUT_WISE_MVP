import { searchFoodSuggestions } from '../data/foodSuggestions';
import { MEDICATION_CATALOG } from '../data/medicationCatalog';
import { supabase } from '../lib/supabase';
import type {
  FoodReferenceItemRow,
  MedicationReferenceItemRow,
} from '../types/intelligence';

export interface FoodReferenceSuggestion {
  id: string;
  name: string;
  estimatedCalories?: number;
  portionLabel?: string | null;
  proteinG?: number;
  fatG?: number;
  carbsG?: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  sourceLabel?: string | null;
  detail?: string | null;
}

export interface MedicationReferenceSuggestion {
  id: string;
  name: string;
  genericName?: string | null;
  medicationType?: 'prescription' | 'otc' | 'supplement' | 'unknown' | null;
  medicationClass?: string | null;
  medicationFamily?: string | null;
  route?: string | null;
  dosageForm?: string | null;
  sourceLabel?: string | null;
  detail?: string | null;
}

let foodReferenceCache: FoodReferenceItemRow[] | null = null;
let medicationReferenceCache: MedicationReferenceItemRow[] | null = null;

function normalizeLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

function formatServing(amount: number | null, unit: string | null): string | null {
  if (amount === null && !unit) return null;
  if (amount !== null && unit) return `${amount} ${unit}`;
  if (amount !== null) return String(amount);
  return unit;
}

function buildFoodDetail(row: FoodReferenceItemRow): string | null {
  const detailParts = [
    row.food_category,
    row.brand_name,
    typeof row.calories_kcal === 'number' ? `${Math.round(row.calories_kcal)} kcal` : null,
  ].filter(
    (part): part is string => typeof part === 'string' && part.trim().length > 0
  );
  return detailParts.length > 0 ? detailParts.join(' | ') : null;
}

function buildMedicationDetail(row: MedicationReferenceItemRow): string | null {
  const detailParts = [
    row.medication_class,
    row.medication_family,
    row.dosage_form,
    row.route,
    row.medication_type,
    row.source_label,
  ].filter((part): part is string => typeof part === 'string' && part.trim().length > 0);

  return detailParts.length > 0 ? detailParts.join(' | ') : null;
}

function dedupeById<T extends { id: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const deduped: T[] = [];

  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    deduped.push(row);
  }

  return deduped;
}

async function getFoodReferenceCache(): Promise<FoodReferenceItemRow[]> {
  if (foodReferenceCache !== null) return foodReferenceCache;

  const { data, error } = await supabase
    .from('food_reference_items')
    .select('*')
    .limit(300);

  if (error) throw error;

  foodReferenceCache = (data ?? []) as FoodReferenceItemRow[];
  return foodReferenceCache;
}

async function getMedicationReferenceCache(): Promise<MedicationReferenceItemRow[]> {
  if (medicationReferenceCache !== null) return medicationReferenceCache;

  const { data, error } = await supabase
    .from('medication_reference_items')
    .select('*')
    .limit(300);

  if (error) throw error;

  medicationReferenceCache = (data ?? []) as MedicationReferenceItemRow[];
  return medicationReferenceCache;
}

function aliasMatchesFood(query: string, row: FoodReferenceItemRow): boolean {
  const normalizedQuery = normalizeLookupKey(query);
  return row.common_aliases.some((alias) => {
    const normalizedAlias = normalizeLookupKey(alias);
    return (
      normalizedAlias.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedAlias)
    );
  });
}

function aliasMatchesMedication(query: string, row: MedicationReferenceItemRow): boolean {
  const normalizedQuery = normalizeLookupKey(query);
  return row.brand_names.some((brand) => {
    const normalizedBrand = normalizeLookupKey(brand);
    return (
      normalizedBrand.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedBrand)
    );
  });
}

function fallbackMedicationSuggestions(query: string): MedicationReferenceSuggestion[] {
  const normalizedQuery = normalizeLookupKey(query);
  const genericTerms = new Set([
    'ppi',
    'nsaid',
    'ssri',
    'antibiotic',
    'laxative',
    'antidiarrheal',
    'opioid',
    'fiber supplement',
    'h2 blocker',
  ]);

  const results: MedicationReferenceSuggestion[] = [];

  for (const entry of MEDICATION_CATALOG) {
    const matchingTerms = entry.matchTerms.filter((term) => {
      const normalizedTerm = normalizeLookupKey(term);
      return normalizedTerm.includes(normalizedQuery) && !genericTerms.has(normalizedTerm);
    });

    for (const term of matchingTerms) {
      const suggestionId = `fallback:${entry.id}:${term}`;
      if (results.some((result) => result.id === suggestionId)) continue;

      results.push({
        id: suggestionId,
        name: term
          .split(' ')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' '),
        detail: entry.label,
      });
    }
  }

  return results.slice(0, 8);
}

export async function searchFoodReferenceSuggestions(
  query: string
): Promise<FoodReferenceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const escaped = trimmed.replace(/[%_,'"]/g, '').trim();
  if (!escaped) return [];

  const { data, error } = await supabase
    .from('food_reference_items')
    .select('*')
    .or([`display_name.ilike.%${escaped}%`, `canonical_name.ilike.%${escaped}%`].join(','))
    .limit(8);

  if (error) throw error;

  let rows = (data ?? []) as FoodReferenceItemRow[];

  if (rows.length < 8) {
    const aliasRows = (await getFoodReferenceCache()).filter((row) =>
      aliasMatchesFood(trimmed, row)
    );
    rows = dedupeById([...rows, ...aliasRows]).slice(0, 8);
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.display_name,
    estimatedCalories: row.calories_kcal ?? undefined,
    portionLabel:
      row.reviewed_serving_label ??
      formatServing(row.default_serving_amount, row.default_serving_unit),
    proteinG: row.protein_g ?? undefined,
    fatG: row.fat_g ?? undefined,
    carbsG: row.carbs_g ?? undefined,
    fiberG: row.fiber_g ?? undefined,
    sugarG: row.sugar_g ?? undefined,
    sodiumMg: row.sodium_mg ?? undefined,
    sourceLabel: row.nutrition_source_label,
    detail: buildFoodDetail(row),
  }));
}

export async function searchFoodSuggestionsWithFallback(
  query: string
): Promise<FoodReferenceSuggestion[]> {
  try {
    return await searchFoodReferenceSuggestions(query);
  } catch {
    return searchFoodSuggestions(query).map((item) => ({
      id: `fallback:${item.name}`,
      name: item.name,
      estimatedCalories: item.calories,
      portionLabel: item.portionLabel,
      detail: 'fallback suggestion',
    }));
  }
}

export async function searchMedicationReferenceSuggestions(
  query: string
): Promise<MedicationReferenceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const escaped = trimmed.replace(/[%_,'"]/g, '').trim();
  if (!escaped) return [];

  const { data, error } = await supabase
    .from('medication_reference_items')
    .select('*')
    .or([`display_name.ilike.%${escaped}%`, `generic_name.ilike.%${escaped}%`].join(','))
    .limit(8);

  if (error) throw error;

  let rows = (data ?? []) as MedicationReferenceItemRow[];

  if (rows.length < 8) {
    const aliasRows = (await getMedicationReferenceCache()).filter((row) =>
      aliasMatchesMedication(trimmed, row)
    );
    rows = dedupeById([...rows, ...aliasRows]).slice(0, 8);
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.display_name,
    genericName: row.generic_name,
    medicationType: row.medication_type,
    medicationClass: row.medication_class,
    medicationFamily: row.medication_family,
    route: row.route,
    dosageForm: row.dosage_form,
    sourceLabel: row.source_label,
    detail: buildMedicationDetail(row),
  }));
}

export async function searchMedicationSuggestionsWithFallback(
  query: string
): Promise<MedicationReferenceSuggestion[]> {
  try {
    return await searchMedicationReferenceSuggestions(query);
  } catch {
    return fallbackMedicationSuggestions(query);
  }
}
