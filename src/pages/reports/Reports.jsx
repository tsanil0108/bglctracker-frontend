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


export default function Reports() {

  const { push } =
    useToast()


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


  const [
    reportType,
    setReportType,
  ] =
    useState('BG')


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


  useEffect(
    () => {

      loadAll()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  )


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
          bgData
        )

        setLcs(
          lcData
        )

        setFds(
          fdData
        )

        setCompanies(
          companyData
        )

      } catch (
        err
      ) {

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


  const selectedCompany =
    useMemo(
      () =>

        companies.find(
          (company) =>
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


  const rows =
    useMemo(
      () => {

        let source = []


        if (
          reportType === 'BG'
        ) {

          source =
            bgs
        }

        else if (
          reportType === 'LC'
        ) {

          source =
            lcs
        }

        else {

          source =
            fds
        }


        if (
          !companyId
        ) {

          return source
        }


        return source.filter(
          (row) =>
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

      } catch (
        err
      ) {

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


  const handlePrint =
    () => {

      window.print()
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

        eyebrow="Reporting"

        title="Reports"

        description="Company-wise BG, LC and Fixed Deposit registers with Excel, CSV and print export."

        actions={

          <div className="flex flex-wrap gap-2">

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


      <Card className="mb-6">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <Select
            label="Report Type"
            value={
              reportType
            }
            onChange={
              (e) =>
                setReportType(
                  e.target.value
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


          <Select
            label="Group Company"
            value={
              companyId
            }
            onChange={
              (e) =>
                setCompanyId(
                  e.target.value
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

                  {company.companyName}

                </option>
              )
            )}

          </Select>


          <div className="rounded-xl border border-border bg-ink-50/40 p-4">

            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Total Amount
            </p>

            <p className="mt-2 num text-xl font-semibold text-ink-900">

              {formatCurrency(
                totalAmount
              )}

            </p>

            <p className="mt-1 text-xs text-muted">

              {rows.length}

              {' '}

              {
                rows.length === 1
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

              {
                selectedCompany
                  ?.companyName ||
                'All Group Companies'
              }

            </p>

          </div>


          <p className="text-xs text-muted">

            Excel and CSV files are generated by the backend from live ledger data.

          </p>

        </div>

      </Card>


      <Card>

        <div className="flex items-center gap-2">

          <FileBarChart2
            size={18}
            className="text-muted"
          />

          <h3 className="font-display text-base font-semibold text-ink-900">

            {reportTitle}

          </h3>

        </div>


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

      </Card>

    </div>
  )
}


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

        {rows.length === 0 ? (

          <EmptyRow
            colSpan={9}
          />

        ) : (

          rows.map(
            (row) => (

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
                  {row.bgNo}
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
                  {formatDate(
                    row.issueDate
                  )}
                </td>

                <td className="py-3 pr-4">
                  {formatDate(
                    row.expiryDate
                  )}
                </td>

                <td className="py-3 pr-4 num font-medium">
                  {formatCurrency(
                    row.bgAmount
                  )}
                </td>

                <td className="py-3">
                  {row.status || '—'}
                </td>

              </tr>
            )
          )
        )}

      </tbody>

    </table>
  )
}


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

        {rows.length === 0 ? (

          <EmptyRow
            colSpan={8}
          />

        ) : (

          rows.map(
            (row) => (

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
                  {row.lcNo}
                </td>

                <td className="py-3 pr-4">
                  {row.issueBankName || '—'}
                </td>

                <td className="py-3 pr-4">
                  {row.linkedVendorName || '—'}
                </td>

                <td className="py-3 pr-4">
                  {formatDate(
                    row.lcCreationDate
                  )}
                </td>

                <td className="py-3 pr-4">
                  {formatDate(
                    row.lcExpiryDate
                  )}
                </td>

                <td className="py-3 pr-4 num font-medium">
                  {formatCurrency(
                    row.lcAmount
                  )}
                </td>

                <td className="py-3">
                  {row.status || '—'}
                </td>

              </tr>
            )
          )
        )}

      </tbody>

    </table>
  )
}


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

        {rows.length === 0 ? (

          <EmptyRow
            colSpan={9}
          />

        ) : (

          rows.map(
            (row) => (

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
                  {row.fdNumber}
                </td>

                <td className="py-3 pr-4">
                  {row.bankName || '—'}
                </td>

                <td className="py-3 pr-4">
                  {formatDate(
                    row.fdCreationDate
                  )}
                </td>

                <td className="py-3 pr-4">
                  {formatDate(
                    row.fdMaturityDate
                  )}
                </td>

                <td className="py-3 pr-4 num">
                  {formatCurrency(
                    row.fdAmount
                  )}
                </td>

                <td className="py-3 pr-4 num">
                  {formatCurrency(
                    row.linkedAmount ??
                    0
                  )}
                </td>

                <td className="py-3 pr-4 num font-medium">
                  {formatCurrency(
                    row.availableAmount ??
                    0
                  )}
                </td>

                <td className="py-3">
                  {row.status || '—'}
                </td>

              </tr>
            )
          )
        )}

      </tbody>

    </table>
  )
}


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