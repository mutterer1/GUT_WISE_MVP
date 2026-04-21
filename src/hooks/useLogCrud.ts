import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getLocalDateTimeString } from '../utils/dateFormatters';
import { getSuccessMessage, getUpdateMessage, getDeleteMessage } from '../utils/copySystem';
import { saveEventManager } from '../services/saveEventManager';
import { useLogFeedback } from './useLogFeedback';
import { useLogHistory } from './useLogHistory';
import type { SaveEvent } from '../services/saveEventManager';

type LogType = SaveEvent['logType'];

interface UseLogCrudConfig<T extends { logged_at: string; id?: string }> {
  table: string;
  logType: LogType;
  defaultValues: Omit<T, 'logged_at' | 'id'>;
  buildInsertPayload: (formData: T, userId: string) => Record<string, unknown>;
  buildUpdatePayload: (formData: T) => Record<string, unknown>;
  mapHistoryToForm?: (log: T & { id: string }) => T;
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

export function useLogCrud<T extends { id?: string; logged_at: string }>(
  config: UseLogCrudConfig<T>
): UseLogCrudReturn<T> {
  const {
    table,
    logType,
    defaultValues,
    buildInsertPayload,
    buildUpdatePayload,
    mapHistoryToForm,
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
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      runSaveSideEffects('update', editingId);
      return { mode: 'update' };
    }

    const { error: insertError } = await supabase
      .from(table)
      .insert(buildInsertPayload(dataWithTimestamp, user.id));

    if (insertError) throw insertError;

    runSaveSideEffects('create');
    return { mode: 'create' };
  }, [
    user?.id,
    formData,
    editingId,
    table,
    buildUpdatePayload,
    buildInsertPayload,
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
    const { id: _id, ...rest } = log;
    const mappedLog = mapHistoryToForm ? mapHistoryToForm(log) : (rest as T);

    setFormData(mappedLog);
    setEditingId(log.id);
    setShowHistory(false);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

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
    handleDelete,
    resetForm,
    fetchHistory,
  };
}
