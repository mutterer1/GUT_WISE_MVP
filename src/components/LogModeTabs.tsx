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
    <div className="mb-6 flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
      <button
        type="button"
        onClick={onShowNew}
        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          !showHistory
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {newIcon}
        {newLabel}
      </button>
      <button
        type="button"
        onClick={onShowHistory}
        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          showHistory
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {historyIcon}
        {historyLabel}
      </button>
    </div>
  );
}
