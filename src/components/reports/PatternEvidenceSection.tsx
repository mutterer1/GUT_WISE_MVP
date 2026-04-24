import { AlertCircle, FileSearch, ShieldCheck, Sparkles } from 'lucide-react';
import type {
  ExplanationInsightItem,
  ExplanationSignalSourceKind,
  RankedExplanationBundle,
} from '../../types/explanationBundle';
import type { CandidateEvidenceGapSummary } from '../../lib/insightCandidates/runRankedInsightPipeline';

interface PatternEvidenceSectionProps {
  bundle: RankedExplanationBundle;
  missingLogTypes: string[];
  evidenceGapSummaries: CandidateEvidenceGapSummary[];
}

const signalSourceConfig: Record<
  ExplanationSignalSourceKind,
  {
    label: string;
    badgeClass: string;
    accentClass: string;
  }
> = {
  reviewed_nutrition: {
    label: 'Reviewed nutrition',
    badgeClass:
      'border-[rgba(56,189,122,0.2)] bg-[rgba(56,189,122,0.1)] text-emerald-700 dark:text-emerald-300',
    accentClass: 'text-emerald-700 dark:text-emerald-300',
  },
  structured_ingredients: {
    label: 'Structured ingredients',
    badgeClass:
      'border-[rgba(84,160,255,0.22)] bg-[rgba(84,160,255,0.1)] text-[var(--color-accent-primary)]',
    accentClass: 'text-[var(--color-accent-primary)]',
  },
  mixed_structured_and_nutrition: {
    label: 'Mixed evidence',
    badgeClass:
      'border-[rgba(124,92,255,0.22)] bg-[rgba(124,92,255,0.1)] text-[#7C5CFF] dark:text-[#B8A8FF]',
    accentClass: 'text-[#7C5CFF] dark:text-[#B8A8FF]',
  },
  reviewed_medication_reference: {
    label: 'Reviewed medication',
    badgeClass:
      'border-[rgba(76,174,124,0.2)] bg-[rgba(76,174,124,0.1)] text-[#2F7A57] dark:text-[#9DE2BC]',
    accentClass: 'text-[#2F7A57] dark:text-[#9DE2BC]',
  },
  fallback_medication_heuristic: {
    label: 'Medication heuristic',
    badgeClass:
      'border-[rgba(255,170,92,0.24)] bg-[rgba(255,170,92,0.1)] text-[var(--color-warning)]',
    accentClass: 'text-[var(--color-warning)]',
  },
  fallback_heuristic: {
    label: 'Heuristic fallback',
    badgeClass:
      'border-[rgba(255,170,92,0.24)] bg-[rgba(255,170,92,0.1)] text-[var(--color-warning)]',
    accentClass: 'text-[var(--color-warning)]',
  },
  generic_logs: {
    label: 'Structured logs',
    badgeClass:
      'border-gray-200 bg-gray-100 text-gray-600 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-gray-300',
    accentClass: 'text-gray-600 dark:text-gray-300',
  },
};

const statusLabels: Record<string, string> = {
  reliable: 'Consistent pattern',
  emerging: 'Pattern building',
  exploratory: 'Tentative signal',
  insufficient: 'Not enough data yet',
};

const subtypeLabels: Record<string, string> = {
  medication_any_bm_shift: 'GI-relevant medication timing linked to bowel changes',
  medication_any_symptom_burden:
    'GI-relevant medication timing associated with symptom patterns',
  medication_as_needed_antidiarrheal_next_day_hard_stool:
    'As-needed antidiarrheal linked to harder stool the next day',
  medication_before_meal_iron_same_day_nausea:
    'Before-meal iron linked to same-day nausea',
  medication_oral_magnesium_same_day_loose_stool:
    'Quantified oral magnesium linked to same-day loose stool',
};

function formatPercent(value: number | null): string {
  if (value === null) return 'N/A';
  return `${Math.round(value * 100)}%`;
}

function buildTrustMetrics(source: ExplanationInsightItem['signal_source']): Array<{
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

function formatLift(value: number | null): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(1)}x`;
}

function formatFactorLabel(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .replace(/\b(bm|gi)\b/gi, (match) => match.toUpperCase())
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatSubtypeFallback(raw: string): string {
  const spaced = raw.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatCategoryLabel(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/^\w/, (char) => char.toUpperCase());
}

function formatMedicationDetailLabel(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/^\w/, (char) => char.toUpperCase());
}

function buildSourceCaution(item: ExplanationInsightItem): string | null {
  const source = item.signal_source;

  if (source.kind === 'fallback_heuristic') {
    return 'This finding still relies more on fallback heuristics than on reviewed nutrition or structured ingredient coverage.';
  }

  if (source.kind === 'fallback_medication_heuristic') {
    return 'This finding still relies more on medication family or name heuristics than on reviewed medication reference coverage.';
  }

  if (
    source.nutrition_coverage_ratio !== null &&
    source.nutrition_coverage_ratio < 0.65
  ) {
    return 'Reviewed nutrition coverage is still partial for this finding.';
  }

  if (
    source.structured_food_coverage_ratio !== null &&
    source.structured_food_coverage_ratio < 0.65
  ) {
    return 'Structured ingredient coverage is still partial for this finding.';
  }

  if (
    source.medication_coverage_ratio !== null &&
    source.medication_coverage_ratio < 0.65
  ) {
    return 'Reviewed medication coverage is still partial for this finding.';
  }

  if (
    source.structured_medication_profile_ratio !== null &&
    source.structured_medication_profile_ratio < 0.65
  ) {
    return 'Structured medication dose, route, timing, or regimen context is still partial for this finding.';
  }

  return null;
}

function buildMedicationInterpretationNote(item: ExplanationInsightItem): string | null {
  if (item.category !== 'medication') {
    return null;
  }

  if (item.signal_source.kind === 'fallback_medication_heuristic') {
    return 'Interpret this as a broad medication association only. It is not backed by a reviewed medication reference with structured route, timing, regimen, or dose detail.';
  }

  if (
    item.signal_source.kind === 'reviewed_medication_reference' &&
    item.medication_reference_detail
  ) {
    return 'This report card is anchored to the reviewed medication context shown above rather than to medication-name heuristics alone.';
  }

  if (item.signal_source.kind === 'reviewed_medication_reference') {
    return 'This report card is backed by a reviewed medication reference, but the structured medication profile is still broader than a single route, timing, regimen, or dose pattern.';
  }

  return null;
}

function summarizeSourceMix(items: ExplanationInsightItem[]): Array<{
  kind: ExplanationSignalSourceKind;
  count: number;
}> {
  const counts = new Map<ExplanationSignalSourceKind, number>();

  for (const item of items) {
    counts.set(item.signal_source.kind, (counts.get(item.signal_source.kind) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([kind, count]) => ({ kind, count }))
    .sort((left, right) => right.count - left.count);
}

function PatternEvidenceCard({ item }: { item: ExplanationInsightItem }) {
  const sourceMeta = signalSourceConfig[item.signal_source.kind];
  const sourceCaution = buildSourceCaution(item);
  const triggerSummary = item.trigger_factors.map(formatFactorLabel).join(', ');
  const outcomeSummary = item.target_outcomes.map(formatFactorLabel).join(', ');
  const title = subtypeLabels[item.subtype] ?? formatSubtypeFallback(item.subtype);
  const trustMetrics = buildTrustMetrics(item.signal_source);
  const medicationDetail = item.medication_reference_detail;
  const medicationInterpretationNote = buildMedicationInterpretationNote(item);
  const relationshipSummary =
    triggerSummary.length > 0 && outcomeSummary.length > 0
      ? { trigger: triggerSummary, outcome: outcomeSummary }
      : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 print:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${sourceMeta.badgeClass}`}
            >
              {sourceMeta.label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {statusLabels[item.status] ?? item.status}
            </span>
          </div>
          <h4 className="text-sm font-semibold leading-relaxed text-gray-900 dark:text-white">
            {title}
          </h4>
        </div>

        <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
          {formatCategoryLabel(item.category)}
        </span>
      </div>

      {relationshipSummary && (
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <span className="font-medium text-gray-900 dark:text-white">
            {relationshipSummary.trigger}
          </span>
          <span className="mx-1 text-gray-400 dark:text-gray-500">-</span>
          <span>{relationshipSummary.outcome}</span>
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Support count" value={String(item.evidence.support_count)} />
        <Stat label="Exposure count" value={String(item.evidence.exposure_count)} />
        <Stat label="Lift" value={formatLift(item.evidence.lift)} />
        <Stat
          label="Contradiction"
          value={formatPercent(item.evidence.contradiction.ratio)}
        />
      </div>

      <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
        <p className={`text-xs font-medium ${sourceMeta.accentClass}`}>
          Evidence basis
        </p>
        <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {item.signal_source.summary}
        </p>
      </div>

      {medicationDetail && (
        <div className="mt-4 rounded-xl border border-[rgba(76,174,124,0.18)] bg-[rgba(76,174,124,0.08)] px-4 py-3">
          <p className="text-xs font-medium text-[#2F7A57] dark:text-[#9DE2BC]">
            {item.signal_source.kind === 'reviewed_medication_reference'
              ? 'Reviewed medication detail'
              : 'Medication context used'}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
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
        <div className="mt-4 rounded-xl border border-[rgba(76,174,124,0.18)] bg-[rgba(76,174,124,0.05)] px-4 py-3">
          <p className="text-xs font-medium text-[#2F7A57] dark:text-[#9DE2BC]">
            Interpretation guardrail
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            {medicationInterpretationNote}
          </p>
        </div>
      )}

      {trustMetrics.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trustMetrics.map((metric) => (
            <Stat
              key={`${item.insight_key}-${metric.label}`}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </div>
      )}

      {item.medical_context_annotations.length > 0 && (
        <div className="mt-4 rounded-xl border border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)] px-4 py-3">
          <p className="text-xs font-medium text-[var(--color-accent-primary)]">
            Medical context
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            {item.medical_context_annotations.join(' | ')}
          </p>
        </div>
      )}

      {sourceCaution && (
        <div className="mt-4 rounded-xl border border-[rgba(255,170,92,0.18)] bg-[rgba(255,170,92,0.07)] px-4 py-3">
          <p className="text-xs leading-relaxed text-[var(--color-warning)]">
            {sourceCaution}
          </p>
        </div>
      )}

      {item.ranking_reasons.length > 0 && (
        <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          Ranking context: {item.ranking_reasons.join(' | ')}
        </p>
      )}
    </div>
  );
}

export default function PatternEvidenceSection({
  bundle,
  missingLogTypes,
  evidenceGapSummaries,
}: PatternEvidenceSectionProps) {
  const items = bundle.items;
  const sourceMix = summarizeSourceMix(items);

  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 print:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-4 border-b border-gray-100 pb-3 dark:border-white/[0.06]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Pattern Evidence
        </p>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Ranked insight trust framing
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          These report patterns use the same ranked insight pipeline as the live Insights screen and
          now carry explicit provenance about reviewed nutrition, structured ingredients, reviewed
          medication references, or heuristic fallback. Medication findings now also expose the
          concrete family, route, timing, regimen, and dose context used by the rule when that
          detail exists.
        </p>
      </div>

      {items.length > 0 ? (
        <>
          <div className="mb-5 rounded-xl border border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-accent-primary)]">
                  Report trust standard
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  GutWise should say when a finding is backed by reviewed nutrition, structured
                  ingredient matching, reviewed medication references with dose or timing context,
                  and when it is still leaning on fallback heuristics. These cards now also carry
                  the medication detail used by the rule into print and PDF export, together with
                  a guardrail that distinguishes reviewed medication context from broad heuristic
                  medication matching.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2.5">
            {sourceMix.map((entry) => {
              const meta = signalSourceConfig[entry.kind];
              return (
                <div
                  key={entry.kind}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${meta.badgeClass}`}
                >
                  {entry.count} {meta.label.toLowerCase()}
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <PatternEvidenceCard key={item.insight_key} item={item} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="flex items-start gap-3">
            <FileSearch className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                No ranked patterns were strong enough to include here
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                This report window did not produce enough repeated overlap for a provenance-aware
                ranked pattern summary.
              </p>

              {missingLogTypes.length > 0 && (
                <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  Missing context that would help most: {missingLogTypes.map(formatFactorLabel).join(', ')}
                </p>
              )}

              {evidenceGapSummaries.length > 0 && (
                <div className="mt-3 space-y-2">
                  {evidenceGapSummaries.slice(0, 2).map((summary) => (
                    <div
                      key={summary.insight_key}
                      className="rounded-lg border border-[rgba(255,170,92,0.18)] bg-[rgba(255,170,92,0.07)] px-3 py-2"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--color-warning)]" />
                        <p className="text-xs leading-relaxed text-[var(--color-warning)]">
                          {summary.reasons[0] ?? 'More repeated overlap is needed in this report window.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#7C5CFF]" />
          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            Report exports should preserve the difference between reviewed evidence and fallback
            heuristics across both food and medication findings. That helps keep the clinical
            conversation grounded in what GutWise actually knows versus what it is still inferring.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
