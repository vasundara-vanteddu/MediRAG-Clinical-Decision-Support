'use client'

import { useReducedMotion } from 'framer-motion'

const nodes = [
  { label: 'Clinical Question', x: '8%', y: '48%', tone: 'amber' },
  { label: 'Biomedical Literature', x: '28%', y: '28%', tone: 'slate' },
  { label: 'Retrieval', x: '28%', y: '68%', tone: 'slate' },
  { label: 'Verification', x: '52%', y: '27%', tone: 'green' },
  { label: 'Evidence', x: '52%', y: '70%', tone: 'green' },
  { label: 'Grounded Answer', x: '82%', y: '48%', tone: 'amber' },
]

const edges = [
  ['8%', '48%', '28%', '28%'],
  ['8%', '48%', '28%', '68%'],
  ['28%', '28%', '52%', '27%'],
  ['28%', '68%', '52%', '70%'],
  ['52%', '27%', '82%', '48%'],
  ['52%', '70%', '82%', '48%'],
]

function toneClasses(tone: string) {
  if (tone === 'green') return 'border-[#8ba58f] bg-[#edf2ec] text-[#486452]'
  if (tone === 'slate') return 'border-[#aeb7bd] bg-[#f1f3f3] text-[#56636b]'
  return 'border-[#d99a57] bg-[#fbf1e4] text-[#99602b]'
}

export function EvidenceNetwork() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-y-0 left-[38%] right-0 hidden overflow-hidden lg:block" aria-label="MediRAG evidence pipeline from clinical question to grounded answer" role="img">
      <div className="absolute inset-[10%_4%_17%_2%]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {edges.map(([x1, y1, x2, y2]) => <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b7b2aa" strokeWidth="0.22" vectorEffect="non-scaling-stroke" />)}
        </svg>
        {nodes.map((node) => <div key={node.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: node.x, top: node.y }}>
          <div className={`rounded-md border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.11em] shadow-[0_8px_24px_rgba(45,42,38,0.05)] ${toneClasses(node.tone)}`}>{node.label}</div>
          <div className={`mx-auto mt-2 size-2 rounded-full border-2 border-[#f6f3ec] ${node.tone === 'green' ? 'bg-[#6e9278]' : node.tone === 'slate' ? 'bg-[#8d9aa2]' : 'bg-[#c9823d]'}`} />
        </div>)}
        <div className="absolute left-[42%] top-[46%] w-32 -translate-x-1/2 rounded border border-[#c8c2b8] bg-[#fcfaf5]/90 p-2.5 shadow-[0_12px_30px_rgba(45,42,38,0.06)]">
          <div className="font-mono text-[8px] uppercase tracking-[0.13em] text-[#746d65]">Source trail</div>
          <div className="mt-2 h-1 w-16 bg-[#c9823d]/60" />
          <div className="mt-1 h-1 w-24 bg-[#b7b2aa]/60" />
          <div className="mt-1 h-1 w-20 bg-[#b7b2aa]/40" />
        </div>
        {!reducedMotion && <div className="absolute left-[39%] top-[48%] size-1.5 rounded-full bg-[#d99a57] shadow-[0_0_0_5px_rgba(217,154,87,0.13)]" />}
      </div>
      <div className="absolute bottom-10 left-[17%] font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/65">Evidence graph / 05 stages</div>
    </div>
  )
}
