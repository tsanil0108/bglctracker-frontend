import React, {
  useEffect,
  useState,
} from 'react'

import {
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Loader from '../../components/common/Loader'

import {
  Input,
  Select,
  Textarea,
} from '../../components/common/Field'

import {
  useToast,
} from '../../components/common/Toast'

import {
  extractErrorMessage,
} from '../../api/axiosClient'

import {
  bankLimitApi,
} from '../../api/bankLimitApi'

import {
  bankApi,
  groupCompanyApi,
} from '../../api/masterApi'

import {
  FACILITY_TYPES,
} from '../../utils/constants'

import {
  formatCurrency,
  formatDate,
} from '../../utils/formatters'


const emptyForm = {

  groupCompanyId: '',

  bankId: '',

  facilityType:
    'BG',

  sanctionedLimit: '',

  effectiveDate: '',

  reviewExpiryDate: '',

  remarks: '',
}


function UtilizationBar({
  pct,
}) {

  const value =
    Number(
      pct ||
      0
    )


  const clamped =
    Math.max(
      0,
      Math.min(
        value,
        100
      )
    )


  const barClass =
    value >= 90

      ? 'bg-danger'

      : value >= 75

        ? 'bg-orange-500'

        : 'bg-bg-600'


  return (

    <div className="w-40">

      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-50">

        <div
          className={`h-2 rounded-full ${barClass}`}
          style={{
            width:
              `${clamped}%`,
          }}
        />

      </div>


      <p className="mt-1 text-xs text-muted">
        {value.toFixed(1)}% utilized
      </p>

    </div>
  )
}


export default function BankLimits() {

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
    async () => {

      setLoading(
        true
      )

      try {

        const data =
          await bankLimitApi.getAll()

        setRows(
          data
        )

      } catch {

        push(
          'Could not load Bank Limits.',
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


      load()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
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

        facilityType:
          row.facilityType ??
          'BG',

        sanctionedLimit:
          row.sanctionedLimit ??
          '',

        effectiveDate:
          row.effectiveDate
            ? row.effectiveDate.slice(
                0,
                10
              )
            : '',

        reviewExpiryDate:
          row.reviewExpiryDate
            ? row.reviewExpiryDate.slice(
                0,
                10
              )
            : '',

        remarks:
          row.remarks ??
          '',
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
        !form.facilityType
      ) {

        errs.facilityType =
          'Required'
      }


      if (
        !form.sanctionedLimit ||
        Number(
          form.sanctionedLimit
        ) <= 0
      ) {

        errs.sanctionedLimit =
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

        groupCompanyId:
          Number(
            form.groupCompanyId
          ),

        bankId:
          Number(
            form.bankId
          ),

        facilityType:
          form.facilityType,

        sanctionedLimit:
          Number(
            form.sanctionedLimit
          ),

        effectiveDate:
          form.effectiveDate ||
          null,

        reviewExpiryDate:
          form.reviewExpiryDate ||
          null,

        remarks:
          form.remarks
            ?.trim()
            ? form.remarks.trim()
            : null,
      }


      try {

        if (
          editing
        ) {

          await bankLimitApi.update(
            editing.id,
            payload
          )

          push(
            'Bank Limit updated.'
          )

        } else {

          await bankLimitApi.create(
            payload
          )

          push(
            'Bank Limit added.'
          )
        }


        setModalOpen(
          false
        )

        load()

      } catch (
        err
      ) {

        push(
          extractErrorMessage(
            err,
            'Could not save Bank Limit.'
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

        await bankLimitApi.remove(
          deleteTarget.id
        )

        push(
          'Bank Limit deleted.'
        )

        setDeleteTarget(
          null
        )

        load()

      } catch (
        err
      ) {

        push(
          extractErrorMessage(
            err,
            'Could not delete Bank Limit.'
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
        'groupCompanyName',

      header:
        'Group Company',

      render:
        (row) =>

          row.groupCompanyName ||
          '—',
    },


    {
      key:
        'bankName',

      header:
        'Bank',
    },


    {
      key:
        'facilityType',

      header:
        'Facility',

      render:
        (row) =>

          FACILITY_TYPES[
            row.facilityType
          ] ||
          row.facilityType,
    },


    {
      key:
        'sanctionedLimit',

      header:
        'Sanctioned',

      render:
        (row) => (

          <span className="num">
            {formatCurrency(
              row.sanctionedLimit
            )}
          </span>
        ),
    },


    {
      key:
        'utilizedLimit',

      header:
        'Utilized',

      render:
        (row) => (

          <span className="num">
            {formatCurrency(
              row.utilizedLimit
            )}
          </span>
        ),
    },


    {
      key:
        'availableLimit',

      header:
        'Available',

      render:
        (row) => (

          <span className="num font-medium">
            {formatCurrency(
              row.availableLimit
            )}
          </span>
        ),
    },


    {
      key:
        'utilizationPercent',

      header:
        'Utilization',

      render:
        (row) => (

          <UtilizationBar
            pct={
              row.utilizationPercent
            }
          />
        ),
    },


    {
      key:
        'reviewExpiryDate',

      header:
        'Review / Expiry',

      render:
        (row) =>

          formatDate(
            row.reviewExpiryDate
          ),
    },
  ]


  return (

    <div>

      <PageHeader
        eyebrow="Module"
        title="Bank Limits"
        description="Company-wise sanctioned BG/LC facilities with live utilization calculated from outstanding instruments."
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

            Add Bank Limit

          </Button>
        }
      />


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
                emptyMessage="No Bank Limits configured yet."
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
                        className="rounded-lg p-2 text-muted hover:bg-ink-50 hover:text-ink-900"
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
        size="md"
        title={
          editing
            ? 'Edit Bank Limit'
            : 'Add Bank Limit'
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


          <Select
            label="Facility Type"
            required
            error={
              errors.facilityType
            }
            value={
              form.facilityType
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  facilityType:
                    e.target.value,
                })
            }
          >

            {Object.entries(
              FACILITY_TYPES
            ).map(
              ([
                key,
                label,
              ]) => (

                <option
                  key={
                    key
                  }
                  value={
                    key
                  }
                >
                  {label}
                </option>
              )
            )}

          </Select>


          <Input
            label="Sanctioned Limit"
            type="number"
            min="0.01"
            step="0.01"
            required
            error={
              errors.sanctionedLimit
            }
            value={
              form.sanctionedLimit
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  sanctionedLimit:
                    e.target.value,
                })
            }
          />


          <Input
            label="Effective Date"
            type="date"
            value={
              form.effectiveDate
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  effectiveDate:
                    e.target.value,
                })
            }
          />


          <Input
            label="Review / Expiry Date"
            type="date"
            value={
              form.reviewExpiryDate
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  reviewExpiryDate:
                    e.target.value,
                })
            }
          />


          <Textarea
            label="Remarks"
            className="sm:col-span-2"
            value={
              form.remarks
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  remarks:
                    e.target.value,
                })
            }
          />

        </form>

      </Modal>


      <ConfirmDialog
        open={
          !!deleteTarget
        }
        message="This will permanently remove this Bank Limit record."
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