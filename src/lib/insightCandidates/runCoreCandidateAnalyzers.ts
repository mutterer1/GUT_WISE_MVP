import type { UserDailyFeatures } from '../../types/dailyFeatures';
import type { UserBaselineSet } from '../../types/baselines';
import type { InsightCandidate, DataSufficiency } from '../../types/insightCandidates';
import { analyzeSleepSymptomCandidate } from './sleepSymptomCandidate';
import { analyzeStressUrgencyCandidate } from './stressUrgencyCandidate';
import { analyzeHydrationStoolConsistencyCandidate } from './hydrationStoolConsistencyCandidate';
import { analyzeFoodLateMealNextDayBmShiftCandidate } from './foodLateMealNextDayBmShiftCandidate';
import { analyzeFoodCaffeineSameDaySymptomBurdenCandidate } from './foodCaffeineSameDaySymptomBurdenCandidate';
import { analyzeBmUrgencyRollingElevationCandidate } from './bmUrgencyRollingElevationCandidate';
import { analyzeSymptomTypePersistenceCandidate } from './symptomTypePersistenceCandidate';
import { analyzeExerciseMovementBmRegularityCandidate } from './exerciseMovementBmRegularityCandidate';
import { analyzeExerciseLowMovementSymptomBurdenCandidate } from './exerciseLowMovementSymptomBurdenCandidate';
import { analyzeCyclePhaseSymptomShiftCandidate } from './cyclePhaseSymptomShiftCandidate';
import { analyzeCyclePhaseBmShiftCandidate } from './cyclePhaseBmShiftCandidate';
import { analyzeCyclePhaseRecurrentSymptomBurdenCandidate } from './cyclePhaseRecurrentSymptomBurdenCandidate';
import { analyzeMedicationAnyBmShiftCandidate } from './medicationAnyBmShiftCandidate';
import { analyzeMedicationAnySymptomBurdenCandidate } from './medicationAnySymptomBurdenCandidate';
import { analyzeMultifactorStressSleepHydrationRiskCandidate } from './multifactorStressSleepHydrationRiskCandidate';
import { analyzeFlareSymptomBurdenEpisodeCandidate } from './flareSymptomBurdenEpisodeCandidate';
import { analyzeFlareRecoveryPatternCandidate } from './flareRecoveryPatternCandidate';
import { analyzeFoodMealRegularitySymptomBurdenCandidate } from './foodMealRegularitySymptomBurdenCandidate';
import { analyzeStressHighDaySymptomBurdenCandidate } from './stressHighDaySymptomBurdenCandidate';
import { analyzeHydrationLowSameDaySymptomBurdenCandidate } from './hydrationLowSameDaySymptomBurdenCandidate';
import { analyzeFoodGutTriggerLoadSameDaySymptomBurdenCandidate } from './foodGutTriggerLoadSameDaySymptomBurdenCandidate';

type CandidateAnalyzer = (
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
) => InsightCandidate | null;

const CORE_ANALYZERS: CandidateAnalyzer[] = [
  analyzeSleepSymptomCandidate,
  analyzeStressUrgencyCandidate,
  analyzeHydrationStoolConsistencyCandidate,
  analyzeFoodLateMealNextDayBmShiftCandidate,
  analyzeFoodCaffeineSameDaySymptomBurdenCandidate,
  analyzeFoodGutTriggerLoadSameDaySymptomBurdenCandidate,
  analyzeBmUrgencyRollingElevationCandidate,
  analyzeSymptomTypePersistenceCandidate,
  analyzeExerciseMovementBmRegularityCandidate,
  analyzeExerciseLowMovementSymptomBurdenCandidate,
  analyzeCyclePhaseSymptomShiftCandidate,
  analyzeCyclePhaseBmShiftCandidate,
  analyzeCyclePhaseRecurrentSymptomBurdenCandidate,
  analyzeMedicationAnyBmShiftCandidate,
  analyzeMedicationAnySymptomBurdenCandidate,
  analyzeMultifactorStressSleepHydrationRiskCandidate,
  analyzeFlareSymptomBurdenEpisodeCandidate,
  analyzeFlareRecoveryPatternCandidate,
  analyzeFoodMealRegularitySymptomBurdenCandidate,
  analyzeStressHighDaySymptomBurdenCandidate,
  analyzeHydrationLowSameDaySymptomBurdenCandidate,
];

export function runCoreCandidateAnalyzers(
  features: UserDailyFeatures[],
  baselines: UserBaselineSet
): InsightCandidate[] {
  if (features.length === 0) return [];

  const candidates: InsightCandidate[] = [];

  for (const analyzer of CORE_ANALYZERS) {
    const result = analyzer(features, baselines);
    if (result !== null) {
      candidates.push(result);
    }
  }

  return candidates;
}

export function compactCandidates(
  candidates: InsightCandidate[]
): InsightCandidate[] {
  return candidates.filter((c) => c.status !== 'insufficient');
}

const SUFFICIENCY_RANK: Record<DataSufficiency, number> = {
  strong: 0,
  adequate: 1,
  partial: 2,
  insufficient: 3,
};

export function sortCandidatesForDebug(
  candidates: InsightCandidate[]
): InsightCandidate[] {
  return [...candidates].sort((a, b) => {
    const suffA = SUFFICIENCY_RANK[a.data_sufficiency];
    const suffB = SUFFICIENCY_RANK[b.data_sufficiency];
    if (suffA !== suffB) return suffA - suffB;

    const confA = a.confidence_score ?? -1;
    const confB = b.confidence_score ?? -1;
    if (confA !== confB) return confB - confA;

    return a.insight_key.localeCompare(b.insight_key);
  });
}
