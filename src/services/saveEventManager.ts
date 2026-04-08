type SaveEventListener = (event: SaveEvent) => void;

export interface SaveEvent {
  type: 'save' | 'update' | 'delete';
  logType: 'bm' | 'food' | 'symptoms' | 'sleep' | 'stress' | 'hydration' | 'medication' | 'menstrual-cycle' | 'exercise';
  timestamp: number;
  entryId?: string;
}

class SaveEventManager {
  private listeners: Set<SaveEventListener> = new Set();

  subscribe(listener: SaveEventListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: SaveEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in save event listener:', error);
      }
    });
  }

  clear(): void {
    this.listeners.clear();
  }

  getListenerCount(): number {
    return this.listeners.size;
  }
}

export const saveEventManager = new SaveEventManager();
