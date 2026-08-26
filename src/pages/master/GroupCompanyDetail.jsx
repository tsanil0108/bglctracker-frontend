import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ArrowLeft,
  Building2,
  MapPin,
  Landmark,
  ShieldCheck,
  ScrollText,
  PiggyBank,
} from 'lucide-react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Loader from '../../components/common/Loader'
import StatusBadge from '../../components/common/StatusBadge'

import CompanySummaryCards from '../../components/company/CompanySummaryCards'
import CompanyExposureChart from '../../components/company/CompanyExposureChart'
import CompanyLimitChart from '../../components/company/CompanyLimitChart'
import CompanyRelationshipGraph from '../../components/company/CompanyRelationshipGraph'

import {
  groupCompanyOverviewApi,
} from '../../api/groupCompanyOverviewApi'

import {
  useToast,
} from '../../components/common/Toast'

import {
  formatCurrency,
  formatDate,
} from '../../utils/formatters'


const tabs = [
  'Overview',
  'Bank Limits',
  'Bank Guarantees',
  'Letters of Credit',
  'Fixed Deposits',
]


export default function GroupCompanyDetail() {

  const { id } =
    useParams()


  const { push } =
    useToast()


  const [
    overview,
    setOverview,
  ] =
    useState(null)


  const [
    loading,
    setLoading,
  ] =
    useState(true)


  const [
    tab,
    setTab,
  ] =
    useState(
      'Overview'
    )


  useEffect(
    () => {

      setLoading(true)


      groupCompanyOverviewApi
        .getOverview(id)

        .then(
          setOverview
        )

        .catch(
          () => {

            push(
              'Could not load company overview.',
              'error'
            )
          }
        )

        .finally(
          () =>
            setLoading(false)
        )

    },
    [
      id,
      push,
    ]
  )


  const company =
    overview?.company


  const counts =
    useMemo(
      () => ({

        'Bank Limits':
          overview
            ?.bankLimits
            ?.length ||
          0,

        'Bank Guarantees':
          overview
            ?.bankGuarantees
            ?.length ||
          0,

        'Letters of Credit':
          overview
            ?.lettersOfCredit
            ?.length ||
          0,

        'Fixed Deposits':
          overview
            ?.fixedDeposits
            ?.length ||
          0,

      }),
      [
        overview,
      ]
    )


  if (loading) {

    return (
      <Loader />
    )
  }


  if (
    !overview ||
    !company
  ) {

    return (

      <div className="rounded-xl border border-border bg-white p-6 text-sm text-muted">
        Company overview unavailable.
      </div>
    )
  }


  return (

    <div>

      {/* =========================
          HEADER
      ========================== */}

      <PageHeader

        eyebrow="Group Company"

        title={
          company.companyName
        }

        description={
          company.registeredAddress ||
          'Connected BG · LC · FD ledger overview'
        }

        actions={

          <Link
            to="/master/group-companies"
          >

            <Button
              variant="outline"
            >

              <ArrowLeft
                size={16}
              />

              Back to Companies

            </Button>

          </Link>
        }
      />


      {/* =========================
          COMPANY IDENTITY
      ========================== */}

      <Card className="mb-5">

        <div className="flex flex-wrap items-start gap-x-8 gap-y-5">


          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bg-50 text-bg-700">

              <Building2
                size={20}
              />

            </div>

            <div>

              <p className="text-xs uppercase tracking-wide text-muted">
                Company
              </p>

              <p className="mt-1 text-sm font-semibold text-ink-900">
                {company.companyName}
              </p>

            </div>

          </div>


          <Info
            label="GST"
            value={
              company.gstNo ||
              '—'
            }
          />


          <Info
            label="PAN"
            value={
              company.panNo ||
              '—'
            }
          />


          <div className="min-w-[240px] flex-1">

            <p className="text-xs uppercase tracking-wide text-muted">
              Registered Address
            </p>

            <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-900">

              <MapPin
                size={14}
                className="mt-0.5 shrink-0 text-muted"
              />

              {
                company.registeredAddress ||
                '—'
              }

            </p>

          </div>

        </div>

      </Card>


      {/* =========================
          SUMMARY CARDS
      ========================== */}

      <CompanySummaryCards
        summary={
          overview.summary
        }
      />


      {/* =========================
          TABS
      ========================== */}

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">

        {tabs.map(
          (item) => (

            <button
              key={item}

              type="button"

              onClick={
                () =>
                  setTab(item)
              }

              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === item

                  ? 'bg-ink-900 text-white'

                  : 'text-muted hover:bg-ink-50 hover:text-ink-900'
              }`}
            >

              {item}

              {
                counts[item] != null
                  ? ` (${counts[item]})`
                  : ''
              }

            </button>
          )
        )}

      </div>


      {/* =========================
          OVERVIEW
      ========================== */}

      {tab ===
        'Overview' && (

        <div className="mt-6 space-y-6">


          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            <CompanyExposureChart
              summary={
                overview.summary
              }
            />

            <CompanyLimitChart
              limits={
                overview.bankLimits ||
                []
              }
            />

          </div>


          <CompanyRelationshipGraph
            overview={
              overview
            }
          />


          {/* BANK WISE POSITION */}

          <Card>

            <div className="flex items-start justify-between gap-4">

              <div>

                <h3 className="font-display text-base font-semibold text-ink-900">
                  Bank-wise Position
                </h3>

                <p className="mt-1 text-xs text-muted">
                  Company exposure and collateral grouped by bank.
                </p>

              </div>

              <Landmark
                size={18}
                className="text-muted"
              />

            </div>


            <div className="mt-4 overflow-x-auto">

              <table className="min-w-full text-sm">

                <thead>

                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">

                    <th className="py-2 pr-4">
                      Bank
                    </th>

                    <th className="py-2 pr-4">
                      BG
                    </th>

                    <th className="py-2 pr-4">
                      LC
                    </th>

                    <th className="py-2 pr-4">
                      Total Exposure
                    </th>

                    <th className="py-2 pr-4">
                      FD
                    </th>

                    <th className="py-2">
                      FD Linked
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {
                    (
                      overview.bankExposure ||
                      []
                    ).map(
                      (row) => (

                        <tr
                          key={
                            row.bankId
                          }
                          className="border-b border-border/70"
                        >

                          <td className="py-3 pr-4 font-medium text-ink-900">
                            {row.bankName}
                          </td>

                          <td className="py-3 pr-4 num">
                            {formatCurrency(
                              row.bgAmount
                            )}
                          </td>

                          <td className="py-3 pr-4 num">
                            {formatCurrency(
                              row.lcAmount
                            )}
                          </td>

                          <td className="py-3 pr-4 num font-semibold text-ink-900">
                            {formatCurrency(
                              row.totalExposure
                            )}
                          </td>

                          <td className="py-3 pr-4 num">
                            {formatCurrency(
                              row.fdAmount
                            )}
                          </td>

                          <td className="py-3 num">
                            {formatCurrency(
                              row.fdLinkedAmount
                            )}
                          </td>

                        </tr>
                      )
                    )
                  }

                </tbody>

              </table>

            </div>

          </Card>

        </div>
      )}


      {/* =========================
          BANK LIMITS
      ========================== */}

      {tab ===
        'Bank Limits' && (

        <SimpleTable

          headers={[
            'Bank',
            'Facility',
            'Sanctioned',
            'Utilized',
            'Available',
            'Utilization',
          ]}

          rows={
            (
              overview.bankLimits ||
              []
            ).map(
              (row) => ([

                row.bankName,

                row.facilityType,

                formatCurrency(
                  row.sanctionedLimit
                ),

                formatCurrency(
                  row.utilizedLimit
                ),

                formatCurrency(
                  row.availableLimit
                ),

                `${Number(
                  row.utilizationPercent ||
                  0
                ).toFixed(2)}%`,
              ])
            )
          }
        />
      )}


      {/* =========================
          BANK GUARANTEES
      ========================== */}

      {tab ===
        'Bank Guarantees' && (

        <div className="mt-6 space-y-3">

          {
            (
              overview.bankGuarantees ||
              []
            ).length === 0 && (

              <EmptyMessage
                text="No Bank Guarantees recorded for this company."
              />
            )
          }


          {
            (
              overview.bankGuarantees ||
              []
            ).map(
              (bg) => (

                <Card
                  key={bg.id}
                >

                  <div className="flex flex-wrap items-center justify-between gap-4">


                    <div className="flex items-start gap-3">

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-50 text-bg-700">

                        <ShieldCheck
                          size={17}
                        />

                      </span>


                      <div>

                        <Link
                          className="font-medium text-bg-700 hover:underline"
                          to={
                            `/bg/${bg.id}`
                          }
                        >

                          {bg.bgNo}

                        </Link>


                        <p className="mt-1 text-xs text-muted">

                          {
                            bg.issuingBankName
                          }

                          {' · '}

                          {
                            bg.clientName
                          }

                          {' · '}

                          {
                            bg.siteProject ||
                            'No project'
                          }

                        </p>


                        <p className="mt-1 text-xs text-muted">

                          Linked FDs:{' '}

                          {
                            bg.linkedFds
                              ?.length ||
                            0
                          }

                        </p>

                      </div>

                    </div>


                    <div className="flex items-center gap-4">

                      <span className="num font-semibold text-ink-900">
                        {formatCurrency(
                          bg.bgAmount
                        )}
                      </span>

                      <StatusBadge
                        status={
                          bg.status
                        }
                      />

                    </div>

                  </div>

                </Card>
              )
            )
          }

        </div>
      )}


      {/* =========================
          LETTERS OF CREDIT
      ========================== */}

      {tab ===
        'Letters of Credit' && (

        <div className="mt-6 space-y-3">

          {
            (
              overview.lettersOfCredit ||
              []
            ).length === 0 && (

              <EmptyMessage
                text="No Letters of Credit recorded for this company."
              />
            )
          }


          {
            (
              overview.lettersOfCredit ||
              []
            ).map(
              (lc) => (

                <Card
                  key={lc.id}
                >

                  <div className="flex flex-wrap items-center justify-between gap-4">


                    <div className="flex items-start gap-3">

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lc-50 text-lc-700">

                        <ScrollText
                          size={17}
                        />

                      </span>


                      <div>

                        <Link
                          className="font-medium text-bg-700 hover:underline"
                          to={
                            `/lc/${lc.id}`
                          }
                        >

                          {lc.lcNo}

                        </Link>


                        <p className="mt-1 text-xs text-muted">

                          {
                            lc.issueBankName
                          }

                          {' · '}

                          {
                            lc.linkedVendorName ||
                            'No vendor'
                          }

                        </p>


                        <p className="mt-1 text-xs text-muted">

                          Expires{' '}

                          {
                            formatDate(
                              lc.lcExpiryDate
                            )
                          }

                          {' · '}

                          Linked FDs:{' '}

                          {
                            lc.linkedFds
                              ?.length ||
                            0
                          }

                        </p>

                      </div>

                    </div>


                    <div className="flex items-center gap-4">

                      <span className="num font-semibold text-ink-900">
                        {formatCurrency(
                          lc.lcAmount
                        )}
                      </span>

                      <StatusBadge
                        status={
                          lc.status
                        }
                      />

                    </div>

                  </div>

                </Card>
              )
            )
          }

        </div>
      )}


      {/* =========================
          FIXED DEPOSITS
      ========================== */}

      {tab ===
        'Fixed Deposits' && (

        <div className="mt-6 space-y-3">

          {
            (
              overview.fixedDeposits ||
              []
            ).length === 0 && (

              <EmptyMessage
                text="No Fixed Deposits recorded for this company."
              />
            )
          }


          {
            (
              overview.fixedDeposits ||
              []
            ).map(
              (fd) => (

                <Card
                  key={fd.id}
                >

                  <div className="flex flex-wrap items-center justify-between gap-5">


                    <div className="flex items-start gap-3">

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fd-50 text-fd-700">

                        <PiggyBank
                          size={17}
                        />

                      </span>


                      <div>

                        <p className="font-medium text-ink-900">
                          {fd.fdNumber}
                        </p>

                        <p className="mt-1 text-xs text-muted">

                          {fd.bankName}

                          {' · '}

                          Maturity{' '}

                          {
                            formatDate(
                              fd.fdMaturityDate
                            )
                          }

                        </p>

                        <div className="mt-2">

                          <StatusBadge
                            status={
                              fd.status
                            }
                          />

                        </div>

                      </div>

                    </div>


                    <div className="grid grid-cols-3 gap-6 text-right text-sm">

                      <AmountInfo
                        label="FD"
                        value={
                          fd.fdAmount
                        }
                      />

                      <AmountInfo
                        label="Linked"
                        value={
                          fd.linkedAmount
                        }
                      />

                      <AmountInfo
                        label="Available"
                        value={
                          fd.availableAmount
                        }
                      />

                    </div>

                  </div>

                </Card>
              )
            )
          }

        </div>
      )}

    </div>
  )
}


/* =========================
   SMALL HELPERS
========================== */

function Info({
  label,
  value,
}) {

  return (

    <div>

      <p className="text-xs uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-ink-900">
        {value}
      </p>

    </div>
  )
}


function AmountInfo({
  label,
  value,
}) {

  return (

    <div>

      <p className="text-xs text-muted">
        {label}
      </p>

      <p className="mt-1 num font-semibold text-ink-900">
        {formatCurrency(
          value ??
          0
        )}
      </p>

    </div>
  )
}


function EmptyMessage({
  text,
}) {

  return (

    <div className="rounded-xl border border-dashed border-border bg-white px-4 py-8 text-center">

      <p className="text-sm text-muted">
        {text}
      </p>

    </div>
  )
}


function SimpleTable({
  headers,
  rows,
}) {

  return (

    <Card className="mt-6">

      <div className="overflow-x-auto">

        <table className="min-w-full text-sm">

          <thead>

            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">

              {headers.map(
                (header) => (

                  <th
                    key={header}
                    className="py-2 pr-5"
                  >
                    {header}
                  </th>
                )
              )}

            </tr>

          </thead>


          <tbody>

            {rows.length === 0 ? (

              <tr>

                <td
                  colSpan={
                    headers.length
                  }
                  className="py-8 text-center text-sm text-muted"
                >
                  No records available.
                </td>

              </tr>

            ) : (

              rows.map(
                (
                  row,
                  rowIndex
                ) => (

                  <tr
                    key={
                      rowIndex
                    }
                    className="border-b border-border/70"
                  >

                    {row.map(
                      (
                        cell,
                        cellIndex
                      ) => (

                        <td
                          key={
                            cellIndex
                          }
                          className="py-3 pr-5 text-ink-900"
                        >
                          {cell}
                        </td>
                      )
                    )}

                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

    </Card>
  )
}