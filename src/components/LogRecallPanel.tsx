import Button from './Button';

export interface LogRecallItem {
  id: string;
  title: string;
  subtitle: string;
}

interface LogRecallPanelProps {
  hasStoredDraft: boolean;
  draftUpdatedAt: string | null;
  draftLabel?: string;
  recentItems: LogRecallItem[];
  onDiscardDraft: () => void;
  onUseRecent: (id: string) => void;
}

function formatDraftTimestamp(value: string | null) {
  if (!value) {
    return 'Saved locally on this device.';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Saved locally on this device.';
  }

  return `Saved locally ${parsed.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })} at ${parsed.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}.`;
}

export default function LogRecallPanel({
  hasStoredDraft,
  draftUpdatedAt,
  draftLabel = 'Draft restored from this device.',
  recentItems,
  onDiscardDraft,
  onUseRecent,
}: LogRecallPanelProps) {
  if (!hasStoredDraft && recentItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {hasStoredDraft ? (
        <div className="surface-panel-quiet rounded-[24px] border border-[rgba(84,160,255,0.18)] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {draftLabel}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
                {formatDraftTimestamp(draftUpdatedAt)}
              </p>
            </div>

            <Button type="button" variant="secondary" size="sm" onClick={onDiscardDraft}>
              Discard Draft
            </Button>
          </div>
        </div>
      ) : null}

      {recentItems.length > 0 ? (
        <div className="surface-panel-soft rounded-[24px] p-4 sm:p-5">
          <div className="mb-3">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Repeat recent</p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-tertiary)]">
              Start from a recent entry instead of rebuilding it from scratch.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recentItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onUseRecent(item.id)}
                className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-left transition-smooth hover:border-white/14 hover:bg-white/[0.05]"
              >
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">
                  {item.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}