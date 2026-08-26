import React from 'react'

import {
  Building2,
  Landmark,
  ShieldCheck,
  ScrollText,
  PiggyBank,
} from 'lucide-react'

import {
  Link,
} from 'react-router-dom'

import Card from '../common/Card'

import {
  formatCurrency,
} from '../../utils/formatters'


function Node({
  title,
  subtitle,
  emphasis = false,
  icon: Icon,
  to,
}) {

  const content = (

    <div
      className={`min-w-[165px] rounded-xl border px-3 py-3 shadow-sm transition ${
        emphasis

          ? 'border-bg-300 bg-bg-50'

          : 'border-border bg-white'
      } ${
        to
          ? 'hover:-translate-y-0.5 hover:shadow-md'
          : ''
      }`}
    >

      <div className="flex items-start gap-2.5">

        {Icon && (

          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-muted">

            <Icon
              size={14}
              strokeWidth={1.8}
            />

          </span>
        )}


        <div className="min-w-0">

          <p className="truncate text-sm font-semibold text-ink-900">
            {title}
          </p>

          {subtitle && (

            <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
              {subtitle}
            </p>
          )}

        </div>

      </div>

    </div>
  )


  if (to) {

    return (
      <Link to={to}>
        {content}
      </Link>
    )
  }


  return content
}


export default function CompanyRelationshipGraph({
  overview,
}) {

  const company =
    overview?.company


  const banks =
    overview?.bankExposure ||
    []


  const bankGuarantees =
    overview?.bankGuarantees ||
    []


  const lettersOfCredit =
    overview?.lettersOfCredit ||
    []


  const fixedDeposits =
    overview?.fixedDeposits ||
    []


  if (!company) {

    return null
  }


  return (

    <Card>

      <div>

        <h3 className="font-display text-base font-semibold text-ink-900">
          Connected Ledger Map
        </h3>

        <p className="mt-1 text-xs text-muted">
          Group Company → Bank → BG / LC / FD relationships.
        </p>

      </div>


      <div className="mt-6 overflow-x-auto pb-3">

        <div className="min-w-[800px]">

          {/* =========================
              COMPANY ROOT
          ========================== */}

          <div className="flex justify-center">

            <Node
              emphasis
              icon={Building2}
              title={
                company.companyName
              }
              subtitle="Group Company"
            />

          </div>


          <div className="mx-auto h-7 w-px bg-border" />


          {/* =========================
              BANKS
          ========================== */}

          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns:
                `repeat(${
                  Math.max(
                    banks.length,
                    1
                  )
                }, minmax(230px, 1fr))`,
            }}
          >

            {banks.length === 0 ? (

              <div className="col-span-full rounded-lg border border-dashed border-border py-8 text-center">

                <p className="text-sm text-muted">
                  No connected bank records yet.
                </p>

              </div>

            ) : (

              banks.map(
                (bank) => {

                  const bankBgs =
                    bankGuarantees.filter(
                      (bg) =>
                        String(
                          bg.issuingBankId
                        )
                        ===
                        String(
                          bank.bankId
                        )
                    )


                  const bankLcs =
                    lettersOfCredit.filter(
                      (lc) =>
                        String(
                          lc.issueBankId
                        )
                        ===
                        String(
                          bank.bankId
                        )
                    )


                  const bankFds =
                    fixedDeposits.filter(
                      (fd) =>
                        String(
                          fd.bankId
                        )
                        ===
                        String(
                          bank.bankId
                        )
                    )


                  return (

                    <div
                      key={bank.bankId}
                      className="flex flex-col items-center"
                    >

                      {/* BANK NODE */}

                      <Node
                        emphasis
                        icon={Landmark}
                        title={
                          bank.bankName
                        }
                        subtitle={
                          `Exposure ${formatCurrency(
                            bank.totalExposure ??
                            0
                          )}`
                        }
                      />


                      <div className="h-5 w-px bg-border" />


                      <div className="w-full space-y-2">


                        {/* =========================
                            BG NODES
                        ========================== */}

                        {bankBgs.map(
                          (bg) => (

                            <Node
                              key={
                                `bg-${bg.id}`
                              }
                              icon={
                                ShieldCheck
                              }
                              title={
                                bg.bgNo
                              }
                              subtitle={
                                `BG · ${formatCurrency(
                                  bg.bgAmount
                                )}`
                              }
                              to={
                                `/bg/${bg.id}`
                              }
                            />
                          )
                        )}


                        {/* =========================
                            LC NODES
                        ========================== */}

                        {bankLcs.map(
                          (lc) => (

                            <Node
                              key={
                                `lc-${lc.id}`
                              }
                              icon={
                                ScrollText
                              }
                              title={
                                lc.lcNo
                              }
                              subtitle={
                                `LC · ${formatCurrency(
                                  lc.lcAmount
                                )}`
                              }
                              to={
                                `/lc/${lc.id}`
                              }
                            />
                          )
                        )}


                        {/* =========================
                            FD NODES
                        ========================== */}

                        {bankFds.map(
                          (fd) => (

                            <Node
                              key={
                                `fd-${fd.id}`
                              }
                              icon={
                                PiggyBank
                              }
                              title={
                                fd.fdNumber
                              }
                              subtitle={
                                `FD ${formatCurrency(
                                  fd.fdAmount
                                )} · Linked ${formatCurrency(
                                  fd.linkedAmount ??
                                  0
                                )}`
                              }
                            />
                          )
                        )}


                        {bankBgs.length === 0 &&
                          bankLcs.length === 0 &&
                          bankFds.length === 0 && (

                            <div className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
                              No BG / LC / FD records.
                            </div>
                          )}

                      </div>

                    </div>
                  )
                }
              )
            )}

          </div>

        </div>

      </div>

    </Card>
  )
}