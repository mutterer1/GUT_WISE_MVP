import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { ClinicalAlert } from '../../utils/clinicalReportQueries';

interface ClinicalAlertsSectionProps {
  alerts: ClinicalAlert[];
}

export default function ClinicalAlertsSection({ alerts }: ClinicalAlertsSectionProps) {
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const highAlerts = alerts.filter((a) => a.severity === 'high');
  const mediumAlerts = alerts.filter((a) => a.severity === 'medium');
  const lowAlerts = alerts.filter((a) => a.severity === 'low');

  const hasAlerts = alerts.length > 0;

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          container: 'bg-[#C28F94]/10 dark:bg-[#C28F94]/10 border-[#C28F94]/40',
          icon: 'text-[#8D5D62] dark:text-[#C28F94]',
          badge: 'bg-[#C28F94]/20 text-[#8D5D62] dark:text-[#C28F94]',
          text: 'text-gray-700 dark:text-gray-300',
          title: 'text-gray-900 dark:text-white',
        };
      case 'high':
        return {
          container:
            'bg-orange-50/60 dark:bg-orange-900/10 border-orange-300/50 dark:border-orange-700/30',
          icon: 'text-orange-600 dark:text-orange-400',
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
          text: 'text-gray-700 dark:text-gray-300',
          title: 'text-gray-900 dark:text-white',
        };
      case 'medium':
        return {
          container:
            'bg-amber-50/60 dark:bg-amber-900/10 border-amber-300/50 dark:border-amber-700/30',
          icon: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
          text: 'text-gray-700 dark:text-gray-300',
          title: 'text-gray-900 dark:text-white',
        };
      default:
        return {
          container: 'bg-[#4A8FA8]/8 dark:bg-[#4A8FA8]/10 border-[#4A8FA8]/25',
          icon: 'text-[#4A8FA8]',
          badge: 'bg-[#4A8FA8]/15 text-[#2C617D] dark:text-[#8EBFD8]',
          text: 'text-gray-700 dark:text-gray-300',
          title: 'text-gray-900 dark:text-white',
        };
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 print:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/[0.06]">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Review Flags
          {hasAlerts && (
            <span className="ml-2 font-normal normal-case tracking-normal text-gray-400 dark:text-gray-500">
              - {alerts.length} total
            </span>
          )}
        </p>
        {hasAlerts && (
          <div className="flex items-center gap-3 text-xs">
            {criticalAlerts.length > 0 && (
              <span className="font-semibold text-[#8D5D62] dark:text-[#C28F94]">
                {criticalAlerts.length} critical
              </span>
            )}
            {highAlerts.length > 0 && (
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {highAlerts.length} high
              </span>
            )}
            {mediumAlerts.length > 0 && (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {mediumAlerts.length} medium
              </span>
            )}
            {lowAlerts.length > 0 && (
              <span className="font-semibold text-[#4A8FA8]">{lowAlerts.length} low</span>
            )}
          </div>
        )}
      </div>

      {!hasAlerts ? (
        <div className="flex items-start gap-3 rounded-xl border border-[#4A8FA8]/20 bg-[#4A8FA8]/8 p-4 dark:bg-[#4A8FA8]/10">
          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#4A8FA8]" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            No review flags were generated for this period based on the data that was logged.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="mb-1 flex items-center gap-4 border-b border-gray-50 pb-3 text-xs text-gray-500 dark:border-white/[0.04] dark:text-gray-400">
            <div>
              <span className="font-medium text-[#8D5D62] dark:text-[#C28F94]">
                Critical / High
              </span>{' '}
              - review soon with your clinician
            </div>
            <div className="select-none text-gray-300 dark:text-white/20">|</div>
            <div>
              <span className="font-medium text-amber-600 dark:text-amber-400">Medium</span> -
              mention at your next visit
            </div>
            <div className="select-none text-gray-300 dark:text-white/20">|</div>
            <div>
              <span className="font-medium text-[#4A8FA8]">Low</span> - useful context to keep in
              mind
            </div>
          </div>

          {alerts.map((alert, idx) => {
            const style = getAlertStyle(alert.severity);

            return (
              <div key={idx} className={`rounded-xl border p-4 ${style.container}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 ${style.icon}`}>
                    {getAlertIcon(alert.severity)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-start justify-between gap-3">
                      <h3 className={`text-sm font-semibold leading-snug ${style.title}`}>
                        {alert.message}
                      </h3>
                      <span
                        className={`flex-shrink-0 rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${style.badge}`}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    <p className={`mb-2 text-xs leading-relaxed ${style.text}`}>{alert.details}</p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Dates:
                      </span>
                      {alert.affectedDates.slice(0, 5).map((date, dateIdx) => (
                        <span
                          key={dateIdx}
                          className="rounded bg-white/60 px-1.5 py-0.5 text-xs text-gray-700 dark:bg-white/10 dark:text-gray-300"
                        >
                          {new Date(date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      ))}
                      {alert.affectedDates.length > 5 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          +{alert.affectedDates.length - 5} more
                        </span>
                      )}
                    </div>

                    {alert.severity === 'critical' && (
                      <p className="mt-2 text-xs font-medium text-[#8D5D62] dark:text-[#C28F94]">
                        Consider sharing this with your healthcare provider promptly.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
