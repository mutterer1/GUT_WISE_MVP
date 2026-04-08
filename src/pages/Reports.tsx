import { useState, useEffect } from 'react';
import { Printer, Download, FileText } from 'lucide-react';
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
    return `${start} - ${end}`;
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
      <div className="p-4 sm:p-6 lg:p-8 print:p-8 max-w-7xl mx-auto">
          <div className="mb-6 print:hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Clinical Report</h1>
                <p className="text-gray-600 dark:text-gray-400">Professional digestive health documentation for healthcare consultation</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-5 w-5" />
                  Print
                </Button>
                <Button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Export PDF
                </Button>
              </div>
            </div>

            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>

          <div className="hidden print:block mb-8">
            <div className="border-b-4 border-gray-900 pb-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-8 w-8 text-gray-900" />
                <h1 className="text-4xl font-bold text-gray-900">Clinical Digestive Health Report</h1>
              </div>
              <p className="text-gray-700 text-lg">Professional Medical Documentation</p>
              <p className="text-sm text-gray-600 mt-2">
                Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {loading && (
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating clinical report...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && bmAnalytics && (
            <>
              <ExecutiveSummary
                dateRange={formatDateRange()}
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

              <div className="bg-white border-t-4 border-gray-900 rounded-lg p-6 mt-8 print:mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Clinical Recommendations</h2>
                <div className="space-y-3 text-sm text-gray-800 leading-relaxed">
                  <p>
                    <span className="font-semibold">1. Comprehensive Evaluation:</span> Review findings with gastroenterologist
                    for differential diagnosis and treatment optimization.
                  </p>
                  <p>
                    <span className="font-semibold">2. Follow-up Timeline:</span> Schedule reassessment in 4-6 weeks to evaluate
                    therapeutic response and symptom progression.
                  </p>
                  <p>
                    <span className="font-semibold">3. Diagnostic Considerations:</span> Consider laboratory studies (CBC, CMP, inflammatory
                    markers, celiac panel) and imaging as clinically indicated based on symptom severity.
                  </p>
                  <p>
                    <span className="font-semibold">4. Patient Education:</span> Continue systematic symptom tracking for longitudinal
                    trend analysis and treatment efficacy assessment.
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4 print:mt-8">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold">Disclaimer:</span> This report is generated from patient-reported data and is intended
                  to facilitate clinical consultation. It does not constitute medical diagnosis or treatment recommendation. All clinical
                  decisions should be made by qualified healthcare professionals based on comprehensive patient assessment, physical examination,
                  and appropriate diagnostic testing. Data accuracy is dependent on patient compliance with systematic logging protocols.
                </p>
              </div>

              <div className="text-center text-xs text-gray-500 mt-6 print:mt-12 pb-4">
                <p>End of Clinical Report</p>
                <p className="mt-1">This document contains protected health information. Handle in accordance with HIPAA requirements.</p>
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

          .print\\:mt-8 {
            margin-top: 2rem !important;
          }

          .print\\:border-0 {
            border: 0 !important;
          }

          .print\\:p-0 {
            padding: 0 !important;
          }

          .print\\:border-gray-800 {
            border-color: #1f2937 !important;
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
