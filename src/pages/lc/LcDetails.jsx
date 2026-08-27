import React, {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Link2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Loader from '../../components/common/Loader'
import StatusBadge from '../../components/common/StatusBadge'
import { Input, Select, Textarea } from '../../components/common/Field'
import { useToast } from '../../components/common/Toast'
import { extractErrorMessage } from '../../api/axiosClient'
import { lcApi } from '../../api/lcApi'
import { lcAmendmentApi } from '../../api/lcAmendmentApi'
import { lcUtilizationApi } from '../../api/lcUtilizationApi'
import { fdLinkApi } from '../../api/fdLinkApi'
import { fdApi } from '../../api/fdApi'
import { bankApi, vendorApi } from '../../api/masterApi'
import {
  LC_AMENDMENT_TYPES, DOCUMENT_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS,
} from '../../utils/constants'
import { formatCurrency, formatDate } from '../../utils/formatters'

const emptyAmendment = {
  amendmentDate: '', amendmentType: 'AMOUNT_INCREASE', newLcAmount: '', newExpiryDate: '',
  newVendorId: '', newBankId: '', reason: '', remarks: '',
}

const emptyUtilization = {
  invoiceNumber: '', invoiceDate: '', amount: '', materialDescription: '',
  materialReceiptDate: '', documentStatus: 'PENDING', acceptanceDate: '',
  paymentDate: '', paymentStatus: 'PENDING', remarks: '',
}

export default function LcDetails() {
  const { id } = useParams()
  const { push } = useToast()

  const [lc, setLc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [banks, setBanks] = useState([])
  const [vendors, setVendors] = useState([])
  const [fdLinks, setFdLinks] = useState([])
  const [fds, setFds] = useState([])
  const [fdLinksLoading, setFdLinksLoading] = useState(false)

  const [amendments, setAmendments] = useState([])
  const [amendModalOpen, setAmendModalOpen] = useState(false)
  const [amendForm, setAmendForm] = useState(emptyAmendment)
  const [amendErrors, setAmendErrors] = useState({})
  const [amendSaving, setAmendSaving] = useState(false)
  const [deleteAmendTarget, setDeleteAmendTarget] = useState(null)
  const [deletingAmend, setDeletingAmend] = useState(false)

  const [utilizations, setUtilizations] = useState([])
  const [summary, setSummary] = useState(null)
  const [utilModalOpen, setUtilModalOpen] = useState(false)
  const [utilForm, setUtilForm] = useState(emptyUtilization)
  const [utilErrors, setUtilErrors] = useState({})
  const [utilSaving, setUtilSaving] = useState(false)
  const [deleteUtilTarget, setDeleteUtilTarget] = useState(null)
  const [deletingUtil, setDeletingUtil] = useState(false)

  const loadLc = useCallback(async () => {
    setLoading(true)
    try {
      setLc(await lcApi.getById(id))
    } catch {
      push('Could not load this Letter of Credit.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, push])

  const loadAmendments = useCallback(async () => {
    try {
      setAmendments(await lcAmendmentApi.getByLcId(id))
    } catch { /* non-critical */ }
  }, [id])

  const loadUtilizations = useCallback(async () => {
    try {
      const [list, summaryData] = await Promise.all([
        lcUtilizationApi.getByLcId(id),
        lcUtilizationApi.getSummary(id),
      ])
      setUtilizations(list)
      setSummary(summaryData)
    } catch { /* non-critical */ }
  }, [id])


  const loadFdLinks = useCallback(async () => {
    setFdLinksLoading(true)
    try {
      const [linkData, fdData] = await Promise.all([
        fdLinkApi.getByLc(id),
        fdApi.getAll(),
      ])

      setFdLinks(Array.isArray(linkData) ? linkData : [])
      setFds(Array.isArray(fdData) ? fdData : [])
    } catch {
      setFdLinks([])
      setFds([])
    } finally {
      setFdLinksLoading(false)
    }
  }, [id])

  useEffect(() => { loadLc() }, [loadLc])
  useEffect(() => { loadAmendments() }, [loadAmendments])
  useEffect(() => { loadUtilizations() }, [loadUtilizations])
  useEffect(() => { loadFdLinks() }, [loadFdLinks])
  useEffect(() => {
    bankApi.getAll().then(setBanks).catch(() => {})
    vendorApi.getAll().then(setVendors).catch(() => {})
  }, [])

  // ---------- Amendments ----------
  const openAmendModal = () => {
    setAmendForm(emptyAmendment)
    setAmendErrors({})
    setAmendModalOpen(true)
  }

  const validateAmend = () => {
    const errs = {}
    if (!amendForm.amendmentDate) errs.amendmentDate = 'Required'
    if (!amendForm.amendmentType) errs.amendmentType = 'Required'
    setAmendErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAddAmendment = async (e) => {
    e.preventDefault()
    if (!validateAmend()) return
    setAmendSaving(true)
    const payload = {
      amendmentDate: amendForm.amendmentDate,
      amendmentType: amendForm.amendmentType,
      newLcAmount: amendForm.newLcAmount === '' ? null : Number(amendForm.newLcAmount),
      newExpiryDate: amendForm.newExpiryDate || null,
      newVendorId: amendForm.newVendorId === '' ? null : Number(amendForm.newVendorId),
      newBankId: amendForm.newBankId === '' ? null : Number(amendForm.newBankId),
      reason: amendForm.reason || null,
      remarks: amendForm.remarks || null,
    }
    try {
      await lcAmendmentApi.add(id, payload)
      push('Amendment recorded.')
      setAmendModalOpen(false)
      loadLc()
      loadAmendments()
    } catch (err) {
      push(extractErrorMessage(err, 'Could not save the amendment.'), 'error')
    } finally {
      setAmendSaving(false)
    }
  }

  const handleDeleteAmendment = async () => {
    if (!deleteAmendTarget?.id) return

    setDeletingAmend(true)
    try {
      await lcAmendmentApi.remove(id, deleteAmendTarget.id)
      push('Amendment deleted and LC restored.')
      setDeleteAmendTarget(null)
      await Promise.all([loadLc(), loadAmendments()])
    } catch (err) {
      push(extractErrorMessage(err, 'Could not delete the amendment.'), 'error')
    } finally {
      setDeletingAmend(false)
    }
  }

  // ---------- Utilizations ----------
  const openUtilModal = () => {
    setUtilForm(emptyUtilization)
    setUtilErrors({})
    setUtilModalOpen(true)
  }

  const validateUtil = () => {
    const errs = {}
    if (!utilForm.invoiceNumber) errs.invoiceNumber = 'Required'
    if (!utilForm.invoiceDate) errs.invoiceDate = 'Required'
    if (!utilForm.amount) errs.amount = 'Required'
    setUtilErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAddUtilization = async (e) => {
    e.preventDefault()
    if (!validateUtil()) return
    setUtilSaving(true)
    const payload = {
      invoiceNumber: utilForm.invoiceNumber,
      invoiceDate: utilForm.invoiceDate,
      amount: Number(utilForm.amount),
      materialDescription: utilForm.materialDescription || null,
      materialReceiptDate: utilForm.materialReceiptDate || null,
      documentStatus: utilForm.documentStatus || null,
      acceptanceDate: utilForm.acceptanceDate || null,
      paymentDate: utilForm.paymentDate || null,
      paymentStatus: utilForm.paymentStatus || null,
      remarks: utilForm.remarks || null,
    }
    try {
      await lcUtilizationApi.create(id, payload)
      push('Utilization added.')
      setUtilModalOpen(false)
      loadUtilizations()
    } catch (err) {
      push(extractErrorMessage(err, 'Could not save the utilization.'), 'error')
    } finally {
      setUtilSaving(false)
    }
  }

  const handleDeleteUtil = async () => {
    setDeletingUtil(true)
    try {
      await lcUtilizationApi.remove(deleteUtilTarget.id)
      push('Utilization deleted.')
      setDeleteUtilTarget(null)
      loadUtilizations()
    } catch (err) {
      push(extractErrorMessage(err, 'Could not delete the utilization.'), 'error')
    } finally {
      setDeletingUtil(false)
    }
  }

  if (loading) return <Loader />
  if (!lc) return null

  return (
    <div>
      <Link to="/lc" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink-900">
        <ArrowLeft size={15} /> Back to Letters of Credit
      </Link>

      <PageHeader
        eyebrow="Letter of Credit"
        title={lc.lcNo}
        description={lc.linkedVendorName || 'No vendor linked'}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/fd-linking">
              <Button variant="outline">
                <Link2 size={16} />
                Manage FD Links
              </Button>
            </Link>
            <StatusBadge status={lc.status} />
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl2 border border-border bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">LC Amount</p>
          <p className="mt-1 text-lg font-semibold text-ink-900">{formatCurrency(lc.lcAmount)}</p>
        </div>
        <div className="rounded-xl2 border border-border bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Issue Bank</p>
          <p className="mt-1 text-lg font-semibold text-ink-900">{lc.issueBankName}</p>
        </div>
        <div className="rounded-xl2 border border-border bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">LC Expiry</p>
          <p className="mt-1 text-lg font-semibold text-ink-900">{formatDate(lc.lcExpiryDate)}</p>
        </div>
        <div className="rounded-xl2 border border-border bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Utilized / Remaining</p>
          <p className="mt-1 text-lg font-semibold text-ink-900">
            {summary ? `${formatCurrency(summary.totalUtilized)} / ${formatCurrency(summary.remainingBalance)}` : '—'}
          </p>
          {summary && (
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-50">
              <div
                className={`h-2 rounded-full ${summary.utilizationPercent >= 90 ? 'bg-danger' : 'bg-bg-600'}`}
                style={{ width: `${Math.min(summary.utilizationPercent ?? 0, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>


      {/* LC Details */}
      <div className="mb-6 rounded-xl2 border border-border bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-ink-900">
          Letter of Credit Details
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Group Company" value={lc.groupCompanyName} />
          <DetailItem label="Vendor / Beneficiary" value={lc.linkedVendorName} />
          <DetailItem label="Issue Bank" value={lc.issueBankName} />
          <DetailItem label="LC Period Type" value={lc.lcPeriodType} />

          <DetailItem label="LC Creation Date" value={formatDate(lc.lcCreationDate)} />
          <DetailItem label="LC Expiry Date" value={formatDate(lc.lcExpiryDate)} />
          <DetailItem label="LC Amount" value={formatCurrency(lc.lcAmount)} />
          <DetailItem
            label="Interest Rate"
            value={
              lc.interestRate === null || lc.interestRate === undefined
                ? '—'
                : `${lc.interestRate}%`
            }
          />

          <DetailItem label="Bank Charges" value={formatCurrency(lc.bankCharges ?? 0)} />
          <DetailItem label="Material Receipt Date" value={formatDate(lc.materialReceiptDate)} />
          <DetailItem label="Acceptance Date" value={formatDate(lc.acceptanceDate)} />
          <DetailItem label="Payment Date" value={formatDate(lc.paymentDate)} />

          <DetailItem
            label="Party Bears Interest"
            value={lc.partyBearsInterest ? 'Yes' : 'No'}
          />
          <DetailItem label="Status" value={lc.status} />
        </div>
      </div>

      {/* Linked Fixed Deposits */}
      <div className="mb-6 rounded-xl2 border border-border bg-white p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Linked Fixed Deposits
            </h2>
            <p className="mt-1 text-sm text-muted">
              Fixed Deposits pledged as margin against this Letter of Credit.
            </p>
          </div>

          <Link to="/fd-linking">
            <Button variant="outline" size="sm">
              <Link2 size={15} />
              Manage Links
            </Button>
          </Link>
        </div>

        {fdLinksLoading ? (
          <Loader />
        ) : fdLinks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
            <Link2 size={22} className="mx-auto text-muted" />
            <p className="mt-3 text-sm font-medium text-ink-900">
              No Fixed Deposits Linked
            </p>
            <p className="mt-1 text-sm text-muted">
              No FD margin is currently pledged against this LC.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4">FD Number</th>
                  <th className="py-2 pr-4">Bank</th>
                  <th className="py-2 pr-4">FD Amount</th>
                  <th className="py-2 pr-4">Linked Amount</th>
                  <th className="py-2 pr-4">Available</th>
                  <th className="py-2 pr-4">Maturity</th>
                  <th className="py-2">Linked Date</th>
                </tr>
              </thead>

              <tbody>
                {fdLinks.map((link) => {
                  const fd = fds.find(
                    (item) => String(item.id) === String(link.fdId)
                  )

                  return (
                    <tr key={link.id} className="border-b border-border/70">
                      <td className="py-3 pr-4 font-mono font-semibold text-ink-900">
                        {link.fdNo || fd?.fdNumber || '—'}
                      </td>
                      <td className="py-3 pr-4">
                        {fd?.bankName || '—'}
                      </td>
                      <td className="py-3 pr-4 num">
                        {formatCurrency(fd?.fdAmount ?? 0)}
                      </td>
                      <td className="py-3 pr-4 num font-semibold">
                        {formatCurrency(link.linkedAmount ?? 0)}
                      </td>
                      <td className="py-3 pr-4 num">
                        {formatCurrency(
                          fd?.availableAmount ??
                          fd?.fdAmount ??
                          0
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {formatDate(fd?.fdMaturityDate)}
                      </td>
                      <td className="py-3">
                        {formatDate(link.linkedDate)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {fdLinks.length > 0 && (
          <div className="mt-4 flex justify-end">
            <div className="rounded-xl bg-ink-50 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-muted">
                Total FD Margin Linked
              </p>
              <p className="mt-1 num text-base font-semibold text-ink-900">
                {formatCurrency(
                  fdLinks.reduce(
                    (total, item) => total + Number(item.linkedAmount ?? 0),
                    0
                  )
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Amendments */}
      <div className="mb-6 rounded-xl2 border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Amendments</h2>
          <Button variant="accent" size="sm" onClick={openAmendModal}><Plus size={15} /> Add Amendment</Button>
        </div>

        <ol className="space-y-4 border-l border-border pl-4">
          <li>
            <p className="text-sm font-medium text-ink-900">Original LC</p>
            <p className="text-xs text-muted">
              Amount: {formatCurrency(amendments?.[0]?.previousLcAmount ?? lc.lcAmount)} · Expiry: {formatDate(amendments?.[0]?.previousExpiryDate ?? lc.lcExpiryDate)}
            </p>
          </li>
          {amendments.map((a, index) => {
            const isLatest = index === amendments.length - 1

            return (
              <li key={a.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900">
                      Amendment #{a.amendmentNumber} — {LC_AMENDMENT_TYPES[a.amendmentType] || a.amendmentType}
                    </p>
                    <p className="text-xs text-muted">{formatDate(a.amendmentDate)}</p>
                    <div className="mt-1 space-y-0.5 text-xs text-ink-900">
                      {a.previousLcAmount !== a.newLcAmount && (
                        <p>Amount: {formatCurrency(a.previousLcAmount)} → {formatCurrency(a.newLcAmount)}</p>
                      )}
                      {a.previousExpiryDate !== a.newExpiryDate && (
                        <p>Expiry: {formatDate(a.previousExpiryDate)} → {formatDate(a.newExpiryDate)}</p>
                      )}
                      {a.previousVendorName !== a.newVendorName && (
                        <p>Vendor: {a.previousVendorName || '—'} → {a.newVendorName || '—'}</p>
                      )}
                      {a.previousBankName !== a.newBankName && (
                        <p>Bank: {a.previousBankName || '—'} → {a.newBankName || '—'}</p>
                      )}
                      {a.reason && <p className="text-muted">Reason: {a.reason}</p>}
                      {a.remarks && <p className="text-muted">Remarks: {a.remarks}</p>}
                    </div>
                  </div>

                  {isLatest && (
                    <button
                      type="button"
                      onClick={() => setDeleteAmendTarget(a)}
                      className="shrink-0 rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                      title="Delete latest amendment"
                      aria-label="Delete amendment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </li>
            )
          })}
          {amendments.length === 0 && <li className="text-xs text-muted">No amendments recorded yet.</li>}
        </ol>
      </div>

      {/* Utilizations */}
      <div className="rounded-xl2 border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Utilization / Invoices</h2>
          <Button variant="accent" size="sm" onClick={openUtilModal}><Plus size={15} /> Add Utilization</Button>
        </div>

        {utilizations.length === 0 ? (
          <p className="text-sm text-muted">No utilizations recorded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {utilizations.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">{u.invoiceNumber} — {formatCurrency(u.amount)}</p>
                  <p className="text-xs text-muted">
                    Invoice: {formatDate(u.invoiceDate)}
                    {u.materialDescription ? ` · ${u.materialDescription}` : ''}
                    {' · Doc: '}{DOCUMENT_STATUS_OPTIONS[u.documentStatus] || u.documentStatus}
                    {' · Payment: '}{PAYMENT_STATUS_OPTIONS[u.paymentStatus] || u.paymentStatus}
                  </p>
                  {u.remarks && <p className="text-xs text-muted">{u.remarks}</p>}
                </div>
                <button onClick={() => setDeleteUtilTarget(u)} className="rounded-lg p-2 text-muted hover:bg-danger-50 hover:text-danger" aria-label="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Amendment Modal */}
      <Modal open={amendModalOpen} onClose={() => setAmendModalOpen(false)} size="lg" title="Add Amendment"
        footer={<>
          <Button variant="outline" onClick={() => setAmendModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddAmendment} disabled={amendSaving}>{amendSaving ? 'Saving…' : 'Save Amendment'}</Button>
        </>}>
        <form onSubmit={handleAddAmendment} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Amendment Date" type="date" required error={amendErrors.amendmentDate}
            value={amendForm.amendmentDate} onChange={(e) => setAmendForm({ ...amendForm, amendmentDate: e.target.value })} />
          <Select label="Amendment Type" required error={amendErrors.amendmentType}
            value={amendForm.amendmentType} onChange={(e) => setAmendForm({ ...amendForm, amendmentType: e.target.value })}>
            {Object.entries(LC_AMENDMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Input label="New LC Amount" type="number" step="0.01" hint="Leave blank if unchanged"
            value={amendForm.newLcAmount} onChange={(e) => setAmendForm({ ...amendForm, newLcAmount: e.target.value })} />
          <Input label="New Expiry Date" type="date" hint="Leave blank if unchanged"
            value={amendForm.newExpiryDate} onChange={(e) => setAmendForm({ ...amendForm, newExpiryDate: e.target.value })} />
          <Select label="New Vendor" hint="Leave unselected if unchanged"
            value={amendForm.newVendorId} onChange={(e) => setAmendForm({ ...amendForm, newVendorId: e.target.value })}>
            <option value="">Unchanged</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
          </Select>
          <Select label="New Bank" hint="Leave unselected if unchanged"
            value={amendForm.newBankId} onChange={(e) => setAmendForm({ ...amendForm, newBankId: e.target.value })}>
            <option value="">Unchanged</option>
            {banks.map((b) => <option key={b.id} value={b.id}>{b.bankName}</option>)}
          </Select>
          <Textarea label="Reason" className="sm:col-span-2"
            value={amendForm.reason} onChange={(e) => setAmendForm({ ...amendForm, reason: e.target.value })} />
          <Textarea label="Remarks" className="sm:col-span-2"
            value={amendForm.remarks} onChange={(e) => setAmendForm({ ...amendForm, remarks: e.target.value })} />
        </form>
      </Modal>

      {/* Utilization Modal */}
      <Modal open={utilModalOpen} onClose={() => setUtilModalOpen(false)} size="lg" title="Add Utilization"
        footer={<>
          <Button variant="outline" onClick={() => setUtilModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddUtilization} disabled={utilSaving}>{utilSaving ? 'Saving…' : 'Save Utilization'}</Button>
        </>}>
        <form onSubmit={handleAddUtilization} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Invoice Number" required error={utilErrors.invoiceNumber}
            value={utilForm.invoiceNumber} onChange={(e) => setUtilForm({ ...utilForm, invoiceNumber: e.target.value })} />
          <Input label="Invoice Date" type="date" required error={utilErrors.invoiceDate}
            value={utilForm.invoiceDate} onChange={(e) => setUtilForm({ ...utilForm, invoiceDate: e.target.value })} />
          <Input label="Amount" type="number" step="0.01" required error={utilErrors.amount}
            value={utilForm.amount} onChange={(e) => setUtilForm({ ...utilForm, amount: e.target.value })} />
          <Input label="Material / Description" value={utilForm.materialDescription}
            onChange={(e) => setUtilForm({ ...utilForm, materialDescription: e.target.value })} />
          <Input label="Material Receipt Date" type="date" value={utilForm.materialReceiptDate}
            onChange={(e) => setUtilForm({ ...utilForm, materialReceiptDate: e.target.value })} />
          <Select label="Document Status" value={utilForm.documentStatus}
            onChange={(e) => setUtilForm({ ...utilForm, documentStatus: e.target.value })}>
            {Object.entries(DOCUMENT_STATUS_OPTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Input label="Acceptance Date" type="date" value={utilForm.acceptanceDate}
            onChange={(e) => setUtilForm({ ...utilForm, acceptanceDate: e.target.value })} />
          <Input label="Payment Date" type="date" value={utilForm.paymentDate}
            onChange={(e) => setUtilForm({ ...utilForm, paymentDate: e.target.value })} />
          <Select label="Payment Status" value={utilForm.paymentStatus}
            onChange={(e) => setUtilForm({ ...utilForm, paymentStatus: e.target.value })}>
            {Object.entries(PAYMENT_STATUS_OPTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Textarea label="Remarks" className="sm:col-span-2"
            value={utilForm.remarks} onChange={(e) => setUtilForm({ ...utilForm, remarks: e.target.value })} />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteAmendTarget}
        title="Delete Amendment?"
        message={
          deleteAmendTarget
            ? `Amendment #${deleteAmendTarget.amendmentNumber} will be deleted and the LC will be restored to its previous values. This action cannot be undone.`
            : ''
        }
        confirmText="Delete Amendment"
        loadingText="Deleting…"
        confirmVariant="danger"
        onCancel={() => {
          if (!deletingAmend) setDeleteAmendTarget(null)
        }}
        onConfirm={handleDeleteAmendment}
        loading={deletingAmend}
      />

      <ConfirmDialog
        open={!!deleteUtilTarget}
        message="This will permanently remove this utilization entry. This can't be undone."
        onCancel={() => setDeleteUtilTarget(null)}
        onConfirm={handleDeleteUtil}
        loading={deletingUtil}
      />
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-ink-900">
        {value === null || value === undefined || value === '' ? '—' : value}
      </p>
    </div>
  )
}

