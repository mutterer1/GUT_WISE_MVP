import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const nudgeMessages = [
  'Your health data misses you. A quick log takes 30 seconds.',
  'Even a single entry helps build the bigger picture.',
  'The best time to log was yesterday. The second best time is now.',
  'Quick check-in: how is your body doing today?',
  'A midday log can capture patterns you might forget by evening.',
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface EncouragementPromptProps {
  onNavigate: (path: string) => void;
}

export default function EncouragementPrompt({ onNavigate }: EncouragementPromptProps) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkActivity();
  }, [user]);

  const checkActivity = async () => {
    if (!user) return;

    const lastDismissed = localStorage.getItem(`gutwise_encourage_${user.id}`);
    if (lastDismissed) {
      const dismissedAt = new Date(lastDismissed);
      const hoursSince = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 12) return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    let totalToday = 0;
    const tables = ['bm_logs', 'food_logs', 'hydration_logs'];

    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('logged_at', todayISO);

      totalToday += count || 0;
    }

    if (totalToday === 0) {
      const hour = new Date().getHours();
      if (hour >= 10) {
        setMessage(pickRandom(nudgeMessages));
        setVisible(true);
      }
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    if (user) {
      localStorage.setItem(`gutwise_encourage_${user.id}`, new Date().toISOString());
    }
  };

  if (!visible) return null;

  return (
    <div
      className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4"
      style={{ animation: 'encouragementFade 0.3s ease-out both' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 mb-1">Time for a quick check-in?</p>
          <p className="text-xs text-amber-700 leading-relaxed">{message}</p>
          <button
            onClick={() => {
              handleDismiss();
              onNavigate('/bm-log');
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Start logging
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg hover:bg-amber-100 transition-colors flex-shrink-0"
          aria-label="Dismiss encouragement"
        >
          <X className="h-4 w-4 text-amber-400" />
        </button>
      </div>
    </div>
  );
}
