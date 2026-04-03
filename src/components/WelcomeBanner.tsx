import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Activity, Utensils, Droplet, Moon, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
  const [visible, setVisible] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    { key: 'bm', label: 'Log a bowel movement', icon: Activity, path: '/bm-log', table: 'bm_logs', done: false },
    { key: 'food', label: 'Record a meal', icon: Utensils, path: '/food-log', table: 'food_logs', done: false },
    { key: 'hydration', label: 'Track hydration', icon: Droplet, path: '/hydration-log', table: 'hydration_logs', done: false },
    { key: 'sleep', label: 'Log your sleep', icon: Moon, path: '/sleep-log', table: 'sleep_logs', done: false },
  ]);

  useEffect(() => {
    checkOnboardingStatus();
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
    setVisible(true);
  };

  const handleDismiss = () => {
    setVisible(false);
    if (user) {
      localStorage.setItem(`gutwise_welcome_${user.id}`, 'done');
    }
  };

  if (!visible) return null;

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div
      className="mb-6 bg-white rounded-xl border border-teal-200 shadow-sm overflow-hidden"
      style={{ animation: 'welcomeSlideDown 0.4s ease-out both' }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {userName ? `Welcome, ${userName}` : 'Welcome to GutWise'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Complete these steps to get the most out of your health tracking.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Dismiss welcome banner"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
          <div
            className="h-1.5 bg-teal-500 rounded-full transition-all duration-500"
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
                className={`p-3 rounded-lg border text-left transition-all ${
                  step.done
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:border-teal-300 hover:bg-teal-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {step.done ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Icon className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className={`text-xs font-medium leading-tight ${step.done ? 'text-green-700' : 'text-gray-700'}`}>
                  {step.done ? 'Done' : step.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
