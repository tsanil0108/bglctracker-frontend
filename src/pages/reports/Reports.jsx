import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  FileBarChart2,
  FileSpreadsheet,
  FileDown,
  Printer,
} from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'

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
  reportExportApi,
} from '../../api/reportExportApi'

import {
  extractErrorMessage,
} from '../../api/axiosClient'

import {
  formatCurrency,
  formatDate,
} from '../../utils/formatters'


// =========================================================
// INLINE PRINT CSS
// =========================================================

const printStyles = `
  @media screen {
    .print-only {
      display: none !important;
    }
  }

  @media print {

    @page {
      size: A4 landscape;
      margin: 10mm;
    }

    html,
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      width: 100% !important;
      height: auto !important;
    }

    /*
     * Hide entire application.
     */
    body * {
      visibility: hidden !important;
    }

    /*
     * Show report only.
     */
    .report-print-area,
    .report-print-area * {
      visibility: visible !important;
    }

    .report-print-area {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;

      width: 100% !important;
      max-width: none !important;

      margin: 0 !important;
      padding: 0 !important;

      border: none !important;
      border-radius: 0 !important;

      box-shadow: none !important;

      background: #ffffff !important;

      overflow: visible !important;
    }

    /*
     * Remove anything which should never be printed.
     */
    .no-print {
      display: none !important;
    }

    /*
     * Header shown only in print.
     */
    .print-only {
      display: block !important;
    }

    .print-report-header {
      margin-bottom: 18px !important;
      padding-bottom: 14px !important;

      border-bottom: 2px solid #111827 !important;
    }

    .print-company-name {
      margin: 0 !important;

      font-family: Arial, Helvetica, sans-serif !important;
      font-size: 17px !important;
      font-weight: 700 !important;

      text-transform: uppercase !important;

      color: #111827 !important;
    }

    .print-report-title {
      margin: 5px 0 0 !important;

      font-family: Arial, Helvetica, sans-serif !important;
      font-size: 23px !important;
      font-weight: 700 !important;

      color: #111827 !important;
    }

    .print-report-meta {
      display: flex !important;
      flex-wrap: wrap !important;

      gap: 8px 24px !important;

      margin-top: 11px !important;

      font-family: Arial, Helvetica, sans-serif !important;
      font-size: 10px !important;

      color: #374151 !important;
    }

    .print-report-meta strong {
      color: #111827 !important;
    }

    /*
     * Remove regular card presentation.
     */
    .report-print-area {
      border: none !important;
      box-shadow: none !important;
    }

    /*
     * Remove horizontal scrolling.
     */
    .report-print-area .overflow-x-auto {
      overflow: visible !important;
    }

    /*
     * TABLE
     */
    .report-print-area table {
      width: 100% !important;

      min-width: 0 !important;

      border-collapse: collapse !important;
      table-layout: auto !important;

      font-family: Arial, Helvetica, sans-serif !important;
      font-size: 9px !important;

      color: #111827 !important;
    }

    .report-print-area thead {
      display: table-header-group !important;
    }

    .report-print-area tfoot {
      display: table-footer-group !important;
    }

    .report-print-area tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .report-print-area th {
      padding: 7px 5px !important;

      border: 1px solid #9ca3af !important;

      background: #f3f4f6 !important;

      font-size: 8.5px !important;
      font-weight: 700 !important;

      text-align: left !important;
      text-transform: uppercase !important;

      white-space: nowrap !important;

      color: #111827 !important;
    }

    .report-print-area td {
      padding: 7px 5px !important;

      border: 1px solid #d1d5db !important;

      vertical-align: top !important;

      color: #111827 !important;
    }

    .report-print-area .num {
      white-space: nowrap !important;
    }

    /*
     * Override application text colors.
     */
    .report-print-area .text-muted,
    .report-print-area .text-ink-900,
    .report-print-area .text-bg-700 {
      color: #111827 !important;
    }

    /*
     * Bottom report summary.
     */
    .print-summary {
      display: flex !important;
      justify-content: flex-end !important;

      margin-top: 16px !important;
    }

    .print-summary-box {
      min-width: 260px !important;

      padding: 10px 14px !important;

      border: 1px solid #9ca3af !important;

      font-family: Arial, Helvetica, sans-serif !important;

      background: #ffffff !important;
    }

    .print-summary-label {
      font-size: 9px !important;
      font-weight: 600 !important;

      text-transform: uppercase !important;

      color: #4b5563 !important;
    }

    .print-summary-value {
      margin-top: 4px !important;

      font-size: 17px !important;
      font-weight: 700 !important;

      color: #111827 !important;
    }

    /*
     * Prevent browser from printing link URLs.
     */
    a[href]::after {
      content: none !important;
    }
  }
`


// =========================================================
// REPORTS
// =========================================================

export default function Reports() {

  const { push } =
    useToast()


  // =======================================================
  // DATA
  // =======================================================

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


  // =======================================================
  // FILTERS
  // =======================================================

  const [
    companyId,
    setCompanyId,
  ] =
    useState('')


  const [
    reportType,
    setReportType,
  ] =
    useState('BG')


  // =======================================================
  // LOADING
  // =======================================================

  const [
    loading,
    setLoading,
  ] =
    useState(true)


  const [
    exportingExcel,
    setExportingExcel,
  ] =
    useState(false)


  const [
    exportingCsv,
    setExportingCsv,
  ] =
    useState(false)


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(
    () => {

      loadAll()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  )


  // =======================================================
  // LOAD
  // =======================================================

  const loadAll =
    async () => {

      setLoading(
        true
      )


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


      } catch (err) {

        push(
          extractErrorMessage(
            err,
            'Could not load report data.'
          ),
          'error'
        )


      } finally {

        setLoading(
          false
        )
      }
    }


  // =======================================================
  // SELECTED COMPANY
  // =======================================================

  const selectedCompany =
    useMemo(
      () =>

        companies.find(
          (
            company
          ) =>

            String(
              company.id
            ) ===
            String(
              companyId
            )
        ),

      [
        companies,
        companyId,
      ]
    )


  // =======================================================
  // FILTER REPORT ROWS
  // =======================================================

  const rows =
    useMemo(
      () => {

        let source =
          []


        if (
          reportType ===
          'BG'
        ) {

          source =
            bgs

        } else if (
          reportType ===
          'LC'
        ) {

          source =
            lcs

        } else {

          source =
            fds
        }


        if (
          !companyId
        ) {

          return source
        }


        return source.filter(
          (
            row
          ) =>

            String(
              row.groupCompanyId
            ) ===
            String(
              companyId
            )
        )

      },
      [
        reportType,
        companyId,
        bgs,
        lcs,
        fds,
      ]
    )


  // =======================================================
  // TOTAL AMOUNT
  // =======================================================

  const totalAmount =
    useMemo(
      () =>

        rows.reduce(
          (
            sum,
            row
          ) => {

            if (
              reportType ===
              'BG'
            ) {

              return (
                sum +
                Number(
                  row.bgAmount ||
                  0
                )
              )
            }


            if (
              reportType ===
              'LC'
            ) {

              return (
                sum +
                Number(
                  row.lcAmount ||
                  0
                )
              )
            }


            return (
              sum +
              Number(
                row.fdAmount ||
                0
              )
            )
          },

          0
        ),

      [
        rows,
        reportType,
      ]
    )


  // =======================================================
  // REPORT TITLE
  // =======================================================

  const reportTitle =
    useMemo(
      () => {

        if (
          reportType ===
          'BG'
        ) {

          return 'Bank Guarantee Register'
        }


        if (
          reportType ===
          'LC'
        ) {

          return 'Letter of Credit Register'
        }


        return 'Fixed Deposit Register'

      },
      [
        reportType,
      ]
    )


  // =======================================================
  // REPORT COMPANY
  // =======================================================

  const reportCompanyName =
    selectedCompany?.companyName ||
    'All Group Companies'


  // =======================================================
  // GENERATED DATE
  // =======================================================

  const generatedDate =
    new Intl.DateTimeFormat(
      'en-IN',
      {
        day:
          '2-digit',

        month:
          'short',

        year:
          'numeric',

        hour:
          '2-digit',

        minute:
          '2-digit',
      }
    ).format(
      new Date()
    )


  // =======================================================
  // EXCEL / CSV
  // =======================================================

  const handleDownload =
    async (
      format
    ) => {

      const isExcel =
        format ===
        'xlsx'


      if (
        isExcel
      ) {

        setExportingExcel(
          true
        )

      } else {

        setExportingCsv(
          true
        )
      }


      try {

        const response =
          await reportExportApi.download({

            type:
              reportType,

            format,

            groupCompanyId:
              companyId
                ? Number(
                    companyId
                  )
                : null,
          })


        const disposition =
          response.headers[
            'content-disposition'
          ]


        let fileName =
          `${
            reportType.toLowerCase()
          }-report.${
            format === 'xlsx'
              ? 'xlsx'
              : 'csv'
          }`


        if (
          disposition
        ) {

          const match =
            disposition.match(
              /filename="?([^"]+)"?/i
            )


          if (
            match?.[1]
          ) {

            fileName =
              match[1]
          }
        }


        const blob =
          new Blob(
            [
              response.data,
            ],
            {
              type:
                response.headers[
                  'content-type'
                ] ||
                'application/octet-stream',
            }
          )


        const url =
          window.URL.createObjectURL(
            blob
          )


        const anchor =
          document.createElement(
            'a'
          )


        anchor.href =
          url


        anchor.download =
          fileName


        document.body.appendChild(
          anchor
        )


        anchor.click()


        anchor.remove()


        window.URL.revokeObjectURL(
          url
        )


        push(
          `${
            isExcel
              ? 'Excel'
              : 'CSV'
          } report exported.`
        )


      } catch (err) {

        push(
          extractErrorMessage(
            err,
            'Could not export report.'
          ),
          'error'
        )


      } finally {

        setExportingExcel(
          false
        )


        setExportingCsv(
          false
        )
      }
    }


  // =======================================================
  // PRINT / PDF
  // =======================================================

  const handlePrint =
    () => {

      /*
       * Browser print dialog remains useful because
       * user can select:
       *
       * Printer
       * or
       * Save as PDF
       *
       * CSS ensures ONLY .report-print-area is printed.
       */

      window.print()
    }


  // =======================================================
  // LOADING
  // =======================================================

  if (
    loading
  ) {

    return (
      <Loader />
    )
  }


  // =======================================================
  // PAGE
  // =======================================================

  return (

    <>

      {/* INLINE PRINT CSS */}

      <style>
        {printStyles}
      </style>


      <div>

        {/* ===================================================
            SCREEN HEADER
        =================================================== */}

        <div className="no-print">

          <PageHeader

            eyebrow="Reporting"

            title="Reports"

            description="Company-wise BG, LC and Fixed Deposit registers with Excel, CSV and print export."

            actions={

              <div className="flex flex-wrap gap-2">

                {/* EXCEL */}

                <Button

                  type="button"

                  variant="outline"

                  disabled={
                    exportingExcel
                  }

                  onClick={
                    () =>
                      handleDownload(
                        'xlsx'
                      )
                  }
                >

                  <FileSpreadsheet
                    size={16}
                  />

                  {
                    exportingExcel
                      ? 'Exporting…'
                      : 'Excel'
                  }

                </Button>


                {/* CSV */}

                <Button

                  type="button"

                  variant="outline"

                  disabled={
                    exportingCsv
                  }

                  onClick={
                    () =>
                      handleDownload(
                        'csv'
                      )
                  }
                >

                  <FileDown
                    size={16}
                  />

                  {
                    exportingCsv
                      ? 'Exporting…'
                      : 'CSV'
                  }

                </Button>


                {/* PRINT */}

                <Button

                  type="button"

                  variant="outline"

                  onClick={
                    handlePrint
                  }
                >

                  <Printer
                    size={16}
                  />

                  Print / PDF

                </Button>

              </div>
            }
          />

        </div>


        {/* ===================================================
            SCREEN FILTER CARD
        =================================================== */}

        <div className="no-print">

          <Card className="mb-6">

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* REPORT TYPE */}

              <Select

                label="Report Type"

                value={
                  reportType
                }

                onChange={
                  (
                    event
                  ) =>
                    setReportType(
                      event.target.value
                    )
                }
              >

                <option value="BG">
                  Bank Guarantees
                </option>

                <option value="LC">
                  Letters of Credit
                </option>

                <option value="FD">
                  Fixed Deposits
                </option>

              </Select>


              {/* COMPANY */}

              <Select

                label="Group Company"

                value={
                  companyId
                }

                onChange={
                  (
                    event
                  ) =>
                    setCompanyId(
                      event.target.value
                    )
                }
              >

                <option value="">
                  All Companies
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


              {/* TOTAL */}

              <div className="rounded-xl border border-border bg-ink-50/40 p-4">

                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Total Amount
                </p>


                <p className="mt-2 num text-xl font-semibold text-ink-900">

                  {
                    formatCurrency(
                      totalAmount
                    )
                  }

                </p>


                <p className="mt-1 text-xs text-muted">

                  {
                    rows.length
                  }

                  {' '}

                  {
                    rows.length ===
                    1
                      ? 'record'
                      : 'records'
                  }

                </p>

              </div>

            </div>


            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">

              <div>

                <p className="text-sm font-medium text-ink-900">
                  {reportTitle}
                </p>


                <p className="mt-1 text-xs text-muted">
                  {reportCompanyName}
                </p>

              </div>


              <p className="text-xs text-muted">
                Excel and CSV files are generated by the backend from live ledger data.
              </p>

            </div>

          </Card>

        </div>


        {/* ===================================================
            ACTUAL REPORT
        =================================================== */}

        <Card className="report-print-area">

          {/* =================================================
              PRINT HEADER
          ================================================= */}

          <div className="print-only print-report-header">

            <p className="print-company-name">
              {reportCompanyName}
            </p>


            <h1 className="print-report-title">
              {reportTitle}
            </h1>


            <div className="print-report-meta">

              <span>
                <strong>
                  Generated:
                </strong>{' '}
                {generatedDate}
              </span>


              <span>
                <strong>
                  Records:
                </strong>{' '}
                {rows.length}
              </span>


              <span>
                <strong>
                  Total Amount:
                </strong>{' '}
                {formatCurrency(
                  totalAmount
                )}
              </span>

            </div>

          </div>


          {/* =================================================
              SCREEN REPORT TITLE
          ================================================= */}

          <div className="no-print flex items-center gap-2">

            <FileBarChart2
              size={18}
              className="text-muted"
            />


            <h3 className="font-display text-base font-semibold text-ink-900">

              {reportTitle}

            </h3>

          </div>


          {/* =================================================
              REPORT TABLE
          ================================================= */}

          <div className="mt-5 overflow-x-auto">

            {
              reportType ===
              'BG'

                ? (

                    <BgReport
                      rows={
                        rows
                      }
                    />

                  )

                : reportType ===
                  'LC'

                  ? (

                      <LcReport
                        rows={
                          rows
                        }
                      />

                    )

                  : (

                      <FdReport
                        rows={
                          rows
                        }
                      />

                    )
            }

          </div>


          {/* =================================================
              PRINT TOTAL
          ================================================= */}

          <div className="print-only print-summary">

            <div className="print-summary-box">

              <p className="print-summary-label">
                Total Report Amount
              </p>


              <p className="print-summary-value">

                {
                  formatCurrency(
                    totalAmount
                  )
                }

              </p>

            </div>

          </div>

        </Card>

      </div>

    </>
  )
}


// =========================================================
// BANK GUARANTEE REPORT
// =========================================================

function BgReport({
  rows,
}) {

  return (

    <table className="min-w-full text-sm">

      <thead>

        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">

          <th className="py-2 pr-4">
            Company
          </th>

          <th className="py-2 pr-4">
            BG No.
          </th>

          <th className="py-2 pr-4">
            Bank
          </th>

          <th className="py-2 pr-4">
            Client
          </th>

          <th className="py-2 pr-4">
            Project
          </th>

          <th className="py-2 pr-4">
            Issue
          </th>

          <th className="py-2 pr-4">
            Expiry
          </th>

          <th className="py-2 pr-4">
            Amount
          </th>

          <th className="py-2">
            Status
          </th>

        </tr>

      </thead>


      <tbody>

        {
          rows.length ===
          0

            ? (

                <EmptyRow
                  colSpan={9}
                />

              )

            : (

                rows.map(
                  (
                    row
                  ) => (

                    <tr
                      key={
                        row.id
                      }
                      className="border-b border-border/70"
                    >

                      <td className="py-3 pr-4">
                        {row.groupCompanyName || '—'}
                      </td>


                      <td className="py-3 pr-4 num font-medium text-ink-900">
                        {row.bgNo || '—'}
                      </td>


                      <td className="py-3 pr-4">
                        {row.issuingBankName || '—'}
                      </td>


                      <td className="py-3 pr-4">
                        {row.clientName || '—'}
                      </td>


                      <td className="py-3 pr-4">
                        {row.siteProject || '—'}
                      </td>


                      <td className="py-3 pr-4">

                        {
                          formatDate(
                            row.issueDate
                          )
                        }

                      </td>


                      <td className="py-3 pr-4">

                        {
                          formatDate(
                            row.expiryDate
                          )
                        }

                      </td>


                      <td className="py-3 pr-4 num font-medium">

                        {
                          formatCurrency(
                            row.bgAmount
                          )
                        }

                      </td>


                      <td className="py-3">
                        {row.status || '—'}
                      </td>

                    </tr>
                  )
                )
              )
        }

      </tbody>

    </table>
  )
}


// =========================================================
// LETTER OF CREDIT REPORT
// =========================================================

function LcReport({
  rows,
}) {

  return (

    <table className="min-w-full text-sm">

      <thead>

        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">

          <th className="py-2 pr-4">
            Company
          </th>

          <th className="py-2 pr-4">
            LC No.
          </th>

          <th className="py-2 pr-4">
            Bank
          </th>

          <th className="py-2 pr-4">
            Vendor
          </th>

          <th className="py-2 pr-4">
            Creation
          </th>

          <th className="py-2 pr-4">
            Expiry
          </th>

          <th className="py-2 pr-4">
            Amount
          </th>

          <th className="py-2">
            Status
          </th>

        </tr>

      </thead>


      <tbody>

        {
          rows.length ===
          0

            ? (

                <EmptyRow
                  colSpan={8}
                />

              )

            : (

                rows.map(
                  (
                    row
                  ) => (

                    <tr
                      key={
                        row.id
                      }
                      className="border-b border-border/70"
                    >

                      <td className="py-3 pr-4">
                        {row.groupCompanyName || '—'}
                      </td>


                      <td className="py-3 pr-4 num font-medium text-ink-900">
                        {row.lcNo || '—'}
                      </td>


                      <td className="py-3 pr-4">
                        {row.issueBankName || '—'}
                      </td>


                      <td className="py-3 pr-4">
                        {row.linkedVendorName || '—'}
                      </td>


                      <td className="py-3 pr-4">

                        {
                          formatDate(
                            row.lcCreationDate
                          )
                        }

                      </td>


                      <td className="py-3 pr-4">

                        {
                          formatDate(
                            row.lcExpiryDate
                          )
                        }

                      </td>


                      <td className="py-3 pr-4 num font-medium">

                        {
                          formatCurrency(
                            row.lcAmount
                          )
                        }

                      </td>


                      <td className="py-3">
                        {row.status || '—'}
                      </td>

                    </tr>
                  )
                )
              )
        }

      </tbody>

    </table>
  )
}


// =========================================================
// FIXED DEPOSIT REPORT
// =========================================================

function FdReport({
  rows,
}) {

  return (

    <table className="min-w-full text-sm">

      <thead>

        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">

          <th className="py-2 pr-4">
            Company
          </th>

          <th className="py-2 pr-4">
            FD No.
          </th>

          <th className="py-2 pr-4">
            Bank
          </th>

          <th className="py-2 pr-4">
            Creation
          </th>

          <th className="py-2 pr-4">
            Maturity
          </th>

          <th className="py-2 pr-4">
            FD Amount
          </th>

          <th className="py-2 pr-4">
            Linked
          </th>

          <th className="py-2 pr-4">
            Available
          </th>

          <th className="py-2">
            Status
          </th>

        </tr>

      </thead>


      <tbody>

        {
          rows.length ===
          0

            ? (

                <EmptyRow
                  colSpan={9}
                />

              )

            : (

                rows.map(
                  (
                    row
                  ) => (

                    <tr
                      key={
                        row.id
                      }
                      className="border-b border-border/70"
                    >

                      <td className="py-3 pr-4">
                        {row.groupCompanyName || '—'}
                      </td>


                      <td className="py-3 pr-4 num font-medium text-ink-900">
                        {row.fdNumber || '—'}
                      </td>


                      <td className="py-3 pr-4">
                        {row.bankName || '—'}
                      </td>


                      <td className="py-3 pr-4">

                        {
                          formatDate(
                            row.fdCreationDate
                          )
                        }

                      </td>


                      <td className="py-3 pr-4">

                        {
                          formatDate(
                            row.fdMaturityDate
                          )
                        }

                      </td>


                      <td className="py-3 pr-4 num">

                        {
                          formatCurrency(
                            row.fdAmount
                          )
                        }

                      </td>


                      <td className="py-3 pr-4 num">

                        {
                          formatCurrency(
                            row.linkedAmount ??
                            0
                          )
                        }

                      </td>


                      <td className="py-3 pr-4 num font-medium">

                        {
                          formatCurrency(
                            row.availableAmount ??
                            0
                          )
                        }

                      </td>


                      <td className="py-3">
                        {row.status || '—'}
                      </td>

                    </tr>
                  )
                )
              )
        }

      </tbody>

    </table>
  )
}


// =========================================================
// EMPTY ROW
// =========================================================

function EmptyRow({
  colSpan,
}) {

  return (

    <tr>

      <td

        colSpan={
          colSpan
        }

        className="py-10 text-center text-sm text-muted"
      >

        No records available for the selected report.

      </td>

    </tr>
  )
}