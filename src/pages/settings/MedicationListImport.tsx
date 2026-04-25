import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardPaste,
  FileSpreadsheet,
  Pill,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import {
  parseMedicationListInput,
  queueMedicationListImport,
  type MedicationImportPreviewItem,
  type MedicationListImportParseResult,
} from '../../services/medicationListImportService';
import {
  getMedicationImportSourceOptions,
  type MedicationImportSourceProfileId,
} from '../../services/importSourceProfileService';
import type { MedicalImportBatchResult } from '../../types/medicalContext';

const fieldClassName =
  'w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-smooth placeholder:text-[var(--color-text-tertiary)] focus:border-[rgba(84,160,255,0.32)] focus:bg-[rgba(255,255,255,0.06)]';
const labelClassName =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]';

const EXAMPLE_INPUT = `Medication,Strength,Frequency,Reason,Status
Omeprazole,20 mg,once daily,acid reflux,current
Loperamide,2 mg,as needed,diarrhea,current
Magnesium glycinate,200 mg,nightly,supplement,current`;

const SOURCE_PROFILE_OPTIONS = [
  {
    value: '',
    label: 'Auto-detect from source and content',
    hint: 'Use source label, reference, headers, and pasted content to infer the best medication import profile.',
  },
  ...getMedicationImportSourceOptions(),
];

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

function formatConfidence(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Unscored';
  return `${Math.round(value * 100)}%`;
}

function hasPreviewCorrections(item: MedicationImportPreviewItem): boolean {
  return (
    item.medication_name !== item.original_medication_name ||
    item.dosage !== item.original_dosage ||
    item.frequency !== item.original_frequency ||
    item.prescribing_reason !== item.original_prescribing_reason ||
    item.route !== item.original_route ||
    item.start_date !== item.original_start_date ||
    item.end_date !== item.original_end_date ||
    item.is_current !== item.original_is_current
  );
}

function MedicationPreviewCard({
  item,
  onChange,
}: {
  item: MedicationImportPreviewItem;
  onChange: (id: string, patch: Partial<MedicationImportPreviewItem>) => void;
}) {
  return (
    <Card variant="flat" className="rounded-[28px]">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 border-b border-white/8 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-[var(--color-text-primary)]">
                {item.medication_name}
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
              Enrichment {formatConfidence(item.enrichment_confidence)}
            </span>
            {hasPreviewCorrections(item) && (
              <span className="inline-flex rounded-full border border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.1)] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-accent-primary)]">
                Corrected before queue
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClassName}>Medication Name</label>
            <input
              type="text"
              value={item.medication_name}
              onChange={(e) => onChange(item.id, { medication_name: e.target.value })}
              className={fieldClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>Dosage</label>
            <input
              type="text"
              value={item.dosage}
              onChange={(e) => onChange(item.id, { dosage: e.target.value })}
              className={fieldClassName}
              placeholder="e.g. 20 mg"
            />
          </div>

          <div>
            <label className={labelClassName}>Frequency</label>
            <input
              type="text"
              value={item.frequency}
              onChange={(e) => onChange(item.id, { frequency: e.target.value })}
              className={fieldClassName}
              placeholder="e.g. once daily"
            />
          </div>

          <div>
            <label className={labelClassName}>Reason</label>
            <input
              type="text"
              value={item.prescribing_reason}
              onChange={(e) => onChange(item.id, { prescribing_reason: e.target.value })}
              className={fieldClassName}
              placeholder="e.g. reflux"
            />
          </div>

          <div>
            <label className={labelClassName}>Start Date</label>
            <input
              type="date"
              value={item.start_date}
              onChange={(e) => onChange(item.id, { start_date: e.target.value })}
              className={fieldClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>End Date</label>
            <input
              type="date"
              value={item.end_date}
              onChange={(e) => onChange(item.id, { end_date: e.target.value })}
              className={fieldClassName}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Import as current medication
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              Turn this off if the list item is historical or already discontinued.
            </p>
          </div>
          <input
            type="checkbox"
            checked={item.is_current}
            onChange={(e) => onChange(item.id, { is_current: e.target.checked })}
            className="h-4 w-4 rounded border-white/20 bg-transparent text-[var(--color-accent-primary)]"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.9fr)]">
          <div className="rounded-[22px] border border-[rgba(84,160,255,0.14)] bg-[rgba(84,160,255,0.08)] px-4 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-accent-primary)]">
              Suggested medication reference
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-primary)]">
              <p>Generic: {item.suggested_generic_name ?? 'No match yet'}</p>
              <p>Family: {item.suggested_medication_family?.replace(/_/g, ' ') ?? 'Unknown'}</p>
              <p>Class: {item.suggested_medication_class ?? 'Unknown'}</p>
              <p>Route: {item.route || item.suggested_route || 'Unknown'}</p>
              <p>Form: {item.suggested_dosage_form ?? 'Unknown'}</p>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
              GI context
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              <p>
                Gut relevance:{' '}
                {item.suggested_gut_relevance
                  ? item.suggested_gut_relevance.replace(/_/g, ' ')
                  : 'Unknown'}
              </p>
              <p>
                Common gut effects:{' '}
                {item.suggested_common_gut_effects.length > 0
                  ? item.suggested_common_gut_effects.join(', ')
                  : 'None suggested'}
              </p>
              <p>
                Known dose units:{' '}
                {item.suggested_common_dose_units.length > 0
                  ? item.suggested_common_dose_units.join(', ')
                  : 'Unknown'}
              </p>
              <p>Source profile: {item.source_profile_label}</p>
              <p>Source system: {item.source_system_label}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-[rgba(133,93,255,0.14)] bg-[rgba(133,93,255,0.08)] px-4 py-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-accent-secondary)]">
            Import source mapping
          </p>
          <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            <p>Profile: {item.source_profile_label}</p>
            <p>Source system: {item.source_system_label}</p>
            <p>Strategy: {item.parse_strategy_label}</p>
            <p>Profile confidence: {formatConfidence(item.source_profile_confidence)}</p>
            {item.source_mapping_notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {item.suggested_generic_name && item.suggested_generic_name !== item.medication_name && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                onChange(item.id, {
                  medication_name: item.suggested_generic_name ?? item.medication_name,
                })
              }
            >
              <Sparkles className="h-4 w-4" />
              Use Suggested Generic
            </Button>
          )}

          {item.suggested_route && item.suggested_route !== item.route && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onChange(item.id, { route: item.suggested_route ?? item.route })}
            >
              <ArrowRight className="h-4 w-4" />
              Use Suggested Route
            </Button>
          )}

          {hasPreviewCorrections(item) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onChange(item.id, {
                  medication_name: item.original_medication_name,
                  dosage: item.original_dosage,
                  frequency: item.original_frequency,
                  prescribing_reason: item.original_prescribing_reason,
                  route: item.original_route,
                  start_date: item.original_start_date,
                  end_date: item.original_end_date,
                  is_current: item.original_is_current,
                })
              }
            >
              <RefreshCcw className="h-4 w-4" />
              Restore Parsed Values
            </Button>
          )}
        </div>

        {(item.parse_notes.length > 0 || item.enrichment_notes) && (
          <div className="rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
              Import notes
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              {item.parse_notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
              {item.enrichment_notes && <p>{item.enrichment_notes}</p>}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function MedicationListImport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sourceLabel, setSourceLabel] = useState('Pasted medication list');
  const [sourceReference, setSourceReference] = useState('');
  const [sourceProfileId, setSourceProfileId] = useState<MedicationImportSourceProfileId | ''>('');
  const [importNote, setImportNote] = useState('');
  const [inputText, setInputText] = useState(EXAMPLE_INPUT);
  const [parsing, setParsing] = useState(false);
  const [queueing, setQueueing] = useState(false);
  const [error, setError] = useState('');
  const [parseResult, setParseResult] = useState<MedicationListImportParseResult | null>(null);
  const [previewItems, setPreviewItems] = useState<MedicationImportPreviewItem[]>([]);
  const [queueResult, setQueueResult] = useState<MedicalImportBatchResult | null>(null);

  const handleBuildPreview = async () => {
    setParsing(true);
    setError('');
    setQueueResult(null);

    try {
      const result = await parseMedicationListInput(inputText, {
        sourceLabel,
        sourceReference,
        sourceProfileId: sourceProfileId || null,
      });
      setParseResult(result);
      setPreviewItems(result.items);
    } catch (err) {
      setParseResult(null);
      setPreviewItems([]);
      setError(err instanceof Error ? err.message : 'Failed to parse medication list');
    } finally {
      setParsing(false);
    }
  };

  const handleQueueImport = async () => {
    if (!user?.id || !parseResult) return;

    setQueueing(true);
    setError('');

    try {
      const result = await queueMedicationListImport(user.id, {
        source_label: sourceLabel,
        source_reference: sourceReference || null,
        import_note: importNote || null,
        source_profile_id: sourceProfileId || null,
        items: previewItems,
        detected_format: parseResult.detected_format,
      });
      setQueueResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to queue medication import');
    } finally {
      setQueueing(false);
    }
  };

  const updatePreviewItem = (id: string, patch: Partial<MedicationImportPreviewItem>) => {
    setPreviewItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const correctedCount = previewItems.filter(hasPreviewCorrections).length;
  const enrichedCount = previewItems.filter((item) => item.enrichment_status === 'enriched').length;
  const sourceProfileLabel = previewItems[0]?.source_profile_label ?? 'Not detected yet';
  const sourceSystemLabel = previewItems[0]?.source_system_label ?? 'Unknown';
  const sourceStrategyLabel = previewItems[0]?.parse_strategy_label ?? 'Not available';

  return (
    <SettingsPageLayout
      title="Medication List Importer"
      description="Paste a portal, pharmacy, or clinician medication list, preview the parsed entries, then send them into GutWise's review-first medical evidence pipeline."
    >
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[30px]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div>
              <span className="badge-secondary mb-3 inline-flex">First Real Importer</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Turn pasted medication lists into reviewable clinical context candidates
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                This importer accepts common medication-list formats, suggests structured
                medication metadata, and still routes everything through the same evidence and
                candidate review queue before anything becomes active medical context.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)] px-4 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                    Input
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
                    Paste list
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    JSON, CSV, TSV, or simple line-by-line medication lists.
                  </p>
                </div>
                <div className="rounded-[22px] border border-[rgba(133,93,255,0.16)] bg-[rgba(133,93,255,0.08)] px-4 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                    Preview
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
                    Review parse
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    Adjust names, dosage, frequency, and current status before queueing.
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                    Review
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
                    Confirm later
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    Imported entries stay reviewable until you accept them in the queue.
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-intelligence rounded-[26px] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(133,93,255,0.16)] text-[var(--color-accent-secondary)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Import boundary
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    This importer uses the current medication enrichment layer to suggest generic
                    names, families, gut effects, and likely route context. The imported items
                    still remain candidates until you review them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <Card variant="elevated" className="rounded-[30px]">
            <div className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <label className={labelClassName}>Source Label</label>
                  <input
                    type="text"
                    value={sourceLabel}
                    onChange={(e) => setSourceLabel(e.target.value)}
                    className={fieldClassName}
                    placeholder="Example: Portal medication list"
                  />
                </div>

                <div>
                  <label className={labelClassName}>Source Reference</label>
                  <input
                    type="text"
                    value={sourceReference}
                    onChange={(e) => setSourceReference(e.target.value)}
                    className={fieldClassName}
                    placeholder="Optional export id or visit date"
                  />
                </div>

                <div>
                  <label className={labelClassName}>Source Profile</label>
                  <select
                    value={sourceProfileId}
                    onChange={(e) =>
                      setSourceProfileId(e.target.value as MedicationImportSourceProfileId | '')
                    }
                    className={fieldClassName}
                  >
                    {SOURCE_PROFILE_OPTIONS.map((option) => (
                      <option key={option.value || 'auto'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">
                    {SOURCE_PROFILE_OPTIONS.find((option) => option.value === sourceProfileId)?.hint ??
                      SOURCE_PROFILE_OPTIONS[0].hint}
                  </p>
                </div>
              </div>

              <div>
                <label className={labelClassName}>Import Note</label>
                <input
                  type="text"
                  value={importNote}
                  onChange={(e) => setImportNote(e.target.value)}
                  className={fieldClassName}
                  placeholder="Optional note about where this list came from"
                />
              </div>

              <div>
                <label className={labelClassName}>Medication List Input</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={14}
                  spellCheck={false}
                  className={`${fieldClassName} font-mono text-xs leading-6`}
                  placeholder="Paste a CSV, TSV, JSON array, or simple line-based medication list"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleBuildPreview} disabled={parsing}>
                  <ClipboardPaste className="h-4 w-4" />
                  {parsing ? 'Building Preview...' : 'Build Preview'}
                </Button>
                <Button variant="secondary" onClick={() => setInputText(EXAMPLE_INPUT)}>
                  <FileSpreadsheet className="h-4 w-4" />
                  Restore Example
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/settings/import-workbench')}
                >
                  <ArrowRight className="h-4 w-4" />
                  Open Generic Workbench
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-5">
            <Card variant="flat" className="rounded-[30px]">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Supported formats
                  </h3>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    <p>CSV or TSV medication exports with headers like name, dose, frequency, route, or reason.</p>
                    <p>Structured JSON arrays from portals or scripts.</p>
                    <p>Plain-text lists like `Omeprazole 20 mg daily for reflux`.</p>
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
                        the parsed items below, then queue them into the candidate pipeline.
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
                        Enriched matches
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                        {enrichedCount}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-[rgba(133,93,255,0.14)] bg-[rgba(133,93,255,0.08)] px-4 py-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-accent-secondary)]">
                      Source-aware mapping
                    </p>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      <p>Profile: {sourceProfileLabel}</p>
                      <p>Source system: {sourceSystemLabel}</p>
                      <p>Strategy: {sourceStrategyLabel}</p>
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
                      {queueing ? 'Queueing Import...' : 'Queue Medication Review Batch'}
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
                      Preview before queueing
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      The importer first builds a structured preview, then sends the reviewed items
                      into the same candidate queue used by document extraction and generic imports.
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
                        Medication list queued
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Review the imported medication candidates before they become active medical
                        context.
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
                <span className="badge-secondary mb-3 inline-flex">Medication Preview</span>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                  Review parsed entries before queueing
                </h2>
                <p className="page-subtitle mt-2">
                  Each medication still lands as a reviewable candidate. This step only lets you
                  fix the import parse before it enters the queue.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {previewItems.map((item) => (
                <MedicationPreviewCard
                  key={item.id}
                  item={item}
                  onChange={updatePreviewItem}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </SettingsPageLayout>
  );
}
