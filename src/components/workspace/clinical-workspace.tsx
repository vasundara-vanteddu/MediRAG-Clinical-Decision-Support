'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Database,
  FileText,
  FlaskConical,
  LoaderCircle,
  PanelRight,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import dynamic from 'next/dynamic'

import { submitClinicalQuery } from '@/src/services/api'
import type { QueryResponse } from '@/src/types/api'
import type { SyntheticPatient } from '@/src/types/patient'

const MediRagScene = dynamic(
  () =>
    import('@/src/components/landing/medirag-scene').then(
      (module) => module.MediRagScene
    ),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0" aria-hidden="true" />
    ),
  }
)

const stages = [
  { label: 'Retrieve', detail: 'BM25 + Dense', icon: Search },
  { label: 'Fuse', detail: 'RRF ranking', icon: Database },
  { label: 'Rerank', detail: 'Cross-encoder', icon: FlaskConical },
  { label: 'Verify', detail: 'Evidence check', icon: ShieldCheck },
  { label: 'Generate', detail: 'Cited answer', icon: Sparkles },
]

function stageState(index: number, active: number) {
  if (active > index) return 'complete'
  if (active === index) return 'active'
  return 'idle'
}

export function ClinicalWorkspace() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patient')

  const [patient, setPatient] = useState<SyntheticPatient | null>(null)
  const [patientLoading, setPatientLoading] = useState(false)
  const [patientError, setPatientError] = useState(false)

  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<QueryResponse | null>(null)
  const [activeStage, setActiveStage] = useState(-1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadPatient() {
      if (!patientId) {
        setPatient(null)
        setPatientError(false)
        setPatientLoading(false)
        return
      }

      try {
        setPatientLoading(true)
        setPatientError(false)

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

        const response = await fetch(
          `${apiUrl}/patients/${encodeURIComponent(patientId)}`
        )

        if (!response.ok) {
          throw new Error('Patient not found')
        }

        const data = (await response.json()) as SyntheticPatient

        if (!cancelled) {
          setPatient(data)
        }
      } catch {
        if (!cancelled) {
          setPatient(null)
          setPatientError(true)
        }
      } finally {
        if (!cancelled) {
          setPatientLoading(false)
        }
      }
    }

    void loadPatient()

    return () => {
      cancelled = true
    }
  }, [patientId])

  async function runQuery() {
    if (!query.trim() || isSubmitting) return

    setError(false)
    setResponse(null)
    setIsSubmitting(true)
    setActiveStage(0)

    const timer = window.setInterval(
      () =>
        setActiveStage((current) =>
          Math.min(current + 1, stages.length - 1)
        ),
      430
    )

    try {
      const result = await submitClinicalQuery(query.trim())

      window.clearInterval(timer)
      setActiveStage(stages.length)
      setResponse(result)
    } catch {
      window.clearInterval(timer)
      setError(true)
      setActiveStage(-1)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function copyAnswer() {
    if (!response) return

    await navigator.clipboard.writeText(response.answer)

    setCopied(true)

    window.setTimeout(() => setCopied(false), 1600)
  }

  function reset() {
    setQuery('')
    setResponse(null)
    setError(false)
    setActiveStage(-1)
    setCopied(false)
    setDrawerOpen(false)
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-3 py-3 sm:px-5 lg:grid-cols-[minmax(250px,30%)_minmax(0,1fr)] lg:gap-0 lg:px-8 lg:py-4">
        <section className="relative h-[420px] min-h-0 overflow-hidden rounded-2xl border border-border bg-[#202833] text-white shadow-soft lg:h-[calc(100vh-7rem)] lg:rounded-l-2xl lg:rounded-r-none lg:border-r-0">
          <div className="absolute inset-0 overflow-hidden">
            <MediRagScene compact />
          </div>

          <div className="relative z-10 flex h-full min-h-0 flex-col justify-between bg-gradient-to-r from-[#202833]/90 via-[#202833]/42 to-transparent p-4 lg:p-5">
            <div className="max-w-[210px]">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-[#d99a57]">
                <span className="size-1.5 rounded-full bg-[#d99a57]" />
                Pipeline monitor
              </div>

              <h1 className="mt-3 text-xl font-semibold leading-tight tracking-tight">
                Evidence trail
              </h1>

              <p className="mt-2 text-xs leading-5 text-white/60">
                A compact view of retrieval, verification, and citation.
              </p>
            </div>

            <div className="rounded-lg border border-white/12 bg-[#17202b]/72 p-2.5 backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.12em] text-white/50">
                <span>Processing graph</span>

                <span className="text-[#d99a57]">
                  {isSubmitting
                    ? 'live'
                    : response
                      ? 'resolved'
                      : 'ready'}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {stages.map((stage, index) => {
                  const Icon = stage.icon
                  const state = stageState(index, activeStage)

                  return (
                    <div
                      key={stage.label}
                      className="flex min-w-0 items-center gap-1"
                    >
                      <div
                        className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-md border px-2 py-1.5 transition-colors ${
                          state === 'complete'
                            ? 'border-[#79a889]/60 bg-[#79a889]/15 text-[#b7d3bd]'
                            : state === 'active'
                              ? 'border-[#d99a57]/70 bg-[#d99a57]/15 text-[#f0c28f]'
                              : 'border-white/10 text-white/40'
                        }`}
                      >
                        <Icon
                          aria-hidden="true"
                          className="size-3 shrink-0"
                        />

                        <span className="truncate text-[9px] font-medium">
                          {stage.label}
                        </span>

                        {state === 'complete' && (
                          <Check
                            aria-hidden="true"
                            className="ml-auto size-3"
                          />
                        )}
                      </div>

                      {index < stages.length - 1 && (
                        <ChevronRight
                          aria-hidden="true"
                          className="size-3 shrink-0 text-white/25"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-[calc(100vh-7.5rem)] flex-col rounded-2xl border border-border bg-card shadow-soft lg:rounded-l-none lg:rounded-r-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-6 sm:py-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-evidence">
                Clinical workspace / stage 02
              </p>

              <h2 className="mt-2 text-[1.7rem] font-semibold tracking-tight">
                Ask a clinical question
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Answers stay close to the retrieved evidence.
              </p>
            </div>

            <button
              type="button"
              onClick={reset}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Reset workspace"
            >
              <RefreshCw aria-hidden="true" className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {patientId && (
              <div className="mb-4 rounded-xl border border-evidence/25 bg-evidence/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border border-evidence/20 bg-background p-2">
                    <UserRound
                      aria-hidden="true"
                      className="size-4 text-evidence"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-evidence">
                        Patient context
                      </p>

                      {patientLoading && (
                        <LoaderCircle
                          aria-hidden="true"
                          className="size-3 animate-spin text-evidence"
                        />
                      )}
                    </div>

                    {patient && (
                      <>
                        <p className="mt-1 font-mono text-sm font-semibold">
                          {patient.id}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Age {patient.age}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {patient.conditions.map((condition) => (
                            <span
                              key={condition}
                              className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {patientError && (
                      <p className="mt-2 text-xs text-warning">
                        Unable to load the selected patient context.
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-3 border-t border-evidence/15 pt-3 text-[11px] leading-5 text-muted-foreground">
                  Patient context is displayed separately and is not
                  automatically inserted into the evidence retrieval query.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-background p-3 focus-within:border-evidence/70 focus-within:ring-2 focus-within:ring-evidence/15">
              <textarea
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing &&
                    event.keyCode !== 229
                  ) {
                    event.preventDefault()
                    void runQuery()
                  }
                }}
                placeholder="e.g. What should I consider before iodinated contrast in a patient with renal risk?"
                className="min-h-28 w-full resize-none border-0 bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground"
                aria-label="Clinical question"
              />

              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <span className="text-[11px] text-muted-foreground">
                  Shift + Enter for a new line
                </span>

                <button
                  type="button"
                  onClick={() => void runQuery()}
                  disabled={!query.trim() || isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>
                    {isSubmitting ? 'Processing' : 'Run retrieval'}
                  </span>

                  {isSubmitting ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-3.5 animate-spin"
                    />
                  ) : (
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5"
                    />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!response && !isSubmitting && !error && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-10"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                      <BookOpen
                        aria-hidden="true"
                        className="size-4"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">
                        Start with a focused question
                      </h3>

                      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                        Try a medication, diagnosis, or procedure question.
                        The workspace will show the evidence trail before
                        the answer.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setQuery(
                              'What should I consider before iodinated contrast in a patient with renal risk?'
                            )
                          }
                          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          Contrast + renal risk
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setQuery(
                              'What are the peri-procedural anticoagulation considerations?'
                            )
                          }
                          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          Anticoagulation
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {isSubmitting && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-10"
                >
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-4 animate-spin text-evidence"
                    />
                    Resolving evidence chain
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    {stages.map((stage, index) => (
                      <div
                        key={stage.label}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span
                          className={`flex size-6 items-center justify-center rounded-full border text-[10px] ${
                            index < activeStage
                              ? 'border-verification bg-verification/10 text-verification'
                              : index === activeStage
                                ? 'border-evidence bg-evidence/10 text-evidence'
                                : 'border-border text-muted-foreground'
                          }`}
                        >
                          {index < activeStage ? (
                            <Check
                              aria-hidden="true"
                              className="size-3"
                            />
                          ) : (
                            index + 1
                          )}
                        </span>

                        <span
                          className={
                            index <= activeStage
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }
                        >
                          {stage.label}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {stage.detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-10"
                >
                  <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-warning">
                      <AlertCircle
                        aria-hidden="true"
                        className="size-4"
                      />
                      Retrieval unavailable
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      The evidence service did not respond. Check the
                      connection and try again.
                    </p>

                    <button
                      type="button"
                      onClick={() => void runQuery()}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                    >
                      <RefreshCw
                        aria-hidden="true"
                        className="size-3.5"
                      />
                      Retry
                    </button>
                  </div>
                </motion.div>
              )}

              {response && (
                <motion.div
                  key="response"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-7"
                >
                  <div
                    className={`rounded-xl border p-4 ${
                      response.insufficient_evidence
                        ? 'border-warning/30 bg-warning/5'
                        : 'border-verification/25 bg-verification/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span
                          className={`size-2 rounded-full ${
                            response.insufficient_evidence
                              ? 'bg-warning'
                              : 'bg-verification'
                          }`}
                        />

                        {response.insufficient_evidence
                          ? 'Insufficient evidence'
                          : 'Evidence-grounded answer'}
                      </div>

                      <button
                        type="button"
                        onClick={() => void copyAnswer()}
                        className="inline-flex items-center gap-1.5 rounded p-1.5 text-muted-foreground hover:bg-card"
                        aria-label="Copy answer"
                      >
                        <Copy
                          aria-hidden="true"
                          className="size-3.5"
                        />

                        <span className="sr-only">
                          {copied ? 'Answer copied' : 'Copy answer'}
                        </span>
                      </button>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-foreground">
                      {response.answer}
                    </p>

                    {!response.insufficient_evidence &&
                      response.citations.length > 0 && (
                        <div
                          className="mt-4 flex flex-wrap items-center gap-2"
                          aria-label="Answer citations"
                        >
                          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                            Citations
                          </span>

                          {response.citations.map((citation, index) => (
                            <button
                              key={citation.pmid}
                              type="button"
                              onClick={() => setDrawerOpen(true)}
                              className="rounded-full border border-evidence/30 px-2.5 py-1 font-mono text-[10px] text-evidence transition-colors hover:bg-evidence/10"
                              aria-label={`Open citation ${index + 1}: ${citation.title}`}
                            >
                              [{index + 1}]
                            </button>
                          ))}
                        </div>
                      )}
                  </div>

                  {!response.insufficient_evidence && (
                    <>
                      <div className="mt-7 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold">
                            Supporting sources
                          </h3>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {response.citations.length} citations attached to
                            this answer
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setDrawerOpen(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-evidence hover:underline"
                        >
                          Open source rail
                          <PanelRight
                            aria-hidden="true"
                            className="size-3.5"
                          />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-col gap-2">
                        {response.citations.map((citation) => (
                          <button
                            key={citation.pmid}
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="flex items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted"
                          >
                            <FileText
                              aria-hidden="true"
                              className="mt-0.5 size-4 shrink-0 text-evidence"
                            />

                            <span className="min-w-0">
                              <span className="block text-xs font-semibold leading-5">
                                {citation.title}
                              </span>

                              <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                                PMID {citation.pmid}
                              </span>
                            </span>

                            <ChevronRight
                              aria-hidden="true"
                              className="ml-auto mt-1 size-3.5 shrink-0 text-muted-foreground"
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between border-t border-border px-6 py-3 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 aria-hidden="true" className="size-3" />
              Traceable by default
            </span>

            <span>Evidence set v0.3</span>
          </div>
        </section>
      </div>

      <EvidenceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        response={response}
      />
    </main>
  )
}

function EvidenceDrawer({
  open,
  onClose,
  response,
}: {
  open: boolean
  onClose: () => void
  response: QueryResponse | null
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () =>
      window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  const records =
    response?.citations.map((citation) => ({
      rank: citation.rank,
      title: citation.title,
      pmid: citation.pmid,
      abstract: citation.abstract,
      score: citation.score,
    })) ?? []

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close evidence drawer"
            onClick={onClose}
            className="fixed inset-0 z-40 cursor-default bg-primary/15 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="evidence-drawer-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 260,
            }}
          >
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-evidence">
                  Evidence rail
                </p>

                <h2
                  id="evidence-drawer-title"
                  className="mt-1 text-lg font-semibold"
                >
                  Retrieved sources
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Ranked and traceable references
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close evidence drawer"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto p-5">
              {records.map((record) => (
                <article
                  key={record.pmid}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Rank {record.rank} / MedCPT reranked
                    </span>

                    <span className="rounded-full bg-verification/10 px-2 py-1 font-mono text-[10px] text-verification">
                      Score {record.score.toFixed(2)}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-semibold leading-5">
                    {record.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {record.abstract}
                  </p>

                  <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>PMID {record.pmid}</span>
                    <span>PubMed</span>
                  </div>
                </article>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}