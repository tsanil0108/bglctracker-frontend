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
  lcApi,
} from '../../api/lcApi'

import {
  bankApi,
  vendorApi,
  groupCompanyApi,
} from '../../api/masterApi'

import {
  INSTRUMENT_STATUS,
  LC_PERIOD_TYPE,
} from '../../utils/constants'

import {
  formatCurrency,
  formatDate,
  toInputDate,
} from '../../utils/formatters'


// =========================================================
// EMPTY FORM
// =========================================================

const emptyForm = {

  groupCompanyId: '',

  issueBankId: '',

  lcNo: '',

  lcCreationDate: '',

  lcPeriodType:
    LC_PERIOD_TYPE.CREATION,

  lcExpiryDate: '',

  lcAmount: '',

  interestRate: '',

  bankCharges: '',

  materialReceiptDate: '',

  partyBearsInterest:
    false,

  acceptanceDate: '',

  paymentDate: '',

  linkedVendorId: '',

  status:
    INSTRUMENT_STATUS.ACTIVE,
}


// =========================================================
// COMPONENT
// =========================================================

export default function LcList() {

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
    vendors,
    setVendors,
  ] =
    useState([])


  // =======================================================
  // PAGE STATE
  // =======================================================

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


  // =======================================================
  // MODAL STATE
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
    useState({
      ...emptyForm,
    })


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


  // =========================================================
  // LOAD LC LIST
  // =========================================================

  const load =
    async (
      status
    ) => {

      setLoading(
        true
      )


      try {

        const data =
          await lcApi.getAll(
            status ||
            undefined
          )


        setRows(
          Array.isArray(data)
            ? data
            : []
        )


      } catch (error) {

        console.error(
          'LC load error:',
          error
        )


        push(
          extractErrorMessage(
            error,
            'Could not load Letters of Credit.'
          ),
          'error'
        )


      } finally {

        setLoading(
          false
        )
      }
    }


  // =========================================================
  // LOAD MASTER DATA
  // =========================================================

  useEffect(
    () => {

      const loadMasters =
        async () => {

          try {

            const [
              companyData,
              bankData,
              vendorData,
            ] =
              await Promise.all([

                groupCompanyApi.getAll(),

                bankApi.getAll(),

                vendorApi.getAll(),
              ])


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


            setVendors(
              Array.isArray(vendorData)
                ? vendorData
                : []
            )


          } catch (error) {

            console.error(
              'LC master-data load error:',
              error
            )


            push(
              'Could not load LC master data.',
              'error'
            )
          }
        }


      loadMasters()

    },
    [
      push,
    ]
  )


  // =========================================================
  // LOAD WHEN STATUS CHANGES
  // =========================================================

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


  // =========================================================
  // OPEN CREATE
  // =========================================================

  const openCreate =
    () => {

      setEditing(
        null
      )


      setForm({
        ...emptyForm,
      })


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


      setForm({

        groupCompanyId:
          row.groupCompanyId ??
          row.groupCompany?.id ??
          '',

        issueBankId:
          row.issueBankId ??
          row.issueBank?.id ??
          '',

        lcNo:
          row.lcNo ??
          '',

        lcCreationDate:
          toInputDate(
            row.lcCreationDate
          ),

        lcPeriodType:
          row.lcPeriodType ??
          LC_PERIOD_TYPE.CREATION,

        lcExpiryDate:
          toInputDate(
            row.lcExpiryDate
          ),

        lcAmount:
          row.lcAmount ??
          '',

        interestRate:
          row.interestRate ??
          '',

        bankCharges:
          row.bankCharges ??
          '',

        materialReceiptDate:
          toInputDate(
            row.materialReceiptDate
          ),

        partyBearsInterest:
          Boolean(
            row.partyBearsInterest
          ),

        acceptanceDate:
          toInputDate(
            row.acceptanceDate
          ),

        paymentDate:
          toInputDate(
            row.paymentDate
          ),

        linkedVendorId:
          row.linkedVendorId ??
          row.linkedVendor?.id ??
          '',

        status:
          row.status ??
          INSTRUMENT_STATUS.ACTIVE,
      })


      setErrors(
        {}
      )


      setModalOpen(
        true
      )
    }


  // =========================================================
  // CHANGE FIELD
  // =========================================================

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


  // =========================================================
  // VALIDATE
  // =========================================================

  const validate =
    () => {

      const errs =
        {}


      // -----------------------------------------------------
      // GROUP COMPANY
      // -----------------------------------------------------

      if (
        !form.groupCompanyId
      ) {

        errs.groupCompanyId =
          'Group Company is required'
      }


      // -----------------------------------------------------
      // ISSUE BANK
      // -----------------------------------------------------

      if (
        !form.issueBankId
      ) {

        errs.issueBankId =
          'Issue Bank is required'
      }


      // -----------------------------------------------------
      // LC NUMBER
      // -----------------------------------------------------

      if (
        !String(
          form.lcNo ??
          ''
        ).trim()
      ) {

        errs.lcNo =
          'LC Number is required'
      }


      // -----------------------------------------------------
      // LC AMOUNT
      // -----------------------------------------------------

      const amount =
        Number(
          form.lcAmount
        )


      if (
        !form.lcAmount
        ||
        !Number.isFinite(
          amount
        )
        ||
        amount <= 0
      ) {

        errs.lcAmount =
          'LC Amount must be greater than zero'
      }


      // -----------------------------------------------------
      // CREATION / EXPIRY
      // -----------------------------------------------------

      if (
        form.lcCreationDate
        &&
        form.lcExpiryDate
        &&
        new Date(
          form.lcExpiryDate
        ) <
        new Date(
          form.lcCreationDate
        )
      ) {

        errs.lcExpiryDate =
          'LC Expiry Date cannot be before Creation Date'
      }


      // -----------------------------------------------------
      // MATERIAL RECEIPT
      // -----------------------------------------------------

      if (
        form.lcCreationDate
        &&
        form.materialReceiptDate
        &&
        new Date(
          form.materialReceiptDate
        ) <
        new Date(
          form.lcCreationDate
        )
      ) {

        errs.materialReceiptDate =
          'Material Receipt Date cannot be before LC Creation Date'
      }


      // -----------------------------------------------------
      // ACCEPTANCE DATE
      // -----------------------------------------------------

      if (
        form.materialReceiptDate
        &&
        form.acceptanceDate
        &&
        new Date(
          form.acceptanceDate
        ) <
        new Date(
          form.materialReceiptDate
        )
      ) {

        errs.acceptanceDate =
          'Acceptance Date cannot be before Material Receipt Date'
      }


      // -----------------------------------------------------
      // PAYMENT DATE
      // -----------------------------------------------------

      if (
        form.acceptanceDate
        &&
        form.paymentDate
        &&
        new Date(
          form.paymentDate
        ) <
        new Date(
          form.acceptanceDate
        )
      ) {

        errs.paymentDate =
          'Payment Date cannot be before Acceptance Date'
      }


      // -----------------------------------------------------
      // INTEREST RATE
      // -----------------------------------------------------

      if (
        form.interestRate !== ''
      ) {

        const rate =
          Number(
            form.interestRate
          )


        if (
          !Number.isFinite(
            rate
          )
          ||
          rate < 0
          ||
          rate > 100
        ) {

          errs.interestRate =
            'Interest Rate must be between 0 and 100'
        }
      }


      // -----------------------------------------------------
      // BANK CHARGES
      // -----------------------------------------------------

      if (
        form.bankCharges !== ''
      ) {

        const charges =
          Number(
            form.bankCharges
          )


        if (
          !Number.isFinite(
            charges
          )
          ||
          charges < 0
        ) {

          errs.bankCharges =
            'Bank Charges cannot be negative'
        }
      }


      setErrors(
        errs
      )


      return (
        Object.keys(
          errs
        ).length ===
        0
      )
    }


  // =========================================================
  // SAVE
  // =========================================================

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

        issueBankId:
          Number(
            form.issueBankId
          ),

        lcNo:
          String(
            form.lcNo
          ).trim(),

        lcCreationDate:
          form.lcCreationDate ||
          null,

        lcPeriodType:
          form.lcPeriodType,

        lcExpiryDate:
          form.lcExpiryDate ||
          null,

        lcAmount:
          Number(
            form.lcAmount
          ),

        interestRate:
          form.interestRate === ''
            ? null
            : Number(
                form.interestRate
              ),

        bankCharges:
          form.bankCharges === ''
            ? null
            : Number(
                form.bankCharges
              ),

        materialReceiptDate:
          form.materialReceiptDate ||
          null,

        partyBearsInterest:
          Boolean(
            form.partyBearsInterest
          ),

        acceptanceDate:
          form.acceptanceDate ||
          null,

        paymentDate:
          form.paymentDate ||
          null,

        linkedVendorId:
          form.linkedVendorId
            ? Number(
                form.linkedVendorId
              )
            : null,

        status:
          form.status,
      }


      try {

        if (
          editing
        ) {

          await lcApi.update(
            editing.id,
            payload
          )


          push(
            'Letter of Credit updated.'
          )


        } else {

          await lcApi.create(
            payload
          )


          push(
            'Letter of Credit added.'
          )
        }


        setModalOpen(
          false
        )


        setEditing(
          null
        )


        await load(
          statusFilter
        )


      } catch (error) {

        console.error(
          'LC save error:',
          error
        )


        push(
          extractErrorMessage(
            error,
            'Could not save Letter of Credit.'
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

        await lcApi.remove(
          deleteTarget.id
        )


        push(
          'Letter of Credit deleted.'
        )


        setDeleteTarget(
          null
        )


        await load(
          statusFilter
        )


      } catch (error) {

        console.error(
          'LC delete error:',
          error
        )


        push(
          extractErrorMessage(
            error,
            'Could not delete Letter of Credit.'
          ),
          'error'
        )


      } finally {

        setDeleting(
          false
        )
      }
    }


  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = [

    {
      key:
        'lcNo',

      header:
        'LC No.',

      render:
        (
          row
        ) => (

          <Link
            to={`/lc/${row.id}`}
            className="num font-medium text-bg-700 hover:underline"
          >
            {
              row.lcNo ||
              '—'
            }
          </Link>
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
        ) =>

          row.groupCompanyName ||
          '—',
    },


    {
      key:
        'issueBankName',

      header:
        'Issue Bank',

      render:
        (
          row
        ) =>

          row.issueBankName ||
          '—',
    },


    {
      key:
        'linkedVendorName',

      header:
        'Vendor',

      render:
        (
          row
        ) =>

          row.linkedVendorName ||
          '—',
    },


    {
      key:
        'lcExpiryDate',

      header:
        'Expiry',

      render:
        (
          row
        ) =>

          row.lcExpiryDate
            ? formatDate(
                row.lcExpiryDate
              )
            : '—',
    },


    {
      key:
        'lcAmount',

      header:
        'Amount',

      render:
        (
          row
        ) => (

          <span className="num">

            {
              formatCurrency(
                row.lcAmount ||
                0
              )
            }

          </span>
        ),
    },


    {
      key:
        'linkedFds',

      header:
        'Linked FDs',

      render:
        (
          row
        ) => {

          const count =
            Array.isArray(
              row.linkedFds
            )
              ? row.linkedFds.length
              : 0


          return count
            ? `${count} FD${
                count > 1
                  ? 's'
                  : ''
              }`
            : '—'
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


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageHeader

        eyebrow="Module"

        title="Letters of Credit"

        description="LCs issued in favour of vendors, with full financial and timeline detail."

        actions={

          <div className="flex flex-wrap gap-2">

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

              Add LC

            </Button>

          </div>
        }
      />


      {/* =====================================================
          STATUS FILTER
      ===================================================== */}

      <div className="mb-4 flex flex-wrap gap-2">

        {
          [
            '',
            ...Object.values(
              INSTRUMENT_STATUS
            ),
          ].map(
            (
              status
            ) => (

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

                className={`
                  rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors
                  ${
                    statusFilter ===
                    status
                      ? 'bg-ink-900 text-white'
                      : 'bg-white text-muted ring-1 ring-inset ring-border hover:text-ink-900'
                  }
                `}
              >

                {
                  status === ''
                    ? 'All'
                    : status
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
                  rows
                }

                emptyMessage="No Letters of Credit recorded yet."

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

        size="lg"

        title={
          editing
            ? 'Edit Letter of Credit'
            : 'Add Letter of Credit'
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

          {/* =================================================
              GROUP COMPANY
          ================================================= */}

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
              Select group company...
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


          {/* =================================================
              ISSUE BANK
          ================================================= */}

          <Select

            label="Issue Bank"

            required

            error={
              errors.issueBankId
            }

            value={
              form.issueBankId
            }

            onChange={
              (
                event
              ) =>
                change(
                  'issueBankId',
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


          {/* =================================================
              LC NUMBER
          ================================================= */}

          <Input

            label="LC No."

            required

            error={
              errors.lcNo
            }

            value={
              form.lcNo
            }

            onChange={
              (
                event
              ) =>
                change(
                  'lcNo',
                  event.target.value
                )
            }
          />


          {/* =================================================
              CREATION DATE
          ================================================= */}

          <Input

            label="LC Creation Date"

            type="date"

            value={
              form.lcCreationDate
            }

            onChange={
              (
                event
              ) =>
                change(
                  'lcCreationDate',
                  event.target.value
                )
            }
          />


          {/* =================================================
              PERIOD TYPE
          ================================================= */}

          <Select

            label="LC Period Type"

            value={
              form.lcPeriodType
            }

            onChange={
              (
                event
              ) =>
                change(
                  'lcPeriodType',
                  event.target.value
                )
            }
          >

            <option
              value={
                LC_PERIOD_TYPE.CREATION
              }
            >
              Creation-based
            </option>


            <option
              value={
                LC_PERIOD_TYPE.AT_SIGHT
              }
            >
              At Sight
            </option>

          </Select>


          {/* =================================================
              EXPIRY
          ================================================= */}

          <Input

            label="LC Expiry Date"

            type="date"

            error={
              errors.lcExpiryDate
            }

            value={
              form.lcExpiryDate
            }

            onChange={
              (
                event
              ) =>
                change(
                  'lcExpiryDate',
                  event.target.value
                )
            }
          />


          {/* =================================================
              AMOUNT
          ================================================= */}

          <Input

            label="LC Amount"

            type="number"

            step="0.01"

            required

            error={
              errors.lcAmount
            }

            value={
              form.lcAmount
            }

            onChange={
              (
                event
              ) =>
                change(
                  'lcAmount',
                  event.target.value
                )
            }
          />


          {/* =================================================
              INTEREST
          ================================================= */}

          <Input

            label="Interest Rate (%)"

            type="number"

            step="0.01"

            error={
              errors.interestRate
            }

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


          {/* =================================================
              BANK CHARGES
          ================================================= */}

          <Input

            label="Bank Charges"

            type="number"

            step="0.01"

            error={
              errors.bankCharges
            }

            value={
              form.bankCharges
            }

            onChange={
              (
                event
              ) =>
                change(
                  'bankCharges',
                  event.target.value
                )
            }
          />


          {/* =================================================
              MATERIAL RECEIPT DATE
          ================================================= */}

          <Input

            label="Material Receipt Date"

            type="date"

            error={
              errors.materialReceiptDate
            }

            value={
              form.materialReceiptDate
            }

            onChange={
              (
                event
              ) =>
                change(
                  'materialReceiptDate',
                  event.target.value
                )
            }
          />


          {/* =================================================
              PARTY BEARS INTEREST
          ================================================= */}

          <Select

            label="Party Bears Interest"

            value={
              form.partyBearsInterest
                ? 'true'
                : 'false'
            }

            onChange={
              (
                event
              ) =>
                change(
                  'partyBearsInterest',
                  event.target.value ===
                  'true'
                )
            }
          >

            <option value="false">
              No
            </option>

            <option value="true">
              Yes
            </option>

          </Select>


          {/* =================================================
              ACCEPTANCE DATE
          ================================================= */}

          <Input

            label="Acceptance Date"

            type="date"

            error={
              errors.acceptanceDate
            }

            value={
              form.acceptanceDate
            }

            onChange={
              (
                event
              ) =>
                change(
                  'acceptanceDate',
                  event.target.value
                )
            }
          />


          {/* =================================================
              PAYMENT DATE
          ================================================= */}

          <Input

            label="Payment Date (by Company)"

            type="date"

            error={
              errors.paymentDate
            }

            value={
              form.paymentDate
            }

            onChange={
              (
                event
              ) =>
                change(
                  'paymentDate',
                  event.target.value
                )
            }
          />


          {/* =================================================
              VENDOR
          ================================================= */}

          <Select

            label="Linked Vendor"

            value={
              form.linkedVendorId
            }

            onChange={
              (
                event
              ) =>
                change(
                  'linkedVendorId',
                  event.target.value
                )
            }
          >

            <option value="">
              None
            </option>


            {
              vendors.map(
                (
                  vendor
                ) => (

                  <option

                    key={
                      vendor.id
                    }

                    value={
                      vendor.id
                    }
                  >

                    {
                      vendor.vendorName
                    }

                  </option>
                )
              )
            }

          </Select>


          {/* =================================================
              STATUS
          ================================================= */}

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

            {
              Object
                .values(
                  INSTRUMENT_STATUS
                )
                .map(
                  (
                    status
                  ) => (

                    <option

                      key={
                        status
                      }

                      value={
                        status
                      }
                    >

                      {status}

                    </option>
                  )
                )
            }

          </Select>

        </form>

      </Modal>


      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      <ConfirmDialog

        open={
          Boolean(
            deleteTarget
          )
        }

        message="This will permanently remove this Letter of Credit record. This can't be undone."

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

    </div>
  )
}