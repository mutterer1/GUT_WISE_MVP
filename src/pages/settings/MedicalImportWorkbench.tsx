import { useState } from 'react';
import { ArrowRight, CheckCircle2, FileJson2, Layers3, Sparkles, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { queueMedicalImportBatch } from '../../services/medicalImportService';
import type {
  GenericMedicalImportSourceType,
  ImportedMedicalFactDraft,
  MedicalImportBatchResult,
} from '../../types/medicalContext';

const fieldClassName =
  'w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-smooth placeholder:text-[var(--color-text-tertiary)] focus:border-[rgba(84,160,255,0.32)] focus:bg-[rgba(255,255,255,0.06)]';
const labelClassName =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]';

const SOURCE_OPTIONS: Array<{ value: GenericMedicalImportSourceType; label: string }> = [
  { value: 'medication_list', label: 'Medication List' },
  { value: 'visit_summary', label: 'Visit Summary' },
  { value: 'lab_summary', label: 'Lab Summary' },
  { value: 'clinician_packet', label: 'Clinician Packet' },
  { value: 'custom', label: 'Custom Import' },
];

const EXAMPLE_PAYLOAD = JSON.stringify(
  [
    {
      category: 'medication',
      detail: {
        medication_name: 'Magnesium glycinate',
        dosage: '200 mg',
        frequency: 'nightly',
        prescribing_reason: 'supplement',
        gi_side_effects_known: true,
        start_date: '2026-04-01',
        end_date: null,
        is_current: true,
      },
      extraction_confidence: 0.92,
      extraction_notes: 'Imported from external medication list.',
      evidence_items: [
        {
          evidence_kind: 'medication_list',
          section_label: 'Current Medications',
          quoted_text: 'Magnesium glycinate 200 mg by mouth nightly',
          confidence_score: 0.92,
        },
      ],
    },
  ],
  null,
  2
);

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

export default function MedicalImportWorkbench() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sourceType, setSourceType] = useState<GenericMedicalImportSourceType>('custom');
  const [sourceLabel, setSourceLabel] = useState('Manual clinical import');
  const [sourceReference, setSourceReference] = useState('');
  const [importNote, setImportNote] = useState('');
  const [payloadText, setPayloadText] = useState(EXAMPLE_PAYLOAD);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<MedicalImportBatchResult | null>(null);

  const handleSubmit = async () => {
    if (!user?.id) return;

    setSaving(true);
    setError('');
    setResult(null);

    try {
      const parsed = JSON.parse(payloadText) as ImportedMedicalFactDraft[] | { candidates?: ImportedMedicalFactDraft[] };
      const candidates = Array.isArray(parsed) ? parsed : parsed.candidates;

      if (!Array.isArray(candidates)) {
        throw new Error('Payload must be a JSON array of candidate objects or an object with a candidates array.');
      }

      const queued = await queueMedicalImportBatch(user.id, {
        source_type: sourceType,
        source_label: sourceLabel,
        source_reference: sourceReference || null,
        import_note: importNote || null,
        candidates,
      });

      setResult(queued);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to queue import batch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsPageLayout
      title="Clinical Import Workbench"
      description="Queue external clinical data as reviewable candidates first, so future importers never bypass GutWise's evidence and confirmation flow."
    >
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[30px]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
            <div>
              <span className="badge-secondary mb-3 inline-flex">Generic Import Framework</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Route future external sources through one review-first intake path
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                This workbench is the reusable staging layer for medication lists, visit summaries,
                lab summaries, and future integrations. Imported data becomes reviewable candidates,
                not active context, until you confirm it.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)] px-4 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                    Step 1
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
                    Import batch
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    Bring in structured candidates from any supported source.
                  </p>
                </div>
                <div className="rounded-[22px] border border-[rgba(133,93,255,0.16)] bg-[rgba(133,93,255,0.08)] px-4 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                    Step 2
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
                    Review evidence
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    Inspect imported details in the same candidate queue as documents.
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                    Step 3
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
                    Promote context
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    Only accepted candidates become active medical context.
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
                    Framework boundary
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    This pass creates a generic import path and a manual workbench for testing.
                    The next pass can plug a real external importer into the same queueing service.
                  </p>
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
                  <label className={labelClassName}>Import Source Type</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as GenericMedicalImportSourceType)}
                    className={fieldClassName}
                  >
                    {SOURCE_OPTIONS.map((option) => (
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
                    placeholder="Example: PCP visit export or pharmacy sync"
                    className={fieldClassName}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClassName}>Source Reference</label>
                  <input
                    type="text"
                    value={sourceReference}
                    onChange={(e) => setSourceReference(e.target.value)}
                    placeholder="Optional external id, date, or batch label"
                    className={fieldClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>Import Note</label>
                  <input
                    type="text"
                    value={importNote}
                    onChange={(e) => setImportNote(e.target.value)}
                    placeholder="Optional note about where this batch came from"
                    className={fieldClassName}
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>Candidate Payload JSON</label>
                <textarea
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  className={`${fieldClassName} min-h-[420px] font-mono text-xs leading-6`}
                  spellCheck={false}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleSubmit} disabled={saving}>
                  <UploadCloud className="h-4 w-4" />
                  {saving ? 'Queueing Import...' : 'Queue Import Batch'}
                </Button>
                <Button variant="secondary" onClick={() => setPayloadText(EXAMPLE_PAYLOAD)}>
                  <FileJson2 className="h-4 w-4" />
                  Restore Example
                </Button>
                <Button variant="ghost" onClick={() => navigate('/settings/document-intake')}>
                  <ArrowRight className="h-4 w-4" />
                  Open Review Queue
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-5">
            <Card variant="flat" className="rounded-[30px]">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Payload contract
                  </h3>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    <p>Each array item must include `category` and `detail`.</p>
                    <p>`detail` should match the same structured fields GutWise already uses for medical facts.</p>
                    <p>`evidence_items` is optional but recommended so the review queue stays traceable.</p>
                    <p>Duplicate category/detail pairs in the same batch are skipped automatically.</p>
                  </div>
                </div>
              </div>
            </Card>

            {result ? (
              <Card
                variant="discovery"
                glowIntensity="subtle"
                className="rounded-[30px] border-[rgba(133,93,255,0.14)]"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[rgba(110,231,183,0.98)]" />
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      Import batch queued
                    </h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                          Queued candidates
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                          {result.queued_count}
                        </p>
                      </div>
                      <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                          Skipped items
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                          {result.skipped_count}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                      Intake anchor: {result.intake.source_label ?? result.intake.file_name}
                    </p>
                    {result.skipped_reasons.length > 0 && (
                      <div className="mt-4 space-y-2 rounded-[20px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                          Skipped details
                        </p>
                        {result.skipped_reasons.map((reason) => (
                          <p
                            key={reason}
                            className="text-sm leading-6 text-[var(--color-text-secondary)]"
                          >
                            {reason}
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="mt-4">
                      <Button onClick={() => navigate('/settings/document-intake')}>
                        <ArrowRight className="h-4 w-4" />
                        Review Imported Candidates
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card variant="flat" className="rounded-[30px]">
                <div className="flex items-start gap-3">
                  <FileJson2 className="mt-0.5 h-5 w-5 text-[var(--color-text-tertiary)]" />
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      Reusable import target
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      Future provider-specific importers can build a batch payload and send it
                      through this same queueing service. That keeps external data aligned with the
                      document review workflow instead of creating a parallel activation path.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SettingsPageLayout>
  );
}