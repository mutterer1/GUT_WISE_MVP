import type {
  InsightCandidate,
  PrioritizedInsightCandidate,
  PriorityTier,
  CandidateStatus,
  DataSufficiency,
  CandidateEvidenceQuality,
} from '../../types/insightCandidates';

const STATUS_SCORE: Record<CandidateStatus, number> = {
  insufficient: 0,
  exploratory: 8,
  emerging: 18,
  reliable: 28,
};

const SUFFICIENCY_SCORE: Record<DataSufficiency, number> = {
  insufficient: 0,
  partial: 4,
  adequate: 11,
  strong: 18,
};

const EVIDENCE_QUALITY_SCORE: Record<CandidateEvidenceQuality, number> = {
  very_low: 0,
  low: 5,
  moderate: 12,
  high: 18,
};

function roundPoints(value: number): number {
  return Math.round(value * 100) / 100;
}

function scoreStatus(c: InsightCandidate): { points: number; reason: string | null } {
  const points = STATUS_SCORE[c.status];
  if (points === 0) return { points: 0, reason: null };
  return { points, reason: `status:${c.status}(+${points})` };
}

function scoreSufficiency(c: InsightCandidate): { points: number; reason: string | null } {
  const points = SUFFICIENCY_SCORE[c.data_sufficiency];
  if (points === 0) return { points: 0, reason: null };
  return { points, reason: `data:${c.data_sufficiency}(+${points})` };
}

function scoreEvidenceQuality(c: InsightCandidate): { points: number; reason: string | null } {
  const quality = c.evidence.evidence_quality ?? 'very_low';
  const points = EVIDENCE_QUALITY_SCORE[quality];
  if (points === 0) return { points: 0, reason: null };
  return { points, reason: `quality:${quality}(+${points})` };
}

function scoreConfidence(c: InsightCandidate): { points: number; reason: string | null } {
  if (c.confidence_score === null) return { points: 0, reason: null };
  const points = roundPoints(c.confidence_score * 20);
  if (points <= 0) return { points: 0, reason: null };
  return { points, reason: `confidence:${c.confidence_score}(+${points})` };
}

function scoreLift(c: InsightCandidate): { points: number; reason: string | null } {
  const lift = c.evidence.lift;
  if (lift === null || lift <= 1) return { points: 0, reason: null };
  const points = roundPoints(Math.min((lift - 1) / 2, 1) * 12);
  if (points <= 0) return { points: 0, reason: null };
  return { points, reason: `lift:${lift}(+${points})` };
}

function scoreSupport(c: InsightCandidate): { points: number; reason: string | null } {
  const points = roundPoints(Math.min(c.evidence.support_count / 6, 1) * 8);
  if (points <= 0) return { points: 0, reason: null };
  return { points, reason: `support:${c.evidence.support_count}(+${points})` };
}

function scoreContrast(c: InsightCandidate): { points: number; reason: string | null } {
  const contrastCount = c.evidence.contrast_count ?? 0;
  if (contrastCount <= 0) return { points: 0, reason: null };
  const points = roundPoints(Math.min(contrastCount / 6, 1) * 8);
  if (points <= 0) return { points: 0, reason: null };
  return { points, reason: `contrast:${contrastCount}(+${points})` };
}

function scoreRecency(c: InsightCandidate): { points: number; reason: string | null } {
  const recencyWeight = c.evidence.recency_weight;
  if (recencyWeight === null || recencyWeight === undefined) {
    return { points: 0, reason: null };
  }

  if (recencyWeight >= 0.95) {
    return { points: 6, reason: `recency:${recencyWeight}(+6)` };
  }

  if (recencyWeight >= 0.8) {
    return { points: 4, reason: `recency:${recencyWeight}(+4)` };
  }

  if (recencyWeight >= 0.65) {
    return { points: 2, reason: `recency:${recencyWeight}(+2)` };
  }

  const penalty = roundPoints((1 - recencyWeight) * 8);
  if (penalty <= 0) return { points: 0, reason: null };
  return { points: -penalty, reason: `recency:${recencyWeight}(-${penalty})` };
}

function scoreBreadth(c: InsightCandidate): { points: number; reason: string | null } {
  const supportingLogTypes = c.evidence.supporting_log_types ?? [];
  if (supportingLogTypes.length === 0) return { points: 0, reason: null };

  if (supportingLogTypes.length >= 3) {
    return { points: 6, reason: `breadth:${supportingLogTypes.length}(+6)` };
  }

  if (supportingLogTypes.length >= 2) {
    return { points: 3, reason: `breadth:${supportingLogTypes.length}(+3)` };
  }

  return { points: -4, reason: `breadth:${supportingLogTypes.length}(-4)` };
}

function scoreContradictionPenalty(c: InsightCandidate): { points: number; reason: string | null } {
  const contradictionRate = c.evidence.contradiction_rate;
  if (contradictionRate === null || contradictionRate === undefined || contradictionRate <= 0) {
    return { points: 0, reason: null };
  }

  const penalty = roundPoints(contradictionRate * 18);
  if (penalty <= 0) return { points: 0, reason: null };

  return {
    points: -penalty,
    reason: `contradictions:${Math.round(contradictionRate * 100)}%(-${penalty})`,
  };
}

function scoreEvidenceGapPenalty(c: InsightCandidate): { points: number; reason: string | null } {
  const gaps = c.evidence.evidence_gaps ?? [];
  if (gaps.length === 0) return { points: 0, reason: null };

  const penalty = roundPoints(Math.min(gaps.length * 3, 12));
  return {
    points: -penalty,
    reason: `gaps:${gaps.length}(-${penalty})`,
  };
}

function computePriorityTier(score: number): PriorityTier {
  if (score >= 65) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

function getNotEnoughEvidenceReasons(c: InsightCandidate): string[] {
  const reasons: string[] = [];
  const gaps = c.evidence.evidence_gaps ?? [];

  if (c.status === 'insufficient') {
    reasons.push('This pattern does not meet the minimum evidence threshold yet.');
  }

  if (c.data_sufficiency === 'insufficient') {
    reasons.push('There is not enough overlap across days to support this pattern.');
  }

  for (const gap of gaps) {
    reasons.push(gap.message);
  }

  return [...new Set(reasons)];
}

function scoreCandidate(c: InsightCandidate): { score: number; reasons: string[] } {
  const components = [
    scoreStatus(c),
    scoreSufficiency(c),
    scoreEvidenceQuality(c),
    scoreConfidence(c),
    scoreLift(c),
    scoreSupport(c),
    scoreContrast(c),
    scoreRecency(c),
    scoreBreadth(c),
    scoreContradictionPenalty(c),
    scoreEvidenceGapPenalty(c),
  ];

  let total = 0;
  const reasons: string[] = [];

  for (const { points, reason } of components) {
    total += points;
    if (reason !== null) reasons.push(reason);
  }

  const score = roundPoints(Math.max(0, Math.min(100, total)));
  return { score, reasons };
}

function isUsableCandidate(c: InsightCandidate): boolean {
  const contrastCount = c.evidence.contrast_count ?? 0;
  const evidenceQuality = c.evidence.evidence_quality ?? 'very_low';

  if (c.status === 'insufficient') return false;
  if (c.data_sufficiency === 'insufficient') return false;
  if (c.evidence.exposure_count < 3) return false;
  if (contrastCount < 3) return false;
  if (c.evidence.support_count < 2) return false;
  if (evidenceQuality === 'very_low') return false;

  return true;
}

function getMostRecentSampleDate(candidate: InsightCandidate): string {
  const sampleDates = candidate.evidence.sample_dates ?? [];
  if (sampleDates.length === 0) return '';
  return [...sampleDates].sort().at(-1) ?? '';
}

export function prioritizeInsightCandidates(
  candidates: InsightCandidate[]
): PrioritizedInsightCandidate[] {
  const usable = candidates.filter(isUsableCandidate);

  const scored: PrioritizedInsightCandidate[] = usable.map((c) => {
    const { score, reasons } = scoreCandidate(c);
    return {
      ...c,
      priority_score: score,
      priority_tier: computePriorityTier(score),
      ranking_reasons: reasons,
      not_enough_evidence_reasons: getNotEnoughEvidenceReasons(c),
    };
  });

  return scored.sort((a, b) => {
    if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score;

    const statusOrder: Record<string, number> = {
      reliable: 0,
      emerging: 1,
      exploratory: 2,
    };
    const statusDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    if (statusDiff !== 0) return statusDiff;

    const qualityOrder: Record<string, number> = {
      high: 0,
      moderate: 1,
      low: 2,
      very_low: 3,
    };
    const qualityDiff =
      (qualityOrder[a.evidence.evidence_quality ?? 'very_low'] ?? 4) -
      (qualityOrder[b.evidence.evidence_quality ?? 'very_low'] ?? 4);
    if (qualityDiff !== 0) return qualityDiff;

    const aRecent = getMostRecentSampleDate(a);
    const bRecent = getMostRecentSampleDate(b);
    if (bRecent !== aRecent) return bRecent.localeCompare(aRecent);

    return a.insight_key.localeCompare(b.insight_key);
  });
}
