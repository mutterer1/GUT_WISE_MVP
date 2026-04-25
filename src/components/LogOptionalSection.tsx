import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface LogOptionalSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  summary?: string;
  children: ReactNode;
}

export default function LogOptionalSection({
  title,
  isOpen,
  onToggle,
  summary,
  children,
}: LogOptionalSectionProps) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-white/[0.02] px-4 py-3 sm:px-5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-1 text-left transition-smooth hover:text-[var(--color-text-primary)]"
      >
        <div className="min-w-0">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">{title}</span>
          <span className="ml-2 text-sm text-[var(--color-text-tertiary)]">(optional)</span>
          {summary ? (
            <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">{summary}</p>
          ) : null}
        </div>

        {isOpen ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 text-[var(--color-text-tertiary)]" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-[var(--color-text-tertiary)]" />
        )}
      </button>

      {isOpen ? <div className="mt-5 space-y-6 border-t border-white/8 pt-5">{children}</div> : null}
    </div>
  );
}