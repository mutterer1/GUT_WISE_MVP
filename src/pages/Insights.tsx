import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import InsightCard from '../components/InsightCard';
import RankedCandidateCard from '../components/insights/RankedCandidateCard';
import TrustExplainer from '../components/TrustExplainer';
import { Brain, RefreshCw, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateAllInsights, saveInsights, getUserInsights, Insight } from '../utils/insightEngine';
import { useRankedInsights } from '../hooks/useRankedInsights';
import type { LLMPerItemExplanation } from '../types/llmExplanationOutput';

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatLogTypeLabel(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .replace(/\b(bm|gi)\b/gi, (match) => match.toUpperCase())
    .replace(/^\w/, (char) => char.toUpperCase());
}

type InsightSource = 'ranked_loading' | 'ranked_primary' | 'ranked_empty' | 'legacy_error_fallback';

export default function Insights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    insights: rankedInsights,
    loading: rankedLoading,
    error: rankedError,
    firstRunCompleted: rankedFirstRunCompleted,
    explanationResult,
    explanationLoading,
    explanationError,
    explanationOrigin,
    generateExplanations,
  } = useRankedInsights();

  const explanationMap = useCallback((): Map<string, LLMPerItemExplanation> => {
    const map = new Map<string, LLMPerItemExplanation>();
    if (explanationResult?.success && explanationResult.explanation_output) {
      for (const item of explanationResult.explanation_output.explanations) {
        map.set(item.insight_key, item);
      }
    }
    return map;
  }, [explanationResult]);

  const loadInsights = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getUserInsights(user.id);
      setInsights(data);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Failed to load insights. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleGenerateInsights = async () => {
    if (!user) return;
    try {
      setGenerating(true);
      setError(null);
      const newInsights = await generateAllInsights(user.id);
      if (newInsights.length > 0) {
        await saveInsights(newInsights);
        await loadInsights();
      } else {
        setError(
          'Not enough data to generate insights yet. Keep logging daily activities to unlock meaningful patterns.'
        );
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to analyze your latest data. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const rankedCandidates = rankedInsights?.candidates ?? [];
  const evidenceGapSummaries = rankedInsights?.evidence_gap_summaries ?? [];
  const missingLogTypes = rankedInsights?.missing_log_types ?? [];
  const rankedSettled = rankedFirstRunCompleted && !rankedLoading;
  const hasRankedCandidates = rankedCandidates.length > 0;

  const isLegacyErrorFallback = rankedSettled && !!rankedError;
  const isRankedEmpty = rankedSettled && !rankedError && !hasRankedCandidates;
  const isRankedPrimary = rankedSettled && !rankedError && hasRankedCandidates;

  const insightSource: InsightSource = rankedLoading
    ? 'ranked_loading'
    : isRankedPrimary
      ? 'ranked_primary'
      : isRankedEmpty
        ? 'ranked_empty'
        : 'legacy_error_fallback';

  useEffect(() => {
    if (user && isLegacyErrorFallback) {
      loadInsights();
    }
  }, [user, isLegacyErrorFallback, loadInsights]);

  const validation = explanationResult?.validation ?? null;
  const isSafeToUse = validation?.is_safe_to_use === true;
  const validationStatus = validation?.status ?? null;

  const distinctWarningFlags =
    validationStatus === 'valid_with_warnings'
      ? [...new Set((validation?.flags ?? []).map((f) => f.type))]
      : [];

  const exMap = isSafeToUse ? explanationMap() : new Map();

  return (
    <div className="flex min-h-screen bg-neutral-bg dark:bg-dark-bg">
      <Sidebar />

      <main
        className="relative flex-1 p-md pt-16 sm:p-lg sm:pt-16 lg:ml-64 lg:p-lg lg:pt-lg"
        data-insight-source={insightSource}
        data-explanation-origin={explanationOrigin}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-80"
          style={{
            background:
              'radial-gradient(ellipse 75% 55% at 50% 0%, rgba(124, 92, 255, 0.10) 0%, transparent 75%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-lg flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-5 text-h4 font-sora font-semibold text-neutral-text dark:text-dark-text">
                Health Insights
              </h1>
              <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                Pattern-based analysis of your digestive health data.
              </p>
            </div>

            {isLegacyErrorFallback && (
              <Button
                onClick={handleGenerateInsights}
                disabled={generating}
                className="flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Refresh Insights
                  </>
                )}
              </Button>
            )}
          </div>

          {error && (
            <div className="mb-md flex items-start gap-3 rounded-xl border border-signal-500/30 bg-signal-500/10 p-md">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-signal-700 dark:text-signal-300" />
              <p className="text-body-sm text-signal-700 dark:text-signal-300">{error}</p>
            </div>
          )}

          {rankedLoading && (
            <div className="flex h-72 flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
              <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                Looking for patterns in your data...
              </p>
            </div>
          )}

          {isRankedPrimary && (
            <section className="mb-lg">
              <div className="mb-md flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2.5">
                    <h2 className="text-h5 font-sora font-semibold text-neutral-text dark:text-dark-text">
                      Pattern Insights
                    </h2>
                    {explanationOrigin !== 'none' && !explanationError && (
                      <span className="rounded-full border border-discovery-500/18 bg-discovery-500/07 px-2.5 py-0.5 text-xs font-medium text-discovery-500 dark:bg-discovery-500/12 dark:text-discovery-300">
                        AI explained
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                    {rankedInsights?.input_day_count ?? 0} days analyzed
                    {rankedInsights?.analyzed_from && rankedInsights?.analyzed_to
                      ? ` | ${formatShortDate(rankedInsights.analyzed_from)} - ${formatShortDate(
                          rankedInsights.analyzed_to
                        )}`
                      : ''}
                    {rankedInsights?.medical_context_applied ? ' | Personalized to your profile' : ''}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {explanationError && (
                    <div className="flex items-center gap-1.5 text-body-sm text-signal-700 dark:text-signal-300">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Couldn&apos;t generate explanations</span>
                    </div>
                  )}

                  <button
                    onClick={generateExplanations}
                    disabled={explanationLoading}
                    className="flex items-center gap-2 rounded-2xl border border-[#7C5CFF]/25 bg-[#7C5CFF]/05 px-4 py-2 text-sm font-medium text-[#7C5CFF] transition-colors hover:bg-[#7C5CFF]/10 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#7C5CFF]/08 dark:text-[#B8A8FF] dark:hover:bg-[#7C5CFF]/16"
                  >
                    {explanationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Explaining...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {explanationOrigin === 'none' ? 'Explain Patterns' : 'Refresh Explanations'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {validationStatus === 'invalid' && (
                <div className="mb-md flex items-start gap-3 rounded-xl border border-signal-500/25 bg-signal-500/06 p-sm dark:bg-signal-500/08">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-signal-700 dark:text-signal-300" />
                  <p className="text-body-sm text-signal-700 dark:text-signal-300">
                    AI explanations couldn&apos;t be verified and won&apos;t be shown. Your patterns are
                    still displayed below.
                  </p>
                </div>
              )}

              {validationStatus === 'valid_with_warnings' && distinctWarningFlags.length > 0 && (
                <div className="mb-md flex items-start gap-3 rounded-xl border border-signal-500/25 bg-signal-500/06 p-sm dark:bg-signal-500/06">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-signal-700 dark:text-signal-300" />
                  <p className="text-body-sm text-signal-700 dark:text-signal-300">
                    Some explanations may be incomplete. Patterns are still shown below.
                  </p>
                </div>
              )}

              <div className="mb-md">
                <TrustExplainer variant="insights" />
              </div>

              {(evidenceGapSummaries.length > 0 || missingLogTypes.length > 0) && (
                <EvidenceGapPanel
                  missingLogTypes={missingLogTypes}
                  evidenceGapSummaries={evidenceGapSummaries}
                />
              )}

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {rankedCandidates.map((candidate, i) => (
                  <RankedCandidateCard
                    key={candidate.insight_key}
                    candidate={candidate}
                    explanation={exMap.get(candidate.insight_key)}
                    rank={i + 1}
                  />
                ))}
              </div>
            </section>
          )}

          {isRankedEmpty && (
            <div className="space-y-md">
              <TrustExplainer variant="insights" />
              <div
                className="rounded-2xl border border-neutral-border bg-neutral-surface px-6 py-10 text-center shadow-soft dark:border-dark-border dark:bg-dark-surface sm:px-10 sm:py-14"
                style={{ animation: 'emptyStateFadeIn 0.4s ease-out both' }}
              >
                <div
                  className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7C5CFF]/08 dark:bg-[#7C5CFF]/14"
                  style={{
                    animation: 'emptyStateIconFloat 3s ease-in-out infinite',
                    boxShadow:
                      '0 0 0 1px rgba(124,92,255,0.14), 0 0 18px 2px rgba(124,92,255,0.10)',
                  }}
                >
                  <Brain className="h-7 w-7 text-[#7C5CFF] dark:text-[#B8A8FF]" />
                </div>

                <div className="mx-auto max-w-md">
                  <h3 className="mb-3 text-h5 font-sora font-semibold text-neutral-text dark:text-dark-text">
                    No reliable patterns detected yet
                  </h3>

                  <p className="mb-3 text-body-sm leading-relaxed text-neutral-muted dark:text-dark-muted">
                    GutWise does not have enough repeated overlap in your recent logs yet to show a
                    strong pattern.
                  </p>

                  {missingLogTypes.length > 0 ? (
                    <p className="mb-3 text-body-sm leading-relaxed text-neutral-muted dark:text-dark-muted">
                      The most useful missing context right now is:{' '}
                      {missingLogTypes.slice(0, 6).map(formatLogTypeLabel).join(', ')}.
                    </p>
                  ) : (
                    <p className="mb-3 text-body-sm leading-relaxed text-neutral-muted dark:text-dark-muted">
                      The strongest starting combination is stool, symptoms, meals, hydration,
                      sleep, and stress logged on the same days.
                    </p>
                  )}

                  {evidenceGapSummaries.length > 0 && (
                    <div className="mt-5 rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-4 text-left dark:border-amber-300/10 dark:bg-amber-400/5">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-300">
                        What is missing
                      </p>
                      <div className="space-y-2">
                        {evidenceGapSummaries.slice(0, 3).map((summary) => (
                          <p
                            key={summary.insight_key}
                            className="text-xs leading-relaxed text-amber-900/80 dark:text-amber-200/80"
                          >
                            {summary.reasons[0]}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mt-4 text-body-xs text-neutral-muted/65 dark:text-dark-muted/65">
                    A few more days of shared context will usually do more than logging one
                    category in isolation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLegacyErrorFallback && (
            <>
              <div className="mb-md flex items-start gap-3 rounded-xl border border-brand-700/25 bg-brand-500/06 px-md py-sm dark:bg-brand-500/08">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500 dark:text-brand-300" />
                <div>
                  <p className="text-body-sm font-medium text-brand-700 dark:text-brand-300">
                    Pattern analysis encountered a problem
                  </p>
                  <p className="mt-0.5 text-body-sm text-brand-700/75 dark:text-brand-300/75">
                    Pattern analysis couldn&apos;t complete right now. Showing available observations
                    from your logs instead.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex h-72 flex-col items-center justify-center gap-3">
                  <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
                  <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                    Loading your insights...
                  </p>
                </div>
              ) : insights.length === 0 ? (
                <div
                  className="rounded-2xl border border-neutral-border bg-neutral-surface px-6 py-10 text-center shadow-soft dark:border-dark-border dark:bg-dark-surface sm:px-10 sm:py-12"
                  style={{ animation: 'emptyStateFadeIn 0.4s ease-out both' }}
                >
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/08 dark:bg-brand-500/14">
                    <Brain className="h-7 w-7 text-brand-500 dark:text-brand-300" />
                  </div>

                  <div className="mx-auto max-w-xs sm:max-w-sm">
                    <h3 className="mb-3 text-h5 font-sora font-semibold text-neutral-text dark:text-dark-text">
                      No saved observations available
                    </h3>

                    <p className="mb-3 text-body-sm leading-relaxed text-neutral-muted dark:text-dark-muted">
                      Pattern analysis ran into a problem and there are no previously saved
                      observations to fall back on.
                    </p>

                    <p className="mb-8 text-body-xs text-neutral-muted/70 dark:text-dark-muted/70">
                      Continue logging and try refreshing insights. If the problem persists, check
                      back later.
                    </p>
                  </div>

                  <Button onClick={handleGenerateInsights} disabled={generating}>
                    {generating ? 'Analyzing...' : 'Try Again'}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-md flex items-center gap-3 text-body-sm text-neutral-muted dark:text-dark-muted">
                    <span>
                      {insights.length} {insights.length === 1 ? 'observation' : 'observations'} found
                    </span>
                    <span className="text-neutral-border dark:text-dark-border">|</span>
                    <span>Based on repeated signals in your logs</span>
                  </div>

                  <div className="mb-lg rounded-xl border border-brand-700/18 bg-brand-500/04 px-md py-sm dark:bg-brand-500/05">
                    <p className="text-body-sm leading-relaxed text-brand-700/85 dark:text-brand-300/85">
                      <span className="font-medium">About these observations: </span>
                      GutWise surfaces patterns by comparing days when a factor was present against
                      days it wasn&apos;t. Confidence grows as the same signal appears consistently
                      over time.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {insights.map((insight) => (
                      <InsightCard key={insight.id} insight={insight} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function EvidenceGapPanel({
  missingLogTypes,
  evidenceGapSummaries,
}: {
  missingLogTypes: string[];
  evidenceGapSummaries: Array<{
    insight_key: string;
    category: string;
    subtype: string;
    reasons: string[];
    supporting_log_types: string[];
    missing_log_types: string[];
  }>;
}) {
  return (
    <div className="mb-md rounded-2xl border border-amber-200/70 bg-amber-50/70 p-5 dark:border-amber-300/10 dark:bg-amber-400/5">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700 dark:text-amber-300" />
        <div className="min-w-0 flex-1">
          <h3 className="text-body-md font-semibold text-amber-900 dark:text-amber-200">
            Patterns are improving, but some evidence is still thin
          </h3>
          <p className="mt-1 text-body-sm leading-relaxed text-amber-900/80 dark:text-amber-200/80">
            GutWise filtered out weaker candidates and only kept the stronger ones below.
            The notes here show what would most improve future insight quality.
          </p>

          {missingLogTypes.length > 0 && (
            <div className="mt-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-300">
                Most useful missing log types
              </p>
              <p className="text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/80">
                {missingLogTypes.slice(0, 6).map(formatLogTypeLabel).join(', ')}
              </p>
            </div>
          )}

          {evidenceGapSummaries.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-300">
                Common evidence gaps
              </p>
              {evidenceGapSummaries.slice(0, 3).map((summary) => (
                <div
                  key={summary.insight_key}
                  className="rounded-xl border border-amber-300/30 bg-white/55 px-3.5 py-3 dark:border-amber-300/10 dark:bg-white/[0.03]"
                >
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                    {summary.reasons[0] ?? 'This candidate needs more repeated overlap.'}
                  </p>
                  {summary.missing_log_types.length > 0 && (
                    <p className="mt-1 text-xs leading-relaxed text-amber-900/75 dark:text-amber-200/75">
                      Helpful next logs: {summary.missing_log_types.map(formatLogTypeLabel).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
