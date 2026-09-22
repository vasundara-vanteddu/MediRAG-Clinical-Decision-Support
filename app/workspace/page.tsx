import { Suspense } from 'react'
import { PageShell } from '@/src/components/layout/site-header'
import { ClinicalWorkspace } from '@/src/components/workspace/clinical-workspace'

function WorkspaceLoading() {
  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Loading clinical workspace...
        </div>
      </div>
    </PageShell>
  )
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <PageShell>
        <ClinicalWorkspace />
      </PageShell>
    </Suspense>
  )
}