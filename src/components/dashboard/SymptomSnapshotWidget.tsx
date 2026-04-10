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
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="h-3 bg-neutral-border dark:bg-dark-border rounded w-28"></div>
              <div className="h-9 bg-neutral-border dark:bg-dark-border rounded w-8"></div>
            </div>
            <div className="w-11 h-11 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
          </div>
          <div className="h-4 bg-neutral-border dark:bg-dark-border rounded w-1/2 mb-2"></div>
          <div className="h-2 bg-neutral-border dark:bg-dark-border rounded-full mb-3"></div>
          <div className="h-16 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
        </div>
      </Card>
    );
  }

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-500 border-brand-500/15';
    if (severity <= 6) return 'bg-signal-500/10 dark:bg-signal-500/15 text-signal-500 border-signal-500/15';
    return 'bg-signal-700/10 dark:bg-signal-700/15 text-signal-700 border-signal-700/15';
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
            <p className="text-xs font-medium text-neutral-muted dark:text-dark-muted mb-1.5 uppercase tracking-wide">
              Symptoms Today
            </p>
            <p className="text-display-md font-sora font-semibold text-brand-500">0</p>
          </div>
          <div className="w-11 h-11 bg-brand-500/10 dark:bg-brand-500/15 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-brand-500" />
          </div>
        </div>
        <div className="bg-brand-500/5 dark:bg-brand-500/08 px-4 py-3 rounded-xl border border-brand-500/10 dark:border-brand-500/15">
          <p className="text-body-sm font-medium text-neutral-text dark:text-dark-text">No symptoms logged</p>
          <p className="text-xs text-neutral-muted dark:text-dark-muted mt-0.5">Your body seems to be doing well today</p>
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
          <p className="text-xs font-medium text-neutral-muted dark:text-dark-muted mb-1.5 uppercase tracking-wide">
            Symptoms Today
          </p>
          <p className="text-display-md font-sora font-semibold text-neutral-text dark:text-dark-text">{symptoms.length}</p>
        </div>
        <div className="w-11 h-11 bg-signal-500/10 dark:bg-signal-500/15 rounded-xl flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-signal-500" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-muted dark:text-dark-muted">Average severity</span>
          <span className="text-xs font-semibold text-neutral-text dark:text-dark-text">
            {averageSeverity.toFixed(1)}/10
          </span>
        </div>

        <div className="w-full bg-neutral-border dark:bg-dark-border rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${(averageSeverity / 10) * 100}%` }}
          />
        </div>

        <div className={`px-3 py-2.5 rounded-xl border ${getSeverityColor(maxSeverity)}`}>
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-xs font-medium opacity-70">Most recent</p>
            <span className="text-xs opacity-60">
              {new Date(mostRecent.logged_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-body-sm font-semibold">{mostRecent.symptom_type}</p>
            <span className="text-xs">
              {getSeverityLabel(mostRecent.severity)} · {mostRecent.severity}/10
            </span>
          </div>
        </div>

        {symptoms.length > 1 && (
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-neutral-muted dark:text-dark-muted flex-shrink-0" />
            <p className="text-xs text-neutral-muted dark:text-dark-muted">
              {symptoms.length} symptoms logged today
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
