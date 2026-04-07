import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import InsightCard from '../components/InsightCard';
import { Brain, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateAllInsights, saveInsights, getUserInsights, Insight } from '../utils/insightEngine';

export default function Insights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user, loadInsights]);

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

  const insightCount = insights.length;

  return (
    <div className="flex min-h-screen bg-neutral-bg">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-md sm:p-lg lg:p-lg pt-16 sm:pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Health Insights</h1>
              <p className="text-gray-600">
                Pattern-based analysis of your digestive health data.
              </p>
            </div>

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
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
              <p className="text-yellow-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : insightCount === 0 ? (
            <div
              className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm mt-[50px]"
              style={{ animation: 'emptyStateFadeIn 0.4s ease-out both' }}
            >
              <div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-50"
                style={{ animation: 'emptyStateIconFloat 3s ease-in-out infinite' }}
              >
                <Brain className="h-10 w-10 text-teal-400" />
              </div>

              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Your Insights Are Brewing
              </h3>

              <p className="mx-auto mb-2 max-w-md text-sm leading-relaxed text-gray-500">
                We need a few days of data to identify meaningful patterns. The more consistently you log, the better your insights become.
              </p>

              <p className="mx-auto mb-8 max-w-sm text-xs text-gray-400">
                Logging meals, symptoms, hydration, sleep, and stress creates the strongest analysis.
              </p>

              <Button onClick={handleGenerateInsights} disabled={generating}>
                {generating ? 'Analyzing...' : 'Analyze Latest Data'}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Active Insights</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{insightCount}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Analysis Style</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">Rule-based and transparent</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Best Results</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">Consistent multi-category logging</p>
                </div>
              </div>

              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-1 font-semibold text-blue-900">How Insights Work</h3>
                <p className="text-sm text-blue-800">
                  Insights are generated using transparent rules based on repeated patterns in your data. Confidence improves when the same pattern appears consistently over time.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
