import { Brain, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../Card';

interface PatternInsightsWidgetProps {
  bmCount: number;
  symptomsCount: number;
  stressLevel: number | null;
  hydrationPercentage: number;
  loading: boolean;
}

type InsightConfidence = 'high' | 'medium' | 'low';
type InsightType = 'positive' | 'suggestion' | 'neutral';

interface Insight {
  icon: typeof Brain;
  title: string;
  message: string;
  type: InsightType;
  confidence: InsightConfidence;
}

export default function PatternInsightsWidget({
  bmCount,
  symptomsCount,
  stressLevel,
  hydrationPercentage,
  loading,
}: PatternInsightsWidgetProps) {
  if (loading) {
    return (
      <Card variant="discovery" glowIntensity="subtle">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-neutral-border dark:bg-dark-border rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const generateInsights = (): Insight[] => {
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
        title: 'Elevated stress detected',
        message: 'High stress may affect digestion. Consider relaxation techniques when possible.',
        type: 'suggestion',
        confidence: 'high',
      });
    }

    if (insights.length === 0) {
      insights.push({
        icon: Brain,
        title: 'Building your health profile',
        message: 'Continue logging to help identify patterns. Insights become more accurate over time.',
        type: 'neutral',
        confidence: 'low',
      });
    }

    return insights.slice(0, 3);
  };

  const insights = generateInsights();

  const hasHighConfidenceInsight = insights.some(i => i.confidence === 'high' && i.type !== 'neutral');
  const hasMediumConfidenceInsight = insights.some(i => i.confidence === 'medium');

  const glowIntensity = hasHighConfidenceInsight ? 'bright' : hasMediumConfidenceInsight ? 'medium' : 'subtle';

  const getInsightStyle = (type: InsightType) => {
    switch (type) {
      case 'positive':
        return 'bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/20 dark:border-brand-500/20';
      case 'suggestion':
        return 'bg-signal-500/5 dark:bg-signal-500/10 border-signal-500/20 dark:border-signal-500/20';
      default:
        return 'bg-neutral-bg dark:bg-dark-surface border-neutral-border dark:border-dark-border';
    }
  };

  const getIconStyle = (type: InsightType, confidence: InsightConfidence) => {
    const baseStyle = confidence === 'high' ? 'shadow-glow-subtle' : '';

    switch (type) {
      case 'positive':
        return `bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 ${baseStyle}`;
      case 'suggestion':
        return `bg-signal-500/10 dark:bg-signal-500/20 text-signal-500 ${baseStyle}`;
      default:
        return 'bg-discovery-500/10 dark:bg-discovery-500/20 text-discovery-500';
    }
  };

  return (
    <Card variant="discovery" glowIntensity={glowIntensity}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-discovery-500/10 dark:bg-discovery-500/20 shadow-glow-subtle">
            <Brain className="h-5 w-5 text-discovery-500" />
          </div>
          <div>
            <h3 className="text-h5 font-sora font-semibold text-neutral-text dark:text-dark-text flex items-center gap-2">
              What Your Body is Showing
              <span className="px-2 py-0.5 text-xs font-medium bg-discovery-500/10 text-discovery-500 rounded-full">
                AI
              </span>
            </h3>
            <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
              Patterns based on your recent logs
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all ${getInsightStyle(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getIconStyle(
                    insight.type,
                    insight.confidence
                  )}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-body-md font-semibold text-neutral-text dark:text-dark-text">
                      {insight.title}
                    </p>
                    {insight.confidence === 'high' && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-discovery-500/10 text-discovery-500 rounded">
                        High confidence
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm text-neutral-muted dark:text-dark-muted leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-border dark:border-dark-border">
        <div className="flex items-center gap-2 text-body-sm text-neutral-muted dark:text-dark-muted">
          <Sparkles className="h-4 w-4 text-discovery-500" />
          <p>Insights improve with consistent logging over time</p>
        </div>
      </div>
    </Card>
  );
}
