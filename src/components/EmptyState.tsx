import { ReactNode } from 'react';
import { getEmptyStateMessage } from '../utils/copySystem';

interface EmptyStateProps {
  category: string;
  icon: ReactNode;
}

export default function EmptyState({ category, icon }: EmptyStateProps) {
  const copy = getEmptyStateMessage(category);

  return (
    <div className="animate-empty-state flex flex-col items-center justify-center px-6 py-14 text-center sm:px-8 sm:py-16">
      <div className="surface-panel-soft empty-state-icon-float mb-5 flex h-18 w-18 items-center justify-center rounded-[var(--gw-radius-xl)] border border-[rgba(143,128,246,0.12)] bg-[rgba(115,83,230,0.08)] text-[var(--gw-brand-300)] shadow-[var(--gw-glow-intelligence-soft)]">
        {icon}
      </div>

      <div className="max-w-[34rem]">
        <p className="eyebrow mb-3">Nothing to show yet</p>
        <h3 className="mb-3 text-[clamp(1.5rem,2vw,2rem)] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
          {copy.title}
        </h3>
        <p className="mx-auto mb-4 max-w-[30rem] text-[var(--text-secondary)]">
          {copy.subtitle}
        </p>
        <p className="mx-auto max-w-[28rem] text-sm leading-relaxed text-[var(--text-muted)]">
          {copy.hint}
        </p>
      </div>
    </div>
  );
}
