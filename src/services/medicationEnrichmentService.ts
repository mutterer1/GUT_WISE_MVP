import {
  MEDICATION_CATALOG,
  type MedicationFamilyKey,
} from '../data/medicationCatalog';
import type {
  MedicationGutRelevance,
  MedicationReferenceType,
} from '../types/intelligence';

export type MedicationEnrichmentStatus =
  | 'not_started'
  | 'enriched'
  | 'fallback'
  | 'failed';

export interface MedicationEnrichmentResult {
  suggestedGenericName: string | null;
  suggestedBrandNames: string[];
  suggestedMedicationClass: string | null;
  suggestedMedicationFamily: string | null;
  suggestedRxnormCode: string | null;
  suggestedGutRelevance: MedicationGutRelevance | null;
  suggestedCommonGutEffects: string[];
  suggestedInteractionFlags: string[];
  suggestedActiveIngredients: string[];
  suggestedCommonDoseUnits: string[];
  suggestedDosageForm: string | null;
  suggestedRoute: string | null;
  suggestedMedicationType: MedicationReferenceType | null;
  enrichmentSourceLabel: string | null;
  enrichmentSourceRef: string | null;
  enrichmentConfidence: number | null;
  enrichmentStatus: MedicationEnrichmentStatus;
  enrichmentLastAttemptAt: string;
  enrichmentNotes: string | null;
}

interface FetchMedicationEnrichmentParams {
  displayName: string;
  observedMedicationType?: MedicationReferenceType | null;
  observedRoute?: string | null;
  observedDosage?: string | null;
  reasonForUse?: string | null;
  forceRefresh?: boolean;
}

interface MedicationEnrichmentProfile {
  id: string;
  genericName: string;
  medicationClass: string;
  medicationFamily: MedicationFamilyKey;
  brandNames: string[];
  matchTerms: string[];
  medicationType?: MedicationReferenceType | null;
  route?: string | null;
  dosageForm?: string | null;
  commonDoseUnits?: string[];
  activeIngredients?: string[];
  gutRelevance?: MedicationGutRelevance;
  commonGutEffects?: string[];
  interactionFlags?: string[];
  rxnormCode?: string | null;
}

const KNOWLEDGE_BASE_LABEL = 'GutWise medication knowledge base';

const MEDICATION_CLASS_LABELS: Record<MedicationFamilyKey, string> = {
  ppi: 'Proton pump inhibitor',
  h2_blocker: 'H2 receptor blocker',
  antibiotic: 'Antibiotic',
  laxative: 'Laxative',
  antidiarrheal: 'Antidiarrheal',
  nsaid: 'NSAID',
  metformin: 'Biguanide',
  magnesium: 'Mineral supplement',
  iron: 'Iron supplement',
  probiotic: 'Probiotic',
  fiber_supplement: 'Fiber supplement',
  opioid: 'Opioid analgesic',
  ssri: 'SSRI antidepressant',
  gi_antiinflammatory: 'GI anti-inflammatory',
};

const MEDICATION_GUT_RELEVANCE: Record<MedicationFamilyKey, MedicationGutRelevance> = {
  ppi: 'secondary',
  h2_blocker: 'secondary',
  antibiotic: 'secondary',
  laxative: 'primary',
  antidiarrheal: 'primary',
  nsaid: 'secondary',
  metformin: 'secondary',
  magnesium: 'secondary',
  iron: 'secondary',
  probiotic: 'secondary',
  fiber_supplement: 'secondary',
  opioid: 'secondary',
  ssri: 'indirect',
  gi_antiinflammatory: 'primary',
};

const MEDICATION_ROUTE_BY_FAMILY: Record<MedicationFamilyKey, string> = {
  ppi: 'oral',
  h2_blocker: 'oral',
  antibiotic: 'oral',
  laxative: 'oral',
  antidiarrheal: 'oral',
  nsaid: 'oral',
  metformin: 'oral',
  magnesium: 'oral',
  iron: 'oral',
  probiotic: 'oral',
  fiber_supplement: 'oral',
  opioid: 'oral',
  ssri: 'oral',
  gi_antiinflammatory: 'oral',
};

const MEDICATION_FORM_BY_FAMILY: Record<MedicationFamilyKey, string> = {
  ppi: 'capsule',
  h2_blocker: 'tablet',
  antibiotic: 'capsule',
  laxative: 'powder',
  antidiarrheal: 'capsule',
  nsaid: 'tablet',
  metformin: 'tablet',
  magnesium: 'tablet',
  iron: 'tablet',
  probiotic: 'capsule',
  fiber_supplement: 'powder',
  opioid: 'tablet',
  ssri: 'tablet',
  gi_antiinflammatory: 'tablet',
};

const MEDICATION_DOSE_UNITS_BY_FAMILY: Record<MedicationFamilyKey, string[]> = {
  ppi: ['mg'],
  h2_blocker: ['mg'],
  antibiotic: ['mg'],
  laxative: ['g', 'mg', 'packet'],
  antidiarrheal: ['mg'],
  nsaid: ['mg'],
  metformin: ['mg'],
  magnesium: ['mg'],
  iron: ['mg'],
  probiotic: ['capsule', 'packet'],
  fiber_supplement: ['g', 'tbsp', 'packet'],
  opioid: ['mg'],
  ssri: ['mg'],
  gi_antiinflammatory: ['mg'],
};

const MEDICATION_INTERACTION_FLAGS_BY_FAMILY: Record<MedicationFamilyKey, string[]> = {
  ppi: ['acid_suppression'],
  h2_blocker: ['acid_suppression'],
  antibiotic: ['microbiome_shift'],
  laxative: ['motility_acceleration'],
  antidiarrheal: ['motility_slowing'],
  nsaid: ['stomach_irritation', 'upper_gi_bleeding_risk'],
  metformin: ['gi_upset'],
  magnesium: ['osmotic_laxation'],
  iron: ['constipation_tendency'],
  probiotic: ['temporary_bloating'],
  fiber_supplement: ['bulk_forming_effect'],
  opioid: ['motility_slowing'],
  ssri: ['nausea_tendency'],
  gi_antiinflammatory: ['gi_targeted_therapy'],
};

const MEDICATION_ENRICHMENT_PROFILES: MedicationEnrichmentProfile[] = [
  {
    id: 'omeprazole',
    genericName: 'Omeprazole',
    medicationClass: 'Proton pump inhibitor',
    medicationFamily: 'ppi',
    brandNames: ['Prilosec'],
    matchTerms: ['omeprazole', 'prilosec'],
    medicationType: 'otc',
    route: 'oral',
    dosageForm: 'capsule',
    commonDoseUnits: ['mg'],
    activeIngredients: ['omeprazole'],
    gutRelevance: 'secondary',
    commonGutEffects: ['acid suppression', 'bloating', 'microbiome shift'],
    interactionFlags: ['acid_suppression'],
  },
  {
    id: 'pantoprazole',
    genericName: 'Pantoprazole',
    medicationClass: 'Proton pump inhibitor',
    medicationFamily: 'ppi',
    brandNames: ['Protonix'],
    matchTerms: ['pantoprazole', 'protonix'],
    medicationType: 'prescription',
    route: 'oral',
    dosageForm: 'tablet',
    commonDoseUnits: ['mg'],
    activeIngredients: ['pantoprazole'],
    gutRelevance: 'secondary',
    commonGutEffects: ['acid suppression', 'bloating'],
    interactionFlags: ['acid_suppression'],
  },
  {
    id: 'famotidine',
    genericName: 'Famotidine',
    medicationClass: 'H2 receptor blocker',
    medicationFamily: 'h2_blocker',
    brandNames: ['Pepcid'],
    matchTerms: ['famotidine', 'pepcid'],
    medicationType: 'otc',
    route: 'oral',
    dosageForm: 'tablet',
    commonDoseUnits: ['mg'],
    activeIngredients: ['famotidine'],
    gutRelevance: 'secondary',
    commonGutEffects: ['acid suppression'],
    interactionFlags: ['acid_suppression'],
  },
  {
    id: 'loperamide',
    genericName: 'Loperamide',
    medicationClass: 'Antidiarrheal',
    medicationFamily: 'antidiarrheal',
    brandNames: ['Imodium'],
    matchTerms: ['loperamide', 'imodium'],
    medicationType: 'otc',
    route: 'oral',
    dosageForm: 'capsule',
    commonDoseUnits: ['mg'],
    activeIngredients: ['loperamide'],
    gutRelevance: 'primary',
    commonGutEffects: ['slower motility', 'constipation'],
    interactionFlags: ['motility_slowing'],
  },
  {
    id: 'polyethylene_glycol',
    genericName: 'Polyethylene Glycol 3350',
    medicationClass: 'Osmotic laxative',
    medicationFamily: 'laxative',
    brandNames: ['Miralax'],
    matchTerms: ['polyethylene glycol', 'peg 3350', 'miralax'],
    medicationType: 'otc',
    route: 'oral',
    dosageForm: 'powder',
    commonDoseUnits: ['g', 'packet', 'capful'],
    activeIngredients: ['polyethylene glycol 3350'],
    gutRelevance: 'primary',
    commonGutEffects: ['looser stool', 'urgency'],
    interactionFlags: ['motility_acceleration'],
  },
  {
    id: 'metformin',
    genericName: 'Metformin',
    medicationClass: 'Biguanide',
    medicationFamily: 'metformin',
    brandNames: ['Glucophage'],
    matchTerms: ['metformin', 'glucophage'],
    medicationType: 'prescription',
    route: 'oral',
    dosageForm: 'tablet',
    commonDoseUnits: ['mg'],
    activeIngredients: ['metformin'],
    gutRelevance: 'secondary',
    commonGutEffects: ['diarrhea', 'bloating', 'GI upset'],
    interactionFlags: ['gi_upset'],
  },
  {
    id: 'ibuprofen',
    genericName: 'Ibuprofen',
    medicationClass: 'NSAID',
    medicationFamily: 'nsaid',
    brandNames: ['Advil', 'Motrin'],
    matchTerms: ['ibuprofen', 'advil', 'motrin'],
    medicationType: 'otc',
    route: 'oral',
    dosageForm: 'tablet',
    commonDoseUnits: ['mg'],
    activeIngredients: ['ibuprofen'],
    gutRelevance: 'secondary',
    commonGutEffects: ['stomach irritation', 'nausea', 'reflux'],
    interactionFlags: ['stomach_irritation', 'upper_gi_bleeding_risk'],
  },
  {
    id: 'sertraline',
    genericName: 'Sertraline',
    medicationClass: 'SSRI antidepressant',
    medicationFamily: 'ssri',
    brandNames: ['Zoloft'],
    matchTerms: ['sertraline', 'zoloft'],
    medicationType: 'prescription',
    route: 'oral',
    dosageForm: 'tablet',
    commonDoseUnits: ['mg'],
    activeIngredients: ['sertraline'],
    gutRelevance: 'indirect',
    commonGutEffects: ['nausea', 'looser stool'],
    interactionFlags: ['nausea_tendency'],
  },
  {
    id: 'amoxicillin',
    genericName: 'Amoxicillin',
    medicationClass: 'Penicillin antibiotic',
    medicationFamily: 'antibiotic',
    brandNames: ['Amoxil'],
    matchTerms: ['amoxicillin', 'amoxil'],
    medicationType: 'prescription',
    route: 'oral',
    dosageForm: 'capsule',
    commonDoseUnits: ['mg'],
    activeIngredients: ['amoxicillin'],
    gutRelevance: 'secondary',
    commonGutEffects: ['diarrhea', 'nausea', 'microbiome disruption'],
    interactionFlags: ['microbiome_shift'],
  },
  {
    id: 'augmentin',
    genericName: 'Amoxicillin-clavulanate',
    medicationClass: 'Combination antibiotic',
    medicationFamily: 'antibiotic',
    brandNames: ['Augmentin'],
    matchTerms: ['augmentin', 'amoxicillin clavulanate', 'amoxicillin-clavulanate'],
    medicationType: 'prescription',
    route: 'oral',
    dosageForm: 'tablet',
    commonDoseUnits: ['mg'],
    activeIngredients: ['amoxicillin', 'clavulanate'],
    gutRelevance: 'secondary',
    commonGutEffects: ['diarrhea', 'nausea', 'microbiome disruption'],
    interactionFlags: ['microbiome_shift'],
  },
  {
    id: 'ferrous_sulfate',
    genericName: 'Ferrous Sulfate',
    medicationClass: 'Iron supplement',
    medicationFamily: 'iron',
    brandNames: [],
    matchTerms: ['ferrous sulfate', 'iron'],
    medicationType: 'supplement',
    route: 'oral',
    dosageForm: 'tablet',
    commonDoseUnits: ['mg'],
    activeIngredients: ['iron'],
    gutRelevance: 'secondary',
    commonGutEffects: ['constipation', 'nausea'],
    interactionFlags: ['constipation_tendency'],
  },
  {
    id: 'magnesium_citrate',
    genericName: 'Magnesium Citrate',
    medicationClass: 'Magnesium supplement',
    medicationFamily: 'magnesium',
    brandNames: [],
    matchTerms: ['magnesium citrate', 'magnesium oxide', 'magnesium'],
    medicationType: 'supplement',
    route: 'oral',
    dosageForm: 'tablet',
    commonDoseUnits: ['mg'],
    activeIngredients: ['magnesium'],
    gutRelevance: 'secondary',
    commonGutEffects: ['looser stool', 'diarrhea'],
    interactionFlags: ['osmotic_laxation'],
  },
  {
    id: 'mesalamine',
    genericName: 'Mesalamine',
    medicationClass: 'GI anti-inflammatory',
    medicationFamily: 'gi_antiinflammatory',
    brandNames: ['Lialda', 'Pentasa'],
    matchTerms: ['mesalamine', 'lialda', 'pentasa'],
    medicationType: 'prescription',
    route: 'oral',
    dosageForm: 'tablet',
    commonDoseUnits: ['mg'],
    activeIngredients: ['mesalamine'],
    gutRelevance: 'primary',
    commonGutEffects: ['GI-directed treatment'],
    interactionFlags: ['gi_targeted_therapy'],
  },
];

const enrichmentCache = new Map<string, MedicationEnrichmentResult>();

function normalizeLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

function cleanOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function scoreNameMatch(query: string, candidate: string): number {
  const normalizedQuery = normalizeLookupKey(query);
  const normalizedCandidate = normalizeLookupKey(candidate);

  if (!normalizedQuery || !normalizedCandidate) return 0;
  if (normalizedCandidate === normalizedQuery) return 1.3;
  if (normalizedCandidate.startsWith(normalizedQuery)) return 1.05;
  if (normalizedCandidate.includes(normalizedQuery)) return 0.82;
  if (normalizedQuery.includes(normalizedCandidate)) return 0.64;

  const queryTokens = normalizedQuery.split(' ');
  const candidateTokens = normalizedCandidate.split(' ');
  const overlap = queryTokens.filter((token) => candidateTokens.includes(token)).length;
  return overlap > 0 ? overlap / Math.max(queryTokens.length, candidateTokens.length) : 0;
}

function buildEmptyMedicationResult(
  status: MedicationEnrichmentStatus,
  lastAttemptAt: string,
  notes: string | null
): MedicationEnrichmentResult {
  return {
    suggestedGenericName: null,
    suggestedBrandNames: [],
    suggestedMedicationClass: null,
    suggestedMedicationFamily: null,
    suggestedRxnormCode: null,
    suggestedGutRelevance: null,
    suggestedCommonGutEffects: [],
    suggestedInteractionFlags: [],
    suggestedActiveIngredients: [],
    suggestedCommonDoseUnits: [],
    suggestedDosageForm: null,
    suggestedRoute: null,
    suggestedMedicationType: null,
    enrichmentSourceLabel: null,
    enrichmentSourceRef: null,
    enrichmentConfidence: null,
    enrichmentStatus: status,
    enrichmentLastAttemptAt: lastAttemptAt,
    enrichmentNotes: notes,
  };
}

function pickMedicationProfile(displayName: string): MedicationEnrichmentProfile | null {
  let bestProfile: MedicationEnrichmentProfile | null = null;
  let bestScore = 0;

  for (const profile of MEDICATION_ENRICHMENT_PROFILES) {
    const scores = [
      scoreNameMatch(displayName, profile.genericName),
      ...profile.brandNames.map((brandName) => scoreNameMatch(displayName, brandName)),
      ...profile.matchTerms.map((term) => scoreNameMatch(displayName, term)),
    ];
    const profileScore = Math.max(...scores, 0);

    if (profileScore > bestScore) {
      bestScore = profileScore;
      bestProfile = profile;
    }
  }

  return bestScore >= 0.72 ? bestProfile : null;
}

function pickMedicationFamily(displayName: string): MedicationFamilyKey | null {
  let bestFamily: MedicationFamilyKey | null = null;
  let bestScore = 0;

  for (const entry of MEDICATION_CATALOG) {
    const entryScore = Math.max(
      scoreNameMatch(displayName, entry.label),
      ...entry.matchTerms.map((term) => scoreNameMatch(displayName, term)),
      0
    );

    if (entryScore > bestScore) {
      bestScore = entryScore;
      bestFamily = entry.family;
    }
  }

  return bestScore >= 0.5 ? bestFamily : null;
}

function buildProfileResult(
  profile: MedicationEnrichmentProfile,
  params: FetchMedicationEnrichmentParams,
  attemptedAt: string
): MedicationEnrichmentResult {
  return {
    suggestedGenericName: profile.genericName,
    suggestedBrandNames: dedupeStrings([
      ...profile.brandNames,
      normalizeLookupKey(params.displayName) !== normalizeLookupKey(profile.genericName)
        ? params.displayName
        : '',
    ]),
    suggestedMedicationClass: profile.medicationClass,
    suggestedMedicationFamily: profile.medicationFamily,
    suggestedRxnormCode: profile.rxnormCode ?? null,
    suggestedGutRelevance: profile.gutRelevance ?? MEDICATION_GUT_RELEVANCE[profile.medicationFamily],
    suggestedCommonGutEffects: dedupeStrings(profile.commonGutEffects ?? []),
    suggestedInteractionFlags: dedupeStrings(
      profile.interactionFlags ?? MEDICATION_INTERACTION_FLAGS_BY_FAMILY[profile.medicationFamily]
    ),
    suggestedActiveIngredients: dedupeStrings(
      profile.activeIngredients ?? [profile.genericName]
    ),
    suggestedCommonDoseUnits: dedupeStrings(
      profile.commonDoseUnits ?? MEDICATION_DOSE_UNITS_BY_FAMILY[profile.medicationFamily]
    ),
    suggestedDosageForm: profile.dosageForm ?? MEDICATION_FORM_BY_FAMILY[profile.medicationFamily],
    suggestedRoute: profile.route ?? params.observedRoute ?? MEDICATION_ROUTE_BY_FAMILY[profile.medicationFamily],
    suggestedMedicationType: params.observedMedicationType ?? profile.medicationType ?? 'unknown',
    enrichmentSourceLabel: KNOWLEDGE_BASE_LABEL,
    enrichmentSourceRef: `knowledge-base:${profile.id}`,
    enrichmentConfidence: 0.84,
    enrichmentStatus: 'enriched',
    enrichmentLastAttemptAt: attemptedAt,
    enrichmentNotes:
      'Matched to a curated GutWise medication profile. Review brand, dose-form, and gut-effect context before promotion.',
  };
}

function buildFamilyFallbackResult(
  family: MedicationFamilyKey,
  params: FetchMedicationEnrichmentParams,
  attemptedAt: string
): MedicationEnrichmentResult {
  const catalogMatch = MEDICATION_CATALOG.find((entry) => entry.family === family);
  const genericName = titleCase(normalizeLookupKey(params.displayName));

  return {
    suggestedGenericName: genericName || titleCase(params.displayName),
    suggestedBrandNames: [],
    suggestedMedicationClass: MEDICATION_CLASS_LABELS[family],
    suggestedMedicationFamily: family,
    suggestedRxnormCode: null,
    suggestedGutRelevance: MEDICATION_GUT_RELEVANCE[family],
    suggestedCommonGutEffects: dedupeStrings(catalogMatch?.commonGutEffects ?? []),
    suggestedInteractionFlags: MEDICATION_INTERACTION_FLAGS_BY_FAMILY[family],
    suggestedActiveIngredients: [],
    suggestedCommonDoseUnits: MEDICATION_DOSE_UNITS_BY_FAMILY[family],
    suggestedDosageForm: MEDICATION_FORM_BY_FAMILY[family],
    suggestedRoute: params.observedRoute ?? MEDICATION_ROUTE_BY_FAMILY[family],
    suggestedMedicationType: params.observedMedicationType ?? 'unknown',
    enrichmentSourceLabel: KNOWLEDGE_BASE_LABEL,
    enrichmentSourceRef: `knowledge-base:family:${family}`,
    enrichmentConfidence: 0.58,
    enrichmentStatus: 'fallback',
    enrichmentLastAttemptAt: attemptedAt,
    enrichmentNotes:
      'Matched to a medication-family heuristic. Generic name, class, and gut context should be reviewed before promotion.',
  };
}

export async function fetchMedicationEnrichment(
  params: FetchMedicationEnrichmentParams
): Promise<MedicationEnrichmentResult> {
  const normalizedName = normalizeLookupKey(params.displayName);
  const cacheKey = [
    normalizedName,
    params.observedMedicationType ?? '',
    cleanOptionalText(params.observedRoute) ?? '',
    cleanOptionalText(params.observedDosage) ?? '',
  ].join('|');

  if (!params.forceRefresh && enrichmentCache.has(cacheKey)) {
    return enrichmentCache.get(cacheKey)!;
  }

  const attemptedAt = new Date().toISOString();

  if (!normalizedName) {
    const empty = buildEmptyMedicationResult(
      'failed',
      attemptedAt,
      'No medication name was available for enrichment.'
    );
    enrichmentCache.set(cacheKey, empty);
    return empty;
  }

  const matchedProfile = pickMedicationProfile(params.displayName);
  if (matchedProfile) {
    const enriched = buildProfileResult(matchedProfile, params, attemptedAt);
    enrichmentCache.set(cacheKey, enriched);
    return enriched;
  }

  const matchedFamily = pickMedicationFamily(params.displayName);
  if (matchedFamily) {
    const fallback = buildFamilyFallbackResult(matchedFamily, params, attemptedAt);
    enrichmentCache.set(cacheKey, fallback);
    return fallback;
  }

  const unmatched = buildEmptyMedicationResult(
    'failed',
    attemptedAt,
    params.reasonForUse
      ? `No medication knowledge-base match found yet. Review manually. Logged reason: ${params.reasonForUse}.${cleanOptionalText(params.observedDosage) ? ` Observed dosage: ${cleanOptionalText(params.observedDosage)}.` : ''}`
      : cleanOptionalText(params.observedDosage)
        ? `No medication knowledge-base match found yet. Review manually before promotion. Observed dosage: ${cleanOptionalText(params.observedDosage)}.`
        : 'No medication knowledge-base match found yet. Review manually before promotion.'
  );

  enrichmentCache.set(cacheKey, unmatched);
  return unmatched;
}