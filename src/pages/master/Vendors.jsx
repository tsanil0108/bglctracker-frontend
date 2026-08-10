import React from 'react'
import GenericMasterPage from '../../components/common/GenericMasterPage'
import { vendorApi } from '../../api/masterApi'

const fields = [
  { name: 'vendorName', label: 'Vendor Name', required: true },
  { name: 'address', label: 'Address', fullWidth: true },
  { name: 'contactPerson', label: 'Contact Person' },
  { name: 'contactNumber', label: 'Contact Number' },
  { name: 'gstNo', label: 'GST No.' },
]

const columns = [
  { key: 'vendorName', header: 'Vendor Name' },
  { key: 'address', header: 'Address' },
  { key: 'contactPerson', header: 'Contact Person' },
  { key: 'contactNumber', header: 'Contact Number' },
  { key: 'gstNo', header: 'GST No.' },
]

export default function Vendors() {
  return (
    <GenericMasterPage
      title="Vendor Master"
      description="Vendors that Letters of Credit are issued in favour of."
      api={vendorApi}
      fields={fields}
      columns={columns}
      entityLabel="Vendor"
    />
  )
}
