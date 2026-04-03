export type LogType =
  | 'bm'
  | 'food'
  | 'symptoms'
  | 'sleep'
  | 'stress'
  | 'hydration'
  | 'medication'
  | 'menstrual';

export interface BaseLogEntry {
  id?: string;
  logged_at: string;
}

export interface LogCrudConfig<TForm extends BaseLogEntry, THistory = TForm> {
  table: string;
  logType: LogType;
  emptyMessageCategory: LogType;
  defaultValues: TForm;
  historyLimit?: number;
  mapHistoryToForm?: (item: THistory) => TForm;
  buildInsertPayload: (formData: TForm, userId: string) => Record<string, unknown>;
  buildUpdatePayload: (formData: TForm) => Record<string, unknown>;
  historyQuery?: string;
  orderBy?: { column: string; ascending?: boolean };
}
