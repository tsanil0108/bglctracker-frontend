import React from 'react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ open, title = 'Are you sure?', message, onCancel, onConfirm, loading }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm" footer={
      <>
        <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting…' : 'Delete'}
        </Button>
      </>
    }>
      <p className="text-sm text-muted">{message}</p>
    </Modal>
  )
}
