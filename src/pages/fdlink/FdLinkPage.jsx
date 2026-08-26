import React, {
  useEffect,
  useState,
} from 'react'

import {
  Plus,
  Pencil,
  Trash2,
  Link2,
} from 'lucide-react'

import {
  Link,
} from 'react-router-dom'

import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Loader from '../../components/common/Loader'
import StatusBadge from '../../components/common/StatusBadge'

import {
  Input,
  Select,
} from '../../components/common/Field'

import {
  useToast,
} from '../../components/common/Toast'

import {
  extractErrorMessage,
} from '../../api/axiosClient'

import {
  fdApi,
} from '../../api/fdApi'

import {
  bankApi,
  groupCompanyApi,
} from '../../api/masterApi'

import {
  FD_STATUS,
} from '../../utils/constants'

import {
  formatCurrency,
  formatDate,
  toInputDate,
} from '../../utils/formatters'


const emptyForm = {

  groupCompanyId: '',

  bankId: '',

  fdNumber: '',

  fdCreationDate: '',

  fdMaturityDate: '',

  period: '',

  rate: '',

  fdAmount: '',

  status:
    FD_STATUS.OPEN,
}


export default function FdList() {

  const { push } =
    useToast()


  const [
    rows,
    setRows,
  ] =
    useState([])


  const [
    banks,
    setBanks,
  ] =
    useState([])


  const [
    companies,
    setCompanies,
  ] =
    useState([])


  const [
    loading,
    setLoading,
  ] =
    useState(true)


  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState('')


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
    useState(emptyForm)


  const [
    errors,
    setErrors,
  ] =
    useState({})


  const [
    saving,
    setSaving,
  ] =
    useState(false)


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


  const load =
    async (
      status
    ) => {

      setLoading(
        true
      )

      try {

        const data =
          await fdApi.getAll(
            status ||
            undefined
          )

        setRows(data)

      } catch {

        push(
          'Could not load Fixed Deposits.',
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

      bankApi
        .getAll()
        .then(
          setBanks
        )
        .catch(
          () => {}
        )


      groupCompanyApi
        .getAll()
        .then(
          setCompanies
        )
        .catch(
          () => {}
        )

    },
    []
  )


  useEffect(
    () => {

      load(
        statusFilter
      )

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      statusFilter,
    ]
  )


  const openCreate =
    () => {

      setEditing(
        null
      )

      setForm(
        emptyForm
      )

      setErrors({})

      setModalOpen(
        true
      )
    }


  const openEdit =
    (row) => {

      setEditing(
        row
      )

      setForm({

        groupCompanyId:
          row.groupCompanyId ??
          '',

        bankId:
          row.bankId ??
          '',

        fdNumber:
          row.fdNumber ??
          '',

        fdCreationDate:
          toInputDate(
            row.fdCreationDate
          ),

        fdMaturityDate:
          toInputDate(
            row.fdMaturityDate
          ),

        period:
          row.period ??
          '',

        rate:
          row.rate ??
          '',

        fdAmount:
          row.fdAmount ??
          '',

        status:
          row.status ??
          FD_STATUS.OPEN,
      })

      setErrors({})

      setModalOpen(
        true
      )
    }


  const validate =
    () => {

      const errs = {}


      if (
        !form.groupCompanyId
      ) {

        errs.groupCompanyId =
          'Required'
      }


      if (
        !form.bankId
      ) {

        errs.bankId =
          'Required'
      }


      if (
        !form.fdNumber
          ?.trim()
      ) {

        errs.fdNumber =
          'Required'
      }


      if (
        !form.fdAmount ||
        Number(
          form.fdAmount
        ) <= 0
      ) {

        errs.fdAmount =
          'Enter an amount greater than 0'
      }


      setErrors(
        errs
      )

      return (
        Object.keys(
          errs
        ).length === 0
      )
    }


  const handleSave =
    async (
      e
    ) => {

      e.preventDefault()


      if (
        !validate()
      ) {

        return
      }


      setSaving(
        true
      )


      const payload = {

        ...form,

        groupCompanyId:
          Number(
            form.groupCompanyId
          ),

        bankId:
          Number(
            form.bankId
          ),

        rate:
          form.rate === ''
            ? null
            : Number(
                form.rate
              ),

        fdAmount:
          Number(
            form.fdAmount
          ),

        fdCreationDate:
          form.fdCreationDate ||
          null,

        fdMaturityDate:
          form.fdMaturityDate ||
          null,
      }


      try {

        if (
          editing
        ) {

          await fdApi.update(
            editing.id,
            payload
          )

          push(
            'Fixed Deposit updated.'
          )

        } else {

          await fdApi.create(
            payload
          )

          push(
            'Fixed Deposit added.'
          )
        }


        setModalOpen(
          false
        )

        load(
          statusFilter
        )

      } catch (
        err
      ) {

        push(
          extractErrorMessage(
            err,
            'Could not save Fixed Deposit.'
          ),
          'error'
        )

      } finally {

        setSaving(
          false
        )
      }
    }


  const handleDelete =
    async () => {

      setDeleting(
        true
      )

      try {

        await fdApi.remove(
          deleteTarget.id
        )

        push(
          'Fixed Deposit deleted.'
        )

        setDeleteTarget(
          null
        )

        load(
          statusFilter
        )

      } catch (
        err
      ) {

        push(
          extractErrorMessage(
            err,
            'Could not delete Fixed Deposit.'
          ),
          'error'
        )

      } finally {

        setDeleting(
          false
        )
      }
    }


  const columns = [

    {
      key:
        'fdNumber',

      header:
        'FD Number',

      render:
        (row) => (

          <span className="num font-medium">
            {row.fdNumber}
          </span>
        ),
    },


    {
      key:
        'groupCompanyName',

      header:
        'Group Company',

      render:
        (row) => (

          row.groupCompanyId

            ? (
                <Link
                  to={
                    `/master/group-companies/${row.groupCompanyId}`
                  }
                  className="text-bg-700 hover:underline"
                >
                  {row.groupCompanyName}
                </Link>
              )

            : 'Unassigned'
        ),
    },


    {
      key:
        'bankName',

      header:
        'Bank',
    },


    {
      key:
        'fdMaturityDate',

      header:
        'Maturity',

      render:
        (row) =>
          formatDate(
            row.fdMaturityDate
          ),
    },


    {
      key:
        'fdAmount',

      header:
        'FD Amount',

      render:
        (row) => (

          <span className="num">
            {formatCurrency(
              row.fdAmount
            )}
          </span>
        ),
    },


    {
      key:
        'linkedAmount',

      header:
        'Linked',

      render:
        (row) => (

          <span className="num">
            {formatCurrency(
              row.linkedAmount ??
              0
            )}
          </span>
        ),
    },


    {
      key:
        'availableAmount',

      header:
        'Available',

      render:
        (row) => (

          <span className="num font-medium">
            {formatCurrency(
              row.availableAmount ??
              row.fdAmount
            )}
          </span>
        ),
    },


    {
      key:
        'status',

      header:
        'Status',

      render:
        (row) => (

          <StatusBadge
            status={
              row.status
            }
          />
        ),
    },
  ]


  return (

    <div>

      <PageHeader

        eyebrow="Module"

        title="FD Tracker"

        description="Fixed Deposits connected to Group Company, Bank and BG/LC margin links."

        actions={

          <>

            <Link
              to="/fd-linking"
            >

              <Button
                variant="outline"
              >

                <Link2
                  size={16}
                />

                Manage Links

              </Button>

            </Link>


            <Button
              variant="accent"
              onClick={
                openCreate
              }
            >

              <Plus
                size={16}
              />

              Add Fixed Deposit

            </Button>

          </>
        }
      />


      <div className="mb-4 flex flex-wrap gap-2">

        {[
          '',
          ...Object.values(
            FD_STATUS
          ),
        ].map(
          (status) => (

            <button
              key={
                status ||
                'all'
              }
              type="button"
              onClick={
                () =>
                  setStatusFilter(
                    status
                  )
              }
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
                statusFilter ===
                status
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-muted ring-1 ring-inset ring-border'
              }`}
            >

              {
                status === ''
                  ? 'All'
                  : status.replace(
                      '_',
                      '-'
                    )
              }

            </button>
          )
        )}

      </div>


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
                emptyMessage="No Fixed Deposits recorded yet."
                actions={
                  (row) => (

                    <div className="flex justify-end gap-1">

                      <button
                        type="button"
                        onClick={
                          () =>
                            openEdit(
                              row
                            )
                        }
                        className="rounded-lg p-2 text-muted hover:bg-ink-50"
                        aria-label="Edit"
                      >
                        <Pencil
                          size={15}
                        />
                      </button>


                      <button
                        type="button"
                        onClick={
                          () =>
                            setDeleteTarget(
                              row
                            )
                        }
                        className="rounded-lg p-2 text-muted hover:bg-danger-50 hover:text-danger"
                        aria-label="Delete"
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


      <Modal
        open={
          modalOpen
        }
        onClose={
          () =>
            setModalOpen(
              false
            )
        }
        title={
          editing
            ? 'Edit Fixed Deposit'
            : 'Add Fixed Deposit'
        }
        footer={

          <>

            <Button
              variant="outline"
              onClick={
                () =>
                  setModalOpen(
                    false
                  )
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

          <Select
            label="Group Company"
            required
            error={
              errors.groupCompanyId
            }
            value={
              form.groupCompanyId
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  groupCompanyId:
                    e.target.value,
                })
            }
          >

            <option value="">
              Select company…
            </option>

            {companies.map(
              (company) => (

                <option
                  key={
                    company.id
                  }
                  value={
                    company.id
                  }
                >
                  {company.companyName}
                </option>
              )
            )}

          </Select>


          <Select
            label="Bank"
            required
            error={
              errors.bankId
            }
            value={
              form.bankId
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  bankId:
                    e.target.value,
                })
            }
          >

            <option value="">
              Select bank…
            </option>

            {banks.map(
              (bank) => (

                <option
                  key={
                    bank.id
                  }
                  value={
                    bank.id
                  }
                >

                  {bank.bankName}

                  {
                    bank.branch
                      ? ` — ${bank.branch}`
                      : ''
                  }

                </option>
              )
            )}

          </Select>


          <Input
            label="FD Number"
            required
            error={
              errors.fdNumber
            }
            value={
              form.fdNumber
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  fdNumber:
                    e.target.value,
                })
            }
          />


          <Input
            label="FD Amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            error={
              errors.fdAmount
            }
            value={
              form.fdAmount
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  fdAmount:
                    e.target.value,
                })
            }
          />


          <Input
            label="FD Creation Date"
            type="date"
            value={
              form.fdCreationDate
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  fdCreationDate:
                    e.target.value,
                })
            }
          />


          <Input
            label="FD Maturity Date"
            type="date"
            value={
              form.fdMaturityDate
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  fdMaturityDate:
                    e.target.value,
                })
            }
          />


          <Input
            label="Period"
            placeholder="e.g. 12 Months"
            value={
              form.period
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  period:
                    e.target.value,
                })
            }
          />


          <Input
            label="Rate (%)"
            type="number"
            step="0.01"
            value={
              form.rate
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  rate:
                    e.target.value,
                })
            }
          />


          <Select
            label="Status"
            value={
              form.status
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  status:
                    e.target.value,
                })
            }
          >

            {Object.values(
              FD_STATUS
            ).map(
              (status) => (

                <option
                  key={
                    status
                  }
                  value={
                    status
                  }
                >

                  {status.replace(
                    '_',
                    '-'
                  )}

                </option>
              )
            )}

          </Select>

        </form>

      </Modal>


      <ConfirmDialog
        open={
          !!deleteTarget
        }
        message="This will permanently remove this Fixed Deposit. A linked FD cannot be deleted."
        onCancel={
          () =>
            setDeleteTarget(
              null
            )
        }
        onConfirm={
          handleDelete
        }
        loading={
          deleting
        }
      />

    </div>
  )
}