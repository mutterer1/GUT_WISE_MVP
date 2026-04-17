import type { NormalizedTimestampMeta } from '../types/logs';

export function normalizeBMLog<T extends Record<string, unknown>>(raw: T): T {
  const result: Record<string, unknown> = { ...raw };

  if ('bristol_scale' in result && !('bristol_type' in result)) {
    result['bristol_type'] = result['bristol_scale'];
    delete result['bristol_scale'];
  }

  if ('urgency_level' in result && !('urgency' in result)) {
    result['urgency'] = result['urgency_level'];
    delete result['urgency_level'];
  }

  return result as T;
}

export function computeNormalizedTimestamp(
  loggedAt: string,
  tz: string
): Pick<NormalizedTimestampMeta, 'local_date' | 'local_hour' | 'timezone'> {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date(loggedAt));
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? '';

    const localDate = `${get('year')}-${get('month')}-${get('day')}`;
    const localHour = parseInt(get('hour'), 10);

    return {
      local_date: localDate,
      local_hour: isNaN(localHour) ? 0 : localHour,
      timezone: tz,
    };
  } catch {
    return {
      local_date: loggedAt.split('T')[0],
      local_hour: new Date(loggedAt).getUTCHours(),
      timezone: tz,
    };
  }
}

export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}
