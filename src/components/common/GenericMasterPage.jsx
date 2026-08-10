import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from './PageHeader'
import Button from './Button'
import Table from './Table'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import Loader from './Loader'
import { Input, Select } from './Field'
import { useToast } from './Toast'
import { extractErrorMessage } from '../../api/axiosClient'

/**
 * fields: [{ name, label, required, type: 'text'|'select', options?: [{value,label}] }]
 * columns: [{ key, header, render?(row) }]
 */
export default function GenericMasterPage({ title, description, api, fields, columns, entityLabel }) {
  const { push } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.getAll()
      setRows(data)
    } catch {
      push(`Could not load ${entityLabel} list.`, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreate = () => {
    setEditing(null)
    const empty = {}
    fields.forEach((f) => (empty[f.name] = ''))
    setForm(empty)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    const values = {}
    fields.forEach((f) => (values[f.name] = row[f.name] ?? ''))
    setForm(values)
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    fields.forEach((f) => {
      if (f.required && !String(form[f.name] ?? '').trim()) {
        errs[f.name] = 'Required'
      }
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      if (editing) {
        await api.update(editing.id, form)
        push(`${entityLabel} updated.`)
      } else {
        await api.create(form)
        push(`${entityLabel} added.`)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      push(extractErrorMessage(err, `Could not save ${entityLabel}.`), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.remove(deleteTarget.id)
      push(`${entityLabel} deleted.`)
      setDeleteTarget(null)
      load()
    } catch (err) {
      push(extractErrorMessage(err, `Could not delete ${entityLabel}.`), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button variant="accent" onClick={openCreate}>
            <Plus size={16} /> Add {entityLabel}
          </Button>
        }
      />

      {loading ? (
        <Loader />
      ) : (
        <Table
          columns={columns}
          rows={rows}
          emptyMessage={`No ${entityLabel.toLowerCase()} records yet.`}
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
        title={editing ? `Edit ${entityLabel}` : `Add ${entityLabel}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name} className={f.fullWidth ? 'sm:col-span-2' : ''}>
              {f.type === 'select' ? (
                <Select
                  label={f.label}
                  required={f.required}
                  error={errors[f.name]}
                  value={form[f.name] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                >
                  <option value="">Select…</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              ) : (
                <Input
                  label={f.label}
                  required={f.required}
                  error={errors[f.name]}
                  value={form[f.name] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                />
              )}
            </div>
          ))}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`This will permanently remove this ${entityLabel.toLowerCase()} record. This can't be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
