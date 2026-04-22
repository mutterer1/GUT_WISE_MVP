import { Brain, Sparkles, TrendingUp, AlertCircle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatternInsightsWidgetProps {
  bmCount: number;
  symptomsCount: number;
  stressLevel: number | null;
  hydrationPercentage: number;
  loading: boolean;
}

type InsightType = 'positive' | 'suggestion' | 'neutral';
type InsightConfidence = 'high' | 'medium' | 'low';

interface Insight {
  icon: typeof Brain;
  title: string;
  message: string;
  type: InsightType;
  confidence: InsightConfidence;
}

function getSignalCount(
  bmCount: number,
  hydrationPercentage: number,
  stressLevel: number | null
): number {
  let count = 0;
  if (bmCount > 0) count++;
  if (hydrationPercentage > 0) count++;
  if (stressLevel !== null) count++;
  return count;
}

function getProgressState(signalCount: number) {
  if (signalCount === 0) {
    return {
      label: 'Awaiting signals',
      headline: "Today's signals are still taking shape.",
      body: 'A few core entries — movement, water intake, and stress — will help GutWise surface its first observations for today.',
      cta: "Start with today's first entry",
    };
  }
  if (signalCount === 1) {
    return {
      label: 'Signal received',
      headline: 'Your daily picture is starting to form.',
      body: "One signal logged. A few more entries will let GutWise begin connecting today's dots.",
      cta: "Keep building today's snapshot",
    };
  }
  if (signalCount === 2) {
    return {
      label: 'Signals building',
      headline: 'Observations are getting closer.',
      body: "Two signals in. Log one more area and GutWise will have enough to surface today's first patterns.",
      cta: "Complete today's picture",
    };
  }
  return {
    label: 'Pattern ready',
    headline: "Today's picture is taking shape.",
    body: null,
    cta: null,
  };
}

function generateInsights(
  bmCount: number,
  symptomsCount: number,
  stressLevel: number | null,
  hydrationPercentage: number
): Insight[] {
  const insights: Insight[] = [];

  if (hydrationPercentage >= 100) {
    insights.push({
      icon: Sparkles,
      title: 'Water goal reached',
      message: "You've met your daily water target. Consistent water intake can support digestive regularity.",
      type: 'positive',
      confidence: 'high',
    });
  } else if (hydrationPercentage < 50 && hydrationPercentage > 0) {
    insights.push({
      icon: TrendingUp,
      title: 'Water goal opportunity',
      message: 'Your water-goal progress is below target. Increasing plain water intake may improve digestive comfort.',
      type: 'suggestion',
      confidence: 'medium',
    });
  }

  if (symptomsCount === 0 && bmCount > 0) {
    insights.push({
      icon: Sparkles,
      title: 'No symptoms reported',
      message: 'A day without logged symptoms. Your body seems to be responding well today.',
      type: 'positive',
      confidence: 'high',
    });
  }

  if (bmCount >= 1 && bmCount <= 3) {
    insights.push({
      icon: TrendingUp,
      title: 'Healthy frequency',
      message: 'Your bowel movement frequency is within the typical healthy range for today.',
      type: 'positive',
      confidence: 'medium',
    });
  }

  if (stressLevel !== null && stressLevel <= 4) {
    insights.push({
      icon: Brain,
      title: 'Stress levels manageable',
      message: 'Lower stress can positively influence gut motility and reduce digestive discomfort.',
      type: 'positive',
      confidence: 'medium',
    });
  } else if (stressLevel !== null && stressLevel >= 7) {
    insights.push({
      icon: AlertCircle,
      title: 'Higher stress today',
      message: 'Stress can influence gut motility and discomfort. A short break or relaxation practice may help.',
      type: 'suggestion',
      confidence: 'high',
    });
  }

  return insights.slice(0, 3);
}

function SignalDots({ count, total = 3 }: { count: number; total?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-500 ${
            i < count
              ? 'h-2 w-2 bg-discovery-500 shadow-[0_0_6px_rgba(124,92,255,0.6)]'
              : 'h-1.5 w-1.5 bg-neutral-border dark:bg-dark-border'
          }`}
        />
      ))}
    </div>
  );
}

function InsightRow({ insight, index }: { insight: Insight; index: number }) {
  const Icon = insight.icon;

  const rowStyle =
    insight.type === 'positive'
      ? 'bg-brand-500/5 dark:bg-brand-500/08 border-brand-500/15 dark:border-brand-500/15'
      : insight.type === 'suggestion'
        ? 'bg-signal-500/5 dark:bg-signal-500/08 border-signal-500/15 dark:border-signal-500/15'
        : 'bg-discovery-500/5 dark:bg-discovery-500/08 border-discovery-500/10 dark:border-discovery-500/15';

  const iconStyle =
    insight.type === 'positive'
      ? 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-500'
      : insight.type === 'suggestion'
        ? 'bg-signal-500/10 dark:bg-signal-500/15 text-signal-500'
        : 'bg-discovery-500/10 dark:bg-discovery-500/15 text-discovery-500';

  return (
    <div
      className={`animate-fade-in rounded-xl border px-4 py-3.5 transition-all ${rowStyle}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconStyle}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            <p className="text-body-sm font-semibold leading-snug text-neutral-text dark:text-dark-text">
              {insight.title}
            </p>
            {insight.confidence === 'high' && insight.type !== 'neutral' && (
              <span className="flex-shrink-0 rounded border border-discovery-500/15 bg-discovery-500/10 px-1.5 py-px text-[10px] font-medium leading-4 text-discovery-500">
                Strong
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-neutral-muted dark:text-dark-muted">
            {insight.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PatternInsightsWidget({
  bmCount,
  symptomsCount,
  stressLevel,
  hydrationPercentage,
  loading,
}: PatternInsightsWidgetProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-discovery-500/15 bg-neutral-surface p-6 shadow-glow-subtle dark:border-discovery-500/10 dark:bg-dark-surface">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 flex-shrink-0 rounded-xl bg-neutral-border dark:bg-dark-border" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-neutral-border dark:bg-dark-border" />
              <div className="h-3 w-52 rounded bg-neutral-border dark:bg-dark-border" />
            </div>
          </div>
          <div className="space-y-2.5 pt-1">
            {[1, 2].map((i) => (
              <div key={i} className="h-[72px] rounded-xl bg-neutral-border dark:bg-dark-border" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const signalCount = getSignalCount(bmCount, hydrationPercentage, stressLevel);
  const progressState = getProgressState(signalCount);
  const insights = generateInsights(bmCount, symptomsCount, stressLevel, hydrationPercentage);
  const hasInsights = insights.length > 0;

  const hasHighConfidence = insights.some((i) => i.confidence === 'high');
  const hasMediumConfidence = insights.some((i) => i.confidence === 'medium');
  const borderClass = hasHighConfidence
    ? 'border-discovery-500/30 dark:border-discovery-500/20 shadow-glow-bright dark:shadow-glow-bright dark:animate-glow-pulse'
    : hasMediumConfidence
      ? 'border-discovery-300/20 dark:border-discovery-500/15 shadow-glow-medium dark:shadow-glow-medium'
      : 'border-discovery-500/15 dark:border-discovery-500/10 shadow-glow-subtle dark:shadow-glow-subtle';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-neutral-surface p-6 transition-all dark:bg-dark-surface ${borderClass}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(124,92,255,0.14) 0%, rgba(124,92,255,0.05) 50%, transparent 70%)',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(124,92,255,0.07) 0%, transparent 70%)',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(124,92,255,0.25) 40%, rgba(124,92,255,0.14) 70%, transparent 100%)',
        }}
      />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 rounded-xl p-2.5"
              style={{
                background: 'rgba(124,92,255,0.12)',
                boxShadow: '0 0 14px rgba(124,92,255,0.20), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <Brain className="h-5 w-5 text-discovery-500" />
            </div>
            <div>
              <h3 className="text-h4 font-sora font-semibold leading-tight text-neutral-text dark:text-dark-text">
                Today&apos;s Patterns
              </h3>
              <p className="mt-0.5 text-xs text-neutral-muted dark:text-dark-muted">
                {hasInsights
                  ? 'Observations based on your recent logs'
                  : 'Observations appear as your daily picture builds'}
              </p>
            </div>
          </div>

          <div className="ml-3 flex flex-shrink-0 flex-col items-end gap-0.5 pt-0">
            <SignalDots count={signalCount} total={3} />
            <span className="text-[10px] font-medium tracking-wide text-discovery-500/75">
              {progressState.label}
            </span>
          </div>
        </div>

        {hasInsights ? (
          <div className="space-y-2.5">
            {insights.map((insight, index) => (
              <InsightRow key={index} insight={insight} index={index} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl px-5 py-5"
            style={{
              background:
                'radial-gradient(circle at 18% 30%, rgba(124,92,255,0.10) 0%, rgba(124,92,255,0.05) 22%, rgba(124,92,255,0.03) 55%, transparent 100%), linear-gradient(135deg, rgba(124,92,255,0.06) 0%, rgba(124,92,255,0.025) 60%, transparent 100%)',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: 'rgba(124,92,255,0.11)',
                  boxShadow: '0 0 16px rgba(124,92,255,0.16)',
                }}
              >
                <Activity className="text-discovery-500" style={{ width: '17px', height: '17px' }} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1.5 text-body-sm font-semibold leading-snug text-neutral-text dark:text-dark-text">
                  {progressState.headline}
                </p>

                {progressState.body && (
                  <p className="text-xs leading-relaxed text-neutral-muted dark:text-dark-muted">
                    {progressState.body}
                  </p>
                )}

                {progressState.cta && (
                  <button
                    onClick={() => navigate('/bm-log')}
                    className="group mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-discovery-500/85 transition-colors hover:text-discovery-500"
                  >
                    <span className="underline-offset-2 group-hover:underline">
                      {progressState.cta}
                    </span>
                    <span className="translate-y-[1px] transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          <Sparkles className="h-3 w-3 flex-shrink-0 text-discovery-500/55" />
          <p className="text-xs leading-relaxed text-neutral-muted/75 dark:text-dark-muted/75">
            {hasInsights
              ? 'Logging across more categories strengthens pattern detection'
              : "The more complete today's picture, the sharper your observations get"}
          </p>
        </div>
      </div>
    </div>
  );
}
