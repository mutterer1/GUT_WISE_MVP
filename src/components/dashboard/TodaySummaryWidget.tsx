import { useState, useEffect } from 'react';
import { Sun, Moon, Calendar, CheckCircle, Waves, Utensils, Droplet, AlertCircle } from 'lucide-react';
import Card from '../Card';
import DailyProgressCircle from './DailyProgressCircle';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TodaySummaryWidgetProps {
  bmCount: number;
  mealsCount: number;
  snacksCount: number;
  hydrationMl: number;
  sleepHours: number | null;
  symptomsCount: number;
  loading: boolean;
  userName?: string;
}

interface Domain {
  label: string;
  logged: boolean;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
}

export default function TodaySummaryWidget({
  bmCount,
  mealsCount,
  snacksCount,
  hydrationMl,
  sleepHours,
  symptomsCount,
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

  const domains: Domain[] = [
    { label: 'BM', logged: bmCount > 0, icon: Waves, dotColor: '#F59E0B' },
    { label: 'Food', logged: totalFood > 0, icon: Utensils, dotColor: '#F87171' },
    { label: 'Hydration', logged: hydrationMl > 0, icon: Droplet, dotColor: '#38BDF8' },
    { label: 'Sleep', logged: sleepHours !== null, icon: Moon, dotColor: '#818CF8' },
    { label: 'Symptoms', logged: symptomsCount > 0, icon: AlertCircle, dotColor: '#C28F94' },
  ];

  const loggedCount = domains.filter((d) => d.logged).length;
  const totalDomains = domains.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sun };
    if (hour < 18) return { text: 'Good afternoon', icon: Sun };
    return { text: 'Good evening', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const getStatusHeadline = () => {
    if (loggedCount === 0) return 'Your health picture starts here';
    if (loggedCount === totalDomains) return "Today's picture is complete";
    if (loggedCount >= 3) return 'Good progress today';
    return "Building today's picture";
  };

  const getSnapshotSupportLine = () => {
    if (loggedCount === 0) return 'Log your first entry to bring today into focus';
    if (loggedCount === totalDomains) return `All ${totalDomains} core signals captured`;
    if (loggedCount === 1) return 'Each signal sharpens today\'s picture';
    const remaining = totalDomains - loggedCount;
    if (remaining === 1) return 'One more signal completes the picture';
    return `${remaining} signals left to complete today`;
  };

  if (loading) {
    return (
      <Card variant="elevated">
        <div className="animate-pulse space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-neutral-border dark:bg-dark-border rounded-lg flex-shrink-0" />
              <div className="h-4 bg-neutral-border dark:bg-dark-border rounded w-36" />
            </div>
            <div className="h-8 w-24 bg-neutral-border dark:bg-dark-border rounded-xl flex-shrink-0" />
          </div>
          <div className="flex items-start gap-6">
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-neutral-border dark:bg-dark-border rounded w-64" />
              <div className="h-4 bg-neutral-border dark:bg-dark-border rounded w-56" />
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-7 w-20 bg-neutral-border dark:bg-dark-border rounded-full" />
                ))}
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="h-3 w-24 bg-neutral-border dark:bg-dark-border rounded" />
              <div className="w-[120px] h-[120px] bg-neutral-border dark:bg-dark-border rounded-full" />
              <div className="h-3 w-32 bg-neutral-border dark:bg-dark-border rounded" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent dark:from-brand-500/08 dark:to-transparent pointer-events-none" />
      <div className="glass-sheen-overlay" aria-hidden="true" />

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GreetingIcon className="h-4 w-4 text-neutral-muted dark:text-dark-muted flex-shrink-0" />
            <span className="text-body-lg text-neutral-muted dark:text-dark-muted">
              {greeting.text}{userName ? `, ${userName}` : ''}
            </span>
          </div>

          <div className="flex-shrink-0">
            {streakLoading ? (
              <div className="animate-pulse h-8 w-20 bg-neutral-border dark:bg-dark-border rounded-xl" />
            ) : streakDays > 0 || loggedToday ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/20 dark:border-brand-500/25">
                {loggedToday && <CheckCircle className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />}
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-300 font-sora">
                  {streakDays}d streak
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-bg dark:bg-dark-surface border border-neutral-border dark:border-dark-border">
                <Calendar className="h-3.5 w-3.5 text-neutral-muted dark:text-dark-muted" />
                <span className="text-xs text-neutral-muted dark:text-dark-muted">Start streak</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-6">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="space-y-1">
              <h2 className="text-h3 font-sora font-semibold text-neutral-text dark:text-dark-text leading-snug">
                {getStatusHeadline()}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {domains.map((domain) => {
                const Icon = domain.icon;
                return (
                  <div
                    key={domain.label}
                    className={[
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                      domain.logged
                        ? 'bg-brand-500/12 dark:bg-brand-500/18 border border-brand-500/25 dark:border-brand-500/30 text-brand-700 dark:text-brand-300'
                        : 'bg-neutral-bg dark:bg-dark-bg border border-neutral-border dark:border-dark-border text-neutral-muted dark:text-dark-muted',
                    ].join(' ')}
                  >
                    <Icon
                      className={[
                        'h-3 w-3 flex-shrink-0',
                        domain.logged ? 'text-brand-500' : 'text-neutral-muted dark:text-dark-muted',
                      ].join(' ')}
                    />
                    {domain.label}
                    {domain.logged && (
                      <CheckCircle className="h-3 w-3 text-brand-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center gap-3 pt-1">
            <span className="text-xs font-medium tracking-wide uppercase text-neutral-muted dark:text-dark-muted select-none">
              Today's Snapshot
            </span>

            <DailyProgressCircle
              bmLogged={bmCount > 0}
              foodLogged={totalFood > 0}
              hydrationLogged={hydrationMl > 0}
              sleepLogged={sleepHours !== null}
              symptomsLogged={symptomsCount > 0}
              size={120}
              stroke={8}
            />

            <p className="text-xs text-neutral-muted dark:text-dark-muted text-center leading-snug max-w-[130px]">
              {getSnapshotSupportLine()}
            </p>

            <div className="flex items-center gap-2">
              {domains.map((domain) => (
                <div
                  key={domain.label}
                  className="flex flex-col items-center gap-1"
                  title={domain.label}
                >
                  <div
                    className="w-2 h-2 rounded-full transition-opacity duration-500"
                    style={{
                      backgroundColor: domain.dotColor,
                      opacity: domain.logged ? 1 : 0.2,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
