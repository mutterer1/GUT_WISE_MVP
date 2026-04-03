export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface BMAnalytics {
  totalCount: number;
  averagePerDay: number;
  averagePerWeek: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface BristolDistribution {
  type: number;
  count: number;
  percentage: number;
}

export interface SymptomTrend {
  date: string;
  symptomType: string;
  avgSeverity: number;
  count?: number;
}

export interface HealthMarkerCorrelation {
  date: string;
  sleepQuality: number | null;
  stressLevel: number | null;
  symptomSeverity: number | null;
  bmCount: number;
}

export interface TriggerPattern {
  trigger: string;
  category: string;
  occurrences: number;
  avgSymptomSeverity: number;
  correlationStrength: number;
}

export interface MedicationCorrelation {
  date: string;
  medicationName: string;
  dosage: string;
  timeTaken: string;
  symptomSeverityBefore: number | null;
  symptomSeverityAfter: number | null;
}

export interface ClinicalAlert {
  type: 'high_frequency' | 'blood_present' | 'severe_pain' | 'weight_loss' | 'concerning_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: string;
  affectedDates: string[];
}
