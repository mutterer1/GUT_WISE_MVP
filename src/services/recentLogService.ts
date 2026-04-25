const RECENT_LOG_PREFIX = 'gutwise_recent_log_v1';

interface StoredRecentLogEntry<T> {
  id: string;
  savedAt: string;
  data: T;
}

export interface RecentLogEntry<T> {
  id: string;
  savedAt: string;
  data: T;
}

function buildRecentLogKey(userId: string, logType: string) {
  return `${RECENT_LOG_PREFIX}:${userId}:${logType}`;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function buildRecentSignature<T>(data: T) {
  try {
    const clone = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    if (clone && typeof clone === 'object') {
      delete clone.id;
      if ('logged_at' in clone) {
        clone.logged_at = '';
      }
    }
    return JSON.stringify(clone);
  } catch {
    return JSON.stringify({ fallback: String(data) });
  }
}

export function loadRecentLogEntries<T>(
  userId: string,
  logType: string,
  limit = 4
): Array<RecentLogEntry<T>> {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(buildRecentLogKey(userId, logType));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Array<StoredRecentLogEntry<T>>;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (entry) =>
          entry &&
          typeof entry === 'object' &&
          typeof entry.id === 'string' &&
          typeof entry.savedAt === 'string' &&
          'data' in entry
      )
      .slice(0, limit)
      .map((entry) => ({
        id: entry.id,
        savedAt: entry.savedAt,
        data: entry.data,
      }));
  } catch {
    return [];
  }
}

export function saveRecentLogEntry<T>(
  userId: string,
  logType: string,
  data: T,
  options?: {
    limit?: number;
    signature?: string;
  }
): Array<RecentLogEntry<T>> {
  if (!canUseStorage()) {
    return [];
  }

  const limit = options?.limit ?? 4;
  const signature = options?.signature ?? buildRecentSignature(data);
  const savedAt = new Date().toISOString();
  const nextEntry: StoredRecentLogEntry<T> = {
    id: signature,
    savedAt,
    data,
  };

  const existing = loadRecentLogEntries<T>(userId, logType, limit).map((entry) => ({
    id: entry.id,
    savedAt: entry.savedAt,
    data: entry.data,
  }));

  const nextEntries = [nextEntry, ...existing.filter((entry) => entry.id !== signature)].slice(
    0,
    limit
  );

  try {
    window.localStorage.setItem(buildRecentLogKey(userId, logType), JSON.stringify(nextEntries));
  } catch {
    return nextEntries.map((entry) => ({
      id: entry.id,
      savedAt: entry.savedAt,
      data: entry.data,
    }));
  }

  return nextEntries.map((entry) => ({
    id: entry.id,
    savedAt: entry.savedAt,
    data: entry.data,
  }));
}