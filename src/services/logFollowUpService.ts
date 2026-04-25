export type LogFollowUpSourceType =
  | 'food'
  | 'symptoms'
  | 'bm'
  | 'hydration'
  | 'medication';

export interface LogFollowUpContext {
  sourceType: LogFollowUpSourceType;
  sourceTitle: string;
  sourceSummary: string;
  loggedAt: string;
}

export interface LogFollowUpState<TPrefill = Record<string, unknown>> {
  __gw_follow_up: true;
  followUpKey: string;
  context: LogFollowUpContext;
  prefill: Partial<TPrefill> & { logged_at?: string };
}

export interface LogFollowUpAction {
  id: string;
  label: string;
  description: string;
  to: string;
  state: LogFollowUpState;
}

export function createLogFollowUpState<TPrefill>(
  context: LogFollowUpContext,
  prefill: Partial<TPrefill> & { logged_at?: string } = {}
): LogFollowUpState<TPrefill> {
  return {
    __gw_follow_up: true,
    followUpKey: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    context,
    prefill,
  };
}

export function readLogFollowUpState<TPrefill>(
  value: unknown
): LogFollowUpState<TPrefill> | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (candidate.__gw_follow_up !== true) {
    return null;
  }

  const context =
    typeof candidate.context === 'object' && candidate.context !== null
      ? (candidate.context as Record<string, unknown>)
      : null;

  if (
    !context ||
    typeof context.sourceType !== 'string' ||
    typeof context.sourceTitle !== 'string' ||
    typeof context.sourceSummary !== 'string' ||
    typeof context.loggedAt !== 'string'
  ) {
    return null;
  }

  return candidate as LogFollowUpState<TPrefill>;
}

export function mergeLogFollowUpPrefill<TForm extends { logged_at: string }>(
  currentForm: TForm,
  followUp: LogFollowUpState<TForm> | null
): TForm {
  if (!followUp) {
    return currentForm;
  }

  return {
    ...currentForm,
    ...followUp.prefill,
    logged_at: followUp.prefill.logged_at ?? followUp.context.loggedAt ?? currentForm.logged_at,
  };
}

export function getFollowUpSourceLabel(sourceType: LogFollowUpSourceType): string {
  switch (sourceType) {
    case 'food':
      return 'Food log';
    case 'symptoms':
      return 'Symptoms log';
    case 'bm':
      return 'BM log';
    case 'hydration':
      return 'Hydration log';
    case 'medication':
      return 'Medication log';
    default:
      return 'Log';
  }
}

export function getMealTypeFromDateTime(value: string): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const parsed = new Date(value);
  const hour = Number.isNaN(parsed.getTime()) ? 12 : parsed.getHours();

  if (hour < 11) {
    return 'breakfast';
  }

  if (hour < 15) {
    return 'lunch';
  }

  if (hour < 21) {
    return 'dinner';
  }

  return 'snack';
}