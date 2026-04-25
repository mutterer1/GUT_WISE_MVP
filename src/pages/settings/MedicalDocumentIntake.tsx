import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  FileSearch,
  ArrowUpRight,
  Layers3,
  RefreshCcw,
} from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CandidateReviewList from './CandidateReviewList';
import { CATEGORY_CONFIGS, buildDefaultDetail } from './medicalContextFields';
import { useAuth } from '../../contexts/AuthContext';
import type {
  MedicalDocumentIntakeRow,
  CandidateMedicalFactRow,
  MedicalFactCategory,
  DocumentExtractionStatus,
} from '../../types/medicalContext';
import {
  createDocumentIntake,
  fetchDocumentIntakes,
  fetchPendingCandidates,
  fetchAllCandidates,
  seedCandidateFromIntake,
  acceptCandidate,
  rejectCandidate,
  uploadMedicalDocumentArtifact,
  startDocumentExtraction,
} from '../../services/medicalContextService';

type ViewMode = 'overview' | 'seed';

interface SeedForm {
  intakeId: string;
  category: MedicalFactCategory;
  detail: Record<string, unknown>;
  notes: string;
  evidenceQuote: string;
  evidencePage: string;
  evidenceSection: string;
}

const INTAKE_STATUS_META: Record<
  string,
  { icon: typeof Clock; label: string; tone: string; chipClassName: string }
> = {
  uploaded: {
    icon: Upload,
    label: 'Uploaded',
    tone: 'Awaiting triage',
    chipClassName:
      'border-[rgba(84,160,255,0.22)] bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]',
  },
  processing: {
    icon: Clock,
    label: 'Processing',
    tone: 'In document review',
    chipClassName:
      'border-[rgba(245,158,11,0.22)] bg-[rgba(245,158,11,0.12)] text-[rgba(245,190,80,0.98)]',
  },
  review_ready: {
    icon: AlertTriangle,
    label: 'Ready to Review',
    tone: 'Details available',
    chipClassName:
      'border-[rgba(245,158,11,0.22)] bg-[rgba(245,158,11,0.12)] text-[rgba(245,190,80,0.98)]',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    tone: 'Review closed',
    chipClassName:
      'border-[rgba(52,211,153,0.22)] bg-[rgba(52,211,153,0.12)] text-[rgba(110,231,183,0.98)]',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    tone: 'Needs another upload',
    chipClassName:
      'border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.12)] text-[rgba(252,165,165,0.98)]',
  },
};

const EXTRACTION_STATUS_META: Record<
  DocumentExtractionStatus,
  { icon: typeof Clock; label: string; tone: string; chipClassName: string }
> = {
  not_started: {
    icon: FileSearch,
    label: 'Not Started',
    tone: 'Waiting to begin',
    chipClassName:
      'border-white/10 bg-white/[0.04] text-[var(--color-text-tertiary)]',
  },
  queued: {
    icon: Upload,
    label: 'Queued',
    tone: 'Ready for extraction',
    chipClassName:
      'border-[rgba(84,160,255,0.22)] bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]',
  },
  processing: {
    icon: Clock,
    label: 'Processing',
    tone: 'Extraction in progress',
    chipClassName:
      'border-[rgba(245,158,11,0.22)] bg-[rgba(245,158,11,0.12)] text-[rgba(245,190,80,0.98)]',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Extracted',
    tone: 'Structured text captured',
    chipClassName:
      'border-[rgba(52,211,153,0.22)] bg-[rgba(52,211,153,0.12)] text-[rgba(110,231,183,0.98)]',
  },
  failed: {
    icon: XCircle,
    label: 'Manual Review',
    tone: 'Extraction unavailable',
    chipClassName:
      'border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.12)] text-[rgba(252,165,165,0.98)]',
  },
};

const ACTIVE_EXTRACTION_STATUSES: DocumentExtractionStatus[] = ['queued', 'processing'];

const fieldClassName =
  'w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-smooth placeholder:text-[var(--color-text-tertiary)] focus:border-[rgba(84,160,255,0.32)] focus:bg-[rgba(255,255,255,0.06)]';
const labelClassName =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Recently';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getIntakeDisplayName(intake: MedicalDocumentIntakeRow): string {
  return intake.source_label?.trim() || intake.file_name;
}

function formatIntakeOrigin(intake: MedicalDocumentIntakeRow): string {
  return intake.intake_source === 'external_import' ? 'Imported batch' : formatFileSize(intake.file_size_bytes);
}

export default function MedicalDocumentIntake() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [intakes, setIntakes] = useState<MedicalDocumentIntakeRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateMedicalFactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [processing, setProcessing] = useState<string | null>(null);
  const [extractingIntakeId, setExtractingIntakeId] = useState<string | null>(null);
  const [seedForm, setSeedForm] = useState<SeedForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'pending_review' | 'all'>('pending_review');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [intakeData, candidateData] = await Promise.all([
        fetchDocumentIntakes(user.id),
        statusFilter === 'pending_review'
          ? fetchPendingCandidates(user.id)
          : fetchAllCandidates(user.id),
      ]);

      setIntakes(intakeData);
      setCandidates(candidateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!user?.id) return;

    const hasActiveExtraction = intakes.some((intake) =>
      ACTIVE_EXTRACTION_STATUSES.includes(intake.extraction_status ?? 'not_started')
    );

    if (!hasActiveExtraction) return;

    const intervalId = window.setInterval(() => {
      loadData();
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [intakes, loadData, user?.id]);

  const triggerExtraction = useCallback(
    async (intakeId: string, options?: { silent?: boolean }) => {
      if (!user?.id) return;

      const silent = options?.silent === true;
      if (!silent) {
        setExtractingIntakeId(intakeId);
        setError('');
      }

      try {
        await startDocumentExtraction(user.id, intakeId);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to start document extraction. Manual review is still available.'
        );
      } finally {
        await loadData();
        if (!silent) {
          setExtractingIntakeId(null);
        }
      }
    },
    [loadData, user?.id]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id || !e.target.files?.length) return;

    const file = e.target.files[0];
    setError('');

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a PDF, image, text, or Word document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.');
      return;
    }

    try {
      setSaving(true);
      const uploadedArtifact = await uploadMedicalDocumentArtifact({
        userId: user.id,
        file,
      });
      const intake = await createDocumentIntake(user.id, {
        file_name: file.name,
        file_type: file.type,
        file_size_bytes: file.size,
        storage_bucket: uploadedArtifact.storage_bucket,
        storage_path: uploadedArtifact.storage_path,
        content_sha256: uploadedArtifact.content_sha256,
      });
      try {
        await startDocumentExtraction(user.id, intake.id);
      } catch (err) {
        setError(
          err instanceof Error
            ? `Document uploaded, but automatic extraction could not start. ${err.message}`
            : 'Document uploaded, but automatic extraction could not start.'
        );
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create intake record');
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSeedCandidate = async () => {
    if (!user?.id || !seedForm) return;

    setSaving(true);
    setError('');

    try {
      await seedCandidateFromIntake(user.id, seedForm.intakeId, {
        category: seedForm.category,
        detail: seedForm.detail,
        extraction_notes: seedForm.notes || undefined,
        evidence: {
          quoted_text: seedForm.evidenceQuote || null,
          page_number: seedForm.evidencePage ? Number(seedForm.evidencePage) : null,
          section_label: seedForm.evidenceSection || null,
          confidence_score: 0.95,
        },
      });
      setSeedForm(null);
      setViewMode('overview');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed candidate');
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async (candidateId: string) => {
    if (!user?.id) return;

    setProcessing(candidateId);
    setError('');

    try {
      await acceptCandidate(user.id, candidateId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept candidate');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (candidateId: string) => {
    if (!user?.id) return;

    setProcessing(candidateId);
    setError('');

    try {
      await rejectCandidate(user.id, candidateId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject candidate');
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = candidates.filter((candidate) => candidate.review_status === 'pending_review')
    .length;
  const readyDocuments = intakes.filter((intake) => intake.candidate_count > 0).length;
  const completedDocuments = intakes.filter((intake) => intake.intake_status === 'completed').length;
  const extractingDocuments = intakes.filter((intake) =>
    ACTIVE_EXTRACTION_STATUSES.includes(intake.extraction_status ?? 'not_started')
  ).length;

  if (viewMode === 'seed' && seedForm) {
    const config = CATEGORY_CONFIGS.find((category) => category.key === seedForm.category)!;

    return (
      <SettingsPageLayout
        title="Review a Document Detail"
        description="Promote one verified detail from an evidence intake into a controlled medical context review queue."
      >
        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        <Card variant="elevated" className="rounded-[30px]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 border-b border-white/8 pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <span className="badge-secondary mb-3 inline-flex">Manual Confirmation</span>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                  Add a structured detail from this document
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Add only details the record states clearly. The candidate stays inactive until you
                  review it in the queue.
                </p>
              </div>

              <div className="surface-intelligence rounded-[24px] px-4 py-4 lg:max-w-[260px]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(133,93,255,0.16)] text-[var(--color-accent-secondary)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Review before merge
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">
                      Accepted details become active context only after confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-5">
                <div>
                  <label className={labelClassName}>Detail Category</label>
                  <select
                    value={seedForm.category}
                    onChange={(e) => {
                      const category = e.target.value as MedicalFactCategory;
                      setSeedForm({
                        ...seedForm,
                        category,
                        detail: buildDefaultDetail(category),
                      });
                    }}
                    className={fieldClassName}
                  >
                    {CATEGORY_CONFIGS.map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {config.fields.map((field) => (
                    <div
                      key={field.key}
                      className={field.type === 'boolean' ? 'sm:col-span-2' : undefined}
                    >
                      <label className={labelClassName}>
                        {field.label}
                        {field.required && (
                          <span className="ml-1 text-[rgba(248,113,113,0.95)]">*</span>
                        )}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          value={(seedForm.detail[field.key] as string) || ''}
                          onChange={(e) =>
                            setSeedForm({
                              ...seedForm,
                              detail: { ...seedForm.detail, [field.key]: e.target.value },
                            })
                          }
                          className={fieldClassName}
                        >
                          <option value="">Select...</option>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'boolean' ? (
                        <label className="surface-panel-soft flex items-center justify-between rounded-[22px] px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                              Mark as true
                            </p>
                            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                              Use this only when the record explicitly confirms the field.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={!!seedForm.detail[field.key]}
                            onChange={(e) =>
                              setSeedForm({
                                ...seedForm,
                                detail: { ...seedForm.detail, [field.key]: e.target.checked },
                              })
                            }
                            className="h-4 w-4 rounded border-white/20 bg-transparent text-[var(--color-accent-primary)]"
                          />
                        </label>
                      ) : (
                        <input
                          type={field.type === 'date' ? 'date' : 'text'}
                          value={(seedForm.detail[field.key] as string) || ''}
                          placeholder={field.placeholder}
                          onChange={(e) =>
                            setSeedForm({
                              ...seedForm,
                              detail: { ...seedForm.detail, [field.key]: e.target.value },
                            })
                          }
                          className={fieldClassName}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className={labelClassName}>Source Note</label>
                  <input
                    type="text"
                    value={seedForm.notes}
                    onChange={(e) => setSeedForm({ ...seedForm, notes: e.target.value })}
                    placeholder="Example: page 2, discharge summary, medication list"
                    className={fieldClassName}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
                  <div>
                    <label className={labelClassName}>Evidence Page</label>
                    <input
                      type="number"
                      min="1"
                      value={seedForm.evidencePage}
                      onChange={(e) =>
                        setSeedForm({ ...seedForm, evidencePage: e.target.value })
                      }
                      placeholder="e.g. 2"
                      className={fieldClassName}
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>Section Label</label>
                    <input
                      type="text"
                      value={seedForm.evidenceSection}
                      onChange={(e) =>
                        setSeedForm({ ...seedForm, evidenceSection: e.target.value })
                      }
                      placeholder="e.g. Assessment, Medication List, Impression"
                      className={fieldClassName}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClassName}>Quoted Evidence</label>
                  <textarea
                    value={seedForm.evidenceQuote}
                    onChange={(e) =>
                      setSeedForm({ ...seedForm, evidenceQuote: e.target.value })
                    }
                    rows={5}
                    placeholder="Paste the exact supporting excerpt from the document when available."
                    className={`${fieldClassName} min-h-[132px] resize-none`}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Card variant="flat" className="rounded-[24px]">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                    Review Rules
                  </h3>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    <p>Capture only facts explicitly stated in the document.</p>
                    <p>Leave uncertain fields blank instead of inferring from context.</p>
                    <p>Keep source notes short so later review stays traceable.</p>
                  </div>
                </Card>

                <Card
                  variant="discovery"
                  glowIntensity="subtle"
                  className="rounded-[24px] border-[rgba(133,93,255,0.14)]"
                >
                  <div className="flex items-start gap-3">
                    <FileSearch className="mt-0.5 h-5 w-5 text-[var(--color-accent-secondary)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Preserve provenance
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        A clean source note makes it easier to compare overlapping facts from
                        different visits or providers.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row">
              <Button onClick={handleSeedCandidate} disabled={saving}>
                {saving ? 'Saving...' : 'Submit for Review'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSeedForm(null);
                  setViewMode('overview');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Clinical Evidence Intakes"
      description="Bring outside clinical records and future imported sources into GutWise through one controlled intake and review workflow."
    >
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <Card variant="elevated" className="rounded-[28px]">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Loading document review workspace...
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card variant="elevated" className="overflow-hidden rounded-[30px]">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <div>
                <span className="badge-secondary mb-3 inline-flex">Evidence Intake</span>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                  Upload records or stage imported batches, then review before merge
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                  Uploaded files stay separate from active personalization. GutWise uses them as
                  reference material until you promote and approve specific details.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <MetricTile
                    label="Documents"
                    value={String(intakes.length)}
                    tone="primary"
                    helper="Tracked in this workspace"
                  />
                  <MetricTile
                    label="Ready"
                    value={String(readyDocuments)}
                    tone="secondary"
                    helper="Contain reviewable details"
                  />
                  <MetricTile
                    label="Extracting"
                    value={String(extractingDocuments)}
                    tone="neutral"
                    helper="Automation currently running"
                  />
                </div>

                <div className="surface-panel-soft mt-5 rounded-[24px] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]">
                      <Layers3 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Workflow boundary
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                        1. Upload the record. 2. Add only the details you want reviewed. 3. Accept
                        confirmed candidates before anything becomes active context.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="surface-panel-soft rounded-[26px] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-[var(--color-text-primary)]">
                      New intake
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                      Accepted: PDF, image, text, DOC, DOCX. Maximum file size 10 MB.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[22px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.02)] p-4">
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    Typical evidence sources include lab results, discharge paperwork, visit summaries,
                    medication instructions, and structured import batches from future connectors.
                  </p>

                    <div className="mt-4 rounded-[18px] border border-[rgba(84,160,255,0.14)] bg-[rgba(84,160,255,0.08)] px-3 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-accent-primary)]">
                        Current extraction coverage
                      </p>
                      <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                        First-pass extraction is now available for text files, PDFs, and DOCX files.
                        Images and legacy DOC uploads still route into manual review until OCR and
                        legacy parsing are added.
                      </p>
                      <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                        When supported extraction finds diagnoses, medications, allergies,
                        diet guidance, procedures, or red-flag history, GutWise now adds them to
                        the review queue automatically instead of waiting for manual seeding.
                      </p>
                    </div>

                  <label className="mt-4 block">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
                      onChange={handleFileSelect}
                      disabled={saving}
                    />
                    <Button
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                    >
                      <Upload className="h-4 w-4" />
                      {saving ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </label>

                  <Button
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={() => navigate('/settings/import-workbench')}
                  >
                    <Layers3 className="h-4 w-4" />
                    Open Import Workbench
                  </Button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                  <ShieldCheck className="h-4 w-4 text-[var(--color-accent-primary)]" />
                  Uploads create review records first, not automatic conclusions.
                </div>
              </div>
            </div>
          </Card>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <Card variant="elevated" className="rounded-[30px]">
              <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-5">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Evidence Intakes
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                    Track uploaded documents and imported review batches, then open manual detail review where needed.
                    </p>
                </div>

                <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--color-text-tertiary)] sm:inline-flex">
                  {completedDocuments} completed
                </div>
              </div>

              {intakes.length === 0 ? (
                <div className="surface-panel-quiet mt-5 rounded-[24px] p-6">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-[var(--color-text-tertiary)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        No documents uploaded yet
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Start with a recent clinical document, then promote only the specific facts
                        you want GutWise to evaluate.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {intakes.map((intake) => {
                    const statusMeta =
                      INTAKE_STATUS_META[intake.intake_status] || INTAKE_STATUS_META.uploaded;
                    const StatusIcon = statusMeta.icon;
                    const extractionStatus =
                      intake.extraction_status ?? ('not_started' as DocumentExtractionStatus);
                    const extractionMeta = EXTRACTION_STATUS_META[extractionStatus];
                    const ExtractionIcon = extractionMeta.icon;
                    const isExtractionActive = ACTIVE_EXTRACTION_STATUSES.includes(extractionStatus);
                    const canRetryExtraction =
                      !!intake.storage_path &&
                      (extractionStatus === 'failed' ||
                        extractionStatus === 'queued' ||
                        extractionStatus === 'not_started' ||
                        extractionStatus === 'completed');
                    const extractionActionLabel =
                      extractionStatus === 'failed'
                        ? 'Retry Extraction'
                        : extractionStatus === 'completed'
                          ? 'Refresh Extraction'
                          : 'Start Extraction';

                    return (
                      <div
                        key={intake.id}
                        className="surface-panel-quiet rounded-[24px] border border-white/8 p-4 transition-smooth hover:border-white/12 hover:bg-white/[0.05]"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] text-[var(--color-text-tertiary)]">
                                <FileText className="h-5 w-5" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                                    {getIntakeDisplayName(intake)}
                                  </p>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${statusMeta.chipClassName}`}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {statusMeta.label}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${extractionMeta.chipClassName}`}
                                  >
                                    <ExtractionIcon className="h-3 w-3" />
                                    {extractionMeta.label}
                                  </span>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-tertiary)]">
                                  <span>{formatIntakeOrigin(intake)}</span>
                                  <span>{statusMeta.tone}</span>
                                  <span>{extractionMeta.tone}</span>
                                  <span>Added {formatDate(intake.created_at)}</span>
                                  {intake.extracted_at && (
                                    <span>Extracted {formatDate(intake.extracted_at)}</span>
                                  )}
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                  <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-3 py-3">
                                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                                      Reviewable details
                                    </p>
                                    <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                                      {intake.candidate_count}
                                    </p>
                                  </div>

                                  <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-3 py-3">
                                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                                      Workflow state
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">
                                      {statusMeta.tone}
                                    </p>
                                  </div>

                                  <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-3 py-3">
                                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                                      Extraction
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">
                                      {extractionMeta.tone}
                                    </p>
                                  </div>
                                </div>

                                {intake.extraction_error && (
                                  <div className="mt-4 rounded-[18px] border border-[rgba(248,113,113,0.16)] bg-[rgba(127,29,29,0.16)] px-3 py-3">
                                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[rgba(252,165,165,0.9)]">
                                      Extraction Note
                                    </p>
                                    <p className="mt-2 text-xs leading-5 text-[rgba(254,202,202,0.95)]">
                                      {intake.extraction_error}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 lg:w-[180px]">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => triggerExtraction(intake.id)}
                              disabled={!canRetryExtraction || isExtractionActive || extractingIntakeId === intake.id}
                            >
                              <RefreshCcw className="h-3.5 w-3.5" />
                              {isExtractionActive || extractingIntakeId === intake.id
                                ? 'Extracting...'
                                : extractionActionLabel}
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => {
                                const defaultCategory = CATEGORY_CONFIGS[0].key;
                                setSeedForm({
                                  intakeId: intake.id,
                                  category: defaultCategory,
                                  detail: buildDefaultDetail(defaultCategory),
                                  notes: '',
                                  evidenceQuote: '',
                                  evidencePage: '',
                                  evidenceSection: '',
                                });
                                setViewMode('seed');
                              }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Detail
                            </Button>

                            <div className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                              <ArrowUpRight className="h-3.5 w-3.5" />
                              Manual review stays available
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <div className="space-y-5">
              <Card variant="flat" className="rounded-[30px]">
                <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-5">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Details to Review
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                        Accept confirmed facts. Reject uncertain or irrelevant ones.
                      </p>
                    </div>

                    {pendingCount > 0 && (
                      <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded-full border border-[rgba(245,158,11,0.22)] bg-[rgba(245,158,11,0.12)] px-2 py-1 text-[11px] font-semibold text-[rgba(245,190,80,0.98)]">
                        {pendingCount}
                      </span>
                    )}
                  </div>

                  <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('pending_review')}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-smooth ${
                        statusFilter === 'pending_review'
                          ? 'bg-[rgba(84,160,255,0.16)] text-[var(--color-accent-primary)]'
                          : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-smooth ${
                        statusFilter === 'all'
                          ? 'bg-[rgba(84,160,255,0.16)] text-[var(--color-accent-primary)]'
                          : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                      }`}
                    >
                      All
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <CandidateReviewList
                    candidates={candidates}
                    intakes={intakes}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    processing={processing}
                  />
                </div>
              </Card>

              <Card
                variant="discovery"
                glowIntensity="subtle"
                className="rounded-[30px] border-[rgba(133,93,255,0.14)]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(133,93,255,0.16)] text-[var(--color-accent-secondary)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      Review Standard
                    </h3>
                    <div className="mt-2 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      <p>Use uploaded records as evidence, not automatic medical interpretation.</p>
                      <p>
                        Supported document extraction can suggest reviewable facts automatically,
                        but nothing enters active context until you confirm it.
                      </p>
                      <p>Add a detail only when you want it to enter structured review.</p>
                      <p>Accepted candidates become usable context only after your confirmation.</p>
                      <p>When documents repeat the same fact, GutWise now merges corroborating overlaps and flags true conflicts for review instead of stacking duplicate queue items.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      )}
    </SettingsPageLayout>
  );
}

function MetricTile({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: 'primary' | 'secondary' | 'neutral';
}) {
  const toneClassName =
    tone === 'primary'
      ? 'border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)]'
      : tone === 'secondary'
        ? 'border-[rgba(133,93,255,0.16)] bg-[rgba(133,93,255,0.08)]'
        : 'border-white/8 bg-[rgba(255,255,255,0.03)]';

  return (
    <div className={`rounded-[22px] border px-4 py-4 ${toneClassName}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{helper}</p>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Card
      variant="flat"
      className="mb-4 rounded-[24px] border-[rgba(248,113,113,0.2)] bg-[rgba(127,29,29,0.2)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[rgba(252,165,165,0.98)]" />
          <p className="text-sm leading-6 text-[rgba(254,202,202,0.98)]">{message}</p>
        </div>

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
