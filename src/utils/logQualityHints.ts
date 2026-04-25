export interface LogQualityHint {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
}

export function getFoodLogQualityHints(
  formData: {
    food_items: Array<{ name: string }>;
    portion_size: string;
    tags: string[];
    notes: string;
  },
  options: { detailsOpen: boolean }
): LogQualityHint[] {
  if (formData.food_items.length === 0) {
    return [];
  }

  const hints: LogQualityHint[] = [];

  if (!options.detailsOpen && formData.tags.length === 0 && formData.notes.trim().length === 0) {
    hints.push({
      id: 'food-digestive-tags',
      title: 'Add digestive context if this meal had obvious triggers',
      description:
        'If the meal was spicy, fried, dairy-heavy, high-fat, or otherwise notable, tagging it now makes later insight patterns much easier to trust.',
      actionLabel: 'Open details',
    });
  }

  if (!options.detailsOpen && formData.portion_size === 'Medium') {
    hints.push({
      id: 'food-portion-size',
      title: 'Portion size matters when this meal was unusually small or large',
      description:
        'Leave it as-is for normal meals, but change the portion when the amount was clearly outside your usual baseline.',
      actionLabel: 'Set portion',
    });
  }

  return hints;
}

export function getSymptomLogQualityHints(
  formData: {
    symptom_type: string;
    location: string;
    triggers: string[];
    notes: string;
  },
  options: { contextOpen: boolean }
): LogQualityHint[] {
  if (!formData.symptom_type.trim()) {
    return [];
  }

  const hints: LogQualityHint[] = [];

  if (!options.contextOpen && formData.location.trim().length === 0) {
    hints.push({
      id: 'symptom-location',
      title: 'Location can make symptom patterns more specific',
      description:
        'If the discomfort has a clear spot, add it now so later analysis can separate gut symptoms from broader or unrelated issues.',
      actionLabel: 'Add location',
    });
  }

  if (!options.contextOpen && formData.triggers.length === 0) {
    hints.push({
      id: 'symptom-trigger',
      title: 'Add a likely trigger when one stands out',
      description:
        'Use this only when a food, medication, stressor, or other clear suspect is obvious. It improves context without forcing certainty.',
      actionLabel: 'Add trigger',
    });
  }

  return hints;
}

export function getBmLogQualityHints(
  formData: {
    urgency: number;
    pain_level: number;
    incomplete_evacuation: boolean;
    blood_present: boolean;
    mucus_present: boolean;
    notes: string;
  },
  options: { detailsOpen: boolean }
): LogQualityHint[] {
  const hints: LogQualityHint[] = [];

  if (
    !options.detailsOpen &&
    (formData.incomplete_evacuation || formData.blood_present || formData.mucus_present)
  ) {
    hints.push({
      id: 'bm-unusual-findings',
      title: 'Unusual findings deserve a little more context',
      description:
        'If this BM included blood, mucus, or incomplete evacuation, a quick note can make the event easier to interpret later.',
      actionLabel: 'Add note',
    });
  }

  if (!options.detailsOpen && (formData.urgency >= 7 || formData.pain_level >= 7) && formData.notes.trim().length === 0) {
    hints.push({
      id: 'bm-severe-event-note',
      title: 'High-urgency or painful events are worth a brief note',
      description:
        'A short note about timing, food, or what felt different can make severe bowel events much more useful in the timeline.',
      actionLabel: 'Open details',
    });
  }

  return hints;
}

export function getHydrationLogQualityHints(
  formData: {
    beverage_type: string;
    caffeine_content: boolean;
    caffeine_mg: number;
    notes: string;
  },
  options: { detailsOpen: boolean }
): LogQualityHint[] {
  const hints: LogQualityHint[] = [];

  if (!options.detailsOpen && formData.caffeine_content && formData.caffeine_mg <= 0) {
    hints.push({
      id: 'hydration-caffeine-estimate',
      title: 'Estimate caffeine when this drink contains it',
      description:
        'Even a rough caffeine estimate is more useful than leaving it blank when the drink is clearly caffeinated.',
      actionLabel: 'Set caffeine',
    });
  }

  if (!options.detailsOpen && formData.beverage_type !== 'Water' && formData.notes.trim().length === 0) {
    hints.push({
      id: 'hydration-context-note',
      title: 'Add a note if the drink brand or context matters',
      description:
        'Use notes only when the brand, flavor, or situation changes how this drink should be interpreted later.',
      actionLabel: 'Open notes',
    });
  }

  return hints;
}

export function getMedicationLogQualityHints(
  formData: {
    medication_name: string;
    route: string;
    reason_for_use: string;
    regimen_status: string;
    timing_context: string;
    taken_as_prescribed: boolean;
    side_effects: string[];
    notes: string;
  },
  options: { contextOpen: boolean; responseOpen: boolean }
): LogQualityHint[] {
  if (!formData.medication_name.trim()) {
    return [];
  }

  const hints: LogQualityHint[] = [];

  if (!options.contextOpen && formData.reason_for_use.trim().length === 0) {
    hints.push({
      id: 'medication-reason',
      title: 'Reason for use is high-value when this was symptom-driven',
      description:
        'If this dose was taken for a flare, headache, reflux, or another specific issue, capturing that reason makes medication patterns much stronger.',
      actionLabel: 'Add reason',
    });
  }

  if (!options.contextOpen && formData.timing_context.trim().length === 0) {
    hints.push({
      id: 'medication-timing',
      title: 'Timing context helps more than extra notes',
      description:
        'Before meal, with food, bedtime, and similar timing markers are especially useful when symptoms cluster around medications.',
      actionLabel: 'Set timing',
    });
  }

  if (!options.contextOpen && formData.regimen_status === 'unknown') {
    hints.push({
      id: 'medication-regimen',
      title: 'Scheduled vs as-needed changes how this dose is interpreted',
      description:
        'If you know whether this was routine, rescue, or one-time, set the regimen now so adherence and symptom analysis stay cleaner.',
      actionLabel: 'Set regimen',
    });
  }

  if (
    !options.responseOpen &&
    !formData.taken_as_prescribed &&
    formData.side_effects.length === 0 &&
    formData.notes.trim().length === 0
  ) {
    hints.push({
      id: 'medication-off-plan-response',
      title: 'Off-plan doses are easier to understand with a quick note',
      description:
        'If you skipped, adjusted, or delayed the dose, a short note or side-effect tag can clarify what happened.',
      actionLabel: 'Add response',
    });
  }

  return hints;
}

export function getSleepLogQualityHints(
  formData: {
    sleep_start: string;
    sleep_end: string;
    interruptions: number;
    felt_rested: boolean;
    notes: string;
  },
  options: { recoveryOpen: boolean }
): LogQualityHint[] {
  if (!formData.sleep_start || !formData.sleep_end) {
    return [];
  }

  const hints: LogQualityHint[] = [];
  const durationMs = new Date(formData.sleep_end).getTime() - new Date(formData.sleep_start).getTime();
  const durationHours = Number.isNaN(durationMs) ? 0 : durationMs / (1000 * 60 * 60);

  if (!options.recoveryOpen && durationHours > 0 && durationHours < 5) {
    hints.push({
      id: 'sleep-short-window',
      title: 'Short sleep windows are more useful with recovery details',
      description:
        'If the night was short, adding interruptions, rested status, or a note can explain whether it was fragmented, intentional, or disruptive.',
      actionLabel: 'Open details',
    });
  }

  if (!options.recoveryOpen && formData.interruptions === 0 && !formData.felt_rested && formData.notes.trim().length === 0) {
    hints.push({
      id: 'sleep-recovery-read',
      title: 'A quick recovery read helps even when sleep duration looks fine',
      description:
        'If you woke up unrested or the night felt off, adding one more detail gives the entry more clinical value later.',
      actionLabel: 'Add recovery detail',
    });
  }

  return hints;
}

export function getStressLogQualityHints(
  formData: {
    stress_level: number;
    triggers: string[];
    coping_methods: string[];
    physical_symptoms: string[];
    notes: string;
  },
  options: { contextOpen: boolean }
): LogQualityHint[] {
  const hints: LogQualityHint[] = [];

  if (!options.contextOpen && formData.stress_level >= 7 && formData.triggers.length === 0) {
    hints.push({
      id: 'stress-trigger',
      title: 'High-stress moments are easier to interpret with a trigger',
      description:
        'If the cause was clear, add it now. This helps later correlation without requiring you to over-explain every low-stress entry.',
      actionLabel: 'Add trigger',
    });
  }

  if (!options.contextOpen && formData.stress_level >= 6 && formData.physical_symptoms.length === 0) {
    hints.push({
      id: 'stress-body-symptoms',
      title: 'Body symptoms can separate mental stress from physical fallout',
      description:
        'If the stress showed up as headache, stomach issues, tension, or rapid heartbeat, capture that while it is still obvious.',
      actionLabel: 'Add body symptoms',
    });
  }

  if (!options.contextOpen && formData.stress_level >= 6 && formData.coping_methods.length === 0) {
    hints.push({
      id: 'stress-coping',
      title: 'Coping methods are worth logging when you actively used one',
      description:
        'A quick coping tag can help GutWise distinguish unresolved stress from stress that was successfully regulated.',
      actionLabel: 'Add coping method',
    });
  }

  return hints;
}