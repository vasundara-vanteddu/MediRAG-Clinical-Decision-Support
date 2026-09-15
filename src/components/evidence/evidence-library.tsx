'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Database,
  ExternalLink,
  FileText,
  FlaskConical,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { mockEvidence } from '@/src/data/mock-evidence'
import type { EvidenceRecord, RetrievalSource } from '@/src/types/evidence'

const filters: Array<{ value: 'all' | RetrievalSource; label: string }> = [
  { value: 'all', label: 'All methods' },
  { value: 'bm25', label: 'BM25' },
  { value: 'dense', label: 'Dense' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'reranked', label: 'Reranked' },
]

const methodLabels: Record<RetrievalSource, string> = {
  bm25: 'BM25',
  dense: 'Dense',
  hybrid: 'Hybrid',
  reranked: 'Reranked',
}

const methodColors: Record<RetrievalSource, string> = {
  bm25: 'bg-sky-400',
  dense: 'bg-violet-400',
  hybrid: 'bg-amber-400',
  reranked: 'bg-emerald-400',
}

function RetrievalGlyph({ source }: { source: RetrievalSource }) {
  return (
    <span className={`relative flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] ${source === 'reranked' ? 'text-emerald-300' : 'text-muted-foreground'}`} aria-label={`${methodLabels[source]} retrieval`}>
      {source === 'bm25' && <Search className="size-3.5" aria-hidden="true" />}
      {source === 'dense' && <Sparkles className="size-3.5" aria-hidden="true" />}
      {source === 'hybrid' && <FlaskConical className="size-3.5" aria-hidden="true" />}
      {source === 'reranked' && <Check className="size-3.5" aria-hidden="true" />}
    </span>
  )
}

function EvidenceRow({ record, expanded, onToggle }: { record: EvidenceRecord; expanded: boolean; onToggle: () => void }) {
  return (
    <motion.article layout className="border-b border-white/[0.07] last:border-b-0">
      <div className="grid grid-cols-[32px_minmax(0,1fr)_74px_28px] items-center gap-3 px-4 py-3 sm:grid-cols-[36px_34px_minmax(0,1fr)_92px_34px] sm:gap-4 sm:px-5">
        <span className="font-mono text-[11px] text-muted-foreground">{String(record.rank).padStart(2, '0')}</span>
        <RetrievalGlyph source={record.retrievalSource} />
        <div className="min-w-0">
          <a href={`https://pubmed.ncbi.nlm.nih.gov/${record.pmid}/`} target="_blank" rel="noreferrer" className="group block truncate text-[13px] font-medium text-foreground transition-colors hover:text-amber-300">
            <span className="mr-2 font-mono text-[10px] text-muted-foreground">{methodLabels[record.retrievalSource]}</span>
            {record.title}
            <ArrowUpRight className="ml-1 inline size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
          </a>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">{record.source} · PMID {record.pmid}</p>
        </div>
        <div className="hidden text-right sm:block">
          <span className="font-mono text-xs font-semibold text-emerald-300">{record.relevanceScore.toFixed(2)}</span>
          <div className="mt-1 ml-auto h-1 w-12 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${record.relevanceScore * 100}%` }} />
          </div>
        </div>
        <button type="button" onClick={onToggle} aria-expanded={expanded} aria-label={`${expanded ? 'Collapse' : 'Expand'} evidence record ${record.rank}`} className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground">
          {expanded ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="ml-[44px] mr-4 grid gap-3 border-l border-amber-300/20 pb-4 pl-4 sm:ml-[92px] sm:mr-16 sm:grid-cols-[minmax(0,1fr)_180px]">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300/80">Abstract excerpt</p>
                <p className="max-w-2xl text-xs leading-5 text-muted-foreground">{record.abstractExcerpt}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground sm:block sm:space-y-2">
                <span className="block rounded border border-white/[0.08] bg-white/[0.025] px-2 py-1.5">retrieval: <strong className="text-foreground">{record.retrievalSource}</strong></span>
                <span className="block rounded border border-white/[0.08] bg-white/[0.025] px-2 py-1.5">score: <strong className="text-emerald-300">{record.relevanceScore}</strong></span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

export function EvidenceLibrary() {
  const [query, setQuery] = useState('')
  const [method, setMethod] = useState<'all' | RetrievalSource>('all')
  const [expanded, setExpanded] = useState<number | null>(1)
  const [insufficient, setInsufficient] = useState(false)

  const records = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return mockEvidence.filter((record) => {
      const matchesMethod = method === 'all' || record.retrievalSource === method
      const matchesQuery = !normalized || [record.title, record.pmid, record.source, record.abstractExcerpt, record.retrievalSource].some((value) => value.toLowerCase().includes(normalized))
      return matchesMethod && matchesQuery
    })
  }, [method, query])

  const averageScore = records.length ? records.reduce((total, record) => total + record.relevanceScore, 0) / records.length : 0

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1440px] px-3 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-12 lg:pt-16">
        <header className="mb-7 flex flex-col gap-5 border-b border-white/[0.08] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300/80"><Database className="size-3.5" aria-hidden="true" />Evidence index / stage 03</div>
            <h1 className="font-serif text-[2.15rem] tracking-[-0.03em] text-foreground sm:text-[2.65rem]">Evidence Library</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Inspect the literature behind an answer. Search the indexed corpus, compare retrieval paths, and open the exact record used for citation.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />Live index snapshot <span className="font-mono text-foreground">2026.09.14</span></div>
        </header>

        <section className="grid gap-3 border-b border-white/[0.08] pb-6 sm:grid-cols-3" aria-label="Evidence library metrics">
          <div className="border-l border-amber-300/40 pl-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Indexed records</p><p className="mt-1 font-mono text-xl text-foreground">39,994</p></div>
          <div className="border-l border-white/10 pl-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Showing</p><p className="mt-1 font-mono text-xl text-foreground">{records.length.toString().padStart(2, '0')} <span className="text-xs text-muted-foreground">/ 08</span></p></div>
          <div className="border-l border-white/10 pl-3"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Mean relevance</p><p className="mt-1 font-mono text-xl text-emerald-300">{averageScore ? averageScore.toFixed(2) : '—'}</p></div>
        </section>

        <section className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" aria-label="Evidence controls">
          <label className="relative block min-w-0 flex-1 lg:max-w-xl">
            <span className="sr-only">Search evidence records</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, PMIDs, excerpts, methods…" className="h-11 w-full rounded-md border border-white/[0.1] bg-white/[0.035] pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-amber-300/50" />
          </label>
          <div className="flex flex-wrap items-center gap-2"><SlidersHorizontal className="size-3.5 text-muted-foreground" aria-hidden="true" />{filters.map((filter) => <button type="button" key={filter.value} onClick={() => setMethod(filter.value)} aria-pressed={method === filter.value} className={`rounded-md border px-3 py-2 text-[11px] transition-colors ${method === filter.value ? 'border-amber-300/50 bg-amber-300/10 text-amber-200' : 'border-white/[0.08] text-muted-foreground hover:border-white/20 hover:text-foreground'}`}>{filter.label}</button>)}</div>
        </section>

        <section className="mt-5 overflow-hidden rounded-lg border border-white/[0.09] bg-white/[0.018]" aria-label="Evidence records">
          <div className="grid grid-cols-[32px_minmax(0,1fr)_74px_28px] gap-3 border-b border-white/[0.08] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:grid-cols-[36px_34px_minmax(0,1fr)_92px_34px] sm:gap-4 sm:px-5"><span>#</span><span>Path</span><span>Record</span><span className="hidden text-right sm:block">Relevance</span><span /></div>
          {records.length > 0 ? records.map((record) => <EvidenceRow key={record.pmid} record={record} expanded={expanded === record.rank} onToggle={() => setExpanded(expanded === record.rank ? null : record.rank)} />) : <div className="flex flex-col items-center gap-3 px-6 py-16 text-center"><CircleAlert className="size-5 text-amber-300" aria-hidden="true" /><p className="text-sm text-foreground">No evidence matches this filter.</p><button type="button" onClick={() => { setQuery(''); setMethod('all') }} className="text-xs text-amber-300 hover:text-amber-200">Clear filters</button></div>}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.018] p-4 sm:p-5"><div className="flex items-start justify-between gap-4"><div><p className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><BookOpen className="size-3.5" aria-hidden="true" />Retrieval note</p><p className="text-sm leading-6 text-muted-foreground">Every record keeps its retrieval path visible so a clinician can distinguish lexical matches, semantic neighbors, hybrid candidates, and reranked citations.</p></div><FileText className="hidden size-5 text-amber-300/70 sm:block" aria-hidden="true" /></div></div>
          <button type="button" onClick={() => setInsufficient(!insufficient)} className="flex items-center justify-between gap-4 rounded-lg border border-amber-300/20 bg-amber-300/[0.04] p-4 text-left transition-colors hover:border-amber-300/40"><span><span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300/80">Demo state</span><span className="mt-1 block text-sm text-foreground">{insufficient ? 'Restore evidence corpus' : 'Inspect insufficient evidence'}</span></span><ExternalLink className="size-4 text-amber-300" aria-hidden="true" /></button>
        </section>

        <AnimatePresence>
          {insufficient && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-4 flex items-start gap-3 rounded-lg border border-rose-300/25 bg-rose-300/[0.05] p-4"><CircleAlert className="mt-0.5 size-4 shrink-0 text-rose-300" aria-hidden="true" /><div><p className="text-sm font-medium text-rose-100">Insufficient evidence for this question</p><p className="mt-1 text-xs leading-5 text-rose-100/65">No high-quality records support the requested claim. MediRAG would abstain rather than manufacture a citation.</p></div></motion.div>}
        </AnimatePresence>
      </div>
    </main>
  )
}
