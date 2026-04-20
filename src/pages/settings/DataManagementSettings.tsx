import { useState } from 'react';
import { CheckCircle, Download, Trash2, Upload, X } from 'lucide-react';
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
        const query = supabase.from(table).select('*');

        const { data, error } =
          table === 'profiles' ? await query.eq('id', user.id) : await query.eq('user_id', user.id);

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
        const { error } = await supabase.from(table).delete().eq('user_id', user.id);

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
      description="Export, retain, or permanently remove your records. Your health data stays under your control."
    >
      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[28px]">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            Export Your Data
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            Download a complete copy of your logged health data as a JSON file. This is a raw
            structured export, useful as a personal backup or to share with your care team.
          </p>
          <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
            The file includes bowel movement, symptom, food, hydration, sleep, stress, medication,
            menstrual cycle, and profile data.
          </p>

          <div className="mt-5">
            <Button onClick={handleExportData} disabled={exporting} className="w-full md:w-auto">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Preparing export...' : 'Download My Data'}
            </Button>
          </div>
        </Card>

        <Card variant="flat" className="rounded-[28px]">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            Restore from Export
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            Re-import data from a previous GutWise export to restore your records.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <Button variant="ghost" disabled className="w-full cursor-not-allowed opacity-50 md:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
            <span className="text-xs text-[var(--color-text-tertiary)]">Coming soon</span>
          </div>

          <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
            Data import is not yet available. Export your data now to keep a backup for when this
            feature launches.
          </p>
        </Card>

        <Card variant="flat" className="rounded-[28px]">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            How your data is handled
          </h3>

          <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            <p>
              Your health data is stored securely and is never sold or shared with third parties.
              It is used solely to generate your personal insights within GutWise.
            </p>
            <p>
              Your data is retained for as long as your account is active. You can export or delete
              it at any time from this page.
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              For privacy-related enquiries, contact information will be published in the Privacy
              Policy before launch.
            </p>
            <a
              href="/privacy"
              className="inline-flex font-medium text-[var(--color-accent-primary)] transition-smooth hover:text-[var(--color-text-primary)]"
            >
              Read our Privacy Policy →
            </a>
          </div>
        </Card>

        <Card
          variant="flat"
          className="rounded-[28px] border-[rgba(255,120,120,0.2)] bg-[rgba(255,120,120,0.06)]"
        >
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            Delete All Health Data
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            Permanently removes all your logs and records. This cannot be undone, so consider
            downloading a copy first.
          </p>

          {!showDeleteConfirm ? (
            <div className="mt-5">
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="ghost"
                className="w-full text-[var(--color-danger)] md:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Data
              </Button>
            </div>
          ) : (
            <div className="surface-panel mt-5 rounded-[24px] border-[rgba(255,120,120,0.22)] p-4">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Delete all health data permanently?
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                This removes all logs and cannot be undone.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  onClick={handleDeleteAllData}
                  className="bg-[var(--color-danger)] hover:opacity-90"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Yes, Delete Everything
                </Button>
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {deleteError && (
          <Card
            variant="flat"
            className="rounded-[24px] border-[rgba(255,120,120,0.2)] bg-[rgba(255,120,120,0.06)]"
          >
            <div className="flex items-start gap-3">
              <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-danger)]" />
              <p className="text-sm font-medium text-[var(--color-danger)]">{deleteError}</p>
            </div>
          </Card>
        )}

        {exportMessage && (
          <Card
            variant="flat"
            className="rounded-[24px] border-[rgba(84,160,255,0.2)] bg-[rgba(84,160,255,0.06)]"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
              <p className="text-sm font-medium text-[var(--color-accent-primary)]">
                {exportMessage}
              </p>
            </div>
          </Card>
        )}
      </div>
    </SettingsPageLayout>
  );
}
