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
    <div className="sticky bottom-3 z-20 pt-2 safe-area-inset-bottom">
      <div className="rounded-[24px] border border-white/10 bg-[rgba(11,17,25,0.78)] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="px-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {isEditing ? 'Update this existing log entry' : 'Save this log entry'}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">
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