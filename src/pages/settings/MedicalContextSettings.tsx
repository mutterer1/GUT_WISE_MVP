import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  FileSearch,
} from 'lucide-react';
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

function getTimelineBadgeClasses(status: MedicalFact['timeline']['status']): string {
  switch (status) {
    case 'current':
      return 'border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.12)] text-[rgba(110,231,183,0.98)]';
    case 'under_investigation':
      return 'border-[rgba(84,160,255,0.2)] bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]';
    case 'resolved':
      return 'border-[rgba(133,93,255,0.2)] bg-[rgba(133,93,255,0.12)] text-[var(--color-accent-secondary)]';
    case 'historical':
      return 'border-white/10 bg-white/[0.04] text-[var(--color-text-tertiary)]';
    case 'inactive':
      return 'border-[rgba(248,113,113,0.18)] bg-[rgba(248,113,113,0.08)] text-[rgba(252,165,165,0.98)]';
    default:
      return 'border-white/10 bg-white/[0.04] text-[var(--color-text-tertiary)]';
  }
}

function formatFactTimelineLine(fact: MedicalFact): string {
  const label = fact.timeline.currency_label;
  const effectiveDate = fact.timeline.effective_date;
  const endDate = fact.timeline.end_date;

  if (effectiveDate && endDate && effectiveDate !== endDate) {
    return `${label} | ${effectiveDate} to ${endDate}`;
  }

  if (effectiveDate) {
    return `${label} | ${effectiveDate}`;
  }

  if (endDate) {
    return `${label} | ${endDate}`;
  }

  return label;
}

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
      const confirmed = data.filter((fact) => fact.confirmation_state !== 'candidate');
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
    setExpandedCategories((previous) => {
      const next = new Set(previous);
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
      setExpandedCategories((previous) => new Set(previous).add(viewState.category));
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
    facts.filter((fact) => fact.category === category);

  const totalFacts = facts.length;
  const currentOrMonitoredFacts = facts.filter((fact) =>
    ['current', 'under_investigation'].includes(fact.timeline.status)
  ).length;
  const historicalOrResolvedFacts = facts.filter((fact) =>
    ['historical', 'resolved'].includes(fact.timeline.status)
  ).length;

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
      description="Maintain the clinical background GutWise should consider when interpreting your logs and surfacing patterns."
    >
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <Card variant="elevated" className="rounded-[28px]">
          <p className="text-sm text-[var(--color-text-tertiary)]">Loading medical context...</p>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card variant="elevated" className="rounded-[30px] overflow-hidden">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div>
                <span className="badge-secondary mb-3 inline-flex">Private Clinical Profile</span>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                  Build a tighter baseline for personalized analysis
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                  Add diagnoses, medications, procedures, intolerances, and clinician guidance so
                  GutWise can interpret patterns in the context of your real health background.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <MetricTile
                    label="Active facts"
                    value={String(totalFacts)}
                    helper="Structured medical context entries"
                    tone="primary"
                  />
                  <MetricTile
                    label="Current or monitored"
                    value={String(currentOrMonitoredFacts)}
                    helper="Current, ongoing, or under investigation"
                    tone="secondary"
                  />
                  <MetricTile
                    label="Historical or resolved"
                    value={String(historicalOrResolvedFacts)}
                    helper="Past procedures, ended meds, resolved flags"
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
                      Private context boundary
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                      This information stays tied to your account and helps GutWise tailor pattern
                      interpretation. It is not medical advice or an automated diagnosis layer.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.025)] p-4">
                  <div className="flex items-start gap-3">
                    <FileSearch className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
                    <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                      Add only the facts you want reflected in downstream insights. You can revise or
                      remove any item at any time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {CATEGORY_CONFIGS.map((config) => {
            const categoryFacts = factsByCategory(config.key);
            const isExpanded = expandedCategories.has(config.key);
            const count = categoryFacts.length;

            return (
              <Card key={config.key} variant="elevated" padding="none" className="rounded-[30px] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCategory(config.key)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)] text-[var(--color-text-tertiary)]">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {config.label}
                        </h3>
                        {count > 0 && (
                          <span className="inline-flex min-w-[1.6rem] items-center justify-center rounded-full border border-[rgba(84,160,255,0.2)] bg-[rgba(84,160,255,0.08)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-accent-primary)]">
                            {count}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--color-text-tertiary)] sm:inline-flex">
                    <Stethoscope className="h-3.5 w-3.5" />
                    {count === 0 ? 'No entries yet' : `${count} ${count === 1 ? 'entry' : 'entries'}`}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/8 px-5 pb-5 pt-5 sm:px-6">
                    {categoryFacts.length > 0 ? (
                      <div className="space-y-3">
                        {categoryFacts.map((fact) => {
                          const displayValue = (fact.detail as Record<string, unknown>)[
                            config.displayField
                          ] as string;

                          return (
                            <div
                              key={fact.id}
                              className="surface-panel-quiet rounded-[24px] border border-white/8 p-4 transition-smooth hover:border-white/12 hover:bg-white/[0.05]"
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                                      {displayValue || 'Unnamed entry'}
                                    </p>
                                    <span
                                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${getTimelineBadgeClasses(
                                        fact.timeline.status
                                      )}`}
                                    >
                                      {fact.timeline.currency_label}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-tertiary)]">
                                    {formatFactTimelineLine(fact)}
                                  </p>
                                  {fact.provenance.notes ? (
                                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                      {fact.provenance.notes}
                                    </p>
                                  ) : (
                                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-tertiary)]">
                                      No added note.
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-col gap-2 lg:w-[190px]">
                                  {confirmDelete === fact.id ? (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(fact.id)}
                                        disabled={saving}
                                        className="w-full border-[rgba(248,113,113,0.18)] text-[rgba(252,165,165,0.98)] hover:bg-[rgba(248,113,113,0.08)]"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        {saving ? 'Removing...' : 'Confirm Remove'}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setConfirmDelete(null)}
                                        className="w-full"
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setViewState({ mode: 'edit', fact })}
                                        className="w-full"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setConfirmDelete(fact.id)}
                                        className="w-full text-[var(--color-text-tertiary)] hover:bg-[rgba(248,113,113,0.08)] hover:text-[rgba(252,165,165,0.98)]"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="surface-panel-quiet rounded-[24px] border border-white/8 p-5">
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          No entries yet. Add the details from this category only if they should
                          materially shape how GutWise interprets your logs.
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                        <Sparkles className="h-4 w-4 text-[var(--color-accent-secondary)]" />
                        Keep entries concise, factual, and relevant.
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setViewState({ mode: 'add', category: config.key })}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add {config.label.replace(/s$/, '').replace(/ie$/, 'y')}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          <Card
            variant="flat"
            className="rounded-[26px] border-[rgba(84,160,255,0.16)] bg-[rgba(84,160,255,0.06)]"
          >
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Clinical context, not medical advice
                </p>
                <div className="mt-2 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  <p>These entries help tune pattern interpretation against your health background.</p>
                  <p>They do not replace evaluation from your clinician or care team.</p>
                  <p>You can edit or remove any item above whenever your situation changes.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
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

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Card
      variant="flat"
      className="mb-4 rounded-[24px] border-[rgba(255,120,120,0.2)] bg-[rgba(255,120,120,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[var(--color-danger)]">{message}</p>
        <button
          type="button"
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
