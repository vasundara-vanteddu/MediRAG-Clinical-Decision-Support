import type { SyntheticPatient } from '@/src/types/patient'

export const mockPatients: SyntheticPatient[] = [
  { id: 'MRG-1042', age: 67, conditions: ['Type 2 diabetes', 'Hypertension', 'Chronic kidney disease, stage 3a'] },
  { id: 'MRG-2087', age: 54, conditions: ['Atrial fibrillation', 'Hyperlipidemia'] },
  { id: 'MRG-3119', age: 72, conditions: ['Heart failure with preserved ejection fraction', 'Chronic kidney disease, stage 2'] },
]
