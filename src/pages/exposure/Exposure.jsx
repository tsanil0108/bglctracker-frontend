import React, { useEffect, useState } from 'react'
import { Landmark, Building2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { useToast } from '../../components/common/Toast'
import { exposureApi } from '../../api/exposureApi'
import { formatCurrency } from '../../utils/formatters'

function ExposureBar({ label, value, max, colorClass }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="py-3">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-ink-900">{label}</span>
        <span className="num text-ink-900">{formatCurrency(value)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-50">
        <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Exposure() {
  const { push } = useToast()
  const [bankData, setBankData] = useState([])
  const [clientData, setClientData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([exposureApi.getBankWise(), exposureApi.getClientWise()])
      .then(([banks, clients]) => {
        setBankData(banks)
        setClientData(clients)
      })
      .catch(() => push('Could not load exposure data.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <Loader />

  const maxBankExposure = Math.max(0, ...bankData.map((b) => b.totalExposure ?? 0))
  const maxClientExposure = Math.max(0, ...clientData.map((c) => c.activeBgAmount ?? 0))

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Exposure"
        description="Where active BG and LC exposure currently sits, by bank and by client."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl2 border border-border bg-white p-5">
          <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <Landmark size={17} className="text-bg-600" /> Bank-wise Exposure
          </h2>
          {bankData.length === 0 ? (
            <EmptyState message="No active BG/LC exposure yet." />
          ) : (
            <div className="divide-y divide-border">
              {bankData.map((b) => (
                <div key={b.bankId}>
                  <ExposureBar label={b.bankName} value={b.totalExposure} max={maxBankExposure} colorClass="bg-bg-600" />
                  <p className="mb-2 text-xs text-muted">
                    BG: {formatCurrency(b.activeBgAmount)} · LC: {formatCurrency(b.activeLcAmount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl2 border border-border bg-white p-5">
          <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <Building2 size={17} className="text-lc-600" /> Client-wise BG Exposure
          </h2>
          {clientData.length === 0 ? (
            <EmptyState message="No active BG exposure yet." />
          ) : (
            <div className="divide-y divide-border">
              {clientData.map((c) => (
                <ExposureBar key={c.clientId} label={c.clientName} value={c.activeBgAmount} max={maxClientExposure} colorClass="bg-lc-600" />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
