import { fetchMedicationEnrichment } from './medicationEnrichmentService';
import { parseDosageComponents } from './medicationNormalizationService';
import { queueMedicalImportBatch } from './medicalImportService';
import type {
  MedicalImportBatchResult,
  ImportedMedicalFactDraft,
} from '../types/medicalContext';

export type MedicationImportDetectedFormat = 'json' | 'csv' | 'tsv' | 'line_list';

export interface MedicationImportPreviewItem {
  id: string;
  source_line: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  prescribing_reason: string;
  route: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  parse_confidence: number;
  parse_notes: string[];
  enrichment_status: 'not_started' | 'enriched' | 'fallback' | 'failed';
  enrichment_confidence: number | null;
  suggested_generic_name: string | null;
  suggested_brand_names: string[];
  suggested_medication_class: string | null;
  suggested_medication_family: string | null;
  suggested_gut_relevance: string | null;
  suggested_common_gut_effects: string[];
  suggested_route: string | null;
  suggested_dosage_form: string | null;
  suggested_common_dose_units: string[];
  enrichment_source_label: string | null;
  enrichment_source_ref: string | null;
  enrichment_notes: string | null;
}

export interface MedicationListImportParseResult {
  detected_format: MedicationImportDetectedFormat;
  items: MedicationImportPreviewItem[];
  skipped_lines: string[];
}

interface MedicationImportRecord {
  sourceLine: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribingReason: string;
  route: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  parseConfidence: number;
  parseNotes: string[];
}

interface QueueMedicationListImportInput {
  source_label: string;
  source_reference?: string | null;
  import_note?: string | null;
  items: MedicationImportPreviewItem[];
  detected_format: MedicationImportDetectedFormat;
}

const ROUTE_KEYWORDS = [
  'oral',
  'by mouth',
  'po',
  'topical',
  'nasal',
  'rectal',
  'inhaled',
  'inhalation',
  'subcutaneous',
  'subcut',
  'injection',
  'intravenous',
  'iv',
];

const FREQUENCY_PATTERNS = [
  /\bas needed\b/i,
  /\bprn\b/i,
  /\bonce daily\b/i,
  /\btwice daily\b/i,
  /\bthree times daily\b/i,
  /\bfour times daily\b/i,
  /\bdaily\b/i,
  /\bnightly\b/i,
  /\bevery morning\b/i,
  /\bevery evening\b/i,
  /\bbid\b/i,
  /\btid\b/i,
  /\bqid\b/i,
  /\bweekly\b/i,
  /\bmonthly\b/i,
];

const DOSAGE_PATTERN =
  /\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|units?|caps?(?:ule)?s?|tabs?(?:let)?s?|packet|packets|tbsp|tsp|drops?|puffs?)\b/i;

const DATE_HEADER_PATTERN = /date|started|ended|begin|stop/i;
const NAME_HEADER_PATTERN = /medication|medicine|drug|name|rx/i;
const DOSE_HEADER_PATTERN = /dose|dosage|strength/i;
const FREQ_HEADER_PATTERN = /frequency|sig|schedule|directions|instruction/i;
const ROUTE_HEADER_PATTERN = /route|form/i;
const REASON_HEADER_PATTERN = /reason|indication|for/i;
const ACTIVE_HEADER_PATTERN = /current|active|status|taking/i;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function cleanOptional(value: string): string {
  return normalizeWhitespace(value);
}

function stripListPrefix(line: string): string {
  return line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '').trim();
}

function cleanDateValue(value: string): string {
  const cleaned = normalizeWhitespace(value).replace(/^(?:start|started|end|ended|from|to)\s*[:=-]?\s*/i, '');
  if (!cleaned) return '';

  const parsed = new Date(cleaned);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function normalizeBool(value: string): boolean | null {
  const normalized = normalizeWhitespace(value).toLowerCase();
  if (!normalized) return null;
  if (['yes', 'y', 'true', 'active', 'current', 'taking', 'ongoing'].includes(normalized)) {
    return true;
  }
  if (['no', 'n', 'false', 'inactive', 'stopped', 'ended', 'past', 'discontinued'].includes(normalized)) {
    return false;
  }
  return null;
}

function extractFrequency(text: string): string {
  for (const pattern of FREQUENCY_PATTERNS) {
    const match = text.match(pattern);
    if (match) return normalizeWhitespace(match[0]);
  }

  return '';
}

function extractRoute(text: string): string {
  const lowered = text.toLowerCase();
  const matched = ROUTE_KEYWORDS.find((keyword) => lowered.includes(keyword));
  return matched ? normalizeWhitespace(matched) : '';
}

function extractReason(text: string): string {
  const explicitMatch = text.match(/\b(?:for|reason|indication)\s*[:=-]?\s*([^,;|]+)/i);
  if (explicitMatch) {
    return normalizeWhitespace(explicitMatch[1]);
  }

  return '';
}

function inferCurrentStatus(text: string, endDate: string): boolean {
  const lowered = text.toLowerCase();
  if (/\b(?:stopped|discontinued|ended|past medication)\b/.test(lowered)) {
    return false;
  }
  if (endDate) {
    return false;
  }
  return true;
}

function buildLineRecord(line: string, index: number): MedicationImportRecord | null {
  const sourceLine = stripListPrefix(line);
  if (!sourceLine) return null;

  const dosageMatch = sourceLine.match(DOSAGE_PATTERN);
  const dosage = dosageMatch ? normalizeWhitespace(dosageMatch[0]) : '';
  const frequency = extractFrequency(sourceLine);
  const route = extractRoute(sourceLine);
  const prescribingReason = extractReason(sourceLine);

  const startMatch = sourceLine.match(/\b(?:start|started)\s*[:=-]?\s*([A-Za-z0-9/-]+)/i);
  const endMatch = sourceLine.match(/\b(?:end|ended|stopped)\s*[:=-]?\s*([A-Za-z0-9/-]+)/i);
  const startDate = startMatch ? cleanDateValue(startMatch[1]) : '';
  const endDate = endMatch ? cleanDateValue(endMatch[1]) : '';

  let medicationName = sourceLine;
  if (dosageMatch && dosageMatch.index !== undefined) {
    medicationName = sourceLine.slice(0, dosageMatch.index);
  } else {
    const splitMatch = sourceLine.match(/[,-]/);
    if (splitMatch?.index) {
      medicationName = sourceLine.slice(0, splitMatch.index);
    }
  }

  medicationName = normalizeWhitespace(
    medicationName
      .replace(/\b(?:take|taking|current medication|medication)\b/gi, ' ')
      .replace(/\b(?:oral|by mouth|po|topical|nasal|rectal|inhaled|subcutaneous|injection|iv)\b/gi, ' ')
  );

  if (!medicationName) return null;

  const parseNotes: string[] = [];
  let confidence = 0.56;

  if (dosage) {
    confidence += 0.14;
    parseNotes.push('Detected dosage');
  }
  if (frequency) {
    confidence += 0.1;
    parseNotes.push('Detected frequency');
  }
  if (route) {
    confidence += 0.06;
    parseNotes.push('Detected route');
  }
  if (prescribingReason) {
    confidence += 0.06;
    parseNotes.push('Detected reason for use');
  }
  if (startDate || endDate) {
    confidence += 0.05;
    parseNotes.push('Detected timeline marker');
  }

  return {
    sourceLine,
    medicationName,
    dosage,
    frequency,
    route,
    prescribingReason,
    startDate,
    endDate,
    isCurrent: inferCurrentStatus(sourceLine, endDate),
    parseConfidence: Math.min(0.95, Number(confidence.toFixed(2))),
    parseNotes:
      parseNotes.length > 0 ? parseNotes : [`Imported line ${index + 1} as a basic medication entry`],
  };
}

function mapHeaders(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};

  headers.forEach((header, index) => {
    const cleaned = normalizeWhitespace(header).toLowerCase();
    if (!cleaned) return;

    if (NAME_HEADER_PATTERN.test(cleaned) && map.name === undefined) map.name = index;
    if (DOSE_HEADER_PATTERN.test(cleaned) && map.dosage === undefined) map.dosage = index;
    if (FREQ_HEADER_PATTERN.test(cleaned) && map.frequency === undefined) map.frequency = index;
    if (ROUTE_HEADER_PATTERN.test(cleaned) && map.route === undefined) map.route = index;
    if (REASON_HEADER_PATTERN.test(cleaned) && map.reason === undefined) map.reason = index;
    if (ACTIVE_HEADER_PATTERN.test(cleaned) && map.current === undefined) map.current = index;
    if (DATE_HEADER_PATTERN.test(cleaned) && /start|begin/.test(cleaned) && map.startDate === undefined) {
      map.startDate = index;
    }
    if (DATE_HEADER_PATTERN.test(cleaned) && /end|stop/.test(cleaned) && map.endDate === undefined) {
      map.endDate = index;
    }
  });

  return map;
}

function splitDelimitedLine(line: string, delimiter: ',' | '\t'): string[] {
  if (delimiter === '\t') {
    return line.split('\t').map((value) => value.trim());
  }

  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function getColumnValue(values: string[], index?: number): string {
  return typeof index === 'number' ? values[index] ?? '' : '';
}

function parseDelimitedRecords(
  input: string,
  delimiter: ',' | '\t'
): { records: MedicationImportRecord[]; skipped: string[] } | null {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  const headers = splitDelimitedLine(lines[0], delimiter);
  const headerMap = mapHeaders(headers);

  if (headerMap.name === undefined) return null;

  const records: MedicationImportRecord[] = [];
  const skipped: string[] = [];

  lines.slice(1).forEach((line, index) => {
    const values = splitDelimitedLine(line, delimiter);
    const medicationName = cleanOptional(getColumnValue(values, headerMap.name));
    if (!medicationName) {
      skipped.push(`Skipped row ${index + 2}: no medication name found.`);
      return;
    }

    const route = cleanOptional(getColumnValue(values, headerMap.route));
    const endDate = cleanDateValue(getColumnValue(values, headerMap.endDate));
    const explicitCurrent = normalizeBool(getColumnValue(values, headerMap.current));

    records.push({
      sourceLine: line,
      medicationName,
      dosage: cleanOptional(getColumnValue(values, headerMap.dosage)),
      frequency: cleanOptional(getColumnValue(values, headerMap.frequency)),
      prescribingReason: cleanOptional(getColumnValue(values, headerMap.reason)),
      route,
      startDate: cleanDateValue(getColumnValue(values, headerMap.startDate)),
      endDate,
      isCurrent: explicitCurrent ?? inferCurrentStatus(line, endDate),
      parseConfidence: 0.88,
      parseNotes: ['Parsed from structured medication list columns'],
    });
  });

  return { records, skipped };
}

function parseJsonRecords(input: string): MedicationImportRecord[] | null {
  try {
    const parsed = JSON.parse(input) as unknown;
    const items = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && 'medications' in parsed
        ? (parsed as { medications?: unknown[] }).medications
        : null;

    if (!Array.isArray(items) || items.length === 0) return null;

    const records: MedicationImportRecord[] = [];

    items.forEach((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return;
      }

      const row = item as Record<string, unknown>;
      const medicationName = cleanOptional(
        String(
          row.medication_name ??
            row.name ??
            row.drug ??
            row.medication ??
            row.generic_name ??
            ''
        )
      );

      if (!medicationName) return;

      const rawLine =
        normalizeWhitespace(
          String(
            row.raw_text ??
              row.source_line ??
              `${medicationName} ${String(row.dosage ?? row.dose ?? '')}`.trim()
          )
        ) || medicationName;

      const endDate = cleanDateValue(String(row.end_date ?? row.ended_at ?? ''));
      const explicitCurrent =
        typeof row.is_current === 'boolean'
          ? row.is_current
          : normalizeBool(String(row.status ?? row.current ?? ''));

      records.push({
        sourceLine: rawLine,
        medicationName,
        dosage: cleanOptional(String(row.dosage ?? row.dose ?? row.strength ?? '')),
        frequency: cleanOptional(String(row.frequency ?? row.sig ?? row.schedule ?? '')),
        prescribingReason: cleanOptional(
          String(row.prescribing_reason ?? row.reason ?? row.indication ?? '')
        ),
        route: cleanOptional(String(row.route ?? row.form ?? '')),
        startDate: cleanDateValue(String(row.start_date ?? row.started_at ?? '')),
        endDate,
        isCurrent: explicitCurrent ?? inferCurrentStatus(rawLine, endDate),
        parseConfidence: 0.94,
        parseNotes: [`Parsed from structured JSON item ${index + 1}`],
      });
    });

    return records.length > 0 ? records : null;
  } catch {
    return null;
  }
}

async function enrichRecord(
  record: MedicationImportRecord,
  index: number
): Promise<MedicationImportPreviewItem> {
  const enrichment = await fetchMedicationEnrichment({
    displayName: record.medicationName,
    observedRoute: record.route || null,
    observedDosage: record.dosage || null,
    reasonForUse: record.prescribingReason || null,
  });

  return {
    id: `med-import-${index + 1}-${record.medicationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}`,
    source_line: record.sourceLine,
    medication_name: record.medicationName,
    dosage: record.dosage,
    frequency: record.frequency,
    prescribing_reason: record.prescribingReason,
    route: record.route || enrichment.suggestedRoute || '',
    start_date: record.startDate,
    end_date: record.endDate,
    is_current: record.isCurrent,
    parse_confidence: record.parseConfidence,
    parse_notes: record.parseNotes,
    enrichment_status: enrichment.enrichmentStatus,
    enrichment_confidence: enrichment.enrichmentConfidence,
    suggested_generic_name: enrichment.suggestedGenericName,
    suggested_brand_names: enrichment.suggestedBrandNames,
    suggested_medication_class: enrichment.suggestedMedicationClass,
    suggested_medication_family: enrichment.suggestedMedicationFamily,
    suggested_gut_relevance: enrichment.suggestedGutRelevance,
    suggested_common_gut_effects: enrichment.suggestedCommonGutEffects,
    suggested_route: enrichment.suggestedRoute,
    suggested_dosage_form: enrichment.suggestedDosageForm,
    suggested_common_dose_units: enrichment.suggestedCommonDoseUnits,
    enrichment_source_label: enrichment.enrichmentSourceLabel,
    enrichment_source_ref: enrichment.enrichmentSourceRef,
    enrichment_notes: enrichment.enrichmentNotes,
  };
}

function dedupeRecords(records: MedicationImportRecord[]): {
  unique: MedicationImportRecord[];
  skipped: string[];
} {
  const seen = new Set<string>();
  const unique: MedicationImportRecord[] = [];
  const skipped: string[] = [];

  records.forEach((record, index) => {
    const dosage = parseDosageComponents(record.dosage);
    const key = [
      record.medicationName.toLowerCase(),
      dosage.dose_value ?? '',
      dosage.dose_unit ?? '',
      record.frequency.toLowerCase(),
      record.route.toLowerCase(),
      record.prescribingReason.toLowerCase(),
      record.startDate,
      record.endDate,
      String(record.isCurrent),
    ].join('|');

    if (seen.has(key)) {
      skipped.push(`Skipped entry ${index + 1}: duplicate medication signature in the pasted list.`);
      return;
    }

    seen.add(key);
    unique.push(record);
  });

  return { unique, skipped };
}

export async function parseMedicationListInput(
  input: string
): Promise<MedicationListImportParseResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Paste a medication list before building a preview.');
  }

  let detectedFormat: MedicationImportDetectedFormat = 'line_list';
  let records: MedicationImportRecord[] | null = parseJsonRecords(trimmed);
  let skippedLines: string[] = [];

  if (records) {
    detectedFormat = 'json';
  } else {
    const tsvParsed = parseDelimitedRecords(trimmed, '\t');
    if (tsvParsed) {
      detectedFormat = 'tsv';
      records = tsvParsed.records;
      skippedLines = tsvParsed.skipped;
    }
  }

  if (!records) {
    const csvParsed = parseDelimitedRecords(trimmed, ',');
    if (csvParsed) {
      detectedFormat = 'csv';
      records = csvParsed.records;
      skippedLines = csvParsed.skipped;
    }
  }

  if (!records) {
    records = trimmed
      .split(/\r?\n/)
      .map((line, index) => buildLineRecord(line, index))
      .filter((record): record is MedicationImportRecord => Boolean(record));
    detectedFormat = 'line_list';
  }

  const deduped = dedupeRecords(records);
  skippedLines = [...skippedLines, ...deduped.skipped];

  if (deduped.unique.length === 0) {
    throw new Error('No medication entries could be parsed from the pasted input.');
  }

  const items = await Promise.all(
    deduped.unique.map((record, index) => enrichRecord(record, index))
  );

  return {
    detected_format: detectedFormat,
    items,
    skipped_lines: skippedLines,
  };
}

function buildImportCandidate(item: MedicationImportPreviewItem): ImportedMedicalFactDraft {
  const preferredName = item.medication_name || item.suggested_generic_name || item.source_line;
  const sourceParts = [
    `Imported medication list entry: ${item.source_line}`,
    item.suggested_medication_family
      ? `Medication family: ${item.suggested_medication_family.replace(/_/g, ' ')}`
      : null,
    item.suggested_medication_class ? `Class: ${item.suggested_medication_class}` : null,
    item.route ? `Route: ${item.route}` : item.suggested_route ? `Route: ${item.suggested_route}` : null,
    item.enrichment_source_label ? `Enrichment source: ${item.enrichment_source_label}` : null,
    item.enrichment_notes ? item.enrichment_notes : null,
  ].filter(Boolean);

  const extractionConfidence =
    item.enrichment_confidence !== null
      ? Number(((item.parse_confidence + item.enrichment_confidence) / 2).toFixed(2))
      : item.parse_confidence;

  return {
    category: 'medication',
    detail: {
      medication_name: preferredName,
      dosage: item.dosage || null,
      frequency: item.frequency || null,
      prescribing_reason: item.prescribing_reason || null,
      gi_side_effects_known: item.suggested_common_gut_effects.length > 0,
      start_date: item.start_date || null,
      end_date: item.end_date || null,
      is_current: item.is_current,
    },
    extraction_confidence: extractionConfidence,
    extraction_notes: sourceParts.join('\n'),
    evidence_items: [
      {
        evidence_kind: 'medication_list',
        section_label: 'Imported medication list',
        quoted_text: item.source_line,
        cited_text: item.source_line,
        confidence_score: item.parse_confidence,
        extractor_label: 'external_import:medication_list_importer',
      },
    ],
  };
}

export async function queueMedicationListImport(
  userId: string,
  input: QueueMedicationListImportInput
): Promise<MedicalImportBatchResult> {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error('Build a medication preview before queueing the import batch.');
  }

  return queueMedicalImportBatch(userId, {
    source_type: 'medication_list',
    source_label: input.source_label,
    source_reference: input.source_reference ?? null,
    import_note: input.import_note ?? null,
    source_metadata: {
      importer: 'medication_list_importer',
      detected_format: input.detected_format,
      imported_item_count: input.items.length,
    },
    candidates: input.items.map(buildImportCandidate),
  });
}