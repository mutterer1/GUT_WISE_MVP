import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import SettingsPageLayout from '../../components/SettingsPageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MedicalFactForm from './MedicalFactForm';
import { CATEGORY_CONFIGS, getCategoryConfig, buildDefaultDetail } from './medicalContextFields';
import { useAuth } from '../../contexts/AuthContext';
import type { MedicalFact, MedicalFactCategory } from '../../types/medicalContext';
import {
  fetchActiveMedicalFacts,
  createMedicalFact,
  updateMedicalFact,
  deactivateMedicalFact,
} from '../../services/medicalContextService';

type ViewState =
  | { mode: 'list' }
  | { mode: 'add'; category: MedicalFactCategory }
  | { mode: 'edit'; fact: MedicalFact };

export default function MedicalContextSettings() {
  const { user } = useAuth();
  const [facts, setFacts] = useState<MedicalFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [viewState, setViewState] = useState<ViewState>({ mode: 'list' });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadFacts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchActiveMedicalFacts(user.id, {
        active_only: true,
      });
      const confirmed = data.filter((f) => f.confirmation_state !== 'candidate');
      setFacts(confirmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medical facts');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFacts();
  }, [loadFacts]);

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCreate = async (detail: Record<string, unknown>, notes: string) => {
    if (!user?.id || viewState.mode !== 'add') return;
    setSaving(true);
    setError('');
    try {
      await createMedicalFact(user.id, {
        category: viewState.category,
        detail,
        notes: notes || undefined,
      });
      setViewState({ mode: 'list' });
      setExpandedCategories((prev) => new Set(prev).add(viewState.category));
      await loadFacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (detail: Record<string, unknown>, notes: string) => {
    if (!user?.id || viewState.mode !== 'edit') return;
    setSaving(true);
    setError('');
    try {
      await updateMedicalFact(user.id, viewState.fact.id, {
        detail,
        notes: notes || undefined,
      });
      setViewState({ mode: 'list' });
      await loadFacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (factId: string) => {
    if (!user?.id) return;
    setSaving(true);
    setError('');
    try {
      await deactivateMedicalFact(user.id, factId);
      setConfirmDelete(null);
      await loadFacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    } finally {
      setSaving(false);
    }
  };

  const factsByCategory = (category: MedicalFactCategory) =>
    facts.filter((f) => f.category === category);

  if (viewState.mode === 'add') {
    const config = getCategoryConfig(viewState.category);
    return (
      <SettingsPageLayout
        title={`Add ${config.label.replace(/s$/, '')}`}
        description={config.description}
      >
        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
        <MedicalFactForm
          config={config}
          initialDetail={buildDefaultDetail(viewState.category)}
          onSave={handleCreate}
          onCancel={() => setViewState({ mode: 'list' })}
          saving={saving}
        />
      </SettingsPageLayout>
    );
  }

  if (viewState.mode === 'edit') {
    const config = getCategoryConfig(viewState.fact.category);
    return (
      <SettingsPageLayout
        title={`Edit ${config.label.replace(/s$/, '')}`}
        description={config.description}
      >
        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
        <MedicalFactForm
          config={config}
          initialDetail={viewState.fact.detail as unknown as Record<string, unknown>}
          initialNotes={viewState.fact.provenance.notes || ''}
          onSave={handleUpdate}
          onCancel={() => setViewState({ mode: 'list' })}
          saving={saving}
        />
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Medical Context"
      description="Help GutWise understand your health background so it can give you more relevant insights"
    >
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading medical context...</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <Card padding="sm" className="bg-brand-50/50 dark:bg-brand-900/10 border-brand-200/60 dark:border-brand-800/20">
            <p className="text-xs text-brand-700 dark:text-brand-300 leading-relaxed">
              This information is used only to personalize your gut health insights — not for any other purpose.
              You control what you add, and you can remove any entry at any time.
            </p>
          </Card>

          {CATEGORY_CONFIGS.map((config) => {
            const categoryFacts = factsByCategory(config.key);
            const isExpanded = expandedCategories.has(config.key);
            const count = categoryFacts.length;

            return (
              <Card key={config.key} padding="none">
                <button
                  type="button"
                  onClick={() => toggleCategory(config.key)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {config.label}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {count > 0 && (
                      <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium">
                        {count}
                      </span>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-4 border-t border-gray-100 dark:border-white/[0.06]">
                    {categoryFacts.length > 0 ? (
                      <ul className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                        {categoryFacts.map((fact) => {
                          const displayValue = (fact.detail as Record<string, unknown>)[config.displayField] as string;
                          return (
                            <li key={fact.id} className="flex items-center justify-between py-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {displayValue || 'Unnamed entry'}
                                </p>
                                {fact.provenance.notes && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                    {fact.provenance.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                                {confirmDelete === fact.id ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDelete(fact.id)}
                                      disabled={saving}
                                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setConfirmDelete(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setViewState({ mode: 'edit', fact })}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDelete(fact.id)}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500 py-3">
                        No entries yet
                      </p>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewState({ mode: 'add', category: config.key })}
                      className="mt-2"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add {config.label.replace(/s$/, '').replace(/ie$/, 'y')}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}

          <Card padding="sm" className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/[0.06]">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              GutWise uses this to make your insights more relevant to your situation. It does not provide medical advice.
              If anything looks wrong, you can edit or remove it above.
            </p>
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
