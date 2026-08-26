import React from 'react'

import {
  Link2,
} from 'lucide-react'

import {
  Input,
  Select,
} from '../common/Field'

import {
  formatCurrency,
} from '../../utils/formatters'


export default function BgFdLinkSection({
  enabled,
  onEnabledChange,

  groupCompanyId,
  issuingBankId,

  eligibleFds = [],

  selectedFdId,
  onSelectedFdChange,

  linkedAmount,
  onLinkedAmountChange,

  errors = {},
}) {

  const selectedFd =
    eligibleFds.find(
      (fd) =>
        String(fd.id) ===
        String(selectedFdId)
    )


  const readyForFd =
    !!groupCompanyId &&
    !!issuingBankId


  return (

    <div className="sm:col-span-2 rounded-xl border border-border bg-ink-50/40 p-4">

      <div className="flex items-start justify-between gap-4">

        <div>

          <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">

            <Link2
              size={16}
            />

            Fixed Deposit / Margin

          </div>

          <p className="mt-1 text-xs text-muted">
            Only Fixed Deposits belonging to the same Group Company and issuing bank can be linked.
          </p>

        </div>


        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-900">

          <input
            type="checkbox"
            checked={enabled}
            onChange={
              (e) =>
                onEnabledChange(
                  e.target.checked
                )
            }
            className="h-4 w-4 rounded border-border"
          />

          Link FD

        </label>

      </div>


      {enabled && (

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <Select
            label="Fixed Deposit"
            required
            error={
              errors.selectedFdId
            }
            value={
              selectedFdId
            }
            disabled={
              !readyForFd
            }
            onChange={
              (e) =>
                onSelectedFdChange(
                  e.target.value
                )
            }
          >

            <option value="">

              {!groupCompanyId
                ? 'Select Group Company first…'
                : !issuingBankId
                  ? 'Select issuing bank first…'
                  : eligibleFds.length === 0
                    ? 'No eligible Fixed Deposits'
                    : 'Select fixed deposit…'
              }

            </option>


            {eligibleFds.map(
              (fd) => (

                <option
                  key={fd.id}
                  value={fd.id}
                >

                  {fd.fdNumber}
                  {' — '}
                  {fd.bankName}
                  {' — '}
                  {formatCurrency(
                    fd.availableAmount ??
                    0
                  )}
                  {' available'}

                </option>
              )
            )}

          </Select>


          <Input
            label="Amount to Link"
            type="number"
            min="0.01"
            step="0.01"
            required
            error={
              errors.linkedAmount
            }
            value={
              linkedAmount
            }
            disabled={
              !selectedFd
            }
            onChange={
              (e) =>
                onLinkedAmountChange(
                  e.target.value
                )
            }
          />


          {selectedFd && (

            <div className="sm:col-span-2 grid grid-cols-2 gap-3 rounded-lg border border-border bg-white p-3 md:grid-cols-4">

              <Info
                label="FD Number"
                value={
                  selectedFd.fdNumber
                }
              />

              <Info
                label="FD Amount"
                value={
                  formatCurrency(
                    selectedFd.fdAmount
                  )
                }
              />

              <Info
                label="Already Linked"
                value={
                  formatCurrency(
                    selectedFd.linkedAmount ??
                    0
                  )
                }
              />

              <Info
                label="Available"
                value={
                  formatCurrency(
                    selectedFd.availableAmount ??
                    0
                  )
                }
              />

            </div>
          )}

        </div>
      )}

    </div>
  )
}


function Info({
  label,
  value,
}) {

  return (

    <div>

      <div className="text-[11px] uppercase tracking-wide text-muted">
        {label}
      </div>

      <div className="mt-1 text-sm font-semibold text-ink-900">
        {value}
      </div>

    </div>
  )
}