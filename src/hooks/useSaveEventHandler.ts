import { useEffect, useCallback, useRef } from 'react';
import { saveEventManager, SaveEvent } from '../services/saveEventManager';

export const SHOW_SUCCESS_NOTIFICATION_EVENT = 'showSuccessNotification';

const LOG_TYPE_NAMES: Record<SaveEvent['logType'], string> = {
  bm: 'Bowel movement',
  food: 'Food intake',
  symptoms: 'Symptom',
  sleep: 'Sleep',
  stress: 'Stress level',
  hydration: 'Hydration',
  medication: 'Medication',
  'menstrual-cycle': 'Menstrual cycle',
};

const ACTION_NAMES: Record<SaveEvent['type'], string> = {
  save: 'saved',
  update: 'updated',
  delete: 'deleted',
};

/**
 * Gets the human-readable name for a log type
 */
const getLogTypeName = (logType: SaveEvent['logType']): string => {
  const name = LOG_TYPE_NAMES[logType];
  if (!name) {
    console.warn(`Unknown log type: ${logType}`);
    return 'Entry';
  }
  return name;
};

/**
 * Gets the human-readable name for an action type
 */
const getActionName = (type: SaveEvent['type']): string => {
  const action = ACTION_NAMES[type];
  if (!action) {
    console.warn(`Unknown action type: ${type}`);
    return 'processed';
  }
  return action;
};

/**
 * Validates a SaveEvent object
 */
const isValidSaveEvent = (event: unknown): event is SaveEvent => {
  if (typeof event !== 'object' || event === null) {
    return false;
  }

  const e = event as Record<string, unknown>;

  if (typeof e.type !== 'string' || !['save', 'update', 'delete'].includes(e.type)) {
    return false;
  }

  if (typeof e.logType !== 'string' || !Object.keys(LOG_TYPE_NAMES).includes(e.logType)) {
    return false;
  }

  if (typeof e.timestamp !== 'number' || e.timestamp <= 0) {
    return false;
  }

  if (e.entryId !== undefined && typeof e.entryId !== 'string') {
    return false;
  }

  return true;
};

/**
 * Builds a notification message from a SaveEvent
 */
const buildNotificationMessage = (event: SaveEvent): string => {
  const logName = getLogTypeName(event.logType);
  const action = getActionName(event.type);
  return `${logName} entry ${action} successfully`;
};

/**
 * Dispatches a success notification event to be handled by the UI layer
 */
const dispatchNotificationEvent = (message: string, saveEvent: SaveEvent): void => {
  try {
    const customEvent = new CustomEvent(SHOW_SUCCESS_NOTIFICATION_EVENT, {
      detail: { message, saveEvent },
    });

    window.dispatchEvent(customEvent);
  } catch (error) {
    console.error('Error dispatching notification event:', error);
  }
};

/**
 * Hook that subscribes to save events and dispatches notifications
 * Handles save, update, and delete operations for various health log types
 */
export const useSaveEventHandler = (): void => {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleSaveEvent = useCallback((event: SaveEvent) => {
    if (!isValidSaveEvent(event)) {
      console.warn('Received invalid save event:', event);
      return;
    }

    try {
      const message = buildNotificationMessage(event);
      dispatchNotificationEvent(message, event);
    } catch (error) {
      console.error('Error processing save event:', error, { event });
    }
  }, []);

  useEffect(() => {
    unsubscribeRef.current = saveEventManager.subscribe(handleSaveEvent);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [handleSaveEvent]);
};
