import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import {
  Activity,
  Utensils,
  Droplet,
  Moon,
  Brain,
  Pill,
  AlertCircle,
  Heart,
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

interface QuickAction {
  label: string;
  path: string;
  icon: LucideIcon;
}

const quickActions: QuickAction[] = [
  { label: 'Bowel Movement', path: '/bm-log', icon: Activity },
  { label: 'Food', path: '/food-log', icon: Utensils },
  { label: 'Symptoms', path: '/symptoms-log', icon: AlertCircle },
  { label: 'Sleep', path: '/sleep-log', icon: Moon },
  { label: 'Stress', path: '/stress-log', icon: Brain },
  { label: 'Hydration', path: '/hydration-log', icon: Droplet },
  { label: 'Cycle', path: '/menstrual-cycle-log', icon: Heart },
  { label: 'Medication', path: '/medication-log', icon: Pill },
];

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

      <main className="flex-1 lg:ml-64 p-md sm:p-lg lg:p-lg pt-20 sm:pt-20 lg:pt-lg">
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
            loading={loading}
            userName={userName}
          />

          <PatternInsightsWidget
            bmCount={metrics.todayBMCount}
            symptomsCount={metrics.todaySymptoms.length}
            stressLevel={metrics.todayStress.average_level}
            hydrationPercentage={hydrationPercentage}
            loading={loading}
          />

          <Card variant="elevated">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-h5 font-sora font-semibold text-neutral-text dark:text-dark-text">Quick Log</h2>
                <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                  Add a new health entry
                </p>
              </div>
              <Plus className="h-5 w-5 text-neutral-muted dark:text-dark-muted" />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-8">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-neutral-bg dark:bg-dark-surface border border-neutral-border dark:border-dark-border hover:border-brand-500/50 dark:hover:border-brand-500/30 hover:bg-brand-500/5 dark:hover:bg-brand-500/10 transition-all group"
                  >
                    <Icon className="h-5 w-5 text-brand-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-neutral-muted dark:text-dark-muted group-hover:text-neutral-text dark:group-hover:text-dark-text text-center leading-tight">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3">
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

            <MedicationWidget
              medications={metrics.recentMedications}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
