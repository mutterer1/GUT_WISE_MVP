import { useEffect, useMemo, useState } from 'react';
import { getLocalDateTimeString, getLocalDateTimeStringWithOffset } from '../utils/dateFormatters';
import type { DailyCheckInDraft } from '../types/dailyCheckIn';

function buildDefaultDraft(): DailyCheckInDraft {
  return {
    logged_at: getLocalDateTimeString(),
    bowelMovement: {
      enabled: true,
      bristol_type: 4,
      urgency: 1,
      pain_level: 1,
      blood_present: false,
      mucus_present: false,
      notes: '',
    },
    symptoms: {
      enabled: true,
      symptom_type: '',
      severity: 5,
      duration_minutes: 30,
      notes: '',
    },
    food: {
      enabled: true,
      meal_type: 'lunch',
      foods: '',
      tags: '',
      notes: '',
    },
    hydration: {
      enabled: true,
      amount_ml: 250,
      beverage_type: 'Water',
      caffeine_content: false,
    },
    sleep: {
      enabled: false,
      sleep_start: getLocalDateTimeStringWithOffset(-8),
      sleep_end: getLocalDateTimeString(),
      quality: 6,
      felt_rested: false,
    },
    stress: {
      enabled: false,
      stress_level: 5,
      notes: '',
    },
    exercise: {
      enabled: false,
      exercise_type: '',
      duration_minutes: 30,
      intensity_level: 3,
    },
    medication: {
      enabled: false,
      medication_name: '',
      dosage: '',
      medication_type: 'prescription',
    },
    menstrualCycle: {
      enabled: false,
      cycle_start_date: new Date().toISOString().split('T')[0],
      cycle_day: 1,
      flow_intensity: 'none',
      pain_level: 1,
    },
  };
}

export function useDailyCheckInDraft(userId?: string) {
  const storageKey = useMemo(
    () => (userId ? `gutwise_daily_checkin_${userId}` : ''),
    [userId]
  );

  const [draft, setDraft] = useState<DailyCheckInDraft>(buildDefaultDraft);

  useEffect(() => {
    if (!storageKey) {
      setDraft(buildDefaultDraft());
      return;
    }

    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) {
        setDraft(buildDefaultDraft());
        return;
      }

      const base = buildDefaultDraft();
      const parsed = JSON.parse(raw) as Partial<DailyCheckInDraft>;
      setDraft({
        ...base,
        ...parsed,
        bowelMovement: { ...base.bowelMovement, ...parsed.bowelMovement },
        symptoms: { ...base.symptoms, ...parsed.symptoms },
        food: { ...base.food, ...parsed.food },
        hydration: { ...base.hydration, ...parsed.hydration },
        sleep: { ...base.sleep, ...parsed.sleep },
        stress: { ...base.stress, ...parsed.stress },
        exercise: { ...base.exercise, ...parsed.exercise },
        medication: { ...base.medication, ...parsed.medication },
        menstrualCycle: { ...base.menstrualCycle, ...parsed.menstrualCycle },
      });
    } catch {
      setDraft(buildDefaultDraft());
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    sessionStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, storageKey]);

  const updateDraft = <K extends keyof DailyCheckInDraft>(
    key: K,
    value: DailyCheckInDraft[K]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const resetDraft = () => {
    const next = buildDefaultDraft();
    setDraft(next);
    if (storageKey) {
      sessionStorage.setItem(storageKey, JSON.stringify(next));
    }
  };

  return {
    draft,
    updateDraft,
    resetDraft,
  };
}
