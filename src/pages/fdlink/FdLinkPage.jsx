import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, ShieldCheck, ScrollText } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { Select, Input } from '../../components/common/Field'
import { useToast } from '../../components/common/Toast'
import { extractErrorMessage } from '../../api/axiosClient'
import { bgApi } from '../../api/bgApi'
import { lcApi } from '../../api/lcApi'
import { fdApi } from '../../api/fdApi'
import { fdLinkApi } from '../../api/fdLinkApi'
import { formatCurrency, formatDate } from '../../utils/formatters'

export default function FdLinkPage() {
  const { push } = useToast()
  const [mode, setMode] = useState('bg') // 'bg' | 'lc'
  const [bgs, setBgs] = useState([])
  const [lcs, setLcs] = useState([])
  const [fds, setFds] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [links, setLinks] = useState([])
  const [loadingLinks, setLoadingLinks] = useState(false)
  const [loadingLists, setLoadingLists] = useState(true)

  const [fdId, setFdId] = useState('')
  const [linkedAmount, setLinkedAmount] = useState('')
  const [linkedDate, setLinkedDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [removing, setRemoving] = useState(false)

  const reloadLists = () =>
    Promise.all([bgApi.getAll(), lcApi.getAll(), fdApi.getAll()]).then(([bgData, lcData, fdData]) => {
      setBgs(bgData)
      setLcs(lcData)
      setFds(fdData)
    })

  useEffect(() => {
    setLoadingLists(true)
    reloadLists()
      .catch(() => push('Could not load BG / LC / FD lists.', 'error'))
      .finally(() => setLoadingLists(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const instruments = mode === 'bg' ? bgs : lcs

  const selected = useMemo(
    () => instruments.find((i) => String(i.id) === String(selectedId)),
    [instruments, selectedId]
  )

  const loadLinks = async (id) => {
    if (!id) return setLinks([])
    setLoadingLinks(true)
    try {
      const data = mode === 'bg' ? await fdLinkApi.getByBg(id) : await fdLinkApi.getByLc(id)
      setLinks(data)
    } catch {
      push('Could not load linked Fixed Deposits.', 'error')
    } finally {
      setLoadingLinks(false)
    }
  }

  useEffect(() => {
    setSelectedId('')
    setLinks([])
  }, [mode])

  useEffect(() => {
    loadLinks(selectedId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const eligibleFds = fds.filter((f) => f.status !== 'CLOSED')

  const resetForm = () => {
    setFdId('')
    setLinkedAmount('')
    setLinkedDate('')
  }

  const handleLink = async (e) => {
    e.preventDefault()
    if (!selectedId || !fdId || !linkedAmount) {
      push('Select an FD and enter the linked amount.', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        fdId: Number(fdId),
        linkedAmount: Number(linkedAmount),
        linkedDate: linkedDate || null,
        bgId: mode === 'bg' ? Number(selectedId) : null,
        lcId: mode === 'lc' ? Number(selectedId) : null,
      }
      await fdLinkApi.create(payload)
      push('Fixed Deposit linked.')
      resetForm()
      loadLinks(selectedId)
      reloadLists()
    } catch (err) {
      push(extractErrorMessage(err, 'Could not create link.'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    setRemoving(true)
    try {
      await fdLinkApi.remove(removeTarget.id)
      push('Link removed — FD reverts to Open if unlinked elsewhere.')
      setRemoveTarget(null)
      loadLinks(selectedId)
      reloadLists()
    } catch (err) {
      push(extractErrorMessage(err, 'Could not remove link.'), 'error')
    } finally {
      setRemoving(false)
    }
  }

  const totalLinked = links.reduce((sum, l) => sum + Number(l.linkedAmount || 0), 0)

  return (
    <div>
      <PageHeader
        eyebrow="Module"
        title="FD Linking"
        description="Pledge one or more Fixed Deposits as margin against a Bank Guarantee or Letter of Credit."
      />

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setMode('bg')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'bg' ? 'bg-bg-600 text-white' : 'bg-white text-muted ring-1 ring-inset ring-border hover:text-ink-900'
          }`}
        >
          <ShieldCheck size={16} /> Against a BG
        </button>
        <button
          onClick={() => setMode('lc')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'lc' ? 'bg-lc-600 text-white' : 'bg-white text-muted ring-1 ring-inset ring-border hover:text-ink-900'
          }`}
        >
          <ScrollText size={16} /> Against an LC
        </button>
      </div>

      {loadingLists ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2" accent={mode === 'bg' ? 'bg-bg-600' : 'bg-lc-600'}>
            <Select
              label={mode === 'bg' ? 'Select Bank Guarantee' : 'Select Letter of Credit'}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Choose…</option>
              {instruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {mode === 'bg' ? i.bgNo : i.lcNo} — {formatCurrency(mode === 'bg' ? i.bgAmount : i.lcAmount)}
                </option>
              ))}
            </Select>

            {selected && (
              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">{mode === 'bg' ? 'Client' : 'Vendor'}</dt>
                  <dd className="font-medium text-ink-900">{mode === 'bg' ? selected.clientName : (selected.linkedVendorName || '—')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Amount</dt>
                  <dd className="num text-ink-900">{formatCurrency(mode === 'bg' ? selected.bgAmount : selected.lcAmount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Expiry</dt>
                  <dd className="text-ink-900">{formatDate(mode === 'bg' ? selected.expiryDate : selected.lcExpiryDate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Total linked so far</dt>
                  <dd className="num font-medium text-ink-900">{formatCurrency(totalLinked)}</dd>
                </div>
              </dl>
            )}

            {selected && (
              <form onSubmit={handleLink} className="mt-5 space-y-3 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Link a Fixed Deposit</p>
                <Select label="Fixed Deposit" value={fdId} onChange={(e) => setFdId(e.target.value)}>
                  <option value="">Choose an FD…</option>
                  {eligibleFds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fdNumber} · {f.bankName} · {formatCurrency(f.fdAmount)} · {f.status.replace('_', '-')}
                    </option>
                  ))}
                </Select>
                <Input label="Linked Amount" type="number" step="0.01" value={linkedAmount} onChange={(e) => setLinkedAmount(e.target.value)} />
                <Input label="Linked Date" type="date" value={linkedDate} onChange={(e) => setLinkedDate(e.target.value)} />
                <Button type="submit" variant="accent" className="w-full" disabled={saving}>
                  <Plus size={16} /> {saving ? 'Linking…' : 'Link Fixed Deposit'}
                </Button>
              </form>
            )}
          </Card>

          <div className="lg:col-span-3">
            {!selectedId ? (
              <EmptyState message="Select a BG or LC to view and manage its linked Fixed Deposits." />
            ) : loadingLinks ? (
              <Loader />
            ) : links.length === 0 ? (
              <EmptyState message="No Fixed Deposits linked yet." hint="Use the form on the left to pledge an FD as margin." />
            ) : (
              <div className="space-y-3">
                {links.map((l) => (
                  <Card key={l.id} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="num font-medium text-ink-900">{l.fdNo}</p>
                      <p className="text-xs text-muted">Linked {formatDate(l.linkedDate)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="num text-sm font-medium text-ink-900">{formatCurrency(l.linkedAmount)}</p>
                      <button
                        onClick={() => setRemoveTarget(l)}
                        className="rounded-lg p-2 text-muted hover:bg-danger-50 hover:text-danger"
                        aria-label="Remove link"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove this link?"
        message="The Fixed Deposit will revert to Open status if it isn't linked elsewhere."
        onCancel={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        loading={removing}
      />
    </div>
  )
}
