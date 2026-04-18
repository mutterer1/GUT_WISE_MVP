import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { MedicalContextAnnotatedCandidate } from '../../types/insightCandidates';
import type { LLMPerItemExplanation } from '../../types/llmExplanationOutput';

interface RankedCandidateCardProps {
  candidate: MedicalContextAnnotatedCandidate;
  explanation?: LLMPerItemExplanation;
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
    subtype.includes('low_movement') ||
    subtype.includes('movement_bm') ||
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
  high: 'bg-[#4A8FA8]/08 text-[#2C617D] dark:text-[#8EBFD8] border border-[#4A8FA8]/18',
  medium:
    'bg-[#C28F94]/08 text-[#8D5D62] dark:text-[#D9B3B7] border border-[#C28F94]/18',
  low: 'bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/[0.08]',
};

const tierLabel: Record<string, string> = {
  high: 'Strong signal',
  medium: 'Moderate signal',
  low: 'Weak signal',
};

const subtypeLabels: Record<string, string> = {
  sleep_symptom: 'Poor sleep linked to next-day symptoms',
  stress_urgency: 'High stress linked to bowel urgency',
  stress_high_day_symptom_burden: 'Stress peaks associated with higher symptom load',
  hydration_stool_consistency: 'Low hydration linked to stool consistency changes',
  hydration_low_same_day_symptom_burden: 'Low hydration associated with worse symptoms',
  food_caffeine_same_day_symptom_burden: 'Caffeine intake linked to same-day symptoms',
  food_late_meal_next_day_bm_shift: 'Late eating associated with next-day bowel changes',
  food_meal_regularity_symptom_burden: 'Irregular meal timing linked to worse symptoms',
  bm_urgency_rolling_elevation: 'Sustained elevation in bowel urgency',
  flare_symptom_burden_episode: 'Identifiable symptom flare episode',
  flare_recovery_pattern: 'Recovery pattern following a flare period',
  cycle_phase_bm_shift: 'Cycle phase associated with bowel changes',
  cycle_phase_symptom_shift: 'Cycle phase associated with symptom changes',
  cycle_phase_recurrent_symptom_burden: 'Recurring symptoms across menstrual phases',
  exercise_movement_bm_regularity: 'Regular movement linked to bowel regularity',
  exercise_low_movement_symptom_burden: 'Low activity associated with higher symptom load',
  medication_any_bm_shift: 'Medication timing linked to bowel changes',
  medication_any_symptom_burden: 'Medication timing associated with symptom patterns',
  multifactor_stress_sleep_hydration_risk: 'Combined stress, poor sleep, and low hydration',
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

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${Math.round(value * 100)}%`;
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

export default function RankedCandidateCard({
  candidate,
  explanation,
  rank,
}: RankedCandidateCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(rank <= 2);

  const patternType = getPatternType(candidate.subtype, candidate.category);
  const pt = patternTypeConfig[patternType];
  const status = statusConfig[candidate.status] ?? statusConfig.exploratory;
  const categoryLabel = categoryLabels[candidate.category] ?? candidate.category;
  const title = subtypeLabels[candidate.subtype] ?? candidate.subtype.replace(/_/g, ' ');
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

  return (
    <div
      className={`rounded-2xl border border-gray-200 border-l-4 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-white/[0.07] dark:bg-white/[0.035] ${
        tierBorder[candidate.priority_tier] ?? tierBorder.low
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2 flex-wrap">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${pt.bg} ${pt.color} ${pt.border}`}
          >
            {pt.label}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{categoryLabel}</span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
            tierPill[candidate.priority_tier] ?? tierPill.low
          }`}
        >
          {tierLabel[candidate.priority_tier] ?? 'Weak signal'}
        </span>
      </div>

      <h3 className="mb-3 text-base font-semibold leading-snug text-gray-900 dark:text-white">
        {title}
      </h3>

      <div className="mb-5 flex items-center gap-1.5 text-sm flex-wrap">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {triggerLabels.join(', ')}
        </span>
        <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
        <span className="text-gray-500 dark:text-gray-400">{outcomeLabels.join(', ')}</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 rounded-full flex-shrink-0 ${status.dotColor}`} />
          <span className={`font-medium ${status.textColor}`}>{status.label}</span>
        </div>
        {supportDays > 0 && <span>Seen on {supportDays} {supportDays === 1 ? 'day' : 'days'}</span>}
        <span>{windowDays}-day lookback</span>
        <span>{evidenceQualityLabels[evidenceQuality] ?? evidenceQuality}</span>
      </div>

      {status.tentative && (
        <p className="mt-3 text-xs leading-relaxed text-gray-400 dark:text-gray-500">
          This pattern is still building. More consistent overlap across your logs will help confirm
          or rule it out.
        </p>
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
              <Metric label="Date window" value={formatDateRange(candidate.created_from_start_date, candidate.created_from_end_date)} />
              <Metric label="Support count" value={String(candidate.evidence.support_count)} />
              <Metric label="Exposure count" value={String(candidate.evidence.exposure_count)} />
              <Metric label="Contrast count" value={String(candidate.evidence.contrast_count ?? 0)} />
              <Metric label="Exposed rate" value={formatPercent(candidate.evidence.exposed_rate)} />
              <Metric label="Baseline rate" value={formatPercent(candidate.evidence.baseline_rate)} />
              <Metric label="Lift" value={candidate.evidence.lift ? `${candidate.evidence.lift}x` : 'N/A'} />
              <Metric
                label="Contradiction rate"
                value={formatPercent(contradictionRate)}
              />
              <Metric
                label="Medical context"
                value={medicalContextApplied ? 'Adjusted ranking' : 'No adjustment'}
              />
            </div>

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
