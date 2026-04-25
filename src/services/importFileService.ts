export type ImportTextFileFormat = 'csv' | 'tsv' | 'json' | 'txt' | 'unknown';

export interface ImportTextFileLoadResult {
  file_name: string;
  file_size_bytes: number;
  detected_format: ImportTextFileFormat;
  text: string;
  source_label_suggestion: string;
  source_reference_suggestion: string;
  quality_notes: string[];
}

const MAX_IMPORT_FILE_BYTES = 2 * 1024 * 1024;

export const IMPORT_TEXT_FILE_ACCEPT =
  '.csv,.tsv,.json,.txt,text/csv,text/plain,application/json';

function detectImportTextFileFormat(file: File): ImportTextFileFormat {
  const loweredName = file.name.toLowerCase();
  const loweredType = file.type.toLowerCase();

  if (loweredName.endsWith('.csv') || loweredType.includes('csv')) return 'csv';
  if (loweredName.endsWith('.tsv') || loweredType.includes('tab-separated')) return 'tsv';
  if (loweredName.endsWith('.json') || loweredType.includes('json')) return 'json';
  if (loweredName.endsWith('.txt') || loweredType.startsWith('text/')) return 'txt';
  return 'unknown';
}

function buildSourceLabelSuggestion(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const humanized = baseName
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return humanized || fileName;
}

export function formatImportFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function readImportTextFile(file: File): Promise<ImportTextFileLoadResult> {
  if (!file) {
    throw new Error('Choose a CSV, TSV, JSON, or text file before importing.');
  }

  if (file.size === 0) {
    throw new Error('The selected file is empty.');
  }

  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new Error(
      `Import files must stay under ${formatImportFileSize(MAX_IMPORT_FILE_BYTES)} for preview parsing.`
    );
  }

  const detectedFormat = detectImportTextFileFormat(file);
  if (detectedFormat === 'unknown') {
    throw new Error('Only CSV, TSV, JSON, or plain text files are supported right now.');
  }

  const text = (await file.text()).replace(/^\uFEFF/, '').trim();
  if (!text) {
    throw new Error('The selected file did not contain readable text.');
  }

  const qualityNotes: string[] = [
    `Loaded ${file.name} (${formatImportFileSize(file.size)}).`,
  ];

  if (detectedFormat === 'json') {
    qualityNotes.push('JSON imports preserve structured fields best when headers are consistent.');
  } else if (detectedFormat === 'csv' || detectedFormat === 'tsv') {
    qualityNotes.push('Structured column imports work best when headers name the clinical fields clearly.');
  } else {
    qualityNotes.push('Plain-text imports rely more heavily on line-level heuristics and preview review.');
  }

  return {
    file_name: file.name,
    file_size_bytes: file.size,
    detected_format: detectedFormat,
    text,
    source_label_suggestion: buildSourceLabelSuggestion(file.name),
    source_reference_suggestion: file.name,
    quality_notes,
  };
}