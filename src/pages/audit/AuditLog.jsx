import React, { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { Select } from '../../components/common/Field'
import { useToast } from '../../components/common/Toast'
import { auditApi } from '../../api/auditApi'
import { AUDIT_ACTION_LABELS } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'

const MODULES = ['', 'BG', 'BG_AMENDMENT', 'BG_RELEASE', 'LC', 'FD']

export default function AuditLog() {
  const { push } = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [module, setModule] = useState('')

  const load = (m) => {
    setLoading(true)
    const call = m ? auditApi.getByModule(m) : auditApi.getRecent()
    call.then(setLogs).catch(() => push('Could not load audit trail.', 'error')).finally(() => setLoading(false))
  }

  useEffect(() => { load(module) }, [module]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Audit Trail"
        description="Every create, update, delete, and status change made in the system."
      />

      <div className="mb-4 max-w-xs">
        <Select label="Module" value={module} onChange={(e) => setModule(e.target.value)}>
          {MODULES.map((m) => <option key={m} value={m}>{m || 'All modules'}</option>)}
        </Select>
      </div>

      {loading ? <Loader /> : logs.length === 0 ? (
        <EmptyState message="No activity recorded yet." />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-xl2 border border-border bg-white shadow-card">
          {logs.map((l) => (
            <div key={l.id} className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 rounded-lg bg-ink-50 p-1.5 text-muted"><History size={14} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink-900">
                  <span className="font-medium">{l.module}</span> — {l.recordLabel || l.recordId}
                  {' · '}<span className="text-muted">{AUDIT_ACTION_LABELS[l.actionType] || l.actionType}</span>
                </p>
                {l.description && <p className="text-xs text-muted">{l.description}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-ink-900">{l.username}</p>
                <p className="text-xs text-muted">{formatDate(l.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
