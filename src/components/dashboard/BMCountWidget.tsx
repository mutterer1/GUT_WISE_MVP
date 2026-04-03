import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '../Card';

interface BMCountWidgetProps {
  count: number;
  loading: boolean;
}

export default function BMCountWidget({ count, loading }: BMCountWidgetProps) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  const getStatus = () => {
    if (count === 0) {
      return {
        message: 'No movements logged yet today',
        color: 'text-gray-600',
        icon: Minus,
        bgColor: 'bg-gray-100',
      };
    }
    if (count === 1) {
      return {
        message: 'Normal frequency',
        color: 'text-green-600',
        icon: TrendingUp,
        bgColor: 'bg-green-50',
      };
    }
    if (count === 2) {
      return {
        message: 'Healthy range',
        color: 'text-green-600',
        icon: TrendingUp,
        bgColor: 'bg-green-50',
      };
    }
    return {
      message: 'Above average',
      color: 'text-blue-600',
      icon: TrendingUp,
      bgColor: 'bg-blue-50',
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Bowel Movements</p>
          <p className="text-4xl font-bold text-gray-900">{count}</p>
        </div>
        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
          <Activity className="h-6 w-6 text-teal-600" />
        </div>
      </div>

      <div className={`flex items-center gap-2 ${status.bgColor} p-3 rounded-lg`}>
        <StatusIcon className={`h-4 w-4 ${status.color}`} />
        <span className={`text-sm font-medium ${status.color}`}>{status.message}</span>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Typical range: 1-3 movements per day</p>
      </div>
    </Card>
  );
}
