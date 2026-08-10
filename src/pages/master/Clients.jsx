import React from 'react'
import GenericMasterPage from '../../components/common/GenericMasterPage'
import { clientApi } from '../../api/masterApi'

const fields = [
  { name: 'clientName', label: 'Client Name', required: true },
  { name: 'address', label: 'Address', fullWidth: true },
  { name: 'contactPerson', label: 'Contact Person' },
  { name: 'contactNumber', label: 'Contact Number' },
  { name: 'gstNo', label: 'GST No.' },
]

const columns = [
  { key: 'clientName', header: 'Client Name' },
  { key: 'address', header: 'Address' },
  { key: 'contactPerson', header: 'Contact Person' },
  { key: 'contactNumber', header: 'Contact Number' },
  { key: 'gstNo', header: 'GST No.' },
]

export default function Clients() {
  return (
    <GenericMasterPage
      title="Client Master"
      description="Clients that Bank Guarantees are issued in favour of."
      api={clientApi}
      fields={fields}
      columns={columns}
      entityLabel="Client"
    />
  )
}
