import { TrendingUp, Sparkles, Brain, Calendar } from 'lucide-react';
import Card from '../Card';

interface PatternInsightsWidgetProps {
  bmCount: number;
  symptomsCount: number;
  stressLevel: number | null;
  hydrationPercentage: number;
  loading: boolean;
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
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const generateInsights = () => {
    const insights: Array<{
      icon: any;
      title: string;
      message: string;
      type: 'positive' | 'neutral' | 'suggestion';
    }> = [];

    if (hydrationPercentage >= 100) {
      insights.push({
        icon: Sparkles,
        title: 'Excellent Hydration',
        message: "You've met your hydration goal today! This helps maintain healthy digestion.",
        type: 'positive',
      });
    } else if (hydrationPercentage < 50) {
      insights.push({
        icon: TrendingUp,
        title: 'Hydration Reminder',
        message: 'Increase water intake to support digestive health and overall wellbeing.',
        type: 'suggestion',
      });
    }

    if (symptomsCount === 0 && bmCount > 0) {
      insights.push({
        icon: Sparkles,
        title: 'Symptom-Free Day',
        message: 'Great job! No symptoms logged today. Keep up your healthy routine.',
        type: 'positive',
      });
    }

    if (bmCount >= 1 && bmCount <= 3) {
      insights.push({
        icon: TrendingUp,
        title: 'Normal Bowel Pattern',
        message: 'Your bowel movement frequency is within the healthy range today.',
        type: 'positive',
      });
    }

    if (stressLevel !== null && stressLevel <= 4) {
      insights.push({
        icon: Brain,
        title: 'Low Stress Levels',
        message: 'Your stress levels are manageable today. This positively affects gut health.',
        type: 'positive',
      });
    } else if (stressLevel !== null && stressLevel >= 7) {
      insights.push({
        icon: Brain,
        title: 'Elevated Stress',
        message: 'High stress can affect digestion. Consider relaxation techniques today.',
        type: 'suggestion',
      });
    }

    if (insights.length === 0) {
      insights.push({
        icon: Calendar,
        title: 'Building Your Health Profile',
        message: 'Keep logging your health activities to unlock personalized insights and patterns.',
        type: 'neutral',
      });
    }

    return insights.slice(0, 3);
  };

  const insights = generateInsights();

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'suggestion':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'suggestion':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            Health Insights
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Patterns and suggestions based on your data
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightStyle(insight.type)} transition-all hover:shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getIconStyle(
                    insight.type
                  )}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {insight.title}
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-100">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-teal-600" />
          <p className="text-xs text-teal-900 font-medium">
            More insights unlock as you track consistently over time
          </p>
        </div>
      </div>
    </Card>
  );
}
