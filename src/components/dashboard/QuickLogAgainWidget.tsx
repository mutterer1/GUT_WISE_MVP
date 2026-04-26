import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Copy,
  Droplet,
  Dumbbell,
  Frown,
  Heart,
  Moon,
  Pill,
  Utensils,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { stageLogTemplateDraft } from '../../utils/logTemplateDrafts';
import type { SaveEvent } from '../../services/saveEventManager';

type LogType = SaveEvent['logType'];

type LogRecord = Record<string, unknown> & {
  id?: string;
  logged_at?: string;
};

interface TemplateDefinition {
  logType: LogType;
  table: string;
  path: string;
  label: string;
  icon: LucideIcon;
  title: (entry: LogRecord) => string;
  detail: (entry: LogRecord) => string;
}

interface RecentTemplate {
  key: string;
  logType: LogType;
  path: string;
  label: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  timestamp: string;
  entry: LogRecord;
}

const MAX_VISIBLE_TEMPLATES = 6;
const PER_TYPE_LIMIT = 2;

function stringValue(entry: LogRecord, key: string, fallback = ''): string {
  const value = entry[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function numberValue(entry: LogRecord, key: string): number | null {
  const value = entry[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function arrayValue(entry: LogRecord, key: string): unknown[] {
  const value = entry[key];
  return Array.isArray(value) ? value : [];
}

function formatSnakeCase(value: string): string {
  return value.replace(/_/g, ' ');
}

function formatLoggedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function getTimestampMs(value: string): number {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function joinParts(...parts: Array<string | number | null | undefined>): string {
  return parts.filter((part) => part !== null && part !== undefined && String(part).length > 0).join(' | ');
}

function getFoodNames(entry: LogRecord): string {
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

const templateDefinitions: TemplateDefinition[] = [
  {
    logType: 'food',
    table: 'food_logs',
    path: '/food-log',
    label: 'Food',
    icon: Utensils,
    title: getFoodNames,
    detail: (entry) =>
      joinParts(
        formatSnakeCase(stringValue(entry, 'meal_type', 'meal')),
        stringValue(entry, 'portion_size', 'portion not set')
      ),
  },
  {
    logType: 'bm',
    table: 'bm_logs',
    path: '/bm-log',
    label: 'BM',
    icon: Waves,
    title: (entry) => `Bristol Type ${numberValue(entry, 'bristol_type') ?? '-'}`,
    detail: (entry) =>
      joinParts(
        stringValue(entry, 'amount', 'amount not set'),
        `urgency ${numberValue(entry, 'urgency') ?? '-'}/10`
      ),
  },
  {
    logType: 'symptoms',
    table: 'symptom_logs',
    path: '/symptoms-log',
    label: 'Symptoms',
    icon: AlertCircle,
    title: (entry) => stringValue(entry, 'symptom_type', 'Symptom entry'),
    detail: (entry) =>
      joinParts(
        `severity ${numberValue(entry, 'severity') ?? '-'}/10`,
        `${numberValue(entry, 'duration_minutes') ?? '-'} min`
      ),
  },
  {
    logType: 'hydration',
    table: 'hydration_logs',
    path: '/hydration-log',
    label: 'Hydration',
    icon: Droplet,
    title: (entry) => stringValue(entry, 'beverage_type', 'Hydration entry'),
    detail: (entry) =>
      joinParts(
        `${numberValue(entry, 'amount_ml') ?? '-'} ml`,
        formatSnakeCase(stringValue(entry, 'beverage_category', 'other'))
      ),
  },
  {
    logType: 'medication',
    table: 'medication_logs',
    path: '/medication-log',
    label: 'Meds',
    icon: Pill,
    title: (entry) => stringValue(entry, 'medication_name', 'Medication entry'),
    detail: (entry) =>
      joinParts(
        stringValue(entry, 'dosage', 'dosage not set'),
        formatSnakeCase(stringValue(entry, 'medication_type', 'medication'))
      ),
  },
  {
    logType: 'sleep',
    table: 'sleep_logs',
    path: '/sleep-log',
    label: 'Sleep',
    icon: Moon,
    title: () => 'Sleep pattern',
    detail: (entry) =>
      joinParts(
        `quality ${numberValue(entry, 'quality') ?? '-'}/10`,
        `${numberValue(entry, 'interruptions') ?? 0} interruptions`
      ),
  },
  {
    logType: 'stress',
    table: 'stress_logs',
    path: '/stress-log',
    label: 'Stress',
    icon: Frown,
    title: (entry) => `Stress ${numberValue(entry, 'stress_level') ?? '-'}/10`,
    detail: (entry) => {
      const triggers = arrayValue(entry, 'triggers').filter((trigger) => typeof trigger === 'string');
      return triggers.length > 0 ? triggers.slice(0, 2).join(', ') : 'No trigger tags';
    },
  },
  {
    logType: 'exercise',
    table: 'exercise_logs',
    path: '/exercise-log',
    label: 'Exercise',
    icon: Dumbbell,
    title: (entry) => stringValue(entry, 'exercise_type', 'Exercise entry'),
    detail: (entry) =>
      joinParts(
        `${numberValue(entry, 'duration_minutes') ?? '-'} min`,
        `intensity ${numberValue(entry, 'intensity_level') ?? '-'}/5`
      ),
  },
  {
    logType: 'menstrual-cycle',
    table: 'menstrual_cycle_logs',
    path: '/menstrual-cycle-log',
    label: 'Cycle',
    icon: Heart,
    title: (entry) => `Cycle day ${numberValue(entry, 'cycle_day') ?? '-'}`,
    detail: (entry) =>
      joinParts(
        `${stringValue(entry, 'flow_intensity', 'flow not set')} flow`,
        `pain ${numberValue(entry, 'pain_level') ?? '-'}/10`
      ),
  },
];

export default function QuickLogAgainWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<RecentTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) {
      setTemplates([]);
      return;
    }

    const userId = user.id;
    let cancelled = false;

    async function fetchRecentTemplates() {
      setLoading(true);
      setError('');

      try {
        const results = await Promise.all(
          templateDefinitions.map(async (definition) => {
            try {
              const { data, error: queryError } = await supabase
                .from(definition.table)
                .select('*')
                .eq('user_id', userId)
                .order('logged_at', { ascending: false })
                .limit(PER_TYPE_LIMIT);

              if (queryError) {
                throw queryError;
              }

              return (data || []).map((entry) => {
                const record = entry as LogRecord;
                const timestamp = stringValue(record, 'logged_at', '');

                return {
                  key: `${definition.logType}-${String(record.id ?? timestamp)}`,
                  logType: definition.logType,
                  path: definition.path,
                  label: definition.label,
                  icon: definition.icon,
                  title: definition.title(record),
                  detail: definition.detail(record),
                  timestamp,
                  entry: record,
                };
              });
            } catch (queryErr) {
              console.error(`Error loading ${definition.table} templates:`, queryErr);
              return [];
            }
          })
        );

        if (cancelled) return;

        const nextTemplates = results
          .flat()
          .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp))
          .slice(0, MAX_VISIBLE_TEMPLATES);

        setTemplates(nextTemplates);
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading quick log templates:', err);
          setError(err instanceof Error ? err.message : 'Could not load recent templates');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRecentTemplates();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const useTemplate = (template: RecentTemplate) => {
    const staged = stageLogTemplateDraft(template.logType, template.entry);

    if (!staged) {
      setError('Could not prepare that template. Open the log history and try again.');
      return;
    }

    navigate(template.path);
  };

  return (
    <section className="card-enter surface-panel rounded-[32px] p-5 sm:p-6 lg:p-7">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="badge-secondary mb-3 inline-flex">Reuse</span>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
            Quick log again
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Reuse a recent entry as a starting point, adjust what changed, then save it as a new log.
          </p>
        </div>

        <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-[var(--color-text-tertiary)] sm:flex">
          <Copy className="h-4 w-4" />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-[rgba(255,120,120,0.24)] bg-[rgba(255,120,120,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="min-h-[154px] animate-pulse rounded-[24px] border border-white/8 bg-white/[0.03]"
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-6 text-sm leading-6 text-[var(--color-text-secondary)]">
          Recent templates will appear after you have saved a few log entries.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const Icon = template.icon;

            return (
              <article
                key={template.key}
                className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 transition-smooth hover:border-[rgba(143,128,246,0.24)] hover:bg-white/[0.045]"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(143,128,246,0.10)] text-[var(--gw-brand-300)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                        {template.label}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold leading-5 text-[var(--color-text-primary)]">
                        {template.title}
                      </h3>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[var(--color-text-tertiary)]">
                    {formatLoggedAt(template.timestamp)}
                  </span>
                </div>

                <p className="min-h-[40px] text-sm leading-5 text-[var(--color-text-secondary)]">
                  {template.detail}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => useTemplate(template)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(143,128,246,0.22)] bg-[rgba(143,128,246,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--gw-brand-300)] transition-smooth hover:border-[rgba(143,128,246,0.36)] hover:bg-[rgba(143,128,246,0.12)]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Use template
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(template.path)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-tertiary)] transition-smooth hover:border-white/16 hover:text-[var(--color-text-primary)]"
                  >
                    Open log
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