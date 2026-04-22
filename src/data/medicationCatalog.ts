export type MedicationFamilyKey =
  | 'ppi'
  | 'h2_blocker'
  | 'antibiotic'
  | 'laxative'
  | 'antidiarrheal'
  | 'nsaid'
  | 'metformin'
  | 'magnesium'
  | 'iron'
  | 'probiotic'
  | 'fiber_supplement'
  | 'opioid'
  | 'ssri'
  | 'gi_antiinflammatory';

export type MedicationGutEffectKey =
  | 'acid_suppression'
  | 'microbiome_disruption'
  | 'motility_slowing'
  | 'motility_speeding'
  | 'constipation_risk'
  | 'diarrhea_risk'
  | 'nausea_risk'
  | 'reflux_risk'
  | 'bloating_risk';

export interface MedicationCatalogEntry {
  id: string;
  label: string;
  family: MedicationFamilyKey;
  matchTerms: string[];
  gutEffects: MedicationGutEffectKey[];
  commonGutEffects: string[];
}

export const MEDICATION_CATALOG: MedicationCatalogEntry[] = [
  {
    id: 'omeprazole_ppi',
    label: 'PPI',
    family: 'ppi',
    matchTerms: ['omeprazole', 'pantoprazole', 'esomeprazole', 'lansoprazole', 'ppi'],
    gutEffects: ['acid_suppression', 'bloating_risk'],
    commonGutEffects: ['acid suppression', 'bloating', 'microbiome shift'],
  },
  {
    id: 'h2_blocker',
    label: 'H2 Blocker',
    family: 'h2_blocker',
    matchTerms: ['famotidine', 'ranitidine', 'cimetidine', 'h2 blocker'],
    gutEffects: ['acid_suppression'],
    commonGutEffects: ['acid suppression'],
  },
  {
    id: 'antibiotic',
    label: 'Antibiotic',
    family: 'antibiotic',
    matchTerms: ['amoxicillin', 'augmentin', 'azithromycin', 'doxycycline', 'cipro', 'metronidazole', 'antibiotic'],
    gutEffects: ['microbiome_disruption', 'diarrhea_risk', 'nausea_risk'],
    commonGutEffects: ['diarrhea', 'nausea', 'microbiome disruption'],
  },
  {
    id: 'laxative',
    label: 'Laxative',
    family: 'laxative',
    matchTerms: ['miralax', 'polyethylene glycol', 'senna', 'bisacodyl', 'laxative'],
    gutEffects: ['motility_speeding', 'diarrhea_risk'],
    commonGutEffects: ['looser stool', 'urgency'],
  },
  {
    id: 'antidiarrheal',
    label: 'Antidiarrheal',
    family: 'antidiarrheal',
    matchTerms: ['imodium', 'loperamide', 'antidiarrheal'],
    gutEffects: ['motility_slowing', 'constipation_risk'],
    commonGutEffects: ['slower motility', 'constipation'],
  },
  {
    id: 'nsaid',
    label: 'NSAID',
    family: 'nsaid',
    matchTerms: ['ibuprofen', 'naproxen', 'diclofenac', 'nsaid'],
    gutEffects: ['nausea_risk', 'reflux_risk'],
    commonGutEffects: ['stomach irritation', 'nausea', 'reflux'],
  },
  {
    id: 'metformin',
    label: 'Metformin',
    family: 'metformin',
    matchTerms: ['metformin'],
    gutEffects: ['motility_speeding', 'diarrhea_risk', 'bloating_risk'],
    commonGutEffects: ['diarrhea', 'bloating', 'GI upset'],
  },
  {
    id: 'magnesium',
    label: 'Magnesium',
    family: 'magnesium',
    matchTerms: ['magnesium'],
    gutEffects: ['motility_speeding', 'diarrhea_risk'],
    commonGutEffects: ['looser stool', 'diarrhea'],
  },
  {
    id: 'iron',
    label: 'Iron',
    family: 'iron',
    matchTerms: ['iron', 'ferrous'],
    gutEffects: ['motility_slowing', 'constipation_risk', 'nausea_risk'],
    commonGutEffects: ['constipation', 'nausea'],
  },
  {
    id: 'probiotic',
    label: 'Probiotic',
    family: 'probiotic',
    matchTerms: ['probiotic'],
    gutEffects: ['bloating_risk'],
    commonGutEffects: ['temporary bloating', 'gas'],
  },
  {
    id: 'fiber_supplement',
    label: 'Fiber Supplement',
    family: 'fiber_supplement',
    matchTerms: ['psyllium', 'metamucil', 'fiber'],
    gutEffects: ['motility_speeding', 'bloating_risk'],
    commonGutEffects: ['bulk increase', 'bloating'],
  },
  {
    id: 'opioid',
    label: 'Opioid',
    family: 'opioid',
    matchTerms: ['oxycodone', 'hydrocodone', 'tramadol', 'morphine', 'opioid'],
    gutEffects: ['motility_slowing', 'constipation_risk', 'nausea_risk'],
    commonGutEffects: ['constipation', 'nausea'],
  },
  {
    id: 'ssri',
    label: 'SSRI',
    family: 'ssri',
    matchTerms: ['sertraline', 'fluoxetine', 'escitalopram', 'citalopram', 'ssri'],
    gutEffects: ['diarrhea_risk', 'nausea_risk'],
    commonGutEffects: ['nausea', 'looser stool'],
  },
  {
    id: 'mesalamine',
    label: 'GI Anti-inflammatory',
    family: 'gi_antiinflammatory',
    matchTerms: ['mesalamine', 'lialda', 'pentasa'],
    gutEffects: [],
    commonGutEffects: ['GI-directed treatment'],
  },
];
