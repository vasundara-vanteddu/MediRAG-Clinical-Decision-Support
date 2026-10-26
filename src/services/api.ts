import type {
  QueryRequest,
  QueryResponse,
} from '@/src/types/api'

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'

export async function submitClinicalQuery(
  query: string
): Promise<QueryResponse> {
  const request: QueryRequest = {
    question: query,
    query: query,
  }

  const response = await fetch(`${apiUrl}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      `MediSphere API request failed: ${response.status} ${errorText}`.trim()
    )
  }

  const data = (await response.json()) as QueryResponse

  return data
}