import { mockResponses } from '@/src/data/mock-responses'
import type { QueryResponse } from '@/src/types/api'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function submitClinicalQuery(query: string): Promise<QueryResponse> {
  void apiUrl
  const normalized = query.toLowerCase()
  if (normalized.includes('contrast') || normalized.includes('kidney')) return mockResponses.contrast
  if (normalized.includes('anticoag') || normalized.includes('warfarin')) return mockResponses.anticoagulation
  return mockResponses.fictional
}
