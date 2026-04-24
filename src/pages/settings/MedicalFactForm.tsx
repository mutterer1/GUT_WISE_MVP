import { useState } from 'react';
import { Save, X, ShieldCheck, Sparkles } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import type { FieldDef, CategoryConfig } from './medicalContextFields';

interface MedicalFactFormProps {
  config: CategoryConfig;
  initialDetail: Record<string, unknown>;
  initialNotes?: string;
  onSave: (detail: Record<string, unknown>, notes: string) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

const inputClasses =
  'w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-smooth placeholder:text-[var(--color-text-tertiary)] focus:border-[rgba(84,160,255,0.32)] focus:bg-[rgba(255,255,255,0.06)]';

const labelClasses =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]';

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (key: string, val: unknown) => void;
}) {
  if (field.type === 'boolean') {
    return (
      <div>
        <label className={labelClasses}>{field.label}</label>
        <label className="surface-panel-soft flex cursor-pointer items-center justify-between rounded-[22px] px-4 py-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Confirmed</p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              Use this only when the record clearly supports the field.
            </p>
          </div>
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(field.key, e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-transparent text-[var(--color-accent-primary)]"
          />
        </label>
      </div>
    );
  }

  if (field.type === 'select' && field.options) {
    return (
      <div>
        <label className={labelClasses}>
          {field.label}
          {field.required && <span className="ml-1 text-[rgba(248,113,113,0.95)]">*</span>}
        </label>
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(field.key, e.target.value || null)}
          className={inputClasses}
          required={field.required}
        >
          <option value="">Select...</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'tags') {
    const tags = Array.isArray(value) ? (value as string[]) : [];
    const tagString = tags.join(', ');

    return (
      <div>
        <label className={labelClasses}>{field.label}</label>
        <input
          type="text"
          value={tagString}
          onChange={(e) => {
            const nextTags = e.target.value
              .split(',')
              .map((entry) => entry.trim())
              .filter(Boolean);
            onChange(field.key, nextTags);
          }}
          placeholder={field.placeholder}
          className={inputClasses}
        />
      </div>
    );
  }

  return (
    <div>
      <label className={labelClasses}>
        {field.label}
        {field.required && <span className="ml-1 text-[rgba(248,113,113,0.95)]">*</span>}
      </label>
      <input
        type={field.type === 'date' ? 'date' : 'text'}
        value={(value as string) || ''}
        onChange={(e) => onChange(field.key, e.target.value || null)}
        placeholder={field.placeholder}
        className={inputClasses}
        required={field.required}
      />
    </div>
  );
}

export default function MedicalFactForm({
  config,
  initialDetail,
  initialNotes = '',
  onSave,
  onCancel,
  saving,
}: MedicalFactFormProps) {
  const [detail, setDetail] = useState<Record<string, unknown>>({ ...initialDetail });
  const [notes, setNotes] = useState(initialNotes);

  const handleFieldChange = (key: string, value: unknown) => {
    setDetail((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(detail, notes);
  };

  const booleanFields = config.fields.filter((field) => field.type === 'boolean');
  const nonBooleanFields = config.fields.filter((field) => field.type !== 'boolean');

  return (
    <Card variant="elevated" className="rounded-[30px]">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 border-b border-white/8 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <span className="badge-secondary mb-3 inline-flex">Structured Medical Context</span>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                Review and save {config.label.toLowerCase()}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Capture only what is relevant, observable, and helpful for personalizing future
                GutWise pattern analysis.
              </p>
            </div>

            <div className="surface-intelligence rounded-[24px] px-4 py-4 lg:max-w-[260px]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(133,93,255,0.16)] text-[var(--color-accent-secondary)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Context stays private
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">
                    Saved details only refine your own analysis workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {nonBooleanFields.map((field) => (
                  <div key={field.key} className={field.type === 'tags' ? 'sm:col-span-2' : undefined}>
                    <FieldInput field={field} value={detail[field.key]} onChange={handleFieldChange} />
                  </div>
                ))}
              </div>

              {booleanFields.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                    Confirmations
                  </p>
                  <div className="space-y-4">
                    {booleanFields.map((field) => (
                      <FieldInput
                        key={field.key}
                        field={field}
                        value={detail[field.key]}
                        onChange={handleFieldChange}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className={labelClasses}>
                  Personal Notes
                  <span className="ml-1 normal-case tracking-normal text-[var(--color-text-tertiary)]">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Example: dosage, diagnosis timing, or context worth remembering later"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Card variant="flat" className="rounded-[24px]">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                  Review Guidance
                </p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  <p>Prefer precise facts over broad summaries.</p>
                  <p>Leave uncertain values blank rather than estimating.</p>
                  <p>Use notes for nuance that may matter later during review.</p>
                </div>
              </Card>

              <Card
                variant="flat"
                className="rounded-[24px] border-[rgba(84,160,255,0.16)] bg-[rgba(84,160,255,0.06)]"
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent-primary)]" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Private account data
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      Saved medical context is stored privately to make insights more relevant to
                      your situation.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="border-t border-white/8 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Detail'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}
