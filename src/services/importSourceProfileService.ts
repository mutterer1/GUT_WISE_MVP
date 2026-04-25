export type ImporterKind = 'medication_list' | 'clinical_history';

export type MedicationImportSourceProfileId =
  | 'generic_medication_list'
  | 'epic_mychart_medication_list'
  | 'pharmacy_dispense_export'
  | 'clinician_medication_summary';

export type ClinicalImportSourceProfileId =
  | 'generic_clinical_history'
  | 'epic_problem_allergy_export'
  | 'clinician_visit_summary'
  | 'lab_summary_findings';

type ClinicalProfileDefaultKind =
  | 'problem_list'
  | 'allergy_list'
  | 'procedure_history'
  | 'diet_guidance'
  | 'red_flag_history'
  | 'mixed_clinical';

interface ImportSourceProfile<TProfileId extends string> {
  id: TProfileId;
  importer: ImporterKind;
  label: string;
  sourceSystemLabel: string;
  provenanceLabel: string;
  parseStrategyLabel: string;
  sourceHints: string[];
  headerHints: string[];
  contentHints: string[];
  defaultConfidence: number;
  defaultImportKind?: ClinicalProfileDefaultKind;
}

export interface ImportSourceOption {
  value: string;
  label: string;
  hint: string;
}

export interface ImportSourceDetectionResult<TProfileId extends string> {
  profileId: TProfileId;
  label: string;
  sourceSystemLabel: string;
  provenanceLabel: string;
  parseStrategyLabel: string;
  confidence: number;
  mappingNotes: string[];
  defaultImportKind?: ClinicalProfileDefaultKind;
}

interface DetectImportSourceParams<TProfileId extends string> {
  input: string;
  sourceLabel?: string | null;
  sourceReference?: string | null;
  requestedProfileId?: TProfileId | null;
}

const MEDICATION_IMPORT_PROFILES: ImportSourceProfile<MedicationImportSourceProfileId>[] = [
  {
    id: 'generic_medication_list',
    importer: 'medication_list',
    label: 'Generic Medication List',
    sourceSystemLabel: 'Generic import',
    provenanceLabel: 'Generic medication import',
    parseStrategyLabel: 'Generic medication list mapping',
    sourceHints: ['medication list', 'current medications', 'med list'],
    headerHints: ['medication', 'strength', 'frequency', 'reason', 'status'],
    contentHints: ['once daily', 'as needed', 'nightly'],
    defaultConfidence: 0.58,
  },
  {
    id: 'epic_mychart_medication_list',
    importer: 'medication_list',
    label: 'Epic / MyChart Medication List',
    sourceSystemLabel: 'Epic / MyChart',
    provenanceLabel: 'Epic/MyChart medication export',
    parseStrategyLabel: 'Epic/MyChart medication column mapping',
    sourceHints: ['mychart', 'epic', 'after visit summary', 'current outpatient medications'],
    headerHints: ['medication', 'instructions', 'status', 'start date', 'end date', 'sig'],
    contentHints: ['mychart', 'current outpatient medications'],
    defaultConfidence: 0.76,
  },
  {
    id: 'pharmacy_dispense_export',
    importer: 'medication_list',
    label: 'Pharmacy Dispense Export',
    sourceSystemLabel: 'Pharmacy / fill history',
    provenanceLabel: 'Pharmacy dispense history import',
    parseStrategyLabel: 'Dispense-history medication mapping',
    sourceHints: ['pharmacy', 'dispense', 'rx number', 'fill history', 'prescription history'],
    headerHints: ['rx number', 'drug name', 'prescriber', 'days supply', 'qty', 'dispensed'],
    contentHints: ['refill', 'prescriber', 'days supply'],
    defaultConfidence: 0.8,
  },
  {
    id: 'clinician_medication_summary',
    importer: 'medication_list',
    label: 'Clinician Medication Summary',
    sourceSystemLabel: 'Clinician summary',
    provenanceLabel: 'Clinician-shared medication summary',
    parseStrategyLabel: 'Clinician summary medication mapping',
    sourceHints: ['clinician packet', 'visit summary', 'medications reviewed'],
    headerHints: ['medication', 'dose', 'route', 'reason', 'frequency'],
    contentHints: ['medications reviewed', 'active medications'],
    defaultConfidence: 0.72,
  },
];

const CLINICAL_IMPORT_PROFILES: ImportSourceProfile<ClinicalImportSourceProfileId>[] = [
  {
    id: 'generic_clinical_history',
    importer: 'clinical_history',
    label: 'Generic Clinical History',
    sourceSystemLabel: 'Generic import',
    provenanceLabel: 'Generic clinical history import',
    parseStrategyLabel: 'Generic clinical history mapping',
    sourceHints: ['problem list', 'clinical history', 'medical history'],
    headerHints: ['category', 'name', 'date', 'notes', 'severity'],
    contentHints: ['diagnosis', 'allergy', 'procedure', 'diet', 'red flag'],
    defaultConfidence: 0.56,
  },
  {
    id: 'epic_problem_allergy_export',
    importer: 'clinical_history',
    label: 'Epic / MyChart Problem or Allergy Export',
    sourceSystemLabel: 'Epic / MyChart',
    provenanceLabel: 'Epic/MyChart clinical export',
    parseStrategyLabel: 'Epic/MyChart problem/allergy mapping',
    sourceHints: ['mychart', 'epic', 'problem list', 'allergy list', 'visit diagnosis'],
    headerHints: ['problem', 'diagnosis', 'allergen', 'reaction', 'noted date', 'status'],
    contentHints: ['problem list', 'allergy list', 'visit diagnosis'],
    defaultConfidence: 0.78,
    defaultImportKind: 'mixed_clinical',
  },
  {
    id: 'clinician_visit_summary',
    importer: 'clinical_history',
    label: 'Clinician Visit Summary',
    sourceSystemLabel: 'Clinician summary',
    provenanceLabel: 'Clinician visit summary import',
    parseStrategyLabel: 'Visit-summary clinical mapping',
    sourceHints: ['visit summary', 'after visit summary', 'assessment and plan', 'avs'],
    headerHints: ['assessment', 'plan', 'problem', 'recommendation', 'follow up'],
    contentHints: ['assessment', 'plan', 'recommendation'],
    defaultConfidence: 0.74,
    defaultImportKind: 'mixed_clinical',
  },
  {
    id: 'lab_summary_findings',
    importer: 'clinical_history',
    label: 'Lab Summary / Findings Extract',
    sourceSystemLabel: 'Lab / findings summary',
    provenanceLabel: 'Lab summary import',
    parseStrategyLabel: 'Finding-to-history mapping',
    sourceHints: ['lab summary', 'results', 'abnormal findings', 'pathology'],
    headerHints: ['finding', 'result', 'interpretation', 'flag', 'date'],
    contentHints: ['abnormal', 'positive', 'negative', 'flagged'],
    defaultConfidence: 0.68,
    defaultImportKind: 'red_flag_history',
  },
];

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

function extractHeaderText(input: string): string {
  const firstLine = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) return '';

  return firstLine
    .split(/[\t,]/)
    .map((part) => normalizeText(part))
    .filter(Boolean)
    .join(' | ');
}

function scoreProfile<TProfileId extends string>(
  profile: ImportSourceProfile<TProfileId>,
  sourceContext: string,
  headerContext: string,
  bodyContext: string
): { score: number; notes: string[] } {
  let score = 0;
  const notes: string[] = [];

  for (const hint of profile.sourceHints) {
    const normalized = normalizeText(hint);
    if (normalized && sourceContext.includes(normalized)) {
      score += 0.28;
      notes.push(`Matched source hint "${hint}".`);
    }
  }

  for (const hint of profile.headerHints) {
    const normalized = normalizeText(hint);
    if (normalized && headerContext.includes(normalized)) {
      score += 0.1;
      notes.push(`Matched header hint "${hint}".`);
    }
  }

  for (const hint of profile.contentHints) {
    const normalized = normalizeText(hint);
    if (normalized && bodyContext.includes(normalized)) {
      score += 0.07;
      notes.push(`Matched content hint "${hint}".`);
    }
  }

  return { score, notes };
}

function buildDetectionResult<TProfileId extends string>(
  profile: ImportSourceProfile<TProfileId>,
  confidence: number,
  mappingNotes: string[]
): ImportSourceDetectionResult<TProfileId> {
  return {
    profileId: profile.id,
    label: profile.label,
    sourceSystemLabel: profile.sourceSystemLabel,
    provenanceLabel: profile.provenanceLabel,
    parseStrategyLabel: profile.parseStrategyLabel,
    confidence: Number(Math.max(0.45, Math.min(0.99, confidence)).toFixed(2)),
    mappingNotes,
    defaultImportKind: profile.defaultImportKind,
  };
}

function detectProfile<TProfileId extends string>(
  profiles: ImportSourceProfile<TProfileId>[],
  genericProfileId: TProfileId,
  params: DetectImportSourceParams<TProfileId>
): ImportSourceDetectionResult<TProfileId> {
  const sourceContext = normalizeText(
    [params.sourceLabel ?? '', params.sourceReference ?? ''].join(' ')
  );
  const headerContext = extractHeaderText(params.input);
  const bodyContext = normalizeText(params.input);

  if (params.requestedProfileId) {
    const requested = profiles.find((profile) => profile.id === params.requestedProfileId);
    if (requested) {
      return buildDetectionResult(requested, 0.98, [
        `Source profile manually set to ${requested.label}.`,
        `Using ${requested.parseStrategyLabel.toLowerCase()}.`,
      ]);
    }
  }

  const genericProfile =
    profiles.find((profile) => profile.id === genericProfileId) ?? profiles[0];

  let bestProfile = genericProfile;
  let bestScore = genericProfile.defaultConfidence;
  let bestNotes: string[] = ['Used the generic source profile because no stronger source pattern dominated.'];

  for (const profile of profiles) {
    if (profile.id === genericProfileId) continue;

    const scored = scoreProfile(profile, sourceContext, headerContext, bodyContext);
    const candidateScore = profile.defaultConfidence + scored.score;

    if (candidateScore > bestScore) {
      bestProfile = profile;
      bestScore = candidateScore;
      bestNotes = scored.notes.length > 0
        ? scored.notes
        : [`Matched ${profile.label} as the best available source profile.`];
    }
  }

  return buildDetectionResult(bestProfile, bestScore, bestNotes);
}

export function getMedicationImportSourceOptions(): ImportSourceOption[] {
  return MEDICATION_IMPORT_PROFILES.map((profile) => ({
    value: profile.id,
    label: profile.label,
    hint: `${profile.sourceSystemLabel} | ${profile.parseStrategyLabel}`,
  }));
}

export function getClinicalImportSourceOptions(): ImportSourceOption[] {
  return CLINICAL_IMPORT_PROFILES.map((profile) => ({
    value: profile.id,
    label: profile.label,
    hint: `${profile.sourceSystemLabel} | ${profile.parseStrategyLabel}`,
  }));
}

export function detectMedicationImportSourceProfile(
  params: DetectImportSourceParams<MedicationImportSourceProfileId>
): ImportSourceDetectionResult<MedicationImportSourceProfileId> {
  return detectProfile(
    MEDICATION_IMPORT_PROFILES,
    'generic_medication_list',
    params
  );
}

export function detectClinicalImportSourceProfile(
  params: DetectImportSourceParams<ClinicalImportSourceProfileId>
): ImportSourceDetectionResult<ClinicalImportSourceProfileId> {
  return detectProfile(
    CLINICAL_IMPORT_PROFILES,
    'generic_clinical_history',
    params
  );
}