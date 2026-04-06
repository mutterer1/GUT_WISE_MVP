import { Pill, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../Card';

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  logged_at: string;
  taken_as_prescribed: boolean;
}

interface MedicationWidgetProps {
  medications: Medication[];
  loading: boolean;
}

export default function MedicationWidget({
  medications,
  loading,
}: MedicationWidgetProps) {
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

  const adherenceRate =
    medications.length > 0
      ? (medications.filter((m) => m.taken_as_prescribed).length /
          medications.length) *
        100
      : 0;

  if (medications.length === 0) {
    return (
      <Card variant="elevated">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-body-sm font-medium text-neutral-muted dark:text-dark-muted mb-1">
              Medications Today
            </p>
            <p className="text-display-md font-sora font-semibold text-neutral-muted dark:text-dark-muted">0</p>
          </div>
          <div className="w-12 h-12 bg-neutral-bg dark:bg-dark-surface rounded-xl flex items-center justify-center">
            <Pill className="h-6 w-6 text-neutral-muted dark:text-dark-muted" />
          </div>
        </div>

        <div className="bg-neutral-bg dark:bg-dark-surface p-4 rounded-xl text-center">
          <p className="text-body-sm text-neutral-muted dark:text-dark-muted">No medications logged today</p>
          <p className="text-xs text-neutral-muted dark:text-dark-muted mt-1 opacity-75">
            Track your medications to monitor adherence
          </p>
        </div>
      </Card>
    );
  }

  const getAdherenceColor = () => {
    if (adherenceRate === 100) return 'bg-brand-500';
    if (adherenceRate >= 80) return 'bg-brand-500';
    return 'bg-signal-500';
  };

  return (
    <Card variant="elevated">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-body-sm font-medium text-neutral-muted dark:text-dark-muted mb-1">
            Medications Today
          </p>
          <p className="text-display-md font-sora font-semibold text-neutral-text dark:text-dark-text">{medications.length}</p>
        </div>
        <div className="w-12 h-12 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl flex items-center justify-center">
          <Pill className="h-6 w-6 text-brand-500" />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-body-sm text-neutral-muted dark:text-dark-muted">Adherence Rate</span>
          <span className="text-body-sm font-semibold text-neutral-text dark:text-dark-text">
            {Math.round(adherenceRate)}%
          </span>
        </div>
        <div className="w-full bg-neutral-border dark:bg-dark-border rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getAdherenceColor()}`}
            style={{ width: `${adherenceRate}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {medications.map((med) => {
          const time = new Date(med.logged_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={med.id}
              className={`p-3 rounded-xl border transition-all ${
                med.taken_as_prescribed
                  ? 'bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/20 dark:border-brand-500/30'
                  : 'bg-signal-500/5 dark:bg-signal-500/10 border-signal-500/20 dark:border-signal-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {med.taken_as_prescribed ? (
                      <CheckCircle className="h-4 w-4 text-brand-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-signal-500 flex-shrink-0" />
                    )}
                    <p className="text-body-sm font-semibold text-neutral-text dark:text-dark-text">
                      {med.medication_name}
                    </p>
                  </div>
                  <p className="text-xs text-neutral-muted dark:text-dark-muted mt-1 ml-6">{med.dosage}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-muted dark:text-dark-muted">
                  <Clock className="h-3 w-3" />
                  <span>{time}</span>
                </div>
              </div>
              {!med.taken_as_prescribed && (
                <p className="text-xs text-signal-500 mt-2 ml-6">
                  Not taken as prescribed
                </p>
              )}
            </div>
          );
        })}
      </div>

      {adherenceRate === 100 && (
        <div className="mt-4 bg-brand-500/5 dark:bg-brand-500/10 p-3 rounded-xl border border-brand-500/20 dark:border-brand-500/30">
          <p className="text-body-sm font-medium text-brand-500 text-center">
            Full adherence today
          </p>
        </div>
      )}
    </Card>
  );
}
