import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getLocalDateTimeString } from '../utils/dateFormatters';
import { getSuccessMessage, getUpdateMessage, getDeleteMessage } from '../utils/copySystem';
import { consumeLogTemplateDraft } from '../utils/logTemplateDrafts';
import {
  MAX_LOG_ROUTINES,
  buildDefaultRoutineName,
  countLogRoutines,
  createLogRoutine,
  findLogRoutineBySource,
  updateLogRoutine,
} from '../services/logRoutineService';
import { saveEventManager } from '../services/saveEventManager';
import { useLogFeedback } from './useLogFeedback';
import { useLogHistory } from './useLogHistory';
import type { SaveEvent } from '../services/saveEventManager';

type LogType = SaveEvent['logType'];
const TEMPLATE_LOADED_MESSAGE =
  'Template loaded as a new unsaved entry. Review and save when ready.';
const ROUTINE_SAVED_MESSAGE =
  'Routine saved. It will appear on your dashboard under Pinned Routines.';
const ROUTINE_UPDATED_MESSAGE =
  'Routine updated. The dashboard shortcut now uses this saved entry.';

interface UseLogCrudConfig<T extends { logged_at: string; id?: string }> {
  table: string;
  logType: LogType;
  defaultValues: Omit<T, 'logged_at' | 'id'>;
  buildInsertPayload: (formData: T, userId: string) => Record<string, unknown>;
  buildUpdatePayload: (formData: T) => Record<string, unknown>;
  onAfterCreate?: (params: { entryId: string; userId: string; formData: T }) => Promise<void>;
  onAfterUpdate?: (params: { entryId: string; userId: string; formData: T }) => Promise<void>;
  mapHistoryToForm?: (log: T & { id: string }) => T;
  mapTemplateToForm?: (log: T & { id: string }, defaultFormData: T) => T;
  historyLimit?: number;
}

interface UseLogCrudReturn<T extends { logged_at: string; id?: string }> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  saving: boolean;
  message: string;
  toastVisible: boolean;
  error: string;
  showHistory: boolean;
  setShowHistory: React.Dispatch<React.SetStateAction<boolean>>;
  history: Array<T & { id: string }>;
  editingId: string | null;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  dismissToast: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEdit: (log: T & { id: string }) => void;
  handleUseAsTemplate: (log: T & { id: string }) => void;
  handleSaveAsRoutine: (log: T & { id: string }) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  resetForm: () => void;
  fetchHistory: () => Promise<void>;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message;
  }

  if (typeof err === 'object' && err !== null) {
    const errorLike = err as Record<string, unknown>;
    const message =
      typeof errorLike.message === 'string' ? errorLike.message.trim() : '';
    const details =
      typeof errorLike.details === 'string' ? errorLike.details.trim() : '';
    const hint = typeof errorLike.hint === 'string' ? errorLike.hint.trim() : '';

    const parts = [message, details, hint].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(' ');
    }
  }

  return fallback;
}

function omitLogId<T extends { id?: string }>(log: T): Omit<T, 'id'> {
  const copy = { ...log };
  delete copy.id;
  return copy;
}

function scrollToLogForm(): void {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
}

export function useLogCrud<T extends { id?: string; logged_at: string }>(
  config: UseLogCrudConfig<T>
): UseLogCrudReturn<T> {
  const {
    table,
    logType,
    defaultValues,
    buildInsertPayload,
    buildUpdatePayload,
    onAfterCreate,
    onAfterUpdate,
    mapHistoryToForm,
    mapTemplateToForm,
    historyLimit = 50,
  } = config;

  const { user } = useAuth();

  const createDefaultFormData = useCallback(
    (): T =>
      ({
        logged_at: getLocalDateTimeString(),
        ...defaultValues,
      }) as T,
    [defaultValues]
  );

  const [formData, setFormData] = useState<T>(createDefaultFormData);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { message, toastVisible, error, showSuccess, showError, clearError, dismissToast } =
    useLogFeedback();

  const { showHistory, setShowHistory, history, fetchHistory } = useLogHistory<T & { id: string }>(
    {
      table,
      userId: user?.id,
      historyLimit,
      onError: showError,
    }
  );

  const resetForm = useCallback(() => {
    setFormData(createDefaultFormData());
    setEditingId(null);
  }, [createDefaultFormData]);

  const runSaveSideEffects = useCallback(
    (mode: 'create' | 'update', entryId?: string) => {
      if (mode === 'update') {
        showSuccess(getUpdateMessage());
        saveEventManager.emit({ type: 'update', logType, timestamp: Date.now(), entryId });
      } else {
        showSuccess(getSuccessMessage(logType));
        saveEventManager.emit({ type: 'save', logType, timestamp: Date.now() });
      }
    },
    [logType, showSuccess]
  );

  const saveEntry = useCallback(async (): Promise<{ mode: 'create' | 'update' }> => {
    if (!user?.id) {
      throw new Error('You must be signed in to save an entry');
    }

    const loggedAtTimestamp = new Date(formData.logged_at).toISOString();
    const dataWithTimestamp = { ...formData, logged_at: loggedAtTimestamp };

    if (editingId) {
      const { error: updateError } = await supabase
        .from(table)
        .update({
          ...buildUpdatePayload(dataWithTimestamp),
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId)
        .eq('user_id', user.id)
        .select('id')
        .maybeSingle();

      if (updateError) throw updateError;

      if (onAfterUpdate) {
        await onAfterUpdate({
          entryId: editingId,
          userId: user.id,
          formData: dataWithTimestamp,
        });
      }

      runSaveSideEffects('update', editingId);
      return { mode: 'update' };
    }

    const { data: insertedRow, error: insertError } = await supabase
      .from(table)
      .insert(buildInsertPayload(dataWithTimestamp, user.id))
      .select('id')
      .maybeSingle();

    if (insertError) throw insertError;

    const insertedId =
      insertedRow && typeof insertedRow === 'object' && 'id' in insertedRow
        ? String(insertedRow.id)
        : null;

    if (!insertedId) {
      throw new Error('Saved entry but did not receive an id back from Supabase');
    }

    try {
      if (onAfterCreate) {
        await onAfterCreate({
          entryId: insertedId,
          userId: user.id,
          formData: dataWithTimestamp,
        });
      }
    } catch (afterCreateError) {
      await supabase
        .from(table)
        .delete()
        .eq('id', insertedId)
        .eq('user_id', user.id);

      throw afterCreateError;
    }

    runSaveSideEffects('create');
    return { mode: 'create' };
  }, [
    user?.id,
    formData,
    editingId,
    table,
    buildUpdatePayload,
    buildInsertPayload,
    onAfterCreate,
    onAfterUpdate,
    runSaveSideEffects,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSaving(true);

    try {
      await saveEntry();
      resetForm();

      if (showHistory) {
        await fetchHistory();
      }
    } catch (err) {
      console.error(`Error saving entry to ${table}:`, err);
      showError(getErrorMessage(err, 'Failed to save entry'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (log: T & { id: string }) => {
    const mappedLog = mapHistoryToForm ? mapHistoryToForm(log) : (omitLogId(log) as T);

    setFormData(mappedLog);
    setEditingId(log.id);
    setShowHistory(false);

    scrollToLogForm();
  };

  const applyTemplateData = useCallback(
    (templateLog: T & { id: string }, defaultFormData: T) => {
      const mappedLog = mapTemplateToForm
        ? mapTemplateToForm(templateLog, defaultFormData)
        : mapHistoryToForm
          ? mapHistoryToForm(templateLog)
          : (omitLogId(templateLog) as T);

      const templateData = {
        ...mappedLog,
        logged_at: defaultFormData.logged_at,
      } as T;

      delete (templateData as { id?: string }).id;

      setFormData(templateData);
      setEditingId(null);
      setShowHistory(false);
      showSuccess(TEMPLATE_LOADED_MESSAGE);
    },
    [mapHistoryToForm, mapTemplateToForm, setShowHistory, showSuccess]
  );

  const handleUseAsTemplate = (log: T & { id: string }) => {
    const defaultFormData = createDefaultFormData();
    applyTemplateData(log, defaultFormData);
    scrollToLogForm();
  };

  const handleSaveAsRoutine = async (log: T & { id: string }) => {
    clearError();

    if (!user?.id) {
      showError('You must be signed in to save a routine');
      return;
    }

    const routineEntry = log as unknown as Record<string, unknown>;

    try {
      const existingRoutine = await findLogRoutineBySource(user.id, logType, log.id);

      if (existingRoutine) {
        const shouldReplace = window.confirm(
          `"${existingRoutine.routine_name}" is already pinned from this saved entry. Replace it with the latest saved details?`
        );

        if (!shouldReplace) {
          return;
        }

        const routineName = window
          .prompt('Rename this routine if needed', existingRoutine.routine_name)
          ?.trim();

        if (!routineName) {
          return;
        }

        await updateLogRoutine({
          userId: user.id,
          routineId: existingRoutine.id,
          routineName,
          entry: routineEntry,
          sourceLogId: log.id,
        });

        showSuccess(ROUTINE_UPDATED_MESSAGE);
        return;
      }

      const routineCount = await countLogRoutines(user.id);
      if (routineCount >= MAX_LOG_ROUTINES) {
        showError(
          `Routine limit reached (${MAX_LOG_ROUTINES}). Rename, remove, or update an existing routine before adding another.`
        );
        return;
      }

      const defaultName = buildDefaultRoutineName(logType, routineEntry);
      const routineName = window.prompt('Name this reusable routine', defaultName)?.trim();

      if (!routineName) {
        return;
      }

      await createLogRoutine({
        userId: user.id,
        logType,
        routineName,
        entry: routineEntry,
        sourceLogId: log.id,
      });

      showSuccess(ROUTINE_SAVED_MESSAGE);
    } catch (err) {
      console.error(`Error saving ${logType} routine:`, err);
      showError(getErrorMessage(err, 'Failed to save routine'));
    }
  };

  useEffect(() => {
    const draft = consumeLogTemplateDraft(logType);
    if (!draft) return;

    const defaultFormData = createDefaultFormData();
    const draftLog = {
      id: typeof draft.entry.id === 'string' ? draft.entry.id : 'template-draft',
      ...draft.entry,
    } as T & { id: string };
    applyTemplateData(draftLog, defaultFormData);
    scrollToLogForm();
  }, [logType, createDefaultFormData, applyTemplateData]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      clearError();

      if (!user?.id) {
        throw new Error('You must be signed in to delete an entry');
      }

      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      showSuccess(getDeleteMessage());

      saveEventManager.emit({
        type: 'delete',
        logType,
        timestamp: Date.now(),
        entryId: id,
      });

      if (showHistory) {
        await fetchHistory();
      }
    } catch (err) {
      console.error(`Error deleting entry from ${table}:`, err);
      showError(getErrorMessage(err, 'Failed to delete entry'));
    }
  };

  return {
    formData,
    setFormData,
    saving,
    message,
    toastVisible,
    error,
    showHistory,
    setShowHistory,
    history,
    editingId,
    setEditingId,
    dismissToast,
    handleSubmit,
    handleEdit,
    handleUseAsTemplate,
    handleSaveAsRoutine,
    handleDelete,
    resetForm,
    fetchHistory,
  };
}
