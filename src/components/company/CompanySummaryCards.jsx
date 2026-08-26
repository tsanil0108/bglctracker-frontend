import React from 'react'

import {
  ShieldCheck,
  ScrollText,
  Landmark,
  Link2,
  WalletCards,
  Gauge,
} from 'lucide-react'

import Card from '../common/Card'

import {
  formatCurrency,
} from '../../utils/formatters'


const items = [

  {
    label: 'Active BG',
    key: 'totalActiveBgAmount',
    icon: ShieldCheck,
  },

  {
    label: 'Active LC',
    key: 'totalActiveLcAmount',
    icon: ScrollText,
  },

  {
    label: 'Total FD',
    key: 'totalFdAmount',
    icon: Landmark,
  },

  {
    label: 'FD Linked',
    key: 'totalFdLinkedAmount',
    icon: Link2,
  },

  {
    label: 'FD Available',
    key: 'totalFdAvailableAmount',
    icon: WalletCards,
  },

  {
    label: 'BG Limit Available',
    key: 'availableBgLimit',
    icon: Gauge,
  },

  {
    label: 'LC Limit Available',
    key: 'availableLcLimit',
    icon: Gauge,
  },
]


export default function CompanySummaryCards({
  summary = {},
}) {

  return (

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

      {items.map(
        ({
          label,
          key,
          icon: Icon,
        }) => (

          <Card
            key={key}
            className="relative overflow-hidden"
          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {label}
                </p>

                <p className="mt-2 num text-xl font-semibold text-ink-900">
                  {formatCurrency(
                    summary[key] ?? 0
                  )}
                </p>

              </div>


              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-muted">

                <Icon
                  size={17}
                  strokeWidth={1.8}
                />

              </span>

            </div>

          </Card>
        )
      )}

    </div>
  )
}