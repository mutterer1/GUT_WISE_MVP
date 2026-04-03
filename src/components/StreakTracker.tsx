import { useState, useEffect } from 'react';
import { Flame, Calendar, CheckCircle } from 'lucide-react';
import Card from './Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getStreakCelebration } from '../utils/copySystem';

export default function StreakTracker() {
  const { user } = useAuth();
  const [streakDays, setStreakDays] = useState(0);
  const [loggedToday, setLoggedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      calculateStreak();
    }
  }, [user]);

  const calculateStreak = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let streak = 0;
      const checkDate = new Date(today);
      let hasLoggedToday = false;

      for (let i = 0; i < 400; i++) {
        const dayStart = new Date(checkDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(checkDate);
        dayEnd.setHours(23, 59, 59, 999);

        let dayHasLogs = false;
        const tables = ['bm_logs', 'food_logs', 'hydration_logs', 'symptom_logs', 'sleep_logs', 'stress_logs'];

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
          if (dayHasLogs) {
            streak++;
          }
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
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-40" />
          </div>
        </div>
      </Card>
    );
  }

  if (streakDays === 0 && !loggedToday) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">No streak yet</p>
            <p className="text-xs text-gray-500">Log something today to start building your streak.</p>
          </div>
        </div>
      </Card>
    );
  }

  const celebration = getStreakCelebration(streakDays);

  return (
    <Card className="border-teal-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            streakDays >= 7 ? 'bg-orange-100' : 'bg-teal-100'
          }`}>
            <Flame
              className={`h-5 w-5 ${streakDays >= 7 ? 'text-orange-500' : 'text-teal-600'}`}
              style={streakDays >= 7 ? { animation: 'flamePulse 2s ease-in-out infinite' } : undefined}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                {streakDays} day{streakDays !== 1 ? 's' : ''} streak
              </p>
              {loggedToday && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle className="h-3 w-3" />
                  Logged today
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {celebration || 'Keep logging daily to grow your streak.'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
