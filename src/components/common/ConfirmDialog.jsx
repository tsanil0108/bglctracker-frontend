import React from 'react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  onCancel,
  onConfirm,
  loading = false,

  // Reusable button text
  confirmText = 'Delete',
  loadingText = 'Deleting…',

  // Default danger button
  confirmVariant = 'danger',
}) {

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? loadingText
              : confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-muted">
        {message}
      </p>
    </Modal>
  )
}
