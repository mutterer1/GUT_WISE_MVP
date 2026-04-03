import { Droplet, TrendingUp, CheckCircle } from 'lucide-react';
import Card from '../Card';

interface HydrationWidgetProps {
  totalMl: number;
  targetMl: number;
  entries: number;
  loading: boolean;
}

export default function HydrationWidget({
  totalMl,
  targetMl,
  entries,
  loading,
}: HydrationWidgetProps) {
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

  const percentage = Math.min((totalMl / targetMl) * 100, 100);
  const remainingMl = Math.max(targetMl - totalMl, 0);
  const cupsRemaining = Math.ceil(remainingMl / 250);
  const isComplete = totalMl >= targetMl;

  const getStatusColor = () => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getStatusMessage = () => {
    if (percentage >= 100) return 'Goal achieved!';
    if (percentage >= 75) return 'Almost there!';
    if (percentage >= 50) return 'Great progress!';
    if (percentage >= 25) return 'Keep going!';
    return 'Stay hydrated!';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Hydration Today</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900">
              {(totalMl / 1000).toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">/ {targetMl / 1000}L</p>
          </div>
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isComplete ? 'bg-green-100' : 'bg-blue-100'
          }`}
        >
          {isComplete ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <Droplet className="h-6 w-6 text-blue-600" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${
              isComplete
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-blue-400 to-cyan-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className={`text-sm font-semibold ${getStatusColor()}`}>
            {Math.round(percentage)}% Complete
          </span>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </span>
        </div>

        {!isComplete ? (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">
                {remainingMl}ml to go
              </p>
            </div>
            <p className="text-xs text-blue-700">
              That's about {cupsRemaining} more {cupsRemaining === 1 ? 'cup' : 'cups'} of water
            </p>
          </div>
        ) : (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                Daily goal achieved! Well done!
              </p>
            </div>
            {totalMl > targetMl && (
              <p className="text-xs text-green-700 mt-1">
                You've exceeded your goal by {totalMl - targetMl}ml
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">Logged</p>
            <p className="text-sm font-semibold text-gray-900">{entries}</p>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">Average</p>
            <p className="text-sm font-semibold text-gray-900">
              {entries > 0 ? Math.round(totalMl / entries) : 0}ml
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
