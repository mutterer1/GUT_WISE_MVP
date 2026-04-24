import { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  FileText,
  CalendarRange,
  MessageSquare,
  Loader2,
} from 'lucide-react';
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
import ObservedDataTable from '../components/reports/ObservedDataTable';
import PatternEvidenceSection from '../components/reports/PatternEvidenceSection';
import PatientNotesSection, { PatientNoteValues } from '../components/reports/PatientNotesSection';
import {
  fetchReportInsightSummary,
  type ReportInsightSummary,
} from '../services/reportInsightsService';
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
import type { ExplanationSignalSourceKind } from '../types/explanationBundle';

interface ReportEvidenceSourceSummary {
  totalFindings: number;
  totalMedicationFindings: number;
  reviewedNutritionCount: number;
  structuredIngredientCount: number;
  mixedEvidenceCount: number;
  reviewedMedicationCount: number;
  heuristicMedicationCount: number;
  heuristicCount: number;
  genericCount: number;
}

function summarizeReportEvidenceSources(
  reportInsights: ReportInsightSummary | null
): ReportEvidenceSourceSummary | null {
  const items = reportInsights?.explanationBundle.items ?? [];
  if (items.length === 0) return null;

  const counts: Record<ExplanationSignalSourceKind, number> = {
    reviewed_nutrition: 0,
    structured_ingredients: 0,
    mixed_structured_and_nutrition: 0,
    reviewed_medication_reference: 0,
    fallback_medication_heuristic: 0,
    fallback_heuristic: 0,
    generic_logs: 0,
  };

  let totalMedicationFindings = 0;

  for (const item of items) {
    counts[item.signal_source.kind] += 1;
    if (item.category === 'medication') {
      totalMedicationFindings += 1;
    }
  }

  return {
    totalFindings: items.length,
    totalMedicationFindings,
    reviewedNutritionCount: counts.reviewed_nutrition,
    structuredIngredientCount: counts.structured_ingredients,
    mixedEvidenceCount: counts.mixed_structured_and_nutrition,
    reviewedMedicationCount: counts.reviewed_medication_reference,
    heuristicMedicationCount: counts.fallback_medication_heuristic,
    heuristicCount: counts.fallback_heuristic,
    genericCount: counts.generic_logs,
  };
}

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [bmAnalytics, setBmAnalytics] = useState<BMAnalytics | null>(null);
  const [bristolDistribution, setBristolDistribution] = useState<BristolDistribution[]>([]);
  const [symptomTrends, setSymptomTrends] = useState<SymptomTrend[]>([]);
  const [healthMarkers, setHealthMarkers] = useState<HealthMarkerCorrelation[]>([]);
  const [triggerPatterns, setTriggerPatterns] = useState<TriggerPattern[]>([]);
  const [medicationCorrelations, setMedicationCorrelations] = useState<MedicationCorrelation[]>([]);
  const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlert[]>([]);
  const [reportInsights, setReportInsights] = useState<ReportInsightSummary | null>(null);
  const [patientNotes, setPatientNotes] = useState<PatientNoteValues>({
    whatChangedRecently: '',
    whatWorriesMeMost: '',
    whatIWantToAskMyDoctor: '',
  });

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
        rankedPatternSummary,
      ] =
        await Promise.all([
          fetchBMAnalytics(user.id, dateRange),
          fetchBristolDistribution(user.id, dateRange),
          fetchSymptomTrends(user.id, dateRange),
          fetchHealthMarkerCorrelation(user.id, dateRange),
          fetchTriggerPatterns(user.id, dateRange),
          fetchMedicationCorrelation(user.id, dateRange),
          generateClinicalAlerts(user.id, dateRange),
          fetchReportInsightSummary(user.id, dateRange).catch((reportInsightError) => {
            console.error('Error loading ranked report insights:', reportInsightError);
            return null;
          }),
        ]);

      setBmAnalytics(analytics);
      setBristolDistribution(distribution);
      setSymptomTrends(trends);
      setHealthMarkers(markers);
      setTriggerPatterns(triggers);
      setMedicationCorrelations(medications);
      setClinicalAlerts(alerts);
      setReportInsights(rankedPatternSummary);
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
    return `${start} - ${end}`;
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
        concerns.push(
          `Frequent bowel movements were recorded (${bmAnalytics.averagePerDay.toFixed(1)}/day) during this period`
        );
      } else if (bmAnalytics.averagePerDay < 1) {
        concerns.push(
          `Bowel movements were less frequent than usual (${bmAnalytics.averagePerDay.toFixed(1)}/day) during this period`
        );
      }
    }

    const normalBristol = bristolDistribution.filter((d) => d.type === 3 || d.type === 4);
    const normalPercentage = normalBristol.reduce((sum, d) => sum + d.percentage, 0);
    if (bristolDistribution.length > 0 && normalPercentage < 40) {
      concerns.push(
        `Only ${normalPercentage.toFixed(
          0
        )}% of logged stool entries fell in the middle Bristol range`
      );
    }

    const worseningSymptoms = symptomTrends.filter((t) => {
      const symptomData = symptomTrends
        .filter((st) => st.symptomType === t.symptomType)
        .sort((a, b) => a.date.localeCompare(b.date));
      if (symptomData.length < 2) return false;
      const first = symptomData[0].avgSeverity;
      const last = symptomData[symptomData.length - 1].avgSeverity;
      return last - first > 1;
    });

    if (worseningSymptoms.length > 0) {
      const uniqueSymptoms = Array.from(new Set(worseningSymptoms.map((s) => s.symptomType)));
      concerns.push(`Symptoms trended upward over time for: ${uniqueSymptoms.join(', ')}`);
    }

    if (triggerPatterns.length > 0) {
      const highRiskTriggers = triggerPatterns.filter((t) => t.correlationStrength > 0.6);
      if (highRiskTriggers.length > 0) {
        concerns.push(
          `Repeated food-related patterns appeared around: ${highRiskTriggers
            .map((t) => t.trigger)
            .slice(0, 3)
            .join(', ')}`
        );
      }
    }

    return concerns;
  };

  const primaryConcerns = getPrimaryConcerns();
  const reviewFlagCount = clinicalAlerts.length + primaryConcerns.length;
  const reportEvidenceSummary = summarizeReportEvidenceSources(reportInsights);

  const observedDataRows = bmAnalytics
    ? [
        {
          label: 'Tracked period',
          value: `${getDayCount()} days`,
          note: formatDateRange(),
        },
        {
          label: 'Total stool logs',
          value: String(bmAnalytics.totalCount),
          note: 'Patient-reported',
        },
        {
          label: 'Average bowel movements per day',
          value: bmAnalytics.averagePerDay.toFixed(1),
          note: 'Observed average',
        },
        {
          label: 'Average bowel movements per week',
          value: bmAnalytics.averagePerWeek.toFixed(1),
          note: 'Observed average',
        },
        {
          label: 'Review flags',
          value: String(clinicalAlerts.length),
          note: clinicalAlerts.length > 0 ? 'See flags below' : 'None in this range',
        },
        {
          label: 'Repeated patterns highlighted',
          value: String(primaryConcerns.length),
          note: primaryConcerns.length > 0 ? 'Summarized below' : 'None highlighted',
        },
      ]
    : [];

  const SectionGroupLabel = ({
    label,
    accent = false,
  }: {
    label: string;
    accent?: boolean;
  }) => (
    <div className="mb-4 flex items-center gap-3 px-0.5 print:hidden">
      <span
        className={`flex-shrink-0 text-xs font-semibold uppercase tracking-widest ${
          accent ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-tertiary)]'
        }`}
      >
        {label}
      </span>
      <div
        className={`h-px flex-1 ${
          accent ? 'bg-[rgba(84,160,255,0.25)]' : 'bg-white/8'
        }`}
      />
    </div>
  );

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl print:p-8">
        <section className="page-enter surface-panel mb-6 rounded-[32px] p-5 sm:p-6 lg:p-8 print:hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="badge-secondary mb-3 inline-flex">Clinical Report</span>
              <h1 className="page-title">Health Summary Report</h1>
              <p className="page-subtitle mt-2 max-w-2xl">
                A structured review of tracked bowel, symptom, trigger, and medication data with
                provenance-aware pattern framing for private review or clinician discussion.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <div className="surface-panel-quiet inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs text-[var(--color-text-secondary)]">
                  <CalendarRange className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" />
                  <span>{formatDateRange()}</span>
                </div>
                <div className="surface-panel-quiet inline-flex rounded-full px-3.5 py-2 text-xs text-[var(--color-text-secondary)]">
                  {getDayCount()} tracked day{getDayCount() === 1 ? '' : 's'}
                </div>
                <div className="surface-panel-quiet inline-flex rounded-full px-3.5 py-2 text-xs text-[var(--color-text-secondary)]">
                  {reviewFlagCount > 0
                    ? `${reviewFlagCount} review item${reviewFlagCount === 1 ? '' : 's'}`
                    : 'No major review flags'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button
                variant="secondary"
                onClick={handlePrint}
                className="flex items-center gap-2 text-sm"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button onClick={handleExportPDF} className="flex items-center gap-2 text-sm">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </section>

        <div className="mb-6 print:hidden">
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        <div className="mb-8 hidden print:block">
          <div className="mb-6 border-b-2 border-gray-900 pb-5">
            <div className="mb-1 flex items-center gap-3">
              <FileText className="h-7 w-7 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Digestive Health Summary Report</h1>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Patient-reported data - for clinical review purposes only
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Generated:{' '}
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              {' | '}Coverage: {formatDateRange()} ({getDayCount()} days)
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex h-72 flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--color-accent-primary)]" />
            <p className="text-sm text-[var(--color-text-tertiary)]">Compiling report data...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[rgba(255,120,120,0.24)] bg-[rgba(255,120,120,0.08)] p-4">
            <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {!loading && !error && !bmAnalytics && (
          <div className="surface-panel rounded-[32px] p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(84,160,255,0.12)]">
              <FileText className="h-6 w-6 text-[var(--color-accent-primary)]" />
            </div>
            <p className="mb-1 text-base font-semibold text-[var(--color-text-primary)]">
              No reportable data found
            </p>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Reports need at least one bowel movement log inside the selected range. Adjust the
              dates or continue logging to generate a clinical summary.
            </p>
          </div>
        )}

        {!loading && !error && bmAnalytics && (
          <>
            <div className="surface-panel-soft mb-5 rounded-[28px] p-4 sm:p-5 print:hidden">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-primary)]">
                    Report framing
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Lead with observed data, then use the flagged patterns and notes below to guide
                    a focused clinical conversation. Ranked pattern cards below now also show
                    whether a finding is backed by reviewed nutrition, structured ingredients,
                    reviewed medication references, or heuristic fallback. GutWise summarizes
                    patient-reported logs and does not diagnose conditions.
                  </p>
                </div>
                <div className="surface-panel-quiet rounded-[20px] px-4 py-3 text-sm text-[var(--color-text-secondary)] sm:max-w-[16rem]">
                  Generated{' '}
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            <SectionGroupLabel label="Summary" accent />

            <ExecutiveSummary
              dateRange={formatDateRange()}
              dayCount={getDayCount()}
              totalBMs={bmAnalytics.totalCount}
              avgPerDay={bmAnalytics.averagePerDay}
              avgPerWeek={bmAnalytics.averagePerWeek}
              criticalAlerts={clinicalAlerts.filter(
                (a) => a.severity === 'critical' || a.severity === 'high'
              )}
              primaryConcerns={primaryConcerns}
              evidenceSummary={reportEvidenceSummary}
            />

            <ObservedDataTable rows={observedDataRows} />

            <ClinicalAlertsSection alerts={clinicalAlerts} />

            {reportInsights && (
              <PatternEvidenceSection
                bundle={reportInsights.explanationBundle}
                missingLogTypes={reportInsights.missing_log_types}
                evidenceGapSummaries={reportInsights.evidence_gap_summaries}
              />
            )}

            <SectionGroupLabel label="Supporting Detail" />

            <BMAnalyticsSection analytics={bmAnalytics} />
            <BristolDistributionSection distribution={bristolDistribution} />
            <SymptomProgressionSection trends={symptomTrends} />
            <HealthMarkersSection correlations={healthMarkers} />
            <TriggerPatternsSection triggers={triggerPatterns} />
            <MedicationCorrelationSection
              correlations={medicationCorrelations}
              evidenceSummary={reportEvidenceSummary}
            />

            <SectionGroupLabel label="Patient Perspective" />

            <PatientNotesSection value={patientNotes} onChange={setPatientNotes} />

            <div className="mt-6 rounded-[28px] border border-white/8 bg-white/[0.03] p-6 dark:bg-white/[0.02] print:mt-10">
              <div className="mb-4 flex items-center gap-2 border-b border-white/8 pb-3">
                <MessageSquare className="h-4 w-4 text-[var(--color-accent-primary)]" />
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-primary)]">
                  Appointment Prep
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="surface-panel-quiet rounded-[20px] p-4">
                  <p className="mb-1 text-xs font-semibold text-[var(--color-text-primary)]">
                    Start with change over time
                  </p>
                  <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    Review what changed across the selected period before narrowing into one-off
                    symptoms or meals.
                  </p>
                </div>

                <div className="surface-panel-quiet rounded-[20px] p-4">
                  <p className="mb-1 text-xs font-semibold text-[var(--color-text-primary)]">
                    Confirm the highest-priority concern
                  </p>
                  <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    Use your notes section to make sure the most disruptive symptom or question is
                    addressed first.
                  </p>
                </div>

                <div className="surface-panel-quiet rounded-[20px] p-4">
                  <p className="mb-1 text-xs font-semibold text-[var(--color-text-primary)]">
                    Validate likely triggers
                  </p>
                  <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    Treat food or medication correlations as patterns to investigate, not direct
                    proof of cause. Give more weight to findings labeled as reviewed nutrition,
                    structured ingredients, or reviewed medication references than to heuristic
                    fallback.
                  </p>
                </div>

                <div className="surface-panel-quiet rounded-[20px] p-4">
                  <p className="mb-1 text-xs font-semibold text-[var(--color-text-primary)]">
                    Decide the next logging window
                  </p>
                  <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    If the picture is still unclear, keep logging through the next 2-4 weeks to
                    strengthen comparisons.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-3 print:mt-6">
              <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                Patient-reported summary for clinical discussion only. This report does not provide
                diagnosis or treatment recommendations.
              </p>
            </div>

            <div className="mt-6 pb-4 text-center text-xs text-[var(--color-text-tertiary)] print:mt-10">
              <p>End of report | {formatDateRange()}</p>
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

          .print\\:p-8 {
            padding: 2rem !important;
          }

          .print\\:mt-10 {
            margin-top: 2.5rem !important;
          }

          .print\\:mt-6 {
            margin-top: 1.5rem !important;
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
