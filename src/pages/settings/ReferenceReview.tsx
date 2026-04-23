import type { InputHTMLAttributes } from 'react';
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
  readFoodCandidateDetail,
  refreshFoodReferenceCandidateEnrichment,
  rejectReferenceReviewCandidate,
  updateFoodReferenceCandidateDetail,
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

const ENRICHMENT_STATUS_META = {
  not_started: {
    label: 'Pending lookup',
    className:
      'border-[rgba(148,163,184,0.18)] bg-[rgba(148,163,184,0.08)] text-[var(--color-text-tertiary)]',
  },
  enriched: {
    label: 'Source matched',
    className:
      'border-[rgba(52,211,153,0.22)] bg-[rgba(52,211,153,0.12)] text-[rgba(110,231,183,0.98)]',
  },
  fallback: {
    label: 'Fallback estimate',
    className:
      'border-[rgba(245,158,11,0.22)] bg-[rgba(245,158,11,0.12)] text-[rgba(245,190,80,0.98)]',
  },
  failed: {
    label: 'Lookup failed',
    className:
      'border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.12)] text-[rgba(252,165,165,0.98)]',
  },
} as const;

interface FoodDetailDraft {
  suggested_food_category: string;
  suggested_brand_name: string;
  suggested_common_aliases: string;
  suggested_serving_label: string;
  suggested_calories_kcal: string;
  suggested_protein_g: string;
  suggested_fat_g: string;
  suggested_carbs_g: string;
  suggested_fiber_g: string;
  suggested_sugar_g: string;
  suggested_sodium_mg: string;
  suggested_ingredient_names: string;
  suggested_default_signals: string;
}

function numberToDraft(value: number | null): string {
  return typeof value === 'number' ? String(value) : '';
}

function parseDraftNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toCommaSeparated(values: string[]): string {
  return values.join(', ');
}

function parseCommaSeparated(value: string): string[] {
  return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
}

function createFoodDetailDraft(detail: FoodReferenceCandidateDetail): FoodDetailDraft {
  return {
    suggested_food_category: detail.suggested_food_category ?? '',
    suggested_brand_name: detail.suggested_brand_name ?? '',
    suggested_common_aliases: toCommaSeparated(detail.suggested_common_aliases),
    suggested_serving_label: detail.suggested_serving_label ?? '',
    suggested_calories_kcal: numberToDraft(detail.suggested_calories_kcal),
    suggested_protein_g: numberToDraft(detail.suggested_protein_g),
    suggested_fat_g: numberToDraft(detail.suggested_fat_g),
    suggested_carbs_g: numberToDraft(detail.suggested_carbs_g),
    suggested_fiber_g: numberToDraft(detail.suggested_fiber_g),
    suggested_sugar_g: numberToDraft(detail.suggested_sugar_g),
    suggested_sodium_mg: numberToDraft(detail.suggested_sodium_mg),
    suggested_ingredient_names: toCommaSeparated(detail.suggested_ingredient_names),
    suggested_default_signals: toCommaSeparated(detail.suggested_default_signals),
  };
}

function applyFoodDetailDraft(
  base: FoodReferenceCandidateDetail,
  draft: FoodDetailDraft
): FoodReferenceCandidateDetail {
  return {
    ...base,
    suggested_food_category: draft.suggested_food_category.trim() || null,
    suggested_brand_name: draft.suggested_brand_name.trim() || null,
    suggested_common_aliases: parseCommaSeparated(draft.suggested_common_aliases),
    suggested_serving_label: draft.suggested_serving_label.trim() || null,
    suggested_calories_kcal: parseDraftNumber(draft.suggested_calories_kcal),
    suggested_protein_g: parseDraftNumber(draft.suggested_protein_g),
    suggested_fat_g: parseDraftNumber(draft.suggested_fat_g),
    suggested_carbs_g: parseDraftNumber(draft.suggested_carbs_g),
    suggested_fiber_g: parseDraftNumber(draft.suggested_fiber_g),
    suggested_sugar_g: parseDraftNumber(draft.suggested_sugar_g),
    suggested_sodium_mg: parseDraftNumber(draft.suggested_sodium_mg),
    suggested_ingredient_names: parseCommaSeparated(draft.suggested_ingredient_names),
    suggested_default_signals: parseCommaSeparated(draft.suggested_default_signals),
  };
}

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

function formatMacroSummary(detail: FoodReferenceCandidateDetail): string | null {
  const parts = [
    typeof detail.suggested_protein_g === 'number' ? `Protein ${detail.suggested_protein_g}g` : null,
    typeof detail.suggested_fat_g === 'number' ? `Fat ${detail.suggested_fat_g}g` : null,
    typeof detail.suggested_carbs_g === 'number' ? `Carbs ${detail.suggested_carbs_g}g` : null,
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join(' | ') : null;
}

function formatSecondaryNutritionSummary(detail: FoodReferenceCandidateDetail): string | null {
  const parts = [
    typeof detail.suggested_fiber_g === 'number' ? `Fiber ${detail.suggested_fiber_g}g` : null,
    typeof detail.suggested_sugar_g === 'number' ? `Sugar ${detail.suggested_sugar_g}g` : null,
    typeof detail.suggested_sodium_mg === 'number' ? `Sodium ${detail.suggested_sodium_mg}mg` : null,
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join(' | ') : null;
}

function renderDetailList(candidate: ReferenceReviewCandidateRow): Array<{ label: string; value: string }> {
  if (candidate.candidate_kind === 'food') {
    const detail = readFoodCandidateDetail(candidate.detail);
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
    if (detail.suggested_brand_name) {
      rows.push({ label: 'Suggested brand', value: detail.suggested_brand_name });
    }
    if (detail.suggested_serving_label) {
      rows.push({ label: 'Suggested serving', value: detail.suggested_serving_label });
    }
    if (typeof detail.suggested_calories_kcal === 'number') {
      rows.push({ label: 'Suggested calories', value: `${detail.suggested_calories_kcal} kcal` });
    }

    const macroSummary = formatMacroSummary(detail);
    if (macroSummary) {
      rows.push({ label: 'Suggested macros', value: macroSummary });
    }

    const secondaryNutrition = formatSecondaryNutritionSummary(detail);
    if (secondaryNutrition) {
      rows.push({ label: 'Secondary nutrition', value: secondaryNutrition });
    }

    if (Array.isArray(detail.suggested_ingredient_names) && detail.suggested_ingredient_names.length > 0) {
      rows.push({
        label: 'Suggested ingredients',
        value: detail.suggested_ingredient_names.join(', '),
      });
    }

    if (Array.isArray(detail.suggested_common_aliases) && detail.suggested_common_aliases.length > 0) {
      rows.push({
        label: 'Suggested aliases',
        value: detail.suggested_common_aliases.join(', '),
      });
    }

    if (Array.isArray(detail.suggested_default_signals) && detail.suggested_default_signals.length > 0) {
      rows.push({
        label: 'Suggested gut signals',
        value: detail.suggested_default_signals.join(', '),
      });
    }

    if (detail.enrichment_source_label) {
      const value = detail.enrichment_source_ref
        ? `${detail.enrichment_source_label} | ${detail.enrichment_source_ref}`
        : detail.enrichment_source_label;
      rows.push({ label: 'Enrichment source', value });
    }

    if (typeof detail.enrichment_confidence === 'number') {
      rows.push({
        label: 'Enrichment confidence',
        value: `${Math.round(detail.enrichment_confidence * 100)}%`,
      });
    }

    if (detail.enrichment_last_attempt_at) {
      rows.push({
        label: 'Last lookup',
        value: formatDate(detail.enrichment_last_attempt_at),
      });
    }

    if (detail.enrichment_notes) {
      rows.push({
        label: 'Lookup note',
        value: detail.enrichment_notes,
      });
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
  const [processing, setProcessing] = useState<{
    candidateId: string;
    action: 'accept' | 'reject' | 'refresh' | 'save';
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending_review' | 'all'>('pending_review');
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [foodDraft, setFoodDraft] = useState<FoodDetailDraft | null>(null);

  const loadCandidates = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');
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

    setProcessing({ candidateId, action: 'accept' });
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

    setProcessing({ candidateId, action: 'reject' });
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

  const beginFoodEditing = (candidate: ReferenceReviewCandidateRow) => {
    if (candidate.candidate_kind !== 'food') return;
    const detail = readFoodCandidateDetail(candidate.detail);
    setEditingCandidateId(candidate.id);
    setFoodDraft(createFoodDetailDraft(detail));
  };

  const cancelFoodEditing = () => {
    setEditingCandidateId(null);
    setFoodDraft(null);
  };

  const handleFoodDraftChange = (field: keyof FoodDetailDraft, value: string) => {
    setFoodDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleRefreshFoodCandidate = async (candidateId: string) => {
    if (!user?.id) return;

    setProcessing({ candidateId, action: 'refresh' });
    setError('');

    try {
      const refreshed = await refreshFoodReferenceCandidateEnrichment(user.id, candidateId);
      setCandidates((current) =>
        current.map((candidate) => (candidate.id === refreshed.id ? refreshed : candidate))
      );

      if (editingCandidateId === candidateId) {
        setFoodDraft(createFoodDetailDraft(readFoodCandidateDetail(refreshed.detail)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh food enrichment.');
    } finally {
      setProcessing(null);
    }
  };

  const handleSaveFoodDraft = async (candidate: ReferenceReviewCandidateRow) => {
    if (!user?.id || !foodDraft) return;

    setProcessing({ candidateId: candidate.id, action: 'save' });
    setError('');

    try {
      const baseDetail = readFoodCandidateDetail(candidate.detail);
      const updated = await updateFoodReferenceCandidateDetail({
        userId: user.id,
        candidateId: candidate.id,
        detail: applyFoodDetailDraft(baseDetail, foodDraft),
      });

      setCandidates((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry))
      );
      setEditingCandidateId(null);
      setFoodDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save food suggestion.');
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
                const processingAction =
                  processing?.candidateId === candidate.id ? processing.action : null;
                const isProcessing = processingAction !== null;
                const detailRows = renderDetailList(candidate);
                const KindIcon = candidate.candidate_kind === 'food' ? Utensils : Pill;
                const foodDetail =
                  candidate.candidate_kind === 'food'
                    ? readFoodCandidateDetail(candidate.detail)
                    : null;
                const enrichmentStatusMeta =
                  foodDetail ? ENRICHMENT_STATUS_META[foodDetail.enrichment_status] : null;
                const isEditingFood = editingCandidateId === candidate.id && foodDraft !== null;

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
                            {foodDetail && (
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${enrichmentStatusMeta?.className}`}
                              >
                                {enrichmentStatusMeta?.label}
                              </span>
                            )}
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
                              {processingAction === 'accept' ? 'Accepting...' : 'Accept'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(candidate.id)}
                              disabled={isProcessing}
                              className="w-full border-[rgba(248,113,113,0.18)] text-[rgba(252,165,165,0.98)] hover:bg-[rgba(248,113,113,0.08)]"
                            >
                              <X className="h-3.5 w-3.5" />
                              {processingAction === 'reject' ? 'Rejecting...' : 'Reject'}
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

                      {candidate.candidate_kind === 'food' && isPending && foodDetail && (
                        <div className="space-y-4 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.02)] p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRefreshFoodCandidate(candidate.id)}
                              disabled={isProcessing}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              {processingAction === 'refresh'
                                ? 'Refreshing source...'
                                : 'Refresh source lookup'}
                            </Button>

                            {isEditingFood ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveFoodDraft(candidate)}
                                  disabled={isProcessing || !foodDraft}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  {processingAction === 'save' ? 'Saving...' : 'Save suggestion'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelFoodEditing}
                                  disabled={isProcessing}
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Cancel edit
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => beginFoodEditing(candidate)}
                                disabled={isProcessing}
                              >
                                <FileSearch className="h-3.5 w-3.5" />
                                Edit suggestion
                              </Button>
                            )}
                          </div>

                          {isEditingFood && foodDraft && (
                            <div className="grid gap-3 sm:grid-cols-2">
                              <EditableField
                                label="Category"
                                value={foodDraft.suggested_food_category}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_food_category', value)
                                }
                              />
                              <EditableField
                                label="Brand"
                                value={foodDraft.suggested_brand_name}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_brand_name', value)
                                }
                              />
                              <EditableField
                                label="Serving"
                                value={foodDraft.suggested_serving_label}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_serving_label', value)
                                }
                              />
                              <EditableField
                                label="Common aliases"
                                value={foodDraft.suggested_common_aliases}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_common_aliases', value)
                                }
                                placeholder="e.g. lasagne, meat lasagna"
                              />
                              <EditableField
                                label="Calories (kcal)"
                                value={foodDraft.suggested_calories_kcal}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_calories_kcal', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Protein (g)"
                                value={foodDraft.suggested_protein_g}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_protein_g', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Fat (g)"
                                value={foodDraft.suggested_fat_g}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_fat_g', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Carbs (g)"
                                value={foodDraft.suggested_carbs_g}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_carbs_g', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Fiber (g)"
                                value={foodDraft.suggested_fiber_g}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_fiber_g', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Sugar (g)"
                                value={foodDraft.suggested_sugar_g}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_sugar_g', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Sodium (mg)"
                                value={foodDraft.suggested_sodium_mg}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_sodium_mg', value)
                                }
                                inputMode="decimal"
                              />
                              <EditableField
                                label="Suggested gut signals"
                                value={foodDraft.suggested_default_signals}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_default_signals', value)
                                }
                                placeholder="Comma-separated signals"
                              />
                              <EditableTextarea
                                label="Ingredients"
                                value={foodDraft.suggested_ingredient_names}
                                onChange={(value) =>
                                  handleFoodDraftChange('suggested_ingredient_names', value)
                                }
                                className="sm:col-span-2"
                                placeholder="Comma-separated ingredients"
                              />
                            </div>
                          )}
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

function EditableField({
  label,
  value,
  onChange,
  placeholder,
  className = '',
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="mt-2 w-full rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-accent-primary)] focus:bg-black/[0.18]"
      />
    </label>
  );
}

function EditableTextarea({
  label,
  value,
  onChange,
  placeholder,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="mt-2 w-full rounded-[18px] border border-white/8 bg-black/[0.14] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-accent-primary)] focus:bg-black/[0.18]"
      />
    </label>
  );
}
