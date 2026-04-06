import { Activity, TrendingUp, Minus } from 'lucide-react';
import Card from '../Card';

interface BMCountWidgetProps {
  count: number;
  loading: boolean;
}

export default function BMCountWidget({ count, loading }: BMCountWidgetProps) {
  if (loading) {
    return (
      <Card variant="elevated">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-neutral-border dark:bg-dark-border rounded w-1/2"></div>
          <div className="h-12 bg-neutral-border dark:bg-dark-border rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  const getStatus = () => {
    if (count === 0) {
      return {
        message: 'No movements logged yet today',
        color: 'text-neutral-muted dark:text-dark-muted',
        icon: Minus,
        bgColor: 'bg-neutral-bg dark:bg-dark-surface',
      };
    }
    if (count <= 2) {
      return {
        message: 'Healthy range',
        color: 'text-brand-500',
        icon: TrendingUp,
        bgColor: 'bg-brand-500/10 dark:bg-brand-500/20',
      };
    }
    return {
      message: 'Above average',
      color: 'text-brand-300',
      icon: TrendingUp,
      bgColor: 'bg-brand-500/10 dark:bg-brand-500/20',
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <Card variant="elevated">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-body-sm font-medium text-neutral-muted dark:text-dark-muted mb-1">Bowel Movements</p>
          <p className="text-display-md font-sora font-semibold text-neutral-text dark:text-dark-text">{count}</p>
        </div>
        <div className="w-12 h-12 bg-signal-500/10 dark:bg-signal-500/20 rounded-xl flex items-center justify-center">
          <Activity className="h-6 w-6 text-signal-500" />
        </div>
      </div>

      <div className={`flex items-center gap-2 ${status.bgColor} p-3 rounded-xl`}>
        <StatusIcon className={`h-4 w-4 ${status.color}`} />
        <span className={`text-body-sm font-medium ${status.color}`}>{status.message}</span>
      </div>

      <div className="mt-4 text-xs text-neutral-muted dark:text-dark-muted">
        <p>Typical range: 1-3 movements per day</p>
      </div>
    </Card>
  );
}
