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
      headline: 'Today\'s signals are still taking shape.',
      body: 'A few core entries — movement, hydration, stress — will help GutWise surface its first observations for today.',
      cta: 'Start with today\'s first entry',
    };
  }
  if (signalCount === 1) {
    return {
      label: 'Signal received',
      headline: 'Your daily picture is starting to form.',
      body: 'One signal logged. A few more entries will let GutWise begin connecting today\'s dots.',
      cta: 'Keep building today\'s snapshot',
    };
  }
  if (signalCount === 2) {
    return {
      label: 'Signals building',
      headline: 'Observations are getting closer.',
      body: 'Two signals in. Log one more area and GutWise will have enough to surface today\'s first patterns.',
      cta: 'Complete today\'s picture',
    };
  }
  return {
    label: 'Pattern ready',
    headline: 'Today\'s picture is taking shape.',
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
      title: 'Hydration goal reached',
      message: "You've met your daily water intake target. Consistent hydration supports healthy digestion.",
      type: 'positive',
      confidence: 'high',
    });
  } else if (hydrationPercentage < 50 && hydrationPercentage > 0) {
    insights.push({
      icon: TrendingUp,
      title: 'Hydration opportunity',
      message: 'Your water intake is below target. Increasing fluids may improve digestive comfort.',
      type: 'suggestion',
      confidence: 'medium',
    });
  }

  if (symptomsCount === 0 && bmCount > 0) {
    insights.push({
      icon: Sparkles,
      title: 'No symptoms reported',
      message: "A day without logged symptoms. Your body seems to be responding well today.",
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
              ? 'w-2 h-2 bg-discovery-500 shadow-[0_0_6px_rgba(124,92,255,0.6)]'
              : 'w-1.5 h-1.5 bg-neutral-border dark:bg-dark-border'
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
      className={`px-4 py-3.5 rounded-xl border transition-all animate-fade-in ${rowStyle}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${iconStyle}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-body-sm font-semibold text-neutral-text dark:text-dark-text leading-snug">
              {insight.title}
            </p>
            {insight.confidence === 'high' && insight.type !== 'neutral' && (
              <span className="px-1.5 py-px text-[10px] font-medium bg-discovery-500/10 text-discovery-500 rounded border border-discovery-500/15 flex-shrink-0 leading-4">
                Strong
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-muted dark:text-dark-muted leading-relaxed">
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
      <div className="relative overflow-hidden rounded-2xl bg-neutral-surface dark:bg-dark-surface border border-discovery-500/15 dark:border-discovery-500/10 shadow-glow-subtle p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-neutral-border dark:bg-dark-border rounded-xl flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-neutral-border dark:bg-dark-border rounded w-40" />
              <div className="h-3 bg-neutral-border dark:bg-dark-border rounded w-52" />
            </div>
          </div>
          <div className="space-y-2.5 pt-1">
            {[1, 2].map((i) => (
              <div key={i} className="h-[72px] bg-neutral-border dark:bg-dark-border rounded-xl" />
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

  const hasHighConfidence = insights.some(i => i.confidence === 'high');
  const hasMediumConfidence = insights.some(i => i.confidence === 'medium');
  const borderClass = hasHighConfidence
    ? 'border-discovery-500/30 dark:border-discovery-500/20 shadow-glow-bright dark:shadow-glow-bright dark:animate-glow-pulse'
    : hasMediumConfidence
    ? 'border-discovery-300/20 dark:border-discovery-500/15 shadow-glow-medium dark:shadow-glow-medium'
    : 'border-discovery-500/15 dark:border-discovery-500/10 shadow-glow-subtle dark:shadow-glow-subtle';

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-neutral-surface dark:bg-dark-surface border transition-all ${borderClass} p-6`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(124,92,255,0.14) 0%, rgba(124,92,255,0.05) 50%, transparent 70%)',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(124,92,255,0.07) 0%, transparent 70%)',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 w-full h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(124,92,255,0.25) 40%, rgba(124,92,255,0.14) 70%, transparent 100%)',
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl flex-shrink-0"
              style={{
                background: 'rgba(124,92,255,0.12)',
                boxShadow: '0 0 14px rgba(124,92,255,0.20), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <Brain className="h-5 w-5 text-discovery-500" />
            </div>
            <div>
              <h3 className="text-h4 font-sora font-semibold text-neutral-text dark:text-dark-text leading-tight">
                Today's Patterns
              </h3>
              <p className="text-xs text-neutral-muted dark:text-dark-muted mt-0.5">
                {hasInsights
                  ? 'Observations based on your recent logs'
                  : 'Observations appear as your daily picture builds'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 pt-0 flex-shrink-0 ml-3">
            <SignalDots count={signalCount} total={3} />
            <span className="text-[10px] font-medium text-discovery-500/60 tracking-wide">
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
            className="rounded-xl px-4 py-4"
            style={{
              background: 'linear-gradient(135deg, rgba(124,92,255,0.06) 0%, rgba(124,92,255,0.02) 60%, transparent 100%)',
            }}
          >
            <div className="flex items-start gap-3.5">
              <div
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                style={{
                  background: 'rgba(124,92,255,0.10)',
                  boxShadow: '0 0 12px rgba(124,92,255,0.18)',
                }}
              >
                <Activity className="text-discovery-500" style={{ width: '16px', height: '16px' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-semibold text-neutral-text dark:text-dark-text leading-snug mb-1">
                  {progressState.headline}
                </p>
                {progressState.body && (
                  <p className="text-xs text-neutral-muted dark:text-dark-muted leading-relaxed">
                    {progressState.body}
                  </p>
                )}
                {progressState.cta && (
                  <button
                    onClick={() => navigate('/bm-log')}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-discovery-500/75 hover:text-discovery-500 transition-colors group"
                  >
                    <span className="group-hover:underline underline-offset-2">{progressState.cta}</span>
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-discovery-500/55 flex-shrink-0" />
          <p className="text-xs text-neutral-muted/75 dark:text-dark-muted/75 leading-relaxed">
            {hasInsights
              ? 'Logging across more categories strengthens pattern detection'
              : 'The more complete today\'s picture, the sharper your observations get'}
          </p>
        </div>
      </div>
    </div>
  );
}
