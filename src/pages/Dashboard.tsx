import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import {
  Waves,
  Utensils,
  Droplet,
  Moon,
  Brain,
  Pill,
  AlertCircle,
  Heart,
  Dumbbell,
  Plus,
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
}

const quickActions: QuickAction[] = [
  {
    label: 'Bowel Movement',
    shortLabel: 'BM',
    path: '/bm-log',
    icon: Waves,
    tier: 'primary',
    hoverClasses: {
      button: 'hover:bg-orange-400/10 hover:border-orange-500/30 dark:hover:bg-orange-400/10 dark:hover:border-orange-500/25',
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
    hoverClasses: {
      button: 'hover:bg-rose-400/10 hover:border-rose-400/30 dark:hover:bg-rose-400/10 dark:hover:border-rose-400/25',
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
    hoverClasses: {
      button: 'hover:bg-emerald-400/10 hover:border-emerald-500/30 dark:hover:bg-emerald-400/10 dark:hover:border-emerald-500/25',
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
    hoverClasses: {
      button: 'hover:bg-sky-400/10 hover:border-sky-400/30 dark:hover:bg-sky-400/10 dark:hover:border-sky-400/25',
      iconBg: 'group-hover:bg-sky-400/20 dark:group-hover:bg-sky-400/20',
      iconColor: 'group-hover:text-sky-500 dark:group-hover:text-sky-400',
    },
  },
  { label: 'Sleep', shortLabel: 'Sleep', path: '/sleep-log', icon: Moon, tier: 'secondary' },
  { label: 'Stress', shortLabel: 'Stress', path: '/stress-log', icon: Brain, tier: 'secondary' },
  { label: 'Exercise', shortLabel: 'Exercise', path: '/exercise-log', icon: Dumbbell, tier: 'secondary' },
  { label: 'Medication', shortLabel: 'Meds', path: '/medication-log', icon: Pill, tier: 'secondary' },
  { label: 'Cycle', shortLabel: 'Cycle', path: '/menstrual-cycle-log', icon: Heart, tier: 'secondary' },
];

const primaryActions = quickActions.filter((a) => a.tier === 'primary');
const secondaryActions = quickActions.filter((a) => a.tier === 'secondary');

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

      <main className="flex-1 lg:ml-64 p-md sm:p-lg lg:p-lg pt-16 sm:pt-16 lg:pt-lg">
        <div className="max-w-7xl mx-auto space-y-lg">
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

          <Card variant="elevated" padding="sm" className="relative overflow-hidden">
            <div className="glass-sheen-overlay" aria-hidden="true" style={{ animationDelay: '4s' }} />
            <div className="flex items-center justify-between mb-4 px-2 pt-1">
              <div>
                <h2 className="text-body-md font-sora font-semibold text-neutral-text dark:text-dark-text">
                  Quick Log
                </h2>
                <p className="text-body-xs text-neutral-muted dark:text-dark-muted mt-0.5">
                  Tap to start a new entry
                </p>
              </div>
              <Plus className="h-4 w-4 text-neutral-muted dark:text-dark-muted" />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
              {primaryActions.map((action) => {
                const Icon = action.icon;
                const hc = action.hoverClasses;
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className={`flex flex-col items-center gap-2.5 p-4 rounded-xl bg-brand-500/8 dark:bg-brand-500/12 border border-brand-500/20 dark:border-brand-500/25 transition-all group ${hc?.button ?? 'hover:bg-brand-500/14 dark:hover:bg-brand-500/20 hover:border-brand-500/35'}`}
                  >
                    <div className={`flex items-center justify-center w-9 h-9 rounded-lg bg-brand-500/15 dark:bg-brand-500/20 transition-colors ${hc?.iconBg ?? 'group-hover:bg-brand-500/25'}`}>
                      <Icon className={`h-4 w-4 text-brand-600 dark:text-brand-300 group-hover:scale-110 transition-transform transition-colors ${hc?.iconColor ?? ''}`} />
                    </div>
                    <span className="text-xs font-semibold text-neutral-text dark:text-dark-text text-center leading-tight">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mb-2.5 px-1">
              <div className="flex-1 h-px bg-neutral-border dark:bg-dark-border" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-muted/50 dark:text-dark-muted/50">
                Lifestyle
              </span>
              <div className="flex-1 h-px bg-neutral-border dark:bg-dark-border" />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {secondaryActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-neutral-bg dark:bg-dark-bg border border-neutral-border dark:border-dark-border hover:border-brand-500/30 dark:hover:border-brand-500/25 hover:bg-brand-500/5 dark:hover:bg-brand-500/8 transition-all group"
                  >
                    <Icon className="h-3.5 w-3.5 text-neutral-muted dark:text-dark-muted group-hover:text-brand-500 dark:group-hover:text-brand-300 transition-colors" />
                    <span className="text-[10px] font-medium text-neutral-muted dark:text-dark-muted group-hover:text-neutral-text dark:group-hover:text-dark-text text-center leading-tight">
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
                Today's Detail
              </h2>
              <p className="text-body-sm text-neutral-muted dark:text-dark-muted mt-0.5">
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

              <SymptomSnapshotWidget
                symptoms={metrics.todaySymptoms}
                loading={loading}
              />

              <HydrationWidget
                totalMl={metrics.todayHydration.total_ml}
                targetMl={metrics.todayHydration.target_ml}
                entries={metrics.todayHydration.entries}
                loading={loading}
              />

              <div className="md:col-span-2">
                <MedicationWidget
                  medications={metrics.recentMedications}
                  loading={loading}
                />
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
