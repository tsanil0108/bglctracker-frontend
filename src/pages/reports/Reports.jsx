import React, { useEffect, useState } from 'react'
import { ScrollText, ShieldCheck, Landmark, Lock, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Table from '../../components/common/Table'
import Loader from '../../components/common/Loader'
import StatusBadge from '../../components/common/StatusBadge'
import { useToast } from '../../components/common/Toast'
import { lcApi } from '../../api/lcApi'
import { bgApi } from '../../api/bgApi'
import { fdApi } from '../../api/fdApi'
import { formatCurrency, formatDate } from '../../utils/formatters'

const REPORTS = [
  { key: 'lcActive', label: 'LC Active Report', icon: ScrollText, accent: 'text-lc-600' },
  { key: 'bgActive', label: 'BG Active Report', icon: ShieldCheck, accent: 'text-bg-600' },
  { key: 'fdOpen', label: 'Open FD Report', icon: Landmark, accent: 'text-fd-600' },
  { key: 'fdLien', label: 'Lien FD Report', icon: Lock, accent: 'text-fd-600' },
  { key: 'fdClosed', label: 'Closed FD Report', icon: CheckCircle2, accent: 'text-muted' },
]

const lcColumns = [
  { key: 'lcNo', header: 'LC No.', render: (r) => <span className="num font-medium">{r.lcNo}</span> },
  { key: 'issueBankName', header: 'Issue Bank' },
  { key: 'linkedVendorName', header: 'Vendor', render: (r) => r.linkedVendorName || '—' },
  { key: 'lcExpiryDate', header: 'Expiry', render: (r) => formatDate(r.lcExpiryDate) },
  { key: 'lcAmount', header: 'Amount', render: (r) => <span className="num">{formatCurrency(r.lcAmount)}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
]

const bgColumns = [
  { key: 'bgNo', header: 'BG No.', render: (r) => <span className="num font-medium">{r.bgNo}</span> },
  { key: 'clientName', header: 'Client' },
  { key: 'siteProject', header: 'Site / Project' },
  { key: 'expiryDate', header: 'Expiry', render: (r) => formatDate(r.expiryDate) },
  { key: 'bgAmount', header: 'Amount', render: (r) => <span className="num">{formatCurrency(r.bgAmount)}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
]

const fdColumns = [
  { key: 'fdNumber', header: 'FD Number', render: (r) => <span className="num font-medium">{r.fdNumber}</span> },
  { key: 'bankName', header: 'Bank' },
  { key: 'fdMaturityDate', header: 'Maturity', render: (r) => formatDate(r.fdMaturityDate) },
  { key: 'fdAmount', header: 'Amount', render: (r) => <span className="num">{formatCurrency(r.fdAmount)}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
]

export default function Reports() {
  const { push } = useToast()
  const [active, setActive] = useState('lcActive')
  const [rows, setRows] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      lcApi.getAll('ACTIVE'),
      bgApi.getAll('ACTIVE'),
      fdApi.getAll('OPEN'),
      fdApi.getAll('LIEN_MARKED'),
      fdApi.getAll('CLOSED'),
    ])
      .then(([lcActive, bgActive, fdOpen, fdLien, fdClosed]) => {
        setRows({ lcActive, bgActive, fdOpen, fdLien, fdClosed })
      })
      .catch(() => push('Could not load reports.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columnsFor = {
    lcActive: lcColumns,
    bgActive: bgColumns,
    fdOpen: fdColumns,
    fdLien: fdColumns,
    fdClosed: fdColumns,
  }

  const emptyFor = {
    lcActive: 'No active Letters of Credit.',
    bgActive: 'No active Bank Guarantees.',
    fdOpen: 'No open Fixed Deposits.',
    fdLien: 'No lien-marked Fixed Deposits.',
    fdClosed: 'No closed Fixed Deposits.',
  }

  const currentRows = rows[active] || []

  return (
    <div>
      <PageHeader
        eyebrow="Module"
        title="Reports"
        description="Active/expired/closed views across LC, BG and FD, pulled straight from live records."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {REPORTS.map(({ key, label, icon: Icon, accent }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              active === key ? 'bg-ink-900 text-white' : 'bg-white text-muted ring-1 ring-inset ring-border hover:text-ink-900'
            }`}
          >
            <Icon size={15} className={active === key ? 'text-white' : accent} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <Table columns={columnsFor[active]} rows={currentRows} emptyMessage={emptyFor[active]} />
      )}
    </div>
  )
}
