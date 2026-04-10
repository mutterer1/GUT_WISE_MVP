import type {
  InsightCandidate,
  PrioritizedInsightCandidate,
  PriorityTier,
  CandidateStatus,
  DataSufficiency,
} from '../../types/insightCandidates';

const STATUS_SCORE: Record<CandidateStatus, number> = {
  insufficient: 0,
  exploratory: 10,
  emerging: 20,
  reliable: 30,
};

const SUFFICIENCY_SCORE: Record<DataSufficiency, number> = {
  insufficient: 0,
  partial: 5,
  adequate: 12,
  strong: 20,
};

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

function scoreConfidence(c: InsightCandidate): { points: number; reason: string | null } {
  if (c.confidence_score === null) return { points: 0, reason: null };
  const points = Math.round(c.confidence_score * 25 * 100) / 100;
  if (points <= 0) return { points: 0, reason: null };
  return { points, reason: `confidence:${c.confidence_score}(+${points})` };
}

function scoreLift(c: InsightCandidate): { points: number; reason: string | null } {
  const lift = c.evidence.lift;
  if (lift === null || lift <= 1) return { points: 0, reason: null };
  const points = Math.round(Math.min((lift - 1) / 2, 1) * 15 * 100) / 100;
  if (points <= 0) return { points: 0, reason: null };
  return { points, reason: `lift:${lift}(+${points})` };
}

function scoreSupport(c: InsightCandidate): { points: number; reason: string | null } {
  const points = Math.round(Math.min(c.evidence.support_count / 8, 1) * 10 * 100) / 100;
  if (points <= 0) return { points: 0, reason: null };
  return { points, reason: `support:${c.evidence.support_count}(+${points})` };
}

function scoreContradictionPenalty(c: InsightCandidate): { points: number; reason: string | null } {
  const { contradiction_count, exposure_count } = c.evidence;
  if (exposure_count <= 0 || contradiction_count <= 0) return { points: 0, reason: null };
  const penalty = Math.round((contradiction_count / exposure_count) * 15 * 100) / 100;
  if (penalty <= 0) return { points: 0, reason: null };
  return { points: -penalty, reason: `contradictions:${contradiction_count}/${exposure_count}(-${penalty})` };
}

function computePriorityTier(score: number): PriorityTier {
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

function scoreCandidate(c: InsightCandidate): { score: number; reasons: string[] } {
  const components = [
    scoreStatus(c),
    scoreSufficiency(c),
    scoreConfidence(c),
    scoreLift(c),
    scoreSupport(c),
    scoreContradictionPenalty(c),
  ];

  let total = 0;
  const reasons: string[] = [];

  for (const { points, reason } of components) {
    total += points;
    if (reason !== null) reasons.push(reason);
  }

  const score = Math.round(Math.max(0, Math.min(100, total)) * 100) / 100;
  return { score, reasons };
}

function isUsableCandidate(c: InsightCandidate): boolean {
  return c.status !== 'insufficient' && c.data_sufficiency !== 'insufficient';
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
    };
  });

  return scored.sort((a, b) => {
    if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score;
    const statusOrder: Record<string, number> = { reliable: 0, emerging: 1, exploratory: 2 };
    const statusDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    if (statusDiff !== 0) return statusDiff;
    const aRecent = a.evidence.sample_dates[0] ?? '';
    const bRecent = b.evidence.sample_dates[0] ?? '';
    if (bRecent !== aRecent) return bRecent.localeCompare(aRecent);
    return a.insight_key.localeCompare(b.insight_key);
  });
}
