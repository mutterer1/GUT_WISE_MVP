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
  closing?: string;
}

const content: Record<TrustExplainerVariant, TrustExplainerContent> = {
  insights: {
    title: 'How GutWise builds insights',
    subtitle: 'Insights come from repeated overlap in your logs, not one-off entries.',
    points: [
      'GutWise describes patterns in your data, not diagnoses.',
      'Confidence improves when the same signal appears across multiple days.',
    ],
    closing: 'If evidence is thin, GutWise should say so clearly.',
  },
  reports: {
    title: 'How to read this report',
    subtitle: 'This summary is organized to support a better conversation with your clinician.',
    points: [
      'Observed data comes first, followed by plain-language interpretation.',
      'Use the report as a timeline and discussion aid, not a conclusion.',
    ],
    closing: 'GutWise does not diagnose conditions or replace professional care.',
  },
  documents: {
    title: 'How document review works',
    subtitle: 'Uploaded records stay separate until you decide which details to activate.',
    points: [
      'Uploading creates a review record, not an automatic medical interpretation.',
      'Only reviewed and approved details can become active medical context.',
    ],
    closing: 'You stay in control of what GutWise uses to personalize patterns.',
  },
};

export default function TrustExplainer({
  variant = 'insights',
  className = '',
}: TrustExplainerProps) {
  const selected = content[variant];

  return (
    <Card
      variant={variant === 'insights' ? 'discovery' : 'flat'}
      glowIntensity={variant === 'insights' ? 'subtle' : 'subtle'}
      padding="sm"
      className={`rounded-[28px] ${className}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            'mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl',
            variant === 'documents'
              ? 'bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]'
              : variant === 'reports'
                ? 'bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]'
                : 'bg-[rgba(133,93,255,0.16)] text-[var(--color-accent-secondary)]',
          ].join(' ')}
        >
          {variant === 'documents' ? (
            <FileSearch className="h-5 w-5" />
          ) : variant === 'reports' ? (
            <ShieldCheck className="h-5 w-5" />
          ) : (
            <BrainCircuit className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
            {selected.title}
          </h2>

          <p className="mt-2 max-w-[62ch] text-sm leading-6 text-[var(--color-text-secondary)]">
            {selected.subtitle}
          </p>

          <div className="mt-4 space-y-2.5">
            {selected.points.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-text-tertiary)]" />
                <p className="text-sm leading-6 text-[var(--color-text-tertiary)]">{point}</p>
              </div>
            ))}
          </div>

          {selected.closing && (
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              {selected.closing}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
