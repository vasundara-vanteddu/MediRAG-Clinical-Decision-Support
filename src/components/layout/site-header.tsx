'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/workspace', label: 'Clinical Workspace' },
  { href: '/evidence', label: 'Evidence Library' },
  { href: '/patients', label: 'Patient Lookup' },
  { href: '/about', label: 'About' },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-background/95">
      <div className="mx-auto flex min-h-[4.25rem] max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="MediRAG home">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity aria-hidden="true" className="size-5" />
          </span>
          <span className="text-xl font-semibold tracking-tight">MediRAG</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} prefetch aria-current={pathname === link.href ? 'page' : undefined} className={cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground', pathname === link.href ? 'bg-muted text-foreground' : 'text-muted-foreground')}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-3.5 text-verification" />
          <span className="hidden sm:inline">Evidence-grounded</span>
          <span className="size-1.5 rounded-full bg-verification" aria-label="System status: ready" />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border px-5 py-2 md:hidden" aria-label="Mobile navigation">
        {links.map((link) => (
          <Link key={link.href} href={link.href} prefetch aria-current={pathname === link.href ? 'page' : undefined} className={cn('shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-muted hover:text-foreground', pathname === link.href ? 'bg-muted text-foreground' : 'text-muted-foreground')}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

export function PageShell({ children }: { children?: React.ReactNode }) {
  return <><SiteHeader />{children}</>
}

export function PlaceholderPage({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-5 py-16 lg:px-8">
      <section className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-evidence">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>
        <div className="mt-8 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-soft">
          This route is scaffolded for the next implementation stage. The shared MediRAG design system is already active here.
        </div>
      </section>
    </main>
  )
}

export const shellClassName = 'min-h-screen bg-background text-foreground'

export default SiteHeader

