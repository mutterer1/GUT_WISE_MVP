import type {
  PrioritizedInsightCandidate,
  MedicalContextAnnotatedCandidate,
  CandidateCategory,
  PriorityTier,
} from '../../types/insightCandidates';
import type {
  MedicalContextSummary,
  DiagnosisFact,
  AllergyIntoleranceFact,
  MedicationFact,
  ConfirmationState,
} from '../../types/medicalContext';

const MAX_SCORE_DELTA = 10;
const SCORE_CAP = 100;

type Modifier = {
  annotation: string;
  scoreDelta: number;
};

function factLabel(confirmationState: ConfirmationState): string {
  if (confirmationState === 'confirmed') return 'confirmed';
  if (confirmationState === 'user_reported') return 'reported';
  return 'candidate';
}

function hasAnyActiveMedicalContext(summary: MedicalContextSummary): boolean {
  return (
    summary.active_diagnoses.length > 0 ||
    summary.suspected_conditions.length > 0 ||
    summary.current_medications.length > 0 ||
    summary.surgeries_procedures.length > 0 ||
    summary.allergies_intolerances.length > 0 ||
    summary.active_diet_guidance.length > 0 ||
    summary.red_flag_history.length > 0
  );
}

function recomputeTier(score: number): PriorityTier {
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

function applyDiagnosisModifiers(
  c: PrioritizedInsightCandidate,
  diagnoses: DiagnosisFact[]
): Modifier[] {
  const GI_PRIMARY_CATEGORIES: CandidateCategory[] = [
    'stress',
    'food',
    'hydration',
    'multifactor',
    'recovery',
  ];
  if (!GI_PRIMARY_CATEGORIES.includes(c.category)) return [];

  const primaryDiagnoses = diagnoses.filter((d) => d.detail.gi_relevance === 'primary');
  if (primaryDiagnoses.length === 0) return [];

  return primaryDiagnoses
    .map((d) => ({
      annotation: `Relevant to your ${factLabel(d.confirmation_state)} diagnosis context: ${d.detail.condition_name}`,
      scoreDelta: 3,
    }))
    .slice(0, 1);
}

function applyAllergyModifiers(
  c: PrioritizedInsightCandidate,
  allergies: AllergyIntoleranceFact[]
): Modifier[] {
  const ALLERGY_CATEGORIES: CandidateCategory[] = ['food', 'hydration'];
  if (!ALLERGY_CATEGORIES.includes(c.category)) return [];

  const giAllergies = allergies.filter(
    (a) => a.detail.gi_symptoms && a.detail.gi_symptoms.length > 0
  );
  if (giAllergies.length === 0) return [];

  return giAllergies
    .map((a) => ({
      annotation: `Potentially relevant to your ${factLabel(a.confirmation_state)} ${a.detail.substance} ${a.detail.reaction_type} with GI symptoms on record`,
      scoreDelta: 5,
    }))
    .slice(0, 1);
}

function applyMedicationModifiers(
  c: PrioritizedInsightCandidate,
  medications: MedicationFact[]
): Modifier[] {
  if (c.category !== 'medication') return [];

  const giMedications = medications.filter((m) => m.detail.gi_side_effects_known && m.detail.is_current);
  if (giMedications.length === 0) return [];

  return giMedications
    .map((m) => ({
      annotation: `${m.detail.medication_name} is in your ${factLabel(m.confirmation_state)} medication context and is flagged as having known GI side effects`,
      scoreDelta: 3,
    }))
    .slice(0, 2);
}

function applyRedFlagModifiers(
  c: PrioritizedInsightCandidate,
  hasRedFlags: boolean
): Modifier[] {
  if (!hasRedFlags) return [];
  if (c.priority_tier === 'low') return [];

  return [
    {
      annotation:
        'You have a red flag history on file - discuss any significant symptom changes with your care team',
      scoreDelta: 0,
    },
  ];
}

function applyDietGuidanceModifiers(
  c: PrioritizedInsightCandidate,
  summary: MedicalContextSummary
): Modifier[] {
  if (c.category !== 'food') return [];

  const activeGuidance = summary.active_diet_guidance.filter(
    (g) => g.detail.is_current && g.detail.foods_to_avoid && g.detail.foods_to_avoid.length > 0
  );
  if (activeGuidance.length === 0) return [];

  return [
    {
      annotation: 'You have active dietary guidance on file that may be relevant to this pattern',
      scoreDelta: 0,
    },
  ];
}

function annotateOne(
  c: PrioritizedInsightCandidate,
  summary: MedicalContextSummary
): MedicalContextAnnotatedCandidate {
  const modifiers: Modifier[] = [
    ...applyDiagnosisModifiers(c, summary.active_diagnoses),
    ...applyAllergyModifiers(c, summary.allergies_intolerances),
    ...applyMedicationModifiers(c, summary.current_medications),
    ...applyRedFlagModifiers(c, summary.red_flag_history.length > 0),
    ...applyDietGuidanceModifiers(c, summary),
  ];

  if (modifiers.length === 0) {
    return {
      ...c,
      medical_context_annotations: [],
      medical_context_modifier_applied: false,
      medical_context_score_delta: 0,
    };
  }

  const rawDelta = modifiers.reduce((sum, m) => sum + m.scoreDelta, 0);
  const scoreDelta = Math.min(rawDelta, MAX_SCORE_DELTA);
  const newScore = Math.min(SCORE_CAP, Math.round((c.priority_score + scoreDelta) * 100) / 100);

  return {
    ...c,
    priority_score: newScore,
    priority_tier: recomputeTier(newScore),
    medical_context_annotations: modifiers.map((m) => m.annotation),
    medical_context_modifier_applied: true,
    medical_context_score_delta: scoreDelta,
  };
}

export function applyMedicalContextModifiers(
  candidates: PrioritizedInsightCandidate[],
  summary: MedicalContextSummary | null
): MedicalContextAnnotatedCandidate[] {
  if (!summary || !hasAnyActiveMedicalContext(summary)) {
    return candidates.map((c) => ({
      ...c,
      medical_context_annotations: [],
      medical_context_modifier_applied: false,
      medical_context_score_delta: 0,
    }));
  }

  const annotated = candidates.map((c) => annotateOne(c, summary));

  return annotated.sort((a, b) => {
    if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score;
    const statusOrder: Record<string, number> = { reliable: 0, emerging: 1, exploratory: 2 };
    const statusDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    if (statusDiff !== 0) return statusDiff;
    return a.insight_key.localeCompare(b.insight_key);
  });
}
