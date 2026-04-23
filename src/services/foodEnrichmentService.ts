import { searchFoodSuggestions } from '../data/foodSuggestions';

export type FoodEnrichmentStatus =
  | 'not_started'
  | 'enriched'
  | 'fallback'
  | 'failed';

export interface FoodEnrichmentResult {
  suggestedFoodCategory: string | null;
  suggestedBrandName: string | null;
  suggestedCommonAliases: string[];
  suggestedServingLabel: string | null;
  suggestedCaloriesKcal: number | null;
  suggestedProteinG: number | null;
  suggestedFatG: number | null;
  suggestedCarbsG: number | null;
  suggestedFiberG: number | null;
  suggestedSugarG: number | null;
  suggestedSodiumMg: number | null;
  suggestedIngredientNames: string[];
  suggestedDefaultSignals: string[];
  enrichmentSourceLabel: string | null;
  enrichmentSourceRef: string | null;
  enrichmentConfidence: number | null;
  enrichmentStatus: FoodEnrichmentStatus;
  enrichmentLastAttemptAt: string;
  enrichmentNotes: string | null;
}

interface FetchFoodEnrichmentParams {
  displayName: string;
  observedTags?: string[];
  observedPortionSize?: string | null;
  observedCalories?: number | null;
  forceRefresh?: boolean;
}

interface OpenFoodFactsSearchResponse {
  products?: OpenFoodFactsProduct[];
}

interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  generic_name?: string;
  brands?: string;
  categories?: string;
  categories_tags?: string[];
  ingredients_text?: string;
  ingredients_text_en?: string;
  ingredients_tags?: string[];
  serving_size?: string;
  serving_quantity?: number | string;
  nutriments?: Record<string, unknown>;
}

const OPEN_FOOD_FACTS_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

const SIGNAL_KEYWORDS: Array<{ signal: string; keywords: string[] }> = [
  {
    signal: 'dairy',
    keywords: ['cheese', 'milk', 'cream', 'butter', 'yogurt', 'yoghurt', 'ricotta', 'mozzarella'],
  },
  {
    signal: 'gluten',
    keywords: ['wheat', 'flour', 'pasta', 'bread', 'semolina', 'barley', 'rye', 'noodle'],
  },
  {
    signal: 'high_fodmap',
    keywords: ['onion', 'garlic', 'beans', 'lentils', 'chickpeas', 'wheat', 'apple', 'pear', 'mushroom'],
  },
  {
    signal: 'artificial_sweetener',
    keywords: ['aspartame', 'sucralose', 'stevia', 'saccharin', 'acesulfame'],
  },
  {
    signal: 'high_fat',
    keywords: ['fried', 'oil', 'butter', 'cream', 'cheese', 'bacon', 'sausage', 'pepperoni'],
  },
  {
    signal: 'spicy',
    keywords: ['spicy', 'chili', 'chilli', 'jalapeno', 'pepper sauce', 'sriracha'],
  },
  {
    signal: 'caffeine_food',
    keywords: ['coffee', 'espresso', 'matcha', 'cocoa', 'chocolate'],
  },
  {
    signal: 'alcohol',
    keywords: ['wine', 'beer', 'rum', 'vodka', 'liqueur', 'alcohol'],
  },
  {
    signal: 'fiber_dense',
    keywords: ['oat', 'oats', 'beans', 'lentils', 'chia', 'flax', 'bran', 'whole grain', 'broccoli', 'spinach'],
  },
];

const enrichmentCache = new Map<string, FoodEnrichmentResult>();

function normalizeLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function cleanOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanOptionalNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function roundTo(value: number | null, digits = 1): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function buildEmptyResult(
  status: FoodEnrichmentStatus,
  lastAttemptAt: string,
  notes: string | null
): FoodEnrichmentResult {
  return {
    suggestedFoodCategory: null,
    suggestedBrandName: null,
    suggestedCommonAliases: [],
    suggestedServingLabel: null,
    suggestedCaloriesKcal: null,
    suggestedProteinG: null,
    suggestedFatG: null,
    suggestedCarbsG: null,
    suggestedFiberG: null,
    suggestedSugarG: null,
    suggestedSodiumMg: null,
    suggestedIngredientNames: [],
    suggestedDefaultSignals: [],
    enrichmentSourceLabel: null,
    enrichmentSourceRef: null,
    enrichmentConfidence: null,
    enrichmentStatus: status,
    enrichmentLastAttemptAt: lastAttemptAt,
    enrichmentNotes: notes,
  };
}

function scoreNameMatch(query: string, candidate: string): number {
  const normalizedQuery = normalizeLookupKey(query);
  const normalizedCandidate = normalizeLookupKey(candidate);

  if (!normalizedQuery || !normalizedCandidate) return 0;
  if (normalizedCandidate === normalizedQuery) return 1.35;
  if (normalizedCandidate.startsWith(normalizedQuery)) return 1.05;
  if (normalizedCandidate.includes(normalizedQuery)) return 0.8;
  if (normalizedQuery.includes(normalizedCandidate)) return 0.55;

  const queryTokens = normalizedQuery.split(' ');
  const candidateTokens = normalizedCandidate.split(' ');
  const overlap = queryTokens.filter((token) => candidateTokens.includes(token)).length;
  return overlap > 0 ? overlap / Math.max(queryTokens.length, candidateTokens.length) : 0;
}

function parseServingQuantity(product: OpenFoodFactsProduct): number | null {
  const explicitQuantity = cleanOptionalNumber(product.serving_quantity);
  if (explicitQuantity !== null) return explicitQuantity;

  const servingSize = cleanOptionalText(product.serving_size);
  if (!servingSize) return null;

  const match = servingSize.match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i);
  if (!match) return null;

  const parsed = Number.parseFloat(match[1].replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function readNutriment(
  nutriments: Record<string, unknown> | undefined,
  key: string,
  servingQuantity: number | null
): number | null {
  if (!nutriments) return null;

  const perServing = cleanOptionalNumber(nutriments[`${key}_serving`]);
  if (perServing !== null) return roundTo(perServing);

  const per100g = cleanOptionalNumber(nutriments[`${key}_100g`]);
  if (per100g !== null && servingQuantity !== null) {
    return roundTo((per100g * servingQuantity) / 100);
  }

  return roundTo(cleanOptionalNumber(nutriments[key]));
}

function titleizeSlug(value: string): string {
  return value
    .replace(/^([a-z]{2}:)/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function deriveFoodCategory(product: OpenFoodFactsProduct): string | null {
  const categoryTags = Array.isArray(product.categories_tags)
    ? product.categories_tags.filter((value): value is string => typeof value === 'string')
    : [];

  const preferredTag =
    [...categoryTags].reverse().find((tag) => !tag.includes('foods') && !tag.includes('beverages')) ??
    [...categoryTags].reverse()[0];

  if (preferredTag) {
    return titleizeSlug(preferredTag);
  }

  const categories = cleanOptionalText(product.categories);
  if (!categories) return null;

  const categoryValues = categories
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const lastCategory =
    categoryValues.length > 0 ? categoryValues[categoryValues.length - 1] : null;

  return cleanOptionalText(lastCategory);
}

function extractIngredientNames(product: OpenFoodFactsProduct): string[] {
  const tagIngredients = Array.isArray(product.ingredients_tags)
    ? product.ingredients_tags
        .filter((value): value is string => typeof value === 'string')
        .map(titleizeSlug)
        .filter((value) => value.length > 1)
    : [];

  if (tagIngredients.length > 0) {
    return dedupeStrings(tagIngredients).slice(0, 10);
  }

  const ingredientText =
    cleanOptionalText(product.ingredients_text_en) ?? cleanOptionalText(product.ingredients_text);

  if (!ingredientText) return [];

  return dedupeStrings(
    ingredientText
      .split(/[;,]/g)
      .map((value) => value.replace(/\([^)]*\)/g, '').replace(/\d+%/g, '').trim())
      .filter(Boolean)
  ).slice(0, 10);
}

function deriveSignalsFromText(values: string[]): string[] {
  const haystack = normalizeLookupKey(values.join(' '));

  return SIGNAL_KEYWORDS.flatMap((entry) =>
    entry.keywords.some((keyword) => haystack.includes(normalizeLookupKey(keyword)))
      ? [entry.signal]
      : []
  );
}

function buildSourceRef(product: OpenFoodFactsProduct): string | null {
  if (!product.code) return null;
  return `https://world.openfoodfacts.org/product/${product.code}`;
}

function scoreProductMatch(
  query: string,
  product: OpenFoodFactsProduct
): { score: number; confidence: number } {
  const productName = cleanOptionalText(product.product_name) ?? '';
  const genericName = cleanOptionalText(product.generic_name) ?? '';
  const brandName = cleanOptionalText(product.brands) ?? '';
  const ingredientCount = extractIngredientNames(product).length;
  const servingQuantity = parseServingQuantity(product);

  let score = Math.max(
    scoreNameMatch(query, productName),
    scoreNameMatch(query, genericName),
    scoreNameMatch(query, `${brandName} ${productName}`.trim())
  );

  if (servingQuantity !== null) score += 0.08;
  if (ingredientCount > 0) score += 0.12;
  if (product.nutriments) score += 0.18;
  if (cleanOptionalText(product.categories)) score += 0.04;

  const confidence = Math.min(0.94, Math.max(0.25, score / 1.65));
  return { score, confidence };
}

function buildResultFromProduct(
  product: OpenFoodFactsProduct,
  confidence: number,
  attemptedAt: string
): FoodEnrichmentResult {
  const servingQuantity = parseServingQuantity(product);
  const caloriesKcal = readNutriment(product.nutriments, 'energy-kcal', servingQuantity);
  const proteinG = readNutriment(product.nutriments, 'proteins', servingQuantity);
  const fatG = readNutriment(product.nutriments, 'fat', servingQuantity);
  const carbsG = readNutriment(product.nutriments, 'carbohydrates', servingQuantity);
  const fiberG = readNutriment(product.nutriments, 'fiber', servingQuantity);
  const sugarG = readNutriment(product.nutriments, 'sugars', servingQuantity);
  const sodiumG = readNutriment(product.nutriments, 'sodium', servingQuantity);
  const ingredientNames = extractIngredientNames(product);
  const foodCategory = deriveFoodCategory(product);
  const defaultSignals = dedupeStrings(
    deriveSignalsFromText([
      cleanOptionalText(product.product_name) ?? '',
      cleanOptionalText(product.generic_name) ?? '',
      cleanOptionalText(product.categories) ?? '',
      ...ingredientNames,
    ])
  );

  const servingLabel =
    cleanOptionalText(product.serving_size) ??
    (servingQuantity !== null ? `${servingQuantity} g` : null);

  const suggestedCommonAliases = dedupeStrings([
    cleanOptionalText(product.generic_name) ?? '',
  ]).filter((alias) => normalizeLookupKey(alias) !== normalizeLookupKey(product.product_name ?? ''));

  const resolvedConfidence =
    caloriesKcal !== null || proteinG !== null || fatG !== null || carbsG !== null
      ? confidence
      : Math.min(confidence, 0.52);

  return {
    suggestedFoodCategory: foodCategory,
    suggestedBrandName: cleanOptionalText(product.brands),
    suggestedCommonAliases,
    suggestedServingLabel: servingLabel,
    suggestedCaloriesKcal: caloriesKcal,
    suggestedProteinG: proteinG,
    suggestedFatG: fatG,
    suggestedCarbsG: carbsG,
    suggestedFiberG: fiberG,
    suggestedSugarG: sugarG,
    suggestedSodiumMg: sodiumG !== null ? roundTo(sodiumG * 1000) : null,
    suggestedIngredientNames: ingredientNames,
    suggestedDefaultSignals: defaultSignals,
    enrichmentSourceLabel: 'Open Food Facts',
    enrichmentSourceRef: buildSourceRef(product),
    enrichmentConfidence: roundTo(resolvedConfidence, 2),
    enrichmentStatus: 'enriched',
    enrichmentLastAttemptAt: attemptedAt,
    enrichmentNotes: cleanOptionalText(product.product_name)
      ? `Matched ${product.product_name} from Open Food Facts.`
      : 'Matched a food record from Open Food Facts.',
  };
}

async function fetchOpenFoodFactsProduct(
  query: string
): Promise<FoodEnrichmentResult | null> {
  const attemptedAt = new Date().toISOString();
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '10',
    sort_by: 'unique_scans_n',
    fields:
      'code,product_name,generic_name,brands,categories,categories_tags,ingredients_text,ingredients_text_en,ingredients_tags,serving_size,serving_quantity,nutriments',
  });

  const response = await fetch(`${OPEN_FOOD_FACTS_SEARCH_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Open Food Facts lookup failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as OpenFoodFactsSearchResponse;
  const products = Array.isArray(payload.products) ? payload.products : [];
  if (products.length === 0) return null;

  const ranked = products
    .map((product) => ({
      product,
      ...scoreProductMatch(query, product),
    }))
    .sort((left, right) => right.score - left.score);

  const best = ranked[0];
  if (!best || best.score < 0.55) {
    return null;
  }

  return buildResultFromProduct(best.product, best.confidence, attemptedAt);
}

function deriveFallbackCategory(query: string): string | null {
  const normalized = normalizeLookupKey(query);

  if (normalized.includes('salad')) return 'Salad';
  if (normalized.includes('soup')) return 'Soup';
  if (normalized.includes('sandwich')) return 'Sandwich';
  if (normalized.includes('pizza')) return 'Pizza';
  if (normalized.includes('pasta') || normalized.includes('lasagna')) return 'Pasta Dish';
  if (normalized.includes('rice')) return 'Rice Dish';
  if (normalized.includes('yogurt')) return 'Yogurt';
  if (normalized.includes('bread')) return 'Bread';

  return null;
}

function buildFallbackSuggestion(
  params: FetchFoodEnrichmentParams
): FoodEnrichmentResult | null {
  const attemptedAt = new Date().toISOString();
  const fallback = searchFoodSuggestions(params.displayName)[0];
  const suggestedSignals = dedupeStrings(
    deriveSignalsFromText([
      params.displayName,
      ...(params.observedTags ?? []),
    ])
  );

  if (!fallback && suggestedSignals.length === 0) {
    return buildEmptyResult(
      'failed',
      attemptedAt,
      'No external food match was found and no useful fallback suggestion is available yet.'
    );
  }

  return {
    suggestedFoodCategory: deriveFallbackCategory(params.displayName),
    suggestedBrandName: null,
    suggestedCommonAliases: [],
    suggestedServingLabel: fallback?.portionLabel ?? cleanOptionalText(params.observedPortionSize),
    suggestedCaloriesKcal:
      fallback?.calories ?? cleanOptionalNumber(params.observedCalories) ?? null,
    suggestedProteinG: null,
    suggestedFatG: null,
    suggestedCarbsG: null,
    suggestedFiberG: null,
    suggestedSugarG: null,
    suggestedSodiumMg: null,
    suggestedIngredientNames: [],
    suggestedDefaultSignals: suggestedSignals,
    enrichmentSourceLabel: fallback ? 'Local fallback suggestion' : null,
    enrichmentSourceRef: fallback ? fallback.name : null,
    enrichmentConfidence: fallback ? 0.34 : 0.18,
    enrichmentStatus: 'fallback',
    enrichmentLastAttemptAt: attemptedAt,
    enrichmentNotes: fallback
      ? 'Used the local fallback food suggestion set because no confident external match was available.'
      : 'Only heuristic gut-signal fallback was available for this food name.',
  };
}

export async function fetchFoodEnrichment(
  params: FetchFoodEnrichmentParams
): Promise<FoodEnrichmentResult> {
  const normalizedName = normalizeLookupKey(params.displayName);
  if (!normalizedName) {
    return buildEmptyResult(
      'failed',
      new Date().toISOString(),
      'Food name was empty, so no enrichment lookup could run.'
    );
  }

  const cached = !params.forceRefresh ? enrichmentCache.get(normalizedName) : null;
  if (cached) {
    return {
      ...cached,
      enrichmentLastAttemptAt: new Date().toISOString(),
    };
  }

  try {
    const externalMatch = await fetchOpenFoodFactsProduct(params.displayName);
    if (externalMatch) {
      enrichmentCache.set(normalizedName, externalMatch);
      return externalMatch;
    }
  } catch {
    // Fall back below. The queue should still remain usable if the provider is unavailable.
  }

  const fallback = buildFallbackSuggestion(params);
  if (fallback) {
    if (fallback.enrichmentStatus === 'enriched') {
      enrichmentCache.set(normalizedName, fallback);
    }
    return fallback;
  }

  return buildEmptyResult(
    'failed',
    new Date().toISOString(),
    'Food enrichment did not return any usable source match.'
  );
}
