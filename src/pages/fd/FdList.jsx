import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Link2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Loader from '../../components/common/Loader'
import StatusBadge from '../../components/common/StatusBadge'
import { Input, Select } from '../../components/common/Field'
import { useToast } from '../../components/common/Toast'
import { extractErrorMessage } from '../../api/axiosClient'
import { fdApi } from '../../api/fdApi'
import { bankApi } from '../../api/masterApi'
import { FD_STATUS } from '../../utils/constants'
import { formatCurrency, formatDate, toInputDate } from '../../utils/formatters'

const emptyForm = {
  bankId: '',
  fdNumber: '',
  fdCreationDate: '',
  fdMaturityDate: '',
  period: '',
  rate: '',
  fdAmount: '',
  status: FD_STATUS.OPEN,
}

export default function FdList() {
  const { push } = useToast()
  const [rows, setRows] = useState([])
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const bankMap = useMemo(() => Object.fromEntries(banks.map((b) => [b.id, b.bankName])), [banks])

  const load = async (status) => {
    setLoading(true)
    try {
      const data = await fdApi.getAll(status || undefined)
      setRows(data)
    } catch {
      push('Could not load Fixed Deposits.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bankApi.getAll().then(setBanks).catch(() => {})
  }, [])

  useEffect(() => {
    load(statusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      bankId: row.bankId ?? '',
      fdNumber: row.fdNumber ?? '',
      fdCreationDate: toInputDate(row.fdCreationDate),
      fdMaturityDate: toInputDate(row.fdMaturityDate),
      period: row.period ?? '',
      rate: row.rate ?? '',
      fdAmount: row.fdAmount ?? '',
      status: row.status ?? FD_STATUS.OPEN,
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.bankId) errs.bankId = 'Required'
    if (!form.fdNumber?.trim()) errs.fdNumber = 'Required'
    if (!form.fdAmount) errs.fdAmount = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      ...form,
      bankId: Number(form.bankId),
      rate: form.rate === '' ? null : Number(form.rate),
      fdAmount: Number(form.fdAmount),
    }
    try {
      if (editing) {
        await fdApi.update(editing.id, payload)
        push('Fixed Deposit updated.')
      } else {
        await fdApi.create(payload)
        push('Fixed Deposit added.')
      }
      setModalOpen(false)
      load(statusFilter)
    } catch (err) {
      push(extractErrorMessage(err, 'Could not save Fixed Deposit.'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await fdApi.remove(deleteTarget.id)
      push('Fixed Deposit deleted.')
      setDeleteTarget(null)
      load(statusFilter)
    } catch (err) {
      push(extractErrorMessage(err, 'Could not delete Fixed Deposit.'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'fdNumber', header: 'FD Number', render: (r) => <span className="num font-medium">{r.fdNumber}</span> },
    { key: 'bankName', header: 'Bank', render: (r) => r.bankName || bankMap[r.bankId] },
    { key: 'fdCreationDate', header: 'Created', render: (r) => formatDate(r.fdCreationDate) },
    { key: 'fdMaturityDate', header: 'Maturity', render: (r) => formatDate(r.fdMaturityDate) },
    { key: 'period', header: 'Period' },
    { key: 'rate', header: 'Rate', render: (r) => (r.rate != null ? `${r.rate}%` : '—') },
    { key: 'fdAmount', header: 'Amount', render: (r) => <span className="num">{formatCurrency(r.fdAmount)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Module"
        title="FD Tracker"
        description="Every Fixed Deposit the company holds — open, lien-marked, or closed."
        actions={
          <>
            <Link to="/fd-linking">
              <Button variant="outline"><Link2 size={16} /> Manage Links</Button>
            </Link>
            <Button variant="accent" onClick={openCreate}>
              <Plus size={16} /> Add Fixed Deposit
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', ...Object.values(FD_STATUS)].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-ink-900 text-white' : 'bg-white text-muted ring-1 ring-inset ring-border hover:text-ink-900'
            }`}
          >
            {s === '' ? 'All' : s.replace('_', '-')}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <Table
          columns={columns}
          rows={rows}
          emptyMessage="No Fixed Deposits recorded yet."
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <button onClick={() => openEdit(row)} className="rounded-lg p-2 text-muted hover:bg-ink-50 hover:text-ink-900" aria-label="Edit">
                <Pencil size={15} />
              </button>
              <button onClick={() => setDeleteTarget(row)} className="rounded-lg p-2 text-muted hover:bg-danger-50 hover:text-danger" aria-label="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          )}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Fixed Deposit' : 'Add Fixed Deposit'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Bank" required error={errors.bankId}
            value={form.bankId} onChange={(e) => setForm({ ...form, bankId: e.target.value })}
          >
            <option value="">Select bank…</option>
            {banks.map((b) => <option key={b.id} value={b.id}>{b.bankName}</option>)}
          </Select>
          <Input
            label="FD Number" required error={errors.fdNumber}
            value={form.fdNumber} onChange={(e) => setForm({ ...form, fdNumber: e.target.value })}
          />
          <Input
            label="FD Creation Date" type="date"
            value={form.fdCreationDate} onChange={(e) => setForm({ ...form, fdCreationDate: e.target.value })}
          />
          <Input
            label="FD Maturity Date" type="date"
            value={form.fdMaturityDate} onChange={(e) => setForm({ ...form, fdMaturityDate: e.target.value })}
          />
          <Input
            label="Period" placeholder="e.g. 12 months"
            value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}
          />
          <Input
            label="Rate (%)" type="number" step="0.01"
            value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })}
          />
          <Input
            label="FD Amount" type="number" step="0.01" required error={errors.fdAmount}
            value={form.fdAmount} onChange={(e) => setForm({ ...form, fdAmount: e.target.value })}
          />
          <Select
            label="Status"
            value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {Object.values(FD_STATUS).map((s) => <option key={s} value={s}>{s.replace('_', '-')}</option>)}
          </Select>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message="This will permanently remove this Fixed Deposit record. This can't be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
