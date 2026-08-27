import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link2,
  ShieldCheck,
  ScrollText,
  Trash2,
  Plus,
} from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import ConfirmDialog from '../../components/common/ConfirmDialog'

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
  bgApi,
} from '../../api/bgApi'

import {
  lcApi,
} from '../../api/lcApi'

import {
  fdLinkApi,
} from '../../api/fdLinkApi'

import {
  formatCurrency,
  formatDate,
} from '../../utils/formatters'


function getTodayInputDate() {

  const now =
    new Date()

  const year =
    now.getFullYear()

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      '0'
    )

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      '0'
    )

  return `${year}-${month}-${day}`
}


export default function FdLinkPage() {

  const { push } =
    useToast()


  // =========================================================
  // MODE
  // =========================================================

  const [
    mode,
    setMode,
  ] =
    useState('BG')


  // =========================================================
  // MASTER DATA
  // =========================================================

  const [
    bgs,
    setBgs,
  ] =
    useState([])


  const [
    lcs,
    setLcs,
  ] =
    useState([])


  const [
    fds,
    setFds,
  ] =
    useState([])


  // =========================================================
  // SELECTED INSTRUMENT
  // =========================================================

  const [
    selectedInstrumentId,
    setSelectedInstrumentId,
  ] =
    useState('')


  const [
    selectedInstrument,
    setSelectedInstrument,
  ] =
    useState(null)


  // =========================================================
  // CURRENT LINKS
  // =========================================================

  const [
    links,
    setLinks,
  ] =
    useState([])


  const [
    linksLoading,
    setLinksLoading,
  ] =
    useState(false)


  // =========================================================
  // LINK FORM
  // =========================================================

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
    linkedDate,
    setLinkedDate,
  ] =
    useState(
      getTodayInputDate()
    )


  // =========================================================
  // UI STATES
  // =========================================================

  const [
    loading,
    setLoading,
  ] =
    useState(true)


  const [
    saving,
    setSaving,
  ] =
    useState(false)


  const [
    unlinkTarget,
    setUnlinkTarget,
  ] =
    useState(null)


  const [
    unlinkingId,
    setUnlinkingId,
  ] =
    useState(null)


  // =========================================================
  // LOAD INITIAL DATA
  // =========================================================

  const loadInitialData =
    async () => {

      setLoading(
        true
      )


      try {

        const [
          bgData,
          lcData,
          fdData,
        ] =
          await Promise.all([
            bgApi.getAll(),
            lcApi.getAll(),
            fdApi.getAll(),
          ])


        setBgs(
          Array.isArray(bgData)
            ? bgData
            : []
        )


        setLcs(
          Array.isArray(lcData)
            ? lcData
            : []
        )


        setFds(
          Array.isArray(fdData)
            ? fdData
            : []
        )


      } catch (
        error
      ) {

        console.error(
          'FD Linking initial load error:',
          error
        )


        push(
          extractErrorMessage(
            error,
            'Could not load FD Linking data.'
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

      loadInitialData()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  )


  // =========================================================
  // RESET LINK FORM
  // =========================================================

  const resetLinkForm =
    () => {

      setSelectedFdId(
        ''
      )

      setLinkedAmount(
        ''
      )

      setLinkedDate(
        getTodayInputDate()
      )
    }


  // =========================================================
  // MODE CHANGE
  // =========================================================

  const handleModeChange =
    (
      nextMode
    ) => {

      setMode(
        nextMode
      )

      setSelectedInstrumentId(
        ''
      )

      setSelectedInstrument(
        null
      )

      setLinks(
        []
      )

      setUnlinkTarget(
        null
      )

      resetLinkForm()
    }


  // =========================================================
  // LOAD SELECTED BG/LC + LINKS
  // =========================================================

  const loadInstrumentAndLinks =
    async (
      instrumentId = selectedInstrumentId,
      currentMode = mode
    ) => {

      if (
        !instrumentId
      ) {

        setSelectedInstrument(
          null
        )

        setLinks(
          []
        )

        return
      }


      setLinksLoading(
        true
      )


      try {

        if (
          currentMode === 'BG'
        ) {

          const [
            instrumentData,
            linkData,
          ] =
            await Promise.all([

              bgApi.getById(
                instrumentId
              ),

              fdLinkApi.getByBg(
                instrumentId
              ),
            ])


          setSelectedInstrument(
            instrumentData
          )


          setLinks(
            Array.isArray(linkData)
              ? linkData
              : []
          )


        } else {

          const [
            instrumentData,
            linkData,
          ] =
            await Promise.all([

              lcApi.getById(
                instrumentId
              ),

              fdLinkApi.getByLc(
                instrumentId
              ),
            ])


          setSelectedInstrument(
            instrumentData
          )


          setLinks(
            Array.isArray(linkData)
              ? linkData
              : []
          )
        }


      } catch (
        error
      ) {

        console.error(
          'Instrument/link load error:',
          error
        )


        setLinks(
          []
        )


        push(
          extractErrorMessage(
            error,
            'Could not load linked Fixed Deposits.'
          ),
          'error'
        )


      } finally {

        setLinksLoading(
          false
        )
      }
    }


  useEffect(
    () => {

      if (
        !selectedInstrumentId
      ) {

        setSelectedInstrument(
          null
        )

        setLinks(
          []
        )

        resetLinkForm()

        return
      }


      loadInstrumentAndLinks(
        selectedInstrumentId,
        mode
      )

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      selectedInstrumentId,
      mode,
    ]
  )


  // =========================================================
  // SELECTED FD
  // =========================================================

  const selectedFd =
    useMemo(
      () => {

        return (
          fds.find(
            (
              fd
            ) =>
              String(
                fd.id
              ) ===
              String(
                selectedFdId
              )
          ) ||
          null
        )
      },
      [
        fds,
        selectedFdId,
      ]
    )


  // =========================================================
  // TOTAL LINKED
  // =========================================================

  const totalLinked =
    useMemo(
      () => {

        return links.reduce(
          (
            total,
            link
          ) => {

            return (
              total +
              Number(
                link.linkedAmount ??
                0
              )
            )
          },
          0
        )
      },
      [
        links,
      ]
    )


  // =========================================================
  // AVAILABLE FDS
  // =========================================================

  const availableFds =
    useMemo(
      () => {

        return fds.filter(
          (
            fd
          ) => {

            const available =
              Number(
                fd.availableAmount ??
                fd.fdAmount ??
                0
              )


            return (
              fd.status !== 'CLOSED' &&
              available > 0
            )
          }
        )
      },
      [
        fds,
      ]
    )


  // =========================================================
  // AUTO FILL AMOUNT
  // =========================================================

  useEffect(
    () => {

      if (
        !selectedFd
      ) {

        setLinkedAmount(
          ''
        )

        return
      }


      const available =
        Number(
          selectedFd.availableAmount ??
          selectedFd.fdAmount ??
          0
        )


      setLinkedAmount(
        available > 0
          ? String(available)
          : ''
      )

    },
    [
      selectedFd,
    ]
  )


  // =========================================================
  // REFRESH
  // =========================================================

  const refreshEverything =
    async () => {

      try {

        const [
          fdData,
          bgData,
          lcData,
        ] =
          await Promise.all([
            fdApi.getAll(),
            bgApi.getAll(),
            lcApi.getAll(),
          ])


        setFds(
          Array.isArray(fdData)
            ? fdData
            : []
        )


        setBgs(
          Array.isArray(bgData)
            ? bgData
            : []
        )


        setLcs(
          Array.isArray(lcData)
            ? lcData
            : []
        )


        if (
          selectedInstrumentId
        ) {

          await loadInstrumentAndLinks(
            selectedInstrumentId,
            mode
          )
        }


      } catch (
        error
      ) {

        console.error(
          'FD Linking refresh error:',
          error
        )
      }
    }


  // =========================================================
  // CREATE LINK
  // =========================================================

  const handleLink =
    async () => {

      if (
        !selectedInstrumentId
      ) {

        push(
          mode === 'BG'
            ? 'Please select a Bank Guarantee.'
            : 'Please select a Letter of Credit.',
          'error'
        )

        return
      }


      if (
        !selectedFdId
      ) {

        push(
          'Please select a Fixed Deposit.',
          'error'
        )

        return
      }


      const amount =
        Number(
          linkedAmount
        )


      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {

        push(
          'Linked Amount must be greater than zero.',
          'error'
        )

        return
      }


      const available =
        Number(
          selectedFd?.availableAmount ??
          selectedFd?.fdAmount ??
          0
        )


      if (
        amount >
        available
      ) {

        push(
          `Linked Amount cannot exceed available FD balance ${formatCurrency(
            available
          )}.`,
          'error'
        )

        return
      }


      setSaving(
        true
      )


      try {

        const payload = {

          fdId:
            Number(
              selectedFdId
            ),

          linkedAmount:
            amount,

          linkedDate:
            linkedDate ||
            null,
        }


        if (
          mode === 'BG'
        ) {

          payload.bgId =
            Number(
              selectedInstrumentId
            )

        } else {

          payload.lcId =
            Number(
              selectedInstrumentId
            )
        }


        await fdLinkApi.create(
          payload
        )


        push(
          `Fixed Deposit linked successfully to ${mode}.`
        )


        resetLinkForm()


        await refreshEverything()


      } catch (
        error
      ) {

        console.error(
          'FD create link error:',
          error
        )


        push(
          extractErrorMessage(
            error,
            'Could not link Fixed Deposit.'
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
  // CONFIRM UNLINK
  // =========================================================

  const handleConfirmUnlink =
    async () => {

      if (
        !unlinkTarget?.id
      ) {

        return
      }


      const link =
        unlinkTarget


      const fd =
        getFdById(
          fds,
          link.fdId
        )


      const fdNumber =
        link.fdNo ||
        fd?.fdNumber ||
        'Fixed Deposit'


      setUnlinkingId(
        link.id
      )


      try {

        await fdLinkApi.remove(
          link.id
        )


        push(
          `${fdNumber} unlinked successfully.`
        )


        setUnlinkTarget(
          null
        )


        await refreshEverything()


      } catch (
        error
      ) {

        console.error(
          'FD unlink error:',
          error
        )


        push(
          extractErrorMessage(
            error,
            'Could not unlink Fixed Deposit.'
          ),
          'error'
        )


      } finally {

        setUnlinkingId(
          null
        )
      }
    }


  if (
    loading
  ) {

    return (
      <Loader />
    )
  }


  return (

    <div>

      <PageHeader

        eyebrow="Module"

        title="FD Linking"

        description="Pledge one or more Fixed Deposits as margin against a Bank Guarantee or Letter of Credit."
      />


      {/* ======================================================
          MODE SWITCH
      ====================================================== */}

      <div className="mb-6 flex flex-wrap gap-2">

        <Button
          type="button"

          variant={
            mode === 'BG'
              ? 'accent'
              : 'outline'
          }

          onClick={
            () =>
              handleModeChange(
                'BG'
              )
          }
        >

          <ShieldCheck
            size={16}
          />

          Against a BG

        </Button>


        <Button
          type="button"

          variant={
            mode === 'LC'
              ? 'accent'
              : 'outline'
          }

          onClick={
            () =>
              handleModeChange(
                'LC'
              )
          }
        >

          <ScrollText
            size={16}
          />

          Against an LC

        </Button>

      </div>


      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">


        {/* ====================================================
            LEFT CARD
        ==================================================== */}

        <Card>

          <div className="border-t-4 border-bg-600 pt-4">

            <Select

              label={
                mode === 'BG'
                  ? 'Select Bank Guarantee'
                  : 'Select Letter of Credit'
              }

              value={
                selectedInstrumentId
              }

              onChange={
                (
                  event
                ) => {

                  setSelectedInstrumentId(
                    event.target.value
                  )

                  resetLinkForm()
                }
              }
            >

              <option value="">
                Choose...
              </option>


              {
                mode === 'BG'

                  ? bgs.map(
                      (
                        bg
                      ) => (

                        <option
                          key={
                            bg.id
                          }

                          value={
                            bg.id
                          }
                        >

                          {
                            bg.bgNo
                          }

                          {' — '}

                          {
                            formatCurrency(
                              bg.bgAmount
                            )
                          }

                        </option>
                      )
                    )

                  : lcs.map(
                      (
                        lc
                      ) => (

                        <option
                          key={
                            lc.id
                          }

                          value={
                            lc.id
                          }
                        >

                          {
                            lc.lcNo
                          }

                          {' — '}

                          {
                            formatCurrency(
                              lc.lcAmount
                            )
                          }

                        </option>
                      )
                    )
              }

            </Select>


            {
              selectedInstrument && (

                <>

                  <div className="my-5 border-t border-border" />


                  <InstrumentInfo

                    label={
                      mode === 'BG'
                        ? 'Client'
                        : 'Beneficiary / Vendor'
                    }

                    value={
                      mode === 'BG'
                        ? selectedInstrument.clientName
                        : (
                            selectedInstrument.linkedVendorName ||
                            selectedInstrument.vendorName ||
                            selectedInstrument.beneficiaryName
                          )
                    }
                  />


                  <InstrumentInfo

                    label="Amount"

                    value={
                      formatCurrency(
                        mode === 'BG'
                          ? selectedInstrument.bgAmount
                          : selectedInstrument.lcAmount
                      )
                    }
                  />


                  <InstrumentInfo

                    label="Expiry"

                    value={
                      formatDate(
                        mode === 'BG'
                          ? selectedInstrument.expiryDate
                          : selectedInstrument.lcExpiryDate
                      )
                    }
                  />


                  <InstrumentInfo

                    label="Total Linked So Far"

                    value={
                      formatCurrency(
                        totalLinked
                      )
                    }

                    strong
                  />


                  <div className="my-5 border-t border-border" />


                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
                    Link a Fixed Deposit
                  </p>


                  <Select

                    label="Fixed Deposit"

                    value={
                      selectedFdId
                    }

                    onChange={
                      (
                        event
                      ) =>

                        setSelectedFdId(
                          event.target.value
                        )
                    }
                  >

                    <option value="">
                      Choose an FD...
                    </option>


                    {
                      availableFds.map(
                        (
                          fd
                        ) => (

                          <option
                            key={
                              fd.id
                            }

                            value={
                              fd.id
                            }
                          >

                            {
                              fd.fdNumber
                            }

                            {' · '}

                            {
                              fd.bankName ||
                              'Bank'
                            }

                            {' · Available '}

                            {
                              formatCurrency(
                                fd.availableAmount ??
                                fd.fdAmount
                              )
                            }

                          </option>
                        )
                      )
                    }

                  </Select>


                  {
                    selectedFd && (

                      <div className="mt-4 rounded-xl border border-border bg-ink-50 p-4">

                        <div className="grid grid-cols-2 gap-4">

                          <MiniStat

                            label="FD Number"

                            value={
                              selectedFd.fdNumber
                            }
                          />


                          <MiniStat

                            label="Bank"

                            value={
                              selectedFd.bankName ||
                              '—'
                            }
                          />


                          <MiniStat

                            label="FD Amount"

                            value={
                              formatCurrency(
                                selectedFd.fdAmount
                              )
                            }
                          />


                          <MiniStat

                            label="Already Linked"

                            value={
                              formatCurrency(
                                selectedFd.linkedAmount ??
                                0
                              )
                            }
                          />


                          <MiniStat

                            label="Available"

                            value={
                              formatCurrency(
                                selectedFd.availableAmount ??
                                selectedFd.fdAmount
                              )
                            }
                          />


                          <MiniStat

                            label="Maturity"

                            value={
                              formatDate(
                                selectedFd.fdMaturityDate
                              )
                            }
                          />

                        </div>

                      </div>
                    )
                  }


                  <div className="mt-4">

                    <Input

                      label="Linked Amount"

                      type="number"

                      min="0.01"

                      step="0.01"

                      value={
                        linkedAmount
                      }

                      onChange={
                        (
                          event
                        ) =>

                          setLinkedAmount(
                            event.target.value
                          )
                      }
                    />

                  </div>


                  <div className="mt-4">

                    <Input

                      label="Linked Date"

                      type="date"

                      value={
                        linkedDate
                      }

                      onChange={
                        (
                          event
                        ) =>

                          setLinkedDate(
                            event.target.value
                          )
                      }
                    />

                  </div>


                  <Button

                    type="button"

                    variant="accent"

                    className="mt-5 w-full"

                    disabled={
                      saving ||
                      !selectedFdId ||
                      !linkedAmount
                    }

                    onClick={
                      handleLink
                    }
                  >

                    <Plus
                      size={16}
                    />

                    {
                      saving
                        ? 'Linking...'
                        : 'Link Fixed Deposit'
                    }

                  </Button>

                </>
              )
            }

          </div>

        </Card>


        {/* ====================================================
            RIGHT CARD
        ==================================================== */}

        <Card>

          {
            !selectedInstrument

              ? (

                  <EmptyState

                    title="Select a BG or LC"

                    description="Select a Bank Guarantee or Letter of Credit to view and manage its linked Fixed Deposits."
                  />

                )

              : linksLoading

                ? (

                    <Loader />

                  )

                : links.length === 0

                  ? (

                      <EmptyState

                        title="No Fixed Deposits Linked"

                        description={
                          mode === 'BG'
                            ? 'This Bank Guarantee currently has no Fixed Deposit pledged against it.'
                            : 'This Letter of Credit currently has no Fixed Deposit pledged against it.'
                        }
                      />

                    )

                  : (

                      <div>

                        <div className="flex flex-wrap items-start justify-between gap-4">

                          <div>

                            <h2 className="font-display text-xl font-semibold text-ink-900">
                              Current FD Links
                            </h2>


                            <p className="mt-1 text-sm text-muted">

                              {
                                links.length
                              }

                              {' '}

                              Fixed Deposit

                              {
                                links.length === 1
                                  ? ''
                                  : 's'
                              }

                              {' · '}

                              {
                                formatCurrency(
                                  totalLinked
                                )
                              }

                              {' pledged'}

                            </p>

                          </div>


                          <div className="rounded-lg bg-ink-50 px-4 py-2">

                            <p className="text-[10px] uppercase tracking-wide text-muted">
                              Total Margin
                            </p>

                            <p className="mt-1 num font-semibold text-ink-900">

                              {
                                formatCurrency(
                                  totalLinked
                                )
                              }

                            </p>

                          </div>

                        </div>


                        <div className="mt-6 space-y-4">

                          {
                            links.map(
                              (
                                link
                              ) => {

                                const fd =
                                  getFdById(
                                    fds,
                                    link.fdId
                                  )


                                const fdNumber =
                                  link.fdNo ||
                                  fd?.fdNumber ||
                                  '—'


                                const bankName =
                                  fd?.bankName ||
                                  '—'


                                const fdAmount =
                                  Number(
                                    fd?.fdAmount ??
                                    0
                                  )


                                const fdLinkedTotal =
                                  Number(
                                    fd?.linkedAmount ??
                                    0
                                  )


                                const fdAvailable =
                                  Number(
                                    fd?.availableAmount ??
                                    fd?.fdAmount ??
                                    0
                                  )


                                const amount =
                                  Number(
                                    link.linkedAmount ??
                                    0
                                  )


                                return (

                                  <div

                                    key={
                                      link.id
                                    }

                                    className="rounded-xl border border-border bg-white p-5"
                                  >

                                    <div className="flex flex-wrap items-start justify-between gap-5">

                                      <div className="min-w-0 flex-1">

                                        <div className="flex items-center gap-2">

                                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-50 text-bg-700">

                                            <Link2
                                              size={17}
                                            />

                                          </span>


                                          <div>

                                            <p className="font-mono font-semibold text-ink-900">
                                              {fdNumber}
                                            </p>


                                            <p className="mt-0.5 text-sm text-muted">
                                              {bankName}
                                            </p>

                                          </div>

                                        </div>


                                        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">

                                          <MiniStat

                                            label="FD Amount"

                                            value={
                                              formatCurrency(
                                                fdAmount
                                              )
                                            }
                                          />


                                          <MiniStat

                                            label="This Link"

                                            value={
                                              formatCurrency(
                                                amount
                                              )
                                            }
                                          />


                                          <MiniStat

                                            label="Total FD Linked"

                                            value={
                                              formatCurrency(
                                                fdLinkedTotal
                                              )
                                            }
                                          />


                                          <MiniStat

                                            label="FD Available"

                                            value={
                                              formatCurrency(
                                                fdAvailable
                                              )
                                            }
                                          />


                                          <MiniStat

                                            label="Linked Date"

                                            value={
                                              formatDate(
                                                link.linkedDate
                                              )
                                            }
                                          />

                                        </div>

                                      </div>


                                      <button

                                        type="button"

                                        disabled={
                                          unlinkingId ===
                                          link.id
                                        }

                                        onClick={
                                          () =>
                                            setUnlinkTarget(
                                              link
                                            )
                                        }

                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3.5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                      >

                                        <Trash2
                                          size={15}
                                        />

                                        Unlink

                                      </button>

                                    </div>

                                  </div>
                                )
                              }
                            )
                          }

                        </div>


                        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">

                          <p className="text-sm text-amber-900">

                            <strong>
                              Note:
                            </strong>

                            {' '}

                            Unlinking removes only the FD margin relationship.

                            {' '}

                            The Fixed Deposit itself will not be deleted.

                          </p>

                        </div>

                      </div>
                    )
          }

        </Card>

      </div>


      {/* ======================================================
          UNLINK CONFIRM DIALOG
      ====================================================== */}

      <ConfirmDialog

        open={
          Boolean(
            unlinkTarget
          )
        }

        title="Are you sure?"

        message={
          unlinkTarget
            ? `This will unlink Fixed Deposit ${
                unlinkTarget.fdNo ||
                getFdById(
                  fds,
                  unlinkTarget.fdId
                )?.fdNumber ||
                ''
              } from this ${
                mode === 'BG'
                  ? 'Bank Guarantee'
                  : 'Letter of Credit'
              }. ${formatCurrency(
                Number(
                  unlinkTarget.linkedAmount ||
                  0
                )
              )} will be released. The Fixed Deposit itself will not be deleted.`
            : ''
        }

        confirmText="Unlink"

        loadingText="Unlinking…"

        loading={
          unlinkingId ===
          unlinkTarget?.id
        }

        onCancel={
          () => {

            if (
              !unlinkingId
            ) {

              setUnlinkTarget(
                null
              )
            }
          }
        }

        onConfirm={
          handleConfirmUnlink
        }
      />

    </div>
  )
}


// =========================================================
// FIND FD
// =========================================================

function getFdById(
  fds,
  fdId
) {

  return (
    fds.find(
      (
        fd
      ) =>
        String(
          fd.id
        ) ===
        String(
          fdId
        )
    ) ||
    null
  )
}


// =========================================================
// INSTRUMENT INFO
// =========================================================

function InstrumentInfo({
  label,
  value,
  strong = false,
}) {

  return (

    <div className="mb-3 flex items-center justify-between gap-4">

      <span className="text-sm text-muted">
        {label}
      </span>


      <span
        className={
          strong
            ? 'text-sm font-semibold text-ink-900'
            : 'text-sm font-medium text-ink-900'
        }
      >

        {
          value ||
          '—'
        }

      </span>

    </div>
  )
}


// =========================================================
// MINI STAT
// =========================================================

function MiniStat({
  label,
  value,
}) {

  return (

    <div>

      <p className="text-[10px] uppercase tracking-wide text-muted">
        {label}
      </p>


      <p className="mt-1 text-sm font-medium text-ink-900">

        {
          value === null ||
          value === undefined ||
          value === ''
            ? '—'
            : value
        }

      </p>

    </div>
  )
}


// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  title,
  description,
}) {

  return (

    <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">

      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-50 text-muted">

        <Link2
          size={24}
        />

      </span>


      <p className="mt-4 font-medium text-ink-900">
        {title}
      </p>


      <p className="mt-1 max-w-md text-sm text-muted">
        {description}
      </p>

    </div>
  )
}