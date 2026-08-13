import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Upload, Download, Trash2, ShieldCheck, History } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Loader from '../../components/common/Loader'
import StatusBadge from '../../components/common/StatusBadge'
import { Input, Select, Textarea } from '../../components/common/Field'
import { useToast } from '../../components/common/Toast'
import { extractErrorMessage } from '../../api/axiosClient'
import { bgApi } from '../../api/bgApi'
import { bgAmendmentApi } from '../../api/bgAmendmentApi'
import { documentApi } from '../../api/documentApi'
import { auditApi } from '../../api/auditApi'
import {
  AMENDMENT_TYPES, BG_LIFECYCLE_STATUS, BG_DOCUMENT_TYPES, EXPIRY_INDICATOR_STYLES, AUDIT_ACTION_LABELS,
} from '../../utils/constants'
import { formatCurrency, formatDate } from '../../utils/formatters'

const emptyAmendment = {
  amendmentDate: '', amendmentType: 'EXTENSION', newBgAmount: '', newExpiryDate: '',
  newClaimExpiryDate: '', reason: '', remarks: '',
}

const emptyLifecycle = {
  targetStatus: '', releaseRequestDate: '', releaseDate: '', releaseReferenceNumber: '',
  originalBgReceivedBack: '', releaseRemarks: '', closureDate: '', closureRemarks: '',
}

function ExpiryPill({ label, date, days, indicator }) {
  if (!date) return (
    <div className="rounded-xl2 border border-border bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm text-muted">Not set</p>
    </div>
  )
  const style = EXPIRY_INDICATOR_STYLES[indicator] || 'bg-ink-50 text-muted ring-1 ring-inset ring-border'
  const dayText =
    days === null || days === undefined ? '—' :
    days < 0 ? `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue` :
    days === 0 ? 'Due today' : `${days} day${days === 1 ? '' : 's'} left`
  return (
    <div className="rounded-xl2 border border-border bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink-900">{formatDate(date)}</p>
      <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
        {dayText}
      </span>
    </div>
  )
}

export default function BgDetails() {
  const { id } = useParams()
  const { push } = useToast()

  const [bg, setBg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = useState([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [activity, setActivity] = useState([])

  const [amendModalOpen, setAmendModalOpen] = useState(false)
  const [amendForm, setAmendForm] = useState(emptyAmendment)
  const [amendErrors, setAmendErrors] = useState({})
  const [amendSaving, setAmendSaving] = useState(false)

  const [lifecycleModalOpen, setLifecycleModalOpen] = useState(false)
  const [lifecycleForm, setLifecycleForm] = useState(emptyLifecycle)
  const [lifecycleErrors, setLifecycleErrors] = useState({})
  const [lifecycleSaving, setLifecycleSaving] = useState(false)
  const [lifecycleConfirm, setLifecycleConfirm] = useState(false)

  const [uploadForm, setUploadForm] = useState({ documentType: BG_DOCUMENT_TYPES[0], remarks: '', file: null })
  const [uploading, setUploading] = useState(false)
  const [deleteDocTarget, setDeleteDocTarget] = useState(null)
  const [deletingDoc, setDeletingDoc] = useState(false)

  const loadBg = useCallback(async () => {
    setLoading(true)
    try {
      setBg(await bgApi.getById(id))
    } catch {
      push('Could not load this Bank Guarantee.', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, push])

  const loadDocs = useCallback(async () => {
    setDocsLoading(true)
    try {
      setDocs(await documentApi.list('BG', id))
    } catch {
      push('Could not load documents.', 'error')
    } finally {
      setDocsLoading(false)
    }
  }, [id, push])

  const loadActivity = useCallback(async () => {
    try {
      setActivity(await auditApi.getForRecord('BG', id))
    } catch {
      // non-critical — silently ignore
    }
  }, [id])

  useEffect(() => { loadBg() }, [loadBg])
  useEffect(() => { loadDocs() }, [loadDocs])
  useEffect(() => { loadActivity() }, [loadActivity])

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
      newBgAmount: amendForm.newBgAmount === '' ? null : Number(amendForm.newBgAmount),
      newExpiryDate: amendForm.newExpiryDate || null,
      newClaimExpiryDate: amendForm.newClaimExpiryDate || null,
      reason: amendForm.reason || null,
      remarks: amendForm.remarks || null,
    }
    try {
      await bgAmendmentApi.add(id, payload)
      push('Amendment recorded.')
      setAmendModalOpen(false)
      loadBg()
      loadActivity()
    } catch (err) {
      push(extractErrorMessage(err, 'Could not save the amendment.'), 'error')
    } finally {
      setAmendSaving(false)
    }
  }

  // ---------- Lifecycle ----------
  const openLifecycle = (targetStatus) => {
    setLifecycleForm({ ...emptyLifecycle, targetStatus })
    setLifecycleErrors({})
    setLifecycleModalOpen(true)
  }

  const validateLifecycle = () => {
    const errs = {}
    if (lifecycleForm.targetStatus === 'RELEASE_REQUESTED' && !lifecycleForm.releaseRequestDate) errs.releaseRequestDate = 'Required'
    if (lifecycleForm.targetStatus === 'RELEASED' && !lifecycleForm.releaseDate) errs.releaseDate = 'Required'
    if (lifecycleForm.targetStatus === 'CLOSED' && !lifecycleForm.closureDate) errs.closureDate = 'Required'
    setLifecycleErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submitLifecycle = async () => {
    if (!validateLifecycle()) return
    setLifecycleSaving(true)
    const payload = {
      targetStatus: lifecycleForm.targetStatus,
      releaseRequestDate: lifecycleForm.releaseRequestDate || null,
      releaseDate: lifecycleForm.releaseDate || null,
      releaseReferenceNumber: lifecycleForm.releaseReferenceNumber || null,
      originalBgReceivedBack: lifecycleForm.originalBgReceivedBack === '' ? null : lifecycleForm.originalBgReceivedBack === 'true',
      releaseRemarks: lifecycleForm.releaseRemarks || null,
      closureDate: lifecycleForm.closureDate || null,
      closureRemarks: lifecycleForm.closureRemarks || null,
    }
    try {
      await bgApi.lifecycle(id, payload)
      push('BG status updated.')
      setLifecycleModalOpen(false)
      setLifecycleConfirm(false)
      loadBg()
      loadActivity()
    } catch (err) {
      push(extractErrorMessage(err, 'Could not update the BG status.'), 'error')
    } finally {
      setLifecycleSaving(false)
    }
  }

  // ---------- Documents ----------
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadForm.file) {
      push('Choose a file to upload.', 'error')
      return
    }
    setUploading(true)
    try {
      await documentApi.upload('BG', id, uploadForm.documentType, uploadForm.file, uploadForm.remarks)
      push('Document uploaded.')
      setUploadForm({ documentType: BG_DOCUMENT_TYPES[0], remarks: '', file: null })
      loadDocs()
      loadActivity()
    } catch (err) {
      push(extractErrorMessage(err, 'Could not upload document.'), 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (doc) => {
    try {
      const blob = await documentApi.download(doc.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      push('Could not download document.', 'error')
    }
  }

  const handleDeleteDoc = async () => {
    setDeletingDoc(true)
    try {
      await documentApi.remove(deleteDocTarget.id)
      push('Document deleted.')
      setDeleteDocTarget(null)
      loadDocs()
      loadActivity()
    } catch (err) {
      push(extractErrorMessage(err, 'Could not delete document.'), 'error')
    } finally {
      setDeletingDoc(false)
    }
  }

  if (loading) return <Loader />
  if (!bg) return null

  return (
    <div>
      <Link to="/bg" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink-900">
        <ArrowLeft size={15} /> Back to Bank Guarantees
      </Link>

      <PageHeader
        eyebrow="Bank Guarantee"
        title={bg.bgNo}
        description={`${bg.clientName}${bg.siteProject ? ' — ' + bg.siteProject : ''}`}
        actions={
          <>
            <StatusBadge status={bg.status} />
            {bg.status !== 'RELEASED' && bg.status !== 'CLOSED' && (
              <Button variant="outline" onClick={() => openLifecycle('RELEASE_REQUESTED')}>
                <ShieldCheck size={16} /> Release / Close BG
              </Button>
            )}
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl2 border border-border bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">BG Amount</p>
          <p className="mt-1 text-lg font-semibold text-ink-900">{formatCurrency(bg.bgAmount)}</p>
        </div>
        <div className="rounded-xl2 border border-border bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Issuing Bank</p>
          <p className="mt-1 text-lg font-semibold text-ink-900">{bg.issuingBankName}</p>
        </div>
        <ExpiryPill label="BG Expiry" date={bg.expiryDate} days={bg.daysUntilExpiry} indicator={bg.expiryIndicator} />
        <ExpiryPill label="Claim Expiry" date={bg.claimExpiryDate} days={bg.daysUntilClaimExpiry} indicator={bg.claimExpiryIndicator} />
      </div>

      {(bg.releaseRequestDate || bg.releaseDate || bg.closureDate) && (
        <div className="mb-6 rounded-xl2 border border-border bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Release / Closure</p>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            {bg.releaseRequestDate && <div><span className="text-muted">Release Requested: </span>{formatDate(bg.releaseRequestDate)}</div>}
            {bg.releaseDate && <div><span className="text-muted">Released: </span>{formatDate(bg.releaseDate)}</div>}
            {bg.releaseReferenceNumber && <div><span className="text-muted">Reference No.: </span>{bg.releaseReferenceNumber}</div>}
            {bg.originalBgReceivedBack !== null && bg.originalBgReceivedBack !== undefined && (
              <div><span className="text-muted">Original BG Received Back: </span>{bg.originalBgReceivedBack ? 'Yes' : 'No'}</div>
            )}
            {bg.closureDate && <div><span className="text-muted">Closed: </span>{formatDate(bg.closureDate)}</div>}
            {bg.releaseRemarks && <div className="sm:col-span-3"><span className="text-muted">Release Remarks: </span>{bg.releaseRemarks}</div>}
            {bg.closureRemarks && <div className="sm:col-span-3"><span className="text-muted">Closure Remarks: </span>{bg.closureRemarks}</div>}
          </div>
        </div>
      )}

      <div className="mb-6 rounded-xl2 border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Amendments</h2>
          <Button variant="accent" size="sm" onClick={openAmendModal}><Plus size={15} /> Add Amendment</Button>
        </div>

        <ol className="space-y-4 border-l border-border pl-4">
          <li>
            <p className="text-sm font-medium text-ink-900">Original BG</p>
            <p className="text-xs text-muted">
              Amount: {formatCurrency(bg.amendments?.[0]?.previousBgAmount ?? bg.bgAmount)} · Expiry: {formatDate(bg.amendments?.[0]?.previousExpiryDate ?? bg.expiryDate)}
            </p>
          </li>
          {bg.amendments?.map((a) => (
            <li key={a.id}>
              <p className="text-sm font-medium text-ink-900">Amendment #{a.amendmentNumber} — {AMENDMENT_TYPES[a.amendmentType]}</p>
              <p className="text-xs text-muted">{formatDate(a.amendmentDate)}</p>
              <div className="mt-1 space-y-0.5 text-xs text-ink-900">
                {a.previousBgAmount !== a.newBgAmount && (
                  <p>Amount: {formatCurrency(a.previousBgAmount)} → {formatCurrency(a.newBgAmount)}</p>
                )}
                {a.previousExpiryDate !== a.newExpiryDate && (
                  <p>Expiry: {formatDate(a.previousExpiryDate)} → {formatDate(a.newExpiryDate)}</p>
                )}
                {a.previousClaimExpiryDate !== a.newClaimExpiryDate && (
                  <p>Claim Expiry: {formatDate(a.previousClaimExpiryDate)} → {formatDate(a.newClaimExpiryDate)}</p>
                )}
                {a.reason && <p className="text-muted">Reason: {a.reason}</p>}
                {a.remarks && <p className="text-muted">Remarks: {a.remarks}</p>}
              </div>
            </li>
          ))}
          {(!bg.amendments || bg.amendments.length === 0) && (
            <li className="text-xs text-muted">No amendments recorded yet.</li>
          )}
        </ol>
      </div>

      <div className="mb-6 rounded-xl2 border border-border bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Documents</h2>

        <form onSubmit={handleUpload} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Select label="Document Type" value={uploadForm.documentType}
            onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}>
            {BG_DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input label="Remarks" value={uploadForm.remarks}
            onChange={(e) => setUploadForm({ ...uploadForm, remarks: e.target.value })} />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-900">File</span>
            <input type="file" onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
              className="w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink-900" />
          </label>
          <div className="flex items-end">
            <Button type="submit" variant="accent" disabled={uploading} className="w-full">
              <Upload size={15} /> {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        </form>

        {docsLoading ? <Loader /> : docs.length === 0 ? (
          <p className="text-sm text-muted">No documents uploaded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">{d.fileName}</p>
                  <p className="text-xs text-muted">
                    {d.documentType} · {(d.fileSize / 1024).toFixed(0)} KB · Uploaded {formatDate(d.uploadedAt)}
                    {d.uploadedBy ? ` by ${d.uploadedBy}` : ''}
                  </p>
                  {d.remarks && <p className="text-xs text-muted">{d.remarks}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleDownload(d)} className="rounded-lg p-2 text-muted hover:bg-ink-50 hover:text-ink-900" aria-label="Download">
                    <Download size={15} />
                  </button>
                  <button onClick={() => setDeleteDocTarget(d)} className="rounded-lg p-2 text-muted hover:bg-danger-50 hover:text-danger" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl2 border border-border bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Activity History</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-muted">No activity recorded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {activity.map((l) => (
              <div key={l.id} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 rounded-lg bg-ink-50 p-1.5 text-muted"><History size={14} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink-900">{AUDIT_ACTION_LABELS[l.actionType] || l.actionType}</p>
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
            {Object.entries(AMENDMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Input label="New BG Amount" type="number" step="0.01" hint="Leave blank if unchanged"
            value={amendForm.newBgAmount} onChange={(e) => setAmendForm({ ...amendForm, newBgAmount: e.target.value })} />
          <Input label="New Expiry Date" type="date" hint="Leave blank if unchanged"
            value={amendForm.newExpiryDate} onChange={(e) => setAmendForm({ ...amendForm, newExpiryDate: e.target.value })} />
          <Input label="New Claim Expiry Date" type="date" hint="Leave blank if unchanged"
            value={amendForm.newClaimExpiryDate} onChange={(e) => setAmendForm({ ...amendForm, newClaimExpiryDate: e.target.value })} />
          <Textarea label="Reason" className="sm:col-span-2"
            value={amendForm.reason} onChange={(e) => setAmendForm({ ...amendForm, reason: e.target.value })} />
          <Textarea label="Remarks" className="sm:col-span-2"
            value={amendForm.remarks} onChange={(e) => setAmendForm({ ...amendForm, remarks: e.target.value })} />
        </form>
      </Modal>

      <Modal open={lifecycleModalOpen} onClose={() => setLifecycleModalOpen(false)} size="md" title="Release / Close BG"
        footer={<>
          <Button variant="outline" onClick={() => setLifecycleModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => { if (validateLifecycle()) setLifecycleConfirm(true) }} disabled={lifecycleSaving}>
            Continue
          </Button>
        </>}>
        <div className="grid grid-cols-1 gap-4">
          <Select label="New Status" value={lifecycleForm.targetStatus}
            onChange={(e) => setLifecycleForm({ ...lifecycleForm, targetStatus: e.target.value })}>
            {Object.entries(BG_LIFECYCLE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.replaceAll('_', ' ')}</option>)}
          </Select>

          {lifecycleForm.targetStatus === 'RELEASE_REQUESTED' && (
            <>
              <Input label="Release Request Date" type="date" required error={lifecycleErrors.releaseRequestDate}
                value={lifecycleForm.releaseRequestDate} onChange={(e) => setLifecycleForm({ ...lifecycleForm, releaseRequestDate: e.target.value })} />
              <Textarea label="Remarks" value={lifecycleForm.releaseRemarks}
                onChange={(e) => setLifecycleForm({ ...lifecycleForm, releaseRemarks: e.target.value })} />
            </>
          )}

          {lifecycleForm.targetStatus === 'RELEASED' && (
            <>
              <Input label="Release Date" type="date" required error={lifecycleErrors.releaseDate}
                value={lifecycleForm.releaseDate} onChange={(e) => setLifecycleForm({ ...lifecycleForm, releaseDate: e.target.value })} />
              <Input label="Release Reference Number" value={lifecycleForm.releaseReferenceNumber}
                onChange={(e) => setLifecycleForm({ ...lifecycleForm, releaseReferenceNumber: e.target.value })} />
              <Select label="Original BG Received Back" value={lifecycleForm.originalBgReceivedBack}
                onChange={(e) => setLifecycleForm({ ...lifecycleForm, originalBgReceivedBack: e.target.value })}>
                <option value="">Select…</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
              <Textarea label="Remarks" value={lifecycleForm.releaseRemarks}
                onChange={(e) => setLifecycleForm({ ...lifecycleForm, releaseRemarks: e.target.value })} />
            </>
          )}

          {lifecycleForm.targetStatus === 'CLOSED' && (
            <>
              <Input label="Closure Date" type="date" required error={lifecycleErrors.closureDate}
                value={lifecycleForm.closureDate} onChange={(e) => setLifecycleForm({ ...lifecycleForm, closureDate: e.target.value })} />
              <Textarea label="Closure Remarks" value={lifecycleForm.closureRemarks}
                onChange={(e) => setLifecycleForm({ ...lifecycleForm, closureRemarks: e.target.value })} />
            </>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={lifecycleConfirm}
        title="Confirm status change"
        message={`This will change the BG status to ${lifecycleForm.targetStatus?.replaceAll('_', ' ')}. Continue?`}
        onCancel={() => setLifecycleConfirm(false)}
        onConfirm={submitLifecycle}
        loading={lifecycleSaving}
      />

      <ConfirmDialog
        open={!!deleteDocTarget}
        message="This will permanently delete this document. This can't be undone."
        onCancel={() => setDeleteDocTarget(null)}
        onConfirm={handleDeleteDoc}
        loading={deletingDoc}
      />
    </div>
  )
}