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
import WelcomeBanner from '../components/WelcomeBanner';
import StreakTracker from '../components/StreakTracker';

interface QuickAction {
  label: string;
  path: string;
  icon: LucideIcon;
  bgClass: string;
  hoverBgClass: string;
  iconClass: string;
  textClass: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Bowel Movement',
    path: '/bm-log',
    icon: Activity,
    bgClass: 'bg-teal-50',
    hoverBgClass: 'hover:bg-teal-100',
    iconClass: 'text-teal-600',
    textClass: 'text-teal-900',
  },
  {
    label: 'Food Intake',
    path: '/food-log',
    icon: Utensils,
    bgClass: 'bg-orange-50',
    hoverBgClass: 'hover:bg-orange-100',
    iconClass: 'text-orange-600',
    textClass: 'text-orange-900',
  },
  {
    label: 'Symptoms',
    path: '/symptoms-log',
    icon: AlertCircle,
    bgClass: 'bg-red-50',
    hoverBgClass: 'hover:bg-red-100',
    iconClass: 'text-red-600',
    textClass: 'text-red-900',
  },
  {
    label: 'Sleep',
    path: '/sleep-log',
    icon: Moon,
    bgClass: 'bg-blue-50',
    hoverBgClass: 'hover:bg-blue-100',
    iconClass: 'text-blue-600',
    textClass: 'text-blue-900',
  },
  {
    label: 'Stress',
    path: '/stress-log',
    icon: Brain,
    bgClass: 'bg-yellow-50',
    hoverBgClass: 'hover:bg-yellow-100',
    iconClass: 'text-yellow-600',
    textClass: 'text-yellow-900',
  },
  {
    label: 'Hydration',
    path: '/hydration-log',
    icon: Droplet,
    bgClass: 'bg-cyan-50',
    hoverBgClass: 'hover:bg-cyan-100',
    iconClass: 'text-cyan-600',
    textClass: 'text-cyan-900',
  },
  {
    label: 'Menstrual Cycle',
    path: '/menstrual-cycle-log',
    icon: Heart,
    bgClass: 'bg-rose-50',
    hoverBgClass: 'hover:bg-rose-100',
    iconClass: 'text-rose-600',
    textClass: 'text-rose-900',
  },
  {
    label: 'Medication',
    path: '/medication-log',
    icon: Pill,
    bgClass: 'bg-emerald-50',
    hoverBgClass: 'hover:bg-emerald-100',
    iconClass: 'text-emerald-600',
    textClass: 'text-emerald-900',
  },
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <WelcomeBanner userName={userName} />
            <StreakTracker />
          </div>

          <div className="mb-6">
            <TodaySummaryWidget
              bmCount={metrics.todayBMCount}
              mealsCount={metrics.todayFood.meals}
              snacksCount={metrics.todayFood.snacks}
              hydrationMl={metrics.todayHydration.total_ml}
              sleepHours={sleepHours}
              loading={loading}
              userName={userName}
            />
          </div>

          <div className="mb-8">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Quick Log Actions</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Quickly add a new health entry.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.path}
                      onClick={() => navigate(action.path)}
                      className={`rounded-lg px-3 py-3 text-left transition-all hover:shadow-sm group ${action.bgClass} ${action.hoverBgClass}`}
                    >
                      <Icon
                        className={`mb-1 h-5 w-5 transition-transform group-hover:scale-110 ${action.iconClass}`}
                      />
                      <p className={`text-sm font-medium ${action.textClass}`}>
                        {action.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="mb-8">
            <PatternInsightsWidget
              bmCount={metrics.todayBMCount}
              symptomsCount={metrics.todaySymptoms.length}
              stressLevel={metrics.todayStress.average_level}
              hydrationPercentage={hydrationPercentage}
              loading={loading}
            />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

          <Card>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              About Your Health Dashboard
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                Your dashboard provides a real-time overview of your health metrics.
                Data updates as you log your daily activities.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-teal-50 p-3">
                  <p className="mb-1 font-medium text-teal-900">Track Consistently</p>
                  <p className="text-xs text-teal-700">
                    Log daily to unlock stronger patterns and more useful insights.
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="mb-1 font-medium text-blue-900">Data Privacy</p>
                  <p className="text-xs text-blue-700">
                    Your health data is private and only accessible to you.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
