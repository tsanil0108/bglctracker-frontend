import React, {
  useEffect,
  useState,
} from 'react'

import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
} from 'lucide-react'

import PageHeader from './PageHeader'
import Button from './Button'
import Table from './Table'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import Loader from './Loader'

import {
  Input,
  Select,
} from './Field'

import {
  useToast,
} from './Toast'

import {
  extractErrorMessage,
} from '../../api/axiosClient'


/**
 * fields:
 * [
 *   {
 *     name,
 *     label,
 *     required,
 *     type: 'text' | 'select',
 *     options?: [{ value, label }]
 *   }
 * ]
 *
 * columns:
 * [
 *   {
 *     key,
 *     header,
 *     render?(row)
 *   }
 * ]
 */


export default function GenericMasterPage({

  title,

  description,

  api,

  fields,

  columns,

  entityLabel,

  deleteBlockedTitle,

}) {

  const { push } =
    useToast()


  // =========================================================
  // TABLE
  // =========================================================

  const [
    rows,
    setRows,
  ] =
    useState([])


  const [
    loading,
    setLoading,
  ] =
    useState(true)


  // =========================================================
  // CREATE / EDIT MODAL
  // =========================================================

  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false)


  const [
    editing,
    setEditing,
  ] =
    useState(null)


  const [
    form,
    setForm,
  ] =
    useState({})


  const [
    saving,
    setSaving,
  ] =
    useState(false)


  const [
    errors,
    setErrors,
  ] =
    useState({})


  // =========================================================
  // DELETE CONFIRMATION
  // =========================================================

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState(null)


  const [
    deleting,
    setDeleting,
  ] =
    useState(false)


  // =========================================================
  // DELETE BLOCKED MODAL
  // =========================================================

  const [
    deleteBlocked,
    setDeleteBlocked,
  ] =
    useState(null)


  // =========================================================
  // LOAD
  // =========================================================

  const load =
    async () => {

      setLoading(
        true
      )


      try {

        const data =
          await api.getAll()


        setRows(
          Array.isArray(data)
            ? data
            : []
        )


      } catch (error) {

        console.error(
          `${entityLabel} load error:`,
          error
        )


        push(
          extractErrorMessage(
            error,
            `Could not load ${entityLabel} list.`
          ),
          'error'
        )


      } finally {

        setLoading(
          false
        )
      }
    }


  useEffect(
    () => {

      load()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  )


  // =========================================================
  // OPEN CREATE
  // =========================================================

  const openCreate =
    () => {

      setEditing(
        null
      )


      const empty =
        {}


      fields.forEach(
        (
          field
        ) => {

          empty[field.name] =
            ''
        }
      )


      setForm(
        empty
      )


      setErrors(
        {}
      )


      setModalOpen(
        true
      )
    }


  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEdit =
    (
      row
    ) => {

      setEditing(
        row
      )


      const values =
        {}


      fields.forEach(
        (
          field
        ) => {

          values[field.name] =
            row[field.name] ??
            ''
        }
      )


      setForm(
        values
      )


      setErrors(
        {}
      )


      setModalOpen(
        true
      )
    }


  // =========================================================
  // CLOSE FORM MODAL
  // =========================================================

  const closeFormModal =
    () => {

      if (
        saving
      ) {
        return
      }


      setModalOpen(
        false
      )


      setEditing(
        null
      )


      setErrors(
        {}
      )
    }


  // =========================================================
  // VALIDATE
  // =========================================================

  const validate =
    () => {

      const validationErrors =
        {}


      fields.forEach(
        (
          field
        ) => {

          const value =
            form[field.name]


          if (
            field.required
            &&
            !String(
              value ??
              ''
            ).trim()
          ) {

            validationErrors[field.name] =
              'Required'
          }
        }
      )


      setErrors(
        validationErrors
      )


      return (
        Object.keys(
          validationErrors
        ).length === 0
      )
    }


  // =========================================================
  // SAVE
  // =========================================================

  const handleSave =
    async (
      event
    ) => {

      event.preventDefault()


      if (
        !validate()
      ) {
        return
      }


      setSaving(
        true
      )


      try {

        if (
          editing
        ) {

          await api.update(
            editing.id,
            form
          )


          push(
            `${entityLabel} updated.`
          )

        } else {

          await api.create(
            form
          )


          push(
            `${entityLabel} added.`
          )
        }


        setModalOpen(
          false
        )


        setEditing(
          null
        )


        await load()


      } catch (error) {

        console.error(
          `${entityLabel} save error:`,
          error
        )


        push(
          extractErrorMessage(
            error,
            `Could not save ${entityLabel}.`
          ),
          'error'
        )


      } finally {

        setSaving(
          false
        )
      }
    }


  // =========================================================
  // REQUEST DELETE
  // =========================================================

  const requestDelete =
    (
      row
    ) => {

      setDeleteBlocked(
        null
      )


      setDeleteTarget(
        row
      )
    }


  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete =
    async () => {

      if (
        !deleteTarget?.id
      ) {
        return
      }


      setDeleting(
        true
      )


      try {

        await api.remove(
          deleteTarget.id
        )


        push(
          `${entityLabel} deleted.`
        )


        setDeleteTarget(
          null
        )


        await load()


      } catch (error) {

        console.error(
          `${entityLabel} delete error:`,
          error
        )


        const message =
          extractErrorMessage(
            error,
            `Could not delete ${entityLabel}.`
          )


        /*
         * =====================================================
         * DELETE BLOCKED
         * =====================================================
         *
         * Backend ValidationException messages such as:
         *
         * Cannot delete bank 'ICICI Bank Limited' because
         * 1 Fixed Deposit record is linked...
         *
         * are shown in a CENTER MODAL instead of toast.
         */

        setDeleteTarget(
          null
        )


        setDeleteBlocked({

          title:
            deleteBlockedTitle ||
            `Cannot Delete ${entityLabel}`,

          message,
        })


      } finally {

        setDeleting(
          false
        )
      }
    }


  // =========================================================
  // FIELD CHANGE
  // =========================================================

  const handleFieldChange =
    (
      fieldName,
      value
    ) => {

      setForm(
        (
          current
        ) => ({

          ...current,

          [fieldName]:
            value,
        })
      )


      /*
       * Remove validation error immediately
       * after user changes the field.
       */

      if (
        errors[fieldName]
      ) {

        setErrors(
          (
            current
          ) => {

            const next =
              {
                ...current,
              }


            delete next[fieldName]


            return next
          }
        )
      }
    }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeader

        title={
          title
        }

        description={
          description
        }

        actions={

          <Button
            variant="accent"
            onClick={
              openCreate
            }
          >

            <Plus
              size={16}
            />

            Add {entityLabel}

          </Button>
        }
      />


      {/* ======================================================
          TABLE
      ====================================================== */}

      {
        loading

          ? (

              <Loader />

            )

          : (

              <Table

                columns={
                  columns
                }

                rows={
                  rows
                }

                emptyMessage={
                  `No ${entityLabel.toLowerCase()} records yet.`
                }

                actions={
                  (
                    row
                  ) => (

                    <div className="flex justify-end gap-1">

                      {/* EDIT */}

                      <button

                        type="button"

                        onClick={
                          () =>
                            openEdit(
                              row
                            )
                        }

                        className="rounded-lg p-2 text-muted transition hover:bg-ink-50 hover:text-ink-900"

                        aria-label={`Edit ${entityLabel}`}

                        title={`Edit ${entityLabel}`}
                      >

                        <Pencil
                          size={15}
                        />

                      </button>


                      {/* DELETE */}

                      <button

                        type="button"

                        onClick={
                          () =>
                            requestDelete(
                              row
                            )
                        }

                        className="rounded-lg p-2 text-muted transition hover:bg-danger-50 hover:text-danger"

                        aria-label={`Delete ${entityLabel}`}

                        title={`Delete ${entityLabel}`}
                      >

                        <Trash2
                          size={15}
                        />

                      </button>

                    </div>
                  )
                }
              />
            )
      }


      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      <Modal

        open={
          modalOpen
        }

        onClose={
          closeFormModal
        }

        title={
          editing
            ? `Edit ${entityLabel}`
            : `Add ${entityLabel}`
        }

        footer={

          <>

            <Button

              variant="outline"

              onClick={
                closeFormModal
              }

              disabled={
                saving
              }
            >

              Cancel

            </Button>


            <Button

              variant="primary"

              onClick={
                handleSave
              }

              disabled={
                saving
              }
            >

              {
                saving
                  ? 'Saving…'
                  : 'Save'
              }

            </Button>

          </>
        }
      >

        <form

          onSubmit={
            handleSave
          }

          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >

          {
            fields.map(
              (
                field
              ) => (

                <div

                  key={
                    field.name
                  }

                  className={
                    field.fullWidth
                      ? 'sm:col-span-2'
                      : ''
                  }
                >

                  {
                    field.type ===
                    'select'

                      ? (

                          <Select

                            label={
                              field.label
                            }

                            required={
                              field.required
                            }

                            error={
                              errors[
                                field.name
                              ]
                            }

                            value={
                              form[
                                field.name
                              ] ??
                              ''
                            }

                            onChange={
                              (
                                event
                              ) =>
                                handleFieldChange(
                                  field.name,
                                  event.target.value
                                )
                            }
                          >

                            <option value="">
                              Select…
                            </option>


                            {
                              (
                                field.options ||
                                []
                              ).map(
                                (
                                  option
                                ) => (

                                  <option

                                    key={
                                      option.value
                                    }

                                    value={
                                      option.value
                                    }
                                  >

                                    {
                                      option.label
                                    }

                                  </option>
                                )
                              )
                            }

                          </Select>

                        )

                      : (

                          <Input

                            label={
                              field.label
                            }

                            required={
                              field.required
                            }

                            error={
                              errors[
                                field.name
                              ]
                            }

                            type={
                              field.type ||
                              'text'
                            }

                            value={
                              form[
                                field.name
                              ] ??
                              ''
                            }

                            onChange={
                              (
                                event
                              ) =>
                                handleFieldChange(
                                  field.name,
                                  event.target.value
                                )
                            }
                          />
                        )
                  }

                </div>
              )
            )
          }

        </form>

      </Modal>


      {/* ======================================================
          NORMAL DELETE CONFIRMATION
      ====================================================== */}

      <ConfirmDialog

        open={
          Boolean(
            deleteTarget
          )
        }

        title="Are you sure?"

        message={
          `This will permanently remove this ${entityLabel.toLowerCase()} record. This can't be undone.`
        }

        onCancel={
          () => {

            if (
              !deleting
            ) {

              setDeleteTarget(
                null
              )
            }
          }
        }

        onConfirm={
          handleDelete
        }

        loading={
          deleting
        }
      />


      {/* ======================================================
          DELETE BLOCKED MODAL
      ====================================================== */}

      <Modal

        open={
          Boolean(
            deleteBlocked
          )
        }

        onClose={
          () =>
            setDeleteBlocked(
              null
            )
        }

        title={
          deleteBlocked?.title ||
          `Cannot Delete ${entityLabel}`
        }

        size="sm"

        footer={

          <Button

            variant="primary"

            onClick={
              () =>
                setDeleteBlocked(
                  null
                )
            }
          >

            Close

          </Button>
        }
      >

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-50 text-danger">

            <AlertCircle
              size={20}
            />

          </div>


          <div className="min-w-0">

            <p className="text-sm leading-6 text-muted">

              {
                deleteBlocked?.message
              }

            </p>


            <p className="mt-3 text-xs leading-5 text-muted">

              Remove or update the linked records first, then try deleting this {entityLabel.toLowerCase()} again.

            </p>

          </div>

        </div>

      </Modal>

    </div>
  )
}