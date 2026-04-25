import { Save } from 'lucide-react';
import Button from './Button';

interface LogFormActionsProps {
  isEditing: boolean;
  saving: boolean;
  submitDisabled?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
  updateLabel?: string;
  savingLabel?: string;
}

export default function LogFormActions({
  isEditing,
  saving,
  submitDisabled = false,
  onCancel,
  submitLabel = 'Save Entry',
  updateLabel = 'Update Entry',
  savingLabel = 'Saving...',
}: LogFormActionsProps) {
  return (
    <div className="sticky bottom-2 z-20 pt-2 safe-area-inset-bottom sm:bottom-3">
      <div className="rounded-[22px] border border-white/10 bg-[rgba(11,17,25,0.88)] p-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-md sm:rounded-[24px] sm:p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="px-1 sm:max-w-[24rem]">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {isEditing ? 'Update this existing log entry' : 'Save this log entry'}
            </p>
            <p className="mt-1 hidden text-xs leading-5 text-[var(--color-text-tertiary)] sm:block">
              {isEditing
                ? 'Your changes will replace the previous version in history.'
                : 'Keep the timeline current without leaving the form flow.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {isEditing && onCancel && (
              <Button type="button" variant="secondary" size="lg" onClick={onCancel} className="w-full sm:w-auto">
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              disabled={saving || submitDisabled}
              size="lg"
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              {saving ? savingLabel : isEditing ? updateLabel : submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
