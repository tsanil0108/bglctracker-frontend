import React from 'react'
import { Inbox } from 'lucide-react'

export default function EmptyState({ message = 'Nothing here yet.', hint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white/60 px-6 py-14 text-center">
      <Inbox className="mb-3 text-muted" size={28} strokeWidth={1.5} />
      <p className="text-sm font-medium text-ink-900">{message}</p>
      {hint && <p className="mt-1 max-w-sm text-xs text-muted">{hint}</p>}
    </div>
  )
}
