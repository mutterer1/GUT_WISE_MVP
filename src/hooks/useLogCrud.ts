import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getLocalDateTimeString } from '../utils/dateFormatters';
import { getSuccessMessage, getUpdateMessage, getDeleteMessage } from '../utils/copySystem';
import { saveEventManager } from '../services/saveEventManager';
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
  setShowHistory: (v: boolean) => void;
  history: T[];
  editingId: string | null;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  dismissToast: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEdit: (log: T & { id: string }) => void;
  handleDelete: (id: string) => Promise<void>;
  resetForm: () => void;
  fetchHistory: () => Promise<void>;
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
  const [message, setMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<T[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const dismissToast = useCallback(() => setToastVisible(false), []);

  const fetchHistory = useCallback(async () => {
    if (!user?.id) {
      setHistory([]);
      return;
    }

    try {
      setError('');

      const { data, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(historyLimit);

      if (fetchError) {
        throw fetchError;
      }

      setHistory((data || []) as T[]);
    } catch (err) {
      console.error(`Error fetching history from ${table}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    }
  }, [table, user?.id, historyLimit]);

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory, fetchHistory]);

  const resetForm = useCallback(() => {
    setFormData(createDefaultFormData());
    setEditingId(null);
  }, [createDefaultFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      if (!user?.id) {
        throw new Error('You must be signed in to save an entry');
      }

      const loggedAtTimestamp = new Date(formData.logged_at).toISOString();
      const dataWithTimestamp = {
        ...formData,
        logged_at: loggedAtTimestamp,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from(table)
          .update({
            ...buildUpdatePayload(dataWithTimestamp),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (updateError) {
          throw updateError;
        }

        setMessage(getUpdateMessage());
        setToastVisible(true);

        saveEventManager.emit({
          type: 'update',
          logType,
          timestamp: Date.now(),
          entryId: editingId,
        });

        setEditingId(null);
      } else {
        const { error: insertError } = await supabase
          .from(table)
          .insert(buildInsertPayload(dataWithTimestamp, user.id));

        if (insertError) {
          throw insertError;
        }

        setMessage(getSuccessMessage(logType));
        setToastVisible(true);

        saveEventManager.emit({
          type: 'save',
          logType,
          timestamp: Date.now(),
        });
      }

      resetForm();

      if (showHistory) {
        await fetchHistory();
      }
    } catch (err) {
      console.error(`Error saving entry to ${table}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (log: T & { id: string }) => {
    const mappedLog = mapHistoryToForm ? mapHistoryToForm(log) : (log as T);

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
      setError('');

      const { error: deleteError } = await supabase.from(table).delete().eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setMessage(getDeleteMessage());
      setToastVisible(true);

      saveEventManager.emit({
        type: 'delete',
        logType,
        timestamp: Date.now(),
        entryId: id,
      });

      await fetchHistory();
    } catch (err) {
      console.error(`Error deleting entry from ${table}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
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
