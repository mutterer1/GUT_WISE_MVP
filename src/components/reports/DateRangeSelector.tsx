import { Calendar, Clock3 } from 'lucide-react';
import Button from '../Button';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

function getRangeDayCount(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
}

function formatRangeSummary(startDate: string, endDate: string): string {
  const dayCount = getRangeDayCount(startDate, endDate);
  return `${dayCount} day${dayCount === 1 ? '' : 's'} selected`;
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

    onDateRangeChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  const dayCount = getRangeDayCount(startDate, endDate);

  return (
    <div className="surface-panel-soft rounded-[28px] p-5 sm:p-6 print:border-0 print:bg-transparent print:p-0">
      <div className="flex flex-col gap-5 border-b border-white/8 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]">
              <Calendar className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-primary)]">
                Report Period
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                Set the clinical review window
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Choose the exact period used for the summary, evidence sections, and any exported
                report output below.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="surface-panel-quiet inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs text-[var(--color-text-secondary)]">
            <Clock3 className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" />
            <span>{formatRangeSummary(startDate, endDate)}</span>
          </div>
          <div className="surface-panel-quiet inline-flex rounded-full px-3.5 py-2 text-xs text-[var(--color-text-secondary)]">
            {dayCount >= 30 ? 'Longitudinal view' : 'Short-window review'}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onDateRangeChange(e.target.value, endDate)}
            className="w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-smooth focus:border-[rgba(84,160,255,0.32)] focus:bg-[rgba(255,255,255,0.06)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onDateRangeChange(startDate, e.target.value)}
            className="w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-smooth focus:border-[rgba(84,160,255,0.32)] focus:bg-[rgba(255,255,255,0.06)]"
          />
        </div>
      </div>

      <div className="mt-5 border-t border-white/8 pt-5 print:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--color-text-tertiary)]">Quick ranges</p>

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
    </div>
  );
}
