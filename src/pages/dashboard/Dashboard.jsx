import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ScrollText, Landmark, Lock, AlertTriangle } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import StatusBadge from '../../components/common/StatusBadge'
import { useToast } from '../../components/common/Toast'
import { dashboardApi } from '../../api/dashboardApi'
import { alertsApi } from '../../api/alertsApi'
import { formatCurrency, formatDate, daysUntil } from '../../utils/formatters'
import { ALERT_SEVERITY_STYLES } from '../../utils/constants'

const WINDOWS = [
  { key: '7Days', label: '7 days' },
  { key: '30Days', label: '30 days' },
  { key: '60Days', label: '60 days' },
]

function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <Card accent={accent}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className="num mt-2 text-2xl font-semibold text-ink-900">{value}</p>
        </div>
        <span className="rounded-lg bg-ink-50 p-2 text-ink-900">
          <Icon size={18} />
        </span>
      </div>
    </Card>
  )
}

function ExpiryList({ items, dateKey, noKey, extra }) {
  if (!items || items.length === 0) {
    return <EmptyState message="Nothing expiring in this window." />
  }
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl2 border border-border bg-white shadow-card">
      {items.map((item) => {
        const days = daysUntil(item[dateKey])
        return (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div>
              <p className="num text-sm font-medium text-ink-900">{item[noKey]}</p>
              <p className="text-xs text-muted">{extra(item)}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-ink-900">{formatDate(item[dateKey])}</p>
                {days != null && (
                  <p className={`text-xs ${days <= 7 ? 'text-danger' : 'text-muted'}`}>
                    {days < 0 ? `${Math.abs(days)}d overdue` : `in ${days}d`}
                  </p>
                )}
              </div>
              <StatusBadge status={item.status} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const { push } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bgWindow, setBgWindow] = useState('7Days')
  const [lcWindow, setLcWindow] = useState('7Days')
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .catch(() => push('Could not load the dashboard.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    alertsApi.getAll().then((a) => setAlerts(a.slice(0, 6))).catch(() => {})
  }, [])

  if (loading) return <Loader />
  if (!data) return <EmptyState message="Dashboard data isn't available right now." />

  const bgList = data[`bgExpiringIn${bgWindow}`] || []
  const lcList = data[`lcExpiringIn${lcWindow}`] || []

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Everything expiring soon, and where your money currently sits."
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={ShieldCheck} label="Total Active BG" value={formatCurrency(data.totalActiveBgAmount)} accent="bg-bg-600" />
        <KpiCard icon={ScrollText} label="Total Active LC" value={formatCurrency(data.totalActiveLcAmount)} accent="bg-lc-600" />
        <KpiCard icon={Landmark} label="Total Open FD" value={formatCurrency(data.totalOpenFdAmount)} accent="bg-fd-600" />
        <KpiCard icon={Lock} label="Total Lien-Marked FD" value={formatCurrency(data.totalLienMarkedFdAmount)} accent="bg-ink-900" />
      </div>

      {alerts.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-900">Critical Alerts</h2>
            <Link to="/alerts" className="text-xs font-medium text-muted hover:text-ink-900">View all →</Link>
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-xl2 border border-border bg-white shadow-card">
            {alerts.map((a) => (
              <Link
                key={a.id}
                to={a.module === 'BG' ? `/bg/${a.recordId}` : a.module === 'LC' ? '/lc' : a.module === 'FD' ? '/fd' : '/bank-limits'}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-ink-50/40"
              >
                <div>
                  <p className="text-sm font-medium text-ink-900">{a.title} — {a.recordNo}</p>
                  <p className="text-xs text-muted">{a.message}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${ALERT_SEVERITY_STYLES[a.severity]}`}>
                  {a.module}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
              <ShieldCheck size={17} className="text-bg-600" /> BGs Expiring Soon
            </h2>
            <div className="flex gap-1">
              {WINDOWS.map((w) => (
                <button
                  key={w.key}
                  onClick={() => setBgWindow(w.key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    bgWindow === w.key ? 'bg-ink-900 text-white' : 'bg-white text-muted ring-1 ring-inset ring-border hover:text-ink-900'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
          <ExpiryList items={bgList} dateKey="expiryDate" noKey="bgNo" extra={(i) => i.clientName} />
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
              <ScrollText size={17} className="text-lc-600" /> LCs Expiring Soon
            </h2>
            <div className="flex gap-1">
              {WINDOWS.map((w) => (
                <button
                  key={w.key}
                  onClick={() => setLcWindow(w.key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    lcWindow === w.key ? 'bg-ink-900 text-white' : 'bg-white text-muted ring-1 ring-inset ring-border hover:text-ink-900'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
          <ExpiryList items={lcList} dateKey="lcExpiryDate" noKey="lcNo" extra={(i) => i.linkedVendorName || '—'} />
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
          <AlertTriangle size={17} className="text-fd-600" /> FDs Maturing Soon
        </h2>
        {data.fdMaturingSoon && data.fdMaturingSoon.length > 0 ? (
          <div className="divide-y divide-border overflow-hidden rounded-xl2 border border-border bg-white shadow-card">
            {data.fdMaturingSoon.map((fd) => {
              const days = daysUntil(fd.fdMaturityDate)
              return (
                <div key={fd.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div>
                    <p className="num text-sm font-medium text-ink-900">{fd.fdNumber}</p>
                    <p className="text-xs text-muted">{fd.bankName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="num text-sm text-ink-900">{formatCurrency(fd.fdAmount)}</p>
                    <div className="text-right">
                      <p className="text-sm text-ink-900">{formatDate(fd.fdMaturityDate)}</p>
                      {days != null && (
                        <p className={`text-xs ${days <= 7 ? 'text-danger' : 'text-muted'}`}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `in ${days}d`}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={fd.status} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState message="No Fixed Deposits maturing soon." />
        )}
      </section>
    </div>
  )
}