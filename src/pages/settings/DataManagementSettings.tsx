import { useState } from 'react';
import { Download, Upload, Trash2, Save, X, CheckCircle } from 'lucide-react';
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
      description="Your health data belongs to you — export it, restore it, or delete it at any time"
    >
      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Export Your Data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Download a complete copy of your logged health data. Useful as a personal backup or to share with your care team.
          </p>
          <Button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full md:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Download My Data'}
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Restore from Export</h3>
          <p className="text-sm text-gray-500 mb-4">
            Re-import data from a previous export to restore your records.
          </p>
          <Button variant="outline" className="w-full md:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            Accepts JSON files from a previous GutWise export
          </p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">How your data is handled</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              Your health data is stored encrypted and is never sold or shared with third parties. It is used solely to generate your personal insights within GutWise.
            </p>
            <p>
              Your data is kept for as long as your account is active. Export it regularly if you'd like a personal copy.
            </p>
            <a href="/privacy" className="inline-flex text-brand-600 hover:text-brand-700 font-medium mt-1">
              Read our Privacy Policy →
            </a>
          </div>
        </Card>

        <Card className="border-red-200/60 bg-red-50/40">
          <h3 className="text-base font-semibold text-red-900 mb-1">Delete All Health Data</h3>
          <p className="text-sm text-red-700/80 mb-4">
            Permanently removes all your logs and records. This cannot be undone — consider downloading a copy first.
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
              <p className="font-medium text-gray-900 mb-1">
                Delete all health data permanently?
              </p>
              <p className="text-sm text-gray-500 mb-4">
                This removes all logs and cannot be undone.
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
