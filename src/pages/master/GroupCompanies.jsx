import React from 'react'
import GenericMasterPage from '../../components/common/GenericMasterPage'
import { groupCompanyApi } from '../../api/masterApi'

const fields = [
  { name: 'companyName', label: 'Company Name', required: true },
  { name: 'registeredAddress', label: 'Registered Address', fullWidth: true },
  { name: 'gstNo', label: 'GST No.' },
  { name: 'panNo', label: 'PAN No.' },
]

const columns = [
  { key: 'companyName', header: 'Company Name' },
  { key: 'registeredAddress', header: 'Registered Address' },
  { key: 'gstNo', header: 'GST No.' },
  { key: 'panNo', header: 'PAN No.' },
]

export default function GroupCompanies() {
  return (
    <GenericMasterPage
      title="Group Company Master"
      description="One-time setup of the group companies this ledger is maintained for."
      api={groupCompanyApi}
      fields={fields}
      columns={columns}
      entityLabel="Group Company"
    />
  )
}
