import React from 'react'

export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-ink-900" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
