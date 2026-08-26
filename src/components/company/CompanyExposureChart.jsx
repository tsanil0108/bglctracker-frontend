import React from 'react'

import Card from '../common/Card'

import {
  formatCurrency,
} from '../../utils/formatters'


export default function CompanyExposureChart({
  summary = {},
}) {

  const rows = [

    {
      label:
        'Bank Guarantees',

      value:
        Number(
          summary.totalActiveBgAmount ||
          0
        ),
    },

    {
      label:
        'Letters of Credit',

      value:
        Number(
          summary.totalActiveLcAmount ||
          0
        ),
    },

    {
      label:
        'FD Under Lien',

      value:
        Number(
          summary.totalFdLinkedAmount ||
          0
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

    <Card>

      <div className="flex items-start justify-between gap-4">

        <div>

          <h3 className="font-display text-base font-semibold text-ink-900">
            Exposure Breakdown
          </h3>

          <p className="mt-1 text-xs text-muted">
            Current BG, LC and FD lien position for this company.
          </p>

        </div>

      </div>


      <div className="mt-6 space-y-5">

        {rows.map(
          (row) => {

            const percentage =
              row.value === 0
                ? 0
                : (
                    row.value /
                    max
                  ) * 100


            return (

              <div
                key={row.label}
              >

                <div className="mb-2 flex items-center justify-between gap-4">

                  <span className="text-sm text-muted">
                    {row.label}
                  </span>

                  <span className="num text-sm font-semibold text-ink-900">
                    {formatCurrency(
                      row.value
                    )}
                  </span>

                </div>


                <div className="h-2.5 overflow-hidden rounded-full bg-ink-50">

                  <div
                    className="h-full rounded-full bg-bg-600 transition-all duration-300"
                    style={{
                      width:
                        `${Math.max(
                          row.value > 0
                            ? 2
                            : 0,
                          percentage
                        )}%`,
                    }}
                  />

                </div>

              </div>
            )
          }
        )}

      </div>

    </Card>
  )
}