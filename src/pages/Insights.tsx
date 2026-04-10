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
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar />

      <main
        className="flex-1 lg:ml-64 p-md sm:p-lg lg:p-lg pt-20 sm:pt-20 lg:pt-0"
        data-insight-source={insightSource}
        data-explanation-origin={explanationOrigin}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Health Insights</h1>
              <p className="text-gray-600 dark:text-gray-400">
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
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 dark:border-yellow-800/30 bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
              <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
            </div>
          )}

          {/* Ranked fallback notice — error path */}
          {useLegacyFallback && rankedError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#2C617D]/30 bg-[#4A8FA8]/08 dark:bg-[#4A8FA8]/06 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4A8FA8] dark:text-[#8EBFD8]" />
              <p className="text-sm text-[#2C617D] dark:text-[#8EBFD8]">
                Pattern analysis ran into a problem. Showing available insights instead.
              </p>
            </div>
          )}

          {/* Ranked fallback notice — no candidates yet path */}
          {useLegacyFallback && !rankedError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#2C617D]/20 bg-[#4A8FA8]/05 dark:bg-[#4A8FA8]/04 px-4 py-3">
              <Brain className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4A8FA8]/70 dark:text-[#8EBFD8]/70" />
              <div>
                <p className="text-sm text-[#2C617D]/90 dark:text-[#8EBFD8]/90 font-medium">Your patterns are still building</p>
                <p className="mt-0.5 text-sm text-[#2C617D]/70 dark:text-[#8EBFD8]/70">
                  Keep logging consistently and GutWise will surface personalized patterns over time. Earlier insights are shown below.
                </p>
              </div>
            </div>
          )}

          {/* Primary: Ranked insight pipeline */}
          {rankedLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#4A8FA8]" />
              <p className="text-sm text-gray-400 dark:text-gray-500">Looking for patterns in your data…</p>
            </div>
          ) : hasRankedCandidates ? (
            <section className="mb-10">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pattern Insights</h2>
                    {explanationOrigin !== 'none' && !explanationError && (
                      <span className="rounded-full bg-[#7C5CFF]/08 dark:bg-[#7C5CFF]/12 border border-[#7C5CFF]/20 px-2 py-0.5 text-xs font-medium text-[#7C5CFF] dark:text-[#B8A8FF]">
                        AI explained
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {rankedInsights?.input_day_count ?? 0} days analyzed
                    {rankedInsights?.analyzed_from && rankedInsights?.analyzed_to
                      ? ` · ${formatShortDate(rankedInsights.analyzed_from)} – ${formatShortDate(rankedInsights.analyzed_to)}`
                      : ''}
                    {rankedInsights?.medical_context_applied ? ' · Personalized to your profile' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {explanationError && (
                    <div className="flex items-center gap-1.5 text-sm text-[#8D5D62] dark:text-[#D9B3B7]">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Couldn't generate explanations</span>
                    </div>
                  )}

                  <button
                    onClick={generateExplanations}
                    disabled={explanationLoading}
                    className="flex items-center gap-2 rounded-xl border border-[#7C5CFF]/30 bg-[#7C5CFF]/05 dark:bg-[#7C5CFF]/10 px-4 py-2 text-sm font-medium text-[#7C5CFF] dark:text-[#B8A8FF] transition-colors hover:bg-[#7C5CFF]/10 dark:hover:bg-[#7C5CFF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {explanationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Explaining patterns…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {explanationOrigin === 'none' ? 'Explain these patterns' : 'Refresh explanations'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {rankedError ? (
                <div className="flex items-start gap-3 rounded-lg border border-yellow-200 dark:border-yellow-800/30 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{rankedError}</p>
                </div>
              ) : (
                <>
                  {validationStatus === 'invalid' && (
                    <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#C28F94]/30 bg-[#C28F94]/06 dark:bg-[#C28F94]/08 p-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#8D5D62] dark:text-[#D9B3B7]" />
                      <p className="text-sm text-[#8D5D62] dark:text-[#D9B3B7]">
                        AI explanations couldn't be verified and won't be shown. Your patterns are still displayed below.
                      </p>
                    </div>
                  )}

                  {validationStatus === 'valid_with_warnings' && distinctWarningFlags.length > 0 && (
                    <div className="mb-4 flex items-start gap-3 rounded-xl border border-yellow-200 dark:border-yellow-800/30 bg-yellow-50 dark:bg-yellow-900/10 p-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Some explanations may be incomplete. Patterns are still shown below.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
              <div className="flex h-64 flex-col items-center justify-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-[#4A8FA8]" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Loading your insights…</p>
              </div>
            ) : insights.length === 0 ? (
              <div
                className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] p-12 text-center shadow-sm"
                style={{ animation: 'emptyStateFadeIn 0.4s ease-out both' }}
              >
                <div
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4A8FA8]/08 dark:bg-[#4A8FA8]/12"
                  style={{ animation: 'emptyStateIconFloat 3s ease-in-out infinite' }}
                >
                  <Brain className="h-8 w-8 text-[#4A8FA8] dark:text-[#8EBFD8]" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Your patterns are still forming
                </h3>

                <p className="mx-auto mb-2 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  GutWise builds on several days of consistent logs to find reliable patterns. The more categories you track — meals, symptoms, hydration, sleep, stress — the sharper your insights become.
                </p>

                <p className="mx-auto mb-8 max-w-sm text-xs text-gray-400 dark:text-gray-500">
                  Check back after a few more days of logging to see your first patterns.
                </p>

                <Button onClick={handleGenerateInsights} disabled={generating}>
                  {generating ? 'Analyzing…' : 'Check for patterns now'}
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>{insights.length} {insights.length === 1 ? 'pattern' : 'patterns'} found</span>
                  <span className="text-gray-300 dark:text-white/20">·</span>
                  <span>Based on repeated observations in your logs</span>
                </div>

                <div className="mb-6 rounded-xl border border-[#2C617D]/20 bg-[#4A8FA8]/05 dark:bg-[#4A8FA8]/06 px-4 py-3">
                  <p className="text-sm text-[#2C617D]/90 dark:text-[#8EBFD8]/90 leading-relaxed">
                    <span className="font-medium">How patterns are found: </span>
                    GutWise identifies patterns by comparing days with a given factor against days without it. Confidence grows the more consistently the same signal appears.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
