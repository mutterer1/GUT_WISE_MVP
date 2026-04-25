export interface LogHistoryGroup<T> {
  key: string;
  label: string;
  entries: T[];
}

type LogTimestampEntry = {
  logged_at?: string | null;
};

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const date = new Date(value);
  return isValidDate(date) ? date : null;
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRelativeDayLabel(date: Date): string | null {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (targetStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  return null;
}

export function formatLogHistoryDateHeading(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return 'Date not set';

  const relativeLabel = getRelativeDayLabel(date);
  if (relativeLabel) return relativeLabel;

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatLogHistoryTime(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return 'Time not set';

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function groupLogHistoryByDay<T extends LogTimestampEntry>(
  entries: T[],
  getTimestamp: (entry: T) => string | null | undefined = (entry) => entry.logged_at
): Array<LogHistoryGroup<T>> {
  return entries.reduce<Array<LogHistoryGroup<T>>>((groups, entry) => {
    const timestamp = getTimestamp(entry);
    const date = toDate(timestamp);
    const key = date ? getLocalDateKey(date) : 'date-not-set';
    const existingGroup = groups.find((group) => group.key === key);

    if (existingGroup) {
      existingGroup.entries.push(entry);
      return groups;
    }

    groups.push({
      key,
      label: formatLogHistoryDateHeading(timestamp),
      entries: [entry],
    });

    return groups;
  }, []);
}

function flattenSearchValue(value: unknown): string[] {
  if (value == null) return [];

  if (Array.isArray(value)) {
    return value.flatMap(flattenSearchValue);
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap(flattenSearchValue);
  }

  return [String(value)];
}

export function buildLogHistorySearchText(...values: unknown[]): string {
  return values.flatMap(flattenSearchValue).join(' ').toLowerCase();
}

export function matchesLogHistoryQuery(searchText: string, query: string): boolean {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return true;

  return tokens.every((token) => searchText.includes(token));
}