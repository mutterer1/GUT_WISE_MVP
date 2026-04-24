import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { MedicalContextAnnotatedCandidate } from '../../types/insightCandidates';
import type {
  ExplanationInsightItem,
  ExplanationSignalSourceKind,
  ExplanationSignalSourceSummary,
} from '../../types/explanationBundle';
import type {
  ExplanationGenerationMeta,
  LLMPerItemExplanation,
} from '../../types/llmExplanationOutput';

interface RankedCandidateCardProps {
  candidate: MedicalContextAnnotatedCandidate;
  bundleItem?: ExplanationInsightItem;
  explanation?: LLMPerItemExplanation;
  explanationGenerationMeta?: ExplanationGenerationMeta | null;
  rank: number;
}

type PatternType = 'same_day' | 'episodic' | 'recurring';

function getPatternType(subtype: string, category: string): PatternType {
  if (subtype.includes('flare') || subtype.includes('recovery') || subtype.includes('episode')) {
    return 'episodic';
  }

  if (
    category === 'cycle' ||
    subtype.includes('rolling') ||
    subtype.includes('persistence') ||
    subtype.includes('recurrent') ||
    subtype.includes('phase')
  ) {
    return 'recurring';
  }

  return 'same_day';
}

const patternTypeConfig: Record<
  PatternType,
  { label: string; color: string; bg: string; border: string }
> = {
  same_day: {
    label: 'Same-day association',
    color: 'text-[#2C617D] dark:text-[#8EBFD8]',
    bg: 'bg-[#4A8FA8]/06 dark:bg-[#4A8FA8]/10',
    border: 'border-[#4A8FA8]/15 dark:border-[#4A8FA8]/20',
  },
  episodic: {
    label: 'Episode pattern',
    color: 'text-[#8D5D62] dark:text-[#D9B3B7]',
    bg: 'bg-[#C28F94]/06 dark:bg-[#C28F94]/10',
    border: 'border-[#C28F94]/15 dark:border-[#C28F94]/20',
  },
  recurring: {
    label: 'Recurring pattern',
    color: 'text-[#5B3FD6] dark:text-[#B8A8FF]',
    bg: 'bg-[#7C5CFF]/06 dark:bg-[#7C5CFF]/10',
    border: 'border-[#7C5CFF]/15 dark:border-[#7C5CFF]/22',
  },
};

const tierBorder: Record<string, string> = {
  high: 'border-l-[#4A8FA8]',
  medium: 'border-l-[#C28F94]',
  low: 'border-l-gray-300 dark:border-l-white/20',
};

const tierPill: Record<string, string> = {
  high: 'border border-[#4A8FA8]/18 bg-[#4A8FA8]/08 text-[#2C617D] dark:text-[#8EBFD8]',
  medium:
    'border border-[#C28F94]/18 bg-[#C28F94]/08 text-[#8D5D62] dark:text-[#D9B3B7]',
  low: 'border border-gray-200 bg-gray-100 text-gray-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-gray-400',
};

const tierLabel: Record<string, string> = {
  high: 'Strong signal',
  medium: 'Moderate signal',
  low: 'Weak signal',
};

const subtypeLabels: Record<string, string> = {
  sleep_symptom: 'Poor sleep linked to next-day symptoms',
  poor_sleep_next_day_symptom_burden: 'Poor sleep linked to next-day symptoms',

  stress_urgency: 'High stress linked to bowel urgency',
  high_stress_same_day_urgency: 'High stress linked to bowel urgency',
  stress_high_day_symptom_burden: 'Stress peaks associated with higher symptom load',
  high_stress_day_symptom_burden: 'Stress peaks associated with higher symptom load',

  hydration_stool_consistency: 'Low hydration linked to stool consistency changes',
  low_hydration_next_day_hard_stool: 'Low hydration linked to harder stool the next day',
  hydration_low_same_day_symptom_burden: 'Low hydration associated with worse symptoms',
  low_hydration_same_day_symptom_burden: 'Low hydration associated with worse symptoms',

  food_caffeine_same_day_symptom_burden: 'Caffeine intake linked to same-day symptoms',
  caffeine_same_day_symptom_burden: 'Caffeine intake linked to same-day symptoms',
  food_gut_trigger_load_same_day_symptom_burden:
    'Known ingredient triggers associated with same-day symptoms',
  food_late_meal_next_day_bm_shift: 'Late eating associated with next-day bowel changes',
  late_meal_next_day_bm_shift: 'Late eating associated with next-day bowel changes',
  food_meal_regularity_symptom_burden: 'Irregular meal timing linked to worse symptoms',
  low_meal_regularity_symptom_burden: 'Irregular meal timing linked to worse symptoms',

  bm_urgency_rolling_elevation: 'Sustained elevation in bowel urgency',
  flare_symptom_burden_episode: 'Identifiable symptom flare episode',
  flare_recovery_pattern: 'Recovery pattern following a flare period',

  cycle_phase_bm_shift: 'Cycle phase associated with bowel changes',
  cycle_phase_symptom_shift: 'Cycle phase associated with symptom changes',
  cycle_phase_recurrent_symptom_burden: 'Recurring symptoms across menstrual phases',

  exercise_movement_bm_regularity: 'Regular movement linked to bowel regularity',
  low_movement_bm_regularity: 'Lower movement linked to bowel irregularity',
  exercise_low_movement_symptom_burden: 'Low activity associated with higher symptom load',
  low_movement_symptom_burden: 'Low activity associated with higher symptom load',

  medication_any_bm_shift: 'GI-relevant medication timing linked to bowel changes',
  medication_any_symptom_burden: 'GI-relevant medication timing associated with symptom patterns',
  medication_as_needed_antidiarrheal_next_day_hard_stool:
    'As-needed antidiarrheal linked to harder stool the next day',
  medication_before_meal_iron_same_day_nausea:
    'Before-meal iron linked to same-day nausea',
  medication_oral_magnesium_same_day_loose_stool:
    'Quantified oral magnesium linked to same-day loose stool',

  multifactor_stress_sleep_hydration_risk: 'Combined stress, poor sleep, and low hydration',
  compound_risk_day: 'Combined stress, poor sleep, and low hydration',

  symptom_type_persistence: 'Persistent recurring symptom type detected',
};

const statusConfig: Record<
  string,
  { label: string; dotColor: string; textColor: string; tentative?: boolean }
> = {
  reliable: {
    label: 'Consistent pattern',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  emerging: {
    label: 'Pattern building',
    dotColor: 'bg-[#4A8FA8]',
    textColor: 'text-[#2C617D] dark:text-[#8EBFD8]',
  },
  exploratory: {
    label: 'Tentative signal',
    dotColor: 'bg-gray-400 dark:bg-gray-500',
    textColor: 'text-gray-500 dark:text-gray-400',
    tentative: true,
  },
  insufficient: {
    label: 'Not enough data yet',
    dotColor: 'bg-gray-300 dark:bg-gray-600',
    textColor: 'text-gray-400 dark:text-gray-500',
    tentative: true,
  },
};

const categoryLabels: Record<string, string> = {
  sleep: 'Sleep',
  stress: 'Stress',
  hydration: 'Hydration',
  food: 'Food',
  gut: 'Gut',
  symptom: 'Symptom',
  routine: 'Routine',
  cycle: 'Menstrual cycle',
  exercise: 'Exercise',
  medication: 'Medication',
  multifactor: 'Multi-factor',
  protective: 'Protective',
  recovery: 'Recovery',
};

const evidenceQualityLabels: Record<string, string> = {
  high: 'High evidence quality',
  moderate: 'Moderate evidence quality',
  low: 'Early evidence',
  very_low: 'Very limited evidence',
};

const signalSourceConfig: Record<
  ExplanationSignalSourceKind,
  {
    label: string;
    badgeClass: string;
    panelClass: string;
    labelClass: string;
    bodyClass: string;
  }
> = {
  reviewed_nutrition: {
    label: 'Reviewed nutrition',
    badgeClass:
      'border border-[rgba(56,189,122,0.2)] bg-[rgba(56,189,122,0.1)] text-emerald-700 dark:text-emerald-300',
    panelClass:
      'border border-[rgba(56,189,122,0.16)] bg-[rgba(56,189,122,0.07)] dark:bg-[rgba(56,189,122,0.1)]',
    labelClass: 'text-emerald-700 dark:text-emerald-300',
    bodyClass: 'text-emerald-800/80 dark:text-emerald-200/80',
  },
  structured_ingredients: {
    label: 'Structured ingredients',
    badgeClass:
      'border border-[rgba(84,160,255,0.22)] bg-[rgba(84,160,255,0.1)] text-[var(--color-accent-primary)]',
    panelClass:
      'border border-[rgba(84,160,255,0.16)] bg-[rgba(84,160,255,0.07)] dark:bg-[rgba(84,160,255,0.1)]',
    labelClass: 'text-[var(--color-accent-primary)]',
    bodyClass: 'text-[#2C617D] dark:text-[#C7E1FF]',
  },
  mixed_structured_and_nutrition: {
    label: 'Mixed evidence',
    badgeClass:
      'border border-[rgba(124,92,255,0.22)] bg-[rgba(124,92,255,0.1)] text-[#7C5CFF] dark:text-[#B8A8FF]',
    panelClass:
      'border border-[rgba(124,92,255,0.16)] bg-[rgba(124,92,255,0.07)] dark:bg-[rgba(124,92,255,0.1)]',
    labelClass: 'text-[#7C5CFF] dark:text-[#B8A8FF]',
    bodyClass: 'text-[#6246D9] dark:text-[#D5CCFF]',
  },
  reviewed_medication_reference: {
    label: 'Reviewed medication',
    badgeClass:
      'border border-[rgba(76,174,124,0.2)] bg-[rgba(76,174,124,0.1)] text-[#2F7A57] dark:text-[#9DE2BC]',
    panelClass:
      'border border-[rgba(76,174,124,0.16)] bg-[rgba(76,174,124,0.07)] dark:bg-[rgba(76,174,124,0.1)]',
    labelClass: 'text-[#2F7A57] dark:text-[#9DE2BC]',
    bodyClass: 'text-[#295E46] dark:text-[#D7F8E5]',
  },
  fallback_medication_heuristic: {
    label: 'Medication heuristic',
    badgeClass:
      'border border-[rgba(255,170,92,0.24)] bg-[rgba(255,170,92,0.1)] text-[var(--color-warning)]',
    panelClass:
      'border border-[rgba(255,170,92,0.18)] bg-[rgba(255,170,92,0.07)] dark:bg-[rgba(255,170,92,0.1)]',
    labelClass: 'text-[var(--color-warning)]',
    bodyClass: 'text-[#8A5A16] dark:text-[rgba(255,220,181,0.88)]',
  },
  fallback_heuristic: {
    label: 'Heuristic fallback',
    badgeClass:
      'border border-[rgba(255,170,92,0.24)] bg-[rgba(255,170,92,0.1)] text-[var(--color-warning)]',
    panelClass:
      'border border-[rgba(255,170,92,0.18)] bg-[rgba(255,170,92,0.07)] dark:bg-[rgba(255,170,92,0.1)]',
    labelClass: 'text-[var(--color-warning)]',
    bodyClass: 'text-[#8A5A16] dark:text-[rgba(255,220,181,0.88)]',
  },
  generic_logs: {
    label: 'Structured logs',
    badgeClass:
      'border border-gray-200 bg-gray-100 text-gray-600 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-300',
    panelClass:
      'border border-gray-200/80 bg-gray-50/80 dark:border-white/[0.08] dark:bg-white/[0.04]',
    labelClass: 'text-gray-700 dark:text-gray-200',
    bodyClass: 'text-gray-600 dark:text-gray-400',
  },
};

function getWindowDays(start: string, end: string): number {
  const a = new Date(start);
  const b = new Date(end);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function formatFactorLabel(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .replace(/\b(bm|gi)\b/gi, (m) => m.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase());
}

function formatSubtypeFallback(raw: string): string {
  const spaced = raw.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatMedicationDetailLabel(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/^\w/, (char) => char.toUpperCase());
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${Math.round(value * 100)}%`;
}

function buildTrustMetrics(source: ExplanationSignalSourceSummary): Array<{
  label: string;
  value: string;
}> {
  const metrics: Array<{ label: string; value: string }> = [];

  if (source.nutrition_coverage_ratio !== null) {
    metrics.push({
      label: 'Nutrition coverage',
      value: formatPercent(source.nutrition_coverage_ratio),
    });
  }

  if (source.nutrition_confidence !== null) {
    metrics.push({
      label: 'Nutrition confidence',
      value: formatPercent(source.nutrition_confidence),
    });
  }

  if (source.structured_food_coverage_ratio !== null) {
    metrics.push({
      label: 'Ingredient coverage',
      value: formatPercent(source.structured_food_coverage_ratio),
    });
  }

  if (source.ingredient_signal_confidence !== null) {
    metrics.push({
      label: 'Ingredient confidence',
      value: formatPercent(source.ingredient_signal_confidence),
    });
  }

  if (source.medication_coverage_ratio !== null) {
    metrics.push({
      label: 'Medication coverage',
      value: formatPercent(source.medication_coverage_ratio),
    });
  }

  if (source.medication_signal_confidence !== null) {
    metrics.push({
      label: 'Medication confidence',
      value: formatPercent(source.medication_signal_confidence),
    });
  }

  if (source.structured_medication_profile_ratio !== null) {
    metrics.push({
      label: 'Profile structure',
      value: formatPercent(source.structured_medication_profile_ratio),
    });
  }

  return metrics;
}

function formatDateRange(start: string, end: string): string {
  return `${new Date(start).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${new Date(end).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;
}

function buildSignalSourceCaution(source: ExplanationSignalSourceSummary): string | null {
  if (source.kind === 'fallback_heuristic') {
    return 'This card is still relying mostly on fallback heuristics because reviewed nutrition or structured ingredient coverage is limited.';
  }

  if (source.kind === 'fallback_medication_heuristic') {
    return 'This card is still relying mostly on medication family or name heuristics because reviewed medication reference coverage is limited.';
  }

  if (
    source.nutrition_coverage_ratio !== null &&
    source.structured_food_coverage_ratio !== null &&
    source.nutrition_coverage_ratio < 0.65 &&
    source.structured_food_coverage_ratio < 0.65
  ) {
    return 'Structured coverage is still partial here. Accepting more reviewed foods with nutrition and ingredient detail would strengthen this signal.';
  }

  if (source.nutrition_confidence !== null && source.nutrition_confidence < 0.6) {
    return 'Reviewed nutrition is present here, but the nutrition confidence is still limited.';
  }

  if (
    source.ingredient_signal_confidence !== null &&
    source.ingredient_signal_confidence < 0.6
  ) {
    return 'Structured ingredients are present here, but ingredient confidence is still limited.';
  }

  if (
    source.medication_coverage_ratio !== null &&
    source.structured_medication_profile_ratio !== null &&
    source.medication_coverage_ratio < 0.65 &&
    source.structured_medication_profile_ratio < 0.65
  ) {
    return 'Reviewed medication coverage is still partial here. Accepting more reviewed medications with clear dose, route, timing, and regimen detail would strengthen this signal.';
  }

  if (
    source.medication_signal_confidence !== null &&
    source.medication_signal_confidence < 0.6
  ) {
    return 'Reviewed medication matches are present here, but medication signal confidence is still limited.';
  }

  if (
    source.structured_medication_profile_ratio !== null &&
    source.structured_medication_profile_ratio < 0.6
  ) {
    return 'Medication profile structure is still partial here, so dose, route, timing, or regimen context is incomplete.';
  }

  return null;
}

function buildMedicationInterpretationNote(
  category: string,
  source: ExplanationSignalSourceSummary | null,
  hasMedicationDetail: boolean
): string | null {
  if (category !== 'medication' || !source) {
    return null;
  }

  if (source.kind === 'fallback_medication_heuristic') {
    return 'Interpret this as a broad medication pattern only. It is not yet anchored to a reviewed medication reference with route, timing, regimen, or dose detail.';
  }

  if (source.kind === 'reviewed_medication_reference' && hasMedicationDetail) {
    return 'This finding is anchored to the reviewed medication context shown above rather than to name-only medication matching.';
  }

  if (source.kind === 'reviewed_medication_reference') {
    return 'This finding is backed by a reviewed medication reference, but the structured route, timing, regimen, or dose context is still broader than a single medication profile.';
  }

  return null;
}

export default function RankedCandidateCard({
  candidate,
  bundleItem,
  explanation,
  explanationGenerationMeta,
  rank,
}: RankedCandidateCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(rank <= 2);

  const patternType = getPatternType(candidate.subtype, candidate.category);
  const pt = patternTypeConfig[patternType];
  const status = statusConfig[candidate.status] ?? statusConfig.exploratory;
  const categoryLabel = categoryLabels[candidate.category] ?? candidate.category;
  const title = subtypeLabels[candidate.subtype] ?? formatSubtypeFallback(candidate.subtype);
  const windowDays = getWindowDays(
    candidate.created_from_start_date,
    candidate.created_from_end_date
  );
  const supportDays = candidate.evidence.sample_dates.length;
  const triggerLabels = candidate.trigger_factors.map(formatFactorLabel);
  const outcomeLabels = candidate.target_outcomes.map(formatFactorLabel);
  const evidenceQuality = candidate.evidence.evidence_quality ?? 'very_low';
  const supportingLogTypes = candidate.evidence.supporting_log_types ?? [];
  const missingLogTypes = candidate.evidence.missing_log_types ?? [];
  const evidenceGaps = candidate.evidence.evidence_gaps ?? [];
  const contradictionRate = candidate.evidence.contradiction_rate;
  const medicalContextApplied = candidate.medical_context_modifier_applied;
  const signalSource = bundleItem?.signal_source ?? null;
  const medicationDetail = bundleItem?.medication_reference_detail ?? null;
  const signalSourceMeta = signalSource ? signalSourceConfig[signalSource.kind] : null;
  const signalSourceCaution = signalSource ? buildSignalSourceCaution(signalSource) : null;
  const medicationInterpretationNote = buildMedicationInterpretationNote(
    candidate.category,
    signalSource,
    medicationDetail !== null
  );
  const trustMetrics = signalSource ? buildTrustMetrics(signalSource) : [];
  const wasMedicationRetryTarget =
    explanationGenerationMeta?.retry_target_insight_keys.includes(candidate.insight_key) ?? false;
  const hasRemainingMedicationWarning =
    explanationGenerationMeta?.remaining_medication_warning_keys.includes(candidate.insight_key) ??
    false;
  const medicationRetryTightened =
    !!explanation &&
    wasMedicationRetryTarget &&
    explanationGenerationMeta?.medication_validation_retry_attempted === true &&
    explanationGenerationMeta?.medication_validation_retry_applied === true &&
    explanationGenerationMeta?.medication_validation_retry_improved === true &&
    !hasRemainingMedicationWarning;
  const medicationRetryChecked =
    !!explanation &&
    wasMedicationRetryTarget &&
    explanationGenerationMeta?.medication_validation_retry_attempted === true;

  return (
    <div
      className={`rounded-2xl border border-gray-200 border-l-4 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-white/[0.07] dark:bg-white/[0.035] ${
        tierBorder[candidate.priority_tier] ?? tierBorder.low
      }`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2 flex-wrap">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${pt.bg} ${pt.color} ${pt.border}`}
          >
            {pt.label}
          </span>
          {signalSourceMeta && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${signalSourceMeta.badgeClass}`}
            >
              {signalSourceMeta.label}
            </span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">{categoryLabel}</span>
        </div>
        <span
          className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
            tierPill[candidate.priority_tier] ?? tierPill.low
          }`}
        >
          {tierLabel[candidate.priority_tier] ?? 'Weak signal'}
        </span>
      </div>

      <h3 className="mb-3 text-base font-semibold leading-snug text-gray-900 dark:text-white">
        {title}
      </h3>

      <div className="mb-5 flex flex-wrap items-center gap-1.5 text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {triggerLabels.join(', ')}
        </span>
        <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
        <span className="text-gray-500 dark:text-gray-400">{outcomeLabels.join(', ')}</span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${status.dotColor}`} />
          <span className={`font-medium ${status.textColor}`}>{status.label}</span>
        </div>
        {supportDays > 0 && (
          <span>
            Seen on {supportDays} {supportDays === 1 ? 'day' : 'days'}
          </span>
        )}
        <span>{windowDays}-day lookback</span>
        <span>{evidenceQualityLabels[evidenceQuality] ?? evidenceQuality}</span>
      </div>

      {status.tentative && (
        <p className="mt-3 text-xs leading-relaxed text-gray-400 dark:text-gray-500">
          This pattern is still building. More consistent overlap across your logs will help confirm
          or rule it out.
        </p>
      )}

      {signalSource && signalSourceMeta && (
        <div className={`mt-4 rounded-xl px-3.5 py-3 ${signalSourceMeta.panelClass}`}>
          <p className={`text-xs font-medium ${signalSourceMeta.labelClass}`}>
            Evidence basis | {signalSourceMeta.label}
          </p>
          <p className={`mt-1 text-xs leading-relaxed ${signalSourceMeta.bodyClass}`}>
            {signalSource.summary}
          </p>
        </div>
      )}

      {medicationDetail && (
        <div className="mt-4 rounded-xl border border-[rgba(76,174,124,0.18)] bg-[rgba(76,174,124,0.08)] px-3.5 py-3 dark:bg-[rgba(76,174,124,0.1)]">
          <p className="text-xs font-medium text-[#2F7A57] dark:text-[#9DE2BC]">
            {signalSource?.kind === 'reviewed_medication_reference'
              ? 'Reviewed medication detail'
              : 'Medication context used'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#295E46] dark:text-[#D7F8E5]">
            {medicationDetail.summary}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-[rgba(76,174,124,0.2)] bg-[rgba(76,174,124,0.1)] px-2.5 py-1 text-xs font-medium text-[#2F7A57] dark:text-[#9DE2BC]">
              {medicationDetail.label}
            </span>

            {medicationDetail.family && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300">
                Family: {formatMedicationDetailLabel(medicationDetail.family)}
              </span>
            )}

            {medicationDetail.route && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300">
                Route: {formatMedicationDetailLabel(medicationDetail.route)}
              </span>
            )}

            {medicationDetail.timing_context && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300">
                Timing: {formatMedicationDetailLabel(medicationDetail.timing_context)}
              </span>
            )}

            {medicationDetail.regimen_status && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300">
                Regimen: {formatMedicationDetailLabel(medicationDetail.regimen_status)}
              </span>
            )}

            {medicationDetail.dose_context && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300">
                Dose: {medicationDetail.dose_context}
              </span>
            )}
          </div>
        </div>
      )}

      {medicationInterpretationNote && (
        <div className="mt-4 rounded-xl border border-[rgba(76,174,124,0.18)] bg-[rgba(76,174,124,0.05)] px-3.5 py-3 dark:bg-[rgba(76,174,124,0.08)]">
          <p className="text-xs font-medium text-[#2F7A57] dark:text-[#9DE2BC]">
            Interpretation guardrail
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#295E46] dark:text-[#D7F8E5]">
            {medicationInterpretationNote}
          </p>
        </div>
      )}

      {candidate.medical_context_annotations.length > 0 && (
        <div className="mt-4 rounded-xl border border-[#4A8FA8]/12 bg-[#4A8FA8]/04 px-3.5 py-3 dark:bg-[#4A8FA8]/08">
          <p className="mb-1 text-xs font-medium text-[#2C617D] dark:text-[#8EBFD8]">
            Medical context
          </p>
          <p className="text-xs leading-relaxed text-[#2C617D]/75 dark:text-[#8EBFD8]/75">
            {candidate.medical_context_annotations.join(' | ')}
          </p>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-gray-200/80 dark:border-white/[0.08]">
        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Why this appeared</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Evidence window, support counts, comparison counts, and uncertainty
            </p>
          </div>
          {detailsOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          )}
        </button>

        {detailsOpen && (
          <div className="border-t border-gray-200/80 px-4 py-4 dark:border-white/[0.08]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric
                label="Date window"
                value={formatDateRange(
                  candidate.created_from_start_date,
                  candidate.created_from_end_date
                )}
              />
              <Metric label="Support count" value={String(candidate.evidence.support_count)} />
              <Metric label="Exposure count" value={String(candidate.evidence.exposure_count)} />
              <Metric label="Contrast count" value={String(candidate.evidence.contrast_count ?? 0)} />
              <Metric label="Exposed rate" value={formatPercent(candidate.evidence.exposed_rate)} />
              <Metric label="Baseline rate" value={formatPercent(candidate.evidence.baseline_rate)} />
              <Metric
                label="Lift"
                value={candidate.evidence.lift ? `${candidate.evidence.lift}x` : 'N/A'}
              />
              <Metric label="Contradiction rate" value={formatPercent(contradictionRate)} />
              <Metric
                label="Medical context"
                value={medicalContextApplied ? 'Adjusted ranking' : 'No adjustment'}
              />
            </div>

            {signalSource && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Trust framing
                </p>
                {trustMetrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {trustMetrics.map((metric) => (
                      <Metric
                        key={`${candidate.insight_key}-${metric.label}`}
                        label={metric.label}
                        value={metric.value}
                      />
                    ))}
                  </div>
                )}

                <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {signalSource.summary}
                </p>

                {signalSourceCaution && (
                  <div className="mt-3 rounded-xl border border-[rgba(255,170,92,0.18)] bg-[rgba(255,170,92,0.07)] px-3.5 py-3 dark:bg-[rgba(255,170,92,0.1)]">
                    <p className="text-xs leading-relaxed text-[var(--color-warning)]">
                      {signalSourceCaution}
                    </p>
                  </div>
                )}
              </div>
            )}

            {supportingLogTypes.length > 0 && (
              <div className="mt-4">
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Supporting log types
                </p>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {supportingLogTypes.map(formatFactorLabel).join(', ')}
                </p>
              </div>
            )}

            {missingLogTypes.length > 0 && (
              <div className="mt-4">
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Missing context that could strengthen this
                </p>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {missingLogTypes.map(formatFactorLabel).join(', ')}
                </p>
              </div>
            )}

            <div className="mt-4">
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Uncertainty
              </p>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {candidate.evidence.uncertainty_statement ??
                  'This pattern is based on repeated overlap in your logs, but it is still not a diagnosis.'}
              </p>
            </div>

            {evidenceGaps.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200/70 bg-amber-50/70 px-3.5 py-3 dark:border-amber-300/10 dark:bg-amber-400/5">
                <p className="mb-2 text-xs font-medium text-amber-800 dark:text-amber-300">
                  Not enough evidence yet
                </p>
                <div className="space-y-1.5">
                  {evidenceGaps.map((gap) => (
                    <p
                      key={`${candidate.insight_key}-${gap.type}-${gap.message}`}
                      className="text-xs leading-relaxed text-amber-900/80 dark:text-amber-200/80"
                    >
                      {gap.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {candidate.ranking_reasons.length > 0 && (
              <div className="mt-4">
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Ranking signals
                </p>
                <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {candidate.ranking_reasons.join(' | ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {explanation && (
        <div className="mt-5 space-y-4 border-t border-[#7C5CFF]/12 pt-5 dark:border-[#7C5CFF]/16">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#7C5CFF]" />
            <span className="text-xs font-medium tracking-wide text-[#7C5CFF] dark:text-[#B8A8FF]">
              Pattern explanation
            </span>
          </div>

          {medicationRetryChecked && (
            <div
              className={`rounded-xl px-3.5 py-3 ${
                medicationRetryTightened
                  ? 'border border-[rgba(76,174,124,0.18)] bg-[rgba(76,174,124,0.06)] dark:bg-[rgba(76,174,124,0.08)]'
                  : 'border border-[rgba(255,170,92,0.18)] bg-[rgba(255,170,92,0.07)] dark:bg-[rgba(255,170,92,0.1)]'
              }`}
            >
              <p
                className={`text-xs leading-relaxed ${
                  medicationRetryTightened
                    ? 'text-[#2F7A57] dark:text-[#D7F8E5]'
                    : 'text-[var(--color-warning)]'
                }`}
              >
                {medicationRetryTightened
                  ? 'This explanation was tightened after medication-detail validation so the wording uses the structured medication context more directly.'
                  : 'This explanation was checked against structured medication detail, but medication-detail cautions still remain. Use the medication detail block above as the source of truth.'}
              </p>
            </div>
          )}

          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            {explanation.summary}
          </p>

          {explanation.evidence_statement && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                What we observed
              </p>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {explanation.evidence_statement}
              </p>
            </div>
          )}

          {explanation.uncertainty_statement && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                Keep in mind
              </p>
              <p className="text-xs leading-relaxed text-gray-400 dark:text-gray-500">
                {explanation.uncertainty_statement}
              </p>
            </div>
          )}

          {explanation.caution_statement && (
            <div className="rounded-xl border border-[#C28F94]/18 bg-[#C28F94]/06 px-3.5 py-3 dark:bg-[#C28F94]/10">
              <p className="text-xs leading-relaxed text-[#8D5D62] dark:text-[#D9B3B7]">
                {explanation.caution_statement}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
