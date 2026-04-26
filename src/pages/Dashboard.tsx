import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  ClipboardCheck,
  Droplet,
  Heart,
  Moon,
  Pill,
  Plus,
  Sparkles,
  Utensils,
  Waves,
  AlertCircle,
  Frown,
  Dumbbell,
  type LucideIcon,
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
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
import QuickLogAgainWidget from '../components/dashboard/QuickLogAgainWidget';
import SignalRibbonBackground from '../components/dashboard/SignalRibbonBackground';
import type { DashboardMetrics } from '../types/dashboard';

interface QuickAction {
  label: string;
  shortLabel: string;
  path: string;
  icon: LucideIcon;
  tier: 'primary' | 'secondary';
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
  },
  {
    label: 'Symptoms',
    shortLabel: 'Symptoms',
    path: '/symptoms-log',
    icon: AlertCircle,
    tier: 'primary',
    sublabelKey: 'todaySymptoms',
  },
  {
    label: 'Food',
    shortLabel: 'Food',
    path: '/food-log',
    icon: Utensils,
    tier: 'primary',
    sublabelKey: 'todayFood',
  },
  {
    label: 'Hydration',
    shortLabel: 'Hydration',
    path: '/hydration-log',
    icon: Droplet,
    tier: 'primary',
    sublabelKey: 'todayHydration',
  },
  {
    label: 'Sleep',
    shortLabel: 'Sleep',
    path: '/sleep-log',
    icon: Moon,
    tier: 'secondary',
  },
  {
    label: 'Stress',
    shortLabel: 'Stress',
    path: '/stress-log',
    icon: Frown,
    tier: 'secondary',
  },
  {
    label: 'Exercise',
    shortLabel: 'Exercise',
    path: '/exercise-log',
    icon: Dumbbell,
    tier: 'secondary',
  },
  {
    label: 'Medication',
    shortLabel: 'Meds',
    path: '/medication-log',
    icon: Pill,
    tier: 'secondary',
  },
  {
    label: 'Cycle',
    shortLabel: 'Cycle',
    path: '/menstrual-cycle-log',
    icon: Heart,
    tier: 'secondary',
  },
];

const primaryActions = quickActions.filter((action) => action.tier === 'primary');
const secondaryActions = quickActions.filter((action) => action.tier === 'secondary');

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
      ? (metrics.todayHydration.water_goal_ml / metrics.todayHydration.target_ml) * 100
      : 0;

  return (
    <MainLayout>
      <div className="relative">
        <SignalRibbonBackground />

        <div className="relative z-[1] mx-auto w-full max-w-7xl space-y-6">
          {error && (
            <div className="rounded-2xl border border-[rgba(255,120,120,0.24)] bg-[rgba(255,120,120,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
              {error}
            </div>
          )}

          <section className="page-enter surface-panel overflow-hidden rounded-[32px] p-5 sm:p-6 lg:p-8">
            <div className="page-header items-start justify-between gap-6">
              <div className="max-w-3xl">
                <span className="badge-secondary mb-3 inline-flex">Daily Overview</span>
                <h1 className="page-title">A clearer operating view for today&apos;s gut health signals.</h1>
                <p className="page-subtitle mt-2">
                  Track what changed, spot overlap across symptoms and behavior, and move into
                  logging or review without hunting through the app.
                </p>
              </div>

              <div className="surface-intelligence hidden min-w-[280px] rounded-[28px] p-4 lg:block">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(133,93,255,0.16)] text-[var(--color-accent-secondary)]">
                  <Brain className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  Intelligence works better with overlap
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                  A fuller day of signals gives GutWise more context for patterns, drift, and
                  recovery windows.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <TodaySummaryWidget
                bmCount={metrics.todayBMCount}
                mealsCount={metrics.todayFood.meals}
                snacksCount={metrics.todayFood.snacks}
                hydrationMl={metrics.todayHydration.water_goal_ml}
                sleepHours={sleepHours}
                symptomsCount={metrics.todaySymptoms.length}
                loading={loading}
                userName={userName}
              />
            </div>
          </section>

          <section className="card-enter grid gap-4 xl:grid-cols-[1.3fr_0.95fr]">
            <Card variant="discovery" padding="sm" className="rounded-[28px]">
              <div className="flex h-full flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                        One-pass daily check-in
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Log the day in one focused pass so symptoms, meals, hydration, sleep,
                        stress, medication, exercise, and cycle context connect properly.
                      </p>
                    </div>
                  </div>

                  <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] sm:block">
                    Recommended
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button onClick={() => navigate('/daily-check-in')}>
                    Open Daily Check-In
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    Best option when you want pattern quality, not just data capture.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="flat" padding="sm" className="rounded-[28px]">
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(133,93,255,0.12)] text-[var(--color-accent-secondary)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                      Today&apos;s pattern posture
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                      Review signal strength, then decide whether to log fast or inspect detail.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="surface-panel-quiet rounded-2xl p-4">
                    <p className="metric-label">Water goal</p>
                    <p className="metric-value mt-2">{Math.round(hydrationPercentage)}%</p>
                  </div>

                  <div className="surface-panel-quiet rounded-2xl p-4">
                    <p className="metric-label">Symptoms logged</p>
                    <p className="metric-value mt-2">{metrics.todaySymptoms.length}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-[var(--color-text-tertiary)]">
                  Water goal progress now reflects water-credit intake, while other beverages stay
                  available as context.
                </div>
              </div>
            </Card>
          </section>

          <section className="card-enter surface-panel rounded-[32px] p-5 sm:p-6 lg:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <span className="badge-secondary mb-3 inline-flex">Quick Capture</span>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                  Log one thing quickly
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Use direct entry when you only need to record a single signal.
                </p>
              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-[var(--color-text-tertiary)] sm:flex">
                <Plus className="h-4 w-4" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {primaryActions.map((action) => {
                const Icon = action.icon;
                const sublabel = getPrimarySublabel(action, metrics);

                return (
                  <button
                    key={action.path}
                    type="button"
                    onClick={() => navigate(action.path)}
                    className="group rounded-[24px] border border-[rgba(84,160,255,0.16)] bg-[rgba(84,160,255,0.06)] p-5 text-center transition-smooth hover:border-[rgba(84,160,255,0.32)] hover:bg-[rgba(84,160,255,0.1)]"
                  >
                    <div className="flex min-h-[204px] h-full flex-col items-center justify-center">
                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)] transition-smooth group-hover:scale-[1.04]">
                        <Icon className="h-5 w-5" />
                      </div>

                      <p className="text-[clamp(1.2rem,1.55vw,1.55rem)] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                        {action.label}
                      </p>

                      <p className="mt-2 min-h-[24px] text-sm text-[var(--color-text-tertiary)]">
                        {!loading && sublabel ? sublabel : ' '}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="my-5 h-px bg-white/8" />

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {secondaryActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.path}
                    type="button"
                    onClick={() => navigate(action.path)}
                    className="group rounded-[20px] border border-white/8 bg-white/[0.03] px-3 py-5 text-center transition-smooth hover:border-white/14 hover:bg-white/[0.05]"
                  >
                    <div className="flex min-h-[128px] h-full flex-col items-center justify-center">
                      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.05] text-[var(--color-text-tertiary)] transition-smooth group-hover:text-[var(--color-text-secondary)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                        {action.shortLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <QuickLogAgainWidget />

          <section className="space-y-4">
            <div className="page-header">
              <div>
                <span className="badge-secondary mb-3 inline-flex">Detail</span>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                  Today&apos;s measured detail
                </h2>
                <p className="page-subtitle mt-2">
                  A tighter view of logged symptoms, hydration, medication, and bowel metrics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BMCountWidget count={metrics.todayBMCount} loading={loading} />

              <BristolScaleWidget
                averageScale={metrics.averageBristolScale}
                count={metrics.todayBMCount}
                loading={loading}
              />

              <SymptomSnapshotWidget symptoms={metrics.todaySymptoms} loading={loading} />

              <HydrationWidget
                totalFluidsMl={metrics.todayHydration.total_fluids_ml}
                effectiveHydrationMl={metrics.todayHydration.effective_hydration_ml}
                waterGoalMl={metrics.todayHydration.water_goal_ml}
                targetMl={metrics.todayHydration.target_ml}
                entries={metrics.todayHydration.entries}
                caffeinatedEntries={metrics.todayHydration.caffeinated_entries}
                alcoholEntries={metrics.todayHydration.alcohol_entries}
                loading={loading}
              />

              <div className="md:col-span-2">
                <MedicationWidget medications={metrics.recentMedications} loading={loading} />
              </div>
            </div>
          </section>

          <section className="card-enter">
            <PatternInsightsWidget
              bmCount={metrics.todayBMCount}
              symptomsCount={metrics.todaySymptoms.length}
              stressLevel={metrics.todayStress.average_level}
              hydrationPercentage={hydrationPercentage}
              loading={loading}
            />
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
