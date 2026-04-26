import type { SaveEvent } from '../services/saveEventManager';

type LogType = SaveEvent['logType'];

const TEMPLATE_DRAFT_STORAGE_KEY = 'gutwise:log-template-draft:v1';

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
    const draft = JSON.parse(rawDraft) as LogTemplateDraft;

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