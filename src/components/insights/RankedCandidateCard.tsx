import { TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import type { MedicalContextAnnotatedCandidate } from '../../types/insightCandidates';
import type { LLMPerItemExplanation } from '../../types/llmExplanationOutput';

interface RankedCandidateCardProps {
  candidate: MedicalContextAnnotatedCandidate;
  explanation?: LLMPerItemExplanation;
  rank: number;
}

const tierConfig = {
  high: {
    accent: 'border-l-[#4A8FA8]',
    pill: 'bg-[#4A8FA8]/10 text-[#2C617D] dark:text-[#8EBFD8] border border-[#4A8FA8]/20',
    label: 'High priority',
  },
  medium: {
    accent: 'border-l-[#C28F94]',
    pill: 'bg-[#C28F94]/10 text-[#8D5D62] dark:text-[#D9B3B7] border border-[#C28F94]/20',
    label: 'Medium priority',
  },
  low: {
    accent: 'border-l-gray-400',
    pill: 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/[0.08]',
    label: 'Lower priority',
  },
};

const categoryLabels: Record<string, string> = {
  sleep: 'Sleep',
  stress: 'Stress',
  hydration: 'Hydration',
  food: 'Food',
  routine: 'Routine',
  cycle: 'Menstrual Cycle',
  exercise: 'Exercise',
  medication: 'Medication',
  multifactor: 'Multi-factor',
  protective: 'Protective Pattern',
  recovery: 'Recovery',
};

export default function RankedCandidateCard({ candidate, explanation, rank }: RankedCandidateCardProps) {
  const config = tierConfig[candidate.priority_tier];
  const categoryLabel = categoryLabels[candidate.category] ?? candidate.category;

  const score = candidate.evidence.lift !== null
    ? `${(candidate.evidence.lift * 100).toFixed(0)}% lift`
    : `${candidate.evidence.support_count} occurrences`;

  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-white/[0.08] border-l-4 bg-white dark:bg-white/[0.04] p-6 shadow-sm transition-all hover:shadow-md ${config.accent}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wide">#{rank} · {categoryLabel}</span>
            {candidate.medical_context_modifier_applied && (
              <span className="rounded-full bg-[#4A8FA8]/10 dark:bg-[#4A8FA8]/20 px-2 py-0.5 text-xs font-medium text-[#4A8FA8] dark:text-[#8EBFD8] border border-[#4A8FA8]/20">
                Context applied
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
            {candidate.subtype.replace(/_/g, ' ')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {candidate.trigger_factors.join(', ')} → {candidate.target_outcomes.join(', ')}
          </p>
        </div>

        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${config.pill}`}>
          {config.label}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{score}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="capitalize">{candidate.status}</span>
        </div>
      </div>

      {candidate.medical_context_annotations.length > 0 && (
        <div className="mb-4 rounded-xl bg-[#4A8FA8]/05 dark:bg-[#4A8FA8]/10 border border-[#4A8FA8]/15 p-3">
          <p className="text-xs text-[#2C617D] dark:text-[#8EBFD8] leading-relaxed">
            {candidate.medical_context_annotations.join(' · ')}
          </p>
        </div>
      )}

      {explanation && (
        <div className="mt-4 border-t border-gray-100 dark:border-white/[0.06] pt-4 space-y-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-[#7C5CFF]" />
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7C5CFF]">AI Interpretation</span>
          </div>

          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            {explanation.summary}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {explanation.evidence_statement}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-500 italic leading-relaxed">
            {explanation.uncertainty_statement}
          </p>

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
