import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ShieldCheck,
  ScrollText,
  Landmark,
  Link2,
  Gauge,
  AlertTriangle,
} from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Loader from '../../components/common/Loader'
import StatusBadge from '../../components/common/StatusBadge'

import {
  Select,
} from '../../components/common/Field'

import {
  useToast,
} from '../../components/common/Toast'

import {
  bgApi,
} from '../../api/bgApi'

import {
  lcApi,
} from '../../api/lcApi'

import {
  fdApi,
} from '../../api/fdApi'

import {
  groupCompanyApi,
} from '../../api/masterApi'

import {
  extractErrorMessage,
} from '../../api/axiosClient'

import {
  formatCurrency,
  formatDate,
} from '../../utils/formatters'


function safeNumber(value) {

  const number =
    Number(value)

  return Number.isFinite(number)
    ? number
    : 0
}


function normalizeStatus(status) {

  return String(
    status || ''
  )
    .trim()
    .toUpperCase()
    .replaceAll('-', '_')
    .replaceAll(' ', '_')
}


function getGroupCompanyId(row) {

  return (
    row?.groupCompanyId ??
    row?.groupCompany?.id ??
    row?.companyId ??
    row?.company?.id ??
    null
  )
}


export default function Dashboard() {

  const { push } =
    useToast()


  const [
    loading,
    setLoading,
  ] =
    useState(true)


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


  const [
    companies,
    setCompanies,
  ] =
    useState([])


  const [
    companyId,
    setCompanyId,
  ] =
    useState('')


  useEffect(
    () => {

      loadDashboard()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  )


  const loadDashboard =
    async () => {

      setLoading(true)

      try {

        const [
          bgData,
          lcData,
          fdData,
          companyData,
        ] =
          await Promise.all([
            bgApi.getAll(),
            lcApi.getAll(),
            fdApi.getAll(),
            groupCompanyApi.getAll(),
          ])


        console.log(
          'DASHBOARD BG DATA:',
          bgData
        )

        console.log(
          'DASHBOARD LC DATA:',
          lcData
        )

        console.log(
          'DASHBOARD FD DATA:',
          fdData
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


        setFds(
          Array.isArray(fdData)
            ? fdData
            : []
        )


        setCompanies(
          Array.isArray(companyData)
            ? companyData
            : []
        )

      } catch (error) {

        console.error(
          'Dashboard load error:',
          error
        )


        push(
          extractErrorMessage(
            error,
            'Could not load Dashboard.'
          ),
          'error'
        )

      } finally {

        setLoading(false)
      }
    }


  const filteredBgs =
    useMemo(
      () => {

        if (!companyId) {
          return bgs
        }


        return bgs.filter(
          (row) =>

            String(
              getGroupCompanyId(
                row
              )
            ) ===
            String(
              companyId
            )
        )
      },

      [
        bgs,
        companyId,
      ]
    )


  const filteredLcs =
    useMemo(
      () => {

        if (!companyId) {
          return lcs
        }


        return lcs.filter(
          (row) =>

            String(
              getGroupCompanyId(
                row
              )
            ) ===
            String(
              companyId
            )
        )
      },

      [
        lcs,
        companyId,
      ]
    )


  const filteredFds =
    useMemo(
      () => {

        if (!companyId) {
          return fds
        }


        return fds.filter(
          (row) =>

            String(
              getGroupCompanyId(
                row
              )
            ) ===
            String(
              companyId
            )
        )
      },

      [
        fds,
        companyId,
      ]
    )


  const activeBgs =
    useMemo(
      () =>

        filteredBgs.filter(
          (bg) => {

            const status =
              normalizeStatus(
                bg.status
              )


            return (
              status !== 'DRAFT' &&
              status !== 'RELEASED' &&
              status !== 'CLOSED'
            )
          }
        ),

      [
        filteredBgs,
      ]
    )


  const activeLcs =
    useMemo(
      () =>

        filteredLcs.filter(
          (lc) => {

            const status =
              normalizeStatus(
                lc.status
              )


            return (
              status !== 'DRAFT' &&
              status !== 'CLOSED'
            )
          }
        ),

      [
        filteredLcs,
      ]
    )


  const totals =
    useMemo(
      () => {

        const bgAmount =
          activeBgs.reduce(
            (
              sum,
              row
            ) =>

              sum +
              safeNumber(
                row.bgAmount ??
                row.amount
              ),

            0
          )


        const lcAmount =
          activeLcs.reduce(
            (
              sum,
              row
            ) =>

              sum +
              safeNumber(
                row.lcAmount ??
                row.amount
              ),

            0
          )


        const fdAmount =
          filteredFds.reduce(
            (
              sum,
              row
            ) =>

              sum +
              safeNumber(
                row.fdAmount ??
                row.amount
              ),

            0
          )


        const fdLinked =
          filteredFds.reduce(
            (
              sum,
              row
            ) =>

              sum +
              safeNumber(
                row.linkedAmount ??
                row.totalLinkedAmount ??
                0
              ),

            0
          )


        const fdAvailable =
          filteredFds.reduce(
            (
              sum,
              row
            ) => {

              if (
                row.availableAmount !==
                  undefined &&
                row.availableAmount !==
                  null
              ) {

                return (
                  sum +
                  safeNumber(
                    row.availableAmount
                  )
                )
              }


              const amount =
                safeNumber(
                  row.fdAmount ??
                  row.amount
                )


              const linked =
                safeNumber(
                  row.linkedAmount ??
                  row.totalLinkedAmount
                )


              return (
                sum +
                Math.max(
                  0,
                  amount - linked
                )
              )
            },

            0
          )


        return {

          bgAmount,

          lcAmount,

          fdAmount,

          fdLinked,

          fdAvailable,

          activeBgCount:
            activeBgs.length,

          activeLcCount:
            activeLcs.length,

          fdCount:
            filteredFds.length,
        }
      },

      [
        activeBgs,
        activeLcs,
        filteredFds,
      ]
    )


  const selectedCompanyName =
    useMemo(
      () => {

        if (!companyId) {
          return 'All Companies'
        }


        return (

          companies.find(
            (company) =>

              String(
                company.id
              ) ===
              String(
                companyId
              )
          )
          ?.companyName ||
          'Selected Company'
        )
      },

      [
        companies,
        companyId,
      ]
    )


  const upcomingItems =
    useMemo(
      () => {

        const today =
          new Date()


        today.setHours(
          0,
          0,
          0,
          0
        )


        const rows = []


        activeBgs.forEach(
          (bg) => {

            if (!bg.expiryDate) {
              return
            }


            const expiry =
              new Date(
                bg.expiryDate
              )


            rows.push({

              id:
                `bg-${bg.id}`,

              type:
                'BG',

              no:
                bg.bgNo,

              date:
                bg.expiryDate,

              amount:
                safeNumber(
                  bg.bgAmount
                ),

              status:
                bg.status,

              timestamp:
                expiry.getTime(),
            })
          }
        )


        activeLcs.forEach(
          (lc) => {

            const date =
              lc.lcExpiryDate ??
              lc.expiryDate


            if (!date) {
              return
            }


            const expiry =
              new Date(date)


            rows.push({

              id:
                `lc-${lc.id}`,

              type:
                'LC',

              no:
                lc.lcNo,

              date,

              amount:
                safeNumber(
                  lc.lcAmount
                ),

              status:
                lc.status,

              timestamp:
                expiry.getTime(),
            })
          }
        )


        return rows

          .filter(
            (row) =>
              Number.isFinite(
                row.timestamp
              )
          )

          .sort(
            (
              a,
              b
            ) =>
              a.timestamp -
              b.timestamp
          )

          .slice(
            0,
            6
          )
      },

      [
        activeBgs,
        activeLcs,
      ]
    )


  if (loading) {

    return (
      <Loader />
    )
  }


  return (

    <div>

      <PageHeader

        eyebrow="Overview"

        title="Dashboard"

        description={

          companyId

            ? `Financial position for ${selectedCompanyName}.`

            : 'Consolidated BG · LC · FD position across all Group Companies.'
        }

        actions={

          <div className="w-72">

            <Select

              label="Group Company"

              value={
                companyId
              }

              onChange={
                (event) =>
                  setCompanyId(
                    event.target.value
                  )
              }
            >

              <option value="">
                All Companies
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

                    {
                      company.companyName
                    }

                  </option>
                )
              )}

            </Select>

          </div>
        }
      />


      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <SummaryCard

          icon={
            ShieldCheck
          }

          label="Active BG"

          value={
            formatCurrency(
              totals.bgAmount
            )
          }

          caption={
            `${totals.activeBgCount} active`
          }
        />


        <SummaryCard

          icon={
            ScrollText
          }

          label="Active LC"

          value={
            formatCurrency(
              totals.lcAmount
            )
          }

          caption={
            `${totals.activeLcCount} active`
          }
        />


        <SummaryCard

          icon={
            Landmark
          }

          label="Total FD"

          value={
            formatCurrency(
              totals.fdAmount
            )
          }

          caption={
            `${totals.fdCount} deposits`
          }
        />


        <SummaryCard

          icon={
            Link2
          }

          label="FD Linked"

          value={
            formatCurrency(
              totals.fdLinked
            )
          }

          caption="Under lien"
        />


        <SummaryCard

          icon={
            Gauge
          }

          label="FD Available"

          value={
            formatCurrency(
              totals.fdAvailable
            )
          }

          caption="Available balance"
        />

      </div>


      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

        <Card>

          <h3 className="font-display text-base font-semibold text-ink-900">
            Exposure Mix
          </h3>


          <p className="mt-1 text-xs text-muted">
            Outstanding financial exposure.
          </p>


          <ExposureBars

            bg={
              totals.bgAmount
            }

            lc={
              totals.lcAmount
            }

            fd={
              totals.fdLinked
            }
          />

        </Card>


        <Card>

          <div className="flex items-start justify-between gap-4">

            <div>

              <h3 className="font-display text-base font-semibold text-ink-900">
                Upcoming Expiries
              </h3>


              <p className="mt-1 text-xs text-muted">
                BG / LC instruments approaching expiry.
              </p>

            </div>


            <AlertTriangle
              size={18}
              className="text-muted"
            />

          </div>


          <div className="mt-4 space-y-3">

            {upcomingItems.length ===
            0 ? (

              <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted">
                No BG / LC expiry records available.
              </div>

            ) : (

              upcomingItems.map(
                (row) => (

                  <div

                    key={
                      row.id
                    }

                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >

                    <div>

                      <p className="text-sm font-medium text-ink-900">

                        {row.type}

                        {' · '}

                        {row.no}

                      </p>


                      <p className="mt-1 text-xs text-muted">

                        Expires{' '}

                        {
                          formatDate(
                            row.date
                          )
                        }

                      </p>

                    </div>


                    <div className="flex items-center gap-3">

                      <span className="num text-sm font-medium text-ink-900">

                        {
                          formatCurrency(
                            row.amount
                          )
                        }

                      </span>


                      <StatusBadge
                        status={
                          row.status
                        }
                      />

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </Card>

      </div>

    </div>
  )
}


function SummaryCard({
  icon: Icon,
  label,
  value,
  caption,
}) {

  return (

    <Card>

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {label}
          </p>


          <p className="mt-2 num text-xl font-semibold text-ink-900">
            {value}
          </p>


          <p className="mt-1 text-xs text-muted">
            {caption}
          </p>

        </div>


        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-muted">

          <Icon
            size={17}
          />

        </span>

      </div>

    </Card>
  )
}


function ExposureBars({
  bg,
  lc,
  fd,
}) {

  const rows = [

    {
      label:
        'Bank Guarantees',

      value:
        safeNumber(
          bg
        ),
    },

    {
      label:
        'Letters of Credit',

      value:
        safeNumber(
          lc
        ),
    },

    {
      label:
        'FD Under Lien',

      value:
        safeNumber(
          fd
        ),
    },
  ]


  const max =
    Math.max(
      ...rows.map(
        (row) =>
          row.value
      ),
      1
    )


  return (

    <div className="mt-5 space-y-4">

      {rows.map(
        (row) => {

          const width =
            row.value === 0

              ? 0

              : Math.max(
                  2,
                  (
                    row.value /
                    max
                  ) * 100
                )


          return (

            <div
              key={
                row.label
              }
            >

              <div className="mb-1.5 flex items-center justify-between text-sm">

                <span className="text-muted">
                  {row.label}
                </span>


                <span className="num font-medium text-ink-900">

                  {
                    formatCurrency(
                      row.value
                    )
                  }

                </span>

              </div>


              <div className="h-2.5 overflow-hidden rounded-full bg-ink-50">

                <div

                  className="h-full rounded-full bg-bg-600 transition-all duration-300"

                  style={{
                    width:
                      `${width}%`,
                  }}

                />

              </div>

            </div>
          )
        }
      )}

    </div>
  )
}