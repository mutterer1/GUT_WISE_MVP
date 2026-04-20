import { ReactNode } from 'react';
import { getEmptyStateMessage } from '../utils/copySystem';

interface EmptyStateProps {
  category: string;
  icon: ReactNode;
}

export default function EmptyState({ category, icon }: EmptyStateProps) {
  const copy = getEmptyStateMessage(category);

  return (
    <div className="animate-empty-state flex flex-col items-center justify-center px-6 py-12 text-center sm:px-8 sm:py-14">
      <div className="surface-panel-soft empty-state-icon-float mb-6 flex h-[76px] w-[76px] items-center justify-center rounded-[24px] border border-[rgba(143,128,246,0.12)] bg-[rgba(115,83,230,0.08)] text-[var(--gw-brand-300)] shadow-[var(--gw-glow-intelligence-soft)]">
        {icon}
      </div>

      <div className="max-w-[38rem]">
        <p className="eyebrow mb-3">Nothing to show yet</p>

        <h3 className="text-[clamp(1.55rem,2vw,2rem)] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
          {copy.title}
        </h3>

        <p className="mx-auto mt-4 max-w-[31rem] text-sm leading-7 text-[var(--text-secondary)]">
          {copy.subtitle}
        </p>

        <div className="mx-auto mt-6 max-w-[30rem] rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Next step
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{copy.hint}</p>
        </div>
      </div>
    </div>
  );
}
