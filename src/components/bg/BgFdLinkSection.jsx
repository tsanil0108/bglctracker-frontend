import React, {
  useState,
} from 'react'

import {
  Link2,
  Unlink,
} from 'lucide-react'

import {
  useNavigate,
} from 'react-router-dom'

import Button from '../common/Button'
import ConfirmDialog from '../common/ConfirmDialog'

import {
  fdLinkApi,
} from '../../api/fdLinkApi'

import {
  extractErrorMessage,
} from '../../api/axiosClient'

import {
  useToast,
} from '../common/Toast'

import {
  formatCurrency,
  formatDate,
} from '../../utils/formatters'


export default function BgFdLinkSection({
  bg,
  onRefresh,
}) {

  const navigate =
    useNavigate()


  const { push } =
    useToast()


  const [
    unlinkTarget,
    setUnlinkTarget,
  ] =
    useState(null)


  const [
    unlinking,
    setUnlinking,
  ] =
    useState(false)


  const links =
    Array.isArray(
      bg?.linkedFds
    )
      ? bg.linkedFds
      : []


  const totalLinked =
    links.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.linkedAmount ||
          0
        ),
      0
    )


  const handleUnlink =
    async () => {

      if (
        !unlinkTarget?.linkId
      ) {

        push(
          'FD link ID is missing.',
          'error'
        )

        return
      }


      setUnlinking(
        true
      )


      try {

        await fdLinkApi.remove(
          unlinkTarget.linkId
        )


        push(
          `${unlinkTarget.fdNo || 'Fixed Deposit'} unlinked successfully.`
        )


        setUnlinkTarget(
          null
        )


        if (
          onRefresh
        ) {

          await onRefresh()
        }


      } catch (
        error
      ) {

        push(
          extractErrorMessage(
            error,
            'Could not unlink Fixed Deposit.'
          ),
          'error'
        )


      } finally {

        setUnlinking(
          false
        )
      }
    }


  return (

    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">

      {/* HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div className="flex items-start gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bg-50 text-bg-700">

            <Link2
              size={20}
            />

          </div>


          <div>

            <h2 className="font-display text-xl font-semibold text-ink-900">
              Linked Fixed Deposits
            </h2>


            <p className="mt-1 text-sm text-muted">
              Fixed Deposits pledged as margin against this Bank Guarantee.
            </p>

          </div>

        </div>


        <Button
          variant="outline"
          onClick={() =>
            navigate('/fd-linking')
          }
        >

          <Link2
            size={16}
          />

          Manage Links

        </Button>

      </div>


      {/* NO LINKS */}

      {
        links.length === 0
          ? (

              <div className="mt-6 rounded-xl border border-dashed border-border px-6 py-12 text-center">

                <Link2
                  size={28}
                  className="mx-auto text-muted"
                />


                <p className="mt-3 font-medium text-ink-900">
                  No Fixed Deposit linked
                </p>


                <p className="mt-1 text-sm text-muted">
                  This Bank Guarantee currently has no Fixed Deposit pledged against it.
                </p>

              </div>

            )
          : (

              <>

                {/* TABLE */}

                <div className="mt-7 overflow-x-auto">

                  <table className="w-full min-w-[950px]">

                    <thead>

                      <tr className="border-b border-border text-left">

                        <th className="px-1 py-3 text-xs font-semibold uppercase text-muted">
                          FD Number
                        </th>

                        <th className="px-3 py-3 text-xs font-semibold uppercase text-muted">
                          Bank
                        </th>

                        <th className="px-3 py-3 text-xs font-semibold uppercase text-muted">
                          FD Amount
                        </th>

                        <th className="px-3 py-3 text-xs font-semibold uppercase text-muted">
                          Linked Amount
                        </th>

                        <th className="px-3 py-3 text-xs font-semibold uppercase text-muted">
                          Available
                        </th>

                        <th className="px-3 py-3 text-xs font-semibold uppercase text-muted">
                          Maturity
                        </th>

                        <th className="px-3 py-3 text-xs font-semibold uppercase text-muted">
                          Linked Date
                        </th>

                        <th className="px-1 py-3 text-right text-xs font-semibold uppercase text-muted">
                          Action
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {
                        links.map(
                          (
                            item
                          ) => (

                            <tr
                              key={
                                item.linkId ||
                                item.fdId
                              }
                              className="border-b border-border"
                            >

                              <td className="px-1 py-5 font-mono font-semibold text-ink-900">
                                {
                                  item.fdNo ||
                                  '—'
                                }
                              </td>


                              <td className="px-3 py-5 text-sm text-ink-900">
                                {
                                  item.bankName ||
                                  '—'
                                }
                              </td>


                              <td className="px-3 py-5 num text-sm">
                                {
                                  formatCurrency(
                                    item.fdAmount ||
                                    0
                                  )
                                }
                              </td>


                              <td className="px-3 py-5 num text-sm font-semibold">
                                {
                                  formatCurrency(
                                    item.linkedAmount ||
                                    0
                                  )
                                }
                              </td>


                              <td className="px-3 py-5 num text-sm font-semibold">
                                {
                                  formatCurrency(
                                    item.availableAmount ||
                                    0
                                  )
                                }
                              </td>


                              <td className="px-3 py-5 text-sm">
                                {
                                  formatDate(
                                    item.maturityDate
                                  )
                                }
                              </td>


                              <td className="px-3 py-5 text-sm">
                                {
                                  formatDate(
                                    item.linkedDate
                                  )
                                }
                              </td>


                              <td className="px-1 py-5 text-right">

                                <button
                                  type="button"

                                  onClick={() =>
                                    setUnlinkTarget(
                                      item
                                    )
                                  }

                                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >

                                  <Unlink
                                    size={15}
                                  />

                                  Unlink

                                </button>

                              </td>

                            </tr>
                          )
                        )
                      }

                    </tbody>

                  </table>

                </div>


                {/* DELETE PROTECTION */}

                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">

                  <p className="text-sm text-amber-900">

                    <strong>
                      Delete protection:
                    </strong>

                    {' '}

                    This Bank Guarantee cannot be deleted while any Fixed Deposit is linked to it.

                    {' '}

                    Use <strong>Unlink</strong> first.

                    {' '}

                    Unlinking removes only the BG ↔ FD relationship; the Fixed Deposit itself remains safe.

                  </p>

                </div>


                {/* TOTAL */}

                <div className="mt-5 flex justify-end">

                  <div className="rounded-xl bg-ink-50 px-5 py-4">

                    <p className="text-xs uppercase tracking-wide text-muted">
                      Total FD Margin Linked
                    </p>

                    <p className="mt-1 num text-xl font-semibold text-ink-900">

                      {
                        formatCurrency(
                          totalLinked
                        )
                      }

                    </p>

                  </div>

                </div>

              </>
            )
      }


      {/* CONFIRM UNLINK */}

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
                unlinkTarget.fdNo || ''
              } from this Bank Guarantee. ${
                formatCurrency(
                  unlinkTarget.linkedAmount || 0
                )
              } will be released. The Fixed Deposit itself will not be deleted.`
            : ''
        }

        confirmText="Unlink"

        loadingText="Unlinking…"

        loading={
          unlinking
        }

        onCancel={() => {

          if (
            !unlinking
          ) {

            setUnlinkTarget(
              null
            )
          }
        }}

        onConfirm={
          handleUnlink
        }
      />

    </section>
  )
}