const LOG_DRAFT_PREFIX = 'gutwise_log_draft_v1';

export interface PersistedLogDraft<T> {
  updatedAt: string;
  data: T;
}

function buildLogDraftKey(userId: string, logType: string) {
  return `${LOG_DRAFT_PREFIX}:${userId}:${logType}`;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadLogDraft<T>(userId: string, logType: string): PersistedLogDraft<T> | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(buildLogDraftKey(userId, logType));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedLogDraft<T>>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.updatedAt !== 'string' ||
      !('data' in parsed)
    ) {
      return null;
    }

    return {
      updatedAt: parsed.updatedAt,
      data: parsed.data as T,
    };
  } catch {
    return null;
  }
}

export function saveLogDraft<T>(
  userId: string,
  logType: string,
  data: T
): PersistedLogDraft<T> | null {
  if (!canUseStorage()) {
    return null;
  }

  const record: PersistedLogDraft<T> = {
    updatedAt: new Date().toISOString(),
    data,
  };

  try {
    window.localStorage.setItem(buildLogDraftKey(userId, logType), JSON.stringify(record));
    return record;
  } catch {
    return null;
  }
}

export function clearLogDraft(userId: string, logType: string) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(buildLogDraftKey(userId, logType));
  } catch {
    // Ignore storage failures and fall back to an in-memory reset only.
  }
}