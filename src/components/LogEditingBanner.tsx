import { Pencil } from 'lucide-react';

interface LogEditingBannerProps {
  isEditing: boolean;
  onCancel: () => void;
  title?: string;
  description?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
}

const toneClasses = {
  default: {
    container:
      'border-[rgba(84,160,255,0.18)] bg-[rgba(84,160,255,0.08)]',
    icon: 'border-[rgba(84,160,255,0.2)] bg-[rgba(84,160,255,0.14)] text-[var(--color-accent-primary)]',
    title: 'text-[var(--color-accent-primary)]',
  },
  danger: {
    container:
      'border-[rgba(255,120,120,0.18)] bg-[rgba(255,120,120,0.08)]',
    icon: 'border-[rgba(255,120,120,0.2)] bg-[rgba(255,120,120,0.14)] text-[var(--color-danger)]',
    title: 'text-[var(--color-danger)]',
  },
} as const;

export default function LogEditingBanner({
  isEditing,
  onCancel,
  title = 'Editing entry',
  description = 'Save changes to update the existing log, or cancel to return to a fresh entry.',
  cancelLabel = 'Cancel',
  tone = 'default',
}: LogEditingBannerProps) {
  if (!isEditing) {
    return null;
  }

  const palette = toneClasses[tone];

  return (
    <div
      className={[
        'mb-6 flex flex-col gap-4 rounded-[24px] border px-4 py-4 sm:flex-row sm:items-start sm:justify-between',
        palette.container,
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            'mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[16px] border',
            palette.icon,
          ].join(' ')}
        >
          <Pencil className="h-4 w-4" />
        </div>

        <div>
          <div className={['text-sm font-semibold', palette.title].join(' ')}>{title}</div>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="self-start text-sm text-[var(--color-text-tertiary)] transition-smooth hover:text-[var(--color-text-primary)]"
      >
        {cancelLabel}
      </button>
    </div>
  );
}