import { useMemo, useState } from 'react';
import {
  Calendar,
  Download,
  Droplet,
  FileText,
  Loader2,
  TrendingUp,
  Waves as Wave,
  Frown,
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useTrendsData, TimeRange } from '../hooks/useTrendsData';
import BMFrequencyChart from '../components/trends/BMFrequencyChart';
import BristolDistributionChart from '../components/trends/BristolDistributionChart';
import SymptomIntensityChart from '../components/trends/SymptomIntensityChart';
import HydrationCorrelationChart from '../components/trends/HydrationCorrelationChart';
import SleepSymptomChart from '../components/trends/SleepSymptomChart';
import StressUrgencyChart from '../components/trends/StressUrgencyChart';

const timeRanges: TimeRange[] = [
  { days: 7, label: '7 Days' },
  { days: 14, label: '14 Days' },
  { days: 30, label: '30 Days' },
];

export default function Trends() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(timeRanges[0]);
  const { data, loading, error } = useTrendsData(selectedRange);

  const summaryStats = useMemo(() => {
    if (!data) {
      return {
        totalBMs: 0,
        idealBristolCount: 0,
        avgSymptomSeverity: null as number | null,
        waterGoalDays: 0,
      };
    }

    const totalBMs = Array.isArray(data.bmFrequency)
      ? data.bmFrequency.reduce((sum: number, item: any) => {
          const value =
            typeof item?.count === 'number'
              ? item.count
              : typeof item?.value === 'number'
                ? item.value
                : 0;
          return sum + value;
        }, 0)
      : 0;

    const idealBristolCount = Array.isArray(data.bristolDistribution)
      ? data.bristolDistribution.reduce((sum: number, item: any) => {
          const scale = item?.scale ?? item?.type ?? item?.bristol_type ?? item?.label;
          const count =
            typeof item?.count === 'number'
              ? item.count
              : typeof item?.value === 'number'
                ? item.value
                : 0;

          return scale === 3 || scale === 4 || scale === '3' || scale === '4'
            ? sum + count
            : sum;
        }, 0)
      : 0;

    const avgSymptomSeverity =
      Array.isArray(data.symptomTrends) && data.symptomTrends.length > 0
        ? (() => {
            const values = data.symptomTrends
              .map((item: any) =>
                typeof item?.severity === 'number'
                  ? item.severity
                  : typeof item?.value === 'number'
                    ? item.value
                    : null
              )
              .filter((value: number | null) => value !== null) as number[];

            if (values.length === 0) return null;
            return values.reduce((sum, value) => sum + value, 0) / values.length;
          })()
        : null;

    const waterGoalDays = Array.isArray(data.hydrationCorrelation)
      ? data.hydrationCorrelation.filter((item) => item.totalHydration > 0).length
      : 0;

    return {
      totalBMs,
      idealBristolCount,
      avgSymptomSeverity,
      waterGoalDays,
    };
  }, [data]);

  const handleExport = () => {
    if (!data) return;

    const exportData = {
      period: `${selectedRange.days} days`,
      exportedAt: new Date().toISOString(),
      data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-trends-${selectedRange.days}days-${
      new Date().toISOString().split('T')[0]
    }.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="page-enter surface-panel rounded-[32px] p-5 sm:p-6 lg:p-8">
          <div className="page-header items-start justify-between gap-5">
            <div className="max-w-3xl">
              <span className="badge-secondary mb-3 inline-flex">Trend Analysis</span>
              <h1 className="page-title">Trends & Analytics</h1>
              <p className="page-subtitle mt-2">
                Visualize how bowel activity, symptoms, water intake, sleep, and stress move together
                over time.
              </p>
            </div>

            <div className="print:hidden flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleExport}
                disabled={loading || !data}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>

              <Button
                onClick={handlePrint}
                disabled={loading || !data}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Print Report
              </Button>
            </div>
          </div>
        </section>

        <Card variant="elevated" className="print:hidden rounded-[28px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
              <Calendar className="h-5 w-5 text-[var(--color-accent-primary)]" />
              <span className="text-sm font-medium">Time Period</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {timeRanges.map((range) => (
                <button
                  key={range.days}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-medium transition-smooth',
                    selectedRange.days === range.days
                      ? 'bg-[var(--color-accent-primary)] text-white shadow-[0_14px_30px_rgba(62,111,255,0.24)]'
                      : 'border border-white/10 bg-white/[0.03] text-[var(--color-text-secondary)] hover:bg-white/[0.05] hover:text-[var(--color-text-primary)]',
                  ].join(' ')}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {loading && (
          <Card variant="elevated" className="rounded-[28px]">
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent-primary)]" />
              <span className="ml-3 text-sm text-[var(--color-text-tertiary)]">
                Loading analytics data...
              </span>
            </div>
          </Card>
        )}

        {error && (
          <Card variant="elevated" className="rounded-[28px]">
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>
            </div>
          </Card>
        )}

        {data && !loading && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                icon={<Wave className="h-5 w-5 text-[var(--color-warning)]" />}
                label="Bowel Movements"
                value={String(summaryStats.totalBMs)}
                helper={`Across ${selectedRange.label.toLowerCase()}`}
              />

              <SummaryCard
                icon={<TrendingUp className="h-5 w-5 text-[var(--color-accent-primary)]" />}
                label="Ideal Bristol Types"
                value={String(summaryStats.idealBristolCount)}
                helper="Type 3–4 entries"
              />

              <SummaryCard
                icon={<Frown className="h-5 w-5 text-[var(--color-danger)]" />}
                label="Avg Symptom Severity"
                value={
                  summaryStats.avgSymptomSeverity !== null
                    ? summaryStats.avgSymptomSeverity.toFixed(1)
                    : '—'
                }
                helper="From tracked symptom entries"
              />

              <SummaryCard
                icon={<Droplet className="h-5 w-5 text-[var(--color-accent-primary)]" />}
                label="Water-Goal Days"
                value={String(summaryStats.waterGoalDays)}
                helper="Days with water-goal credit"
              />
            </div>

            <Card variant="discovery" className="rounded-[28px]">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                  What to look for in your trends
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Focus on repeated patterns rather than one-off spikes. The most useful signals
                  usually show up when food, water, stress, sleep, and symptoms are logged
                  consistently over time.
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card variant="elevated" className="print:break-inside-avoid rounded-[28px]">
                <BMFrequencyChart data={data.bmFrequency} />
              </Card>

              <Card variant="elevated" className="print:break-inside-avoid rounded-[28px]">
                <BristolDistributionChart data={data.bristolDistribution} />
              </Card>
            </div>

            <Card variant="elevated" className="print:break-inside-avoid rounded-[28px]">
              <SymptomIntensityChart data={data.symptomTrends} />
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card variant="elevated" className="print:break-inside-avoid rounded-[28px]">
                <HydrationCorrelationChart data={data.hydrationCorrelation} />
              </Card>

              <Card variant="elevated" className="print:break-inside-avoid rounded-[28px]">
                <SleepSymptomChart data={data.sleepSymptomCorrelation} />
              </Card>
            </div>

            <Card variant="elevated" className="print:break-inside-avoid rounded-[28px]">
              <StressUrgencyChart data={data.stressUrgencyCorrelation} />
            </Card>

            <Card variant="flat" className="print:break-inside-avoid rounded-[28px]">
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                  How to use this page
                </h3>

                <div className="space-y-2">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Compare symptom spikes with sleep, water-goal progress, and stress patterns to spot
                    repeated contributors.
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Bring exported or printed summaries to healthcare appointments for more informed
                    conversations.
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    These visualizations are informational and should support, not replace,
                    clinical judgment.
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card variant="elevated" className="print:break-inside-avoid rounded-[24px]">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm font-medium text-[var(--color-text-tertiary)]">{label}</p>
        </div>

        <div>
          <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
            {value}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{helper}</p>
        </div>
      </div>
    </Card>
  );
}
