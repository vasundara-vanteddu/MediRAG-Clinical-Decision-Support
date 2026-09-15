'use client'

import dynamic from 'next/dynamic'

const MediRagScene = dynamic(() => import('./medirag-scene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0" aria-hidden="true" />,
})

export function LandingScene() {
  return (
    <div className="relative h-[640px] w-full lg:h-[720px]">
      <MediRagScene />
    </div>
  )
}
