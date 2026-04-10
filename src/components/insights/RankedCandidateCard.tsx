import { Sparkles } from 'lucide-react';
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

const patternTypeConfig: Record<PatternType, { label: string; color: string; bg: string; border: string }> = {
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
    color: 'text-[#2C617D] dark:text-[#8EBFD8]',
    bg: 'bg-[#4A8FA8]/08 dark:bg-[#4A8FA8]/12',
    border: 'border-[#4A8FA8]/20 dark:border-[#4A8FA8]/25',
  },
};

const tierBorder: Record<string, string> = {
  high: 'border-l-[#4A8FA8]',
  medium: 'border-l-[#C28F94]',
  low: 'border-l-gray-300 dark:border-l-white/20',
};

const tierPill: Record<string, string> = {
  high: 'bg-[#4A8FA8]/10 text-[#2C617D] dark:text-[#8EBFD8] border border-[#4A8FA8]/20',
  medium: 'bg-[#C28F94]/10 text-[#8D5D62] dark:text-[#D9B3B7] border border-[#C28F94]/20',
  low: 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/[0.08]',
};

const tierLabel: Record<string, string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Lower priority',
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

const statusConfig: Record<string, { label: string; dotColor: string; textColor: string }> = {
  reliable: {
    label: 'Reliable pattern',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  emerging: {
    label: 'Emerging',
    dotColor: 'bg-[#4A8FA8]',
    textColor: 'text-[#2C617D] dark:text-[#8EBFD8]',
  },
  exploratory: {
    label: 'Early signal',
    dotColor: 'bg-gray-400 dark:bg-gray-500',
    textColor: 'text-gray-500 dark:text-gray-400',
  },
  insufficient: {
    label: 'Low data',
    dotColor: 'bg-gray-300 dark:bg-gray-600',
    textColor: 'text-gray-400 dark:text-gray-500',
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

export default function RankedCandidateCard({ candidate, explanation, rank }: RankedCandidateCardProps) {
  const patternType = getPatternType(candidate.subtype, candidate.category);
  const pt = patternTypeConfig[patternType];
  const status = statusConfig[candidate.status] ?? statusConfig.exploratory;
  const categoryLabel = categoryLabels[candidate.category] ?? candidate.category;
  const title = subtypeLabels[candidate.subtype] ?? candidate.subtype.replace(/_/g, ' ');
  const windowDays = getWindowDays(candidate.created_from_start_date, candidate.created_from_end_date);
  const supportDays = candidate.evidence.sample_dates.length;
  const liftPct = candidate.evidence.lift !== null ? Math.round(candidate.evidence.lift * 100) : null;
  const triggerLabels = candidate.trigger_factors.map(formatFactorLabel);
  const outcomeLabels = candidate.target_outcomes.map(formatFactorLabel);

  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-white/[0.08] border-l-4 bg-white dark:bg-white/[0.04] p-6 shadow-sm transition-all hover:shadow-md ${tierBorder[candidate.priority_tier] ?? tierBorder.low}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${pt.bg} ${pt.color} ${pt.border}`}
          >
            {pt.label}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            #{rank} &middot; {categoryLabel}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tierPill[candidate.priority_tier] ?? tierPill.low}`}
        >
          {tierLabel[candidate.priority_tier] ?? 'Lower priority'}
        </span>
      </div>

      <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white leading-snug">
        {title}
      </h3>

      <div className="mb-4 flex items-center gap-1.5 text-sm flex-wrap">
        <span className="font-medium text-gray-700 dark:text-gray-300">{triggerLabels.join(', ')}</span>
        <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
        <span className="text-gray-500 dark:text-gray-400">{outcomeLabels.join(', ')}</span>
      </div>

      <div className="mb-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 rounded-full flex-shrink-0 ${status.dotColor}`} />
          <span className={`font-medium ${status.textColor}`}>{status.label}</span>
        </div>
        {supportDays > 0 && (
          <span>{supportDays} supporting {supportDays === 1 ? 'day' : 'days'}</span>
        )}
        {liftPct !== null && liftPct > 0 && (
          <span>{liftPct}% more likely on exposure days</span>
        )}
        <span>{windowDays}-day window</span>
      </div>

      {candidate.medical_context_annotations.length > 0 && (
        <div className="mb-4 rounded-xl bg-[#4A8FA8]/05 dark:bg-[#4A8FA8]/10 border border-[#4A8FA8]/15 p-3">
          <p className="mb-0.5 text-xs font-semibold text-[#2C617D] dark:text-[#8EBFD8]">Medical context</p>
          <p className="text-xs text-[#2C617D]/80 dark:text-[#8EBFD8]/80 leading-relaxed">
            {candidate.medical_context_annotations.join(' · ')}
          </p>
        </div>
      )}

      {explanation && (
        <div className="mt-4 border-t border-gray-100 dark:border-white/[0.06] pt-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#7C5CFF]" />
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7C5CFF] dark:text-[#B8A8FF]">
              AI Interpretation
            </span>
          </div>

          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            {explanation.summary}
          </p>

          {explanation.evidence_statement && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {explanation.evidence_statement}
            </p>
          )}

          {explanation.uncertainty_statement && (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic leading-relaxed">
              {explanation.uncertainty_statement}
            </p>
          )}

          {explanation.caution_statement && (
            <div className="rounded-lg bg-[#C28F94]/08 dark:bg-[#C28F94]/10 border border-[#C28F94]/20 px-3 py-2">
              <p className="text-xs text-[#8D5D62] dark:text-[#D9B3B7] leading-relaxed">
                {explanation.caution_statement}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
