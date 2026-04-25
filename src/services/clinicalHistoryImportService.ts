import {
  detectClinicalImportSourceProfile,
  type ClinicalImportSourceProfileId,
} from './importSourceProfileService';
import { queueMedicalImportBatch } from './medicalImportService';
import type {
  CandidateEvidenceKind,
  GenericMedicalImportSourceType,
  ImportedMedicalFactDraft,
  MedicalFactCategory,
  MedicalImportBatchResult,
} from '../types/medicalContext';

export type ClinicalImportDetectedFormat = 'json' | 'csv' | 'tsv' | 'line_list';

export type ClinicalImportKind =
  | 'problem_list'
  | 'allergy_list'
  | 'procedure_history'
  | 'diet_guidance'
  | 'red_flag_history'
  | 'mixed_clinical';

export type ClinicalImportPreviewCategory = Exclude<MedicalFactCategory, 'medication'>;

export interface ClinicalImportPreviewItem {
  id: string;
  source_line: string;
  source_row_label: string;
  parse_method: 'structured_json' | 'structured_columns' | 'line_heuristic';
  import_kind: ClinicalImportKind;
  effective_import_kind: ClinicalImportKind;
  category: ClinicalImportPreviewCategory;
  original_category: ClinicalImportPreviewCategory;
  detail: Record<string, unknown>;
  original_detail: Record<string, unknown>;
  parse_confidence: number;
  parse_notes: string[];
  source_profile_id: ClinicalImportSourceProfileId;
  source_profile_label: string;
  source_system_label: string;
  source_profile_confidence: number;
  parse_strategy_label: string;
  source_mapping_notes: string[];
  normalization_confidence: number | null;
  normalization_notes: string[];
}

export interface ClinicalHistoryImportParseResult {
  detected_format: ClinicalImportDetectedFormat;
  items: ClinicalImportPreviewItem[];
  skipped_lines: string[];
}

interface ClinicalImportRecord {
  sourceLine: string;
  sourceRowLabel: string;
  parseMethod: 'structured_json' | 'structured_columns' | 'line_heuristic';
  importKind: ClinicalImportKind;
  category: ClinicalImportPreviewCategory;
  detail: Record<string, unknown>;
  parseConfidence: number;
  parseNotes: string[];
  normalizationConfidence: number | null;
  normalizationNotes: string[];
}

interface QueueClinicalHistoryImportInput {
  source_type: GenericMedicalImportSourceType;
  source_label: string;
  source_reference?: string | null;
  import_note?: string | null;
  source_profile_id?: ClinicalImportSourceProfileId | null;
  import_kind: ClinicalImportKind;
  detected_format: ClinicalImportDetectedFormat;
  items: ClinicalImportPreviewItem[];
}

interface ParseClinicalHistoryImportOptions {
  sourceLabel?: string | null;
  sourceReference?: string | null;
  sourceProfileId?: ClinicalImportSourceProfileId | null;
}

const CATEGORY_DISPLAY_FIELD: Record<ClinicalImportPreviewCategory, string> = {
  diagnosis: 'condition_name',
  suspected_condition: 'condition_name',
  surgery_procedure: 'procedure_name',
  allergy_intolerance: 'substance',
  diet_guidance: 'guidance_type',
  red_flag_history: 'flag_type',
};

const SOURCE_TYPE_OPTIONS: GenericMedicalImportSourceType[] = [
  'visit_summary',
  'lab_summary',
  'clinician_packet',
  'custom',
];

const GI_PRIMARY_TERMS = [
  'ibs',
  'crohn',
  'colitis',
  'celiac',
  'gerd',
  'reflux',
  'constipation',
  'diarrhea',
  'sibo',
  'gastroparesis',
  'ulcer',
  'esophagitis',
  'gastritis',
];

const GI_BODY_REGION_TERMS = ['stomach', 'colon', 'bowel', 'rectum', 'intestine', 'abdomen'];
const RED_FLAG_TERMS = ['bleeding', 'weight loss', 'blood', 'anemia', 'vomiting', 'fever', 'black stool'];
const PROCEDURE_TERMS = ['colonoscopy', 'endoscopy', 'appendectomy', 'resection', 'surgery', 'biopsy'];

const CSV_DELIMITER = ',';
const TSV_DELIMITER = '\t';

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeHeaderKey(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ');
}

function cleanOptional(value: string | null | undefined): string {
  return normalizeWhitespace(value ?? '');
}

function stripListPrefix(line: string): string {
  return line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '').trim();
}

function safeStructuredClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

function normalizeBoolean(value: string): boolean | null {
  const normalized = normalizeWhitespace(value).toLowerCase();
  if (!normalized) return null;

  if (['yes', 'y', 'true', 'current', 'active', 'ongoing', 'present'].includes(normalized)) {
    return true;
  }

  if (['no', 'n', 'false', 'inactive', 'resolved', 'past', 'historical', 'ended'].includes(normalized)) {
    return false;
  }

  return null;
}

function cleanDateValue(value: string): string {
  const cleaned = normalizeWhitespace(value).replace(/^(?:date|started|ended|from|to)\s*[:=-]?\s*/i, '');
  if (!cleaned) return '';

  const parsed = new Date(cleaned);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function parseTagList(value: string): string[] {
  return normalizeWhitespace(value)
    .split(/[;,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildDefaultClinicalDetail(
  category: ClinicalImportPreviewCategory
): Record<string, unknown> {
  switch (category) {
    case 'diagnosis':
      return {
        condition_name: '',
        icd_code: '',
        diagnosed_date: '',
        diagnosing_provider: '',
        severity: '',
        gi_relevance: 'primary',
      };
    case 'suspected_condition':
      return {
        condition_name: '',
        suspicion_basis: '',
        under_investigation: true,
        gi_relevance: 'primary',
      };
    case 'surgery_procedure':
      return {
        procedure_name: '',
        procedure_date: '',
        body_region: '',
        gi_relevance: 'primary',
        complications: '',
      };
    case 'allergy_intolerance':
      return {
        substance: '',
        reaction_type: 'intolerance',
        severity: '',
        confirmed_by_testing: false,
        gi_symptoms: [],
      };
    case 'diet_guidance':
      return {
        guidance_type: '',
        prescribed_by: '',
        prescribed_date: '',
        foods_to_avoid: [],
        foods_to_include: [],
        rationale: '',
        is_current: true,
      };
    case 'red_flag_history':
      return {
        flag_type: '',
        description: '',
        occurrence_date: '',
        resolved: false,
        clinical_action_taken: '',
      };
  }
}

function inferGiRelevance(text: string): 'primary' | 'secondary' | 'indirect' {
  const lowered = text.toLowerCase();
  if (GI_PRIMARY_TERMS.some((term) => lowered.includes(term))) return 'primary';
  if (GI_BODY_REGION_TERMS.some((term) => lowered.includes(term))) return 'secondary';
  return 'indirect';
}

function normalizeGiRelevance(value: string, fallbackText: string): 'primary' | 'secondary' | 'indirect' {
  const normalized = normalizeWhitespace(value).toLowerCase();
  if (['primary', 'secondary', 'indirect'].includes(normalized)) {
    return normalized as 'primary' | 'secondary' | 'indirect';
  }

  return inferGiRelevance(fallbackText);
}

function normalizeSeverity(value: string): string {
  const normalized = normalizeWhitespace(value).toLowerCase();
  if (
    ['mild', 'moderate', 'severe', 'life threatening', 'life-threatening'].includes(normalized)
  ) {
    return normalized.replace('life threatening', 'life_threatening').replace('life-threatening', 'life_threatening');
  }
  return '';
}

function normalizeReactionType(value: string, fallback: ClinicalImportKind): 'allergy' | 'intolerance' | 'sensitivity' {
  const normalized = normalizeWhitespace(value).toLowerCase();
  if (normalized.includes('allerg')) return 'allergy';
  if (normalized.includes('sensit')) return 'sensitivity';
  if (normalized.includes('intoler')) return 'intolerance';
  return fallback === 'allergy_list' ? 'allergy' : 'intolerance';
}

function getCategoryDisplayValue(
  category: ClinicalImportPreviewCategory,
  detail: Record<string, unknown>
): string {
  const field = CATEGORY_DISPLAY_FIELD[category];
  const value = detail[field];
  return typeof value === 'string' ? normalizeWhitespace(value) : '';
}

function getCategoryCounts(items: ClinicalImportPreviewItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }
  return counts;
}

function detailsEqual(left: Record<string, unknown>, right: Record<string, unknown>): boolean {
  return stableStringify(left) === stableStringify(right);
}

function detectSourceType(sourceType: GenericMedicalImportSourceType): GenericMedicalImportSourceType {
  return SOURCE_TYPE_OPTIONS.includes(sourceType) ? sourceType : 'custom';
}

function buildDelimitedValues(line: string, delimiter: ',' | '\t'): string[] {
  if (delimiter === '\t') {
    return line.split(TSV_DELIMITER).map((value) => value.trim());
  }

  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === CSV_DELIMITER && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
}

function rowFromHeaderValues(headers: string[], values: string[]): Record<string, string> {
  const row: Record<string, string> = {};
  headers.forEach((header, index) => {
    row[normalizeHeaderKey(header)] = values[index] ?? '';
  });
  return row;
}

function getRowValue(row: Record<string, string>, aliases: string[]): string {
  const entries = Object.entries(row);
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeaderKey(alias);
    const match = entries.find(([key]) => key === normalizedAlias || key.includes(normalizedAlias) || normalizedAlias.includes(key));
    if (match && normalizeWhitespace(match[1])) {
      return normalizeWhitespace(match[1]);
    }
  }

  return '';
}

function inferCategoryFromText(text: string, importKind: ClinicalImportKind): ClinicalImportPreviewCategory {
  const lowered = text.toLowerCase();

  if (importKind === 'problem_list') {
    if (/\b(?:suspected|rule out|under investigation|possible)\b/.test(lowered)) {
      return 'suspected_condition';
    }
    return 'diagnosis';
  }

  if (importKind === 'allergy_list') return 'allergy_intolerance';
  if (importKind === 'procedure_history') return 'surgery_procedure';
  if (importKind === 'diet_guidance') return 'diet_guidance';
  if (importKind === 'red_flag_history') return 'red_flag_history';

  if (/\b(?:allergy|allergic|intolerance|sensitivity)\b/.test(lowered)) {
    return 'allergy_intolerance';
  }
  if (/\b(?:suspected|rule out|under investigation|possible)\b/.test(lowered)) {
    return 'suspected_condition';
  }
  if (PROCEDURE_TERMS.some((term) => lowered.includes(term))) {
    return 'surgery_procedure';
  }
  if (/\b(?:diet|fodmap|elimination|avoid|include|nutrition)\b/.test(lowered)) {
    return 'diet_guidance';
  }
  if (RED_FLAG_TERMS.some((term) => lowered.includes(term))) {
    return 'red_flag_history';
  }

  return 'diagnosis';
}

function resolveStructuredCategory(
  requested: string,
  importKind: ClinicalImportKind,
  sourceLine: string
): ClinicalImportPreviewCategory {
  const normalized = normalizeWhitespace(requested).toLowerCase().replace(/[^a-z0-9]+/g, ' ');

  if (normalized) {
    if (normalized.includes('allerg') || normalized.includes('intoler') || normalized.includes('sensit')) {
      return 'allergy_intolerance';
    }
    if (normalized.includes('suspect')) return 'suspected_condition';
    if (normalized.includes('diagnos') || normalized.includes('problem') || normalized.includes('condition')) {
      return 'diagnosis';
    }
    if (normalized.includes('procedure') || normalized.includes('surgery')) {
      return 'surgery_procedure';
    }
    if (normalized.includes('diet') || normalized.includes('guidance') || normalized.includes('nutrition')) {
      return 'diet_guidance';
    }
    if (normalized.includes('flag') || normalized.includes('warning')) {
      return 'red_flag_history';
    }
  }

  return inferCategoryFromText(sourceLine, importKind);
}

function extractMainLineText(sourceLine: string): string {
  return normalizeWhitespace(
    sourceLine
      .replace(/\b(?:diagnosis|problem|condition|allergy|intolerance|sensitivity|procedure|diet|red flag)\b\s*[:=-]?\s*/gi, '')
      .replace(/\b(?:started|ended|date)\b\s*[:=-]?\s*[A-Za-z0-9/,-]+/gi, '')
  );
}

function buildDiagnosisDetail(
  row: Record<string, string>,
  sourceLine: string,
  category: 'diagnosis' | 'suspected_condition'
): Record<string, unknown> {
  const defaults = buildDefaultClinicalDetail(category);
  const conditionName =
    getRowValue(row, ['condition', 'diagnosis', 'problem', 'name']) || extractMainLineText(sourceLine);

  if (category === 'suspected_condition') {
    return {
      ...defaults,
      condition_name: conditionName,
      suspicion_basis:
        getRowValue(row, ['basis', 'reason', 'notes', 'comment']) ||
        (sourceLine.toLowerCase().includes('suspected') ? sourceLine : ''),
      under_investigation:
        normalizeBoolean(getRowValue(row, ['under investigation', 'active', 'current', 'ongoing'])) ??
        true,
      gi_relevance: normalizeGiRelevance(
        getRowValue(row, ['gi relevance', 'relevance']),
        conditionName || sourceLine
      ),
    };
  }

  return {
    ...defaults,
    condition_name: conditionName,
    icd_code: getRowValue(row, ['icd', 'code']),
    diagnosed_date: cleanDateValue(getRowValue(row, ['diagnosed date', 'date', 'onset date'])),
    diagnosing_provider: getRowValue(row, ['provider', 'diagnosing provider', 'clinician']),
    severity: normalizeSeverity(getRowValue(row, ['severity'])),
    gi_relevance: normalizeGiRelevance(
      getRowValue(row, ['gi relevance', 'relevance']),
      conditionName || sourceLine
    ),
  };
}

function buildAllergyDetail(row: Record<string, string>, sourceLine: string): Record<string, unknown> {
  const defaults = buildDefaultClinicalDetail('allergy_intolerance');
  const substance =
    getRowValue(row, ['substance', 'allergen', 'food', 'name']) || extractMainLineText(sourceLine);
  const symptomText = getRowValue(row, ['gi symptoms', 'symptoms', 'reaction', 'notes']);

  return {
    ...defaults,
    substance,
    reaction_type: normalizeReactionType(
      getRowValue(row, ['reaction type', 'type']) || sourceLine,
      'allergy_list'
    ),
    severity: normalizeSeverity(getRowValue(row, ['severity'])),
    confirmed_by_testing:
      normalizeBoolean(getRowValue(row, ['confirmed by testing', 'tested', 'confirmed'])) ??
      /\b(?:biopsy confirmed|testing confirmed|confirmed)\b/i.test(sourceLine),
    gi_symptoms: parseTagList(symptomText),
  };
}

function buildProcedureDetail(row: Record<string, string>, sourceLine: string): Record<string, unknown> {
  const defaults = buildDefaultClinicalDetail('surgery_procedure');
  const procedureName =
    getRowValue(row, ['procedure', 'surgery', 'name']) || extractMainLineText(sourceLine);

  return {
    ...defaults,
    procedure_name: procedureName,
    procedure_date: cleanDateValue(getRowValue(row, ['procedure date', 'date', 'performed on'])),
    body_region: getRowValue(row, ['body region', 'region', 'site']),
    gi_relevance: normalizeGiRelevance(
      getRowValue(row, ['gi relevance', 'relevance']),
      procedureName || sourceLine
    ),
    complications: getRowValue(row, ['complications', 'notes', 'comment']),
  };
}

function buildDietGuidanceDetail(row: Record<string, string>, sourceLine: string): Record<string, unknown> {
  const defaults = buildDefaultClinicalDetail('diet_guidance');
  const guidanceType =
    getRowValue(row, ['guidance', 'diet', 'plan', 'name']) || extractMainLineText(sourceLine);

  return {
    ...defaults,
    guidance_type: guidanceType,
    prescribed_by: getRowValue(row, ['provider', 'prescribed by', 'dietitian', 'clinician']),
    prescribed_date: cleanDateValue(getRowValue(row, ['prescribed date', 'date', 'started'])),
    foods_to_avoid: parseTagList(getRowValue(row, ['foods to avoid', 'avoid', 'restricted foods'])),
    foods_to_include: parseTagList(getRowValue(row, ['foods to include', 'include', 'recommended foods'])),
    rationale: getRowValue(row, ['rationale', 'reason', 'notes']),
    is_current:
      normalizeBoolean(getRowValue(row, ['current', 'active', 'ongoing'])) ??
      !/\b(?:past|historical|ended|completed)\b/i.test(sourceLine),
  };
}

function buildRedFlagDetail(row: Record<string, string>, sourceLine: string): Record<string, unknown> {
  const defaults = buildDefaultClinicalDetail('red_flag_history');
  const flagType = getRowValue(row, ['flag', 'type', 'issue', 'warning']) || extractMainLineText(sourceLine);

  return {
    ...defaults,
    flag_type: flagType,
    description: getRowValue(row, ['description', 'detail', 'notes']) || sourceLine,
    occurrence_date: cleanDateValue(getRowValue(row, ['occurrence date', 'date', 'episode date'])),
    resolved:
      normalizeBoolean(getRowValue(row, ['resolved', 'current', 'active'])) ??
      /\b(?:resolved|past|historical)\b/i.test(sourceLine),
    clinical_action_taken: getRowValue(row, ['clinical action', 'action', 'follow up']),
  };
}

function buildDetailForCategory(
  category: ClinicalImportPreviewCategory,
  row: Record<string, string>,
  sourceLine: string
): Record<string, unknown> {
  switch (category) {
    case 'diagnosis':
      return buildDiagnosisDetail(row, sourceLine, 'diagnosis');
    case 'suspected_condition':
      return buildDiagnosisDetail(row, sourceLine, 'suspected_condition');
    case 'allergy_intolerance':
      return buildAllergyDetail(row, sourceLine);
    case 'surgery_procedure':
      return buildProcedureDetail(row, sourceLine);
    case 'diet_guidance':
      return buildDietGuidanceDetail(row, sourceLine);
    case 'red_flag_history':
      return buildRedFlagDetail(row, sourceLine);
  }
}

function buildLineRecord(
  line: string,
  index: number,
  importKind: ClinicalImportKind
): ClinicalImportRecord | null {
  const sourceLine = stripListPrefix(line);
  if (!sourceLine) return null;

  const category = inferCategoryFromText(sourceLine, importKind);
  const detail = buildDetailForCategory(category, {}, sourceLine);
  const displayValue = getCategoryDisplayValue(category, detail);
  if (!displayValue) return null;

  const parseNotes = [`Mapped from ${importKind.replace(/_/g, ' ')} line import.`];
  if (category !== inferCategoryFromText(sourceLine, importKind) || importKind === 'mixed_clinical') {
    parseNotes.push(`Detected category ${category.replace(/_/g, ' ')} from line heuristics.`);
  }

  return {
    sourceLine,
    sourceRowLabel: `Line ${index + 1}`,
    parseMethod: 'line_heuristic',
    importKind,
    category,
    detail,
    parseConfidence: importKind === 'mixed_clinical' ? 0.62 : 0.7,
    parseNotes,
    normalizationConfidence: importKind === 'mixed_clinical' ? 0.64 : 0.74,
    normalizationNotes: ['Built a category-specific detail object for review before queueing.'],
  };
}

function parseDelimitedRecords(
  input: string,
  delimiter: ',' | '\t',
  importKind: ClinicalImportKind
): { records: ClinicalImportRecord[]; skipped: string[] } | null {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  const headers = buildDelimitedValues(lines[0], delimiter);
  const normalizedHeaders = headers.map(normalizeHeaderKey);
  if (normalizedHeaders.length === 0) return null;

  const records: ClinicalImportRecord[] = [];
  const skipped: string[] = [];

  lines.slice(1).forEach((line, index) => {
    const values = buildDelimitedValues(line, delimiter);
    const row = rowFromHeaderValues(headers, values);
    const category = resolveStructuredCategory(
      getRowValue(row, ['category', 'type']),
      importKind,
      line
    );
    const detail = buildDetailForCategory(category, row, line);
    const displayValue = getCategoryDisplayValue(category, detail);

    if (!displayValue) {
      skipped.push(`Skipped row ${index + 2}: no core value found after normalization.`);
      return;
    }

    const parseNotes = ['Parsed from structured clinical import columns.'];
    if (getRowValue(row, ['category', 'type'])) {
      parseNotes.push(`Used source category ${getRowValue(row, ['category', 'type'])}.`);
    }

    records.push({
      sourceLine: line,
      sourceRowLabel: `Row ${index + 2}`,
      parseMethod: 'structured_columns',
      importKind,
      category,
      detail,
      parseConfidence: 0.88,
      parseNotes,
      normalizationConfidence: 0.84,
      normalizationNotes: ['Mapped structured columns into a category-aware detail shape.'],
    });
  });

  return { records, skipped };
}

function parseJsonRecords(
  input: string,
  importKind: ClinicalImportKind
): ClinicalImportRecord[] | null {
  try {
    const parsed = JSON.parse(input) as unknown;
    const items = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object'
        ? ((parsed as Record<string, unknown>).items as unknown[]) ??
          ((parsed as Record<string, unknown>).entries as unknown[]) ??
          ((parsed as Record<string, unknown>).problems as unknown[]) ??
          ((parsed as Record<string, unknown>).allergies as unknown[]) ??
          null
        : null;

    if (!Array.isArray(items) || items.length === 0) return null;

    const records: ClinicalImportRecord[] = [];

    items.forEach((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return;
      const row = Object.fromEntries(
        Object.entries(item as Record<string, unknown>).map(([key, value]) => [
          normalizeHeaderKey(key),
          typeof value === 'string' ? value : Array.isArray(value) ? value.join(', ') : value == null ? '' : String(value),
        ])
      );

      const sourceLine =
        cleanOptional(
          row.raw_text ||
            row.source_line ||
            row.name ||
            row.condition ||
            row.substance ||
            row.procedure ||
            row.guidance ||
            row.flag
        ) || `Imported item ${index + 1}`;

      const category = resolveStructuredCategory(
        getRowValue(row, ['category', 'type']),
        importKind,
        sourceLine
      );
      const detail = buildDetailForCategory(category, row, sourceLine);
      const displayValue = getCategoryDisplayValue(category, detail);
      if (!displayValue) return;

      records.push({
        sourceLine,
        sourceRowLabel: `Item ${index + 1}`,
        parseMethod: 'structured_json',
        importKind,
        category,
        detail,
        parseConfidence: 0.92,
        parseNotes: ['Parsed from structured JSON import data.'],
        normalizationConfidence: 0.88,
        normalizationNotes: ['Mapped structured JSON fields into a category-aware detail shape.'],
      });
    });

    return records.length > 0 ? records : null;
  } catch {
    return null;
  }
}

function dedupeRecords(records: ClinicalImportRecord[]): {
  unique: ClinicalImportRecord[];
  skipped: string[];
} {
  const seen = new Set<string>();
  const unique: ClinicalImportRecord[] = [];
  const skipped: string[] = [];

  records.forEach((record, index) => {
    const signature = `${record.category}:${stableStringify(record.detail)}`;
    if (seen.has(signature)) {
      skipped.push(`Skipped entry ${index + 1}: duplicate normalized ${record.category.replace(/_/g, ' ')} signature.`);
      return;
    }

    seen.add(signature);
    unique.push(record);
  });

  return { unique, skipped };
}

function buildPreviewItem(record: ClinicalImportRecord, index: number): ClinicalImportPreviewItem {
  const detail = safeStructuredClone(record.detail);
  return {
    id: `clinical-import-${index + 1}`,
    source_line: record.sourceLine,
    source_row_label: record.sourceRowLabel,
    parse_method: record.parseMethod,
    import_kind: record.importKind,
    effective_import_kind: record.importKind,
    category: record.category,
    original_category: record.category,
    detail,
    original_detail: safeStructuredClone(detail),
    parse_confidence: record.parseConfidence,
    parse_notes: [...record.parseNotes],
    source_profile_id: 'generic_clinical_history',
    source_profile_label: 'Generic Clinical History',
    source_system_label: 'Generic import',
    source_profile_confidence: 0.56,
    parse_strategy_label: 'Generic clinical history mapping',
    source_mapping_notes: [],
    normalization_confidence: record.normalizationConfidence,
    normalization_notes: [...record.normalizationNotes],
  };
}

function formatConfidencePercent(value: number | null | undefined): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return `${Math.round(value * 100)}%`;
}

function summarizeCategory(category: ClinicalImportPreviewCategory): string {
  return category.replace(/_/g, ' ');
}

function describeImportCorrection(
  label: string,
  originalValue: unknown,
  currentValue: unknown
): string | null {
  if (stableStringify(originalValue) === stableStringify(currentValue)) return null;

  if ((originalValue === '' || originalValue === null || originalValue === undefined) && currentValue) {
    return `${label} added during import review.`;
  }

  if ((currentValue === '' || currentValue === null || currentValue === undefined) && originalValue) {
    return `${label} cleared during import review.`;
  }

  return `${label} adjusted during import review.`;
}

function buildImportCorrectionNotes(item: ClinicalImportPreviewItem): string[] {
  const notes: string[] = [];

  if (item.category !== item.original_category) {
    notes.push(
      `Category changed from "${summarizeCategory(item.original_category)}" to "${summarizeCategory(
        item.category
      )}".`
    );
  }

  const fields = new Set([
    ...Object.keys(item.original_detail),
    ...Object.keys(item.detail),
  ]);

  fields.forEach((fieldKey) => {
    const message = describeImportCorrection(
      fieldKey.replace(/_/g, ' '),
      item.original_detail[fieldKey],
      item.detail[fieldKey]
    );
    if (message) notes.push(message);
  });

  return notes;
}

function hasImportCorrections(item: ClinicalImportPreviewItem): boolean {
  return item.category !== item.original_category || !detailsEqual(item.detail, item.original_detail);
}

function buildEvidenceKind(category: ClinicalImportPreviewCategory): CandidateEvidenceKind {
  if (category === 'diagnosis' || category === 'suspected_condition') return 'diagnosis_statement';
  if (category === 'surgery_procedure') return 'procedure_statement';
  return 'summary';
}

function buildImportCandidate(item: ClinicalImportPreviewItem): ImportedMedicalFactDraft {
  const correctionNotes = buildImportCorrectionNotes(item);
  const sourceParts = [
    `Imported clinical history entry: ${item.source_line}`,
    `import_meta: Source row ${item.source_row_label}`,
    `import_meta: Parse method ${item.parse_method.replace(/_/g, ' ')}`,
    `import_meta: Import kind ${item.import_kind.replace(/_/g, ' ')}`,
    `import_meta: Effective import kind ${item.effective_import_kind.replace(/_/g, ' ')}`,
    `import_meta: Source profile ${item.source_profile_label}`,
    `import_meta: Source system ${item.source_system_label}`,
    `import_meta: Parse strategy ${item.parse_strategy_label}`,
    `import_meta: Normalized category ${summarizeCategory(item.category)}`,
    formatConfidencePercent(item.parse_confidence)
      ? `import_meta: Parse confidence ${formatConfidencePercent(item.parse_confidence)}`
      : null,
    formatConfidencePercent(item.source_profile_confidence)
      ? `import_meta: Source profile confidence ${formatConfidencePercent(item.source_profile_confidence)}`
      : null,
    formatConfidencePercent(item.normalization_confidence)
      ? `import_meta: Normalization confidence ${formatConfidencePercent(item.normalization_confidence)}`
      : null,
    ...item.source_mapping_notes.map((note) => `import_meta: ${note}`),
    ...item.normalization_notes,
    ...correctionNotes.map((note) => `import_correction: ${note}`),
  ].filter(Boolean);

  const extractionConfidence =
    item.normalization_confidence !== null
      ? Number(((item.parse_confidence + item.normalization_confidence) / 2).toFixed(2))
      : item.parse_confidence;

  return {
    category: item.category,
    detail: item.detail,
    extraction_confidence: extractionConfidence,
    extraction_notes: sourceParts.join('\n'),
    evidence_items: [
      {
        evidence_kind: buildEvidenceKind(item.category),
        section_label: `Imported ${item.import_kind.replace(/_/g, ' ')}`,
        quoted_text: item.source_line,
        cited_text: item.source_line,
        confidence_score: item.parse_confidence,
        extractor_label: 'external_import:clinical_history_importer',
      },
    ],
  };
}

export function remapClinicalImportDetail(
  item: ClinicalImportPreviewItem,
  nextCategory: ClinicalImportPreviewCategory
): Record<string, unknown> {
  if (nextCategory === item.category) {
    return safeStructuredClone(item.detail);
  }

  const remapped = buildDefaultClinicalDetail(nextCategory);
  const currentDisplay = getCategoryDisplayValue(item.category, item.detail);
  const originalDisplay = getCategoryDisplayValue(item.original_category, item.original_detail);
  const carryText = currentDisplay || originalDisplay || item.source_line;

  switch (nextCategory) {
    case 'diagnosis':
    case 'suspected_condition':
      remapped.condition_name = carryText;
      if (nextCategory === 'suspected_condition') {
        remapped.suspicion_basis = item.source_line;
        remapped.under_investigation = true;
      }
      break;
    case 'allergy_intolerance':
      remapped.substance = carryText;
      break;
    case 'surgery_procedure':
      remapped.procedure_name = carryText;
      break;
    case 'diet_guidance':
      remapped.guidance_type = carryText;
      break;
    case 'red_flag_history':
      remapped.flag_type = carryText;
      remapped.description = item.source_line;
      break;
  }

  return remapped;
}

export async function parseClinicalHistoryImportInput(
  input: string,
  importKind: ClinicalImportKind,
  options: ParseClinicalHistoryImportOptions = {}
): Promise<ClinicalHistoryImportParseResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Paste a clinical history list before building a preview.');
  }

  const sourceProfile = detectClinicalImportSourceProfile({
    input: trimmed,
    sourceLabel: options.sourceLabel ?? null,
    sourceReference: options.sourceReference ?? null,
    requestedProfileId: options.sourceProfileId ?? null,
  });

  const effectiveImportKind =
    importKind === 'mixed_clinical' && sourceProfile.defaultImportKind
      ? sourceProfile.defaultImportKind
      : importKind;

  let detectedFormat: ClinicalImportDetectedFormat = 'line_list';
  let records: ClinicalImportRecord[] | null = parseJsonRecords(trimmed, effectiveImportKind);
  let skippedLines: string[] = [];

  if (records) {
    detectedFormat = 'json';
  } else {
    const tsvParsed = parseDelimitedRecords(trimmed, '\t', effectiveImportKind);
    if (tsvParsed) {
      detectedFormat = 'tsv';
      records = tsvParsed.records;
      skippedLines = tsvParsed.skipped;
    }
  }

  if (!records) {
    const csvParsed = parseDelimitedRecords(trimmed, ',', effectiveImportKind);
    if (csvParsed) {
      detectedFormat = 'csv';
      records = csvParsed.records;
      skippedLines = csvParsed.skipped;
    }
  }

  if (!records) {
    records = trimmed
      .split(/\r?\n/)
      .map((line, index) => buildLineRecord(line, index, effectiveImportKind))
      .filter((record): record is ClinicalImportRecord => Boolean(record));
    detectedFormat = 'line_list';
  }

  const deduped = dedupeRecords(records);
  skippedLines = [...skippedLines, ...deduped.skipped];

  if (deduped.unique.length === 0) {
    throw new Error('No clinical history entries could be normalized from the pasted input.');
  }

  return {
    detected_format: detectedFormat,
    items: deduped.unique.map((record, index) => ({
      ...buildPreviewItem(record, index),
      effective_import_kind: effectiveImportKind,
      source_profile_id: sourceProfile.profileId,
      source_profile_label: sourceProfile.label,
      source_system_label: sourceProfile.sourceSystemLabel,
      source_profile_confidence: sourceProfile.confidence,
      parse_strategy_label: sourceProfile.parseStrategyLabel,
      source_mapping_notes: sourceProfile.mappingNotes,
      parse_notes: [...record.parseNotes, ...sourceProfile.mappingNotes],
    })),
    skipped_lines: skippedLines,
  };
}

export async function queueClinicalHistoryImport(
  userId: string,
  input: QueueClinicalHistoryImportInput
): Promise<MedicalImportBatchResult> {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error('Build a clinical history preview before queueing the import batch.');
  }

  return queueMedicalImportBatch(userId, {
    source_type: detectSourceType(input.source_type),
    source_label: input.source_label,
    source_reference: input.source_reference ?? null,
    import_note: input.import_note ?? null,
    source_metadata: {
      importer: 'clinical_history_importer',
      import_kind: input.import_kind,
      effective_import_kind: input.items[0]?.effective_import_kind ?? input.import_kind,
      detected_format: input.detected_format,
      source_profile_id: input.items[0]?.source_profile_id ?? input.source_profile_id ?? null,
      source_profile_label: input.items[0]?.source_profile_label ?? null,
      source_system_label: input.items[0]?.source_system_label ?? null,
      source_profile_confidence_avg:
        input.items.length > 0
          ? Number(
              (
                input.items.reduce((sum, item) => sum + item.source_profile_confidence, 0) /
                input.items.length
              ).toFixed(2)
            )
          : null,
      parse_strategy_label: input.items[0]?.parse_strategy_label ?? null,
      imported_item_count: input.items.length,
      corrected_item_count: input.items.filter(hasImportCorrections).length,
      category_breakdown: getCategoryCounts(input.items),
    },
    candidates: input.items.map(buildImportCandidate),
  });
}
