import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Clock3,
  FileSearch,
  Pill,
  ShieldCheck,
  Sparkles,
  Utensils,
  X,
  XCircle,
} from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import {
  acceptReferenceReviewCandidate,
  fetchReferenceReviewCandidates,
  rejectReferenceReviewCandidate,
} from '../../services/referenceReviewService';
import type {
  FoodReferenceCandidateDetail,
  MedicationReferenceCandidateDetail,
  ReferenceReviewCandidateRow,
} from '../../types/intelligence';

const STATUS_META = {
  pending_review: {
    label: 'Pending',
    className:
      'border-[rgba(245,158,11,0.22)] bg-[rgba(245,158,11,0.12)] text-[rgba(245,190,80,0.98)]',
  },
  accepted: {
    label: 'Accepted',
    className:
      'border-[rgba(52,211,153,0.22)] bg-[rgba(52,211,153,0.12)] text-[rgba(110,231,183,0.98)]',
  },
  rejected: {
    label: 'Rejected',
    className:
      'border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.12)] text-[rgba(252,165,165,0.98)]',
  },
  merged: {
    label: 'Merged',
    className:
      'border-[rgba(84,160,255,0.22)] bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]',
  },
} as const;

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Recently';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatKind(value: ReferenceReviewCandidateRow['candidate_kind']): string {
  return value === 'food' ? 'Food' : 'Medication';
}

function renderDetailList(candidate: ReferenceReviewCandidateRow): Array<{ label: string; value: string }> {
  if (candidate.candidate_kind === 'food') {
    const detail = candidate.detail as unknown as FoodReferenceCandidateDetail;
    const rows: Array<{ label: string; value: string }> = [];

    if (Array.isArray(detail.tags) && detail.tags.length > 0) {
      rows.push({ label: 'Observed tags', value: detail.tags.join(', ') });
    }
    if (typeof detail.estimated_calories === 'number') {
      rows.push({ label: 'Estimated calories', value: `${detail.estimated_calories}` });
    }
    if (detail.portion_size) {
      rows.push({ label: 'Observed portion', value: detail.portion_size });
    }

    return rows;
  }

  const detail = candidate.detail as unknown as MedicationReferenceCandidateDetail;
  const rows: Array<{ label: string; value: string }> = [];

  if (detail.dosage) rows.push({ label: 'Observed dosage', value: detail.dosage });
  if (detail.route) rows.push({ label: 'Observed route', value: detail.route });
  if (detail.medication_type) {
    rows.push({ label: 'Medication type', value: detail.medication_type.replace(/_/g, ' ') });
  }
  if (detail.reason_for_use) rows.push({ label: 'Reason for use', value: detail.reason_for_use });
  if (detail.regimen_status) {
    rows.push({ label: 'Regimen', value: detail.regimen_status.replace(/_/g, ' ') });
  }
  if (detail.timing_context) {
    rows.push({ label: 'Timing context', value: detail.timing_context.replace(/_/g, ' ') });
  }

  return rows;
}

export default function ReferenceReview() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<ReferenceReviewCandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending_review' | 'all'>('pending_review');

  const loadCandidates = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await fetchReferenceReviewCandidates(
        user.id,
        statusFilter === 'pending_review' ? 'pending_review' : undefined
      );
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reference review queue.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, user?.id]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleAccept = async (candidateId: string) => {
    if (!user?.id) return;

    setProcessing(candidateId);
    setError('');

    try {
      await acceptReferenceReviewCandidate(user.id, candidateId);
      await loadCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept reference candidate.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (candidateId: string) => {
    if (!user?.id) return;

    setProcessing(candidateId);
    setError('');

    try {
      await rejectReferenceReviewCandidate(user.id, candidateId);
      await loadCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject reference candidate.');
    } finally {
      setProcessing(null);
    }
  };

  const summary = useMemo(() => {
    const pending = candidates.filter((candidate) => candidate.review_status === 'pending_review').length;
    const foods = candidates.filter((candidate) => candidate.candidate_kind === 'food').length;
    const medications = candidates.filter((candidate) => candidate.candidate_kind === 'medication').length;
    return { pending, foods, medications };
  }, [candidates]);

  return (
    <SettingsPageLayout
      title="Reference Review Queue"
      description="Review custom foods and medications that did not match the current live reference tables before promoting them into shared intelligence."
    >
      {error && (
        <Card variant="flat" className="rounded-[24px] border-[rgba(248,113,113,0.18)] bg-[rgba(248,113,113,0.08)]">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 text-[rgba(252,165,165,0.98)]" />
            <p className="text-sm leading-6 text-[var(--color-text-primary)]">{error}</p>
          </div>
        </Card>
      )}

      {loading ? (
        <Card variant="elevated" className="rounded-[28px]">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Loading reference review queue...
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card variant="elevated" className="overflow-hidden rounded-[30px]">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div>
                <span className="badge-secondary mb-3 inline-flex">Reviewable Intake Loop</span>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                  Let the reference library learn from your own entries
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                  When a food or medication does not match the current reference tables, GutWise
                  now queues it here for review instead of silently leaving it as raw text forever.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <MetricTile
                    label="Pending"
                    value={String(summary.pending)}
                    helper="Waiting for review"
                    tone="primary"
                  />
                  <MetricTile
                    label="Foods"
                    value={String(summary.foods)}
                    helper="Food candidates in this view"
                    tone="secondary"
                  />
                  <MetricTile
                    label="Medications"
                    value={String(summary.medications)}
                    helper="Medication candidates in this view"
                    tone="neutral"
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <Card
                  variant="discovery"
                  glowIntensity="subtle"
                  className="rounded-[26px] border-[rgba(133,93,255,0.14)]"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 text-[var(--color-accent-secondary)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Review standard
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Accept only entries you want promoted into the live autocomplete and
                        normalization layer.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card variant="flat" className="rounded-[26px]">
                  <div className="flex items-start gap-3">
                    <FileSearch className="mt-0.5 h-5 w-5 text-[var(--color-accent-primary)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        What acceptance does
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Accepted items are promoted into the live reference table and exact-matching
                        old logs are backfilled to that new reference row.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              variant={statusFilter === 'pending_review' ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter('pending_review')}
            >
              <Clock3 className="h-4 w-4" />
              Pending only
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter('all')}
            >
              <ShieldCheck className="h-4 w-4" />
              All reviewed states
            </Button>
          </div>

          {candidates.length === 0 ? (
            <Card variant="flat" className="rounded-[26px]">
              <div className="flex items-start gap-3 py-1">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)] text-[var(--color-text-tertiary)]">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    No reference candidates in this view
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Custom foods and medications that miss the live reference tables will appear
                    here automatically.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => {
                const statusMeta = STATUS_META[candidate.review_status];
                const isPending = candidate.review_status === 'pending_review';
                const isProcessing = processing === candidate.id;
                const detailRows = renderDetailList(candidate);
                const KindIcon = candidate.candidate_kind === 'food' ? Utensils : Pill;

                return (
                  <Card
                    key={candidate.id}
                    variant={isPending ? 'elevated' : 'flat'}
                    className="rounded-[28px]"
                  >
                    <div className="space-y-5">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)] text-[var(--color-text-tertiary)]">
                              <KindIcon className="h-4 w-4" />
                            </span>
                            <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                              {candidate.display_name}
                            </p>
                            <span className="inline-flex items-center rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                              {formatKind(candidate.candidate_kind)}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${statusMeta.className}`}
                            >
                              {statusMeta.label}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-tertiary)]">
                            <span>Seen {candidate.times_seen} time{candidate.times_seen === 1 ? '' : 's'}</span>
                            <span>Last seen {formatDate(candidate.last_seen_at)}</span>
                            <span>Source: {candidate.source_log_type.replace(/_/g, ' ')}</span>
                          </div>
                        </div>

                        {isPending && (
                          <div className="grid grid-cols-2 gap-2 xl:w-[196px] xl:grid-cols-1">
                            <Button
                              size="sm"
                              onClick={() => handleAccept(candidate.id)}
                              disabled={isProcessing}
                              className="w-full"
                            >
                              <Check className="h-3.5 w-3.5" />
                              {isProcessing ? 'Working...' : 'Accept'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(candidate.id)}
                              disabled={isProcessing}
                              className="w-full border-[rgba(248,113,113,0.18)] text-[rgba(252,165,165,0.98)] hover:bg-[rgba(248,113,113,0.08)]"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>

                      {detailRows.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {detailRows.map((row) => (
                            <div
                              key={row.label}
                              className="rounded-[20px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-4 py-4"
                            >
                              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                                {row.label}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
                                {row.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {candidate.review_notes && (
                        <div className="rounded-[20px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                          {candidate.review_notes}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
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
        ? 'border-[rgba(133,93,255,0.18)] bg-[rgba(133,93,255,0.08)]'
        : 'border-white/8 bg-white/[0.03]';

  return (
    <div className={`rounded-[24px] border px-4 py-4 ${toneClassName}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{helper}</p>
    </div>
  );
}