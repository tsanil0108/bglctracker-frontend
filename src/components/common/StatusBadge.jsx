import React from 'react'
import { STATUS_STYLES, STATUS_LABELS } from '../../utils/constants'

export default function StatusBadge({ status }) {
  if (!status) return <span className="text-muted">—</span>
  const style = STATUS_STYLES[status] || 'bg-ink-50 text-muted ring-1 ring-inset ring-border'
  const label = STATUS_LABELS[status] || status
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}
