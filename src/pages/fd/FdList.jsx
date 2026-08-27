import React, {
  useEffect,
  useMemo,
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
  fdApi,
} from '../../api/fdApi'

import {
  groupCompanyApi,
  bankApi,
} from '../../api/masterApi'

import {
  extractErrorMessage,
} from '../../api/axiosClient'

import {
  formatCurrency,
  formatDate,
} from '../../utils/formatters'


// =========================================================
// EMPTY FORM
// =========================================================

const emptyForm = {

  groupCompanyId: '',

  bankId: '',

  fdNumber: '',

  fdAmount: '',

  fdCreationDate: '',

  fdMaturityDate: '',

  period: '',

  interestRate: '',

  status: 'OPEN',
}


// =========================================================
// STATUS FILTERS
// =========================================================

const FILTERS = [
  'ALL',
  'OPEN',
  'LIEN_MARKED',
  'CLOSED',
]


// =========================================================
// PAGE
// =========================================================

export default function FdList() {

  const { push } =
    useToast()


  // =======================================================
  // DATA
  // =======================================================

  const [
    rows,
    setRows,
  ] =
    useState([])


  const [
    companies,
    setCompanies,
  ] =
    useState([])


  const [
    banks,
    setBanks,
  ] =
    useState([])


  const [
    loading,
    setLoading,
  ] =
    useState(true)


  // =======================================================
  // FILTER
  // =======================================================

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState('ALL')


  // =======================================================
  // ADD / EDIT
  // =======================================================

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


  // =======================================================
  // DELETE
  // =======================================================

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


  const [
    deleteBlocked,
    setDeleteBlocked,
  ] =
    useState(null)


  // =======================================================
  // LOAD DATA
  // =======================================================

  const load =
    async () => {

      setLoading(
        true
      )


      try {

        const [
          fdData,
          companyData,
          bankData,
        ] =
          await Promise.all([

            fdApi.getAll(),

            groupCompanyApi.getAll(),

            bankApi.getAll(),
          ])


        setRows(
          Array.isArray(fdData)
            ? fdData
            : []
        )


        setCompanies(
          Array.isArray(companyData)
            ? companyData
            : []
        )


        setBanks(
          Array.isArray(bankData)
            ? bankData
            : []
        )


      } catch (error) {

        console.error(
          'FD load error:',
          error
        )


        push(
          extractErrorMessage(
            error,
            'Could not load Fixed Deposits.'
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


  // =======================================================
  // FILTERED ROWS
  // =======================================================

  const filteredRows =
    useMemo(
      () => {

        if (
          activeFilter ===
          'ALL'
        ) {

          return rows
        }


        return rows.filter(
          (
            row
          ) =>

            String(
              row.status ||
              ''
            ).toUpperCase() ===
            activeFilter
        )

      },
      [
        rows,
        activeFilter,
      ]
    )


  // =======================================================
  // OPEN CREATE
  // =======================================================

  const openCreate =
    () => {

      setEditing(
        null
      )


      setForm(
        {
          ...emptyForm,
        }
      )


      setErrors(
        {}
      )


      setModalOpen(
        true
      )
    }


  // =======================================================
  // OPEN EDIT
  // =======================================================

  const openEdit =
    (
      row
    ) => {

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
          row.fdNo ??
          '',

        fdAmount:
          row.fdAmount ??
          '',

        fdCreationDate:
          row.fdCreationDate ??
          '',

        fdMaturityDate:
          row.fdMaturityDate ??
          '',

        period:
          row.period ??
          '',

        interestRate:
          row.interestRate ??
          row.rate ??
          '',

        status:
          row.status ??
          'OPEN',
      })


      setErrors(
        {}
      )


      setModalOpen(
        true
      )
    }


  // =======================================================
  // FIELD CHANGE
  // =======================================================

  const change =
    (
      name,
      value
    ) => {

      setForm(
        (
          current
        ) => ({

          ...current,

          [name]:
            value,
        })
      )


      if (
        errors[name]
      ) {

        setErrors(
          (
            current
          ) => {

            const next =
              {
                ...current,
              }


            delete next[name]


            return next
          }
        )
      }
    }


  // =======================================================
  // VALIDATE
  // =======================================================

  const validate =
    () => {

      const next =
        {}


      if (
        !form.groupCompanyId
      ) {

        next.groupCompanyId =
          'Group Company is required'
      }


      if (
        !form.bankId
      ) {

        next.bankId =
          'Bank is required'
      }


      if (
        !String(
          form.fdNumber ||
          ''
        ).trim()
      ) {

        next.fdNumber =
          'FD Number is required'
      }


      const fdAmount =
        Number(
          form.fdAmount
        )


      if (
        !Number.isFinite(fdAmount)
        ||
        fdAmount <= 0
      ) {

        next.fdAmount =
          'FD Amount must be greater than zero'
      }


      if (
        form.fdCreationDate
        &&
        form.fdMaturityDate
        &&
        new Date(
          form.fdMaturityDate
        ) <
        new Date(
          form.fdCreationDate
        )
      ) {

        next.fdMaturityDate =
          'Maturity date cannot be before creation date'
      }


      setErrors(
        next
      )


      return (
        Object.keys(
          next
        ).length ===
        0
      )
    }


  // =======================================================
  // SAVE
  // =======================================================

  const handleSave =
    async (
      event
    ) => {

      event?.preventDefault()


      if (
        !validate()
      ) {
        return
      }


      setSaving(
        true
      )


      const payload = {

        groupCompanyId:
          Number(
            form.groupCompanyId
          ),

        bankId:
          Number(
            form.bankId
          ),

        fdNumber:
          String(
            form.fdNumber
          ).trim(),

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

        period:
          form.period === ''
            ? null
            : Number(
                form.period
              ),

        interestRate:
          form.interestRate === ''
            ? null
            : Number(
                form.interestRate
              ),

        status:
          form.status ||
          'OPEN',
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


        setEditing(
          null
        )


        await load()


      } catch (error) {

        push(
          extractErrorMessage(
            error,
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


  // =======================================================
  // DELETE
  // =======================================================

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

        await fdApi.remove(
          deleteTarget.id
        )


        push(
          'Fixed Deposit deleted.'
        )


        setDeleteTarget(
          null
        )


        await load()


      } catch (error) {

        const message =
          extractErrorMessage(
            error,
            'Could not delete Fixed Deposit.'
          )


        setDeleteTarget(
          null
        )


        setDeleteBlocked({

          title:
            'Cannot Delete Fixed Deposit',

          message,
        })


      } finally {

        setDeleting(
          false
        )
      }
    }


  // =======================================================
  // TABLE COLUMNS
  // =======================================================

  const columns = [

    {
      key:
        'fdNumber',

      header:
        'FD Number',

      render:
        (
          row
        ) => (

          <span className="font-mono font-semibold text-ink-900">

            {
              row.fdNumber ||
              row.fdNo ||
              '—'
            }

          </span>
        ),
    },


    {
      key:
        'groupCompanyName',

      header:
        'Group Company',

      render:
        (
          row
        ) => (

          <span className="text-bg-700">

            {
              row.groupCompanyName ||
              'Unassigned'
            }

          </span>
        ),
    },


    {
      key:
        'bankName',

      header:
        'Bank',

      render:
        (
          row
        ) =>

          row.bankName ||
          '—',
    },


    {
      key:
        'fdMaturityDate',

      header:
        'Maturity',

      render:
        (
          row
        ) =>

          row.fdMaturityDate
            ? formatDate(
                row.fdMaturityDate
              )
            : '—',
    },


    {
      key:
        'fdAmount',

      header:
        'FD Amount',

      render:
        (
          row
        ) => (

          <span className="num">

            {
              formatCurrency(
                row.fdAmount ||
                0
              )
            }

          </span>
        ),
    },


    {
      key:
        'linkedAmount',

      header:
        'Linked',

      render:
        (
          row
        ) => (

          <span className="num">

            {
              formatCurrency(
                row.linkedAmount ||
                0
              )
            }

          </span>
        ),
    },


    {
      key:
        'availableAmount',

      header:
        'Available',

      render:
        (
          row
        ) => {

          const fdAmount =
            Number(
              row.fdAmount ||
              0
            )


          const linked =
            Number(
              row.linkedAmount ||
              0
            )


          const available =
            row.availableAmount != null
              ? Number(
                  row.availableAmount
                )
              : Math.max(
                  0,
                  fdAmount -
                  linked
                )


          return (

            <span className="num font-semibold">

              {
                formatCurrency(
                  available
                )
              }

            </span>
          )
        },
    },


    {
      key:
        'status',

      header:
        'Status',

      render:
        (
          row
        ) => (

          <StatusBadge
            status={
              row.status
            }
          />
        ),
    },
  ]


  // =======================================================
  // PAGE
  // =======================================================

  return (

    <div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageHeader

        eyebrow="Module"

        title="FD Tracker"

        description="Fixed Deposits connected to Group Company, Bank and BG/LC margin links."

        actions={

          <div className="flex gap-2">

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

          </div>
        }
      />


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="mb-5 flex flex-wrap gap-2">

        {
          FILTERS.map(
            (
              filter
            ) => (

              <button

                key={
                  filter
                }

                type="button"

                onClick={
                  () =>
                    setActiveFilter(
                      filter
                    )
                }

                className={`
                  rounded-full border px-4 py-2 text-sm font-medium transition
                  ${
                    activeFilter ===
                    filter

                      ? 'border-ink-900 bg-ink-900 text-white'

                      : 'border-border bg-white text-muted hover:text-ink-900'
                  }
                `}
              >

                {
                  filter ===
                  'LIEN_MARKED'
                    ? 'LIEN-MARKED'
                    : filter
                }

              </button>
            )
          )
        }

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

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
                  filteredRows
                }

                emptyMessage="No Fixed Deposit records yet."

                actions={
                  (
                    row
                  ) => (

                    <div className="flex justify-end gap-1">

                      <button

                        type="button"

                        onClick={
                          () =>
                            openEdit(
                              row
                            )
                        }

                        className="rounded-lg p-2 text-muted transition hover:bg-ink-50 hover:text-ink-900"

                        title="Edit Fixed Deposit"
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

                        className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600"

                        title="Delete Fixed Deposit"
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


      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      <Modal

        open={
          modalOpen
        }

        onClose={
          () => {

            if (
              !saving
            ) {

              setModalOpen(
                false
              )
            }
          }
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

          {/* GROUP COMPANY */}

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
              (
                event
              ) =>
                change(
                  'groupCompanyId',
                  event.target.value
                )
            }
          >

            <option value="">
              Select company...
            </option>


            {
              companies.map(
                (
                  company
                ) => (

                  <option
                    key={
                      company.id
                    }
                    value={
                      company.id
                    }
                  >

                    {
                      company.companyName
                    }

                  </option>
                )
              )
            }

          </Select>


          {/* BANK */}

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
              (
                event
              ) =>
                change(
                  'bankId',
                  event.target.value
                )
            }
          >

            <option value="">
              Select bank...
            </option>


            {
              banks.map(
                (
                  bank
                ) => (

                  <option
                    key={
                      bank.id
                    }
                    value={
                      bank.id
                    }
                  >

                    {
                      bank.bankName
                    }

                    {
                      bank.branch
                        ? ` — ${bank.branch}`
                        : ''
                    }

                  </option>
                )
              )
            }

          </Select>


          {/* FD NUMBER */}

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
              (
                event
              ) =>
                change(
                  'fdNumber',
                  event.target.value
                )
            }
          />


          {/* FD AMOUNT */}

          <Input

            label="FD Amount"

            required

            type="number"

            error={
              errors.fdAmount
            }

            value={
              form.fdAmount
            }

            onChange={
              (
                event
              ) =>
                change(
                  'fdAmount',
                  event.target.value
                )
            }
          />


          {/* CREATION DATE */}

          <Input

            label="FD Creation Date"

            type="date"

            value={
              form.fdCreationDate
            }

            onChange={
              (
                event
              ) =>
                change(
                  'fdCreationDate',
                  event.target.value
                )
            }
          />


          {/* MATURITY */}

          <Input

            label="FD Maturity Date"

            type="date"

            error={
              errors.fdMaturityDate
            }

            value={
              form.fdMaturityDate
            }

            onChange={
              (
                event
              ) =>
                change(
                  'fdMaturityDate',
                  event.target.value
                )
            }
          />


          {/* PERIOD */}

          <Input

            label="Period"

            type="number"

            value={
              form.period
            }

            onChange={
              (
                event
              ) =>
                change(
                  'period',
                  event.target.value
                )
            }
          />


          {/* RATE */}

          <Input

            label="Rate (%)"

            type="number"

            value={
              form.interestRate
            }

            onChange={
              (
                event
              ) =>
                change(
                  'interestRate',
                  event.target.value
                )
            }
          />


          {/* STATUS */}

          <Select

            label="Status"

            value={
              form.status
            }

            onChange={
              (
                event
              ) =>
                change(
                  'status',
                  event.target.value
                )
            }
          >

            <option value="OPEN">
              OPEN
            </option>

            <option value="LIEN_MARKED">
              LIEN-MARKED
            </option>

            <option value="CLOSED">
              CLOSED
            </option>

          </Select>

        </form>

      </Modal>


      {/* =====================================================
          DELETE CONFIRM
      ===================================================== */}

      <ConfirmDialog

        open={
          Boolean(
            deleteTarget
          )
        }

        title="Are you sure?"

        message={
          `This will permanently remove this Fixed Deposit. A linked FD cannot be deleted.`
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


      {/* =====================================================
          DELETE BLOCKED
      ===================================================== */}

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

        title="Cannot Delete Fixed Deposit"

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

        <p className="text-sm leading-6 text-muted">

          {
            deleteBlocked?.message
          }

        </p>


        <p className="mt-3 text-sm text-muted">

          Go to <strong>FD Linking</strong> and unlink this Fixed Deposit from all BG/LC records first.

        </p>

      </Modal>

    </div>
  )
}