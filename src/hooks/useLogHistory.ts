import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UseLogHistoryConfig<T> {
  table: string;
  userId?: string;
  historyLimit: number;
  onError: (message: string) => void;
}

export function useLogHistory<T extends { id: string; logged_at: string }>({
  table,
  userId,
  historyLimit,
  onError,
}: UseLogHistoryConfig<T>) {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<T[]>([]);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setHistory([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(historyLimit);

      if (error) throw error;

      setHistory((data || []) as T[]);
    } catch (err) {
      console.error(`Error fetching history from ${table}:`, err);
      onError(err instanceof Error ? err.message : 'Failed to load history');
    }
  }, [table, userId, historyLimit, onError]);

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory, fetchHistory]);

  return {
    showHistory,
    setShowHistory,
    history,
    setHistory,
    fetchHistory,
  };
}
