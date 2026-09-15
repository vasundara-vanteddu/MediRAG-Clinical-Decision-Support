'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <section className="w-full max-w-lg rounded-2xl border border-warning/30 bg-card p-7 shadow-soft" role="alert" aria-labelledby="error-title">
        <div className="flex size-11 items-center justify-center rounded-xl bg-warning/10 text-warning"><AlertTriangle aria-hidden="true" className="size-5" /></div>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-evidence">MediRAG / recovery state</p>
        <h1 id="error-title" className="mt-3 text-3xl font-semibold tracking-tight">The workspace needs a reset.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">An unexpected application error interrupted this view. Your clinical context was not sent anywhere.</p>
        <button type="button" onClick={() => reset()} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"><RefreshCw data-icon="inline-start" className="size-4" />Try again</button>
      </section>
    </main>
  )
}
