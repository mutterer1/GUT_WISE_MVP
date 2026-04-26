import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Copy,
  Droplet,
  Dumbbell,
  ExternalLink,
  Frown,
  Heart,
  Moon,
  Pill,
  Pin,
  RefreshCw,
  Trash2,
  Utensils,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  deleteLogRoutine,
  fetchLogRoutines,
  markLogRoutineUsed,
  type LogRoutine,
  type LogRoutineType,
} from '../../services/logRoutineService';
import { stageLogTemplateDraft } from '../../utils/logTemplateDrafts';

interface RoutineMeta {
  label: string;
  path: string;
  icon: LucideIcon;
}

const MAX_ROUTINES = 6;

const routineMeta: Record<LogRoutineType, RoutineMeta> = {
  bm: {
    label: 'BM',
    path: '/bm-log',
    icon: Waves,
  },
  food: {
    label: 'Food',
    path: '/food-log',
    icon: Utensils,
  },
  symptoms: {
    label: 'Symptoms',
    path: '/symptoms-log',
    icon: AlertCircle,
  },
  sleep: {
    label: 'Sleep',
    path: '/sleep-log',
    icon: Moon,
  },
  stress: {
    label: 'Stress',
    path: '/stress-log',
    icon: Frown,
  },
  hydration: {
    label: 'Hydration',
    path: '/hydration-log',
    icon: Droplet,
  },
  medication: {
    label: 'Meds',
    path: '/medication-log',
    icon: Pill,
  },
  'menstrual-cycle': {
    label: 'Cycle',
    path: '/menstrual-cycle-log',
    icon: Heart,
  },
  exercise: {
    label: 'Exercise',
    path: '/exercise-log',
    icon: Dumbbell,
  },
};

function stringValue(entry: Record<string, unknown>, key: string, fallback = ''): string {
  const value = entry[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function numberValue(entry: Record<string, unknown>, key: string): number | null {
  const value = entry[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function arrayValue(entry: Record<string, unknown>, key: string): unknown[] {
  const value = entry[key];
  return Array.isArray(value) ? value : [];
}

function formatSnakeCase(value: string): string {
  return value.replace(/_/g, ' ');
}

function formatLoadedAt(value: number): string {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function joinParts(...parts: Array<string | number | null | undefined>): string {
  return parts.filter((part) => part !== null && part !== undefined && String(part).length > 0).join(' | ');
}

function getFoodNames(entry: Record<string, unknown>): string {
  const names = arrayValue(entry, 'food_items')
    .map((item) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null && 'name' in item) {
        const name = (item as { name?: unknown }).name;
        return typeof name === 'string' ? name : '';
      }
      return '';
    })
    .filter(Boolean);

  return names.length > 0 ? names.slice(0, 3).join(', ') : 'Food entry';
}

function describeRoutine(routine: LogRoutine): string {
  const entry = routine.routine_payload;

  switch (routine.log_type) {
    case 'food':
      return joinParts(
        getFoodNames(entry),
        formatSnakeCase(stringValue(entry, 'meal_type', 'meal')),
        stringValue(entry, 'portion_size')
      );
    case 'bm':
      return joinParts(
        `Bristol Type ${numberValue(entry, 'bristol_type') ?? '-'}`,
        stringValue(entry, 'amount'),
        `urgency ${numberValue(entry, 'urgency') ?? '-'}/10`
      );
    case 'symptoms':
      return joinParts(
        stringValue(entry, 'symptom_type', 'Symptom entry'),
        `severity ${numberValue(entry, 'severity') ?? '-'}/10`
      );
    case 'hydration':
      return joinParts(
        stringValue(entry, 'beverage_type', 'Hydration'),
        `${numberValue(entry, 'amount_ml') ?? '-'} ml`
      );
    case 'medication':
      return joinParts(
        stringValue(entry, 'medication_name', 'Medication'),
        stringValue(entry, 'dosage'),
        formatSnakeCase(stringValue(entry, 'medication_type'))
      );
    case 'sleep':
      return joinParts(
        `quality ${numberValue(entry, 'quality') ?? '-'}/10`,
        `${numberValue(entry, 'interruptions') ?? 0} interruptions`
      );
    case 'stress':
      return joinParts(
        `stress ${numberValue(entry, 'stress_level') ?? '-'}/10`,
        arrayValue(entry, 'triggers').filter((trigger) => typeof trigger === 'string').slice(0, 2).join(', ')
      );
    case 'exercise':
      return joinParts(
        stringValue(entry, 'exercise_type', 'Exercise'),
        `${numberValue(entry, 'duration_minutes') ?? '-'} min`,
        `intensity ${numberValue(entry, 'intensity_level') ?? '-'}/5`
      );
    case 'menstrual-cycle':
      return joinParts(
        `cycle day ${numberValue(entry, 'cycle_day') ?? '-'}`,
        `${stringValue(entry, 'flow_intensity', 'flow not set')} flow`
      );
    default:
      return 'Reusable log routine';
  }
}

function getRoutineUseLabel(routine: LogRoutine): string {
  if (routine.last_used_at) {
    return `Last used ${formatDate(routine.last_used_at)}`;
  }

  if (routine.usage_count > 0) {
    return `${routine.usage_count} uses`;
  }

  return 'New routine';
}

export default function PinnedRoutinesWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const [routines, setRoutines] = useState<LogRoutine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastLoadedAt, setLastLoadedAt] = useState<number | null>(null);

  const loadRoutines = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const isActiveRequest = () => mountedRef.current && requestIdRef.current === requestId;

    if (!user?.id) {
      setRoutines([]);
      setLoading(false);
      setError('');
      setLastLoadedAt(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const nextRoutines = await fetchLogRoutines(user.id, MAX_ROUTINES);

      if (!isActiveRequest()) return;

      setRoutines(nextRoutines);
      setLastLoadedAt(Date.now());
    } catch (err) {
      if (!isActiveRequest()) return;

      console.error('Error loading pinned routines:', err);
      setError(err instanceof Error ? err.message : 'Could not load pinned routines');
    } finally {
      if (isActiveRequest()) {
        setLoading(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const useRoutine = async (routine: LogRoutine) => {
    const staged = stageLogTemplateDraft(routine.log_type, routine.routine_payload);

    if (!staged) {
      setError('Could not prepare that routine. Open the log history and try again.');
      return;
    }

    try {
      await markLogRoutineUsed(routine.id);
    } catch (err) {
      console.error('Error updating routine usage:', err);
    }

    navigate(routineMeta[routine.log_type].path);
  };

  const removeRoutine = async (routine: LogRoutine) => {
    if (!user?.id) {
      setError('You must be signed in to remove a routine');
      return;
    }

    if (!window.confirm(`Remove "${routine.routine_name}" from pinned routines?`)) {
      return;
    }

    try {
      await deleteLogRoutine(user.id, routine.id);
      setRoutines((current) => current.filter((item) => item.id !== routine.id));
      setError('');
    } catch (err) {
      console.error('Error deleting pinned routine:', err);
      setError(err instanceof Error ? err.message : 'Could not remove routine');
    }
  };

  return (
    <section className="card-enter surface-intelligence rounded-[28px] p-4 sm:rounded-[32px] sm:p-6 lg:p-7">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="badge-secondary mb-3 inline-flex">Pinned</span>
          <h2 className="text-[clamp(1.45rem,2vw,1.75rem)] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
            Pinned routines
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Save repeated meals, meds, hydration, and symptom patterns from history, then reload
            them here as new unsaved drafts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {lastLoadedAt && (
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-[var(--color-text-tertiary)]">
              Updated {formatLoadedAt(lastLoadedAt)}
            </span>
          )}

          <button
            type="button"
            onClick={loadRoutines}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition-smooth hover:border-white/16 hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-[rgba(255,120,120,0.24)] bg-[rgba(255,120,120,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="min-h-[166px] animate-pulse rounded-[24px] border border-white/8 bg-white/[0.03]"
            />
          ))}
        </div>
      ) : routines.length === 0 ? (
        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-6 text-sm leading-6 text-[var(--color-text-secondary)]">
          No pinned routines yet. Open a log history entry and choose Save routine to turn it into
          a reusable dashboard shortcut.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {routines.map((routine) => {
            const meta = routineMeta[routine.log_type];
            const Icon = meta.icon;

            return (
              <article
                key={routine.id}
                className="rounded-[24px] border border-[rgba(143,128,246,0.16)] bg-[rgba(143,128,246,0.06)] p-4 transition-smooth hover:border-[rgba(143,128,246,0.30)] hover:bg-[rgba(143,128,246,0.09)]"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(143,128,246,0.12)] text-[var(--gw-brand-300)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                        {meta.label}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold leading-5 text-[var(--color-text-primary)]">
                        {routine.routine_name}
                      </h3>
                    </div>
                  </div>

                  <Pin className="mt-1 h-4 w-4 shrink-0 text-[var(--gw-brand-300)]" />
                </div>

                <p className="min-h-[40px] text-sm leading-5 text-[var(--color-text-secondary)]">
                  {describeRoutine(routine)}
                </p>

                <div className="mt-3 rounded-2xl border border-white/8 bg-black/[0.10] px-3 py-2 text-xs leading-5 text-[var(--color-text-tertiary)]">
                  {getRoutineUseLabel(routine)}. Opens as a new unsaved draft.
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => useRoutine(routine)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[rgba(143,128,246,0.24)] bg-[rgba(143,128,246,0.10)] px-3 py-2 text-xs font-semibold text-[var(--gw-brand-300)] transition-smooth hover:border-[rgba(143,128,246,0.38)] hover:bg-[rgba(143,128,246,0.14)]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Use routine
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(meta.path)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-[var(--color-text-tertiary)] transition-smooth hover:border-white/16 hover:text-[var(--color-text-primary)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open log
                  </button>

                  <button
                    type="button"
                    onClick={() => removeRoutine(routine)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.06)] px-3 py-2 text-xs font-semibold text-[var(--color-danger)] transition-smooth hover:border-[rgba(255,120,120,0.30)] hover:bg-[rgba(255,120,120,0.10)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}