interface LogModeTabsProps {
  showHistory: boolean;
  onShowNew: () => void;
  onShowHistory: () => void;
  newIcon?: React.ReactNode;
  historyIcon?: React.ReactNode;
  newLabel?: string;
  historyLabel?: string;
}

export default function LogModeTabs({
  showHistory,
  onShowNew,
  onShowHistory,
  newIcon,
  historyIcon,
  newLabel = 'New Entry',
  historyLabel = 'History',
}: LogModeTabsProps) {
  return (
    <div className="mb-5 surface-panel-quiet flex w-full flex-col gap-1 rounded-[24px] p-1.5 sm:inline-flex sm:w-auto sm:flex-row">
      <button
        type="button"
        onClick={onShowNew}
        aria-pressed={!showHistory}
        className={`flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition-smooth ${
          !showHistory
            ? 'border border-[rgba(84,160,255,0.16)] bg-[rgba(84,160,255,0.12)] text-[var(--color-text-primary)] shadow-[0_0_0_1px_rgba(84,160,255,0.08)]'
            : 'text-[var(--color-text-tertiary)] hover:bg-white/[0.04] hover:text-[var(--color-text-secondary)]'
        }`}
      >
        {newIcon}
        {newLabel}
      </button>
      <button
        type="button"
        onClick={onShowHistory}
        aria-pressed={showHistory}
        className={`flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition-smooth ${
          showHistory
            ? 'border border-[rgba(84,160,255,0.16)] bg-[rgba(84,160,255,0.12)] text-[var(--color-text-primary)] shadow-[0_0_0_1px_rgba(84,160,255,0.08)]'
            : 'text-[var(--color-text-tertiary)] hover:bg-white/[0.04] hover:text-[var(--color-text-secondary)]'
        }`}
      >
        {historyIcon}
        {historyLabel}
      </button>
    </div>
  );
}
