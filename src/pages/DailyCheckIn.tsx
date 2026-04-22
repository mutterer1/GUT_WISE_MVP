import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Droplet,
  Heart,
  Moon,
  Pill,
  Save,
  Sparkles,
  Zap,
  Waves,
  AlertCircle,
  Utensils,
  Dumbbell,
  Frown,
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import TrustExplainer from '../components/TrustExplainer';
import { useAuth } from '../contexts/AuthContext';
import { useDailyCheckInDraft } from '../hooks/useDailyCheckInDraft';
import { supabase } from '../lib/supabase';
import type { DailyCheckInDraft } from '../types/dailyCheckIn';
import { BEVERAGE_TYPES } from '../constants/domain';
import { hydrateLogWithDerivedFields } from '../utils/hydrationClassification';

type SectionKey =
  | 'bowelMovement'
  | 'symptoms'
  | 'food'
  | 'hydration'
  | 'sleep'
  | 'stress'
  | 'exercise'
  | 'medication'
  | 'menstrualCycle';

const sectionMeta: Array<{
  key: SectionKey;
  label: string;
  icon: typeof Waves;
  description: string;
}> = [
  { key: 'bowelMovement', label: 'Stool', icon: Waves, description: 'Bristol type, urgency, and anything notable.' },
  { key: 'symptoms', label: 'Symptoms', icon: AlertCircle, description: 'What you felt and how strong it was.' },
  { key: 'food', label: 'Food', icon: Utensils, description: 'What you ate and any tags worth remembering.' },
  { key: 'hydration', label: 'Hydration', icon: Droplet, description: 'A quick drink log helps tie the day together.' },
  { key: 'sleep', label: 'Sleep', icon: Moon, description: 'Optional, but helpful for stronger pattern matching.' },
  { key: 'stress', label: 'Stress', icon: Frown, description: 'A simple stress score is often enough.' },
  { key: 'exercise', label: 'Exercise', icon: Dumbbell, description: 'Movement can add useful context.' },
  { key: 'medication', label: 'Medication', icon: Pill, description: 'Keep timing and dose in one place.' },
  { key: 'menstrualCycle', label: 'Cycle', icon: Heart, description: 'Optional context when it is relevant for you.' },
];

function splitTags(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildHydrationDraft(
  hydration: DailyCheckInDraft['hydration'],
  patch: Partial<DailyCheckInDraft['hydration']> = {}
): DailyCheckInDraft['hydration'] {
  const next = { ...hydration, ...patch };
  const normalized = hydrateLogWithDerivedFields(next);

  return {
    ...next,
    beverage_category: normalized.beverage_category,
    caffeine_mg: normalized.caffeine_mg,
    effective_hydration_ml: normalized.effective_hydration_ml,
    water_goal_contribution_ml: normalized.water_goal_contribution_ml,
    electrolyte_present: normalized.electrolyte_present,
    alcohol_present: normalized.alcohol_present,
  };
}

export default function DailyCheckIn() {
  const { user } = useAuth();
  const { draft, updateDraft, resetDraft } = useDailyCheckInDraft(user?.id);
  const [savingAll, setSavingAll] = useState(false);
  const [savingSection, setSavingSection] = useState<SectionKey | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enabledSections = useMemo(
    () => sectionMeta.filter((section) => draft[section.key].enabled),
    [draft]
  );

  const hydrationDefinition =
    BEVERAGE_TYPES.find((item) => item.value === draft.hydration.beverage_type) ?? BEVERAGE_TYPES[0];

  const completedCount = useMemo(() => {
    return sectionMeta.filter((section) => {
      if (!draft[section.key].enabled) return false;
      switch (section.key) {
        case 'bowelMovement':
          return draft.bowelMovement.bristol_type > 0;
        case 'symptoms':
          return draft.symptoms.symptom_type.trim().length > 0;
        case 'food':
          return draft.food.foods.trim().length > 0;
        case 'hydration':
          return draft.hydration.amount_ml > 0;
        case 'sleep':
          return draft.sleep.sleep_start.length > 0 && draft.sleep.sleep_end.length > 0;
        case 'stress':
          return draft.stress.stress_level > 0;
        case 'exercise':
          return draft.exercise.exercise_type.trim().length > 0;
        case 'medication':
          return (
            draft.medication.medication_name.trim().length > 0 &&
            draft.medication.dosage.trim().length > 0
          );
        case 'menstrualCycle':
          return draft.menstrualCycle.cycle_start_date.length > 0;
        default:
          return false;
      }
    }).length;
  }, [draft]);

  const saveSections = async (keys: SectionKey[]) => {
    if (!user?.id) return;

    type WriteResult = { error: { message?: string } | null };
    const writes: PromiseLike<WriteResult>[] = [];

    for (const key of keys) {
      switch (key) {
        case 'bowelMovement':
          if (!draft.bowelMovement.enabled) break;
          writes.push(
            supabase
              .from('bm_logs')
              .insert({
                user_id: user.id,
                logged_at: draft.logged_at,
                bristol_type: draft.bowelMovement.bristol_type,
                urgency: draft.bowelMovement.urgency,
                pain_level: draft.bowelMovement.pain_level,
                blood_present: draft.bowelMovement.blood_present,
                mucus_present: draft.bowelMovement.mucus_present,
                notes: draft.bowelMovement.notes || null,
              })
              .then((r) => r)
          );
          break;
        case 'symptoms':
          if (!draft.symptoms.enabled || !draft.symptoms.symptom_type.trim()) break;
          writes.push(
            supabase
              .from('symptom_logs')
              .insert({
                user_id: user.id,
                logged_at: draft.logged_at,
                symptom_type: draft.symptoms.symptom_type.trim(),
                severity: draft.symptoms.severity,
                duration_minutes: draft.symptoms.duration_minutes,
                notes: draft.symptoms.notes || null,
              })
              .then((r) => r)
          );
          break;
        case 'food':
          if (!draft.food.enabled || !draft.food.foods.trim()) break;
          writes.push(
            supabase
              .from('food_logs')
              .insert({
                user_id: user.id,
                logged_at: draft.logged_at,
                meal_type: draft.food.meal_type,
                food_items: splitTags(draft.food.foods).map((name) => ({ name })),
                tags: splitTags(draft.food.tags),
                notes: draft.food.notes || null,
              })
              .then((r) => r)
          );
          break;
        case 'hydration':
          if (!draft.hydration.enabled || draft.hydration.amount_ml <= 0) break;
          {
            const normalizedHydration = hydrateLogWithDerivedFields(draft.hydration);
            writes.push(
              supabase
                .from('hydration_logs')
                .insert({
                  user_id: user.id,
                  logged_at: draft.logged_at,
                  amount_ml: normalizedHydration.amount_ml,
                  beverage_type: normalizedHydration.beverage_type,
                  beverage_category: normalizedHydration.beverage_category,
                  caffeine_content: draft.hydration.caffeine_content,
                  caffeine_mg: normalizedHydration.caffeine_mg,
                  effective_hydration_ml: normalizedHydration.effective_hydration_ml,
                  water_goal_contribution_ml:
                    normalizedHydration.water_goal_contribution_ml,
                  electrolyte_present: normalizedHydration.electrolyte_present,
                  alcohol_present: normalizedHydration.alcohol_present,
                })
                .then((r) => r)
            );
          }
          break;
        case 'sleep':
          if (!draft.sleep.enabled || !draft.sleep.sleep_start || !draft.sleep.sleep_end) break;
          writes.push(
            supabase
              .from('sleep_logs')
              .insert({
                user_id: user.id,
                logged_at: draft.logged_at,
                sleep_start: draft.sleep.sleep_start,
                sleep_end: draft.sleep.sleep_end,
                quality: draft.sleep.quality,
                felt_rested: draft.sleep.felt_rested,
              })
              .then((r) => r)
          );
          break;
        case 'stress':
          if (!draft.stress.enabled) break;
          writes.push(
            supabase
              .from('stress_logs')
              .insert({
                user_id: user.id,
                logged_at: draft.logged_at,
                stress_level: draft.stress.stress_level,
                notes: draft.stress.notes || null,
              })
              .then((r) => r)
          );
          break;
        case 'exercise':
          if (!draft.exercise.enabled || !draft.exercise.exercise_type.trim()) break;
          writes.push(
            supabase
              .from('exercise_logs')
              .insert({
                user_id: user.id,
                logged_at: draft.logged_at,
                exercise_type: draft.exercise.exercise_type.trim(),
                duration_minutes: draft.exercise.duration_minutes,
                intensity_level: draft.exercise.intensity_level,
              })
              .then((r) => r)
          );
          break;
        case 'medication':
          if (
            !draft.medication.enabled ||
            !draft.medication.medication_name.trim() ||
            !draft.medication.dosage.trim()
          ) {
            break;
          }
          writes.push(
            supabase
              .from('medication_logs')
              .insert({
                user_id: user.id,
                logged_at: draft.logged_at,
                medication_name: draft.medication.medication_name.trim(),
                dosage: draft.medication.dosage.trim(),
                medication_type: draft.medication.medication_type,
              })
              .then((r) => r)
          );
          break;
        case 'menstrualCycle':
          if (!draft.menstrualCycle.enabled || !draft.menstrualCycle.cycle_start_date) break;
          writes.push(
            supabase
              .from('menstrual_cycle_logs')
              .insert({
                user_id: user.id,
                logged_at: draft.logged_at,
                cycle_start_date: draft.menstrualCycle.cycle_start_date,
                cycle_day: draft.menstrualCycle.cycle_day,
                flow_intensity: draft.menstrualCycle.flow_intensity,
                pain_level: draft.menstrualCycle.pain_level,
              })
              .then((r) => r)
          );
          break;
      }
    }

    if (writes.length === 0) {
      throw new Error('Add at least one enabled section with enough detail to save.');
    }

    const results = await Promise.all(writes as Promise<WriteResult>[]);
    for (const result of results) {
      if (result.error) {
        throw new Error(result.error.message || 'Unable to save your check-in.');
      }
    }
  };

  const handleSaveAll = async () => {
    try {
      setSavingAll(true);
      setError(null);
      setMessage(null);
      await saveSections(sectionMeta.map((section) => section.key));
      setMessage(
        'Daily check-in saved. GutWise can use these entries the next time it looks for patterns.'
      );
      resetDraft();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your check-in.');
    } finally {
      setSavingAll(false);
    }
  };

  const handleSaveSection = async (key: SectionKey) => {
    try {
      setSavingSection(key);
      setError(null);
      setMessage(null);
      await saveSections([key]);
      setMessage(`${sectionMeta.find((section) => section.key === key)?.label} saved.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save this section.');
    } finally {
      setSavingSection(null);
    }
  };

  const renderSectionHeader = (key: SectionKey) => {
    const section = sectionMeta.find((item) => item.key === key)!;
    const Icon = section.icon;
    const enabled = draft[key].enabled;

    return (
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${
              enabled
                ? 'bg-brand-500/12 text-brand-500 dark:text-brand-300'
                : 'bg-neutral-bg text-neutral-muted dark:bg-dark-bg dark:text-dark-muted'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-body-md font-semibold text-neutral-text dark:text-dark-text">
              {section.label}
            </h2>
            <p className="mt-1 text-body-sm text-neutral-muted dark:text-dark-muted">
              {section.description}
            </p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-neutral-muted dark:text-dark-muted">
          Include
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) =>
              updateDraft(
                key,
                { ...draft[key], enabled: e.target.checked } as DailyCheckInDraft[SectionKey]
              )
            }
            className="h-4 w-4 rounded border-neutral-border text-brand-500 focus:ring-brand-500"
          />
        </label>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.65fr]">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/6 px-3 py-1 text-xs font-medium uppercase tracking-widest text-brand-500 dark:text-brand-300">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Daily Check-In
              </div>
              <h1 className="mt-3 text-h4 font-sora font-semibold text-neutral-text dark:text-dark-text">
                Log the whole day in one pass
              </h1>
              <p className="mt-2 max-w-2xl text-body-sm text-neutral-muted dark:text-dark-muted">
                This is the fastest way to give GutWise enough overlap across stool, food,
                symptoms, hydration, sleep, stress, exercise, medication, and cycle data to find
                clearer patterns.
              </p>
            </div>

            <TrustExplainer variant="insights" />

            {message && (
              <div className="rounded-xl border border-brand-500/20 bg-brand-500/8 p-4 text-body-sm text-brand-700 dark:text-brand-300">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-signal-500/30 bg-signal-500/10 p-4 text-body-sm text-signal-700 dark:text-signal-300">
                {error}
              </div>
            )}

            <Card variant="elevated" className="overflow-hidden">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-brand-500/8 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 dark:text-brand-300">
                    Included Today
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-text dark:text-dark-text">
                    {enabledSections.length}
                  </p>
                  <p className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
                    sections enabled
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-bg p-4 dark:bg-dark-bg">
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-muted dark:text-dark-muted">
                    Ready To Save
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-text dark:text-dark-text">
                    {completedCount}
                  </p>
                  <p className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
                    sections with enough detail
                  </p>
                </div>
                <div className="rounded-2xl bg-discovery-500/8 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-discovery-500 dark:text-discovery-300">
                    Best Signal
                  </p>
                  <p className="mt-2 text-body-md font-semibold text-neutral-text dark:text-dark-text">
                    Overlap matters most
                  </p>
                  <p className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
                    Stool, symptoms, meals, hydration, sleep, and stress together create the
                    strongest starting point.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="elevated">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex-1">
                  <label
                    htmlFor="daily-logged-at"
                    className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted"
                  >
                    Check-in time
                  </label>
                  <input
                    id="daily-logged-at"
                    type="datetime-local"
                    value={draft.logged_at}
                    onChange={(e) => updateDraft('logged_at', e.target.value)}
                    className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetDraft}>
                    Reset Draft
                  </Button>
                  <Button onClick={handleSaveAll} disabled={savingAll}>
                    <Save className="mr-2 inline h-4 w-4" />
                    {savingAll ? 'Saving...' : 'Save All Enabled Sections'}
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-5">
              <Card>
                {renderSectionHeader('bowelMovement')}
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Bristol type
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      step="1"
                      value={draft.bowelMovement.bristol_type}
                      onChange={(e) =>
                        updateDraft('bowelMovement', {
                          ...draft.bowelMovement,
                          bristol_type: parseInt(e.target.value, 10),
                        })
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-brand-500"
                    />
                    <div className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
                      Current: Type {draft.bowelMovement.bristol_type}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Urgency
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={draft.bowelMovement.urgency}
                      onChange={(e) =>
                        updateDraft('bowelMovement', {
                          ...draft.bowelMovement,
                          urgency: parseInt(e.target.value, 10),
                        })
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-orange-500"
                    />
                    <div className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
                      Current: {draft.bowelMovement.urgency}/5
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Pain
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={draft.bowelMovement.pain_level}
                      onChange={(e) =>
                        updateDraft('bowelMovement', {
                          ...draft.bowelMovement,
                          pain_level: parseInt(e.target.value, 10),
                        })
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-signal-500"
                    />
                    <div className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
                      Current: {draft.bowelMovement.pain_level}/10
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ToggleChip
                      label="Blood"
                      active={draft.bowelMovement.blood_present}
                      onToggle={() =>
                        updateDraft('bowelMovement', {
                          ...draft.bowelMovement,
                          blood_present: !draft.bowelMovement.blood_present,
                        })
                      }
                    />
                    <ToggleChip
                      label="Mucus"
                      active={draft.bowelMovement.mucus_present}
                      onToggle={() =>
                        updateDraft('bowelMovement', {
                          ...draft.bowelMovement,
                          mucus_present: !draft.bowelMovement.mucus_present,
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Notes
                    </label>
                    <textarea
                      value={draft.bowelMovement.notes}
                      onChange={(e) =>
                        updateDraft('bowelMovement', {
                          ...draft.bowelMovement,
                          notes: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                      placeholder="Optional details"
                    />
                  </div>
                </div>
                <SectionActions
                  saving={savingSection === 'bowelMovement'}
                  onSave={() => handleSaveSection('bowelMovement')}
                />
              </Card>

              <Card>
                {renderSectionHeader('symptoms')}
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Field
                    label="Main symptom"
                    value={draft.symptoms.symptom_type}
                    onChange={(value) =>
                      updateDraft('symptoms', { ...draft.symptoms, symptom_type: value })
                    }
                    placeholder="Bloating, cramping, nausea..."
                  />
                  <NumberField
                    label="Duration (minutes)"
                    value={draft.symptoms.duration_minutes}
                    onChange={(value) =>
                      updateDraft('symptoms', { ...draft.symptoms, duration_minutes: value })
                    }
                    min={1}
                  />
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Severity
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={draft.symptoms.severity}
                      onChange={(e) =>
                        updateDraft('symptoms', {
                          ...draft.symptoms,
                          severity: parseInt(e.target.value, 10),
                        })
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-signal-500"
                    />
                    <div className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
                      Current: {draft.symptoms.severity}/10
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Notes
                    </label>
                    <textarea
                      value={draft.symptoms.notes}
                      onChange={(e) =>
                        updateDraft('symptoms', { ...draft.symptoms, notes: e.target.value })
                      }
                      rows={2}
                      className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                      placeholder="Anything that made this stand out"
                    />
                  </div>
                </div>
                <SectionActions
                  saving={savingSection === 'symptoms'}
                  onSave={() => handleSaveSection('symptoms')}
                />
              </Card>

              <Card>
                {renderSectionHeader('food')}
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Meal type
                    </label>
                    <select
                      value={draft.food.meal_type}
                      onChange={(e) =>
                        updateDraft('food', {
                          ...draft.food,
                          meal_type: e.target.value as DailyCheckInDraft['food']['meal_type'],
                        })
                      }
                      className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  <Field
                    label="Tags"
                    value={draft.food.tags}
                    onChange={(value) => updateDraft('food', { ...draft.food, tags: value })}
                    placeholder="Comma separated, for example dairy, spicy, caffeine"
                  />
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Foods
                    </label>
                    <textarea
                      value={draft.food.foods}
                      onChange={(e) => updateDraft('food', { ...draft.food, foods: e.target.value })}
                      rows={2}
                      className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                      placeholder="Comma separated, for example eggs, toast, coffee"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Notes
                    </label>
                    <textarea
                      value={draft.food.notes}
                      onChange={(e) => updateDraft('food', { ...draft.food, notes: e.target.value })}
                      rows={2}
                      className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                      placeholder="Optional context like restaurant, cravings, or timing"
                    />
                  </div>
                </div>
                <SectionActions saving={savingSection === 'food'} onSave={() => handleSaveSection('food')} />
              </Card>

              <Card>
                {renderSectionHeader('hydration')}
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <NumberField
                    label="Amount (mL)"
                    value={draft.hydration.amount_ml}
                    onChange={(value) =>
                      updateDraft(
                        'hydration',
                        buildHydrationDraft(draft.hydration, { amount_ml: value })
                      )
                    }
                    min={1}
                  />
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Beverage
                    </label>
                    <select
                      value={draft.hydration.beverage_type}
                      onChange={(e) => {
                        const selected = BEVERAGE_TYPES.find((item) => item.value === e.target.value);
                        updateDraft(
                          'hydration',
                          buildHydrationDraft(draft.hydration, {
                            beverage_type: e.target.value,
                            beverage_category:
                              selected?.category ?? draft.hydration.beverage_category,
                            caffeine_content: (selected?.defaultCaffeineMg ?? 0) > 0,
                            caffeine_mg: selected?.defaultCaffeineMg ?? 0,
                            electrolyte_present: selected?.electrolytePresent ?? false,
                            alcohol_present: selected?.alcoholPresent ?? false,
                          })
                        );
                      }}
                      className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                    >
                      {BEVERAGE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <NumberField
                    label="Caffeine (mg)"
                    value={draft.hydration.caffeine_mg ?? 0}
                    onChange={(value) =>
                      updateDraft(
                        'hydration',
                        buildHydrationDraft(draft.hydration, {
                          caffeine_mg: value,
                          caffeine_content: value > 0,
                        })
                      )
                    }
                    min={0}
                  />
                  <div className="flex items-end">
                    <ToggleChip
                      label="Contains caffeine"
                      active={draft.hydration.caffeine_content}
                      onToggle={() =>
                        updateDraft(
                          'hydration',
                          buildHydrationDraft(draft.hydration, {
                            caffeine_content: !draft.hydration.caffeine_content,
                            caffeine_mg: draft.hydration.caffeine_content
                              ? 0
                              : Math.max(
                                  draft.hydration.caffeine_mg ?? 0,
                                  hydrationDefinition.defaultCaffeineMg || 25
                                ),
                          })
                        )
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <MetricPanel
                    label="Category"
                    value={draft.hydration.beverage_category ?? 'other'}
                    helper="Normalized beverage class"
                  />
                  <MetricPanel
                    label="Effective Hydration"
                    value={`${draft.hydration.effective_hydration_ml ?? 0} mL`}
                    helper="Counts toward total fluid modeling"
                  />
                  <MetricPanel
                    label="Water Goal Credit"
                    value={`${draft.hydration.water_goal_contribution_ml ?? 0} mL`}
                    helper="Counts toward strict water target"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {draft.hydration.electrolyte_present && (
                    <span className="inline-flex items-center rounded-full border border-brand-500/20 bg-brand-500/8 px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-300">
                      Electrolytes present
                    </span>
                  )}
                  {draft.hydration.alcohol_present && (
                    <span className="inline-flex items-center rounded-full border border-signal-500/30 bg-signal-500/10 px-3 py-1 text-xs font-medium text-signal-700 dark:text-signal-300">
                      Alcohol tracked separately
                    </span>
                  )}
                  <div className="inline-flex items-center gap-1 rounded-full border border-discovery-500/20 bg-discovery-500/8 px-3 py-1 text-xs font-medium text-discovery-600 dark:text-discovery-300">
                    <Zap className="h-3.5 w-3.5" />
                    {(draft.hydration.water_goal_contribution_ml ?? 0) > 0
                      ? 'Counts toward water goal'
                      : 'Counts as fluid context'}
                  </div>
                </div>
                <SectionActions
                  saving={savingSection === 'hydration'}
                  onSave={() => handleSaveSection('hydration')}
                />
              </Card>

              <Card>
                {renderSectionHeader('sleep')}
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <DateTimeField
                    label="Sleep start"
                    value={draft.sleep.sleep_start}
                    onChange={(value) => updateDraft('sleep', { ...draft.sleep, sleep_start: value })}
                  />
                  <DateTimeField
                    label="Wake time"
                    value={draft.sleep.sleep_end}
                    onChange={(value) => updateDraft('sleep', { ...draft.sleep, sleep_end: value })}
                  />
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Sleep quality
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={draft.sleep.quality}
                      onChange={(e) =>
                        updateDraft('sleep', {
                          ...draft.sleep,
                          quality: parseInt(e.target.value, 10),
                        })
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-brand-500"
                    />
                    <div className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
                      Current: {draft.sleep.quality}/10
                    </div>
                  </div>
                  <div className="flex items-end">
                    <ToggleChip
                      label="Felt rested"
                      active={draft.sleep.felt_rested}
                      onToggle={() =>
                        updateDraft('sleep', {
                          ...draft.sleep,
                          felt_rested: !draft.sleep.felt_rested,
                        })
                      }
                    />
                  </div>
                </div>
                <SectionActions
                  saving={savingSection === 'sleep'}
                  onSave={() => handleSaveSection('sleep')}
                />
              </Card>

              <Card>
                {renderSectionHeader('stress')}
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Stress level
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={draft.stress.stress_level}
                      onChange={(e) =>
                        updateDraft('stress', {
                          ...draft.stress,
                          stress_level: parseInt(e.target.value, 10),
                        })
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-pink-500"
                    />
                    <div className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
                      Current: {draft.stress.stress_level}/10
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Notes
                    </label>
                    <textarea
                      value={draft.stress.notes}
                      onChange={(e) => updateDraft('stress', { ...draft.stress, notes: e.target.value })}
                      rows={2}
                      className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                      placeholder="Optional trigger or context"
                    />
                  </div>
                </div>
                <SectionActions
                  saving={savingSection === 'stress'}
                  onSave={() => handleSaveSection('stress')}
                />
              </Card>

              <Card>
                {renderSectionHeader('exercise')}
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <Field
                    label="Exercise type"
                    value={draft.exercise.exercise_type}
                    onChange={(value) =>
                      updateDraft('exercise', { ...draft.exercise, exercise_type: value })
                    }
                    placeholder="Walk, run, yoga..."
                  />
                  <NumberField
                    label="Duration (minutes)"
                    value={draft.exercise.duration_minutes}
                    onChange={(value) =>
                      updateDraft('exercise', { ...draft.exercise, duration_minutes: value })
                    }
                    min={1}
                  />
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Intensity
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={draft.exercise.intensity_level}
                      onChange={(e) =>
                        updateDraft('exercise', {
                          ...draft.exercise,
                          intensity_level: parseInt(e.target.value, 10),
                        })
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-blue-500"
                    />
                    <div className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
                      Current: {draft.exercise.intensity_level}/5
                    </div>
                  </div>
                </div>
                <SectionActions
                  saving={savingSection === 'exercise'}
                  onSave={() => handleSaveSection('exercise')}
                />
              </Card>

              <Card>
                {renderSectionHeader('medication')}
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <Field
                    label="Medication"
                    value={draft.medication.medication_name}
                    onChange={(value) =>
                      updateDraft('medication', { ...draft.medication, medication_name: value })
                    }
                    placeholder="Name"
                  />
                  <Field
                    label="Dosage"
                    value={draft.medication.dosage}
                    onChange={(value) =>
                      updateDraft('medication', { ...draft.medication, dosage: value })
                    }
                    placeholder="10 mg"
                  />
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Type
                    </label>
                    <select
                      value={draft.medication.medication_type}
                      onChange={(e) =>
                        updateDraft('medication', {
                          ...draft.medication,
                          medication_type:
                            e.target.value as DailyCheckInDraft['medication']['medication_type'],
                        })
                      }
                      className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                    >
                      <option value="prescription">Prescription</option>
                      <option value="otc">OTC</option>
                      <option value="supplement">Supplement</option>
                    </select>
                  </div>
                </div>
                <SectionActions
                  saving={savingSection === 'medication'}
                  onSave={() => handleSaveSection('medication')}
                />
              </Card>

              <Card>
                {renderSectionHeader('menstrualCycle')}
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Cycle start date
                    </label>
                    <input
                      type="date"
                      value={draft.menstrualCycle.cycle_start_date}
                      onChange={(e) =>
                        updateDraft('menstrualCycle', {
                          ...draft.menstrualCycle,
                          cycle_start_date: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                    />
                  </div>
                  <NumberField
                    label="Cycle day"
                    value={draft.menstrualCycle.cycle_day}
                    onChange={(value) =>
                      updateDraft('menstrualCycle', {
                        ...draft.menstrualCycle,
                        cycle_day: value,
                      })
                    }
                    min={1}
                  />
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Flow
                    </label>
                    <select
                      value={draft.menstrualCycle.flow_intensity}
                      onChange={(e) =>
                        updateDraft('menstrualCycle', {
                          ...draft.menstrualCycle,
                          flow_intensity:
                            e.target.value as DailyCheckInDraft['menstrualCycle']['flow_intensity'],
                        })
                      }
                      className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                    >
                      <option value="none">None</option>
                      <option value="spotting">Spotting</option>
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
                      Pain
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={draft.menstrualCycle.pain_level}
                      onChange={(e) =>
                        updateDraft('menstrualCycle', {
                          ...draft.menstrualCycle,
                          pain_level: parseInt(e.target.value, 10),
                        })
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-border dark:bg-dark-border accent-rose-500"
                    />
                    <div className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
                      Current: {draft.menstrualCycle.pain_level}/10
                    </div>
                  </div>
                </div>
                <SectionActions
                  saving={savingSection === 'menstrualCycle'}
                  onSave={() => handleSaveSection('menstrualCycle')}
                />
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card variant="discovery">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-discovery-500/12 text-discovery-500 dark:text-discovery-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-body-md font-semibold text-neutral-text dark:text-dark-text">
                    What to log first
                  </h2>
                  <p className="mt-2 text-body-sm text-neutral-muted dark:text-dark-muted">
                    If you want the strongest first insights, start with stool, symptoms, meals,
                    hydration, sleep, and stress.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-body-md font-semibold text-neutral-text dark:text-dark-text">
                Today&apos;s progress
              </h2>
              <div className="mt-4 space-y-3">
                {sectionMeta.map((section) => {
                  const enabled = draft[section.key].enabled;
                  return (
                    <div key={section.key} className="flex items-center gap-3 text-body-sm">
                      {enabled ? (
                        <CheckCircle2 className="h-4 w-4 text-brand-500 dark:text-brand-300" />
                      ) : (
                        <Circle className="h-4 w-4 text-neutral-muted dark:text-dark-muted" />
                      )}
                      <span
                        className={
                          enabled
                            ? 'text-neutral-text dark:text-dark-text'
                            : 'text-neutral-muted dark:text-dark-muted'
                        }
                      >
                        {section.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <TrustExplainer variant="documents" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function MetricPanel({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-border bg-neutral-bg px-4 py-3 dark:border-dark-border dark:bg-dark-bg">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-muted dark:text-dark-muted">
        {label}
      </div>
      <div className="mt-2 text-body-md font-semibold text-neutral-text dark:text-dark-text">
        {value}
      </div>
      <div className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">{helper}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
        {label}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
      />
    </div>
  );
}

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
        {label}
      </label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-neutral-border bg-neutral-surface px-4 py-2.5 text-body-sm text-neutral-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
      />
    </div>
  );
}

function ToggleChip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center justify-center rounded-xl border px-4 py-3 text-body-sm font-medium transition-colors ${
        active
          ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300'
          : 'border-neutral-border text-neutral-muted hover:border-brand-300 hover:text-neutral-text dark:border-dark-border dark:text-dark-muted dark:hover:border-brand-700 dark:hover:text-dark-text'
      }`}
    >
      {label}
    </button>
  );
}

function SectionActions({
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="mt-5 flex justify-end">
      <Button variant="outline" onClick={onSave} disabled={saving}>
        <Save className="mr-2 inline h-4 w-4" />
        {saving ? 'Saving...' : 'Save This Section'}
      </Button>
    </div>
  );
}
