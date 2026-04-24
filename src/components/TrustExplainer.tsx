import { ShieldCheck, FileSearch, BrainCircuit } from 'lucide-react';
import Card from './Card';

type TrustExplainerVariant = 'insights' | 'reports' | 'documents';

interface TrustExplainerProps {
  variant?: TrustExplainerVariant;
  className?: string;
}

interface TrustExplainerContent {
  title: string;
  subtitle: string;
  points: string[];
  note: string;
}

const content: Record<TrustExplainerVariant, TrustExplainerContent> = {
  insights: {
    title: 'How GutWise builds and labels insights',
    subtitle:
      'Insights are stronger when reviewed nutrition, structured ingredients, or reviewed medication references with dose and timing context back the pattern, and weaker when GutWise has to fall back to heuristics.',
    points: [
      'Each insight now shows whether it is driven by reviewed nutrition, structured ingredients, reviewed medication references, mixed evidence, or fallback heuristics.',
      'Confidence improves when the same signal appears across multiple days with better food coverage, stronger medication reference coverage, and more complete structure.',
      'When reviewed medication detail exists, GutWise can now tighten explanation wording after validation so route, timing, regimen, or dose context is used more directly.',
    ],
    note: 'If coverage is partial, heuristic fallback is doing most of the work, or medication wording still needed caution, GutWise should say that clearly and keep the structured medication detail visible as the source of truth.',
  },
  reports: {
    title: 'How to use this report',
    subtitle: 'Use the report as a structured conversation aid for clinical review.',
    points: [
      'Observed data appears first, followed by plain-language interpretation.',
      'Medication report cards now distinguish reviewed medication context from broader heuristic medication matching.',
      'Treat the report as a timeline and discussion tool, not a conclusion.',
    ],
    note: 'GutWise does not diagnose conditions or replace professional care. Give more weight to findings backed by reviewed medication references than to findings still labeled as medication heuristic.',
  },
  documents: {
    title: 'How document review works',
    subtitle: 'Uploaded records stay separate until you choose which details to activate.',
    points: [
      'Uploading creates a review record, not an automatic medical interpretation.',
      'Only reviewed and approved details can become active medical context.',
    ],
    note: 'You stay in control of what GutWise uses to personalize patterns.',
  },
};

export default function TrustExplainer({
  variant = 'insights',
  className = '',
}: TrustExplainerProps) {
  const selected = content[variant];

  const iconClassName =
    variant === 'documents'
      ? 'bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]'
      : variant === 'reports'
        ? 'bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]'
        : 'bg-[rgba(133,93,255,0.16)] text-[var(--color-accent-secondary)]';

  const Icon =
    variant === 'documents' ? FileSearch : variant === 'reports' ? ShieldCheck : BrainCircuit;

  return (
    <Card
      variant={variant === 'insights' ? 'discovery' : 'flat'}
      glowIntensity="subtle"
      padding="sm"
      className={`rounded-[28px] ${className}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="max-w-[60ch]">
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
              {selected.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              {selected.subtitle}
            </p>
          </div>

          <div className="mt-4 grid gap-2.5">
            {selected.points.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-text-tertiary)]" />
                <p className="text-sm leading-6 text-[var(--color-text-tertiary)]">{point}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
              Important
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              {selected.note}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
