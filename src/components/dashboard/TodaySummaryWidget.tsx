import { useState, useEffect } from 'react';
import { Sun, Moon, Utensils, Activity, Flame, Calendar, CheckCircle } from 'lucide-react';
import Card from '../Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getStreakCelebration } from '../../utils/copySystem';

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
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 18) return { text: 'Good Afternoon', icon: Sun };
    return { text: 'Good Evening', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const celebration = getStreakCelebration(streakDays);

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GreetingIcon className="h-6 w-6 text-teal-600" />
            {greeting.text}{userName ? `, ${userName}` : ''}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {!streakLoading && (celebration || 'Here\'s your health snapshot for today')}
            {streakLoading && 'Here\'s your health snapshot for today'}
          </p>
        </div>

        <div className="flex-shrink-0 ml-4">
          {streakLoading ? (
            <div className="animate-pulse flex items-center gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded-xl" />
            </div>
          ) : streakDays > 0 || loggedToday ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-100 border border-brand-300">
              <div className={`flex items-center justify-center h-7 w-7 rounded-lg ${
                streakDays >= 7 ? 'bg-orange-100' : 'bg-brand-200'
              }`}>
                <Flame
                  className={`h-4 w-4 ${streakDays >= 7 ? 'text-orange-500' : 'text-brand-700'}`}
                  style={streakDays >= 7 ? { animation: 'flamePulse 2s ease-in-out infinite' } : undefined}
                />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-brand-900 leading-none">
                  {streakDays} day{streakDays !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-brand-700 leading-none mt-0.5">streak</p>
              </div>
              {loggedToday && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium ml-1">
                  <CheckCircle className="h-3 w-3" />
                  Today
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="text-body-sm text-neutral-muted">No streak yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <Activity className="h-6 w-6 mx-auto mb-2 text-teal-600" />
          <p className="text-2xl font-bold text-gray-900">{bmCount}</p>
          <p className="text-xs text-gray-600 mt-1">BM Today</p>
        </div>

        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <Utensils className="h-6 w-6 mx-auto mb-2 text-orange-600" />
          <p className="text-2xl font-bold text-gray-900">{totalFood}</p>
          <p className="text-xs text-gray-600 mt-1">
            {mealsCount} meals, {snacksCount} snacks
          </p>
        </div>

        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <svg className="h-6 w-6 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-2xl font-bold text-gray-900">{hydrationLiters}L</p>
          <p className="text-xs text-gray-600 mt-1">Water Intake</p>
        </div>

        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <Moon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
          <p className="text-2xl font-bold text-gray-900">
            {sleepHours !== null ? `${sleepHours}h` : '--'}
          </p>
          <p className="text-xs text-gray-600 mt-1">Last Sleep</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-teal-100 rounded-lg">
        <p className="text-sm text-teal-900 text-center">
          {bmCount > 0
            ? "Great job tracking your health today!"
            : "Start logging your health activities to see insights here"}
        </p>
      </div>
    </Card>
  );
}
