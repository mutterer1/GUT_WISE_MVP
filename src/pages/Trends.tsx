import { useMemo, useState } from 'react';
import { TrendingUp, Calendar, Download, Loader2, Waves as Wave, Droplet, Moon, Frown, FileText, Activity } from 'lucide-react';
import Sidebar from '../components/Sidebar';
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
        hydrationEntries: 0,
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
          const scale =
            item?.scale ??
            item?.type ??
            item?.bristol_type ??
            item?.label;
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

    const hydrationEntries = Array.isArray(data.hydrationCorrelation)
      ? data.hydrationCorrelation.length
      : 0;

    return {
      totalBMs,
      idealBristolCount,
      avgSymptomSeverity,
      hydrationEntries,
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
    <div className="flex min-h-screen bg-neutral-bg dark:bg-dark-bg">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-md sm:p-lg lg:p-lg pt-16 sm:pt-16 lg:pt-lg">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="mb-1 text-h4 font-sora font-semibold text-neutral-text dark:text-dark-text">Trends & Analytics</h1>
              <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                Visualize patterns across bowel activity, symptoms, sleep, stress, and hydration.
              </p>
            </div>

            <div className="print:hidden flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
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

          <Card className="print:hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 text-neutral-text dark:text-dark-text">
                <Calendar className="h-5 w-5" />
                <span className="text-body-sm font-medium">Time Period</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {timeRanges.map((range) => (
                  <button
                    key={range.days}
                    onClick={() => setSelectedRange(range)}
                    className={`rounded-lg px-4 py-2 text-body-sm font-medium transition-all ${
                      selectedRange.days === range.days
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-neutral-bg dark:bg-dark-elevated text-neutral-text dark:text-dark-text hover:bg-neutral-border/40 dark:hover:bg-dark-surface border border-neutral-border dark:border-dark-border'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {loading && (
            <Card>
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <span className="ml-3 text-body-sm text-neutral-muted dark:text-dark-muted">Loading analytics data...</span>
              </div>
            </Card>
          )}

          {error && (
            <Card>
              <div className="py-12 text-center">
                <p className="text-body-sm font-medium text-signal-700 dark:text-signal-300">{error}</p>
              </div>
            </Card>
          )}

          {data && !loading && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  icon={<Wave className="h-6 w-5 text-orange-600" />}
                  label="Bowel Movements"
                  value={String(summaryStats.totalBMs)}
                  helper={`Across ${selectedRange.label.toLowerCase()}`}
                />

                <SummaryCard
                  icon={<TrendingUp className="h-6 w-5 text-blue-600" />}
                  label="Ideal Bristol Types"
                  value={String(summaryStats.idealBristolCount)}
                  helper="Type 3–4 entries"
                />

                <SummaryCard
                  icon={<Frown className="h-6 w-5 text-red-500" />}
                  label="Avg Symptom Severity"
                  value={
                    summaryStats.avgSymptomSeverity !== null
                      ? summaryStats.avgSymptomSeverity.toFixed(1)
                      : '—'
                  }
                  helper="From tracked symptom entries"
                />

                <SummaryCard
                  icon={<Droplet className="h-6 w-5 text-cyan-600" />}
                  label="Hydration Data Points"
                  value={String(summaryStats.hydrationEntries)}
                  helper="Used in hydration analysis"
                />
              </div>

              <Card className="border-brand-700/18 bg-brand-500/04 dark:bg-brand-500/05">
                <div className="space-y-2">
                  <h3 className="text-body-md font-semibold text-neutral-text dark:text-dark-text">
                    What to look for in your trends
                  </h3>
                  <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                    Focus on repeated patterns rather than one-off spikes. The most useful signals
                    usually show up when food, hydration, stress, sleep, and symptoms are logged
                    consistently over time.
                  </p>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="print:break-inside-avoid">
                  <BMFrequencyChart data={data.bmFrequency} />
                </Card>

                <Card className="print:break-inside-avoid">
                  <BristolDistributionChart data={data.bristolDistribution} />
                </Card>
              </div>

              <Card className="print:break-inside-avoid">
                <SymptomIntensityChart data={data.symptomTrends} />
              </Card>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="print:break-inside-avoid">
                  <HydrationCorrelationChart data={data.hydrationCorrelation} />
                </Card>

                <Card className="print:break-inside-avoid">
                  <SleepSymptomChart data={data.sleepSymptomCorrelation} />
                </Card>
              </div>

              <Card className="print:break-inside-avoid">
                <StressUrgencyChart data={data.stressUrgencyCorrelation} />
              </Card>

              <Card className="print:break-inside-avoid border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface">
                <div className="space-y-3">
                  <h3 className="text-body-md font-semibold text-neutral-text dark:text-dark-text">How to use this page</h3>

                  <div className="space-y-2">
                    <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                      Compare symptom spikes with sleep, hydration, and stress patterns to spot
                      repeated contributors.
                    </p>
                    <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                      Bring exported or printed summaries to healthcare appointments for more
                      informed conversations.
                    </p>
                    <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                      These visualizations are informational and should support — not replace —
                      clinical judgment.
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
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
    <Card className="print:break-inside-avoid">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-body-sm font-medium text-neutral-muted dark:text-dark-muted">{label}</p>
        </div>

        <div>
          <p className="text-2xl font-bold text-neutral-text dark:text-dark-text">{value}</p>
          <p className="mt-1 text-body-xs text-neutral-muted dark:text-dark-muted">{helper}</p>
        </div>
      </div>
    </Card>
  );
}
