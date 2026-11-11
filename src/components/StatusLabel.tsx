import { Label } from '@patternfly/react-core'
import type { ItemStatus } from '../types'

const CFG: Record<ItemStatus, { color: 'grey' | 'blue' | 'green' | 'purple'; text: string; icon?: string }> = {
  pending: { color: 'grey', text: 'Pending' },
  draft: { color: 'blue', text: 'Draft' },
  ready: { color: 'green', text: 'Ready', icon: '●' },
  done: { color: 'purple', text: 'Done', icon: '✓' },
}

export function StatusLabel({ status }: { status: ItemStatus }) {
  const cfg = CFG[status]
  return (
    <Label color={cfg.color}>
      {cfg.icon ? `${cfg.icon} ` : ''}
      {cfg.text}
    </Label>
  )
}
