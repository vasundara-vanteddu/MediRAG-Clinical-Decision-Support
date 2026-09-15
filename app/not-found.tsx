import Link from 'next/link'
import { ArrowLeft, CircleAlert } from 'lucide-react'
import { PageShell } from '@/src/components/layout/site-header'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageShell />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-5 py-16 lg:px-8">
        <section className="max-w-xl" aria-labelledby="not-found-title">
          <div className="flex size-11 items-center justify-center rounded-xl border border-warning/30 bg-warning/10 text-warning"><CircleAlert aria-hidden="true" className="size-5" /></div>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-evidence">MediRAG / 404</p>
          <h1 id="not-found-title" className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Evidence route not found.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">This page is not part of the current MediRAG workspace. Return to the clinical surface or choose a route from the navigation.</p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"><ArrowLeft data-icon="inline-start" className="size-4" />Return home</Link>
        </section>
      </main>
    </div>
  )
}
