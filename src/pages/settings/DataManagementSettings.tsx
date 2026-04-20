import { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Trash2,
  Upload,
  X,
  ShieldCheck,
  Archive,
  AlertTriangle,
  Database,
} from 'lucide-react';
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
          table === 'profiles'
            ? await query.eq('id', user.id)
            : await query.eq('user_id', user.id);

        if (error) {
          console.error(`Error fetching ${table}:`, error);
        } else {
          exportedData[table] = data;
        }
      }

      const dataString = JSON.stringify(exportedData, null, 2);
      const dataBlob = new Blob([dataString], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gutwise-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportMessage('Your data export is ready and has been downloaded.');
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
      setExportMessage('All health data has been deleted.');
      setTimeout(() => setExportMessage(''), 3000);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete data');
    }
  };

  return (
    <SettingsPageLayout
      title="Data Management"
      description="Export, retain, or permanently remove your records with a clear boundary around what GutWise stores for you."
    >
      <div className="space-y-5">
        <Card variant="elevated" className="rounded-[30px] overflow-hidden">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div>
              <span className="badge-secondary mb-3 inline-flex">Data Control</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Keep a usable backup before making destructive changes
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Export gives you a raw JSON snapshot of your account records. Use it as a private
                archive, a handoff artifact, or a safety step before deleting anything.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricTile
                  label="Export format"
                  value="JSON"
                  helper="Structured raw account data"
                  tone="primary"
                />
                <MetricTile
                  label="Coverage"
                  value="Logs"
                  helper="Profile and tracked health records"
                  tone="secondary"
                />
                <MetricTile
                  label="Control"
                  value="Manual"
                  helper="You decide when to export or erase"
                  tone="neutral"
                />
              </div>
            </div>

            <div className="surface-panel-soft rounded-[26px] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[var(--color-text-primary)]">
                    Private record boundary
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                    Your data is stored for your own tracking and insight generation. This page is
                    where you move, archive, or permanently clear it.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.025)] p-4">
                <div className="flex items-start gap-3">
                  <Archive className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    Best practice: download an export first, then proceed with any irreversible
                    deletion action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="rounded-[30px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Export Your Data
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Download a complete copy of your logged health data as a JSON file for personal
                backup, migration, or clinical handoff.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoChip text="Profile data included" />
                <InfoChip text="BM, food, symptom, sleep, stress, hydration, medication, and cycle logs" />
              </div>
            </div>

            <div className="lg:w-[220px]">
              <Button onClick={handleExportData} disabled={exporting} className="w-full">
                <Download className="h-4 w-4" />
                {exporting ? 'Preparing export...' : 'Download My Data'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card variant="flat" className="rounded-[30px]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] text-[var(--color-text-tertiary)]">
                <Upload className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Restore from Export
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Re-importing a previous GutWise export is planned, but not yet available in the
                  current product.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button variant="ghost" disabled className="cursor-not-allowed opacity-50">
                    <Upload className="h-4 w-4" />
                    Import Data
                  </Button>
                  <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[var(--color-text-tertiary)]">
                    Coming soon
                  </span>
                </div>

                <p className="mt-4 text-xs leading-6 text-[var(--color-text-tertiary)]">
                  Export now if you want a backup ready for future restore support.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="flat" className="rounded-[30px]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] text-[var(--color-text-tertiary)]">
                <Database className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  How your data is handled
                </h3>
                <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  <p>
                    Your health data is stored to power your own GutWise experience and is not sold
                    or shared for unrelated purposes.
                  </p>
                  <p>
                    Records remain available while your account is active, and you can export or
                    delete them from this workspace at any time.
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Privacy policy details should remain the canonical source for legal and retention
                    terms.
                  </p>
                </div>

                <a
                  href="/privacy"
                  className="mt-4 inline-flex text-sm font-medium text-[var(--color-accent-primary)] transition-smooth hover:text-[var(--color-text-primary)]"
                >
                  Read our Privacy Policy →
                </a>
              </div>
            </div>
          </Card>
        </div>

        <Card
          variant="flat"
          className="rounded-[30px] border-[rgba(255,120,120,0.2)] bg-[rgba(255,120,120,0.06)]"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-danger)]" />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Delete All Health Data
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Permanently removes your health logs and records from this account. This action
                    cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <div className="lg:w-[220px]">
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="ghost"
                  className="w-full text-[var(--color-danger)] hover:bg-[rgba(255,120,120,0.08)]"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All Data
                </Button>
              </div>
            ) : (
              <div className="surface-panel w-full rounded-[24px] border-[rgba(255,120,120,0.22)] p-4 lg:max-w-[360px]">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Delete all health data permanently?
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  This removes tracked records across your account and cannot be reversed.
                </p>

                <div className="mt-4 flex flex-col gap-3">
                  <Button
                    onClick={handleDeleteAllData}
                    className="w-full bg-[var(--color-danger)] hover:opacity-90"
                  >
                    <Trash2 className="h-4 w-4" />
                    Yes, Delete Everything
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
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
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
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

function MetricTile({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: 'primary' | 'secondary' | 'neutral';
}) {
  const toneClassName =
    tone === 'primary'
      ? 'border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)]'
      : tone === 'secondary'
        ? 'border-[rgba(133,93,255,0.16)] bg-[rgba(133,93,255,0.08)]'
        : 'border-white/8 bg-[rgba(255,255,255,0.03)]';

  return (
    <div className={`rounded-[22px] border px-4 py-4 ${toneClassName}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{helper}</p>
    </div>
  );
}

function InfoChip({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.025)] px-3 py-3 text-sm text-[var(--color-text-secondary)]">
      {text}
    </div>
  );
}
