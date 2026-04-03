import { AlertCircle, CheckCircle, Activity } from 'lucide-react';
import Card from '../Card';
import { formatDateTime } from '../../utils/dateFormatters';

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
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-100 text-green-700 border-green-200';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  if (symptoms.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Symptoms Today</p>
            <p className="text-4xl font-bold text-green-600">0</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg text-center">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <p className="text-sm font-medium text-green-900">Feeling great!</p>
          <p className="text-xs text-green-700 mt-1">No symptoms logged today</p>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Keep up the good work with your health routine</p>
        </div>
      </Card>
    );
  }

  const averageSeverity =
    symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length;
  const maxSeverity = Math.max(...symptoms.map((s) => s.severity));
  const mostRecent = symptoms[0];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Symptoms Today</p>
          <p className="text-4xl font-bold text-gray-900">{symptoms.length}</p>
        </div>
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-orange-600" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Average Severity</span>
          <span className="text-sm font-bold text-gray-900">
            {averageSeverity.toFixed(1)}/10
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              averageSeverity <= 3
                ? 'bg-green-500'
                : averageSeverity <= 6
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${(averageSeverity / 10) * 100}%` }}
          />
        </div>

        <div
          className={`p-3 rounded-lg border ${getSeverityColor(maxSeverity)}`}
        >
          <p className="text-xs font-medium mb-1">Most Recent</p>
          <p className="text-sm font-semibold">{mostRecent.symptom_type}</p>
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
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              <Activity className="inline h-3 w-3 mr-1" />
              {symptoms.length} symptoms logged today
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
