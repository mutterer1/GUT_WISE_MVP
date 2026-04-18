import { useState, useCallback } from 'react';
import type { DailyCheckInDraft } from '../types/dailyCheckIn';
import { getLocalDateTimeString, getLocalDateTimeStringWithOffset } from '../utils/dateFormatters';

function buildDefaultDraft(): DailyCheckInDraft {
  const now = getLocalDateTimeString();
  const sleepStart = getLocalDateTimeStringWithOffset(-8);

  return {
    bowelMovement: {
      enabled: true,
      bristol_type: null,
      blood_present: false,
      pain_level: null,
      notes: '',
      logged_at: now,
    },
    symptoms: {
      enabled: true,
      symptom_type: 'Abdominal Pain',
      severity: 3,
      notes: '',
      logged_at: now,
    },
    food: {
      enabled: true,
      meal_type: 'meal',
      food_items: '',
      notes: '',
      logged_at: now,
    },
    hydration: {
      enabled: true,
      amount_ml: 250,
      drink_type: 'water',
      logged_at: now,
    },
    sleep: {
      enabled: false,
      duration_minutes: null,
      quality: null,
      notes: '',
      logged_at: sleepStart,
    },
    stress: {
      enabled: false,
      stress_level: 3,
      notes: '',
      logged_at: now,
    },
    exercise: {
      enabled: false,
      exercise_type: 'walking',
      duration_minutes: null,
      intensity: 'light',
      notes: '',
      logged_at: now,
    },
    medication: {
      enabled: false,
      medication_name: '',
      dosage: '',
      notes: '',
      logged_at: now,
    },
    menstrualCycle: {
      enabled: false,
      cycle_phase: 'menstrual',
      flow_intensity: 'medium',
      notes: '',
      logged_at: now,
    },
  };
}

export function useDailyCheckInDraft(userId?: string) {
  const storageKey = userId ? `gutwise_daily_checkin_${userId}` : null;

  const [draft, setDraft] = useState<DailyCheckInDraft>(() => {
    if (storageKey) {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) return JSON.parse(saved) as DailyCheckInDraft;
      } catch {
      }
    }
    return buildDefaultDraft();
  });

  const updateDraft = useCallback((updates: Partial<DailyCheckInDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...updates };
      if (storageKey) {
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
        }
      }
      return next;
    });
  }, [storageKey]);

  const resetDraft = useCallback(() => {
    const fresh = buildDefaultDraft();
    setDraft(fresh);
    if (storageKey) {
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
      }
    }
  }, [storageKey]);

  return { draft, updateDraft, resetDraft };
}
