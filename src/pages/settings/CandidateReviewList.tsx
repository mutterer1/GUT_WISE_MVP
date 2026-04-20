import { useState } from 'react';
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
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getCategoryConfig } from './medicalContextFields';
import type { CandidateMedicalFactRow, CandidateReviewStatus } from '../../types/medicalContext';

interface CandidateReviewListProps {
  candidates: CandidateMedicalFactRow[];
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

function formatReviewedDate(value: string | null | undefined): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CandidateReviewList({
  candidates,
  onAccept,
  onReject,
  processing,
}: CandidateReviewListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
              Upload a document or manually seed a candidate detail to start the review queue.
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

        return (
          <Card
            key={candidate.id}
            padding="none"
            variant={isExpanded ? 'elevated' : 'flat'}
            className="overflow-hidden rounded-[26px] border border-white/8"
          >
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                    <div className="flex flex-wrap items-center gap-2">
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
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-3 py-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                          Category
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">
                          {config.label}
                        </p>
                      </div>

                      <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-3 py-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                          Review State
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">
                          {statusMeta.tone}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>

                {isPending && (
                  <div className="flex flex-col gap-2 lg:w-[170px]">
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
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                        Extracted Fields
                      </p>

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

                      {candidate.extraction_notes && (
                        <div className="surface-panel-soft mt-4 rounded-[22px] px-4 py-4">
                          <div className="flex items-start gap-3">
                            <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-text-tertiary)]" />
                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                                Source Note
                              </p>
                              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                {candidate.extraction_notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
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
                              Confirm only what the record states clearly. Leave ambiguous details
                              out of active context.
                            </p>
                          </div>
                        </div>
                      </Card>

                      <Card variant="flat" className="rounded-[24px]">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                          Traceability
                        </p>
                        <div className="mt-4 space-y-3 text-sm text-[var(--color-text-secondary)]">
                          <div className="flex items-start gap-3">
                            <Link2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                            <span>Source path: {formatSource(candidate.extraction_source)}</span>
                          </div>

                          {candidate.reviewed_at && (
                            <div className="flex items-start gap-3">
                              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                              <span>Reviewed {formatReviewedDate(candidate.reviewed_at)}</span>
                            </div>
                          )}
                        </div>
                      </Card>
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
