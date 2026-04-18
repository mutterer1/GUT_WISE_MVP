import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, FileText, Plus, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import TrustExplainer from '../../components/TrustExplainer';
import CandidateReviewList from './CandidateReviewList';
import { CATEGORY_CONFIGS, buildDefaultDetail } from './medicalContextFields';
import { useAuth } from '../../contexts/AuthContext';
import type {
  MedicalDocumentIntakeRow,
  CandidateMedicalFactRow,
  MedicalFactCategory,
} from '../../types/medicalContext';
import {
  createDocumentIntake,
  fetchDocumentIntakes,
  fetchPendingCandidates,
  fetchAllCandidates,
  seedCandidateFromIntake,
  acceptCandidate,
  rejectCandidate,
} from '../../services/medicalContextService';

type ViewMode = 'overview' | 'seed';

interface SeedForm {
  intakeId: string;
  category: MedicalFactCategory;
  detail: Record<string, unknown>;
  notes: string;
}

const INTAKE_STATUS_META: Record<string, { icon: typeof Clock; label: string; className: string }> = {
  uploaded: { icon: Upload, label: 'Uploaded', className: 'text-blue-600 dark:text-blue-400' },
  processing: { icon: Clock, label: 'Processing', className: 'text-amber-600 dark:text-amber-400' },
  review_ready: { icon: AlertTriangle, label: 'Ready to Review', className: 'text-amber-600 dark:text-amber-400' },
  completed: { icon: CheckCircle, label: 'Completed', className: 'text-green-600 dark:text-green-400' },
  failed: { icon: XCircle, label: 'Failed', className: 'text-red-600 dark:text-red-400' },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MedicalDocumentIntake() {
  const { user } = useAuth();
  const [intakes, setIntakes] = useState<MedicalDocumentIntakeRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateMedicalFactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [processing, setProcessing] = useState<string | null>(null);
  const [seedForm, setSeedForm] = useState<SeedForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'pending_review' | 'all'>('pending_review');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [intakeData, candidateData] = await Promise.all([
        fetchDocumentIntakes(user.id),
        statusFilter === 'pending_review'
          ? fetchPendingCandidates(user.id)
          : fetchAllCandidates(user.id),
      ]);
      setIntakes(intakeData);
      setCandidates(candidateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id || !e.target.files?.length) return;
    const file = e.target.files[0];
    setError('');

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a PDF, image, text, or Word document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.');
      return;
    }

    try {
      setSaving(true);
      await createDocumentIntake(user.id, {
        file_name: file.name,
        file_type: file.type,
        file_size_bytes: file.size,
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create intake record');
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSeedCandidate = async () => {
    if (!user?.id || !seedForm) return;
    setSaving(true);
    setError('');
    try {
      await seedCandidateFromIntake(user.id, seedForm.intakeId, {
        category: seedForm.category,
        detail: seedForm.detail,
        extraction_notes: seedForm.notes || undefined,
      });
      setSeedForm(null);
      setViewMode('overview');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed candidate');
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async (candidateId: string) => {
    if (!user?.id) return;
    setProcessing(candidateId);
    setError('');
    try {
      await acceptCandidate(user.id, candidateId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept candidate');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (candidateId: string) => {
    if (!user?.id) return;
    setProcessing(candidateId);
    setError('');
    try {
      await rejectCandidate(user.id, candidateId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject candidate');
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = candidates.filter(c => c.review_status === 'pending_review').length;

  if (viewMode === 'seed' && seedForm) {
    const config = CATEGORY_CONFIGS.find(c => c.key === seedForm.category)!;
    return (
      <SettingsPageLayout
        title="Add a Detail from Your Document"
        description="Add one detail from your document. It will stay in review until you confirm it."
      >
        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={seedForm.category}
                onChange={(e) => {
                  const cat = e.target.value as MedicalFactCategory;
                  setSeedForm({ ...seedForm, category: cat, detail: buildDefaultDetail(cat) });
                }}
                className="w-full rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-3 py-2 text-sm text-gray-900 dark:text-white"
              >
                {CATEGORY_CONFIGS.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>

            {config.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={(seedForm.detail[field.key] as string) || ''}
                    onChange={(e) => setSeedForm({
                      ...seedForm,
                      detail: { ...seedForm.detail, [field.key]: e.target.value },
                    })}
                    className="w-full rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-3 py-2 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">Select...</option>
                    {field.options?.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : field.type === 'boolean' ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!seedForm.detail[field.key]}
                      onChange={(e) => setSeedForm({
                        ...seedForm,
                        detail: { ...seedForm.detail, [field.key]: e.target.checked },
                      })}
                      className="rounded border-gray-300 dark:border-white/20"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                  </label>
                ) : (
                  <input
                    type={field.type === 'date' ? 'date' : 'text'}
                    value={(seedForm.detail[field.key] as string) || ''}
                    placeholder={field.placeholder}
                    onChange={(e) => setSeedForm({
                      ...seedForm,
                      detail: { ...seedForm.detail, [field.key]: e.target.value },
                    })}
                    className="w-full rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                )}
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={seedForm.notes}
                onChange={(e) => setSeedForm({ ...seedForm, notes: e.target.value })}
                placeholder="Where in the document did you find this? e.g. page 2, discharge summary"
                className="w-full rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button onClick={handleSeedCandidate} disabled={saving}>
                {saving ? 'Saving...' : 'Submit for Review'}
              </Button>
              <Button variant="outline" onClick={() => { setSeedForm(null); setViewMode('overview'); }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Medical Documents"
      description="Upload documents from your care team. Uploaded docs are records only - details affect your insights only after you review and approve each one."
    >
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <TrustExplainer variant="documents" className="mb-6" />

      {loading ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Uploaded Documents</h2>
              <label className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
                  onChange={handleFileSelect}
                  disabled={saving}
                />
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  {saving ? 'Uploading...' : 'Upload Document'}
                </Button>
              </label>
            </div>

            {intakes.length === 0 ? (
              <Card>
                <div className="flex items-center gap-3 py-2">
                  <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No documents yet. Upload lab results, discharge summaries, or other documents from your care team. Any reviewed and approved details will be visible in your medical context.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {intakes.map((intake) => {
                  const statusMeta = INTAKE_STATUS_META[intake.intake_status] || INTAKE_STATUS_META.uploaded;
                  const StatusIcon = statusMeta.icon;
                  return (
                    <Card key={intake.id} padding="sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {intake.file_name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                {formatFileSize(intake.file_size_bytes)}
                              </span>
                              <span className="text-[11px] text-gray-300 dark:text-gray-600">&middot;</span>
                              <span className={`flex items-center gap-1 text-[11px] ${statusMeta.className}`}>
                                <StatusIcon className="h-3 w-3" />
                                {statusMeta.label}
                              </span>
                              {intake.candidate_count > 0 && (
                                <>
                                  <span className="text-[11px] text-gray-300 dark:text-gray-600">&middot;</span>
                                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                    {intake.candidate_count} detail{intake.candidate_count !== 1 ? 's' : ''} to review
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const defaultCat = CATEGORY_CONFIGS[0].key;
                            setSeedForm({
                              intakeId: intake.id,
                              category: defaultCat,
                              detail: buildDefaultDetail(defaultCat),
                              notes: '',
                            });
                            setViewMode('seed');
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Detail
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Details to Review</h2>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-medium">
                    {pendingCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending_review')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === 'pending_review'
                      ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            <CandidateReviewList
              candidates={candidates}
              onAccept={handleAccept}
              onReject={handleReject}
              processing={processing}
            />
          </section>

          <Card padding="sm" className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/[0.06]">
            <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed space-y-1">
              <p>
                Nothing from an uploaded document is applied to your insights until you personally review and approve it.
              </p>
              <p>
                To use something from a document, tap "Add Detail" next to it, then confirm before it becomes active.
              </p>
            </div>
          </Card>
        </div>
      )}
    </SettingsPageLayout>
  );
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 mb-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-red-900 dark:text-red-200">{message}</p>
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600 dark:hover:text-red-300">
          <span className="sr-only">Dismiss</span>
          &times;
        </button>
      </div>
    </Card>
  );
}
