'use client'

import { useMemo, useState } from 'react'
import { Search, UserRound, X } from 'lucide-react'
import { mockPatients } from '@/src/data/mock-patients'
import type { SyntheticPatient } from '@/src/types/patient'

export function PatientLookup() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<SyntheticPatient | null>(null)

  const filteredPatients = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return mockPatients
    return mockPatients.filter((patient) => [patient.id, String(patient.age), ...patient.conditions].join(' ').toLowerCase().includes(normalized))
  }, [query])

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-evidence">Patient lookup / synthetic context</p>
        <h1 className="mt-3 text-[2.7rem] font-semibold tracking-tight sm:text-[3.3rem]">Patient Lookup</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">Select a synthetic patient profile to preview the clinical factors that can frame an evidence-grounded question.</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <section className="rounded-2xl border bg-card p-6 shadow-soft sm:p-7" aria-labelledby="patient-list-title">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Synthetic registry</p>
              <h2 id="patient-list-title" className="mt-1 text-xl font-semibold">Find a patient context</h2>
            </div>
            <span className="rounded-full border bg-muted px-3 py-1 font-mono text-[11px] text-muted-foreground">{mockPatients.length} profiles</span>
          </div>
          <label className="mt-5 flex items-center gap-3 rounded-xl border bg-background px-3.5 py-3 focus-within:ring-2 focus-within:ring-ring/30">
            <Search aria-hidden="true" className="size-4 text-muted-foreground" />
            <span className="sr-only">Search patient profiles</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by ID, age, or condition" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            {query && <button type="button" onClick={() => setQuery('')} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Clear patient search"><X aria-hidden="true" className="size-4" /></button>}
          </label>
          <div className="mt-5 overflow-hidden rounded-xl border">
            <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-muted/60 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"><span>Patient</span><span>Age</span></div>
            <div className="divide-y">
              {filteredPatients.map((patient) => <button key={patient.id} type="button" onClick={() => setSelected(patient)} className={`grid w-full grid-cols-[1fr_auto] gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/60 ${selected?.id === patient.id ? 'bg-muted/80' : 'bg-card'}`} aria-pressed={selected?.id === patient.id}><span className="min-w-0"><span className="flex items-center gap-2 font-mono text-sm font-semibold"><UserRound aria-hidden="true" className="size-4 text-evidence" />{patient.id}</span><span className="mt-2 flex flex-wrap gap-1.5">{patient.conditions.map((condition) => <span key={condition} className="rounded-full border bg-background px-2 py-1 text-xs text-muted-foreground">{condition}</span>)}</span></span><span className="font-mono text-sm text-muted-foreground">{patient.age}y</span></button>)}
              {!filteredPatients.length && <p className="px-4 py-8 text-center text-sm text-muted-foreground">No synthetic profiles match that search.</p>}
            </div>
          </div>
        </section>
        <aside className="rounded-2xl border bg-card p-5 shadow-soft sm:p-6" aria-live="polite">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Selected context</p>
          {selected ? <div className="mt-5"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-2xl font-semibold">{selected.id}</p><p className="mt-1 text-sm text-muted-foreground">Age {selected.age}</p></div><button type="button" onClick={() => setSelected(null)} className="rounded-lg border p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Clear selected patient"><X aria-hidden="true" className="size-4" /></button></div><div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Relevant factors</p><ul className="mt-3 flex flex-col gap-2">{selected.conditions.map((condition) => <li key={condition} className="rounded-lg border bg-background px-3 py-2 text-sm">{condition}</li>)}</ul></div><div className="mt-6 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm leading-6 text-muted-foreground">Synthetic context only. This profile is not connected to a live EHR and cannot be used for diagnosis or treatment.</div></div> : <div className="mt-5 rounded-xl border border-dashed p-5"><p className="text-lg font-medium">No patient selected</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Choose a profile to inspect its read-only clinical factors.</p></div>}
        </aside>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Patient context is illustrative and does not enter the retrieval pipeline in this prototype.</p>
    </main>
  )
}
