import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  X,
  Clock3,
  FileText,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Link2,
  Quote,
  FolderOpen,
  ScanSearch,
  AlertTriangle,
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCandidateReviewEvidenceItems } from '../../services/medicalContextService';
import { getCategoryConfig } from './medicalContextFields';
import type {
  CandidateMedicalFactRow,
  CandidateReviewEvidenceItem,
  CandidateReviewStatus,
  MedicalDocumentIntakeRow,
} from '../../types/medicalContext';

interface CandidateReviewListProps {
  candidates: CandidateMedicalFactRow[];
  intakes: MedicalDocumentIntakeRow[];
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  processing: string | null;
}

const STATUS_META: Record<
  CandidateReviewStatus,
  {
    label: string;
    tone: string;
    className: string;
    icon: typeof Clock3;
  }
> = {
  pending_review: {
    label: 'Pending',
    tone: 'Awaiting confirmation',
    className:
      'border-[rgba(245,158,11,0.22)] bg-[rgba(245,158,11,0.12)] text-[rgba(245,190,80,0.98)]',
    icon: Clock3,
  },
  accepted: {
    label: 'Accepted',
    tone: 'Ready for context merge',
    className:
      'border-[rgba(52,211,153,0.22)] bg-[rgba(52,211,153,0.12)] text-[rgba(110,231,183,0.98)]',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    tone: 'Excluded from context',
    className:
      'border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.12)] text-[rgba(252,165,165,0.98)]',
    icon: XCircle,
  },
  merged: {
    label: 'Merged',
    tone: 'Now active in context',
    className:
      'border-[rgba(84,160,255,0.22)] bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]',
    icon: ShieldCheck,
  },
};

function formatSource(source: string): string {
  return source.replace(/_/g, ' ');
}

function formatIntakeDisplayName(intake: MedicalDocumentIntakeRow | null): string {
  if (!intake) return 'Source unavailable';
  return intake.source_label?.trim() || intake.file_name;
}

function formatIntakeOrigin(intake: MedicalDocumentIntakeRow | null): string {
  if (!intake) return 'Evidence source unavailable';
  return intake.intake_source === 'external_import' ? 'Imported batch' : 'Uploaded document';
}

function formatReviewedDate(value: string | null | undefined): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatConfidence(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Unscored';
  return `${Math.round(value * 100)}%`;
}

function formatEvidenceKind(value: string): string {
  return value.replace(/_/g, ' ');
}

function formatPageNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Page unknown';
  return `Page ${value}`;
}

function formatExtractorLabel(value: string | null | undefined): string {
  if (!value) return 'Evidence segment';
  return value
    .replace(/^auto_segment:/, '')
    .replace(/_/g, ' ')
    .trim();
}

function parseStructuredCandidateNotes(notes: string | null | undefined): {
  generalNote: string | null;
  mergeNotes: string[];
  conflictNotes: string[];
  importMetaNotes: string[];
  importCorrectionNotes: string[];
} {
  if (!notes) {
    return {
      generalNote: null,
      mergeNotes: [],
      conflictNotes: [],
      importMetaNotes: [],
      importCorrectionNotes: [],
    };
  }

  const lines = notes
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const generalLines: string[] = [];
  const mergeNotes: string[] = [];
  const conflictNotes: string[] = [];
  const importMetaNotes: string[] = [];
  const importCorrectionNotes: string[] = [];

  for (const line of lines) {
    if (line.startsWith('auto_merge:')) {
      mergeNotes.push(line.replace(/^auto_merge:\s*/, '').trim());
      continue;
    }

    if (line.startsWith('auto_conflict:')) {
      conflictNotes.push(line.replace(/^auto_conflict:\s*/, '').trim());
      continue;
    }

    if (line.startsWith('import_meta:')) {
      importMetaNotes.push(line.replace(/^import_meta:\s*/, '').trim());
      continue;
    }

    if (line.startsWith('import_correction:')) {
      importCorrectionNotes.push(line.replace(/^import_correction:\s*/, '').trim());
      continue;
    }

    generalLines.push(line);
  }

  return {
    generalNote: generalLines.length > 0 ? generalLines.join('\n') : null,
    mergeNotes,
    conflictNotes,
    importMetaNotes,
    importCorrectionNotes,
  };
}

function getSourceMetadataRecord(
  intake: MedicalDocumentIntakeRow | null
): Record<string, unknown> | null {
  if (!intake?.source_metadata || typeof intake.source_metadata !== 'object' || Array.isArray(intake.source_metadata)) {
    return null;
  }

  return intake.source_metadata as Record<string, unknown>;
}

function getMetadataText(
  metadata: Record<string, unknown> | null,
  key: string
): string | null {
  if (!metadata) return null;
  const value = metadata[key];

  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function formatCategoryBreakdown(metadata: Record<string, unknown> | null): string | null {
  if (!metadata) return null;
  const breakdown = metadata.category_breakdown;
  if (!breakdown || typeof breakdown !== 'object' || Array.isArray(breakdown)) return null;

  const parts = Object.entries(breakdown as Record<string, unknown>)
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
    .map(([key, value]) => `${formatSource(key)} (${value})`);

  return parts.length > 0 ? parts.join(', ') : null;
}

function formatConfidencePercent(value: string | null): string | null {
  if (!value) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;
  return `${Math.round(numeric * 100)}%`;
}

export default function CandidateReviewList({
  candidates,
  intakes,
  onAccept,
  onReject,
  processing,
}: CandidateReviewListProps) {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewEvidenceByCandidate, setReviewEvidenceByCandidate] = useState<
    Record<string, CandidateReviewEvidenceItem[]>
  >({});
  const [reviewEvidenceErrorByCandidate, setReviewEvidenceErrorByCandidate] = useState<
    Record<string, string>
  >({});
  const [loadingEvidenceId, setLoadingEvidenceId] = useState<string | null>(null);

  const intakeById = useMemo(
    () => new Map(intakes.map((intake) => [intake.id, intake])),
    [intakes]
  );

  useEffect(() => {
    if (!user?.id || !expandedId) return;
    if (reviewEvidenceByCandidate[expandedId]) return;
    if (loadingEvidenceId === expandedId) return;

    const candidate = candidates.find((item) => item.id === expandedId);
    if (!candidate) return;

    let isCancelled = false;
    setLoadingEvidenceId(expandedId);

    fetchCandidateReviewEvidenceItems(user.id, candidate)
      .then((items) => {
        if (isCancelled) return;
        setReviewEvidenceByCandidate((current) => ({
          ...current,
          [candidate.id]: items,
        }));
        setReviewEvidenceErrorByCandidate((current) => {
          if (!(candidate.id in current)) return current;
          const next = { ...current };
          delete next[candidate.id];
          return next;
        });
      })
      .catch((error) => {
        if (isCancelled) return;
        setReviewEvidenceErrorByCandidate((current) => ({
          ...current,
          [candidate.id]:
            error instanceof Error ? error.message : 'Failed to load candidate evidence',
        }));
      })
      .finally(() => {
        if (!isCancelled) {
          setLoadingEvidenceId((current) => (current === candidate.id ? null : current));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [candidates, expandedId, loadingEvidenceId, reviewEvidenceByCandidate, user?.id]);

  if (candidates.length === 0) {
    return (
      <Card variant="flat" className="rounded-[26px]">
        <div className="flex items-start gap-3 py-1">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)] text-[var(--color-text-tertiary)]">
            <Clock3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              No details waiting for review
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Upload a document, queue an import batch, or manually seed a candidate detail to start the review queue.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {candidates.map((candidate) => {
        const config = getCategoryConfig(candidate.category);
        const displayValue =
          (candidate.detail as Record<string, string>)[config.displayField] || 'Unnamed detail';
        const isPending = candidate.review_status === 'pending_review';
        const isExpanded = expandedId === candidate.id;
        const isProcessing = processing === candidate.id;
        const statusMeta = STATUS_META[candidate.review_status];
        const StatusIcon = statusMeta.icon;
        const reviewEvidence = reviewEvidenceByCandidate[candidate.id] ?? [];
        const evidenceLoadError = reviewEvidenceErrorByCandidate[candidate.id] ?? '';
        const isEvidenceLoading = loadingEvidenceId === candidate.id;
        const structuredNotes = parseStructuredCandidateNotes(candidate.extraction_notes);
        const sourceIntake =
          reviewEvidence[0]?.intake ??
          (candidate.source_document_id ? intakeById.get(candidate.source_document_id) ?? null : null);
        const sourceMetadata = getSourceMetadataRecord(sourceIntake);
        const importDetectedFormat = getMetadataText(sourceMetadata, 'detected_format');
        const importBatchCount = getMetadataText(sourceMetadata, 'imported_item_count');
        const correctedItemCount = getMetadataText(sourceMetadata, 'corrected_item_count');
        const importerLabel = getMetadataText(sourceMetadata, 'importer');
        const templateName = getMetadataText(sourceMetadata, 'template_name');
        const importFileName = getMetadataText(sourceMetadata, 'import_file_name');
        const importFileFormat = getMetadataText(sourceMetadata, 'import_file_format');
        const sourceProfileLabel = getMetadataText(sourceMetadata, 'source_profile_label');
        const sourceSystemLabel = getMetadataText(sourceMetadata, 'source_system_label');
        const parseStrategyLabel = getMetadataText(sourceMetadata, 'parse_strategy_label');
        const sourceProfileConfidence = getMetadataText(
          sourceMetadata,
          'source_profile_confidence_avg'
        );
        const effectiveImportKind = getMetadataText(sourceMetadata, 'effective_import_kind');
        const categoryBreakdown = formatCategoryBreakdown(sourceMetadata);

        return (
          <Card
            key={candidate.id}
            padding="none"
            variant={isExpanded ? 'elevated' : 'flat'}
            className="overflow-hidden rounded-[26px] border border-white/8"
          >
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : candidate.id)}
                  className="flex min-w-0 flex-1 items-start gap-4 text-left"
                >
                  <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)] text-[var(--color-text-tertiary)]">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                        {displayValue}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${statusMeta.className}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-tertiary)]">
                      <span>{config.label}</span>
                      <span>{statusMeta.tone}</span>
                      <span>Source: {formatSource(candidate.extraction_source)}</span>
                      {sourceIntake?.intake_source === 'external_import' && (
                        <span className="text-[var(--color-accent-primary)]">Imported review batch</span>
                      )}
                      <span>
                        Evidence: {candidate.evidence_count ?? 0}{' '}
                        {(candidate.evidence_count ?? 0) === 1 ? 'link' : 'links'}
                      </span>
                      {structuredNotes.importCorrectionNotes.length > 0 && (
                        <span className="text-[var(--color-accent-primary)]">
                          Corrected before queueing
                        </span>
                      )}
                      {structuredNotes.conflictNotes.length > 0 && (
                        <span className="text-[rgba(245,190,80,0.98)]">Conflict flagged</span>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                      <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-3 py-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                          Evidence Basis
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-[var(--color-text-primary)]">
                          {(candidate.evidence_count ?? 0) > 0
                            ? 'Quoted source evidence attached'
                            : 'Waiting for review evidence'}
                        </p>
                      </div>

                      <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-3 py-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                          Review State
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-[var(--color-text-primary)]">
                          {statusMeta.tone}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>

                {isPending && (
                  <div className="grid grid-cols-2 gap-2 xl:w-[196px] xl:grid-cols-1">
                    <Button
                      size="sm"
                      onClick={() => onAccept(candidate.id)}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {isProcessing ? 'Working...' : 'Accept'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReject(candidate.id)}
                      disabled={isProcessing}
                      className="w-full border-[rgba(248,113,113,0.18)] text-[rgba(252,165,165,0.98)] hover:bg-[rgba(248,113,113,0.08)]"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="mt-5 border-t border-white/8 pt-5">
                  <div className="space-y-5">
                    <div className="rounded-[24px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-4 py-4 sm:px-5">
                      <div className="flex flex-col gap-3 border-b border-white/8 pb-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]">
                            <ScanSearch className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                              Evidence basis
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                              {candidate.extraction_source === 'external_import'
                                ? 'Review the imported row, suggested medication context, and linked evidence before promoting this detail into active context.'
                                : 'Review the supporting document evidence first, then confirm whether the extracted detail is stated clearly enough to enter active context.'}
                            </p>
                          </div>
                        </div>

                        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                          Candidate confidence {formatConfidence(candidate.extraction_confidence)}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                        <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                          <div className="flex items-start gap-3">
                            <FolderOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                            <div className="min-w-0">
                              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                                Source intake
                              </p>
                              <p className="mt-2 truncate text-sm font-medium text-[var(--color-text-primary)]">
                                {formatIntakeDisplayName(sourceIntake)}
                              </p>
                              {sourceIntake && (
                                <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">
                                  {formatIntakeOrigin(sourceIntake)} | Added{' '}
                                  {formatReviewedDate(sourceIntake.created_at)} |{' '}
                                  {formatSource(sourceIntake.intake_status)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                          <div className="flex items-start gap-3">
                            <Link2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                                Linked evidence
                              </p>
                              <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">
                                {candidate.evidence_count ?? 0}{' '}
                                {(candidate.evidence_count ?? 0) === 1 ? 'evidence item' : 'evidence items'}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">
                                Section, quote, and page context are shown below when available.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {isEvidenceLoading ? (
                          <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                            Loading linked evidence...
                          </div>
                        ) : evidenceLoadError ? (
                          <div className="rounded-[18px] border border-[rgba(248,113,113,0.16)] bg-[rgba(127,29,29,0.16)] px-4 py-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[rgba(252,165,165,0.98)]" />
                              <div>
                                <p className="text-sm font-medium text-[rgba(254,202,202,0.98)]">
                                  Evidence could not be loaded
                                </p>
                                <p className="mt-1 text-sm leading-6 text-[rgba(254,202,202,0.9)]">
                                  {evidenceLoadError}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : reviewEvidence.length === 0 ? (
                          <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                              No linked evidence was found for this candidate.
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                              Review the extraction note carefully or add manual evidence before
                              accepting if you want this detail to stay traceable.
                            </p>
                          </div>
                        ) : (
                          reviewEvidence.map((item) => {
                            const quote =
                              item.segment?.quoted_text ||
                              item.evidence.cited_text ||
                              '[No quoted evidence stored]';
                            const pageNumber =
                              item.segment?.page_number ?? item.evidence.page_number ?? null;
                            const confidence =
                              item.segment?.confidence_score ?? item.evidence.confidence_score;

                            return (
                              <div
                                key={item.evidence.id}
                                className="rounded-[20px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                                    {formatEvidenceKind(item.evidence.evidence_kind)}
                                  </span>
                                  {item.segment?.section_label && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                                      {item.segment.section_label}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                                    {formatPageNumber(pageNumber)}
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                                    Segment confidence {formatConfidence(confidence)}
                                  </span>
                                </div>

                                <div className="mt-3 flex items-start gap-3">
                                  <Quote className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                  <p className="text-sm leading-6 text-[var(--color-text-primary)]">
                                    {quote}
                                  </p>
                                </div>

                                {(item.segment?.extractor_label ||
                                  (item.segment?.span_start != null &&
                                    item.segment?.span_end != null)) && (
                                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-tertiary)]">
                                    {item.segment?.extractor_label && (
                                      <span>
                                        Extractor: {formatExtractorLabel(item.segment.extractor_label)}
                                      </span>
                                    )}
                                    {item.segment?.span_start != null &&
                                      item.segment?.span_end != null && (
                                        <span>
                                          Span {item.segment.span_start}-{item.segment.span_end}
                                        </span>
                                      )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
                      <div>
                        {(structuredNotes.importMetaNotes.length > 0 ||
                          structuredNotes.importCorrectionNotes.length > 0) && (
                          <div className="mb-5 space-y-3">
                            {structuredNotes.importMetaNotes.length > 0 && (
                              <div className="rounded-[20px] border border-[rgba(84,160,255,0.16)] bg-[rgba(84,160,255,0.08)] px-4 py-4">
                                <div className="flex items-start gap-3">
                                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-accent-primary)]">
                                      Import Metadata
                                    </p>
                                    <div className="mt-2 space-y-2 text-sm leading-6 text-[var(--color-text-primary)]">
                                      {structuredNotes.importMetaNotes.map((note) => (
                                        <p key={`import-meta-${note}`}>{note}</p>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {structuredNotes.importCorrectionNotes.length > 0 && (
                              <div className="rounded-[20px] border border-[rgba(133,93,255,0.18)] bg-[rgba(133,93,255,0.08)] px-4 py-4">
                                <div className="flex items-start gap-3">
                                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-secondary)]" />
                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-accent-secondary)]">
                                      Import Corrections
                                    </p>
                                    <div className="mt-2 space-y-2 text-sm leading-6 text-[var(--color-text-primary)]">
                                      {structuredNotes.importCorrectionNotes.map((note) => (
                                        <p key={`import-correction-${note}`}>{note}</p>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {(structuredNotes.mergeNotes.length > 0 ||
                          structuredNotes.conflictNotes.length > 0) && (
                          <div className="mb-5 space-y-3">
                            {structuredNotes.mergeNotes.map((note) => (
                              <div
                                key={`merge-${note}`}
                                className="rounded-[20px] border border-[rgba(84,160,255,0.16)] bg-[rgba(84,160,255,0.08)] px-4 py-4"
                              >
                                <div className="flex items-start gap-3">
                                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-accent-primary)]">
                                      Merge Resolution
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
                                      {note}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {structuredNotes.conflictNotes.map((note) => (
                              <div
                                key={`conflict-${note}`}
                                className="rounded-[20px] border border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.08)] px-4 py-4"
                              >
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[rgba(245,190,80,0.98)]" />
                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[rgba(245,190,80,0.98)]">
                                      Conflict Watch
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
                                      {note}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                            Extracted Fields
                          </p>
                          {structuredNotes.generalNote && (
                            <span className="hidden rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] sm:inline-flex">
                              Source note included
                            </span>
                          )}
                        </div>

                        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {config.fields.map((field) => {
                            const value = (candidate.detail as Record<string, unknown>)[field.key];
                            if (value === null || value === undefined || value === '') return null;

                            const display = Array.isArray(value) ? value.join(', ') : String(value);

                            return (
                              <div
                                key={field.key}
                                className="rounded-[20px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-4 py-4"
                              >
                                <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                                  {field.label}
                                </dt>
                                <dd className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
                                  {field.type === 'boolean' ? (value ? 'Yes' : 'No') : display}
                                </dd>
                              </div>
                            );
                          })}
                        </dl>

                        {structuredNotes.generalNote && (
                          <div className="surface-panel-soft mt-4 rounded-[22px] px-4 py-4">
                            <div className="flex items-start gap-3">
                              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-text-tertiary)]" />
                              <div>
                                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                                  Extraction Note
                                </p>
                                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                  {structuredNotes.generalNote}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <Card variant="flat" className="rounded-[24px]">
                          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                            Traceability
                          </p>
                          <div className="mt-4 space-y-3 text-sm text-[var(--color-text-secondary)]">
                            <div className="flex items-start gap-3">
                              <Link2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                              <span>Source path: {formatSource(candidate.extraction_source)}</span>
                            </div>

                            <div className="flex items-start gap-3">
                              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                              <span>
                                Source intake: {formatIntakeDisplayName(sourceIntake)}
                              </span>
                            </div>

                            <div className="flex items-start gap-3">
                              <ScanSearch className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                              <span>
                                Extraction confidence: {formatConfidence(candidate.extraction_confidence)}
                              </span>
                            </div>

                            {importDetectedFormat && (
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>Import format: {formatSource(importDetectedFormat)}</span>
                              </div>
                            )}

                            {importerLabel && (
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>Importer: {formatSource(importerLabel)}</span>
                              </div>
                            )}

                            {templateName && (
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>Template: {templateName}</span>
                              </div>
                            )}

                            {importFileName && (
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>
                                  Import file: {importFileName}
                                  {importFileFormat ? ` (${formatSource(importFileFormat)})` : ''}
                                </span>
                              </div>
                            )}

                            {sourceProfileLabel && (
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>Source profile: {sourceProfileLabel}</span>
                              </div>
                            )}

                            {sourceSystemLabel && (
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>Source system: {sourceSystemLabel}</span>
                              </div>
                            )}

                            {parseStrategyLabel && (
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>Parse strategy: {parseStrategyLabel}</span>
                              </div>
                            )}

                            {sourceProfileConfidence && (
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>
                                  Source profile confidence:{' '}
                                  {formatConfidencePercent(sourceProfileConfidence)}
                                </span>
                              </div>
                            )}

                            {importBatchCount && (
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>Batch size: {importBatchCount} items</span>
                              </div>
                            )}

                            {correctedItemCount && (
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>Corrected before queueing: {correctedItemCount} items</span>
                              </div>
                            )}

                            {categoryBreakdown && (
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>Category mix: {categoryBreakdown}</span>
                              </div>
                            )}

                            {effectiveImportKind && (
                              <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>Effective import kind: {formatSource(effectiveImportKind)}</span>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                              <span>
                                Attached evidence: {candidate.evidence_count ?? 0}{' '}
                                {(candidate.evidence_count ?? 0) === 1 ? 'item' : 'items'}
                              </span>
                            </div>

                            {candidate.reviewed_at && (
                              <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                                <span>Reviewed {formatReviewedDate(candidate.reviewed_at)}</span>
                              </div>
                            )}
                          </div>
                        </Card>

                        <Card
                          variant="discovery"
                          glowIntensity="subtle"
                          className="rounded-[24px] border-[rgba(133,93,255,0.14)]"
                        >
                          <div className="flex items-start gap-3">
                            <Sparkles className="mt-0.5 h-5 w-5 text-[var(--color-accent-secondary)]" />
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                                Review standard
                              </p>
                              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                Let the quoted evidence lead the decision. Confirm only what the
                                record states clearly, and reject anything that remains ambiguous
                                even if the extracted fields look plausible.
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
