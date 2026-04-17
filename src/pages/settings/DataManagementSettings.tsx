import { useState } from 'react';
import { Download, Upload, Trash2, X, CheckCircle } from 'lucide-react';
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
      link.download = `gutwise-export-${new Date().toISOString().split('T')[0]}.json`;
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
      description="Your health data belongs to you — export it or delete it at any time"
    >
      <div className="space-y-6">
        <Card>
          <h3 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-1">Export Your Data</h3>
          <p className="text-sm text-neutral-muted dark:text-dark-muted mb-1">
            Download a complete copy of your logged health data as a JSON file. This is a raw structured export — useful as a personal backup or to share with your care team.
          </p>
          <p className="text-xs text-neutral-muted dark:text-dark-muted mb-4">
            The file will include all your logs across bowel movements, symptoms, food, hydration, sleep, stress, medications, and menstrual cycle data.
          </p>
          <Button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full md:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Preparing export...' : 'Download My Data'}
          </Button>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-1">Restore from Export</h3>
          <p className="text-sm text-neutral-muted dark:text-dark-muted mb-4">
            Re-import data from a previous GutWise export to restore your records.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" disabled className="w-full md:w-auto opacity-50 cursor-not-allowed">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            <span className="text-xs text-neutral-muted dark:text-dark-muted">Coming soon</span>
          </div>
          <p className="text-xs text-neutral-muted dark:text-dark-muted mt-3">
            Data import is not yet available. Export your data now to keep a backup for when this feature launches.
          </p>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-2">How your data is handled</h3>
          <div className="space-y-2 text-sm text-neutral-muted dark:text-dark-muted">
            <p>
              Your health data is stored securely and is never sold or shared with third parties. It is used solely to generate your personal insights within GutWise.
            </p>
            <p>
              Your data is retained for as long as your account is active. You can export or delete it at any time from this page.
            </p>
            <p className="text-xs pt-1">
              For privacy-related enquiries, contact information will be published in the Privacy Policy before launch.
            </p>
            <a href="/privacy" className="inline-flex text-brand-500 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-100 font-medium mt-1 transition-colors">
              Read our Privacy Policy →
            </a>
          </div>
        </Card>

        <Card className="border-red-200/60 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20">
          <h3 className="text-base font-semibold text-red-900 dark:text-red-400 mb-1">Delete All Health Data</h3>
          <p className="text-sm text-red-700/80 dark:text-red-400/70 mb-4">
            Permanently removes all your logs and records. This cannot be undone — consider downloading a copy first.
          </p>

          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="w-full md:w-auto border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Data
            </Button>
          ) : (
            <div className="p-4 bg-neutral-surface dark:bg-dark-elevated rounded-xl border border-red-200 dark:border-red-900/50">
              <p className="font-medium text-neutral-text dark:text-dark-text mb-1">
                Delete all health data permanently?
              </p>
              <p className="text-sm text-neutral-muted dark:text-dark-muted mb-4">
                This removes all logs and cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleDeleteAllData}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
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
          <Card className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
            <div className="flex items-start gap-3">
              <X className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-900 dark:text-red-400">{deleteError}</p>
            </div>
          </Card>
        )}

        {exportMessage && (
          <Card className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-green-900 dark:text-green-400">{exportMessage}</p>
            </div>
          </Card>
        )}
      </div>
    </SettingsPageLayout>
  );
}
