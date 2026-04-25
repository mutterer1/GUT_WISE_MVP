import { ArrowRight, Lightbulb } from 'lucide-react';
import Button from './Button';
import type { LogQualityHint } from '../utils/logQualityHints';

interface LogQualityNudgesProps {
  hints: LogQualityHint[];
  onApplyHint?: (id: string) => void;
}

export default function LogQualityNudges({
  hints,
  onApplyHint,
}: LogQualityNudgesProps) {
  if (hints.length === 0) {
    return null;
  }

  return (
    <div className="surface-panel-soft rounded-[24px] border border-[rgba(255,170,92,0.18)] p-4 sm:p-5">
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,170,92,0.16)] bg-[rgba(255,170,92,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-warning)]">
          <Lightbulb className="h-3.5 w-3.5" />
          Helpful next detail
        </div>
        <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
          You can save now, but one of these details would make the entry more useful later.
        </p>
      </div>

      <div className="space-y-3">
        {hints.map((hint) => (
          <div
            key={hint.id}
            className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {hint.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                  {hint.description}
                </p>
              </div>

              {hint.actionLabel && onApplyHint ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => onApplyHint(hint.id)}
                >
                  <ArrowRight className="h-4 w-4" />
                  {hint.actionLabel}
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}