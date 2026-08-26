import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
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
  formatCurrency,
} from '../../utils/formatters'


export default function Exposure() {

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
    loading,
    setLoading,
  ] =
    useState(true)


  useEffect(
    () => {

      setLoading(
        true
      )


      Promise.all([
        bgApi.getAll(),
        lcApi.getAll(),
        fdApi.getAll(),
        groupCompanyApi.getAll(),
      ])

        .then(
          ([
            bgData,
            lcData,
            fdData,
            companyData,
          ]) => {

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
          }
        )

        .catch(
          () =>
            push(
              'Could not load exposure data.',
              'error'
            )
        )

        .finally(
          () =>
            setLoading(
              false
            )
        )

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  )


  const filteredBgs =
    useMemo(
      () =>

        companyId
          ? bgs.filter(
              (row) =>
                String(
                  row.groupCompanyId
                ) ===
                String(
                  companyId
                )
            )
          : bgs,

      [
        bgs,
        companyId,
      ]
    )


  const filteredLcs =
    useMemo(
      () =>

        companyId
          ? lcs.filter(
              (row) =>
                String(
                  row.groupCompanyId
                ) ===
                String(
                  companyId
                )
            )
          : lcs,

      [
        lcs,
        companyId,
      ]
    )


  const filteredFds =
    useMemo(
      () =>

        companyId
          ? fds.filter(
              (row) =>
                String(
                  row.groupCompanyId
                ) ===
                String(
                  companyId
                )
            )
          : fds,

      [
        fds,
        companyId,
      ]
    )


  const bankRows =
    useMemo(
      () => {

        const map =
          new Map()


        const ensure =
          (
            bankId,
            bankName
          ) => {

            const key =
              String(
                bankId
              )

            if (
              !map.has(
                key
              )
            ) {

              map.set(
                key,
                {
                  bankId,
                  bankName,
                  bg:
                    0,
                  lc:
                    0,
                  fd:
                    0,
                  fdLinked:
                    0,
                }
              )
            }

            return map.get(
              key
            )
          }


        filteredBgs
          .filter(
            (row) =>
              ![
                'DRAFT',
                'RELEASED',
                'CLOSED',
              ].includes(
                row.status
              )
          )
          .forEach(
            (row) => {

              const current =
                ensure(
                  row.issuingBankId,
                  row.issuingBankName
                )

              current.bg +=
                Number(
                  row.bgAmount ||
                  0
                )
            }
          )


        filteredLcs
          .filter(
            (row) =>
              ![
                'DRAFT',
                'CLOSED',
              ].includes(
                row.status
              )
          )
          .forEach(
            (row) => {

              const current =
                ensure(
                  row.issueBankId,
                  row.issueBankName
                )

              current.lc +=
                Number(
                  row.lcAmount ||
                  0
                )
            }
          )


        filteredFds
          .forEach(
            (row) => {

              const current =
                ensure(
                  row.bankId,
                  row.bankName
                )

              current.fd +=
                Number(
                  row.fdAmount ||
                  0
                )

              current.fdLinked +=
                Number(
                  row.linkedAmount ||
                  0
                )
            }
          )


        return Array
          .from(
            map.values()
          )
          .map(
            (row) => ({
              ...row,
              totalExposure:
                row.bg +
                row.lc,
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              b.totalExposure -
              a.totalExposure
          )
      },
      [
        filteredBgs,
        filteredLcs,
        filteredFds,
      ]
    )


  const totals =
    useMemo(
      () =>

        bankRows.reduce(
          (
            acc,
            row
          ) => ({

            bg:
              acc.bg +
              row.bg,

            lc:
              acc.lc +
              row.lc,

            fd:
              acc.fd +
              row.fd,

            fdLinked:
              acc.fdLinked +
              row.fdLinked,

            totalExposure:
              acc.totalExposure +
              row.totalExposure,
          }),

          {
            bg:
              0,
            lc:
              0,
            fd:
              0,
            fdLinked:
              0,
            totalExposure:
              0,
          }
        ),

      [
        bankRows,
      ]
    )


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

        eyebrow="Risk View"

        title="Exposure"

        description="Company-wise and bank-wise BG / LC exposure with FD collateral position."

        actions={

          <div className="w-72">

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

          </div>
        }
      />


      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">

        <Metric
          label="BG Exposure"
          value={
            totals.bg
          }
        />

        <Metric
          label="LC Exposure"
          value={
            totals.lc
          }
        />

        <Metric
          label="Total Exposure"
          value={
            totals.totalExposure
          }
        />

        <Metric
          label="FD Value"
          value={
            totals.fd
          }
        />

        <Metric
          label="FD Under Lien"
          value={
            totals.fdLinked
          }
        />

      </div>


      <Card className="mt-6">

        <h3 className="font-display text-base font-semibold text-ink-900">
          Bank-wise Exposure
        </h3>

        <p className="mt-1 text-xs text-muted">
          Outstanding BG + LC position and supporting Fixed Deposits.
        </p>


        <div className="mt-5 overflow-x-auto">

          <table className="min-w-full text-sm">

            <thead>

              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">

                <th className="py-2 pr-5">
                  Bank
                </th>

                <th className="py-2 pr-5">
                  BG
                </th>

                <th className="py-2 pr-5">
                  LC
                </th>

                <th className="py-2 pr-5">
                  Total Exposure
                </th>

                <th className="py-2 pr-5">
                  FD Value
                </th>

                <th className="py-2">
                  FD Linked
                </th>

              </tr>

            </thead>


            <tbody>

              {bankRows.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="py-8 text-center text-muted"
                  >
                    No exposure data available.
                  </td>

                </tr>

              ) : (

                bankRows.map(
                  (row) => (

                    <tr
                      key={
                        row.bankId
                      }
                      className="border-b border-border/70"
                    >

                      <td className="py-3 pr-5 font-medium text-ink-900">
                        {row.bankName}
                      </td>

                      <td className="py-3 pr-5 num">
                        {formatCurrency(
                          row.bg
                        )}
                      </td>

                      <td className="py-3 pr-5 num">
                        {formatCurrency(
                          row.lc
                        )}
                      </td>

                      <td className="py-3 pr-5 num font-semibold">
                        {formatCurrency(
                          row.totalExposure
                        )}
                      </td>

                      <td className="py-3 pr-5 num">
                        {formatCurrency(
                          row.fd
                        )}
                      </td>

                      <td className="py-3 num">
                        {formatCurrency(
                          row.fdLinked
                        )}
                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  )
}


function Metric({
  label,
  value,
}) {

  return (

    <Card>

      <p className="text-xs uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-2 num text-xl font-semibold text-ink-900">
        {formatCurrency(
          value
        )}
      </p>

    </Card>
  )
}