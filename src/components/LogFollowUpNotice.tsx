import { Link2, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getFollowUpSourceLabel,
  type LogFollowUpState,
} from '../services/logFollowUpService';

interface LogFollowUpNoticeProps {
  followUp: LogFollowUpState | null;
}

export default function LogFollowUpNotice({ followUp }: LogFollowUpNoticeProps) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!followUp) {
    return null;
  }

  const dismiss = () => {
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      { replace: true, state: null }
    );
  };

  return (
    <div className="surface-panel-quiet rounded-[24px] border border-[rgba(84,160,255,0.18)] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(84,160,255,0.16)] bg-[rgba(84,160,255,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-primary)]">
            <Link2 className="h-3.5 w-3.5" />
            Continuing from {getFollowUpSourceLabel(followUp.context.sourceType)}
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
            {followUp.context.sourceTitle}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
            {followUp.context.sourceSummary}
          </p>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] transition-smooth hover:border-white/16 hover:bg-white/[0.05] hover:text-[var(--color-text-secondary)]"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>
    </div>
  );
}