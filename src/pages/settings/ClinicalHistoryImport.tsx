import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardPaste,
  FileJson2,
  HeartPulse,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import {
  parseClinicalHistoryImportInput,
  queueClinicalHistoryImport,
  remapClinicalImportDetail,
  type ClinicalHistoryImportParseResult,
  type ClinicalImportKind,
  type ClinicalImportPreviewCategory,
  type ClinicalImportPreviewItem,
} from '../../services/clinicalHistoryImportService';
import type {
  GenericMedicalImportSourceType,
  MedicalImportBatchResult,
} from '../../types/medicalContext';
import { getCategoryConfig } from './medicalContextFields';

const fieldClassName =
  'w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-smooth placeholder:text-[var(--color-text-tertiary)] focus:border-[rgba(84,160,255,0.32)] focus:bg-[rgba(255,255,255,0.06)]';
const labelClassName =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]';

const IMPORT_KIND_OPTIONS: Array<{ value: ClinicalImportKind; label: string }> = [
  { value: 'problem_list', label: 'Problem List' },
  { value: 'allergy_list', label: 'Allergy / Intolerance List' },
  { value: 'procedure_history', label: 'Procedure History' },
  { value: 'diet_guidance', label: 'Diet Guidance' },
  { value: 'red_flag_history', label: 'Red-Flag History' },
  { value: 'mixed_clinical', label: 'Mixed Clinical List' },
];

const SOURCE_TYPE_OPTIONS: Array<{ value: GenericMedicalImportSourceType; label: string }> = [
  { value: 'visit_summary', label: 'Visit Summary' },
  { value: 'clinician_packet', label: 'Clinician Packet' },
  { value: 'lab_summary', label: 'Lab Summary' },
  { value: 'custom', label: 'Custom Import' },
];

const CATEGORY_OPTIONS: Array<{ value: ClinicalImportPreviewCategory; label: string }> = [
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'suspected_condition', label: 'Suspected Condition' },
  { value: 'allergy_intolerance', label: 'Allergy / Intolerance' },
  { value: 'surgery_procedure', label: 'Procedure' },
  { value: 'diet_guidance', label: 'Diet Guidance' },
  { value: 'red_flag_history', label: 'Red-Flag History' },
];

const EXAMPLE_INPUT = `category,name,date,notes,severity
diagnosis,IBS-M,2024-05-12,Alternating stool pattern,moderate
allergy_intolerance,Lactose intolerance,,Bloating and urgency after dairy,
surgery_procedure,Colonoscopy,2023-11-18,Normal exam,
diet_guidance,Low-FODMAP trial,2025-02-01,Avoid onions and garlic,
red_flag_history,Rectal bleeding,2023-08-20,Resolved after GI evaluation,`;

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Card
      variant="flat"
      className="mb-4 rounded-[24px] border-[rgba(248,113,113,0.2)] bg-[rgba(127,29,29,0.2)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-6 text-[rgba(254,202,202,0.98)]">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[rgba(252,165,165,0.9)] transition-smooth hover:text-white"
        >
          <span className="sr-only">Dismiss</span>
          &times;
        </button>
      </div>
    </Card>
  );
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

function formatConfidence(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Unscored';
  return `${Math.round(value * 100)}%`;
}

function previewHasCorrections(item: ClinicalImportPreviewItem): boolean {
  return (
    item.category !== item.original_category ||
    stableStringify(item.detail) !== stableStringify(item.original_detail)
  );
}

function PreviewField({
  field,
  value,
  onChange,
}: {
  field: ReturnType<typeof getCategoryConfig>['fields'][number];
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (field.type === 'boolean') {
    return (
      <div className="rounded-[20px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{field.label}</p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              Keep this on only when the imported row clearly supports it.
            </p>
          </div>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-transparent text-[var(--color-accent-primary)]"
          />
        </div>
      </div>
    );
  }

  if (field.type === 'select' && field.options) {
    return (
      <div>
        <label className={labelClassName}>{field.label}</label>
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClassName}
        >
          <option value="">Select...</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'tags') {
    const joined = Array.isArray(value) ? value.join(', ') : '';
    return (
      <div className="sm:col-span-2">
        <label className={labelClassName}>{field.label}</label>
        <input
          type="text"
          value={joined}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(',')
                .map((entry) => entry.trim())
                .filter(Boolean)
            )
          }
          className={fieldClassName}
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  return (
    <div>
      <label className={labelClassName}>{field.label}</label>
      <input
        type={field.type === 'date' ? 'date' : 'text'}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClassName}
        placeholder={field.placeholder}
      />
    </div>
  );
}

function ClinicalPreviewCard({
  item,
  onChange,
  onCategoryChange,
}: {
  item: ClinicalImportPreviewItem;
  onChange: (id: string, patch: Partial<ClinicalImportPreviewItem>) => void;
  onCategoryChange: (id: string, category: ClinicalImportPreviewCategory) => void;
}) {
  const config = getCategoryConfig(item.category);

  return (
    <Card variant="flat" className="rounded-[28px]">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 border-b border-white/8 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-[var(--color-text-primary)]">
                {config.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                Source line: {item.source_line}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
              {item.source_row_label}
            </span>
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
              {item.parse_method.replace(/_/g, ' ')}
            </span>
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
              Parse {formatConfidence(item.parse_confidence)}
            </span>
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
              Normalize {formatConfidence(item.normalization_confidence)}
            </span>
            {previewHasCorrections(item) && (
              <span className="inline-flex rounded-full border border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.1)] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-accent-primary)]">
                Corrected before queue
              </span>
            )}
          </div>
        </div>

        <div>
          <label className={labelClassName}>Normalized Category</label>
          <select
            value={item.category}
            onChange={(e) => onCategoryChange(item.id, e.target.value as ClinicalImportPreviewCategory)}
            className={fieldClassName}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {config.fields
            .filter((field) => field.type !== 'boolean')
            .map((field) => (
              <PreviewField
                key={field.key}
                field={field}
                value={item.detail[field.key]}
                onChange={(value) =>
                  onChange(item.id, {
                    detail: {
                      ...item.detail,
                      [field.key]: value,
                    },
                  })
                }
              />
            ))}
        </div>

        {config.fields.some((field) => field.type === 'boolean') && (
          <div className="space-y-3">
            {config.fields
              .filter((field) => field.type === 'boolean')
              .map((field) => (
                <PreviewField
                  key={field.key}
                  field={field}
                  value={item.detail[field.key]}
                  onChange={(value) =>
                    onChange(item.id, {
                      detail: {
                        ...item.detail,
                        [field.key]: value,
                      },
                    })
                  }
                />
              ))}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {previewHasCorrections(item) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onChange(item.id, {
                  category: item.original_category,
                  detail: JSON.parse(JSON.stringify(item.original_detail)) as Record<string, unknown>,
                })
              }
            >
              <RefreshCcw className="h-4 w-4" />
              Restore Parsed Values
            </Button>
          )}
        </div>

        {(item.parse_notes.length > 0 || item.normalization_notes.length > 0) && (
          <div className="rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
              Import notes
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              {item.parse_notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
              {item.normalization_notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function ClinicalHistoryImport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sourceType, setSourceType] = useState<GenericMedicalImportSourceType>('visit_summary');
  const [importKind, setImportKind] = useState<ClinicalImportKind>('mixed_clinical');
  const [sourceLabel, setSourceLabel] = useState('Imported clinical history');
  const [sourceReference, setSourceReference] = useState('');
  const [importNote, setImportNote] = useState('');
  const [inputText, setInputText] = useState(EXAMPLE_INPUT);
  const [parsing, setParsing] = useState(false);
  const [queueing, setQueueing] = useState(false);
  const [error, setError] = useState('');
  const [parseResult, setParseResult] = useState<ClinicalHistoryImportParseResult | null>(null);
  const [previewItems, setPreviewItems] = useState<ClinicalImportPreviewItem[]>([]);
  const [queueResult, setQueueResult] = useState<MedicalImportBatchResult | null>(null);

  const correctedCount = useMemo(
    () => previewItems.filter(previewHasCorrections).length,
    [previewItems]
  );

  const categoryCount = useMemo(
    () => new Set(previewItems.map((item) => item.category)).size,
    [previewItems]
  );

  const handleBuildPreview = async () => {
    setParsing(true);
    setError('');
    setQueueResult(null);

    try {
      const parsed = await parseClinicalHistoryImportInput(inputText, importKind);
      setParseResult(parsed);
      setPreviewItems(parsed.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse clinical import input');
      setParseResult(null);
      setPreviewItems([]);
    } finally {
      setParsing(false);
    }
  };

  const updatePreviewItem = (id: string, patch: Partial<ClinicalImportPreviewItem>) => {
    setPreviewItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleCategoryChange = (id: string, category: ClinicalImportPreviewCategory) => {
    setPreviewItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              category,
              detail: remapClinicalImportDetail(item, category),
            }
          : item
      )
    );
  };

  const handleQueueImport = async () => {
    if (!user?.id) return;

    setQueueing(true);
    setError('');

    try {
      const queued = await queueClinicalHistoryImport(user.id, {
        source_type: sourceType,
        source_label: sourceLabel,
        source_reference: sourceReference || null,
        import_note: importNote || null,
        import_kind: importKind,
        detected_format: parseResult?.detected_format ?? 'line_list',
        items: previewItems,
      });

      setQueueResult(queued);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to queue clinical import batch');
    } finally {
      setQueueing(false);
    }
  };

  return (
    <SettingsPageLayout
      title="Clinical History Importer"
      description="Normalize diagnoses, allergies, procedures, diet guidance, and red-flag history into the same review-first candidate pipeline before anything reaches active medical context."
    >
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[30px]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
            <div>
              <span className="badge-secondary mb-3 inline-flex">External Import Expansion</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Import more than medications without bypassing review
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                This importer is for problem lists, allergy lists, procedure history, clinician
                diet guidance, and red-flag history. GutWise normalizes each row into a category
                preview first, then queues it for review instead of activating it silently.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)] px-4 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                    Step 1
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
                    Normalize rows
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    Detect or assign the right medical context category before queueing.
                  </p>
                </div>
                <div className="rounded-[22px] border border-[rgba(133,93,255,0.16)] bg-[rgba(133,93,255,0.08)] px-4 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                    Step 2
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
                    Correct details
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    Fix the category or mapped fields before anything lands in the review queue.
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                    Step 3
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
                    Review evidence
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    Imported rows still become reviewable candidates, not active facts.
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-intelligence rounded-[26px] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(133,93,255,0.16)] text-[var(--color-accent-secondary)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Best-fit sources
                  </p>
                  <div className="mt-2 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    <p>Portal problem lists and allergy exports.</p>
                    <p>Clinician packets and typed visit summaries.</p>
                    <p>Structured CSV, TSV, JSON, or simple line lists.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <Card variant="elevated" className="rounded-[30px]">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClassName}>Import Kind</label>
                  <select
                    value={importKind}
                    onChange={(e) => setImportKind(e.target.value as ClinicalImportKind)}
                    className={fieldClassName}
                  >
                    {IMPORT_KIND_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClassName}>Source Type</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as GenericMedicalImportSourceType)}
                    className={fieldClassName}
                  >
                    {SOURCE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClassName}>Source Label</label>
                  <input
                    type="text"
                    value={sourceLabel}
                    onChange={(e) => setSourceLabel(e.target.value)}
                    className={fieldClassName}
                    placeholder="Example: PCP problem list"
                  />
                </div>

                <div>
                  <label className={labelClassName}>Source Reference</label>
                  <input
                    type="text"
                    value={sourceReference}
                    onChange={(e) => setSourceReference(e.target.value)}
                    className={fieldClassName}
                    placeholder="Optional visit date or export id"
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>Import Note</label>
                <input
                  type="text"
                  value={importNote}
                  onChange={(e) => setImportNote(e.target.value)}
                  className={fieldClassName}
                  placeholder="Optional note about where this batch came from"
                />
              </div>

              <div>
                <label className={labelClassName}>Clinical History Input</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={14}
                  spellCheck={false}
                  className={`${fieldClassName} font-mono text-xs leading-6`}
                  placeholder="Paste CSV, TSV, JSON, or a simple clinical history list"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleBuildPreview} disabled={parsing}>
                  <ClipboardPaste className="h-4 w-4" />
                  {parsing ? 'Building Preview...' : 'Build Preview'}
                </Button>
                <Button variant="secondary" onClick={() => setInputText(EXAMPLE_INPUT)}>
                  <FileJson2 className="h-4 w-4" />
                  Restore Example
                </Button>
                <Button variant="ghost" onClick={() => navigate('/settings/import-workbench')}>
                  <ArrowRight className="h-4 w-4" />
                  Open Import Workbench
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-5">
            <Card variant="flat" className="rounded-[30px]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-[var(--color-text-tertiary)]" />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Supported import styles
                  </h3>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    <p>Problem or allergy CSVs with headers like category, diagnosis, allergen, date, or notes.</p>
                    <p>Structured JSON arrays from portals or helper scripts.</p>
                    <p>Plain line lists for quick clinician-note normalization.</p>
                  </div>
                </div>
              </div>
            </Card>

            {parseResult ? (
              <Card
                variant="discovery"
                glowIntensity="subtle"
                className="rounded-[30px] border-[rgba(133,93,255,0.14)]"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(133,93,255,0.16)] text-[var(--color-accent-secondary)]">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Preview ready
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Detected format: {parseResult.detected_format.replace(/_/g, ' ')}. Review
                        the normalized rows below, then queue them into the medical candidate flow.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                        Parsed entries
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                        {previewItems.length}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                        Skipped lines
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                        {parseResult.skipped_lines.length}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                        Corrected items
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                        {correctedCount}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                        Category spread
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                        {categoryCount}
                      </p>
                    </div>
                  </div>

                  {parseResult.skipped_lines.length > 0 && (
                    <div className="rounded-[20px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                        Skipped details
                      </p>
                      <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        {parseResult.skipped_lines.map((reason) => (
                          <p key={reason}>{reason}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button onClick={handleQueueImport} disabled={queueing || previewItems.length === 0}>
                      <ArrowRight className="h-4 w-4" />
                      {queueing ? 'Queueing Import...' : 'Queue Clinical Review Batch'}
                    </Button>
                    <Button variant="secondary" onClick={handleBuildPreview} disabled={parsing}>
                      <RefreshCcw className="h-4 w-4" />
                      Refresh Preview
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card variant="flat" className="rounded-[30px]">
                <div className="flex items-start gap-3">
                  <ClipboardPaste className="mt-0.5 h-5 w-5 text-[var(--color-text-tertiary)]" />
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      Category-aware preview first
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      This importer normalizes each row into a diagnosis, allergy, procedure, diet
                      guidance, or red-flag draft before queueing it as a reviewable candidate.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {queueResult && (
              <Card
                variant="discovery"
                glowIntensity="subtle"
                className="rounded-[30px] border-[rgba(84,160,255,0.14)]"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[rgba(110,231,183,0.98)]" />
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Clinical history batch queued
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Review the imported candidates before they become active medical context.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                        Queued candidates
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                        {queueResult.queued_count}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                        Skipped items
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                        {queueResult.skipped_count}
                      </p>
                    </div>
                  </div>

                  <Button onClick={() => navigate('/settings/document-intake')}>
                    <ArrowRight className="h-4 w-4" />
                    Review Imported Candidates
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {previewItems.length > 0 && (
          <section className="space-y-4">
            <div className="page-header">
              <div>
                <span className="badge-secondary mb-3 inline-flex">Clinical Import Preview</span>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                  Review normalized rows before queueing
                </h2>
                <p className="page-subtitle mt-2">
                  Correct the mapped category or field values now so the downstream review queue
                  starts from a cleaner, more trustworthy import.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {previewItems.map((item) => (
                <ClinicalPreviewCard
                  key={item.id}
                  item={item}
                  onChange={updatePreviewItem}
                  onCategoryChange={handleCategoryChange}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </SettingsPageLayout>
  );
}