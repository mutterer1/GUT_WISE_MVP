import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { ClinicalAlert } from '../../utils/clinicalReportQueries';

interface ClinicalAlertsSectionProps {
  alerts: ClinicalAlert[];
}

export default function ClinicalAlertsSection({ alerts }: ClinicalAlertsSectionProps) {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const highAlerts = alerts.filter(a => a.severity === 'high');
  const mediumAlerts = alerts.filter(a => a.severity === 'medium');
  const lowAlerts = alerts.filter(a => a.severity === 'low');

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
          container: 'bg-orange-50/60 dark:bg-orange-900/10 border-orange-300/50 dark:border-orange-700/30',
          icon: 'text-orange-600 dark:text-orange-400',
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
          text: 'text-gray-700 dark:text-gray-300',
          title: 'text-gray-900 dark:text-white',
        };
      case 'medium':
        return {
          container: 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-300/50 dark:border-amber-700/30',
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
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mb-5 print:border-gray-300">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Clinical Alerts</p>
        {hasAlerts && (
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {criticalAlerts.length > 0 && (
              <span className="text-[#8D5D62] dark:text-[#C28F94] font-medium">{criticalAlerts.length} critical</span>
            )}
            {highAlerts.length > 0 && (
              <span className="text-orange-600 dark:text-orange-400 font-medium">{highAlerts.length} high</span>
            )}
            {mediumAlerts.length > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">{mediumAlerts.length} medium</span>
            )}
            {lowAlerts.length > 0 && (
              <span className="text-[#4A8FA8] font-medium">{lowAlerts.length} low</span>
            )}
          </div>
        )}
      </div>

      {!hasAlerts ? (
        <div className="flex items-start gap-3 bg-[#4A8FA8]/8 dark:bg-[#4A8FA8]/10 border border-[#4A8FA8]/20 rounded-xl p-4">
          <CheckCircle className="h-5 w-5 text-[#4A8FA8] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            No alerts triggered during this period. Monitored parameters are within acceptable ranges.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const style = getAlertStyle(alert.severity);

            return (
              <div
                key={idx}
                className={`border rounded-xl p-4 ${style.container}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 mt-0.5 ${style.icon}`}>
                    {getAlertIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h3 className={`text-sm font-semibold leading-snug ${style.title}`}>
                        {alert.message}
                      </h3>
                      <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded flex-shrink-0 ${style.badge}`}>
                        {alert.severity}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed mb-2 ${style.text}`}>
                      {alert.details}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Dates:</span>
                      {alert.affectedDates.slice(0, 5).map((date, dateIdx) => (
                        <span
                          key={dateIdx}
                          className="text-xs bg-white/60 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300"
                        >
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ))}
                      {alert.affectedDates.length > 5 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          +{alert.affectedDates.length - 5} more
                        </span>
                      )}
                    </div>

                    {alert.severity === 'critical' && (
                      <p className="text-xs text-[#8D5D62] dark:text-[#C28F94] font-medium mt-2">
                        Discuss this finding with your clinician promptly.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="mt-2 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <div><span className="font-medium text-[#8D5D62] dark:text-[#C28F94]">Critical/High</span> — discuss with your clinician soon</div>
              <div><span className="font-medium text-amber-600 dark:text-amber-400">Medium</span> — raise at your next appointment</div>
              <div><span className="font-medium text-[#4A8FA8]">Low</span> — for awareness; no urgent action needed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
