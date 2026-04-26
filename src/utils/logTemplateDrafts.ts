import type { SaveEvent } from '../services/saveEventManager';

type LogType = SaveEvent['logType'];

const TEMPLATE_DRAFT_STORAGE_KEY = 'gutwise:log-template-draft:v1';
const TEMPLATE_DRAFT_TTL_MS = 15 * 60 * 1000;

export interface LogTemplateDraft {
  logType: LogType;
  entry: Record<string, unknown>;
  createdAt: number;
}

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidDraft(value: unknown): value is LogTemplateDraft {
  if (!isRecord(value)) return false;

  return (
    typeof value.logType === 'string' &&
    isRecord(value.entry) &&
    typeof value.createdAt === 'number' &&
    Number.isFinite(value.createdAt)
  );
}

function isDraftExpired(draft: LogTemplateDraft): boolean {
  return Date.now() - draft.createdAt > TEMPLATE_DRAFT_TTL_MS;
}

export function stageLogTemplateDraft(logType: LogType, entry: Record<string, unknown>): boolean {
  const storage = getSessionStorage();
  if (!storage) return false;

  const draft: LogTemplateDraft = {
    logType,
    entry,
    createdAt: Date.now(),
  };

  try {
    storage.setItem(TEMPLATE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function consumeLogTemplateDraft(logType: LogType): LogTemplateDraft | null {
  const storage = getSessionStorage();
  if (!storage) return null;

  const rawDraft = storage.getItem(TEMPLATE_DRAFT_STORAGE_KEY);
  if (!rawDraft) return null;

  try {
    const parsedDraft = JSON.parse(rawDraft) as unknown;

    if (!isValidDraft(parsedDraft)) {
      storage.removeItem(TEMPLATE_DRAFT_STORAGE_KEY);
      return null;
    }

    const draft = parsedDraft;

    if (isDraftExpired(draft)) {
      storage.removeItem(TEMPLATE_DRAFT_STORAGE_KEY);
      return null;
    }

    if (draft.logType !== logType) {
      return null;
    }

    storage.removeItem(TEMPLATE_DRAFT_STORAGE_KEY);
    return draft;
  } catch {
    storage.removeItem(TEMPLATE_DRAFT_STORAGE_KEY);
    return null;
  }
}

export function clearLogTemplateDraft(): void {
  const storage = getSessionStorage();
  if (!storage) return;

  storage.removeItem(TEMPLATE_DRAFT_STORAGE_KEY);
}
