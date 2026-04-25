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
    <div className="mb-lg flex gap-1 bg-neutral-bg dark:bg-dark-bg border border-neutral-border dark:border-dark-border p-1 rounded-xl w-fit">
      <button
        type="button"
        onClick={onShowNew}
        className={`flex items-center px-4 py-2 rounded-lg text-body-sm font-medium transition-all ${
          !showHistory
            ? 'bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text shadow-soft border border-neutral-border dark:border-dark-border'
            : 'text-neutral-muted dark:text-dark-muted hover:text-neutral-text dark:hover:text-dark-text'
        }`}
      >
        {newIcon}
        {newLabel}
      </button>
      <button
        type="button"
        onClick={onShowHistory}
        className={`flex items-center px-4 py-2 rounded-lg text-body-sm font-medium transition-all ${
          showHistory
            ? 'bg-neutral-surface dark:bg-dark-surface text-neutral-text dark:text-dark-text shadow-soft border border-neutral-border dark:border-dark-border'
            : 'text-neutral-muted dark:text-dark-muted hover:text-neutral-text dark:hover:text-dark-text'
        }`}
      >
        {historyIcon}
        {historyLabel}
      </button>
    </div>
  );
}
