import { useState, useEffect } from 'react';
import { Printer, Download, FileText, ClipboardList } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import DateRangeSelector from '../components/reports/DateRangeSelector';
import ExecutiveSummary from '../components/reports/ExecutiveSummary';
import BMAnalyticsSection from '../components/reports/BMAnalyticsSection';
import BristolDistributionSection from '../components/reports/BristolDistributionSection';
import SymptomProgressionSection from '../components/reports/SymptomProgressionSection';
import HealthMarkersSection from '../components/reports/HealthMarkersSection';
import TriggerPatternsSection from '../components/reports/TriggerPatternsSection';
import MedicationCorrelationSection from '../components/reports/MedicationCorrelationSection';
import ClinicalAlertsSection from '../components/reports/ClinicalAlertsSection';
import {
  fetchBMAnalytics,
  fetchBristolDistribution,
  fetchSymptomTrends,
  fetchHealthMarkerCorrelation,
  fetchTriggerPatterns,
  fetchMedicationCorrelation,
  generateClinicalAlerts,
  BMAnalytics,
  BristolDistribution,
  SymptomTrend,
  HealthMarkerCorrelation,
  TriggerPattern,
  MedicationCorrelation,
  ClinicalAlert,
} from '../utils/clinicalReportQueries';

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [bmAnalytics, setBmAnalytics] = useState<BMAnalytics | null>(null);
  const [bristolDistribution, setBristolDistribution] = useState<BristolDistribution[]>([]);
  const [symptomTrends, setSymptomTrends] = useState<SymptomTrend[]>([]);
  const [healthMarkers, setHealthMarkers] = useState<HealthMarkerCorrelation[]>([]);
  const [triggerPatterns, setTriggerPatterns] = useState<TriggerPattern[]>([]);
  const [medicationCorrelations, setMedicationCorrelations] = useState<MedicationCorrelation[]>([]);
  const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlert[]>([]);

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, startDate, endDate]);

  const loadReportData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const dateRange = { startDate, endDate };

      const [
        analytics,
        distribution,
        trends,
        markers,
        triggers,
        medications,
        alerts,
      ] = await Promise.all([
        fetchBMAnalytics(user.id, dateRange),
        fetchBristolDistribution(user.id, dateRange),
        fetchSymptomTrends(user.id, dateRange),
        fetchHealthMarkerCorrelation(user.id, dateRange),
        fetchTriggerPatterns(user.id, dateRange),
        fetchMedicationCorrelation(user.id, dateRange),
        generateClinicalAlerts(user.id, dateRange),
      ]);

      setBmAnalytics(analytics);
      setBristolDistribution(distribution);
      setSymptomTrends(trends);
      setHealthMarkers(markers);
      setTriggerPatterns(triggers);
      setMedicationCorrelations(medications);
      setClinicalAlerts(alerts);
    } catch (err) {
      console.error('Error loading report data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const formatDateRange = () => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const end = new Date(endDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} – ${end}`;
  };

  const getDayCount = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getPrimaryConcerns = (): string[] => {
    const concerns: string[] = [];

    if (bmAnalytics) {
      if (bmAnalytics.averagePerDay > 6) {
        concerns.push(`Elevated bowel movement frequency (${bmAnalytics.averagePerDay.toFixed(1)}/day) exceeding normal physiological range`);
      } else if (bmAnalytics.averagePerDay < 1) {
        concerns.push(`Reduced bowel movement frequency (${bmAnalytics.averagePerDay.toFixed(1)}/day) suggesting constipation`);
      }
    }

    const normalBristol = bristolDistribution.filter(d => d.type === 3 || d.type === 4);
    const normalPercentage = normalBristol.reduce((sum, d) => sum + d.percentage, 0);
    if (bristolDistribution.length > 0 && normalPercentage < 40) {
      concerns.push(`Stool consistency abnormalities with only ${normalPercentage.toFixed(0)}% within normal Bristol Scale parameters`);
    }

    const worseningSymptoms = symptomTrends.filter(t => {
      const symptomData = symptomTrends.filter(st => st.symptomType === t.symptomType).sort((a, b) => a.date.localeCompare(b.date));
      if (symptomData.length < 2) return false;
      const first = symptomData[0].avgSeverity;
      const last = symptomData[symptomData.length - 1].avgSeverity;
      return last - first > 1;
    });

    if (worseningSymptoms.length > 0) {
      const uniqueSymptoms = Array.from(new Set(worseningSymptoms.map(s => s.symptomType)));
      concerns.push(`Progressive symptom worsening noted in: ${uniqueSymptoms.join(', ')}`);
    }

    if (triggerPatterns.length > 0) {
      const highRiskTriggers = triggerPatterns.filter(t => t.correlationStrength > 0.6);
      if (highRiskTriggers.length > 0) {
        concerns.push(`Strong dietary trigger correlations identified for: ${highRiskTriggers.map(t => t.trigger).slice(0, 3).join(', ')}`);
      }
    }

    return concerns;
  };

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 print:p-8 max-w-5xl mx-auto">

        <div className="mb-6 print:hidden">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Health Summary Report
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Patient-reported data compiled for clinical review
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-4">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2 text-sm"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                onClick={handleExportPDF}
                className="flex items-center gap-2 text-sm"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6 print:hidden">
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        <div className="hidden print:block mb-8">
          <div className="border-b-2 border-gray-900 pb-5 mb-6">
            <div className="flex items-center gap-3 mb-1">
              <FileText className="h-7 w-7 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Digestive Health Summary Report</h1>
            </div>
            <p className="text-gray-600 text-sm mt-1">Patient-reported data — for clinical review purposes only</p>
            <p className="text-xs text-gray-500 mt-2">
              Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              &nbsp;·&nbsp; Coverage: {formatDateRange()} ({getDayCount()} days)
            </p>
          </div>
        </div>

        {loading && (
          <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A8FA8] mx-auto mb-4"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Compiling report data…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4 mb-6">
            <p className="text-red-800 dark:text-red-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && !bmAnalytics && (
          <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#4A8FA8]/10 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-6 w-6 text-[#4A8FA8]" />
            </div>
            <p className="text-gray-900 dark:text-white font-medium mb-1">No data for this period</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Try selecting a different date range, or continue logging to build your report.
            </p>
          </div>
        )}

        {!loading && !error && bmAnalytics && (
          <>
            <ExecutiveSummary
              dateRange={formatDateRange()}
              dayCount={getDayCount()}
              totalBMs={bmAnalytics.totalCount}
              avgPerDay={bmAnalytics.averagePerDay}
              avgPerWeek={bmAnalytics.averagePerWeek}
              criticalAlerts={clinicalAlerts.filter(a => a.severity === 'critical' || a.severity === 'high')}
              primaryConcerns={getPrimaryConcerns()}
            />

            <ClinicalAlertsSection alerts={clinicalAlerts} />

            <BMAnalyticsSection analytics={bmAnalytics} />

            <BristolDistributionSection distribution={bristolDistribution} />

            <SymptomProgressionSection trends={symptomTrends} />

            <HealthMarkersSection correlations={healthMarkers} />

            <TriggerPatternsSection triggers={triggerPatterns} />

            <MedicationCorrelationSection correlations={medicationCorrelations} />

            <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mt-6 print:mt-10">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                Suggested Discussion Points
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">Pattern review:</span>{' '}
                  Discuss the observed trends and any flagged patterns with your gastroenterologist for clinical context.
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">Follow-up:</span>{' '}
                  Reassessment after 4–6 weeks can help evaluate whether symptoms or patterns have changed.
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">Diagnostics:</span>{' '}
                  Your clinician may recommend additional testing (labs, imaging) based on the patterns shown here.
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">Continued logging:</span>{' '}
                  Systematic tracking improves the accuracy of pattern detection over time.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4 mt-4 print:mt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                <span className="font-medium text-gray-600 dark:text-gray-300">Notice:</span>{' '}
                This report is compiled from patient-reported data and is intended to support clinical conversation — it does not constitute a medical diagnosis or treatment recommendation.
                All clinical decisions should be made by qualified healthcare professionals based on comprehensive assessment and appropriate testing.
              </p>
            </div>

            <div className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6 print:mt-10 pb-4">
              <p>End of report · {formatDateRange()}</p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          body {
            background: white;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:block {
            display: block !important;
          }

          .print\\:ml-0 {
            margin-left: 0 !important;
          }

          .print\\:p-8 {
            padding: 2rem !important;
          }

          .print\\:mt-12 {
            margin-top: 3rem !important;
          }

          .print\\:mt-10 {
            margin-top: 2.5rem !important;
          }

          .print\\:mt-8 {
            margin-top: 2rem !important;
          }

          .print\\:mt-6 {
            margin-top: 1.5rem !important;
          }

          .print\\:border-0 {
            border: 0 !important;
          }

          .print\\:p-0 {
            padding: 0 !important;
          }

          @page {
            margin: 0.75in;
            size: letter;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .page-break {
            page-break-before: always;
          }
        }
      `}</style>
    </MainLayout>
  );
}
