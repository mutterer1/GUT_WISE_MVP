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
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
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
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Medications Today
            </p>
            <p className="text-4xl font-bold text-gray-300">0</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Pill className="h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">No medications logged today</p>
          <p className="text-xs text-gray-500 mt-1">
            Track your medications to monitor adherence
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            Medications Today
          </p>
          <p className="text-4xl font-bold text-gray-900">{medications.length}</p>
        </div>
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <Pill className="h-6 w-6 text-purple-600" />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Adherence Rate</span>
          <span className="text-sm font-bold text-gray-900">
            {Math.round(adherenceRate)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              adherenceRate === 100
                ? 'bg-green-500'
                : adherenceRate >= 80
                ? 'bg-blue-500'
                : 'bg-yellow-500'
            }`}
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
              className={`p-3 rounded-lg border transition-all ${
                med.taken_as_prescribed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {med.taken_as_prescribed ? (
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    )}
                    <p className="text-sm font-semibold text-gray-900">
                      {med.medication_name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 ml-6">{med.dosage}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{time}</span>
                </div>
              </div>
              {!med.taken_as_prescribed && (
                <p className="text-xs text-yellow-700 mt-2 ml-6">
                  Not taken as prescribed
                </p>
              )}
            </div>
          );
        })}
      </div>

      {adherenceRate === 100 && (
        <div className="mt-4 bg-green-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-green-900 text-center">
            Perfect adherence today!
          </p>
        </div>
      )}
    </Card>
  );
}
