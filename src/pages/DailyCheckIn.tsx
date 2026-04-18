import { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import TrustExplainer from '../components/TrustExplainer';
import { useDailyCheckInDraft } from '../hooks/useDailyCheckInDraft';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { DailyCheckInDraft } from '../types/dailyCheckIn';

type SectionKey = keyof DailyCheckInDraft;
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const SECTION_LABELS: Record<SectionKey, string> = {
  bowelMovement: 'Bowel Movement',
  symptoms: 'Symptoms',
  food: 'Food',
  hydration: 'Hydration',
  sleep: 'Sleep',
  stress: 'Stress',
  exercise: 'Exercise',
  medication: 'Medication',
  menstrualCycle: 'Menstrual Cycle',
};

const SYMPTOM_TYPES = [
  'Abdominal Pain', 'Bloating', 'Nausea', 'Cramping', 'Urgency',
  'Fatigue', 'Headache', 'Heartburn', 'Gas', 'Other',
];

const EXERCISE_TYPES = ['walking', 'running', 'cycling', 'swimming', 'yoga', 'strength', 'other'];
const EXERCISE_INTENSITIES = ['light', 'moderate', 'intense'];
const CYCLE_PHASES = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
const FLOW_INTENSITIES = ['none', 'light', 'medium', 'heavy', 'spotting'];
const MEAL_TYPES = ['meal', 'snack', 'drink'];
const DRINK_TYPES = ['water', 'tea', 'coffee', 'juice', 'soda', 'other'];

async function saveSection(userId: string, sectionKey: SectionKey, draft: DailyCheckInDraft): Promise<void> {
  const now = draft[sectionKey].logged_at;

  switch (sectionKey) {
    case 'bowelMovement': {
      const s = draft.bowelMovement;
      const { error } = await supabase.from('bm_logs').insert({
        user_id: userId,
        bristol_type: s.bristol_type,
        blood_present: s.blood_present,
        pain_level: s.pain_level,
        notes: s.notes || null,
        logged_at: now,
      });
      if (error) throw error;
      break;
    }
    case 'symptoms': {
      const s = draft.symptoms;
      const { error } = await supabase.from('symptom_logs').insert({
        user_id: userId,
        symptom_type: s.symptom_type,
        severity: s.severity,
        notes: s.notes || null,
        logged_at: now,
      });
      if (error) throw error;
      break;
    }
    case 'food': {
      const s = draft.food;
      const { error } = await supabase.from('food_logs').insert({
        user_id: userId,
        meal_type: s.meal_type,
        food_items: s.food_items || null,
        notes: s.notes || null,
        logged_at: now,
      });
      if (error) throw error;
      break;
    }
    case 'hydration': {
      const s = draft.hydration;
      const { error } = await supabase.from('hydration_logs').insert({
        user_id: userId,
        amount_ml: s.amount_ml,
        drink_type: s.drink_type,
        logged_at: now,
      });
      if (error) throw error;
      break;
    }
    case 'sleep': {
      const s = draft.sleep;
      const { error } = await supabase.from('sleep_logs').insert({
        user_id: userId,
        duration_minutes: s.duration_minutes,
        quality: s.quality,
        notes: s.notes || null,
        logged_at: now,
      });
      if (error) throw error;
      break;
    }
    case 'stress': {
      const s = draft.stress;
      const { error } = await supabase.from('stress_logs').insert({
        user_id: userId,
        stress_level: s.stress_level,
        notes: s.notes || null,
        logged_at: now,
      });
      if (error) throw error;
      break;
    }
    case 'exercise': {
      const s = draft.exercise;
      const { error } = await supabase.from('exercise_logs').insert({
        user_id: userId,
        exercise_type: s.exercise_type,
        duration_minutes: s.duration_minutes,
        intensity: s.intensity,
        notes: s.notes || null,
        logged_at: now,
      });
      if (error) throw error;
      break;
    }
    case 'medication': {
      const s = draft.medication;
      const { error } = await supabase.from('medication_logs').insert({
        user_id: userId,
        medication_name: s.medication_name,
        dosage: s.dosage || null,
        notes: s.notes || null,
        logged_at: now,
      });
      if (error) throw error;
      break;
    }
    case 'menstrualCycle': {
      const s = draft.menstrualCycle;
      const { error } = await supabase.from('menstrual_cycle_logs').insert({
        user_id: userId,
        cycle_phase: s.cycle_phase,
        flow_intensity: s.flow_intensity,
        notes: s.notes || null,
        logged_at: now,
      });
      if (error) throw error;
      break;
    }
  }
}

function InputLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-neutral-muted dark:text-dark-muted mb-1">
      {children}
    </label>
  );
}

function inputClass() {
  return 'w-full rounded-xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface px-3 py-2 text-sm text-neutral-text dark:text-dark-text placeholder-neutral-muted/50 dark:placeholder-dark-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30';
}

function selectClass() {
  return inputClass();
}

export default function DailyCheckIn() {
  const { user } = useAuth();
  const { draft, updateDraft, resetDraft } = useDailyCheckInDraft(user?.id);
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    bowelMovement: true,
    symptoms: true,
    food: true,
    hydration: true,
    sleep: false,
    stress: false,
    exercise: false,
    medication: false,
    menstrualCycle: false,
  });
  const [sectionStatus, setSectionStatus] = useState<Record<SectionKey, SaveStatus>>({
    bowelMovement: 'idle',
    symptoms: 'idle',
    food: 'idle',
    hydration: 'idle',
    sleep: 'idle',
    stress: 'idle',
    exercise: 'idle',
    medication: 'idle',
    menstrualCycle: 'idle',
  });
  const [saveAllStatus, setSaveAllStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const enabledSections = (Object.keys(draft) as SectionKey[]).filter((k) => draft[k].enabled);
  const savedSections = (Object.keys(sectionStatus) as SectionKey[]).filter((k) => sectionStatus[k] === 'saved');

  const toggleEnabled = (key: SectionKey) => {
    updateDraft({ [key]: { ...draft[key], enabled: !draft[key].enabled } } as Partial<DailyCheckInDraft>);
  };

  const toggleExpanded = (key: SectionKey) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSection = async (key: SectionKey) => {
    if (!user?.id) return;
    setSectionStatus((prev) => ({ ...prev, [key]: 'saving' }));
    setErrorMsg('');
    try {
      await saveSection(user.id, key, draft);
      setSectionStatus((prev) => ({ ...prev, [key]: 'saved' }));
    } catch (err) {
      setSectionStatus((prev) => ({ ...prev, [key]: 'error' }));
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    }
  };

  const handleSaveAll = async () => {
    if (!user?.id) return;
    setSaveAllStatus('saving');
    setErrorMsg('');
    const pending = enabledSections.filter((k) => sectionStatus[k] !== 'saved');
    try {
      await Promise.all(pending.map((k) => saveSection(user.id!, k, draft)));
      const updates = {} as Record<SectionKey, SaveStatus>;
      pending.forEach((k) => { updates[k] = 'saved'; });
      setSectionStatus((prev) => ({ ...prev, ...updates }));
      setSaveAllStatus('saved');
    } catch (err) {
      setSaveAllStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'One or more sections failed to save.');
    }
  };

  const handleReset = () => {
    resetDraft();
    const resetStatus = {} as Record<SectionKey, SaveStatus>;
    (Object.keys(sectionStatus) as SectionKey[]).forEach((k) => { resetStatus[k] = 'idle'; });
    setSectionStatus(resetStatus);
    setSaveAllStatus('idle');
    setErrorMsg('');
  };

  const allSaved = enabledSections.length > 0 && enabledSections.every((k) => sectionStatus[k] === 'saved');

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-h4 font-sora font-semibold text-neutral-text dark:text-dark-text">Daily Check-In</h1>
          <p className="text-body-sm text-neutral-muted dark:text-dark-muted mt-0.5">
            Log all your health data for today in one place. Enable only what applies.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-signal-500/30 bg-signal-500/10 px-4 py-3">
            <p className="text-body-sm text-signal-700 dark:text-signal-300">{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            {(Object.keys(draft) as SectionKey[]).map((key) => {
              const section = draft[key];
              const isEnabled = section.enabled;
              const status = sectionStatus[key];
              const isOpen = expanded[key];

              return (
                <Card key={key} variant="elevated" padding="none" className={isEnabled ? '' : 'opacity-60'}>
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => toggleEnabled(key)}
                        className="h-4 w-4 rounded border-neutral-border dark:border-dark-border accent-brand-500"
                      />
                      <span className="text-sm font-semibold text-neutral-text dark:text-dark-text">
                        {SECTION_LABELS[key]}
                      </span>
                      {status === 'saved' && (
                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                      )}
                    </div>
                    {isEnabled && (
                      <button
                        onClick={() => toggleExpanded(key)}
                        className="text-neutral-muted dark:text-dark-muted hover:text-neutral-text dark:hover:text-dark-text"
                      >
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    )}
                  </div>

                  {isEnabled && isOpen && (
                    <div className="border-t border-neutral-border dark:border-dark-border px-5 py-4 space-y-4">
                      <SectionFields sectionKey={key} draft={draft} updateDraft={updateDraft} />

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleSaveSection(key)}
                          disabled={status === 'saving' || status === 'saved'}
                        >
                          {status === 'saving' ? (
                            <span className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving...</span>
                          ) : status === 'saved' ? (
                            'Saved'
                          ) : (
                            'Save This Section'
                          )}
                        </Button>
                        {status === 'error' && (
                          <span className="text-xs text-signal-700 dark:text-signal-300">Failed to save</span>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            <Card variant="elevated" padding="md">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-muted dark:text-dark-muted mb-3">Progress</p>
              <p className="text-2xl font-sora font-semibold text-neutral-text dark:text-dark-text mb-0.5">
                {savedSections.length} / {enabledSections.length}
              </p>
              <p className="text-body-xs text-neutral-muted dark:text-dark-muted mb-4">sections saved</p>

              <div className="space-y-1.5 mb-4">
                {enabledSections.map((k) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-xs text-neutral-muted dark:text-dark-muted">{SECTION_LABELS[k]}</span>
                    <span className={`text-xs font-medium ${sectionStatus[k] === 'saved' ? 'text-green-500 dark:text-green-400' : 'text-neutral-muted/50 dark:text-dark-muted/50'}`}>
                      {sectionStatus[k] === 'saved' ? 'Saved' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSaveAll}
                disabled={saveAllStatus === 'saving' || allSaved || enabledSections.length === 0}
                className="w-full"
              >
                {saveAllStatus === 'saving' ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving...</span>
                ) : allSaved ? (
                  'All Saved'
                ) : (
                  'Save All Enabled Sections'
                )}
              </Button>

              {(allSaved || savedSections.length > 0) && (
                <button
                  onClick={handleReset}
                  className="mt-2 w-full text-center text-xs text-neutral-muted dark:text-dark-muted hover:text-neutral-text dark:hover:text-dark-text transition-colors"
                >
                  Start a new check-in
                </button>
              )}
            </Card>

            <TrustExplainer variant="insights" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function SectionFields({
  sectionKey,
  draft,
  updateDraft,
}: {
  sectionKey: SectionKey;
  draft: DailyCheckInDraft;
  updateDraft: (u: Partial<DailyCheckInDraft>) => void;
}) {
  const patch = (values: Record<string, unknown>) => {
    updateDraft({ [sectionKey]: { ...draft[sectionKey], ...values } } as Partial<DailyCheckInDraft>);
  };

  switch (sectionKey) {
    case 'bowelMovement': {
      const s = draft.bowelMovement;
      return (
        <div className="space-y-3">
          <div>
            <InputLabel>Bristol Type (1-7)</InputLabel>
            <input
              type="number"
              min={1}
              max={7}
              value={s.bristol_type ?? ''}
              onChange={(e) => patch({ bristol_type: e.target.value ? Number(e.target.value) : null })}
              className={inputClass()}
            />
          </div>
          <div>
            <InputLabel>Pain Level (0-10)</InputLabel>
            <input
              type="number"
              min={0}
              max={10}
              value={s.pain_level ?? ''}
              onChange={(e) => patch({ pain_level: e.target.value ? Number(e.target.value) : null })}
              className={inputClass()}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={s.blood_present}
              onChange={(e) => patch({ blood_present: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-border accent-brand-500"
            />
            <span className="text-sm text-neutral-muted dark:text-dark-muted">Blood present</span>
          </div>
          <div>
            <InputLabel>Notes</InputLabel>
            <input
              type="text"
              value={s.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              placeholder="Optional notes"
              className={inputClass()}
            />
          </div>
          <div>
            <InputLabel>Logged at</InputLabel>
            <input
              type="datetime-local"
              value={s.logged_at}
              onChange={(e) => patch({ logged_at: e.target.value })}
              className={inputClass()}
            />
          </div>
        </div>
      );
    }

    case 'symptoms': {
      const s = draft.symptoms;
      return (
        <div className="space-y-3">
          <div>
            <InputLabel>Symptom Type</InputLabel>
            <select value={s.symptom_type} onChange={(e) => patch({ symptom_type: e.target.value })} className={selectClass()}>
              {SYMPTOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <InputLabel>Severity (1-10, current: {s.severity})</InputLabel>
            <input
              type="range"
              min={1}
              max={10}
              value={s.severity}
              onChange={(e) => patch({ severity: Number(e.target.value) })}
              className="w-full accent-brand-500"
            />
          </div>
          <div>
            <InputLabel>Notes</InputLabel>
            <input type="text" value={s.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Optional notes" className={inputClass()} />
          </div>
          <div>
            <InputLabel>Logged at</InputLabel>
            <input type="datetime-local" value={s.logged_at} onChange={(e) => patch({ logged_at: e.target.value })} className={inputClass()} />
          </div>
        </div>
      );
    }

    case 'food': {
      const s = draft.food;
      return (
        <div className="space-y-3">
          <div>
            <InputLabel>Meal Type</InputLabel>
            <select value={s.meal_type} onChange={(e) => patch({ meal_type: e.target.value })} className={selectClass()}>
              {MEAL_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <InputLabel>Food Items</InputLabel>
            <input type="text" value={s.food_items} onChange={(e) => patch({ food_items: e.target.value })} placeholder="e.g. oatmeal, banana, coffee" className={inputClass()} />
          </div>
          <div>
            <InputLabel>Notes</InputLabel>
            <input type="text" value={s.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Optional notes" className={inputClass()} />
          </div>
          <div>
            <InputLabel>Logged at</InputLabel>
            <input type="datetime-local" value={s.logged_at} onChange={(e) => patch({ logged_at: e.target.value })} className={inputClass()} />
          </div>
        </div>
      );
    }

    case 'hydration': {
      const s = draft.hydration;
      return (
        <div className="space-y-3">
          <div>
            <InputLabel>Amount (ml)</InputLabel>
            <input type="number" min={0} value={s.amount_ml} onChange={(e) => patch({ amount_ml: Number(e.target.value) })} className={inputClass()} />
          </div>
          <div>
            <InputLabel>Drink Type</InputLabel>
            <select value={s.drink_type} onChange={(e) => patch({ drink_type: e.target.value })} className={selectClass()}>
              {DRINK_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <InputLabel>Logged at</InputLabel>
            <input type="datetime-local" value={s.logged_at} onChange={(e) => patch({ logged_at: e.target.value })} className={inputClass()} />
          </div>
        </div>
      );
    }

    case 'sleep': {
      const s = draft.sleep;
      return (
        <div className="space-y-3">
          <div>
            <InputLabel>Duration (minutes)</InputLabel>
            <input type="number" min={0} value={s.duration_minutes ?? ''} onChange={(e) => patch({ duration_minutes: e.target.value ? Number(e.target.value) : null })} className={inputClass()} />
          </div>
          <div>
            <InputLabel>Quality (1-10{s.quality ? `, current: ${s.quality}` : ''})</InputLabel>
            <input type="range" min={1} max={10} value={s.quality ?? 5} onChange={(e) => patch({ quality: Number(e.target.value) })} className="w-full accent-brand-500" />
          </div>
          <div>
            <InputLabel>Notes</InputLabel>
            <input type="text" value={s.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Optional notes" className={inputClass()} />
          </div>
          <div>
            <InputLabel>Logged at (sleep start)</InputLabel>
            <input type="datetime-local" value={s.logged_at} onChange={(e) => patch({ logged_at: e.target.value })} className={inputClass()} />
          </div>
        </div>
      );
    }

    case 'stress': {
      const s = draft.stress;
      return (
        <div className="space-y-3">
          <div>
            <InputLabel>Stress Level (1-10, current: {s.stress_level})</InputLabel>
            <input type="range" min={1} max={10} value={s.stress_level} onChange={(e) => patch({ stress_level: Number(e.target.value) })} className="w-full accent-brand-500" />
          </div>
          <div>
            <InputLabel>Notes</InputLabel>
            <input type="text" value={s.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Optional notes" className={inputClass()} />
          </div>
          <div>
            <InputLabel>Logged at</InputLabel>
            <input type="datetime-local" value={s.logged_at} onChange={(e) => patch({ logged_at: e.target.value })} className={inputClass()} />
          </div>
        </div>
      );
    }

    case 'exercise': {
      const s = draft.exercise;
      return (
        <div className="space-y-3">
          <div>
            <InputLabel>Exercise Type</InputLabel>
            <select value={s.exercise_type} onChange={(e) => patch({ exercise_type: e.target.value })} className={selectClass()}>
              {EXERCISE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <InputLabel>Duration (minutes)</InputLabel>
            <input type="number" min={0} value={s.duration_minutes ?? ''} onChange={(e) => patch({ duration_minutes: e.target.value ? Number(e.target.value) : null })} className={inputClass()} />
          </div>
          <div>
            <InputLabel>Intensity</InputLabel>
            <select value={s.intensity} onChange={(e) => patch({ intensity: e.target.value })} className={selectClass()}>
              {EXERCISE_INTENSITIES.map((i) => <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <InputLabel>Notes</InputLabel>
            <input type="text" value={s.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Optional notes" className={inputClass()} />
          </div>
          <div>
            <InputLabel>Logged at</InputLabel>
            <input type="datetime-local" value={s.logged_at} onChange={(e) => patch({ logged_at: e.target.value })} className={inputClass()} />
          </div>
        </div>
      );
    }

    case 'medication': {
      const s = draft.medication;
      return (
        <div className="space-y-3">
          <div>
            <InputLabel>Medication Name</InputLabel>
            <input type="text" value={s.medication_name} onChange={(e) => patch({ medication_name: e.target.value })} placeholder="e.g. Mesalazine 400mg" className={inputClass()} />
          </div>
          <div>
            <InputLabel>Dosage</InputLabel>
            <input type="text" value={s.dosage} onChange={(e) => patch({ dosage: e.target.value })} placeholder="e.g. 400mg" className={inputClass()} />
          </div>
          <div>
            <InputLabel>Notes</InputLabel>
            <input type="text" value={s.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Optional notes" className={inputClass()} />
          </div>
          <div>
            <InputLabel>Logged at</InputLabel>
            <input type="datetime-local" value={s.logged_at} onChange={(e) => patch({ logged_at: e.target.value })} className={inputClass()} />
          </div>
        </div>
      );
    }

    case 'menstrualCycle': {
      const s = draft.menstrualCycle;
      return (
        <div className="space-y-3">
          <div>
            <InputLabel>Cycle Phase</InputLabel>
            <select value={s.cycle_phase} onChange={(e) => patch({ cycle_phase: e.target.value })} className={selectClass()}>
              {CYCLE_PHASES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <InputLabel>Flow Intensity</InputLabel>
            <select value={s.flow_intensity} onChange={(e) => patch({ flow_intensity: e.target.value })} className={selectClass()}>
              {FLOW_INTENSITIES.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <InputLabel>Notes</InputLabel>
            <input type="text" value={s.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Optional notes" className={inputClass()} />
          </div>
          <div>
            <InputLabel>Logged at</InputLabel>
            <input type="datetime-local" value={s.logged_at} onChange={(e) => patch({ logged_at: e.target.value })} className={inputClass()} />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
