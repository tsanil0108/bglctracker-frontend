import React from 'react'
import EmptyState from './EmptyState'

/**
 * columns: [{ key, header, render?(row) }]
 * rows: array of data objects
 * actions?: (row) => ReactNode, rendered in a trailing sticky column
 */
export default function Table({ columns, rows, actions, emptyMessage }) {
  if (!rows || rows.length === 0) {
    return <EmptyState message={emptyMessage || 'No records yet.'} />
  }

  return (
    <div className="overflow-hidden rounded-xl2 border border-border bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-ink-50/60">
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id ?? i} className="border-b border-border last:border-0 hover:bg-ink-50/40">
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 text-ink-900">
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
