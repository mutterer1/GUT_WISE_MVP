import { searchFoodSuggestions } from '../data/foodSuggestions';
import { INGREDIENT_CATALOG } from '../data/ingredientCatalog';
import { MEDICATION_CATALOG } from '../data/medicationCatalog';

export interface FoodReferenceSuggestion {
  id: string;
  name: string;
  estimatedCalories?: number;
  portionLabel?: string;
  detail?: string;
}

export interface MedicationReferenceSuggestion {
  id: string;
  name: string;
  medicationType: 'prescription' | 'otc' | 'supplement';
  route?: string;
  genericName?: string;
  detail?: string;
}

export async function searchFoodSuggestionsWithFallback(
  query: string
): Promise<FoodReferenceSuggestion[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const basic = searchFoodSuggestions(q);
  const results: FoodReferenceSuggestion[] = basic.map((item) => ({
    id: item.name.replace(/\s+/g, '_'),
    name: item.name,
    estimatedCalories: item.calories,
    portionLabel: item.portionLabel,
  }));

  if (results.length < 5) {
    const seen = new Set(results.map((r) => r.id));
    for (const entry of INGREDIENT_CATALOG) {
      if (results.length >= 7) break;
      const matches =
        entry.label.toLowerCase().includes(q) ||
        entry.matchTerms.some((term) => term.includes(q));
      if (matches && !seen.has(entry.id)) {
        seen.add(entry.id);
        results.push({
          id: entry.id,
          name: entry.label,
          detail: entry.commonGutEffects.slice(0, 2).join(', ') || undefined,
        });
      }
    }
  }

  return results.slice(0, 7);
}

function resolveMedicationType(
  family: string
): MedicationReferenceSuggestion['medicationType'] {
  const otcFamilies = new Set([
    'h2_blocker',
    'antidiarrheal',
    'nsaid',
    'laxative',
    'fiber_supplement',
    'probiotic',
    'magnesium',
  ]);
  const supplementFamilies = new Set(['probiotic', 'magnesium', 'fiber_supplement']);
  if (supplementFamilies.has(family)) return 'supplement';
  if (otcFamilies.has(family)) return 'otc';
  return 'prescription';
}

function resolveRoute(family: string): string | undefined {
  const oral = new Set([
    'ppi',
    'h2_blocker',
    'antibiotic',
    'laxative',
    'antidiarrheal',
    'nsaid',
    'metformin',
    'magnesium',
    'iron',
    'probiotic',
    'fiber_supplement',
    'opioid',
    'ssri',
    'gi_antiinflammatory',
  ]);
  if (oral.has(family)) return 'oral';
  return undefined;
}

export async function searchMedicationSuggestionsWithFallback(
  query: string
): Promise<MedicationReferenceSuggestion[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: MedicationReferenceSuggestion[] = [];

  for (const entry of MEDICATION_CATALOG) {
    if (results.length >= 7) break;
    const labelMatch = entry.label.toLowerCase().includes(q);
    const termMatch = entry.matchTerms.some((term) => term.includes(q));
    if (labelMatch || termMatch) {
      const matchedTerm = entry.matchTerms.find((term) => term.includes(q));
      results.push({
        id: entry.id,
        name: matchedTerm ?? entry.label,
        medicationType: resolveMedicationType(entry.family),
        route: resolveRoute(entry.family),
        genericName: matchedTerm && matchedTerm !== entry.label.toLowerCase()
          ? entry.label
          : undefined,
        detail: entry.commonGutEffects.slice(0, 2).join(', ') || undefined,
      });
    }
  }

  return results;
}
