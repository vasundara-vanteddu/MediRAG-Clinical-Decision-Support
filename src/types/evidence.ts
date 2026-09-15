export type RetrievalSource = 'bm25' | 'dense' | 'hybrid' | 'reranked'

export interface EvidenceRecord {
  rank: number
  title: string
  pmid: string
  source: string
  relevanceScore: number
  retrievalSource: RetrievalSource
  abstractExcerpt: string
}
