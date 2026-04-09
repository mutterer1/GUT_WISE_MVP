import type { MedicalFactCategory } from '../../types/medicalContext';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean' | 'tags';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

export interface CategoryConfig {
  key: MedicalFactCategory;
  label: string;
  description: string;
  fields: FieldDef[];
  displayField: string;
}

const GI_RELEVANCE_OPTIONS = [
  { value: 'primary', label: 'Primary GI condition' },
  { value: 'secondary', label: 'Secondary / related' },
  { value: 'indirect', label: 'Indirect relevance' },
];

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    key: 'diagnosis',
    label: 'Diagnoses',
    description: 'Confirmed medical diagnoses relevant to gut health',
    displayField: 'condition_name',
    fields: [
      { key: 'condition_name', label: 'Condition Name', type: 'text', required: true, placeholder: 'e.g. IBS, Crohn\'s Disease' },
      { key: 'icd_code', label: 'ICD Code', type: 'text', placeholder: 'Optional' },
      { key: 'diagnosed_date', label: 'Date Diagnosed', type: 'date' },
      { key: 'diagnosing_provider', label: 'Diagnosing Provider', type: 'text', placeholder: 'Optional' },
      { key: 'severity', label: 'Severity', type: 'select', options: SEVERITY_OPTIONS },
      { key: 'gi_relevance', label: 'GI Relevance', type: 'select', options: GI_RELEVANCE_OPTIONS, required: true },
    ],
  },
  {
    key: 'suspected_condition',
    label: 'Suspected Conditions',
    description: 'Conditions being investigated or suspected',
    displayField: 'condition_name',
    fields: [
      { key: 'condition_name', label: 'Condition Name', type: 'text', required: true, placeholder: 'e.g. SIBO, Celiac' },
      { key: 'suspicion_basis', label: 'Basis for Suspicion', type: 'text', placeholder: 'e.g. symptom pattern, family history' },
      { key: 'under_investigation', label: 'Currently Under Investigation', type: 'boolean' },
      { key: 'gi_relevance', label: 'GI Relevance', type: 'select', options: GI_RELEVANCE_OPTIONS, required: true },
    ],
  },
  {
    key: 'medication',
    label: 'GI-Relevant Medications',
    description: 'Current or past medications that affect gut health',
    displayField: 'medication_name',
    fields: [
      { key: 'medication_name', label: 'Medication Name', type: 'text', required: true, placeholder: 'e.g. Omeprazole, Mesalamine' },
      { key: 'dosage', label: 'Dosage', type: 'text', placeholder: 'e.g. 20mg' },
      { key: 'frequency', label: 'Frequency', type: 'text', placeholder: 'e.g. once daily' },
      { key: 'prescribing_reason', label: 'Prescribing Reason', type: 'text', placeholder: 'e.g. acid reflux' },
      { key: 'gi_side_effects_known', label: 'Known GI Side Effects', type: 'boolean' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'is_current', label: 'Currently Taking', type: 'boolean' },
    ],
  },
  {
    key: 'surgery_procedure',
    label: 'Surgeries & Procedures',
    description: 'Past surgical procedures relevant to digestive health',
    displayField: 'procedure_name',
    fields: [
      { key: 'procedure_name', label: 'Procedure Name', type: 'text', required: true, placeholder: 'e.g. Appendectomy, Colonoscopy' },
      { key: 'procedure_date', label: 'Procedure Date', type: 'date' },
      { key: 'body_region', label: 'Body Region', type: 'text', placeholder: 'e.g. abdomen, colon' },
      { key: 'gi_relevance', label: 'GI Relevance', type: 'select', options: GI_RELEVANCE_OPTIONS, required: true },
      { key: 'complications', label: 'Complications', type: 'text', placeholder: 'Optional' },
    ],
  },
  {
    key: 'allergy_intolerance',
    label: 'Allergies & Intolerances',
    description: 'Food allergies, intolerances, and sensitivities',
    displayField: 'substance',
    fields: [
      { key: 'substance', label: 'Substance', type: 'text', required: true, placeholder: 'e.g. Lactose, Gluten, Shellfish' },
      {
        key: 'reaction_type', label: 'Reaction Type', type: 'select', required: true, options: [
          { value: 'allergy', label: 'Allergy' },
          { value: 'intolerance', label: 'Intolerance' },
          { value: 'sensitivity', label: 'Sensitivity' },
        ],
      },
      {
        key: 'severity', label: 'Severity', type: 'select', options: [
          ...SEVERITY_OPTIONS,
          { value: 'life_threatening', label: 'Life-threatening' },
        ],
      },
      { key: 'confirmed_by_testing', label: 'Confirmed by Testing', type: 'boolean' },
      { key: 'gi_symptoms', label: 'GI Symptoms', type: 'tags', placeholder: 'e.g. bloating, cramping (comma-separated)' },
    ],
  },
  {
    key: 'diet_guidance',
    label: 'Clinician Diet Instructions',
    description: 'Diet plans prescribed or recommended by a clinician',
    displayField: 'guidance_type',
    fields: [
      { key: 'guidance_type', label: 'Diet Type', type: 'text', required: true, placeholder: 'e.g. Low-FODMAP, Elimination Diet' },
      { key: 'prescribed_by', label: 'Prescribed By', type: 'text', placeholder: 'Optional' },
      { key: 'prescribed_date', label: 'Prescribed Date', type: 'date' },
      { key: 'foods_to_avoid', label: 'Foods to Avoid', type: 'tags', placeholder: 'Comma-separated list' },
      { key: 'foods_to_include', label: 'Foods to Include', type: 'tags', placeholder: 'Comma-separated list' },
      { key: 'rationale', label: 'Rationale', type: 'text', placeholder: 'Optional' },
      { key: 'is_current', label: 'Currently Following', type: 'boolean' },
    ],
  },
  {
    key: 'red_flag_history',
    label: 'Red-Flag History',
    description: 'Significant medical events or caution factors',
    displayField: 'flag_type',
    fields: [
      { key: 'flag_type', label: 'Flag Type', type: 'text', required: true, placeholder: 'e.g. rectal bleeding, unexplained weight loss' },
      { key: 'description', label: 'Description', type: 'text', required: true, placeholder: 'Brief description' },
      { key: 'occurrence_date', label: 'Occurrence Date', type: 'date' },
      { key: 'resolved', label: 'Resolved', type: 'boolean' },
      { key: 'clinical_action_taken', label: 'Clinical Action Taken', type: 'text', placeholder: 'Optional' },
    ],
  },
];

export function getCategoryConfig(category: MedicalFactCategory): CategoryConfig {
  return CATEGORY_CONFIGS.find(c => c.key === category)!;
}

export function buildDefaultDetail(category: MedicalFactCategory): Record<string, unknown> {
  const config = getCategoryConfig(category);
  const detail: Record<string, unknown> = {};
  for (const field of config.fields) {
    if (field.type === 'boolean') detail[field.key] = false;
    else if (field.type === 'tags') detail[field.key] = [];
    else detail[field.key] = field.type === 'select' && field.options?.length ? '' : '';
  }
  return detail;
}
