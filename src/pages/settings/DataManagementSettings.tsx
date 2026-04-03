import { useState } from 'react';
import { Download, Upload, Trash2, AlertCircle, Save, X, CheckCircle } from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function DataManagementSettings() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleExportData = async () => {
    if (!user?.id) return;

    setExporting(true);
    setExportMessage('');

    try {
      const exportedData: Record<string, unknown> = {
        exportDate: new Date().toISOString(),
        userId: user.id,
      };

      const tables = [
        'profiles',
        'bm_logs',
        'food_logs',
        'symptom_logs',
        'sleep_logs',
        'stress_logs',
        'hydration_logs',
        'medication_logs',
        'menstrual_cycle_logs',
      ];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error(`Error fetching ${table}:`, error);
        } else {
          exportedData[table] = data;
        }
      }

      const dataStr = JSON.stringify(exportedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportMessage('Your data has been exported successfully');
      setTimeout(() => setExportMessage(''), 3000);
    } catch (err) {
      console.error('Error exporting data:', err);
      setExportMessage('');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!user?.id) return;

    setDeleteError('');

    try {
      const tables = [
        'bm_logs',
        'food_logs',
        'symptom_logs',
        'sleep_logs',
        'stress_logs',
        'hydration_logs',
        'medication_logs',
        'menstrual_cycle_logs',
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id);

        if (error) {
          throw new Error(`Failed to delete ${table}: ${error.message}`);
        }
      }

      setShowDeleteConfirm(false);
      setExportMessage('All health data has been deleted');
      setTimeout(() => setExportMessage(''), 3000);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete data');
    }
  };

  return (
    <SettingsPageLayout
      title="Data Management"
      description="Export, backup, or delete your health data"
    >
      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Your Data</h3>
          <p className="text-sm text-gray-600 mb-4">
            Download all your health data in JSON format for backup or transfer to another service
          </p>
          <Button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full md:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Data</h3>
          <p className="text-sm text-gray-600 mb-4">
            Import previously exported health data to restore or migrate records
          </p>
          <Button variant="outline" className="w-full md:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Supported format: JSON files from previous exports
          </p>
        </Card>

        <Card className="bg-yellow-50 border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Data Retention</h4>
              <p className="text-sm text-yellow-800 mt-1">
                Your data is retained as long as your account is active. We recommend regularly exporting your data as a backup.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Privacy</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              All your health data is stored securely in encrypted databases. We comply with international data protection regulations including GDPR and HIPAA.
            </p>
            <p>
              You have full control over your data and can request deletion at any time. See our Privacy Policy for more details.
            </p>
            <a href="/privacy" className="inline-flex text-teal-600 hover:text-teal-700 font-medium">
              Read our Privacy Policy →
            </a>
          </div>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
          <p className="text-sm text-red-800 mb-4">
            Permanently delete all your health data. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="w-full md:w-auto border-red-300 text-red-600 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Data
            </Button>
          ) : (
            <div className="p-4 bg-white rounded-lg border border-red-200">
              <p className="font-medium text-gray-900 mb-4">
                Are you sure? This will permanently delete all your health records.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleDeleteAllData}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Yes, Delete Everything
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {deleteError && (
          <Card className="bg-red-50 border border-red-200">
            <div className="flex items-start gap-3">
              <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{deleteError}</p>
              </div>
            </div>
          </Card>
        )}

        {exportMessage && (
          <Card className="bg-green-50 border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">{exportMessage}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </SettingsPageLayout>
  );
}
