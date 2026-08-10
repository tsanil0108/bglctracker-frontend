import React from 'react'
import GenericMasterPage from '../../components/common/GenericMasterPage'
import { guaranteeTypeApi } from '../../api/masterApi'
import { GUARANTEE_TYPE_CODE, GUARANTEE_TYPE_LABELS } from '../../utils/constants'

const fields = [
  {
    name: 'code',
    label: 'Code',
    required: true,
    type: 'select',
    options: Object.values(GUARANTEE_TYPE_CODE).map((c) => ({ value: c, label: c })),
  },
  { name: 'typeName', label: 'Type Name' },
  { name: 'typicalUse', label: 'Typical Use', fullWidth: true },
]

const columns = [
  { key: 'code', header: 'Code' },
  { key: 'typeName', header: 'Type Name', render: (r) => r.typeName || GUARANTEE_TYPE_LABELS[r.code] },
  { key: 'typicalUse', header: 'Typical Use' },
]

export default function GuaranteeTypes() {
  return (
    <GenericMasterPage
      title="Guarantee Type Master"
      description="PBG / ABG / CBG classifications used when issuing a Bank Guarantee."
      api={guaranteeTypeApi}
      fields={fields}
      columns={columns}
      entityLabel="Guarantee Type"
    />
  )
}
