import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PageShell } from '@/src/components/layout/site-header'
import { LandingScene } from '@/src/components/landing/landing-client'

export default function Page() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <PageShell />
      <main className="relative min-h-[calc(100vh-4rem)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_67%_45%,rgba(200,121,46,0.07),transparent_30%)]" />
        <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1440px] flex-col px-5 pb-24 pt-10 sm:pt-12 md:justify-center md:px-8 md:pb-20 md:pt-0 lg:px-10" aria-labelledby="hero-title">
          <div className="relative z-10 flex w-full max-w-full flex-col pb-4 md:max-w-[43%] md:pb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-evidence">MediRAG / Evidence infrastructure</p>
            <h1 id="hero-title" className="mt-4 max-w-[430px] text-[3.6rem] font-semibold leading-[0.94] tracking-[-0.065em] sm:text-[4.5rem]">Evidence before<br />inference.</h1>
            <p className="mt-5 text-sm font-medium tracking-[0.01em] text-foreground/90">Evidence-Grounded Medical Intelligence</p>
            <p className="mt-3 max-w-[470px] text-[1.05rem] leading-7 text-muted-foreground">MediRAG is an evidence-grounded medical retrieval-augmented generation platform for transparent clinical decision support.</p>
            <p className="mt-4 max-w-[430px] text-sm leading-6 text-muted-foreground/80">Retrieve biomedical evidence, verify its relevance, and generate grounded clinical responses with a visible source trail.</p>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground/70">Clinical decision support / Evidence-grounded retrieval / PubMed corpus</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/workspace" prefetch className="group inline-flex min-h-[3.25rem] items-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">
                Enter Clinical Workspace <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </Link>
              <Link href="/evidence" prefetch className="inline-flex min-h-[3.25rem] items-center rounded-lg border border-border bg-background/70 px-6 py-3.5 text-base font-medium transition-colors hover:bg-muted">Explore Evidence</Link>
            </div>
            <p className="mt-4 max-w-[330px] border-l-2 border-evidence/40 pl-3 font-mono text-[10px] leading-4 text-muted-foreground">Decision-support information only — does not replace clinical judgment.</p>
          </div>
          <div className="pointer-events-none relative z-0 mt-7 h-auto w-full md:absolute md:right-0 md:top-0 md:mt-0 md:h-auto md:w-[57%]" aria-hidden="true">
            <LandingScene />
          </div>
          <div className="pointer-events-none absolute bottom-16 left-[42%] z-10 hidden max-w-[500px] items-end gap-5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/75 sm:flex sm:gap-8 lg:left-[47%]">
            <div><span className="text-evidence">01</span><span className="ml-2">Retrieve</span><span className="mt-1 block font-sans text-[11px] normal-case tracking-normal text-muted-foreground">Biomedical literature</span></div>
            <div><span className="text-evidence">02</span><span className="ml-2">Verify</span><span className="mt-1 block font-sans text-[11px] normal-case tracking-normal text-muted-foreground">Evidence relevance</span></div>
            <div><span className="text-evidence">03</span><span className="ml-2">Generate</span><span className="mt-1 block font-sans text-[11px] normal-case tracking-normal text-muted-foreground">Grounded response</span></div>
          </div>
          <div className="pointer-events-none absolute bottom-7 right-5 z-10 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70 lg:right-10">
            <span className="size-1.5 rounded-full bg-evidence" />
            <span>Live evidence path</span>
            <span className="text-border">/</span>
            <span>08 stages</span>
          </div>
        </section>
      </main>
    </div>
  )
}
