import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
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
        return <AlertTriangle className="h-6 w-6" />;
      case 'medium':
        return <AlertCircle className="h-6 w-6" />;
      default:
        return <Info className="h-6 w-6" />;
    }
  };

  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          container: 'bg-red-100 border-red-600',
          icon: 'text-red-700',
          badge: 'bg-red-700 text-white',
          text: 'text-red-900',
          title: 'text-red-900',
        };
      case 'high':
        return {
          container: 'bg-orange-100 border-orange-600',
          icon: 'text-orange-700',
          badge: 'bg-orange-700 text-white',
          text: 'text-orange-900',
          title: 'text-orange-900',
        };
      case 'medium':
        return {
          container: 'bg-yellow-100 border-yellow-600',
          icon: 'text-yellow-700',
          badge: 'bg-yellow-700 text-white',
          text: 'text-yellow-900',
          title: 'text-yellow-900',
        };
      default:
        return {
          container: 'bg-blue-100 border-blue-600',
          icon: 'text-blue-700',
          badge: 'bg-blue-700 text-white',
          text: 'text-blue-900',
          title: 'text-blue-900',
        };
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Clinical Alert System
      </h2>

      {!hasAlerts ? (
        <div className="bg-green-50 border-l-4 border-green-600 p-4">
          <p className="text-green-800 font-medium">
            No clinical alerts triggered during the reporting period. All monitored parameters within acceptable ranges.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-700">
                Total Alerts: <span className="font-bold text-gray-900">{alerts.length}</span>
              </span>
              {criticalAlerts.length > 0 && (
                <span className="text-red-700">
                  Critical: <span className="font-bold">{criticalAlerts.length}</span>
                </span>
              )}
              {highAlerts.length > 0 && (
                <span className="text-orange-700">
                  High: <span className="font-bold">{highAlerts.length}</span>
                </span>
              )}
              {mediumAlerts.length > 0 && (
                <span className="text-yellow-700">
                  Medium: <span className="font-bold">{mediumAlerts.length}</span>
                </span>
              )}
              {lowAlerts.length > 0 && (
                <span className="text-blue-700">
                  Low: <span className="font-bold">{lowAlerts.length}</span>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {alerts.map((alert, idx) => {
              const style = getAlertStyle(alert.severity);

              return (
                <div
                  key={idx}
                  className={`border-l-4 rounded-r-lg p-4 ${style.container}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 ${style.icon}`}>
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`text-lg font-bold ${style.title}`}>
                          {alert.message}
                        </h3>
                        <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${style.badge}`}>
                          {alert.severity}
                        </span>
                      </div>

                      <p className={`text-sm leading-relaxed mb-3 ${style.text}`}>
                        {alert.details}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-700">Affected Dates:</span>
                        {alert.affectedDates.slice(0, 5).map((date, dateIdx) => (
                          <span
                            key={dateIdx}
                            className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded text-gray-800 font-medium"
                          >
                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ))}
                        {alert.affectedDates.length > 5 && (
                          <span className="text-xs text-gray-700 font-medium">
                            +{alert.affectedDates.length - 5} more
                          </span>
                        )}
                      </div>

                      {alert.severity === 'critical' && (
                        <div className="mt-3 pt-3 border-t border-red-300">
                          <p className="text-sm font-bold text-red-900">
                            ⚠ URGENT: This finding requires immediate clinical attention and may warrant emergency evaluation.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Alert Severity Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-red-700">CRITICAL:</span>
                <span className="text-gray-700"> Requires immediate evaluation within 24 hours. May indicate life-threatening condition.</span>
              </div>
              <div>
                <span className="font-semibold text-orange-700">HIGH:</span>
                <span className="text-gray-700"> Requires prompt clinical assessment within 48-72 hours. Significant concern warranting intervention.</span>
              </div>
              <div>
                <span className="font-semibold text-yellow-700">MEDIUM:</span>
                <span className="text-gray-700"> Should be addressed at next scheduled appointment. Moderate clinical concern.</span>
              </div>
              <div>
                <span className="font-semibold text-blue-700">LOW:</span>
                <span className="text-gray-700"> Minor finding for clinical awareness. No urgent action required.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
