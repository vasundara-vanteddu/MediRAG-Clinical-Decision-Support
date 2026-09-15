'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, RoundedBox, Shadow } from '@react-three/drei'
import * as THREE from 'three'
import { Component, createContext, type ErrorInfo, type ReactNode, useContext, useMemo, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

const AMBER = '#A6541A'
const AMBER_LIGHT = '#D09A65'
const SLATE = '#34404D'
const PAPER = '#E7E0D3'
const GREEN = '#4B6A4F'
const CREAM = '#F6F3EC'

type Vec3 = [number, number, number]

const CompactSceneContext = createContext(false)

function Platform({ position, size, height, color = CREAM }: { position: Vec3; size: [number, number]; height: number; color?: string }) {
  return <RoundedBox args={[size[0], height, size[1]]} radius={0.16} smoothness={5} position={[position[0], position[1] + height / 2, position[2]]} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.9} /></RoundedBox>
}

function Label({ position, children, accent = AMBER, align = 'center' }: { position: Vec3; children: ReactNode; accent?: string; align?: 'left' | 'center' }) {
  const compact = useContext(CompactSceneContext)
  const text = typeof children === 'string' ? children : ''
  if (compact && /abstracts|dense retrieval|bm25|source checking|evidence synthesis|reviewable output/i.test(text)) return null
  const compactText = compact ? text.replace('Clinical Query', 'QUERY').replace('Biomedical Literature', 'LITERATURE').replace('Dense + BM25 Retrieval', 'RETRIEVE').replace('Reciprocal Rank Fusion', 'FUSE').replace('Biomedical Reranking', 'RERANK').replace('Evidence Verification', 'VERIFY').replace('Grounded Generation', 'GENERATE').replace('Citations', 'CITE') : children
  return <Html position={position} center distanceFactor={compact ? 27 : 21} style={{ pointerEvents: 'none' }}><div className="whitespace-nowrap font-mono text-[7px] uppercase tracking-[0.06em] leading-tight" style={{ color: accent, textAlign: align, textShadow: '0 1px 0 #F6F3EC' }}>{compactText}</div></Html>
}

function Leader({ from, to, color = AMBER }: { from: Vec3; to: Vec3; color?: string }) {
  return <Line points={[from, to]} color={color} lineWidth={1.1} dashed dashSize={0.08} gapSize={0.06} transparent opacity={0.78} />
}

function PaperCorpus({ position }: { position: Vec3 }) {
  const papers = useMemo(() => Array.from({ length: 19 }, (_, i) => ({ x: ((i * 0.53) % 2.8) - 1.4, z: ((i * 0.77) % 1.9) - 0.95, h: 0.13 + (i % 5) * 0.06, r: (i % 5 - 2) * 0.1 })), [])
  return <group position={position}>{papers.map((paper, i) => <RoundedBox key={i} args={[0.34, paper.h, 0.5]} radius={0.025} smoothness={2} position={[paper.x, paper.h / 2 + 0.18 + (i % 4 === 0 ? 0.1 : 0), paper.z]} rotation={[0, paper.r, (i % 2 ? 1 : -1) * 0.08]} castShadow><meshStandardMaterial color={i % 6 === 0 ? '#B8A48D' : i % 4 === 0 ? '#D2D0C6' : PAPER} roughness={0.95} /></RoundedBox>)}</group>
}

function QueryStation() {
  return <group position={[-4.7, 1.28, 0.85]}><Platform position={[0, 0, 0]} size={[1.65, 1.55]} height={0.25} color="#DED7CB" /><RoundedBox args={[0.88, 0.11, 1.08]} radius={0.05} position={[0, 0.52, 0.03]} rotation={[0.12, -0.2, 0]} castShadow><meshStandardMaterial color={SLATE} roughness={0.72} /></RoundedBox><Line points={[[-0.28, 0.59, 0.56], [0.2, 0.59, 0.56]]} color={AMBER_LIGHT} lineWidth={2.5} /><Leader from={[0, 0.7, 0.03]} to={[0, 1.52, 0]} /><Label position={[0, 1.72, 0]}>01&nbsp;&nbsp;Clinical Query</Label><Label position={[0, 1.5, 0]} accent="#6B6560">Natural language clinical question</Label></group>
}

function LiteratureStation() {
  return <group position={[-3.35, 0.35, -0.55]}><Platform position={[0, 0, 0]} size={[3.5, 2.85]} height={0.24} color="#E2DCD0" /><PaperCorpus position={[0, 0, 0]} /><Label position={[-1.15, 2.72, 0.05]} align="left">02&nbsp;&nbsp;Biomedical Literature</Label><Label position={[-1.15, 2.47, 0.05]} align="left" accent="#6B6560">39,994 abstracts indexed</Label></group>
}

function RetrievalStation() {
  return <group position={[-0.95, 0.72, 0.8]}><Platform position={[0, 0, 0]} size={[2.6, 2.35]} height={0.3} color="#E4DDD2" /><group position={[-0.57, 0.48, 0]}><mesh rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.44, 0.075, 14, 36]} /><meshStandardMaterial color={AMBER} roughness={0.58} /></mesh><Label position={[-0.3, 0.78, 0.22]} align="left" accent="#6B6560">Dense retrieval</Label></group><group position={[0.58, 0.48, 0]}>{Array.from({ length: 10 }, (_, i) => <mesh key={i} position={[(i % 5 - 2) * 0.17, Math.floor(i / 5) * 0.18, 0]} castShadow><boxGeometry args={[0.13, 0.13, 0.13]} /><meshStandardMaterial color={SLATE} roughness={0.8} /></mesh>)}<Label position={[0.38, 0.78, 0.22]} align="left" accent="#6B6560">BM25 / keyword</Label></group><Leader from={[0, 0.85, 0]} to={[0, 1.48, 0.1]} /><Label position={[0, 1.7, 0.1]}>03&nbsp;&nbsp;Dense + BM25 Retrieval</Label><Label position={[0, 1.48, 0.1]} accent="#6B6560">Semantic + lexical search</Label></group>
}

function FusionStation() {
  return <group position={[0.65, 1.02, -0.6]}><Platform position={[0, 0, 0]} size={[2.15, 1.85]} height={0.3} color="#DED8CC" /><Line points={[[-0.88, 0.62, 0.48], [-0.18, 0.62, 0.02], [0.78, 0.62, -0.42]]} color={AMBER_LIGHT} lineWidth={2.6} /><Line points={[[-0.88, 0.62, -0.4], [-0.18, 0.62, 0.02], [0.78, 0.62, -0.42]]} color={AMBER} lineWidth={2.6} /><mesh position={[-0.18, 0.66, 0.02]} castShadow><sphereGeometry args={[0.25, 20, 20]} /><meshStandardMaterial color={AMBER} roughness={0.45} /></mesh><Leader from={[-0.18, 0.78, 0.02]} to={[-0.52, 1.48, -0.08]} /><Label position={[-0.52, 1.68, -0.08]} align="left">04&nbsp;&nbsp;Reciprocal Rank Fusion</Label><Label position={[-0.52, 1.46, -0.08]} align="left" accent="#6B6560">Merge and prioritize candidates</Label></group>
}

function RankingStation() {
  return <group position={[2.12, 0.86, -0.82]}><Platform position={[0, 0, 0]} size={[2.3, 1.95]} height={0.28} color="#E2DCD1" />{[1.18, 0.96, 0.73, 0.5, 0.3].map((height, i) => <RoundedBox key={i} args={[0.2, height, 0.58]} radius={0.035} position={[(i - 2) * 0.27, height / 2 + 0.18, 0]} castShadow><meshStandardMaterial color={i === 0 ? AMBER : i === 1 ? '#9C8064' : '#BBAA96'} roughness={0.78} /></RoundedBox>)}<Leader from={[0, 1.18, 0]} to={[0, 1.48, -0.04]} /><Label position={[0, 1.68, -0.04]}>05&nbsp;&nbsp;Biomedical Reranking</Label><Label position={[0, 1.46, -0.04]} accent="#6B6560">Relevance scoring</Label></group>
}

function VerificationStation() {
  return <group position={[2.75, 1.18, -2.02]}><Platform position={[0, 0, 0]} size={[1.7, 1.55]} height={0.3} color="#DCD9CE" /><mesh position={[0, 0.9, 0]} rotation={[0.15, 0.2, 0.1]} castShadow><icosahedronGeometry args={[0.52, 1]} /><meshStandardMaterial color={GREEN} roughness={0.52} flatShading /></mesh><Line points={[[-0.2, 0.93, 0.46], [0.03, 0.76, 0.52], [0.25, 1.08, 0.44]]} color={CREAM} lineWidth={2.6} /><Leader from={[0, 1.42, 0]} to={[-0.9, 2.24, -0.2]} color={GREEN} /><Label position={[-0.9, 2.58, -0.2]} align="left" accent={GREEN}>06&nbsp;&nbsp;Evidence Verification</Label><Label position={[-0.9, 2.34, -0.2]} align="left" accent="#68766B">Source checking and filtering</Label></group>
}

function GenerationStation() {
  return <group position={[3.72, 1.24, -0.7]}><Platform position={[0, 0, 0]} size={[3.1, 2.45]} height={0.38} color="#E3DBCE" /><RoundedBox args={[1.72, 1.16, 1.48]} radius={0.22} smoothness={8} position={[0, 1.2, 0]} castShadow><meshStandardMaterial color="#B96B36" roughness={0.48} emissive="#7D421F" emissiveIntensity={0.08} /></RoundedBox><RoundedBox args={[1.2, 0.12, 1.05]} radius={0.07} position={[0, 1.8, 0]} rotation={[0, 0.1, 0]}><meshStandardMaterial color="#CD8150" roughness={0.52} /></RoundedBox><Line points={[[-0.57, 1.39, 0.75], [0.38, 1.39, 0.75]]} color="#F1D1AB" lineWidth={2.5} /><Line points={[[-0.57, 1.1, 0.75], [0.65, 1.1, 0.75]]} color="#F1D1AB" lineWidth={2.5} /><Leader from={[0, 1.92, 0]} to={[-1.18, 2.52, 0.08]} color={GREEN} /><Label position={[-1.18, 2.92, 0.08]} align="left" accent={GREEN}>07&nbsp;&nbsp;Grounded Generation</Label><Label position={[-1.18, 2.68, 0.08]} align="left" accent="#68766B">Evidence-based clinical answer</Label></group>
}

function CitationStation() {
  return <group position={[4.92, 0.8, 0.43]}><RoundedBox args={[1.2, 0.16, 1.45]} radius={0.08} position={[0, 0.62, 0]} rotation={[0.05, -0.18, 0]} castShadow><meshStandardMaterial color="#E6DED0" roughness={0.9} /></RoundedBox>{[0, 1, 2].map((i) => <mesh key={i} position={[(i - 1) * 0.27, 0.9, 0.06]} castShadow><sphereGeometry args={[0.11, 14, 14]} /><meshStandardMaterial color={AMBER} roughness={0.62} /></mesh>)}<Leader from={[0, 0.98, 0.06]} to={[-1.22, 1.42, 0]} /><Label position={[-1.22, 1.82, 0]} align="left">08&nbsp;&nbsp;Citations</Label><Label position={[-1.22, 1.59, 0]} align="left" accent="#6B6560">Traceable output</Label></group>
}

function EvidenceFlow({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const pulse = useRef<THREE.Mesh>(null)
  const curve = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-4.7, 1.72, 0.85), new THREE.Vector3(-4.15, 1.9, 0.15), new THREE.Vector3(-3.35, 1.45, -0.55), new THREE.Vector3(-1.95, 1.78, 0.8), new THREE.Vector3(-0.8, 1.66, 0.8), new THREE.Vector3(0.45, 1.9, -0.3), new THREE.Vector3(2.05, 1.72, -0.82), new THREE.Vector3(2.75, 2.05, -2.02), new THREE.Vector3(3.72, 2.3, -0.7), new THREE.Vector3(4.92, 1.6, 0.43)], false, 'centripetal', 0.5), [])
  useFrame(({ clock }) => { if (pulse.current && !reducedMotion) pulse.current.position.copy(curve.getPointAt((clock.getElapsedTime() * 0.045) % 1)) })
  return <><mesh castShadow><tubeGeometry args={[curve, 180, 0.038, 10, false]} /><meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.1} roughness={0.5} /></mesh><mesh ref={pulse} position={curve.getPointAt(0)}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color={AMBER_LIGHT} emissive={AMBER} emissiveIntensity={0.45} /></mesh></>
}

function Diorama({ compact = false, reducedMotion = false }: { compact?: boolean; reducedMotion?: boolean }) {
  return <CompactSceneContext.Provider value={compact}><group position={[0.72, 0.12, 0]}><ambientLight intensity={1.8} /><directionalLight position={[-5, 10, 7]} intensity={3.6} color="#FFF7EB" castShadow shadow-mapSize={[1024, 1024]} /><directionalLight position={[6, 5, -7]} intensity={1.2} color="#E7EDF2" /><Platform position={[-3.35, 0, 0.28]} size={[4.9, 3.85]} height={0.34} /><Platform position={[-0.35, 0.22, 0.04]} size={[4.75, 3.7]} height={0.42} color="#F0EBE2" /><Platform position={[3.45, 0.48, -0.65]} size={[4.6, 3.75]} height={0.5} color="#ECE6DB" /><QueryStation /><LiteratureStation /><RetrievalStation /><FusionStation /><RankingStation /><VerificationStation /><GenerationStation /><CitationStation /><EvidenceFlow reducedMotion={reducedMotion} /><Shadow position={[0, 0.01, 0]} scale={[14, 8]} opacity={0.18} color="#6B5A48" /></group></CompactSceneContext.Provider>
}

function StaticFallback() {
  return <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] uppercase tracking-[0.12em] text-[#A6541A]" role="img" aria-label="Isometric evidence-processing diorama fallback"><svg viewBox="0 0 760 620" className="h-full w-full" preserveAspectRatio="xMidYMid meet"><path d="M50 325 250 220 455 300 255 420Z" fill="#E7E0D3"/><path d="M220 265 425 160 660 250 455 365Z" fill="#E3DBCE"/><path d="M70 310 C180 210 260 325 350 255 S520 175 645 260" fill="none" stroke={AMBER} strokeWidth="5" strokeLinecap="round"/><g fill="#DED7CB" stroke="#AFA79A">{Array.from({ length: 18 }, (_, i) => <rect key={i} x={130 + (i % 6) * 25} y={225 + Math.floor(i / 6) * 21} width="20" height="14" rx="2" transform={`rotate(${(i % 3 - 1) * 8} ${140 + (i % 6) * 25} ${232 + Math.floor(i / 6) * 21})`} />)}</g><g fill="#A6541A">{[0, 1, 2, 3].map((i) => <rect key={i} x={390 + i * 26} y={270 - i * 14} width="15" height={48 - i * 6} rx="2" />)}</g><rect x="490" y="270" width="88" height="52" rx="10" fill="#B96B36"/><g fill="#A6541A" fontFamily="monospace" fontSize="11" letterSpacing="1.5"><text x="46" y="72">01  CLINICAL QUERY</text><text x="170" y="155">02  BIOMEDICAL LITERATURE</text><text x="294" y="435">03  DENSE + BM25 RETRIEVAL</text><text x="405" y="112">04  RECIPROCAL RANK FUSION</text><text x="510" y="405">07  GROUNDED GENERATION</text><text x="604" y="455">08  CITATIONS</text></g></svg></div>
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> { state = { failed: false }; static getDerivedStateFromError() { return { failed: true } }; componentDidCatch(error: Error, info: ErrorInfo) { console.error('[v0] MediRAG Canvas failed', error, info) }; render() { return this.state.failed ? this.props.fallback : this.props.children } }

export function MediRagScene({ compact = false }: { compact?: boolean }) {
  const reducedMotion = useReducedMotion()
  const fallback = <StaticFallback />
  return <div className={`relative h-full w-full overflow-hidden ${compact ? 'opacity-90' : ''}`} aria-label="MediRAG spatial evidence-processing environment" role="img">
    <SceneBoundary fallback={fallback}><Canvas fallback={fallback} orthographic shadows dpr={[1, 2]} resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }} camera={{ position: [11, 10, 13], zoom: compact ? 88 : 64, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true }} className="absolute inset-0 h-full w-full"><Diorama compact={compact} reducedMotion={Boolean(reducedMotion)} /></Canvas></SceneBoundary>
  </div>
}

export default MediRagScene
