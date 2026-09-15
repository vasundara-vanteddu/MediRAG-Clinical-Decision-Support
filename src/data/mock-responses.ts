import type { QueryResponse } from '@/src/types/api'

export const mockResponses: Record<string, QueryResponse> = {
  contrast: {
    answer: 'For a patient at elevated renal risk who requires iodinated contrast, the available evidence generally supports individualized risk assessment, appropriate isotonic volume expansion when clinically suitable, and review of concurrent nephrotoxic exposures. The retrieval set should be interpreted alongside local protocol and the patient’s current volume status.',
    citations: [
      { pmid: '38210417', title: 'Evidence-based strategies for prevention of contrast-associated acute kidney injury', abstract: 'A synthesis of hydration protocols, risk stratification, and medication considerations.' },
      { pmid: '22890468', title: 'KDIGO clinical practice guideline for acute kidney injury', abstract: 'Guideline recommendations for recognition, staging, prevention, and management.' },
    ],
    insufficient_evidence: false,
  },
  anticoagulation: {
    answer: 'The retrieved evidence discusses common peri-procedural anticoagulation considerations, but the available context is not sufficient to recommend a patient-specific hold or restart schedule. Confirm the procedure bleeding risk, indication, renal function, and local policy before acting.',
    citations: [{ pmid: '31422147', title: 'Medication management before iodinated contrast administration', abstract: 'A practical review of medications and comorbidities that influence risk.' }],
    insufficient_evidence: false,
  },
  fictional: {
    answer: 'No sufficient evidence was retrieved for this out-of-scope question. MediRAG should not generate a clinical recommendation when the evidence set does not support one.',
    citations: [],
    insufficient_evidence: true,
  },
}
