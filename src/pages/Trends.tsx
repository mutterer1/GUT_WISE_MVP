import { useMemo, useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Download,
  Loader2,
  Activity,
  Droplet,
  Moon,
  Brain,
  FileText,
} from 'lucide-react';
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
    <div className="flex min-h-screen bg-neutral-bg">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-md sm:p-lg lg:p-lg pt-16 sm:pt-16 lg:pt-0">
        <div className="mx-auto max-w-7xl space-y-6 pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-3 shadow-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trends & Analytics</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Visualize patterns across bowel activity, symptoms, sleep, stress, and hydration.
                </p>
              </div>
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
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Time Period</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {timeRanges.map((range) => (
                  <button
                    key={range.days}
                    onClick={() => setSelectedRange(range)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all ${
                      selectedRange.days === range.days
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.08] border border-transparent dark:border-white/[0.08]'
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
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics data...</span>
              </div>
            </Card>
          )}

          {error && (
            <Card>
              <div className="py-12 text-center">
                <p className="font-medium text-red-600">{error}</p>
              </div>
            </Card>
          )}

          {data && !loading && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  icon={<Activity className="h-5 w-5 text-teal-600" />}
                  label="Bowel Movements"
                  value={String(summaryStats.totalBMs)}
                  helper={`Across ${selectedRange.label.toLowerCase()}`}
                />

                <SummaryCard
                  icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
                  label="Ideal Bristol Types"
                  value={String(summaryStats.idealBristolCount)}
                  helper="Type 3–4 entries"
                />

                <SummaryCard
                  icon={<Brain className="h-5 w-5 text-red-500" />}
                  label="Avg Symptom Severity"
                  value={
                    summaryStats.avgSymptomSeverity !== null
                      ? summaryStats.avgSymptomSeverity.toFixed(1)
                      : '—'
                  }
                  helper="From tracked symptom entries"
                />

                <SummaryCard
                  icon={<Droplet className="h-5 w-5 text-cyan-600" />}
                  label="Hydration Data Points"
                  value={String(summaryStats.hydrationEntries)}
                  helper="Used in hydration analysis"
                />
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-100 dark:border-blue-900/30">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    What to look for in your trends
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
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

              <Card className="print:break-inside-avoid bg-gradient-to-br from-blue-600 to-green-600 text-white">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">How to use this page</h3>

                  <div className="space-y-2 text-sm opacity-95">
                    <p>
                      Compare symptom spikes with sleep, hydration, and stress patterns to spot
                      repeated contributors.
                    </p>
                    <p>
                      Bring exported or printed summaries to healthcare appointments for more
                      informed conversations.
                    </p>
                    <p>
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
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        </div>

        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{helper}</p>
        </div>
      </div>
    </Card>
  );
}
