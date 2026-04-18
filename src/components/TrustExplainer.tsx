import { ShieldCheck, FileSearch, BrainCircuit } from 'lucide-react';
import Card from './Card';

type TrustExplainerVariant = 'insights' | 'reports' | 'documents';

interface TrustExplainerProps {
  variant?: TrustExplainerVariant;
  className?: string;
}

const content: Record<TrustExplainerVariant, { title: string; subtitle: string; points: string[] }> = {
  insights: {
    title: 'How GutWise builds insights',
    subtitle: 'GutWise looks for repeated patterns across your logs and explains them in plain language.',
    points: [
      'Insights describe patterns in your entries, not diagnoses.',
      'Confidence grows when the same signal shows up across multiple days.',
      'If there is not enough evidence yet, GutWise should say so clearly.',
    ],
  },
  reports: {
    title: 'How to read this report',
    subtitle: 'This summary is built from your tracked data to support a better conversation with your clinician.',
    points: [
      'Observed data comes first, followed by plain-language pattern summaries.',
      'GutWise does not diagnose conditions or replace professional care.',
      'Bring this report to appointments as a timeline, not a conclusion.',
    ],
  },
  documents: {
    title: 'How document review works',
    subtitle: 'Uploaded documents stay separate from insights until you review and confirm the details you want to use.',
    points: [
      'Uploading a document creates a review record, not an automatic medical interpretation.',
      'Only reviewed and approved details can become active medical context.',
      'You stay in control of what GutWise uses to personalize patterns.',
    ],
  },
};

export default function TrustExplainer({
  variant = 'insights',
  className = '',
}: TrustExplainerProps) {
  const selected = content[variant];

  return (
    <Card
      padding="sm"
      className={`border-brand-500/20 bg-brand-500/5 dark:bg-brand-500/8 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/12 text-brand-500 dark:text-brand-300">
          {variant === 'documents' ? (
            <FileSearch className="h-5 w-5" />
          ) : variant === 'reports' ? (
            <ShieldCheck className="h-5 w-5" />
          ) : (
            <BrainCircuit className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-body-md font-semibold text-neutral-text dark:text-dark-text">
            {selected.title}
          </h2>
          <p className="mt-1 text-body-sm text-neutral-muted dark:text-dark-muted">
            {selected.subtitle}
          </p>
          <div className="mt-3 space-y-2">
            {selected.points.map((point) => (
              <p
                key={point}
                className="text-xs leading-relaxed text-neutral-muted dark:text-dark-muted"
              >
                {point}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
