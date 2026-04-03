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
        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center"
        style={{ animation: 'emptyStateIconFloat 3s ease-in-out infinite' }}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{copy.title}</h3>
      <p className="text-sm text-gray-500 mb-3 max-w-xs mx-auto leading-relaxed">
        {copy.subtitle}
      </p>
      <p className="text-xs text-gray-400 max-w-xs mx-auto">{copy.hint}</p>
    </div>
  );
}
