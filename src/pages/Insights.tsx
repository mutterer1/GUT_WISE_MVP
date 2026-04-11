import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import InsightCard from '../components/InsightCard';
import RankedCandidateCard from '../components/insights/RankedCandidateCard';
import { Brain, RefreshCw, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateAllInsights, saveInsights, getUserInsights, Insight } from '../utils/insightEngine';
import { useRankedInsights } from '../hooks/useRankedInsights';
import type { LLMPerItemExplanation } from '../types/llmExplanationOutput';

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type InsightSource = 'ranked_primary' | 'legacy_fallback';

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
        setError('Not enough data to generate insights yet. Keep logging daily activities to unlock meaningful patterns.');
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to analyze your latest data. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const rankedCandidates = rankedInsights?.candidates ?? [];
  const rankedSettled = rankedFirstRunCompleted && !rankedLoading;
  const hasRankedCandidates = rankedCandidates.length > 0;
  const useLegacyFallback = rankedSettled && !hasRankedCandidates;

  const insightSource: InsightSource = rankedSettled && hasRankedCandidates ? 'ranked_primary' : 'legacy_fallback';

  useEffect(() => {
    if (user && useLegacyFallback) {
      loadInsights();
    }
  }, [user, useLegacyFallback, loadInsights]);

  const validation = explanationResult?.validation ?? null;
  const isSafeToUse = validation?.is_safe_to_use === true;
  const validationStatus = validation?.status ?? null;

  const distinctWarningFlags = validationStatus === 'valid_with_warnings'
    ? [...new Set((validation?.flags ?? []).map(f => f.type))]
    : [];

  const exMap = isSafeToUse ? explanationMap() : new Map();

  return (
    <div className="flex min-h-screen bg-neutral-bg dark:bg-dark-bg">
      <Sidebar />

      <main
        className="flex-1 lg:ml-64 p-md sm:p-lg lg:p-lg pt-16 sm:pt-16 lg:pt-lg relative"
        data-insight-source={insightSource}
        data-explanation-origin={explanationOrigin}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-80 z-0"
          style={{ background: 'radial-gradient(ellipse 75% 55% at 50% 0%, rgba(124, 92, 255, 0.10) 0%, transparent 75%)' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-lg flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-1 text-h4 font-sora font-semibold text-neutral-text dark:text-dark-text">Health Insights</h1>
              <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                Pattern-based analysis of your digestive health data.
              </p>
            </div>

            {useLegacyFallback && (
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

          {/* Ranked fallback notice — error path */}
          {useLegacyFallback && rankedError && (
            <div className="mb-md flex items-start gap-3 rounded-xl border border-brand-700/25 bg-brand-500/06 dark:bg-brand-500/08 px-md py-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500 dark:text-brand-300" />
              <p className="text-body-sm text-brand-700 dark:text-brand-300">
                Pattern analysis ran into a problem. Showing available insights instead.
              </p>
            </div>
          )}

          {/* Ranked fallback notice — no candidates yet path */}
          {useLegacyFallback && !rankedError && (
            <div className="mb-md flex items-start gap-3 rounded-xl border border-[#7C5CFF]/20 bg-[#7C5CFF]/04 dark:bg-[#7C5CFF]/07 px-md py-sm">
              <Brain className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#7C5CFF]/70 dark:text-[#B8A8FF]/70" />
              <div>
                <p className="text-body-sm font-medium text-[#5B3FD6]/90 dark:text-[#B8A8FF]/90">Your patterns are still building</p>
                <p className="mt-0.5 text-body-sm text-[#5B3FD6]/65 dark:text-[#B8A8FF]/65">
                  Keep logging consistently and GutWise will surface personalized patterns over time. Any available observations are shown below.
                </p>
              </div>
            </div>
          )}

          {/* Primary: Ranked insight pipeline */}
          {rankedLoading ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
              <p className="text-body-sm text-neutral-muted dark:text-dark-muted">Looking for patterns in your data…</p>
            </div>
          ) : hasRankedCandidates ? (
            <section className="mb-lg">
              <div className="mb-md flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h2 className="text-h5 font-sora font-semibold text-neutral-text dark:text-dark-text">Pattern Insights</h2>
                    {explanationOrigin !== 'none' && !explanationError && (
                      <span className="rounded-full bg-discovery-500/07 dark:bg-discovery-500/12 border border-discovery-500/18 px-2.5 py-0.5 text-xs font-medium text-discovery-500 dark:text-discovery-300">
                        AI explained
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                    {rankedInsights?.input_day_count ?? 0} days analyzed
                    {rankedInsights?.analyzed_from && rankedInsights?.analyzed_to
                      ? ` · ${formatShortDate(rankedInsights.analyzed_from)} – ${formatShortDate(rankedInsights.analyzed_to)}`
                      : ''}
                    {rankedInsights?.medical_context_applied ? ' · Personalized to your profile' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {explanationError && (
                    <div className="flex items-center gap-1.5 text-body-sm text-signal-700 dark:text-signal-300">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Couldn't generate explanations</span>
                    </div>
                  )}

                  <button
                    onClick={generateExplanations}
                    disabled={explanationLoading}
                    className="flex items-center gap-2 rounded-2xl border border-[#7C5CFF]/25 bg-[#7C5CFF]/05 dark:bg-[#7C5CFF]/08 px-4 py-2 text-sm font-medium text-[#7C5CFF] dark:text-[#B8A8FF] transition-colors hover:bg-[#7C5CFF]/10 dark:hover:bg-[#7C5CFF]/16 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {rankedError ? (
                <div className="flex items-start gap-3 rounded-xl border border-signal-500/30 bg-signal-500/10 p-md">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-signal-700 dark:text-signal-300" />
                  <p className="text-body-sm text-signal-700 dark:text-signal-300">{rankedError}</p>
                </div>
              ) : (
                <>
                  {validationStatus === 'invalid' && (
                    <div className="mb-md flex items-start gap-3 rounded-xl border border-signal-500/25 bg-signal-500/06 dark:bg-signal-500/08 p-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-signal-700 dark:text-signal-300" />
                      <p className="text-body-sm text-signal-700 dark:text-signal-300">
                        AI explanations couldn't be verified and won't be shown. Your patterns are still displayed below.
                      </p>
                    </div>
                  )}

                  {validationStatus === 'valid_with_warnings' && distinctWarningFlags.length > 0 && (
                    <div className="mb-md flex items-start gap-3 rounded-xl border border-signal-500/25 bg-signal-500/06 dark:bg-signal-500/06 p-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-signal-700 dark:text-signal-300" />
                      <p className="text-body-sm text-signal-700 dark:text-signal-300">
                        Some explanations may be incomplete. Patterns are still shown below.
                      </p>
                    </div>
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
                </>
              )}
            </section>
          ) : (
            /* Fallback: legacy insights path */
            loading ? (
              <div className="flex h-72 flex-col items-center justify-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
                <p className="text-body-sm text-neutral-muted dark:text-dark-muted">Loading your insights…</p>
              </div>
            ) : insights.length === 0 ? (
              <div
                className="rounded-2xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface px-6 py-10 sm:px-10 sm:py-12 text-center shadow-soft"
                style={{ animation: 'emptyStateFadeIn 0.4s ease-out both' }}
              >
                <div
                  className="mx-auto mb-md flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7C5CFF]/08 dark:bg-[#7C5CFF]/14"
                  style={{ animation: 'emptyStateIconFloat 3s ease-in-out infinite', boxShadow: '0 0 0 1px rgba(124,92,255,0.14), 0 0 18px 2px rgba(124,92,255,0.10)' }}
                >
                  <Brain className="h-7 w-7 text-[#7C5CFF] dark:text-[#B8A8FF]" />
                </div>

                <h3 className="mb-2 text-h5 font-sora font-semibold text-neutral-text dark:text-dark-text">
                  Your patterns are still forming
                </h3>

                <p className="mx-auto mb-1.5 max-w-md text-body-sm leading-relaxed text-neutral-muted dark:text-dark-muted">
                  GutWise builds on several days of consistent logs to find reliable patterns. The more categories you track — meals, symptoms, hydration, sleep, stress — the sharper your insights become.
                </p>

                <p className="mx-auto mb-6 max-w-sm text-body-xs text-neutral-muted dark:text-dark-muted">
                  Check back after a few more days of logging to see your first patterns.
                </p>

                <Button onClick={handleGenerateInsights} disabled={generating}>
                  {generating ? 'Analyzing...' : 'Analyze Patterns'}
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-md flex items-center gap-3 text-body-sm text-neutral-muted dark:text-dark-muted">
                  <span>{insights.length} {insights.length === 1 ? 'pattern' : 'patterns'} found</span>
                  <span className="text-neutral-border dark:text-dark-border">·</span>
                  <span>Based on repeated observations in your logs</span>
                </div>

                <div className="mb-lg rounded-xl border border-brand-700/18 bg-brand-500/04 dark:bg-brand-500/05 px-md py-sm">
                  <p className="text-body-sm text-brand-700/85 dark:text-brand-300/85 leading-relaxed">
                    <span className="font-medium">About these observations: </span>
                    GutWise surfaces patterns by comparing days when a factor was present against days it wasn't. Confidence grows as the same signal appears consistently over time.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {insights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </>
            )
          )}
        </div>
      </main>
    </div>
  );
}
