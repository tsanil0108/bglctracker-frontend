import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Bell, Info } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { useToast } from '../../components/common/Toast'
import { alertsApi } from '../../api/alertsApi'
import { ALERT_SEVERITY_STYLES, ALERT_MODULE_ROUTES } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'

const SEVERITY_ICON = { CRITICAL: AlertTriangle, WARNING: Bell, INFO: Info }
const SEVERITY_ORDER = ['CRITICAL', 'WARNING', 'INFO']
const SEVERITY_LABEL = { CRITICAL: 'Critical', WARNING: 'Warning', INFO: 'Info' }

export default function Alerts() {
  const { push } = useToast()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    alertsApi.getAll()
      .then(setAlerts)
      .catch(() => push('Could not load alerts.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <Loader />

  const filtered = filter ? alerts.filter((a) => a.severity === filter) : alerts
  const grouped = SEVERITY_ORDER.map((sev) => ({ sev, items: filtered.filter((a) => a.severity === sev) }))

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Alerts"
        description="Everything that needs attention across BGs, LCs, FDs, and bank limits."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', ...SEVERITY_ORDER].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === s ? 'bg-ink-900 text-white' : 'bg-white text-muted ring-1 ring-inset ring-border hover:text-ink-900'
            }`}
          >
            {s === '' ? 'All' : SEVERITY_LABEL[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No alerts right now — everything looks fine." />
      ) : (
        <div className="space-y-8">
          {grouped.filter((g) => g.items.length > 0).map((g) => {
            const Icon = SEVERITY_ICON[g.sev]
            return (
              <section key={g.sev}>
                <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
                  <Icon size={17} /> {SEVERITY_LABEL[g.sev]} ({g.items.length})
                </h2>
                <div className="divide-y divide-border overflow-hidden rounded-xl2 border border-border bg-white shadow-card">
                  {g.items.map((a) => {
                    const route = ALERT_MODULE_ROUTES[a.module]?.(a.recordId) || '/'
                    return (
                      <Link key={a.id} to={route} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-ink-50/40">
                        <div>
                          <p className="text-sm font-medium text-ink-900">{a.title} — {a.recordNo}</p>
                          <p className="text-xs text-muted">{a.message}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {a.dueDate && <p className="text-xs text-muted">{formatDate(a.dueDate)}</p>}
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${ALERT_SEVERITY_STYLES[a.severity]}`}>
                            {a.module}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
