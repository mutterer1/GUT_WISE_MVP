import React from 'react';

export interface PatientNoteValues {
  whatChangedRecently: string;
  whatWorriesMeMost: string;
  whatIWantToAskMyDoctor: string;
}

interface PatientNotesSectionProps {
  value: PatientNoteValues;
  onChange?: (value: PatientNoteValues) => void;
  readOnly?: boolean;
  title?: string;
}

function NoteField({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {label}
      </label>
      {readOnly ? (
        <div className="min-h-[88px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-200">
          {value.trim().length > 0 ? value : 'No note added.'}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500"
        />
      )}
    </div>
  );
}

export default function PatientNotesSection({
  value,
  onChange,
  readOnly = false,
  title = 'Patient Notes for Appointment',
}: PatientNotesSectionProps) {
  const setField = (key: keyof PatientNoteValues, nextValue: string) => {
    if (!onChange) return;
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 print:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-4 border-b border-gray-100 pb-3 dark:border-white/[0.06]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#4A8FA8]">
          Patient Perspective
        </p>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Use this section to capture context and priorities for a clinician visit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <NoteField
          label="What changed recently"
          value={value.whatChangedRecently}
          onChange={(next) => setField('whatChangedRecently', next)}
          placeholder="Examples: symptoms became more frequent, medication changed, travel, stress, diet shift"
          readOnly={readOnly}
        />

        <NoteField
          label="What worries me most"
          value={value.whatWorriesMeMost}
          onChange={(next) => setField('whatWorriesMeMost', next)}
          placeholder="What feels most important, disruptive, or concerning right now?"
          readOnly={readOnly}
        />

        <NoteField
          label="What I want to ask my doctor"
          value={value.whatIWantToAskMyDoctor}
          onChange={(next) => setField('whatIWantToAskMyDoctor', next)}
          placeholder="List the questions you want to cover during the appointment."
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
