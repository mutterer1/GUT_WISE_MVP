import { useState } from 'react';
import { Save, X } from 'lucide-react';
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

const inputClasses = 'w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/[0.04] text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm';
const labelClasses = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

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
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(field.key, e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 dark:border-white/10 text-brand-500 focus:ring-brand-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
      </label>
    );
  }

  if (field.type === 'select' && field.options) {
    return (
      <div>
        <label className={labelClasses}>{field.label}{field.required && ' *'}</label>
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(field.key, e.target.value || null)}
          className={inputClasses}
          required={field.required}
        >
          <option value="">Select...</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'tags') {
    const tags = Array.isArray(value) ? value as string[] : [];
    const tagStr = tags.join(', ');
    return (
      <div>
        <label className={labelClasses}>{field.label}</label>
        <input
          type="text"
          value={tagStr}
          onChange={(e) => {
            const arr = e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            onChange(field.key, arr);
          }}
          placeholder={field.placeholder}
          className={inputClasses}
        />
      </div>
    );
  }

  return (
    <div>
      <label className={labelClasses}>{field.label}{field.required && ' *'}</label>
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

  const handleFieldChange = (key: string, val: unknown) => {
    setDetail((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(detail, notes);
  };

  const booleanFields = config.fields.filter((f) => f.type === 'boolean');
  const nonBooleanFields = config.fields.filter((f) => f.type !== 'boolean');

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {nonBooleanFields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={detail[field.key]}
              onChange={handleFieldChange}
            />
          ))}

          {booleanFields.length > 0 && (
            <div className="space-y-3 pt-2">
              {booleanFields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={detail[field.key]}
                  onChange={handleFieldChange}
                />
              ))}
            </div>
          )}

          <div>
            <label className={labelClasses}>Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this entry"
              className={inputClasses}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-white/[0.08]">
          <Button type="submit" disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
