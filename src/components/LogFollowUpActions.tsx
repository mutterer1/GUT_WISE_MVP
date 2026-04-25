import { ArrowRight, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import type { LogFollowUpAction } from '../services/logFollowUpService';

interface LogFollowUpActionsProps {
  title?: string;
  summary: string;
  actions: LogFollowUpAction[];
  onDismiss: () => void;
}

export default function LogFollowUpActions({
  title = 'Keep the chain going',
  summary,
  actions,
  onDismiss,
}: LogFollowUpActionsProps) {
  const navigate = useNavigate();

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="surface-panel-soft rounded-[24px] border border-[rgba(84,160,255,0.18)] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(84,160,255,0.16)] bg-[rgba(84,160,255,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-primary)]">
            <Sparkles className="h-3.5 w-3.5" />
            Next step
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">{summary}</p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] transition-smooth hover:border-white/16 hover:bg-white/[0.05] hover:text-[var(--color-text-secondary)]"
        >
          <X className="h-3.5 w-3.5" />
          Dismiss
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => navigate(action.to, { state: action.state })}
            className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-left transition-smooth hover:border-white/14 hover:bg-white/[0.05]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{action.label}</p>
              <ArrowRight className="h-4 w-4 text-[var(--color-accent-primary)]" />
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-tertiary)]">
              {action.description}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-4 sm:hidden">
        <Button type="button" variant="secondary" size="sm" className="w-full" onClick={onDismiss}>
          Dismiss next steps
        </Button>
      </div>
    </div>
  );
}