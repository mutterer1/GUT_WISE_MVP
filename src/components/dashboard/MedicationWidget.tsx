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
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="h-3 bg-neutral-border dark:bg-dark-border rounded w-32"></div>
              <div className="h-9 bg-neutral-border dark:bg-dark-border rounded w-8"></div>
            </div>
            <div className="w-11 h-11 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
          </div>
          <div className="h-3 bg-neutral-border dark:bg-dark-border rounded-full mb-3"></div>
          <div className="space-y-2">
            <div className="h-14 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
            <div className="h-14 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
          </div>
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
      <Card variant="elevated" className="transition-all duration-200 hover:-translate-y-px hover:shadow-md dark:hover:shadow-dark-md">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-medium text-neutral-muted dark:text-dark-muted mb-1 uppercase tracking-wider">
              Medications Today
            </p>
            <p className="text-display-md font-sora font-bold text-neutral-muted/50 dark:text-dark-muted/50 leading-none">0</p>
          </div>
          <div className="w-11 h-11 bg-neutral-bg dark:bg-dark-surface rounded-xl flex items-center justify-center">
            <Pill className="h-5 w-5 text-neutral-muted dark:text-dark-muted" />
          </div>
        </div>
        <div className="bg-neutral-bg dark:bg-dark-surface px-4 py-3 rounded-xl border border-neutral-border/50 dark:border-dark-border">
          <p className="text-body-sm text-neutral-muted dark:text-dark-muted">Log a medication to track adherence</p>
        </div>
      </Card>
    );
  }

  const getAdherenceColor = () => {
    if (adherenceRate >= 80) return 'bg-brand-500';
    return 'bg-signal-500';
  };

  return (
    <Card variant="elevated" className="transition-all duration-200 hover:-translate-y-px hover:shadow-md dark:hover:shadow-dark-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-medium text-neutral-muted dark:text-dark-muted mb-1 uppercase tracking-wider">
            Medications Today
          </p>
          <p className="text-display-md font-sora font-bold text-neutral-text dark:text-dark-text leading-none">{medications.length}</p>
        </div>
        <div className="w-11 h-11 bg-brand-500/10 dark:bg-brand-500/15 rounded-xl flex items-center justify-center">
          <Pill className="h-5 w-5 text-brand-500" />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-neutral-muted dark:text-dark-muted">Adherence</span>
          <span className="text-xs font-semibold text-neutral-text dark:text-dark-text">
            {Math.round(adherenceRate)}%
          </span>
        </div>
        <div className="w-full bg-neutral-border dark:bg-dark-border rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getAdherenceColor()}`}
            style={{ width: `${adherenceRate}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {medications.map((med) => {
          const time = new Date(med.logged_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={med.id}
              className={`px-3 py-2.5 rounded-xl border ${
                med.taken_as_prescribed
                  ? 'bg-brand-500/5 dark:bg-brand-500/08 border-brand-500/15 dark:border-brand-500/20'
                  : 'bg-signal-500/5 dark:bg-signal-500/08 border-signal-500/15 dark:border-signal-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {med.taken_as_prescribed ? (
                    <CheckCircle className="h-4 w-4 text-brand-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-signal-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-neutral-text dark:text-dark-text truncate">
                      {med.medication_name}
                    </p>
                    <p className="text-xs text-neutral-muted dark:text-dark-muted">{med.dosage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-muted dark:text-dark-muted flex-shrink-0 ml-2">
                  <Clock className="h-3 w-3" />
                  <span>{time}</span>
                </div>
              </div>
              {!med.taken_as_prescribed && (
                <p className="text-xs text-signal-500 mt-1.5 ml-6">Not taken as prescribed</p>
              )}
            </div>
          );
        })}
      </div>

      {adherenceRate === 100 && (
        <div className="mt-3 bg-brand-500/5 dark:bg-brand-500/08 px-3 py-2.5 rounded-xl border border-brand-500/15 dark:border-brand-500/20">
          <p className="text-body-sm font-medium text-brand-500 text-center">Full adherence today</p>
        </div>
      )}
    </Card>
  );
}
