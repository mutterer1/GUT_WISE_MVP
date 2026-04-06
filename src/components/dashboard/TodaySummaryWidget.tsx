import { useState, useEffect } from 'react';
import { Sun, Moon, Droplet, Activity, Calendar, CheckCircle } from 'lucide-react';
import Card from '../Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TodaySummaryWidgetProps {
  bmCount: number;
  mealsCount: number;
  snacksCount: number;
  hydrationMl: number;
  sleepHours: number | null;
  loading: boolean;
  userName?: string;
}

export default function TodaySummaryWidget({
  bmCount,
  mealsCount,
  snacksCount,
  hydrationMl,
  sleepHours,
  loading,
  userName,
}: TodaySummaryWidgetProps) {
  const { user } = useAuth();
  const [streakDays, setStreakDays] = useState(0);
  const [loggedToday, setLoggedToday] = useState(false);
  const [streakLoading, setStreakLoading] = useState(true);

  useEffect(() => {
    if (user) {
      calculateStreak();
    }
  }, [user]);

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

  const totalFood = mealsCount + snacksCount;
  const hydrationLiters = (hydrationMl / 1000).toFixed(1);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sun };
    if (hour < 18) return { text: 'Good afternoon', icon: Sun };
    return { text: 'Good evening', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const getTodayNarrative = () => {
    const parts: string[] = [];

    if (bmCount > 0) {
      parts.push(`${bmCount} bowel movement${bmCount !== 1 ? 's' : ''}`);
    }
    if (totalFood > 0) {
      parts.push(`${totalFood} meal${totalFood !== 1 ? 's' : ''}`);
    }
    if (hydrationMl > 0) {
      parts.push(`${hydrationLiters}L water`);
    }
    if (sleepHours !== null) {
      parts.push(`${sleepHours}h sleep`);
    }

    if (parts.length === 0) {
      return "No logs yet today. Start tracking to see your body's story unfold.";
    }

    if (parts.length === 1) {
      return `You've logged ${parts[0]} today.`;
    }

    const lastPart = parts.pop();
    return `You've logged ${parts.join(', ')} and ${lastPart} today.`;
  };

  if (loading) {
    return (
      <Card variant="elevated">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-border dark:bg-dark-border rounded w-1/2"></div>
          <div className="h-4 bg-neutral-border dark:bg-dark-border rounded w-3/4"></div>
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent dark:from-brand-500/10 dark:to-transparent" />

      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-brand-500/10 dark:bg-brand-500/20">
                <GreetingIcon className="h-5 w-5 text-brand-500" />
              </div>
              <h2 className="text-h3 font-sora font-semibold text-neutral-text dark:text-dark-text">
                {greeting.text}{userName ? `, ${userName}` : ''}
              </h2>
            </div>
            <p className="text-body-md text-neutral-muted dark:text-dark-muted max-w-xl">
              {getTodayNarrative()}
            </p>
          </div>

          <div className="flex-shrink-0 ml-4">
            {streakLoading ? (
              <div className="animate-pulse">
                <div className="h-10 w-24 bg-neutral-border dark:bg-dark-border rounded-xl" />
              </div>
            ) : streakDays > 0 || loggedToday ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 dark:border-brand-500/30">
                <div className="text-right">
                  <p className="text-h4 font-sora font-semibold text-brand-500 leading-none">
                    {streakDays}
                  </p>
                  <p className="text-xs text-brand-700 dark:text-brand-300 mt-0.5">
                    day streak
                  </p>
                </div>
                {loggedToday && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-brand-500/20 dark:bg-brand-500/30 rounded-lg">
                    <CheckCircle className="h-3 w-3 text-brand-500" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-surface dark:bg-dark-surface border border-dark-border dark:border-dark-border">
                <Calendar className="h-4 w-4 text-neutral-muted dark:text-dark-muted" />
                <p className="text-body-sm text-neutral-muted dark:text-dark-muted">Start logging</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-neutral-surface dark:bg-dark-surface border border-neutral-border dark:border-dark-border">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-signal-500" />
              <span className="text-label text-neutral-muted dark:text-dark-muted">BM</span>
            </div>
            <p className="text-h3 font-sora font-semibold text-neutral-text dark:text-dark-text">
              {bmCount}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-surface dark:bg-dark-surface border border-neutral-border dark:border-dark-border">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-label text-neutral-muted dark:text-dark-muted">Meals</span>
            </div>
            <p className="text-h3 font-sora font-semibold text-neutral-text dark:text-dark-text">
              {totalFood}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-surface dark:bg-dark-surface border border-neutral-border dark:border-dark-border">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="h-4 w-4 text-brand-300" />
              <span className="text-label text-neutral-muted dark:text-dark-muted">Water</span>
            </div>
            <p className="text-h3 font-sora font-semibold text-neutral-text dark:text-dark-text">
              {hydrationLiters}<span className="text-body-md font-normal text-neutral-muted dark:text-dark-muted">L</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-surface dark:bg-dark-surface border border-neutral-border dark:border-dark-border">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-4 w-4 text-brand-700 dark:text-brand-300" />
              <span className="text-label text-neutral-muted dark:text-dark-muted">Sleep</span>
            </div>
            <p className="text-h3 font-sora font-semibold text-neutral-text dark:text-dark-text">
              {sleepHours !== null ? (
                <>{sleepHours}<span className="text-body-md font-normal text-neutral-muted dark:text-dark-muted">h</span></>
              ) : (
                <span className="text-neutral-muted dark:text-dark-muted">--</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
