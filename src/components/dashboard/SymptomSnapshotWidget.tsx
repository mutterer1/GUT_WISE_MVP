import { AlertCircle, CheckCircle, Activity } from 'lucide-react';
import Card from '../Card';

interface Symptom {
  symptom_type: string;
  severity: number;
  logged_at: string;
}

interface SymptomSnapshotWidgetProps {
  symptoms: Symptom[];
  loading: boolean;
}

export default function SymptomSnapshotWidget({
  symptoms,
  loading,
}: SymptomSnapshotWidgetProps) {
  if (loading) {
    return (
      <Card variant="elevated">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-neutral-border dark:bg-dark-border rounded w-1/2"></div>
          <div className="h-12 bg-neutral-border dark:bg-dark-border rounded"></div>
        </div>
      </Card>
    );
  }

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 border-brand-500/20';
    if (severity <= 6) return 'bg-signal-500/10 dark:bg-signal-500/20 text-signal-500 border-signal-500/20';
    return 'bg-signal-700/10 dark:bg-signal-700/20 text-signal-700 border-signal-700/20';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  if (symptoms.length === 0) {
    return (
      <Card variant="elevated">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-body-sm font-medium text-neutral-muted dark:text-dark-muted mb-1">Symptoms Today</p>
            <p className="text-display-md font-sora font-semibold text-brand-500">0</p>
          </div>
          <div className="w-12 h-12 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-brand-500" />
          </div>
        </div>

        <div className="bg-brand-500/5 dark:bg-brand-500/10 p-4 rounded-xl text-center border border-brand-500/10 dark:border-brand-500/20">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-brand-500" />
          <p className="text-body-sm font-medium text-neutral-text dark:text-dark-text">No symptoms logged</p>
          <p className="text-xs text-neutral-muted dark:text-dark-muted mt-1">Your body seems to be doing well today</p>
        </div>
      </Card>
    );
  }

  const averageSeverity =
    symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length;
  const maxSeverity = Math.max(...symptoms.map((s) => s.severity));
  const mostRecent = symptoms[0];

  const getProgressColor = () => {
    if (averageSeverity <= 3) return 'bg-brand-500';
    if (averageSeverity <= 6) return 'bg-signal-500';
    return 'bg-signal-700';
  };

  return (
    <Card variant="elevated">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-body-sm font-medium text-neutral-muted dark:text-dark-muted mb-1">Symptoms Today</p>
          <p className="text-display-md font-sora font-semibold text-neutral-text dark:text-dark-text">{symptoms.length}</p>
        </div>
        <div className="w-12 h-12 bg-signal-500/10 dark:bg-signal-500/20 rounded-xl flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-signal-500" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-body-sm text-neutral-muted dark:text-dark-muted">Average Severity</span>
          <span className="text-body-sm font-semibold text-neutral-text dark:text-dark-text">
            {averageSeverity.toFixed(1)}/10
          </span>
        </div>

        <div className="w-full bg-neutral-border dark:bg-dark-border rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${(averageSeverity / 10) * 100}%` }}
          />
        </div>

        <div
          className={`p-3 rounded-xl border ${getSeverityColor(maxSeverity)}`}
        >
          <p className="text-xs font-medium mb-1 opacity-80">Most Recent</p>
          <p className="text-body-sm font-semibold">{mostRecent.symptom_type}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs">
              {getSeverityLabel(mostRecent.severity)} ({mostRecent.severity}/10)
            </span>
            <span className="text-xs opacity-75">
              {new Date(mostRecent.logged_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {symptoms.length > 1 && (
          <div className="bg-neutral-bg dark:bg-dark-surface p-3 rounded-xl">
            <p className="text-xs text-neutral-muted dark:text-dark-muted">
              <Activity className="inline h-3 w-3 mr-1" />
              {symptoms.length} symptoms logged today
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
