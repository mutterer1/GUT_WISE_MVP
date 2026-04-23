import type {
  PrioritizedInsightCandidate,
  MedicalContextAnnotatedCandidate,
  MedicalContextSource,
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
  source: MedicalContextSource;
};

function factEvidenceLabel(
  fact: { confirmation_state: ConfirmationState; provenance?: { source: string; source_document_id: string | null } }
): string {
  if (
    fact.confirmation_state === 'confirmed' &&
    fact.provenance?.source === 'document_extraction' &&
    fact.provenance.source_document_id
  ) {
    return 'document-backed confirmed';
  }

  if (fact.confirmation_state === 'confirmed') return 'confirmed';
  if (fact.confirmation_state === 'user_reported') return 'user-reported';
  return 'candidate';
}

function factSourceKind(
  fact: { confirmation_state: ConfirmationState; provenance?: { source: string; source_document_id: string | null } }
): MedicalContextSource['kind'] {
  if (
    fact.confirmation_state === 'confirmed' &&
    fact.provenance?.source === 'document_extraction' &&
    fact.provenance.source_document_id
  ) {
    return 'document_backed_confirmed';
  }

  if (fact.confirmation_state === 'confirmed') return 'confirmed';
  if (fact.confirmation_state === 'user_reported') return 'user_reported';
  return 'pending_review';
}

function factTrustDelta(
  fact: { confirmation_state: ConfirmationState; provenance?: { source: string; source_document_id: string | null } },
  deltas: { documentBacked: number; confirmed: number; userReported: number }
): number {
  if (
    fact.confirmation_state === 'confirmed' &&
    fact.provenance?.source === 'document_extraction' &&
    fact.provenance.source_document_id
  ) {
    return deltas.documentBacked;
  }

  if (fact.confirmation_state === 'confirmed') return deltas.confirmed;
  if (fact.confirmation_state === 'user_reported') return deltas.userReported;
  return 0;
}

function hasAnyActiveMedicalContext(summary: MedicalContextSummary): boolean {
  return (
    summary.active_diagnoses.length > 0 ||
    summary.suspected_conditions.length > 0 ||
    summary.current_medications.length > 0 ||
    summary.surgeries_procedures.length > 0 ||
    summary.allergies_intolerances.length > 0 ||
    summary.active_diet_guidance.length > 0 ||
    summary.red_flag_history.length > 0 ||
    summary.pending_candidates_count > 0
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
      annotation: `Relevant to your ${factEvidenceLabel(d)} diagnosis context: ${d.detail.condition_name}`,
      scoreDelta: factTrustDelta(d, {
        documentBacked: 4,
        confirmed: 3,
        userReported: 1,
      }),
      source: {
        kind: factSourceKind(d),
        context_type: 'diagnosis',
        label: d.detail.condition_name,
      },
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
      annotation: `Potentially relevant to your ${factEvidenceLabel(a)} ${a.detail.substance} ${a.detail.reaction_type} with GI symptoms on record`,
      scoreDelta: factTrustDelta(a, {
        documentBacked: 6,
        confirmed: 4,
        userReported: 2,
      }),
      source: {
        kind: factSourceKind(a),
        context_type: 'allergy_intolerance',
        label: `${a.detail.substance} ${a.detail.reaction_type}`,
      },
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
      annotation: `${m.detail.medication_name} is in your ${factEvidenceLabel(m)} medication context and is flagged as having known GI side effects`,
      scoreDelta: factTrustDelta(m, {
        documentBacked: 4,
        confirmed: 3,
        userReported: 1,
      }),
      source: {
        kind: factSourceKind(m),
        context_type: 'medication',
        label: m.detail.medication_name,
      },
    }))
    .slice(0, 2);
}

function applyRedFlagModifiers(
  c: PrioritizedInsightCandidate,
  redFlags: MedicalContextSummary['red_flag_history']
): Modifier[] {
  if (redFlags.length === 0) return [];
  if (c.priority_tier === 'low') return [];

  const topRedFlag = redFlags[0];

  return [
    {
      annotation: `You have ${factEvidenceLabel(topRedFlag)} red-flag history on file - discuss significant symptom changes with your care team`,
      scoreDelta: factTrustDelta(topRedFlag, {
        documentBacked: 2,
        confirmed: 1,
        userReported: 0,
      }),
      source: {
        kind: factSourceKind(topRedFlag),
        context_type: 'red_flag_history',
        label: topRedFlag.detail.flag_type,
      },
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
      annotation: `You have ${factEvidenceLabel(activeGuidance[0])} dietary guidance on file that may be relevant to this pattern`,
      scoreDelta: factTrustDelta(activeGuidance[0], {
        documentBacked: 2,
        confirmed: 1,
        userReported: 0,
      }),
      source: {
        kind: factSourceKind(activeGuidance[0]),
        context_type: 'diet_guidance',
        label: activeGuidance[0].detail.guidance_type,
      },
    },
  ];
}

function applyPendingCandidateModifiers(
  summary: MedicalContextSummary
): Modifier[] {
  if (summary.pending_candidates_count <= 0) return [];

  return [
    {
      annotation:
        summary.pending_candidates_count === 1
          ? 'You have 1 pending medical-context review item, so this ranking may change as more evidence is confirmed'
          : `You have ${summary.pending_candidates_count} pending medical-context review items, so this ranking may change as more evidence is confirmed`,
      scoreDelta: 0,
      source: {
        kind: 'pending_review',
        context_type: 'pending_review',
        label:
          summary.pending_candidates_count === 1
            ? '1 pending review item'
            : `${summary.pending_candidates_count} pending review items`,
      },
    },
  ];
}

function dedupeSources(sources: MedicalContextSource[]): MedicalContextSource[] {
  const seen = new Set<string>();
  const deduped: MedicalContextSource[] = [];

  for (const source of sources) {
    const key = `${source.kind}::${source.context_type}::${source.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(source);
  }

  return deduped;
}

function annotateOne(
  c: PrioritizedInsightCandidate,
  summary: MedicalContextSummary
): MedicalContextAnnotatedCandidate {
  const modifiers: Modifier[] = [
    ...applyDiagnosisModifiers(c, summary.active_diagnoses),
    ...applyAllergyModifiers(c, summary.allergies_intolerances),
    ...applyMedicationModifiers(c, summary.current_medications),
    ...applyRedFlagModifiers(c, summary.red_flag_history),
    ...applyDietGuidanceModifiers(c, summary),
    ...applyPendingCandidateModifiers(summary),
  ];

  if (modifiers.length === 0) {
    return {
      ...c,
      medical_context_annotations: [],
      medical_context_modifier_applied: false,
      medical_context_score_delta: 0,
      medical_context_sources: [],
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
    medical_context_sources: dedupeSources(modifiers.map((m) => m.source)),
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
      medical_context_sources: [],
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
