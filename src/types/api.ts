export interface Citation {
  pmid: string
  title: string
  abstract: string
  score: number
  rank: number
}

export interface QueryResponse {
  answer: string
  citations: Citation[]
  insufficient_evidence: boolean
}

export interface QueryRequest {
  query: string
}