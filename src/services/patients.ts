import type { SyntheticPatient } from '@/src/types/patient'

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'

export async function getPatients(
  search = ''
): Promise<SyntheticPatient[]> {
  const params = new URLSearchParams()

  if (search.trim()) {
    params.set('search', search.trim())
  }

  const query = params.toString()
  const url = query
    ? `${apiUrl}/patients?${query}`
    : `${apiUrl}/patients`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Patient API request failed: ${response.status}`
    )
  }

  return (await response.json()) as SyntheticPatient[]
}