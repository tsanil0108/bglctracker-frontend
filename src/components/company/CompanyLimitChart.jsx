import React from 'react'

import Card from '../common/Card'

import {
  formatCurrency,
} from '../../utils/formatters'


export default function CompanyLimitChart({
  limits = [],
}) {

  return (

    <Card>

      <h3 className="font-display text-base font-semibold text-ink-900">
        Bank Limit Utilization
      </h3>

      <p className="mt-1 text-xs text-muted">
        Sanctioned versus utilized BG / LC limits.
      </p>


      <div className="mt-5 space-y-4">

        {limits.length === 0 && (

          <div className="rounded-lg border border-dashed border-border px-4 py-5 text-center">

            <p className="text-sm text-muted">
              No bank limits configured for this company.
            </p>

          </div>
        )}


        {limits.map(
          (limit) => {

            const rawPercentage =
              Number(
                limit.utilizationPercent ||
                0
              )


            const percentage =
              Math.max(
                0,
                Math.min(
                  rawPercentage,
                  100
                )
              )


            return (

              <div
                key={limit.id}
                className="rounded-xl border border-border p-4"
              >

                <div className="flex flex-wrap items-start justify-between gap-3">

                  <div>

                    <p className="text-sm font-semibold text-ink-900">

                      {limit.bankName}

                      <span className="mx-1.5 text-border">
                        ·
                      </span>

                      {limit.facilityType}

                    </p>


                    <p className="mt-1 text-xs text-muted">

                      {formatCurrency(
                        limit.utilizedLimit ??
                        0
                      )}

                      {' used of '}

                      {formatCurrency(
                        limit.sanctionedLimit ??
                        0
                      )}

                    </p>

                  </div>


                  <span className="num text-sm font-semibold text-ink-900">
                    {rawPercentage.toFixed(1)}%
                  </span>

                </div>


                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink-50">

                  <div
                    className="h-full rounded-full bg-bg-600 transition-all duration-300"
                    style={{
                      width:
                        `${percentage}%`,
                    }}
                  />

                </div>


                <div className="mt-3 flex items-center justify-between text-xs">

                  <span className="text-muted">
                    Available
                  </span>

                  <span className="num font-medium text-ink-900">
                    {formatCurrency(
                      limit.availableLimit ??
                      0
                    )}
                  </span>

                </div>

              </div>
            )
          }
        )}

      </div>

    </Card>
  )
}