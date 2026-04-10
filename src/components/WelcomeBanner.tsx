import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Activity, Utensils, Droplet, Moon, CheckCircle, Flame, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getStreakCelebration } from '../utils/copySystem';

interface WelcomeBannerProps {
  userName: string;
}

interface OnboardingStep {
  key: string;
  label: string;
  icon: typeof Activity;
  path: string;
  table: string;
  done: boolean;
}

export default function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    { key: 'bm', label: 'Log a bowel movement', icon: Activity, path: '/bm-log', table: 'bm_logs', done: false },
    { key: 'food', label: 'Log a meal', icon: Utensils, path: '/food-log', table: 'food_logs', done: false },
    { key: 'hydration', label: 'Track hydration', icon: Droplet, path: '/hydration-log', table: 'hydration_logs', done: false },
    { key: 'sleep', label: 'Log your sleep', icon: Moon, path: '/sleep-log', table: 'sleep_logs', done: false },
  ]);

  const [streakDays, setStreakDays] = useState(0);
  const [loggedToday, setLoggedToday] = useState(false);
  const [streakLoading, setStreakLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
      calculateStreak();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    const dismissed = localStorage.getItem(`gutwise_welcome_${user.id}`);
    if (dismissed === 'done') return;

    const updated = [...steps];
    let allDone = true;

    for (const step of updated) {
      const { count } = await supabase
        .from(step.table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      step.done = (count || 0) > 0;
      if (!step.done) allDone = false;
    }

    if (allDone) {
      localStorage.setItem(`gutwise_welcome_${user.id}`, 'done');
      return;
    }

    setSteps(updated);
    setShowOnboarding(true);
  };

  const calculateStreak = async () => {
    if (!user) return;

    try {
      setStreakLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let streak = 0;
      const checkDate = new Date(today);
      let hasLoggedToday = false;

      const tables = ['bm_logs', 'food_logs', 'hydration_logs', 'symptom_logs', 'sleep_logs', 'stress_logs'];

      for (let i = 0; i < 400; i++) {
        const dayStart = new Date(checkDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(checkDate);
        dayEnd.setHours(23, 59, 59, 999);

        let dayHasLogs = false;

        for (const table of tables) {
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('logged_at', dayStart.toISOString())
            .lte('logged_at', dayEnd.toISOString());

          if ((count || 0) > 0) {
            dayHasLogs = true;
            break;
          }
        }

        if (i === 0) {
          hasLoggedToday = dayHasLogs;
          if (dayHasLogs) streak++;
        } else if (dayHasLogs) {
          streak++;
        } else {
          break;
        }

        checkDate.setDate(checkDate.getDate() - 1);
      }

      setStreakDays(streak);
      setLoggedToday(hasLoggedToday);
    } catch {
      setStreakDays(0);
    } finally {
      setStreakLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowOnboarding(false);
    if (user) {
      localStorage.setItem(`gutwise_welcome_${user.id}`, 'done');
    }
  };

  const celebration = getStreakCelebration(streakDays);
  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div
      className="mb-lg bg-white dark:bg-dark-surface rounded-2xl border border-neutral-border dark:border-dark-border shadow-sm dark:shadow-none overflow-hidden"
      style={{ animation: 'welcomeSlideDown 0.4s ease-out both' }}
    >
      <div className="p-lg">
        <div className="flex items-start justify-between gap-md">
          <div className="flex-1 min-w-0">
            <h3 className="text-h4 font-sora font-semibold text-neutral-text dark:text-dark-text">
              {userName ? `Welcome back, ${userName}` : 'Welcome to GutWise'}
            </h3>
            {showOnboarding && (
              <p className="text-body-sm text-neutral-muted dark:text-dark-muted mt-1">
                A few first logs will help GutWise start finding your patterns.
              </p>
            )}
          </div>

          <div className="flex items-center gap-sm flex-shrink-0">
            {streakLoading ? (
              <div className="animate-pulse flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-200 dark:bg-dark-border rounded-lg" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-dark-border rounded" />
              </div>
            ) : streakDays > 0 || loggedToday ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-100 dark:bg-brand-500/12 border border-brand-300 dark:border-brand-500/25">
                <div className={`flex items-center justify-center h-7 w-7 rounded-lg ${
                  streakDays >= 7 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-brand-200 dark:bg-brand-500/20'
                }`}>
                  <Flame
                    className={`h-4 w-4 ${streakDays >= 7 ? 'text-orange-500' : 'text-brand-700 dark:text-brand-300'}`}
                    style={streakDays >= 7 ? { animation: 'flamePulse 2s ease-in-out infinite' } : undefined}
                  />
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-brand-900 dark:text-brand-100 leading-none">
                    {streakDays} day{streakDays !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-brand-700 dark:text-brand-300 leading-none mt-0.5">streak</p>
                </div>
                {loggedToday && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium ml-1">
                    <CheckCircle className="h-3 w-3" />
                    Today
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-elevated border border-gray-200 dark:border-dark-border">
                <Calendar className="h-4 w-4 text-gray-400 dark:text-dark-muted" />
                <p className="text-body-sm text-neutral-muted dark:text-dark-muted">Start your streak today</p>
              </div>
            )}

            {showOnboarding && (
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-elevated transition-colors"
                aria-label="Dismiss welcome banner"
              >
                <X className="h-4 w-4 text-gray-400 dark:text-dark-muted" />
              </button>
            )}
          </div>
        </div>

        {!streakLoading && !showOnboarding && (
          <p className="mt-2 text-body-sm text-neutral-muted dark:text-dark-muted">
            {celebration || 'Log something each day to keep your streak going.'}
          </p>
        )}

        {showOnboarding && (
          <>
            <div className="w-full bg-gray-100 dark:bg-dark-border rounded-full h-1.5 mt-md mb-md">
              <div
                className="h-1.5 bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.key}
                    onClick={() => !step.done && navigate(step.path)}
                    disabled={step.done}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      step.done
                        ? 'bg-green-50 dark:bg-green-900/15 border-green-200 dark:border-green-800/30'
                        : 'bg-gray-50 dark:bg-dark-elevated border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-500/40 hover:bg-brand-100 dark:hover:bg-brand-500/08 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {step.done ? (
                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                      ) : (
                        <Icon className="h-4 w-4 text-gray-400 dark:text-dark-muted" />
                      )}
                    </div>
                    <p className={`text-xs font-medium leading-tight ${step.done ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-dark-text'}`}>
                      {step.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
