import { PageShell } from '@/src/components/layout/site-header'
import { ClinicalWorkspace } from '@/src/components/workspace/clinical-workspace'

export default function WorkspacePage() {
  return (
    <PageShell>
      <ClinicalWorkspace />
    </PageShell>
  )
}
