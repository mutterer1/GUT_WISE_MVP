import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import {
  Waves,
  Utensils,
  Droplet,
  Moon,
  Frown,
  Pill,
  AlertCircle,
  Heart,
  Dumbbell,
  Plus,
  ClipboardCheck,
  type LucideIcon,
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../contexts/AuthContext';
import { useAutoGenerateInsights } from '../hooks/useAutoGenerateInsights';
import TodaySummaryWidget from '../components/dashboard/TodaySummaryWidget';
import BMCountWidget from '../components/dashboard/BMCountWidget';
import BristolScaleWidget from '../components/dashboard/BristolScaleWidget';
import SymptomSnapshotWidget from '../components/dashboard/SymptomSnapshotWidget';
import HydrationWidget from '../components/dashboard/HydrationWidget';
import MedicationWidget from '../components/dashboard/MedicationWidget';
import PatternInsightsWidget from '../components/dashboard/PatternInsightsWidget';
import SignalRibbonBackground from '../components/dashboard/SignalRibbonBackground';
import type { DashboardMetrics } from '../types/dashboard';

interface QuickActionHoverClasses {
  button: string;
  iconBg: string;
  iconColor: string;
}

interface QuickAction {
  label: string;
  shortLabel: string;
  path: string;
  icon: LucideIcon;
  tier: 'primary' | 'secondary';
  hoverClasses?: QuickActionHoverClasses;
  sublabelKey?: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Bowel Movement',
    shortLabel: 'BM',
    path: '/bm-log',
    icon: Waves,
    tier: 'primary',
    sublabelKey: 'todayBMCount',
    hoverClasses: {
      button:
        'hover:bg-orange-400/10 hover:border-orange-500/30 dark:hover:bg-orange-400/10 dark:hover:border-orange-500/25 hover:-translate-y-0.5 hover:shadow-sm',
      iconBg: 'group-hover:bg-orange-400/20 dark:group-hover:bg-orange-400/20',
      iconColor: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
    },
  },
  {
    label: 'Symptoms',
    shortLabel: 'Symptoms',
    path: '/symptoms-log',
    icon: AlertCircle,
    tier: 'primary',
    sublabelKey: 'todaySymptoms',
    hoverClasses: {
      button:
        'hover:bg-rose-400/10 hover:border-rose-400/30 dark:hover:bg-rose-400/10 dark:hover:border-rose-400/25 hover:-translate-y-0.5 hover:shadow-sm',
      iconBg: 'group-hover:bg-rose-400/20 dark:group-hover:bg-rose-400/20',
      iconColor: 'group-hover:text-rose-500 dark:group-hover:text-rose-400',
    },
  },
  {
    label: 'Food',
    shortLabel: 'Food',
    path: '/food-log',
    icon: Utensils,
    tier: 'primary',
    sublabelKey: 'todayFood',
    hoverClasses: {
      button:
        'hover:bg-emerald-400/10 hover:border-emerald-500/30 dark:hover:bg-emerald-400/10 dark:hover:border-emerald-500/25 hover:-translate-y-0.5 hover:shadow-sm',
      iconBg: 'group-hover:bg-emerald-400/20 dark:group-hover:bg-emerald-400/20',
      iconColor: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    },
  },
  {
    label: 'Hydration',
    shortLabel: 'Hydration',
    path: '/hydration-log',
    icon: Droplet,
    tier: 'primary',
    sublabelKey: 'todayHydration',
    hoverClasses: {
      button:
        'hover:bg-sky-400/10 hover:border-sky-400/30 dark:hover:bg-sky-400/10 dark:hover:border-sky-400/25 hover:-translate-y-0.5 hover:shadow-sm',
      iconBg: 'group-hover:bg-sky-400/20 dark:group-hover:bg-sky-400/20',
      iconColor: 'group-hover:text-sky-500 dark:group-hover:text-sky-400',
    },
  },
  {
    label: 'Sleep',
    shortLabel: 'Sleep',
    path: '/sleep-log',
    icon: Moon,
    tier: 'secondary',
    hoverClasses: {
      button:
        'hover:bg-indigo-400/8 hover:border-indigo-400/25 dark:hover:bg-indigo-400/8 dark:hover:border-indigo-400/20 hover:-translate-y-px',
      iconBg: 'group-hover:bg-indigo-400/15 dark:group-hover:bg-indigo-400/15',
      iconColor: 'group-hover:text-indigo-400 dark:group-hover:text-indigo-300',
    },
  },
  {
    label: 'Stress',
    shortLabel: 'Stress',
    path: '/stress-log',
    icon: Frown,
    tier: 'secondary',
    hoverClasses: {
      button:
        'hover:bg-pink-400/8 hover:border-pink-400/25 dark:hover:bg-pink-400/8 dark:hover:border-pink-400/20 hover:-translate-y-px',
      iconBg: 'group-hover:bg-pink-400/15 dark:group-hover:bg-pink-400/15',
      iconColor: 'group-hover:text-pink-400 dark:group-hover:text-pink-300',
    },
  },
  {
    label: 'Exercise',
    shortLabel: 'Exercise',
    path: '/exercise-log',
    icon: Dumbbell,
    tier: 'secondary',
    hoverClasses: {
      button:
        'hover:bg-blue-400/8 hover:border-blue-400/25 dark:hover:bg-blue-400/8 dark:hover:border-blue-400/20 hover:-translate-y-px',
      iconBg: 'group-hover:bg-blue-400/15 dark:group-hover:bg-blue-400/15',
      iconColor: 'group-hover:text-blue-400 dark:group-hover:text-blue-300',
    },
  },
  {
    label: 'Medication',
    shortLabel: 'Meds',
    path: '/medication-log',
    icon: Pill,
    tier: 'secondary',
    hoverClasses: {
      button:
        'hover:bg-slate-400/8 hover:border-slate-400/25 dark:hover:bg-slate-400/8 dark:hover:border-slate-400/20 hover:-translate-y-px',
      iconBg: 'group-hover:bg-slate-400/15 dark:group-hover:bg-slate-400/15',
      iconColor: 'group-hover:text-slate-400 dark:group-hover:text-slate-300',
    },
  },
  {
    label: 'Cycle',
    shortLabel: 'Cycle',
    path: '/menstrual-cycle-log',
    icon: Heart,
    tier: 'secondary',
    hoverClasses: {
      button:
        'hover:bg-rose-300/8 hover:border-rose-300/25 dark:hover:bg-rose-300/8 dark:hover:border-rose-300/20 hover:-translate-y-px',
      iconBg: 'group-hover:bg-rose-300/15 dark:group-hover:bg-rose-300/15',
      iconColor: 'group-hover:text-rose-300 dark:group-hover:text-rose-200',
    },
  },
];

const primaryActions = quickActions.filter((a) => a.tier === 'primary');
const secondaryActions = quickActions.filter((a) => a.tier === 'secondary');

function getPrimarySublabel(action: QuickAction, metrics: DashboardMetrics): string | null {
  switch (action.sublabelKey) {
    case 'todayBMCount':
      return metrics.todayBMCount > 0 ? `${metrics.todayBMCount} today` : 'Not logged today';
    case 'todaySymptoms':
      return metrics.todaySymptoms.length > 0
        ? `${metrics.todaySymptoms.length} logged`
        : 'Not logged today';
    case 'todayFood': {
      const total = metrics.todayFood.meals + metrics.todayFood.snacks;
      return total > 0 ? `${total} entries` : 'Not logged today';
    }
    case 'todayHydration':
      return metrics.todayHydration.entries > 0
        ? `${metrics.todayHydration.entries} logs`
        : 'Not logged today';
    default:
      return null;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { metrics, loading, error } = useDashboardData();
  const { profile } = useAuth();

  useAutoGenerateInsights();

  const userName = profile?.full_name || '';

  const sleepHours = metrics.lastSleep?.duration_minutes
    ? Math.round(metrics.lastSleep.duration_minutes / 60)
    : null;

  const hydrationPercentage =
    metrics.todayHydration.target_ml > 0
      ? (metrics.todayHydration.total_ml / metrics.todayHydration.target_ml) * 100
      : 0;

  return (
    <div className="flex min-h-screen bg-neutral-bg dark:bg-dark-bg">
      <Sidebar />

      <main className="relative flex-1 p-md pt-16 sm:p-lg sm:pt-16 lg:ml-64 lg:p-lg lg:pt-lg">
        <SignalRibbonBackground />
        <div className="relative mx-auto max-w-7xl space-y-lg" style={{ zIndex: 1 }}>
          {error && (
            <div className="rounded-xl border border-signal-500/30 bg-signal-500/10 p-md text-body-sm text-signal-500">
              {error}
            </div>
          )}

          <TodaySummaryWidget
            bmCount={metrics.todayBMCount}
            mealsCount={metrics.todayFood.meals}
            snacksCount={metrics.todayFood.snacks}
            hydrationMl={metrics.todayHydration.total_ml}
            sleepHours={sleepHours}
            symptomsCount={metrics.todaySymptoms.length}
            loading={loading}
            userName={userName}
          />

          <Card variant="discovery" padding="sm" className="overflow-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/12 text-brand-500 dark:text-brand-300">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-body-md font-sora font-semibold text-neutral-text dark:text-dark-text">
                    New: one-pass daily check-in
                  </h2>
                  <p className="mt-1 text-body-sm text-neutral-muted dark:text-dark-muted">
                    Log the day in one place so GutWise gets the overlap it needs across stool,
                    symptoms, meals, hydration, sleep, stress, medication, cycle, and exercise.
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/daily-check-in')} className="shrink-0">
                Open Daily Check-In
              </Button>
            </div>
          </Card>

          <Card variant="elevated" padding="sm" className="relative overflow-hidden">
            <div
              className="glass-sheen-overlay"
              aria-hidden="true"
              style={{ animationDelay: '4s' }}
            />
            <div className="mb-4 flex items-center justify-between px-2 pt-1">
              <div>
                <h2 className="text-body-md font-sora font-semibold text-neutral-text dark:text-dark-text">
                  Quick Log
                </h2>
                <p className="mt-0.5 text-body-xs text-neutral-muted dark:text-dark-muted">
                  Individual entries still work if you only want to log one thing
                </p>
              </div>
              <Plus className="h-4 w-4 text-neutral-muted dark:text-dark-muted" />
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {primaryActions.map((action) => {
                const Icon = action.icon;
                const hc = action.hoverClasses;
                const sublabel = getPrimarySublabel(action, metrics);
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className={`group flex flex-col items-center gap-2 rounded-xl border border-brand-500/20 bg-brand-500/8 p-4 transition-all duration-200 dark:border-brand-500/25 dark:bg-brand-500/12 ${
                      hc?.button ??
                      'hover:bg-brand-500/14 hover:border-brand-500/35 dark:hover:bg-brand-500/20'
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15 transition-colors dark:bg-brand-500/20 ${
                        hc?.iconBg ?? 'group-hover:bg-brand-500/25'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 text-brand-600 transition-transform group-hover:scale-110 dark:text-brand-300 ${
                          hc?.iconColor ?? ''
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-semibold leading-tight text-neutral-text dark:text-dark-text">
                        {action.label}
                      </span>
                      {sublabel && !loading && (
                        <span className="mt-0.5 block text-[10px] leading-tight text-neutral-muted dark:text-dark-muted">
                          {sublabel}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mb-2.5 flex items-center gap-3 px-1">
              <div className="h-px flex-1 bg-neutral-border dark:bg-dark-border" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-muted/50 dark:text-dark-muted/50">
                Lifestyle
              </span>
              <div className="h-px flex-1 bg-neutral-border dark:bg-dark-border" />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {secondaryActions.map((action) => {
                const Icon = action.icon;
                const hc = action.hoverClasses;
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className={`group flex flex-col items-center gap-1.5 rounded-lg border border-neutral-border bg-neutral-bg p-3 transition-all duration-200 dark:border-dark-border dark:bg-dark-bg ${
                      hc?.button ??
                      'hover:border-brand-500/30 hover:bg-brand-500/5 dark:hover:border-brand-500/25 dark:hover:bg-brand-500/8'
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 text-neutral-muted transition-colors dark:text-dark-muted ${
                        hc?.iconColor ?? 'group-hover:text-brand-500 dark:group-hover:text-brand-300'
                      }`}
                    />
                    <span className="text-center text-[10px] font-medium leading-tight text-neutral-muted group-hover:text-neutral-text dark:text-dark-muted dark:group-hover:text-dark-text">
                      {action.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <div>
            <div className="mb-md">
              <h2 className="text-h5 font-sora font-semibold text-neutral-text dark:text-dark-text">
                Today&apos;s Detail
              </h2>
              <p className="mt-0.5 text-body-sm text-neutral-muted dark:text-dark-muted">
                Your tracked health metrics for today
              </p>
            </div>

            <div className="grid grid-cols-1 gap-md md:grid-cols-2">
              <BMCountWidget count={metrics.todayBMCount} loading={loading} />

              <BristolScaleWidget
                averageScale={metrics.averageBristolScale}
                count={metrics.todayBMCount}
                loading={loading}
              />

              <SymptomSnapshotWidget symptoms={metrics.todaySymptoms} loading={loading} />

              <HydrationWidget
                totalMl={metrics.todayHydration.total_ml}
                targetMl={metrics.todayHydration.target_ml}
                entries={metrics.todayHydration.entries}
                loading={loading}
              />

              <div className="md:col-span-2">
                <MedicationWidget medications={metrics.recentMedications} loading={loading} />
              </div>
            </div>
          </div>

          <PatternInsightsWidget
            bmCount={metrics.todayBMCount}
            symptomsCount={metrics.todaySymptoms.length}
            stressLevel={metrics.todayStress.average_level}
            hydrationPercentage={hydrationPercentage}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}
