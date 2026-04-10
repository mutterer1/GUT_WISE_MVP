import { ReactNode } from 'react';
import { getEmptyStateMessage } from '../utils/copySystem';

interface EmptyStateProps {
  category: string;
  icon: ReactNode;
}

export default function EmptyState({ category, icon }: EmptyStateProps) {
  const copy = getEmptyStateMessage(category);

  return (
    <div
      className="py-12 px-4 text-center"
      style={{ animation: 'emptyStateFadeIn 0.4s ease-out both' }}
    >
      <div
        className="w-16 h-16 mx-auto mb-md rounded-2xl bg-neutral-bg dark:bg-dark-elevated flex items-center justify-center"
        style={{ animation: 'emptyStateIconFloat 3s ease-in-out infinite' }}
      >
        {icon}
      </div>
      <h3 className="text-body-md font-semibold text-neutral-text dark:text-dark-text mb-1">{copy.title}</h3>
      <p className="text-body-sm text-neutral-muted dark:text-dark-muted mb-3 max-w-xs mx-auto leading-relaxed">
        {copy.subtitle}
      </p>
      <p className="text-body-xs text-neutral-muted dark:text-dark-muted max-w-xs mx-auto">{copy.hint}</p>
    </div>
  );
}
