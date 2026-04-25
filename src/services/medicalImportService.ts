import {
  createDocumentIntake,
  fetchCandidatesForIntake,
  seedCandidateFromIntake,
} from './medicalContextService';
import type {
  MedicalFactCategory,
  MedicalImportBatchInput,
  MedicalImportBatchResult,
  ImportedMedicalFactDraft,
} from '../types/medicalContext';

const IMPORT_FILE_TYPE = 'application/vnd.gutwise.import+json';

const VALID_MEDICAL_CATEGORIES = new Set<MedicalFactCategory>([
  'diagnosis',
  'suspected_condition',
  'medication',
  'surgery_procedure',
  'allergy_intolerance',
  'diet_guidance',
  'red_flag_history',
]);

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

function normalizeDetailForSignature(detail: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  for (const [key, rawValue] of Object.entries(detail)) {
    if (Array.isArray(rawValue)) {
      normalized[key] = rawValue
        .map((value) => String(value).replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
      continue;
    }

    if (typeof rawValue === 'string') {
      normalized[key] = rawValue.replace(/\s+/g, ' ').trim();
      continue;
    }

    normalized[key] = rawValue;
  }

  return normalized;
}

function buildDraftSignature(
  category: MedicalFactCategory,
  detail: Record<string, unknown>
): string {
  return `${category}:${stableStringify(normalizeDetailForSignature(detail))}`;
}

function formatImportSourceLabel(sourceType: MedicalImportBatchInput['source_type']): string {
  return sourceType.replace(/_/g, ' ');
}

function buildImportFileName(sourceLabel: string): string {
  const cleaned = sourceLabel
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `${cleaned || 'medical_import'}.import.json`;
}

function validateDraftCandidate(
  draft: ImportedMedicalFactDraft,
  index: number
): { valid: boolean; reason?: string } {
  if (!VALID_MEDICAL_CATEGORIES.has(draft.category)) {
    return {
      valid: false,
      reason: `Skipped candidate ${index + 1}: unsupported category '${String(draft.category)}'.`,
    };
  }

  if (!draft.detail || typeof draft.detail !== 'object' || Array.isArray(draft.detail)) {
    return {
      valid: false,
      reason: `Skipped candidate ${index + 1}: detail must be an object.`,
    };
  }

  if (Object.keys(draft.detail).length === 0) {
    return {
      valid: false,
      reason: `Skipped candidate ${index + 1}: detail object is empty.`,
    };
  }

  return { valid: true };
}

export async function queueMedicalImportBatch(
  userId: string,
  input: MedicalImportBatchInput
): Promise<MedicalImportBatchResult> {
  const sourceLabel = input.source_label.replace(/\s+/g, ' ').trim();
  if (!sourceLabel) {
    throw new Error('A source label is required for imported medical review batches.');
  }

  if (!Array.isArray(input.candidates) || input.candidates.length === 0) {
    throw new Error('Provide at least one candidate in the import batch.');
  }

  const skippedReasons: string[] = [];
  const seenSignatures = new Set<string>();
  const validCandidates: ImportedMedicalFactDraft[] = [];

  input.candidates.forEach((draft, index) => {
    const validation = validateDraftCandidate(draft, index);
    if (!validation.valid) {
      skippedReasons.push(validation.reason ?? `Skipped candidate ${index + 1}.`);
      return;
    }

    const signature = buildDraftSignature(draft.category, draft.detail);
    if (seenSignatures.has(signature)) {
      skippedReasons.push(
        `Skipped candidate ${index + 1}: duplicate category/detail signature within this import batch.`
      );
      return;
    }

    seenSignatures.add(signature);
    validCandidates.push(draft);
  });

  if (validCandidates.length === 0) {
    throw new Error('No valid import candidates were found after validation.');
  }

  const intake = await createDocumentIntake(userId, {
    intake_source: 'external_import',
    file_name: buildImportFileName(sourceLabel),
    file_type: IMPORT_FILE_TYPE,
    file_size_bytes: new Blob([JSON.stringify(input)]).size,
    document_notes:
      input.import_note?.trim() ||
      `Imported ${formatImportSourceLabel(input.source_type)} review batch`,
    source_label: sourceLabel,
    source_reference: input.source_reference?.trim() || null,
    source_metadata: {
      source_type: input.source_type,
      ...(input.source_metadata ?? {}),
    },
    intake_status: 'review_ready',
    extraction_status: 'completed',
  });

  for (const candidate of validCandidates) {
    await seedCandidateFromIntake(userId, intake.id, {
      category: candidate.category,
      detail: candidate.detail,
      extraction_source: 'external_import',
      extraction_confidence: candidate.extraction_confidence ?? null,
      extraction_notes: candidate.extraction_notes?.trim() || input.import_note?.trim() || null,
      extractor_label: `external_import:${input.source_type}`,
      evidence_items: candidate.evidence_items ?? [],
    });
  }

  const queuedCandidates = await fetchCandidatesForIntake(userId, intake.id);

  return {
    intake,
    queued_candidates: queuedCandidates,
    queued_count: queuedCandidates.length,
    skipped_count: skippedReasons.length,
    skipped_reasons: skippedReasons,
  };
}