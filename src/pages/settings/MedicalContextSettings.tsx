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
      description="Your health background helps GutWise surface patterns specific to your situation, not just population-level averages."
    >
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <Card variant="elevated" className="rounded-[28px]">
          <p className="text-sm text-[var(--color-text-tertiary)]">Loading medical context...</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card
            variant="flat"
            className="rounded-[24px] border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.06)]"
          >
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
              This stays private to your account and is used only to make your insights more relevant
              to your health background. You control everything you add here, and can edit or remove
              any entry at any time.
            </p>
          </Card>

          {CATEGORY_CONFIGS.map((config) => {
            const categoryFacts = factsByCategory(config.key);
            const isExpanded = expandedCategories.has(config.key);
            const count = categoryFacts.length;

            return (
              <Card key={config.key} variant="elevated" padding="none" className="rounded-[28px]">
                <button
                  type="button"
                  onClick={() => toggleCategory(config.key)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-[var(--color-text-tertiary)]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--color-text-tertiary)]" />
                    )}

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {config.label}
                      </h3>
                      <p className="truncate text-xs text-[var(--color-text-tertiary)]">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-shrink-0 items-center gap-3">
                    {count > 0 && (
                      <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border border-[rgba(84,160,255,0.2)] bg-[rgba(84,160,255,0.08)] px-2 text-xs font-medium text-[var(--color-accent-primary)]">
                        {count}
                      </span>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/8 px-6 pb-4">
                    {categoryFacts.length > 0 ? (
                      <ul className="divide-y divide-white/8">
                        {categoryFacts.map((fact) => {
                          const displayValue = (fact.detail as Record<string, unknown>)[
                            config.displayField
                          ] as string;

                          return (
                            <li key={fact.id} className="flex items-center justify-between py-3">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                                  {displayValue || 'Unnamed entry'}
                                </p>
                                {fact.provenance.notes && (
                                  <p className="mt-0.5 truncate text-xs text-[var(--color-text-tertiary)]">
                                    {fact.provenance.notes}
                                  </p>
                                )}
                              </div>

                              <div className="ml-3 flex flex-shrink-0 items-center gap-1">
                                {confirmDelete === fact.id ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDelete(fact.id)}
                                      disabled={saving}
                                      className="text-[var(--color-danger)] hover:bg-[rgba(255,120,120,0.08)]"
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
                                      className="rounded-xl p-1.5 text-[var(--color-text-tertiary)] transition-smooth hover:bg-white/[0.05] hover:text-[var(--color-text-primary)]"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDelete(fact.id)}
                                      className="rounded-xl p-1.5 text-[var(--color-text-tertiary)] transition-smooth hover:bg-[rgba(255,120,120,0.08)] hover:text-[var(--color-danger)]"
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
                      <p className="py-3 text-xs text-[var(--color-text-tertiary)]">No entries yet</p>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewState({ mode: 'add', category: config.key })}
                      className="mt-2"
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add {config.label.replace(/s$/, '').replace(/ie$/, 'y')}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}

          <Card variant="flat" className="rounded-[24px]">
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
              GutWise uses this context to surface patterns relevant to your health background. This
              is not medical advice. Always work with your care team for medical decisions. You can
              update or remove any entry above at any time.
            </p>
          </Card>
        </div>
      )}
    </SettingsPageLayout>
  );
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Card
      variant="flat"
      className="mb-4 rounded-[24px] border-[rgba(255,120,120,0.2)] bg-[rgba(255,120,120,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[var(--color-danger)]">{message}</p>
        <button
          onClick={onDismiss}
          className="text-[var(--color-text-tertiary)] transition-smooth hover:text-[var(--color-danger)]"
        >
          <span className="sr-only">Dismiss</span>
          &times;
        </button>
      </div>
    </Card>
  );
}
