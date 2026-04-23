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
    id: 'ppi_family',
    label: 'PPI',
    family: 'ppi',
    matchTerms: [
      'omeprazole',
      'pantoprazole',
      'esomeprazole',
      'lansoprazole',
      'rabeprazole',
      'dexlansoprazole',
      'prilosec',
      'protonix',
      'nexium',
      'ppi',
    ],
    gutEffects: ['acid_suppression', 'bloating_risk'],
    commonGutEffects: ['acid suppression', 'bloating', 'microbiome shift'],
  },
  {
    id: 'h2_blocker_family',
    label: 'H2 Blocker',
    family: 'h2_blocker',
    matchTerms: [
      'famotidine',
      'ranitidine',
      'cimetidine',
      'pepcid',
      'h2 blocker',
    ],
    gutEffects: ['acid_suppression'],
    commonGutEffects: ['acid suppression'],
  },
  {
    id: 'antibiotic_family',
    label: 'Antibiotic',
    family: 'antibiotic',
    matchTerms: [
      'amoxicillin',
      'augmentin',
      'azithromycin',
      'zithromax',
      'doxycycline',
      'cipro',
      'ciprofloxacin',
      'metronidazole',
      'flagyl',
      'cephalexin',
      'keflex',
      'nitrofurantoin',
      'bactrim',
      'antibiotic',
    ],
    gutEffects: ['microbiome_disruption', 'diarrhea_risk', 'nausea_risk'],
    commonGutEffects: ['diarrhea', 'nausea', 'microbiome disruption'],
  },
  {
    id: 'laxative_family',
    label: 'Laxative',
    family: 'laxative',
    matchTerms: [
      'miralax',
      'polyethylene glycol',
      'peg 3350',
      'senna',
      'bisacodyl',
      'dulcolax',
      'docusate',
      'colace',
      'laxative',
    ],
    gutEffects: ['motility_speeding', 'diarrhea_risk'],
    commonGutEffects: ['looser stool', 'urgency'],
  },
  {
    id: 'antidiarrheal_family',
    label: 'Antidiarrheal',
    family: 'antidiarrheal',
    matchTerms: [
      'imodium',
      'loperamide',
      'bismuth',
      'pepto',
      'antidiarrheal',
    ],
    gutEffects: ['motility_slowing', 'constipation_risk'],
    commonGutEffects: ['slower motility', 'constipation'],
  },
  {
    id: 'nsaid_family',
    label: 'NSAID',
    family: 'nsaid',
    matchTerms: [
      'ibuprofen',
      'naproxen',
      'diclofenac',
      'celecoxib',
      'advil',
      'aleve',
      'nsaid',
    ],
    gutEffects: ['nausea_risk', 'reflux_risk'],
    commonGutEffects: ['stomach irritation', 'nausea', 'reflux'],
  },
  {
    id: 'metformin_family',
    label: 'Metformin',
    family: 'metformin',
    matchTerms: ['metformin', 'glucophage'],
    gutEffects: ['motility_speeding', 'diarrhea_risk', 'bloating_risk'],
    commonGutEffects: ['diarrhea', 'bloating', 'GI upset'],
  },
  {
    id: 'magnesium_family',
    label: 'Magnesium',
    family: 'magnesium',
    matchTerms: [
      'magnesium',
      'magnesium citrate',
      'magnesium oxide',
      'magnesium hydroxide',
    ],
    gutEffects: ['motility_speeding', 'diarrhea_risk'],
    commonGutEffects: ['looser stool', 'diarrhea'],
  },
  {
    id: 'iron_family',
    label: 'Iron',
    family: 'iron',
    matchTerms: [
      'iron',
      'ferrous sulfate',
      'ferrous gluconate',
      'ferrous fumarate',
      'iron supplement',
    ],
    gutEffects: ['motility_slowing', 'constipation_risk', 'nausea_risk'],
    commonGutEffects: ['constipation', 'nausea'],
  },
  {
    id: 'probiotic_family',
    label: 'Probiotic',
    family: 'probiotic',
    matchTerms: [
      'probiotic',
      'lactobacillus',
      'bifidobacterium',
      'align',
      'culturelle',
      'florastor',
    ],
    gutEffects: ['bloating_risk'],
    commonGutEffects: ['temporary bloating', 'gas'],
  },
  {
    id: 'fiber_supplement_family',
    label: 'Fiber Supplement',
    family: 'fiber_supplement',
    matchTerms: [
      'psyllium',
      'metamucil',
      'benefiber',
      'fiber supplement',
      'methylcellulose',
    ],
    gutEffects: ['motility_speeding', 'bloating_risk'],
    commonGutEffects: ['bulk increase', 'bloating'],
  },
  {
    id: 'opioid_family',
    label: 'Opioid',
    family: 'opioid',
    matchTerms: [
      'oxycodone',
      'hydrocodone',
      'tramadol',
      'morphine',
      'codeine',
      'opioid',
      'percocet',
      'norco',
    ],
    gutEffects: ['motility_slowing', 'constipation_risk', 'nausea_risk'],
    commonGutEffects: ['constipation', 'nausea'],
  },
  {
    id: 'ssri_family',
    label: 'SSRI',
    family: 'ssri',
    matchTerms: [
      'sertraline',
      'fluoxetine',
      'escitalopram',
      'citalopram',
      'paroxetine',
      'prozac',
      'zoloft',
      'lexapro',
      'ssri',
    ],
    gutEffects: ['diarrhea_risk', 'nausea_risk'],
    commonGutEffects: ['nausea', 'looser stool'],
  },
  {
    id: 'gi_antiinflammatory_family',
    label: 'GI Anti-inflammatory',
    family: 'gi_antiinflammatory',
    matchTerms: [
      'mesalamine',
      'lialda',
      'pentasa',
      'apriso',
      'budesonide',
      'uceris',
      'entocort',
    ],
    gutEffects: [],
    commonGutEffects: ['GI-directed treatment'],
  },
];
