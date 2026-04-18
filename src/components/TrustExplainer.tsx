import { BrainCircuit, ShieldCheck, FileSearch } from 'lucide-react';
import Card from './Card';

type TrustVariant = 'insights' | 'reports' | 'documents';

interface TrustExplainerProps {
  variant: TrustVariant;
  className?: string;
}

const VARIANT_CONFIG: Record<TrustVariant, {
  icon: typeof BrainCircuit;
  title: string;
  subtitle: string;
  points: string[];
}> = {
  insights: {
    icon: BrainCircuit,
    title: 'How patterns work',
    subtitle: 'GutWise surfaces repeated signals in your data - not diagnoses.',
    points: [
      'Patterns require overlap across multiple log categories over time.',
      'A pattern is a correlation in your data, not a clinical finding.',
      'More consistent logging leads to more reliable and specific patterns.',
    ],
  },
  reports: {
    icon: ShieldCheck,
    title: 'About this report',
    subtitle: 'This summary is designed to support a conversation with your care team - not to reach a conclusion.',
    points: [
      'All data shown is exactly what you logged - nothing is inferred or added.',
      'Flagged items are based on what was recorded, not on clinical judgment.',
      'Share this with your clinician for context. They provide the interpretation.',
    ],
  },
  documents: {
    icon: FileSearch,
    title: 'How documents work',
    subtitle: 'Uploaded documents are stored as records. Details only affect your insights after you review and approve them.',
    points: [
      'Uploading a document does not change anything in your profile.',
      'You manually add any details you want to use from a document.',
      'Each detail stays in review until you personally confirm it.',
    ],
  },
};

export default function TrustExplainer({ variant, className = '' }: TrustExplainerProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <Card variant="flat" padding="md" className={`border-brand-500/15 dark:border-brand-500/12 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 dark:bg-brand-500/15">
          <Icon className="h-4 w-4 text-brand-500 dark:text-brand-300" />
        </div>
        <div className="min-w-0">
          <p className="text-body-sm font-semibold text-neutral-text dark:text-dark-text mb-0.5">{config.title}</p>
          <p className="text-body-xs text-neutral-muted dark:text-dark-muted mb-3 leading-relaxed">{config.subtitle}</p>
          <ul className="space-y-1.5">
            {config.points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-body-xs text-neutral-muted dark:text-dark-muted leading-relaxed">
                <span className="mt-1.5 flex-shrink-0 h-1 w-1 rounded-full bg-brand-500/50 dark:bg-brand-300/50" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
