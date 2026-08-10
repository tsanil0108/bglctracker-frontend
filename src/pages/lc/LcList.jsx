import React, { useEffect, useState } from 'react'
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
import { lcApi } from '../../api/lcApi'
import { bankApi, vendorApi } from '../../api/masterApi'
import { INSTRUMENT_STATUS, LC_PERIOD_TYPE } from '../../utils/constants'
import { formatCurrency, formatDate, toInputDate } from '../../utils/formatters'

const emptyForm = {
  issueBankId: '', lcNo: '', lcCreationDate: '', lcPeriodType: LC_PERIOD_TYPE.CREATION,
  lcExpiryDate: '', lcAmount: '', interestRate: '', bankCharges: '', materialReceiptDate: '',
  partyBearsInterest: false, acceptanceDate: '', paymentDate: '', linkedVendorId: '',
  status: INSTRUMENT_STATUS.ACTIVE,
}

export default function LcList() {
  const { push } = useToast()
  const [rows, setRows] = useState([])
  const [banks, setBanks] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async (status) => {
    setLoading(true)
    try {
      setRows(await lcApi.getAll(status || undefined))
    } catch {
      push('Could not load Letters of Credit.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bankApi.getAll().then(setBanks).catch(() => {})
    vendorApi.getAll().then(setVendors).catch(() => {})
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
      issueBankId: row.issueBankId ?? '',
      lcNo: row.lcNo ?? '',
      lcCreationDate: toInputDate(row.lcCreationDate),
      lcPeriodType: row.lcPeriodType ?? LC_PERIOD_TYPE.CREATION,
      lcExpiryDate: toInputDate(row.lcExpiryDate),
      lcAmount: row.lcAmount ?? '',
      interestRate: row.interestRate ?? '',
      bankCharges: row.bankCharges ?? '',
      materialReceiptDate: toInputDate(row.materialReceiptDate),
      partyBearsInterest: !!row.partyBearsInterest,
      acceptanceDate: toInputDate(row.acceptanceDate),
      paymentDate: toInputDate(row.paymentDate),
      linkedVendorId: row.linkedVendorId ?? '',
      status: row.status ?? INSTRUMENT_STATUS.ACTIVE,
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.issueBankId) errs.issueBankId = 'Required'
    if (!form.lcNo?.trim()) errs.lcNo = 'Required'
    if (!form.lcAmount) errs.lcAmount = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      ...form,
      issueBankId: Number(form.issueBankId),
      linkedVendorId: form.linkedVendorId ? Number(form.linkedVendorId) : null,
      lcAmount: Number(form.lcAmount),
      interestRate: form.interestRate === '' ? null : Number(form.interestRate),
      bankCharges: form.bankCharges === '' ? null : Number(form.bankCharges),
      partyBearsInterest: !!form.partyBearsInterest,
    }
    try {
      if (editing) {
        await lcApi.update(editing.id, payload)
        push('Letter of Credit updated.')
      } else {
        await lcApi.create(payload)
        push('Letter of Credit added.')
      }
      setModalOpen(false)
      load(statusFilter)
    } catch (err) {
      push(extractErrorMessage(err, 'Could not save Letter of Credit.'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await lcApi.remove(deleteTarget.id)
      push('Letter of Credit deleted.')
      setDeleteTarget(null)
      load(statusFilter)
    } catch (err) {
      push(extractErrorMessage(err, 'Could not delete Letter of Credit.'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'lcNo', header: 'LC No.', render: (r) => <span className="num font-medium">{r.lcNo}</span> },
    { key: 'issueBankName', header: 'Issue Bank' },
    { key: 'linkedVendorName', header: 'Vendor', render: (r) => r.linkedVendorName || '—' },
    { key: 'lcExpiryDate', header: 'Expiry', render: (r) => formatDate(r.lcExpiryDate) },
    { key: 'lcAmount', header: 'Amount', render: (r) => <span className="num">{formatCurrency(r.lcAmount)}</span> },
    {
      key: 'linkedFds', header: 'Linked FDs',
      render: (r) => (r.linkedFds?.length ? `${r.linkedFds.length} FD${r.linkedFds.length > 1 ? 's' : ''}` : '—'),
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Module"
        title="Letters of Credit"
        description="LCs issued in favour of vendors, with full financial and timeline detail."
        actions={
          <>
            <Link to="/fd-linking"><Button variant="outline"><Link2 size={16} /> Manage Links</Button></Link>
            <Button variant="accent" onClick={openCreate}><Plus size={16} /> Add LC</Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', ...Object.values(INSTRUMENT_STATUS)].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-ink-900 text-white' : 'bg-white text-muted ring-1 ring-inset ring-border hover:text-ink-900'
            }`}
          >
            {s === '' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <Table
          columns={columns}
          rows={rows}
          emptyMessage="No Letters of Credit recorded yet."
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <button onClick={() => openEdit(row)} className="rounded-lg p-2 text-muted hover:bg-ink-50 hover:text-ink-900" aria-label="Edit"><Pencil size={15} /></button>
              <button onClick={() => setDeleteTarget(row)} className="rounded-lg p-2 text-muted hover:bg-danger-50 hover:text-danger" aria-label="Delete"><Trash2 size={15} /></button>
            </div>
          )}
        />
      )}

      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)} size="lg"
        title={editing ? 'Edit Letter of Credit' : 'Add Letter of Credit'}
        footer={<>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </>}
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Issue Bank" required error={errors.issueBankId}
            value={form.issueBankId} onChange={(e) => setForm({ ...form, issueBankId: e.target.value })}>
            <option value="">Select bank…</option>
            {banks.map((b) => <option key={b.id} value={b.id}>{b.bankName}</option>)}
          </Select>
          <Input label="LC No." required error={errors.lcNo}
            value={form.lcNo} onChange={(e) => setForm({ ...form, lcNo: e.target.value })} />
          <Input label="LC Creation Date" type="date"
            value={form.lcCreationDate} onChange={(e) => setForm({ ...form, lcCreationDate: e.target.value })} />
          <Select label="LC Period Type"
            value={form.lcPeriodType} onChange={(e) => setForm({ ...form, lcPeriodType: e.target.value })}>
            <option value={LC_PERIOD_TYPE.CREATION}>Creation-based</option>
            <option value={LC_PERIOD_TYPE.AT_SIGHT}>At Sight</option>
          </Select>
          <Input label="LC Expiry Date" type="date"
            value={form.lcExpiryDate} onChange={(e) => setForm({ ...form, lcExpiryDate: e.target.value })} />
          <Input label="LC Amount" type="number" step="0.01" required error={errors.lcAmount}
            value={form.lcAmount} onChange={(e) => setForm({ ...form, lcAmount: e.target.value })} />
          <Input label="Interest Rate (%)" type="number" step="0.01"
            value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} />
          <Input label="Bank Charges" type="number" step="0.01"
            value={form.bankCharges} onChange={(e) => setForm({ ...form, bankCharges: e.target.value })} />
          <Input label="Material Receipt Date" type="date"
            value={form.materialReceiptDate} onChange={(e) => setForm({ ...form, materialReceiptDate: e.target.value })} />
          <Select label="Party Bears Interest"
            value={form.partyBearsInterest ? 'true' : 'false'}
            onChange={(e) => setForm({ ...form, partyBearsInterest: e.target.value === 'true' })}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </Select>
          <Input label="Acceptance Date" type="date"
            value={form.acceptanceDate} onChange={(e) => setForm({ ...form, acceptanceDate: e.target.value })} />
          <Input label="Payment Date (by Company)" type="date"
            value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
          <Select label="Linked Vendor"
            value={form.linkedVendorId} onChange={(e) => setForm({ ...form, linkedVendorId: e.target.value })}>
            <option value="">None</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
          </Select>
          <Select label="Status"
            value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {Object.values(INSTRUMENT_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message="This will permanently remove this Letter of Credit record. This can't be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
