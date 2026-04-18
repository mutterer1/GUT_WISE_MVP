import { Calendar } from 'lucide-react';
import Button from '../Button';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

function formatRangeSummary(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return `${Math.max(1, dayCount)} day${Math.max(1, dayCount) === 1 ? '' : 's'} selected`;
}

export default function DateRangeSelector({
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangeSelectorProps) {
  const handlePresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    onDateRangeChange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 print:border-0 print:p-0 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <Calendar className="mt-0.5 h-5 w-5 text-gray-700 dark:text-gray-300" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Report Period
            </h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Choose the time window used for the summary and supporting detail below.
            </p>
          </div>
        </div>

        <div className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/[0.06] dark:text-gray-400 sm:block">
          {formatRangeSummary(startDate, endDate)}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onDateRangeChange(e.target.value, endDate)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#4A8FA8] dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onDateRangeChange(startDate, e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#4A8FA8] dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white"
          />
        </div>
      </div>

      <div className="print:hidden">
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Quick select</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePresetRange(7)}>
            Last 7 Days
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePresetRange(30)}>
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePresetRange(90)}>
            Last 90 Days
          </Button>
        </div>
      </div>
    </div>
  );
}
