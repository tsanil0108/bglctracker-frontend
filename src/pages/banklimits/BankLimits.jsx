import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Loader from '../../components/common/Loader'
import { Input, Select, Textarea } from '../../components/common/Field'
import { useToast } from '../../components/common/Toast'
import { extractErrorMessage } from '../../api/axiosClient'
import { bankLimitApi } from '../../api/bankLimitApi'
import { bankApi, groupCompanyApi } from '../../api/masterApi'
import { FACILITY_TYPES } from '../../utils/constants'
import { formatCurrency, formatDate } from '../../utils/formatters'

const emptyForm = {
  groupCompanyId: '', bankId: '', facilityType: 'BG', sanctionedLimit: '',
  effectiveDate: '', reviewExpiryDate: '', remarks: '',
}

function UtilizationBar({ pct }) {
  const clamped = Math.min(pct ?? 0, 100)
  const color = pct >= 90 ? 'bg-danger' : pct >= 75 ? 'bg-orange-500' : 'bg-bg-600'
  return (
    <div className="w-40">
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-50">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">{pct?.toFixed?.(1) ?? 0}% utilized</p>
    </div>
  )
}

export default function BankLimits() {
  const { push } = useToast()
  const [rows, setRows] = useState([])
  const [banks, setBanks] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setRows(await bankLimitApi.getAll())
    } catch {
      push('Could not load Bank Limits.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bankApi.getAll().then(setBanks).catch(() => {})
    groupCompanyApi.getAll().then(setCompanies).catch(() => {})
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      groupCompanyId: row.groupCompanyId ?? '',
      bankId: row.bankId ?? '',
      facilityType: row.facilityType ?? 'BG',
      sanctionedLimit: row.sanctionedLimit ?? '',
      effectiveDate: row.effectiveDate ? row.effectiveDate.slice(0, 10) : '',
      reviewExpiryDate: row.reviewExpiryDate ? row.reviewExpiryDate.slice(0, 10) : '',
      remarks: row.remarks ?? '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.bankId) errs.bankId = 'Required'
    if (!form.facilityType) errs.facilityType = 'Required'
    if (!form.sanctionedLimit) errs.sanctionedLimit = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      groupCompanyId: form.groupCompanyId ? Number(form.groupCompanyId) : null,
      bankId: Number(form.bankId),
      facilityType: form.facilityType,
      sanctionedLimit: Number(form.sanctionedLimit),
      effectiveDate: form.effectiveDate || null,
      reviewExpiryDate: form.reviewExpiryDate || null,
      remarks: form.remarks || null,
    }
    try {
      if (editing) {
        await bankLimitApi.update(editing.id, payload)
        push('Bank Limit updated.')
      } else {
        await bankLimitApi.create(payload)
        push('Bank Limit added.')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      push(extractErrorMessage(err, 'Could not save Bank Limit.'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await bankLimitApi.remove(deleteTarget.id)
      push('Bank Limit deleted.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      push(extractErrorMessage(err, 'Could not delete Bank Limit.'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'bankName', header: 'Bank' },
    { key: 'groupCompanyName', header: 'Group Company', render: (r) => r.groupCompanyName || '—' },
    { key: 'facilityType', header: 'Facility', render: (r) => FACILITY_TYPES[r.facilityType] || r.facilityType },
    { key: 'sanctionedLimit', header: 'Sanctioned', render: (r) => <span className="num">{formatCurrency(r.sanctionedLimit)}</span> },
    { key: 'utilizedLimit', header: 'Utilized', render: (r) => <span className="num">{formatCurrency(r.utilizedLimit)}</span> },
    { key: 'availableLimit', header: 'Available', render: (r) => <span className="num">{formatCurrency(r.availableLimit)}</span> },
    { key: 'utilizationPercent', header: 'Utilization', render: (r) => <UtilizationBar pct={r.utilizationPercent} /> },
    { key: 'reviewExpiryDate', header: 'Review / Expiry', render: (r) => formatDate(r.reviewExpiryDate) },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Module"
        title="Bank Limits"
        description="Sanctioned BG/LC facilities per bank, with live utilization tracked from active exposure."
        actions={<Button variant="accent" onClick={openCreate}><Plus size={16} /> Add Bank Limit</Button>}
      />

      {loading ? <Loader /> : (
        <Table
          columns={columns}
          rows={rows}
          emptyMessage="No Bank Limits configured yet."
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <button onClick={() => openEdit(row)} className="rounded-lg p-2 text-muted hover:bg-ink-50 hover:text-ink-900" aria-label="Edit"><Pencil size={15} /></button>
              <button onClick={() => setDeleteTarget(row)} className="rounded-lg p-2 text-muted hover:bg-danger-50 hover:text-danger" aria-label="Delete"><Trash2 size={15} /></button>
            </div>
          )}
        />
      )}

      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)} size="md"
        title={editing ? 'Edit Bank Limit' : 'Add Bank Limit'}
        footer={<>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </>}
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Bank" required error={errors.bankId}
            value={form.bankId} onChange={(e) => setForm({ ...form, bankId: e.target.value })}>
            <option value="">Select bank…</option>
            {banks.map((b) => <option key={b.id} value={b.id}>{b.bankName}</option>)}
          </Select>
          <Select label="Group Company" hint="Optional — for reference only"
            value={form.groupCompanyId} onChange={(e) => setForm({ ...form, groupCompanyId: e.target.value })}>
            <option value="">Not specified</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </Select>
          <Select label="Facility Type" required error={errors.facilityType}
            value={form.facilityType} onChange={(e) => setForm({ ...form, facilityType: e.target.value })}>
            {Object.entries(FACILITY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Input label="Sanctioned Limit" type="number" step="0.01" required error={errors.sanctionedLimit}
            value={form.sanctionedLimit} onChange={(e) => setForm({ ...form, sanctionedLimit: e.target.value })} />
          <Input label="Effective Date" type="date"
            value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
          <Input label="Review / Expiry Date" type="date"
            value={form.reviewExpiryDate} onChange={(e) => setForm({ ...form, reviewExpiryDate: e.target.value })} />
          <Textarea label="Remarks" className="sm:col-span-2"
            value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message="This will permanently remove this Bank Limit record. This can't be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
