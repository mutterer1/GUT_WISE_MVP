import { Waves, TrendingUp, Minus } from 'lucide-react';
import Card from '../Card';

interface BMCountWidgetProps {
  count: number;
  loading: boolean;
}

export default function BMCountWidget({ count, loading }: BMCountWidgetProps) {
  if (loading) {
    return (
      <Card variant="elevated">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="h-3 bg-neutral-border dark:bg-dark-border rounded w-28"></div>
              <div className="h-9 bg-neutral-border dark:bg-dark-border rounded w-10"></div>
            </div>
            <div className="w-12 h-12 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
          </div>
          <div className="h-11 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
          <div className="mt-4 h-3 bg-neutral-border dark:bg-dark-border rounded w-44"></div>
        </div>
      </Card>
    );
  }

  const getStatus = () => {
    if (count === 0) {
      return {
        message: 'Nothing logged yet today',
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
        bgColor: 'bg-brand-500/10 dark:bg-brand-500/15',
      };
    }
    return {
      message: 'Above average today',
      color: 'text-signal-500',
      icon: TrendingUp,
      bgColor: 'bg-signal-500/10 dark:bg-signal-500/15',
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <Card variant="elevated" className="transition-all duration-200 hover:-translate-y-px hover:shadow-md dark:hover:shadow-dark-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-medium text-neutral-muted dark:text-dark-muted mb-1 uppercase tracking-wider">
            Bowel Movements
          </p>
          <p className="text-display-md font-sora font-bold text-neutral-text dark:text-dark-text leading-none">{count}</p>
        </div>
        <div className="w-11 h-11 bg-signal-500/10 dark:bg-signal-500/15 rounded-xl flex items-center justify-center">
          <Waves className="h-5 w-5 text-signal-500" />
        </div>
      </div>

      <div className={`flex items-center gap-2 ${status.bgColor} px-3 py-2.5 rounded-xl`}>
        <StatusIcon className={`h-4 w-4 flex-shrink-0 ${status.color}`} />
        <span className={`text-body-sm font-medium ${status.color}`}>{status.message}</span>
      </div>

      <p className="mt-3 text-xs text-neutral-muted dark:text-dark-muted">
        Typical range: 1\u20133 movements per day
      </p>
    </Card>
  );
}
