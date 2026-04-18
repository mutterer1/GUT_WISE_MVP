import { useState, useEffect } from 'react';
import { Printer, Download, FileText, ClipboardList, MessageSquare, Loader2 } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import TrustExplainer from '../components/TrustExplainer';
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
        concerns.push(`Bowel movement frequency was recorded at ${bmAnalytics.averagePerDay.toFixed(1)}/day on average - worth discussing with your clinician`);
      } else if (bmAnalytics.averagePerDay < 1) {
        concerns.push(`Bowel movement frequency appeared around ${bmAnalytics.averagePerDay.toFixed(1)}/day on average during this period`);
      }
    }

    const normalBristol = bristolDistribution.filter(d => d.type === 3 || d.type === 4);
    const normalPercentage = normalBristol.reduce((sum, d) => sum + d.percentage, 0);
    if (bristolDistribution.length > 0 && normalPercentage < 40) {
      concerns.push(`${normalPercentage.toFixed(0)}% of logged stools were recorded as Bristol types 3 or 4 during this period`);
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
      concerns.push(`Severity trended upward for: ${uniqueSymptoms.join(', ')}`);
    }

    if (triggerPatterns.length > 0) {
      const highRiskTriggers = triggerPatterns.filter(t => t.correlationStrength > 0.6);
      if (highRiskTriggers.length > 0) {
        concerns.push(`Repeated overlap between symptoms and these dietary entries was recorded: ${highRiskTriggers.map(t => t.trigger).slice(0, 3).join(', ')}`);
      }
    }

    return concerns;
  };

  const SectionGroupLabel = ({ label, accent = false }: { label: string; accent?: boolean }) => (
    <div className="flex items-center gap-3 mb-md px-0.5 print:hidden">
      <span className={`text-xs font-semibold uppercase tracking-widest flex-shrink-0 ${
        accent ? 'text-brand-500' : 'text-neutral-muted dark:text-dark-muted'
      }`}>
        {label}
      </span>
      <div className={`flex-1 h-px ${accent ? 'bg-brand-500/25' : 'bg-neutral-border dark:bg-dark-border'}`} />
    </div>
  );

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 print:p-8 max-w-5xl mx-auto">

        <div className="mb-lg print:hidden">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h1 className="text-h4 font-sora font-semibold text-neutral-text dark:text-dark-text">
                Health Summary Report
              </h1>
              <p className="text-body-sm text-neutral-muted dark:text-dark-muted mt-0.5">
                A summary of your tracked data, ready to share with your care team
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

        <div className="mb-lg print:hidden">
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        <TrustExplainer variant="reports" className="mb-lg print:hidden" />

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
          <div className="flex h-72 flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
            <p className="text-body-sm text-neutral-muted dark:text-dark-muted">Compiling report data…</p>
          </div>
        )}

        {error && (
          <div className="mb-md flex items-start gap-3 rounded-xl border border-signal-500/30 bg-signal-500/10 p-md">
            <p className="text-body-sm text-signal-700 dark:text-signal-300 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && !bmAnalytics && (
          <div
            className="rounded-2xl border border-neutral-border dark:border-dark-border bg-neutral-surface dark:bg-dark-surface p-12 text-center shadow-soft"
            style={{ animation: 'emptyStateFadeIn 0.4s ease-out both' }}
          >
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 dark:bg-brand-500/12 flex items-center justify-center mx-auto mb-md">
              <ClipboardList className="h-6 w-6 text-brand-500" />
            </div>
            <p className="text-body-md font-semibold text-neutral-text dark:text-dark-text mb-1">No bowel movement logs found</p>
            <p className="text-body-sm text-neutral-muted dark:text-dark-muted max-w-sm mx-auto leading-relaxed">
              Reports require at least one bowel movement log in the selected period. Try a different date range or continue logging daily.
            </p>
          </div>
        )}

        {!loading && !error && bmAnalytics && (
          <>
            <SectionGroupLabel label="Key Findings" accent />

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

            <SectionGroupLabel label="Supporting Detail" />

            <BMAnalyticsSection analytics={bmAnalytics} />

            <BristolDistributionSection distribution={bristolDistribution} />

            <SymptomProgressionSection trends={symptomTrends} />

            <HealthMarkersSection correlations={healthMarkers} />

            <TriggerPatternsSection triggers={triggerPatterns} />

            <MedicationCorrelationSection correlations={medicationCorrelations} />

            <div className="bg-neutral-surface dark:bg-dark-surface border border-neutral-border dark:border-dark-border rounded-2xl p-6 mt-6 print:mt-10">
              <div className="flex items-center gap-2 mb-md pb-3 border-b border-neutral-border dark:border-dark-border">
                <MessageSquare className="h-4 w-4 text-brand-500" />
                <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest">Suggested Discussion Points</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-neutral-bg dark:bg-dark-elevated rounded-xl p-4">
                  <p className="text-xs font-semibold text-neutral-text dark:text-dark-text mb-1">Pattern review</p>
                  <p className="text-xs text-neutral-muted dark:text-dark-muted leading-relaxed">
                    Discuss observed trends and flagged patterns with your gastroenterologist for clinical context.
                  </p>
                </div>
                <div className="bg-neutral-bg dark:bg-dark-elevated rounded-xl p-4">
                  <p className="text-xs font-semibold text-neutral-text dark:text-dark-text mb-1">Follow-up timeline</p>
                  <p className="text-xs text-neutral-muted dark:text-dark-muted leading-relaxed">
                    Reassessment after 4–6 weeks can help evaluate whether symptoms or patterns have changed.
                  </p>
                </div>
                <div className="bg-neutral-bg dark:bg-dark-elevated rounded-xl p-4">
                  <p className="text-xs font-semibold text-neutral-text dark:text-dark-text mb-1">Diagnostics</p>
                  <p className="text-xs text-neutral-muted dark:text-dark-muted leading-relaxed">
                    Your clinician may recommend additional testing (labs, imaging) based on patterns shown here.
                  </p>
                </div>
                <div className="bg-neutral-bg dark:bg-dark-elevated rounded-xl p-4">
                  <p className="text-xs font-semibold text-neutral-text dark:text-dark-text mb-1">Continued logging</p>
                  <p className="text-xs text-neutral-muted dark:text-dark-muted leading-relaxed">
                    Systematic tracking improves the accuracy of pattern detection over time.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-bg dark:bg-dark-surface border border-neutral-border dark:border-dark-border rounded-xl p-md mt-4 print:mt-6">
              <p className="text-xs text-neutral-muted dark:text-dark-muted leading-relaxed">
                <span className="font-medium text-neutral-text dark:text-dark-text">Notice:</span>{' '}
                This report is compiled from patient-reported data and is intended to support clinical conversation — it does not constitute a medical diagnosis or treatment recommendation.
                All clinical decisions should be made by qualified healthcare professionals based on comprehensive assessment and appropriate testing.
              </p>
            </div>

            <div className="text-center text-xs text-neutral-muted dark:text-dark-muted mt-6 print:mt-10 pb-4">
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
