import type { ClinicalImportKind } from './clinicalHistoryImportService';
import type { ClinicalImportSourceProfileId, MedicationImportSourceProfileId } from './importSourceProfileService';
import type { GenericMedicalImportSourceType } from '../types/medicalContext';

export type ImporterTemplateKind = 'medication_list' | 'clinical_history';

interface ImportTemplateBase<TKind extends ImporterTemplateKind, TConfig> {
  id: string;
  kind: TKind;
  name: string;
  description: string | null;
  config: TConfig;
  created_at: string;
  updated_at: string;
  is_built_in: boolean;
}

export interface MedicationImportTemplateConfig {
  sourceLabel: string;
  sourceReference: string;
  sourceProfileId: MedicationImportSourceProfileId | '';
  importNote: string;
}

export interface ClinicalImportTemplateConfig {
  sourceType: GenericMedicalImportSourceType;
  importKind: ClinicalImportKind;
  sourceLabel: string;
  sourceReference: string;
  sourceProfileId: ClinicalImportSourceProfileId | '';
  importNote: string;
}

export type MedicationImportTemplate = ImportTemplateBase<
  'medication_list',
  MedicationImportTemplateConfig
>;

export type ClinicalImportTemplate = ImportTemplateBase<
  'clinical_history',
  ClinicalImportTemplateConfig
>;

interface StoredImportTemplatesState {
  medication_list: MedicationImportTemplate[];
  clinical_history: ClinicalImportTemplate[];
}

const STORAGE_KEY = 'gutwise.import_templates.v1';

const BUILT_IN_MEDICATION_TEMPLATES: MedicationImportTemplate[] = [
  {
    id: 'starter-med-epic',
    kind: 'medication_list',
    name: 'Epic / MyChart Med List',
    description: 'Portal medication export with pharmacy-style column headers.',
    config: {
      sourceLabel: 'Epic / MyChart medication list',
      sourceReference: '',
      sourceProfileId: 'epic_mychart_medication_list',
      importNote: 'Imported from a patient portal medication export.',
    },
    created_at: '2026-04-25T00:00:00.000Z',
    updated_at: '2026-04-25T00:00:00.000Z',
    is_built_in: true,
  },
  {
    id: 'starter-med-pharmacy',
    kind: 'medication_list',
    name: 'Pharmacy Dispense Export',
    description: 'Best for refill or dispense-oriented exports that still need review normalization.',
    config: {
      sourceLabel: 'Pharmacy dispense export',
      sourceReference: '',
      sourceProfileId: 'pharmacy_dispense_export',
      importNote: 'Imported from a pharmacy dispense or refill list.',
    },
    created_at: '2026-04-25T00:00:00.000Z',
    updated_at: '2026-04-25T00:00:00.000Z',
    is_built_in: true,
  },
  {
    id: 'starter-med-clinician',
    kind: 'medication_list',
    name: 'Clinician Med Summary',
    description: 'Good starting template for typed clinician summaries or visit packets.',
    config: {
      sourceLabel: 'Clinician medication summary',
      sourceReference: '',
      sourceProfileId: 'clinician_medication_summary',
      importNote: 'Imported from a clinician-facing medication summary.',
    },
    created_at: '2026-04-25T00:00:00.000Z',
    updated_at: '2026-04-25T00:00:00.000Z',
    is_built_in: true,
  },
];

const BUILT_IN_CLINICAL_TEMPLATES: ClinicalImportTemplate[] = [
  {
    id: 'starter-clinical-epic',
    kind: 'clinical_history',
    name: 'Epic Problem / Allergy Export',
    description: 'Portal-style clinical exports that usually include problems, allergies, or both.',
    config: {
      sourceType: 'visit_summary',
      importKind: 'mixed_clinical',
      sourceLabel: 'Epic / MyChart clinical export',
      sourceReference: '',
      sourceProfileId: 'epic_problem_allergy_export',
      importNote: 'Imported from a patient portal problem or allergy export.',
    },
    created_at: '2026-04-25T00:00:00.000Z',
    updated_at: '2026-04-25T00:00:00.000Z',
    is_built_in: true,
  },
  {
    id: 'starter-clinical-visit',
    kind: 'clinical_history',
    name: 'Clinician Visit Summary',
    description: 'Best for clinician packets and visit notes that need category-aware normalization.',
    config: {
      sourceType: 'clinician_packet',
      importKind: 'mixed_clinical',
      sourceLabel: 'Clinician visit summary',
      sourceReference: '',
      sourceProfileId: 'clinician_visit_summary',
      importNote: 'Imported from a clinician visit summary or packet.',
    },
    created_at: '2026-04-25T00:00:00.000Z',
    updated_at: '2026-04-25T00:00:00.000Z',
    is_built_in: true,
  },
  {
    id: 'starter-clinical-lab',
    kind: 'clinical_history',
    name: 'Lab Findings Extract',
    description: 'Use for lab or findings summaries that may imply diagnoses or red-flag history.',
    config: {
      sourceType: 'lab_summary',
      importKind: 'mixed_clinical',
      sourceLabel: 'Lab findings summary',
      sourceReference: '',
      sourceProfileId: 'lab_summary_findings',
      importNote: 'Imported from a lab or findings summary.',
    },
    created_at: '2026-04-25T00:00:00.000Z',
    updated_at: '2026-04-25T00:00:00.000Z',
    is_built_in: true,
  },
];

function readStoredState(): StoredImportTemplatesState {
  if (typeof window === 'undefined') {
    return { medication_list: [], clinical_history: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { medication_list: [], clinical_history: [] };

    const parsed = JSON.parse(raw) as Partial<StoredImportTemplatesState>;
    return {
      medication_list: Array.isArray(parsed.medication_list) ? parsed.medication_list : [],
      clinical_history: Array.isArray(parsed.clinical_history) ? parsed.clinical_history : [],
    };
  } catch {
    return { medication_list: [], clinical_history: [] };
  }
}

function writeStoredState(next: StoredImportTemplatesState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function buildTemplateId(kind: ImporterTemplateKind): string {
  return `${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listMedicationImportTemplates(): MedicationImportTemplate[] {
  return [...BUILT_IN_MEDICATION_TEMPLATES, ...readStoredState().medication_list];
}

export function listClinicalImportTemplates(): ClinicalImportTemplate[] {
  return [...BUILT_IN_CLINICAL_TEMPLATES, ...readStoredState().clinical_history];
}

export function saveMedicationImportTemplate(input: {
  name: string;
  description?: string | null;
  config: MedicationImportTemplateConfig;
}): MedicationImportTemplate {
  const name = input.name.trim();
  if (!name) {
    throw new Error('Template name is required.');
  }

  const now = new Date().toISOString();
  const template: MedicationImportTemplate = {
    id: buildTemplateId('medication_list'),
    kind: 'medication_list',
    name,
    description: input.description?.trim() || null,
    config: input.config,
    created_at: now,
    updated_at: now,
    is_built_in: false,
  };

  const current = readStoredState();
  writeStoredState({
    ...current,
    medication_list: [template, ...current.medication_list],
  });

  return template;
}

export function saveClinicalImportTemplate(input: {
  name: string;
  description?: string | null;
  config: ClinicalImportTemplateConfig;
}): ClinicalImportTemplate {
  const name = input.name.trim();
  if (!name) {
    throw new Error('Template name is required.');
  }

  const now = new Date().toISOString();
  const template: ClinicalImportTemplate = {
    id: buildTemplateId('clinical_history'),
    kind: 'clinical_history',
    name,
    description: input.description?.trim() || null,
    config: input.config,
    created_at: now,
    updated_at: now,
    is_built_in: false,
  };

  const current = readStoredState();
  writeStoredState({
    ...current,
    clinical_history: [template, ...current.clinical_history],
  });

  return template;
}

export function deleteImportTemplate(
  kind: ImporterTemplateKind,
  templateId: string
): void {
  const current = readStoredState();
  if (kind === 'medication_list') {
    writeStoredState({
      ...current,
      medication_list: current.medication_list.filter((item) => item.id !== templateId),
    });
    return;
  }

  writeStoredState({
    ...current,
    clinical_history: current.clinical_history.filter((item) => item.id !== templateId),
  });
}