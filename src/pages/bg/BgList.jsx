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
import { bgApi } from '../../api/bgApi'
import { bankApi, clientApi, guaranteeTypeApi } from '../../api/masterApi'
import { INSTRUMENT_STATUS } from '../../utils/constants'
import { formatCurrency, formatDate, toInputDate } from '../../utils/formatters'

const emptyForm = {
  clientId: '', siteProject: '', guaranteeTypeId: '', issuingBankId: '', bgNo: '',
  bgAmount: '', interestRate: '', bankCharges: '', issueDate: '', expiryDate: '',
  durationClaimPeriod: '', status: INSTRUMENT_STATUS.ACTIVE,
}

export default function BgList() {
  const { push } = useToast()
  const [rows, setRows] = useState([])
  const [banks, setBanks] = useState([])
  const [clients, setClients] = useState([])
  const [guaranteeTypes, setGuaranteeTypes] = useState([])
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
      setRows(await bgApi.getAll(status || undefined))
    } catch {
      push('Could not load Bank Guarantees.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bankApi.getAll().then(setBanks).catch(() => {})
    clientApi.getAll().then(setClients).catch(() => {})
    guaranteeTypeApi.getAll().then(setGuaranteeTypes).catch(() => {})
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
      clientId: row.clientId ?? '',
      siteProject: row.siteProject ?? '',
      guaranteeTypeId: row.guaranteeTypeId ?? '',
      issuingBankId: row.issuingBankId ?? '',
      bgNo: row.bgNo ?? '',
      bgAmount: row.bgAmount ?? '',
      interestRate: row.interestRate ?? '',
      bankCharges: row.bankCharges ?? '',
      issueDate: toInputDate(row.issueDate),
      expiryDate: toInputDate(row.expiryDate),
      durationClaimPeriod: row.durationClaimPeriod ?? '',
      status: row.status ?? INSTRUMENT_STATUS.ACTIVE,
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.clientId) errs.clientId = 'Required'
    if (!form.guaranteeTypeId) errs.guaranteeTypeId = 'Required'
    if (!form.issuingBankId) errs.issuingBankId = 'Required'
    if (!form.bgNo?.trim()) errs.bgNo = 'Required'
    if (!form.bgAmount) errs.bgAmount = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      ...form,
      clientId: Number(form.clientId),
      guaranteeTypeId: Number(form.guaranteeTypeId),
      issuingBankId: Number(form.issuingBankId),
      bgAmount: Number(form.bgAmount),
      interestRate: form.interestRate === '' ? null : Number(form.interestRate),
      bankCharges: form.bankCharges === '' ? null : Number(form.bankCharges),
    }
    try {
      if (editing) {
        await bgApi.update(editing.id, payload)
        push('Bank Guarantee updated.')
      } else {
        await bgApi.create(payload)
        push('Bank Guarantee added.')
      }
      setModalOpen(false)
      load(statusFilter)
    } catch (err) {
      push(extractErrorMessage(err, 'Could not save Bank Guarantee.'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await bgApi.remove(deleteTarget.id)
      push('Bank Guarantee deleted.')
      setDeleteTarget(null)
      load(statusFilter)
    } catch (err) {
      push(extractErrorMessage(err, 'Could not delete Bank Guarantee.'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'bgNo', header: 'BG No.', render: (r) => <span className="num font-medium">{r.bgNo}</span> },
    { key: 'clientName', header: 'Client' },
    { key: 'siteProject', header: 'Site / Project' },
    { key: 'guaranteeTypeCode', header: 'Type' },
    { key: 'expiryDate', header: 'Expiry', render: (r) => formatDate(r.expiryDate) },
    { key: 'bgAmount', header: 'Amount', render: (r) => <span className="num">{formatCurrency(r.bgAmount)}</span> },
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
        title="Bank Guarantees"
        description="BGs issued in favour of clients, with financial detail and the claim period."
        actions={
          <>
            <Link to="/fd-linking"><Button variant="outline"><Link2 size={16} /> Manage Links</Button></Link>
            <Button variant="accent" onClick={openCreate}><Plus size={16} /> Add BG</Button>
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
          emptyMessage="No Bank Guarantees recorded yet."
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
        title={editing ? 'Edit Bank Guarantee' : 'Add Bank Guarantee'}
        footer={<>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </>}
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Client" required error={errors.clientId}
            value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
            <option value="">Select client…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.clientName}</option>)}
          </Select>
          <Input label="Site / Project"
            value={form.siteProject} onChange={(e) => setForm({ ...form, siteProject: e.target.value })} />
          <Select label="Guarantee Type" required error={errors.guaranteeTypeId}
            value={form.guaranteeTypeId} onChange={(e) => setForm({ ...form, guaranteeTypeId: e.target.value })}>
            <option value="">Select type…</option>
            {guaranteeTypes.map((g) => <option key={g.id} value={g.id}>{g.code}{g.typeName ? ` — ${g.typeName}` : ''}</option>)}
          </Select>
          <Select label="Issuing Bank" required error={errors.issuingBankId}
            value={form.issuingBankId} onChange={(e) => setForm({ ...form, issuingBankId: e.target.value })}>
            <option value="">Select bank…</option>
            {banks.map((b) => <option key={b.id} value={b.id}>{b.bankName}</option>)}
          </Select>
          <Input label="BG No." required error={errors.bgNo}
            value={form.bgNo} onChange={(e) => setForm({ ...form, bgNo: e.target.value })} />
          <Input label="BG Amount" type="number" step="0.01" required error={errors.bgAmount}
            value={form.bgAmount} onChange={(e) => setForm({ ...form, bgAmount: e.target.value })} />
          <Input label="Interest Rate (%)" type="number" step="0.01"
            value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} />
          <Input label="Bank Charges" type="number" step="0.01"
            value={form.bankCharges} onChange={(e) => setForm({ ...form, bankCharges: e.target.value })} />
          <Input label="Issue Date" type="date"
            value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
          <Input label="Expiry Date" type="date"
            value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          <Input label="Duration / Claim Period" placeholder="e.g. 12 months + 3 months claim" className="sm:col-span-2"
            value={form.durationClaimPeriod} onChange={(e) => setForm({ ...form, durationClaimPeriod: e.target.value })} />
          <Select label="Status"
            value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {Object.values(INSTRUMENT_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message="This will permanently remove this Bank Guarantee record. This can't be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
