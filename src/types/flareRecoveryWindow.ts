export interface DayBurdenSummary {
  date: string;
  symptomBurden: number;
  urgencyCount: number;
  looseStoolCount: number;
  isElevated: boolean;
}

export interface FlareWindow {
  startDate: string;
  endDate: string;
  durationDays: number;
  days: DayBurdenSummary[];
  peakBurden: number;
  avgBurden: number;
  peakUrgency: number;
}

export interface RecoveryWindow {
  startDate: string;
  endDate: string;
  durationDays: number;
  days: DayBurdenSummary[];
  avgBurden: number;
  followsFlare: boolean;
}

export interface BurdenSummaryOptions {
  burdenElevationMultiplier?: number;
  urgencyElevationFallback?: number;
  looseStoolMinCount?: number;
}

export interface FlareDetectionOptions extends BurdenSummaryOptions {
  minDays?: number;
}

export interface RecoveryDetectionOptions extends BurdenSummaryOptions {
  minDays?: number;
  requireFollowsFlare?: boolean;
  recoveryBurdenMultiplier?: number;
}
