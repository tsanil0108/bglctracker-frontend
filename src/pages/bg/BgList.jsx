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
import BgFdLinkSection from '../../components/bg/BgFdLinkSection'

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
  bgApi,
} from '../../api/bgApi'

import {
  fdApi,
} from '../../api/fdApi'

import {
  fdLinkApi,
} from '../../api/fdLinkApi'

import {
  bankApi,
  clientApi,
  guaranteeTypeApi,
  groupCompanyApi,
} from '../../api/masterApi'

import {
  INSTRUMENT_STATUS,
} from '../../utils/constants'

import {
  formatCurrency,
  formatDate,
  toInputDate,
} from '../../utils/formatters'


const emptyForm = {

  groupCompanyId: '',

  clientId: '',

  siteProject: '',

  guaranteeTypeId: '',

  issuingBankId: '',

  bgNo: '',

  bgAmount: '',

  interestRate: '',

  bankCharges: '',

  issueDate: '',

  expiryDate: '',

  claimExpiryDate: '',

  durationClaimPeriod: '',

  status:
    INSTRUMENT_STATUS.ACTIVE,
}


export default function BgList() {

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
    clients,
    setClients,
  ] =
    useState([])


  const [
    guaranteeTypes,
    setGuaranteeTypes,
  ] =
    useState([])


  const [
    fds,
    setFds,
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
    linkFd,
    setLinkFd,
  ] =
    useState(false)


  const [
    selectedFdId,
    setSelectedFdId,
  ] =
    useState('')


  const [
    linkedAmount,
    setLinkedAmount,
  ] =
    useState('')


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

      setLoading(true)

      try {

        const data =
          await bgApi.getAll(
            status ||
            undefined
          )

        setRows(data)

      } catch {

        push(
          'Could not load Bank Guarantees.',
          'error'
        )

      } finally {

        setLoading(false)
      }
    }


  const loadFds =
    async () => {

      try {

        const data =
          await fdApi.getAll()

        setFds(data)

      } catch {

        push(
          'Could not load Fixed Deposits.',
          'error'
        )
      }
    }


  useEffect(
    () => {

      groupCompanyApi
        .getAll()
        .then(
          setCompanies
        )
        .catch(
          () => {}
        )


      bankApi
        .getAll()
        .then(
          setBanks
        )
        .catch(
          () => {}
        )


      clientApi
        .getAll()
        .then(
          setClients
        )
        .catch(
          () => {}
        )


      guaranteeTypeApi
        .getAll()
        .then(
          setGuaranteeTypes
        )
        .catch(
          () => {}
        )


      loadFds()

      // eslint-disable-next-line react-hooks/exhaustive-deps
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


  /*
   * Only same Company + same Bank FDs.
   */
  const eligibleFds =
    useMemo(
      () => {

        if (
          !form.groupCompanyId ||
          !form.issuingBankId
        ) {

          return []
        }


        return fds.filter(
          (fd) => {

            const sameCompany =
              String(
                fd.groupCompanyId
              ) ===
              String(
                form.groupCompanyId
              )


            const sameBank =
              String(
                fd.bankId
              ) ===
              String(
                form.issuingBankId
              )


            const notClosed =
              fd.status !==
              'CLOSED'


            const available =
              Number(
                fd.availableAmount ??
                fd.fdAmount ??
                0
              )


            return (
              sameCompany &&
              sameBank &&
              notClosed &&
              available > 0
            )
          }
        )
      },
      [
        fds,
        form.groupCompanyId,
        form.issuingBankId,
      ]
    )


  const selectedFd =
    useMemo(
      () =>
        eligibleFds.find(
          (fd) =>
            String(fd.id) ===
            String(selectedFdId)
        ),
      [
        eligibleFds,
        selectedFdId,
      ]
    )


  const resetFdLink =
    () => {

      setLinkFd(false)

      setSelectedFdId('')

      setLinkedAmount('')
    }


  const openCreate =
    () => {

      setEditing(null)

      setForm(
        emptyForm
      )

      resetFdLink()

      setErrors({})

      setModalOpen(
        true
      )
    }


  const openEdit =
    (row) => {

      setEditing(row)

      setForm({

        groupCompanyId:
          row.groupCompanyId ??
          '',

        clientId:
          row.clientId ??
          '',

        siteProject:
          row.siteProject ??
          '',

        guaranteeTypeId:
          row.guaranteeTypeId ??
          '',

        issuingBankId:
          row.issuingBankId ??
          '',

        bgNo:
          row.bgNo ??
          '',

        bgAmount:
          row.bgAmount ??
          '',

        interestRate:
          row.interestRate ??
          '',

        bankCharges:
          row.bankCharges ??
          '',

        issueDate:
          toInputDate(
            row.issueDate
          ),

        expiryDate:
          toInputDate(
            row.expiryDate
          ),

        claimExpiryDate:
          toInputDate(
            row.claimExpiryDate
          ),

        durationClaimPeriod:
          row.durationClaimPeriod ??
          '',

        status:
          row.status ??
          INSTRUMENT_STATUS.ACTIVE,
      })

      resetFdLink()

      setErrors({})

      setModalOpen(
        true
      )
    }


  const handleCompanyChange =
    (companyId) => {

      setForm(
        (current) => ({
          ...current,
          groupCompanyId:
            companyId,
        })
      )

      setSelectedFdId('')

      setLinkedAmount('')
    }


  const handleBankChange =
    (bankId) => {

      setForm(
        (current) => ({
          ...current,
          issuingBankId:
            bankId,
        })
      )

      setSelectedFdId('')

      setLinkedAmount('')

      setErrors(
        (current) => ({
          ...current,
          issuingBankId:
            undefined,
          selectedFdId:
            undefined,
          linkedAmount:
            undefined,
        })
      )
    }


  const handleFdSelection =
    (fdId) => {

      setSelectedFdId(
        fdId
      )


      const fd =
        eligibleFds.find(
          (item) =>
            String(item.id) ===
            String(fdId)
        )


      /*
       * Suggest maximum currently available amount.
       * User can reduce it.
       */
      setLinkedAmount(
        fd
          ? String(
              fd.availableAmount ??
              ''
            )
          : ''
      )


      setErrors(
        (current) => ({
          ...current,
          selectedFdId:
            undefined,
          linkedAmount:
            undefined,
        })
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
        !form.clientId
      ) {

        errs.clientId =
          'Required'
      }


      if (
        !form.guaranteeTypeId
      ) {

        errs.guaranteeTypeId =
          'Required'
      }


      if (
        !form.issuingBankId
      ) {

        errs.issuingBankId =
          'Required'
      }


      if (
        !form.bgNo
          ?.trim()
      ) {

        errs.bgNo =
          'Required'
      }


      if (
        !form.bgAmount ||
        Number(
          form.bgAmount
        ) <= 0
      ) {

        errs.bgAmount =
          'Enter an amount greater than 0'
      }


      if (
        !editing &&
        linkFd
      ) {

        if (
          !selectedFdId
        ) {

          errs.selectedFdId =
            'Select a Fixed Deposit'
        }


        const amount =
          Number(
            linkedAmount
          )


        if (
          !linkedAmount ||
          Number.isNaN(
            amount
          ) ||
          amount <= 0
        ) {

          errs.linkedAmount =
            'Enter an amount greater than 0'

        } else if (
          selectedFd &&
          amount >
          Number(
            selectedFd.availableAmount ??
            0
          )
        ) {

          errs.linkedAmount =
            `Maximum available is ${formatCurrency(
              selectedFd.availableAmount
            )}`
        }
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

        clientId:
          Number(
            form.clientId
          ),

        guaranteeTypeId:
          Number(
            form.guaranteeTypeId
          ),

        issuingBankId:
          Number(
            form.issuingBankId
          ),

        bgAmount:
          Number(
            form.bgAmount
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

        issueDate:
          form.issueDate ||
          null,

        expiryDate:
          form.expiryDate ||
          null,

        claimExpiryDate:
          form.claimExpiryDate ||
          null,
      }


      try {

        if (
          editing
        ) {

          await bgApi.update(
            editing.id,
            payload
          )

          push(
            'Bank Guarantee updated.'
          )

        } else {

          const createdBg =
            await bgApi.create(
              payload
            )


          if (
            linkFd &&
            selectedFdId
          ) {

            try {

              await fdLinkApi.create({

                fdId:
                  Number(
                    selectedFdId
                  ),

                bgId:
                  createdBg.id,

                lcId:
                  null,

                linkedAmount:
                  Number(
                    linkedAmount
                  ),

                linkedDate:
                  null,
              })


              push(
                'Bank Guarantee added and Fixed Deposit linked.'
              )

            } catch (
              linkError
            ) {

              push(
                `Bank Guarantee was created, but FD linking failed: ${
                  extractErrorMessage(
                    linkError,
                    'Please link it from Manage Links.'
                  )
                }`,
                'error'
              )
            }

          } else {

            push(
              'Bank Guarantee added.'
            )
          }
        }


        setModalOpen(
          false
        )


        await Promise.all([
          load(
            statusFilter
          ),
          loadFds(),
        ])


      } catch (
        err
      ) {

        push(
          extractErrorMessage(
            err,
            'Could not save Bank Guarantee.'
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

        await bgApi.remove(
          deleteTarget.id
        )

        push(
          'Bank Guarantee deleted.'
        )

        setDeleteTarget(
          null
        )

        await Promise.all([
          load(
            statusFilter
          ),
          loadFds(),
        ])

      } catch (
        err
      ) {

        push(
          extractErrorMessage(
            err,
            'Could not delete Bank Guarantee.'
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
        'bgNo',

      header:
        'BG No.',

      render:
        (row) => (

          <Link
            to={
              `/bg/${row.id}`
            }
            className="num font-medium text-bg-700 hover:underline"
          >
            {row.bgNo}
          </Link>
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
        'clientName',

      header:
        'Client',
    },


    {
      key:
        'issuingBankName',

      header:
        'Bank',
    },


    {
      key:
        'siteProject',

      header:
        'Site / Project',

      render:
        (row) =>
          row.siteProject ||
          '—',
    },


    {
      key:
        'guaranteeTypeCode',

      header:
        'Type',
    },


    {
      key:
        'expiryDate',

      header:
        'Expiry',

      render:
        (row) =>
          formatDate(
            row.expiryDate
          ),
    },


    {
      key:
        'bgAmount',

      header:
        'Amount',

      render:
        (row) => (

          <span className="num">
            {formatCurrency(
              row.bgAmount
            )}
          </span>
        ),
    },


    {
      key:
        'linkedFds',

      header:
        'Linked FDs',

      render:
        (row) =>

          row.linkedFds
            ?.length

            ? `${row.linkedFds.length} FD${
                row.linkedFds.length > 1
                  ? 's'
                  : ''
              }`

            : '—',
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

        title="Bank Guarantees"

        description="Company-wise Bank Guarantees connected to clients, issuing banks and pledged Fixed Deposits."

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

              Add BG

            </Button>

          </>
        }
      />


      <div className="mb-4 flex flex-wrap gap-2">

        {[
          '',
          ...Object.values(
            INSTRUMENT_STATUS
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

              className={
                `rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter ===
                  status

                    ? 'bg-ink-900 text-white'

                    : 'bg-white text-muted ring-1 ring-inset ring-border hover:text-ink-900'
                }`
              }
            >

              {
                status === ''
                  ? 'All'
                  : status
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
                emptyMessage="No Bank Guarantees recorded yet."
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

        size="lg"

        title={
          editing
            ? 'Edit Bank Guarantee'
            : 'Add Bank Guarantee'
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
                handleCompanyChange(
                  e.target.value
                )
            }
          >

            <option value="">
              Select group company…
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
            label="Client"
            required
            error={
              errors.clientId
            }
            value={
              form.clientId
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  clientId:
                    e.target.value,
                })
            }
          >

            <option value="">
              Select client…
            </option>

            {clients.map(
              (client) => (

                <option
                  key={
                    client.id
                  }
                  value={
                    client.id
                  }
                >
                  {client.clientName}
                </option>
              )
            )}

          </Select>


          <Input
            label="Site / Project"
            value={
              form.siteProject
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  siteProject:
                    e.target.value,
                })
            }
          />


          <Select
            label="Guarantee Type"
            required
            error={
              errors.guaranteeTypeId
            }
            value={
              form.guaranteeTypeId
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  guaranteeTypeId:
                    e.target.value,
                })
            }
          >

            <option value="">
              Select type…
            </option>

            {guaranteeTypes.map(
              (type) => (

                <option
                  key={
                    type.id
                  }
                  value={
                    type.id
                  }
                >

                  {type.code}

                  {
                    type.typeName
                      ? ` — ${type.typeName}`
                      : ''
                  }

                </option>
              )
            )}

          </Select>


          <Select
            label="Issuing Bank"
            required
            error={
              errors.issuingBankId
            }
            value={
              form.issuingBankId
            }
            onChange={
              (e) =>
                handleBankChange(
                  e.target.value
                )
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
            label="BG No."
            required
            error={
              errors.bgNo
            }
            value={
              form.bgNo
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  bgNo:
                    e.target.value,
                })
            }
          />


          <Input
            label="BG Amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            error={
              errors.bgAmount
            }
            value={
              form.bgAmount
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  bgAmount:
                    e.target.value,
                })
            }
          />


          <Input
            label="Interest Rate (%)"
            type="number"
            step="0.01"
            value={
              form.interestRate
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  interestRate:
                    e.target.value,
                })
            }
          />


          <Input
            label="Bank Charges"
            type="number"
            step="0.01"
            value={
              form.bankCharges
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  bankCharges:
                    e.target.value,
                })
            }
          />


          <Input
            label="Issue Date"
            type="date"
            value={
              form.issueDate
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  issueDate:
                    e.target.value,
                })
            }
          />


          <Input
            label="Expiry Date"
            type="date"
            value={
              form.expiryDate
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  expiryDate:
                    e.target.value,
                })
            }
          />


          <Input
            label="Claim Expiry Date"
            type="date"
            value={
              form.claimExpiryDate
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  claimExpiryDate:
                    e.target.value,
                })
            }
          />


          <Input
            label="Duration / Claim Period"
            placeholder="e.g. 12 months + 3 months claim"
            value={
              form.durationClaimPeriod
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  durationClaimPeriod:
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
              INSTRUMENT_STATUS
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
                  {status}
                </option>
              )
            )}

          </Select>


          {!editing && (

            <BgFdLinkSection

              enabled={
                linkFd
              }

              onEnabledChange={
                (checked) => {

                  setLinkFd(
                    checked
                  )

                  if (
                    !checked
                  ) {

                    setSelectedFdId('')

                    setLinkedAmount('')
                  }
                }
              }

              groupCompanyId={
                form.groupCompanyId
              }

              issuingBankId={
                form.issuingBankId
              }

              eligibleFds={
                eligibleFds
              }

              selectedFdId={
                selectedFdId
              }

              onSelectedFdChange={
                handleFdSelection
              }

              linkedAmount={
                linkedAmount
              }

              onLinkedAmountChange={
                setLinkedAmount
              }

              errors={
                errors
              }
            />
          )}

        </form>

      </Modal>


      <ConfirmDialog
        open={
          !!deleteTarget
        }
        message="This will permanently remove this Bank Guarantee record. Linked FDs must be removed first."
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