import React from 'react'

import GenericMasterPage from '../../components/common/GenericMasterPage'

import {
  bankApi,
} from '../../api/masterApi'


// =========================================================
// BANK FORM FIELDS
// =========================================================

const fields = [

  {
    name: 'bankName',
    label: 'Bank Name',
    required: true,
  },

  {
    name: 'branch',
    label: 'Branch',
  },

  {
    name: 'ifscCode',
    label: 'IFSC Code',
  },

  {
    name: 'contactPerson',
    label: 'Contact Person',
  },

  {
    name: 'contactNumber',
    label: 'Contact Number',
  },

]


// =========================================================
// BANK TABLE COLUMNS
// =========================================================

const columns = [

  {
    key: 'bankName',
    header: 'Bank Name',
  },

  {
    key: 'branch',
    header: 'Branch',
  },

  {
    key: 'ifscCode',
    header: 'IFSC Code',
  },

  {
    key: 'contactPerson',
    header: 'Contact Person',
  },

  {
    key: 'contactNumber',
    header: 'Contact Number',
  },

]


// =========================================================
// BANK MASTER PAGE
// =========================================================

export default function Banks() {

  return (

    <GenericMasterPage

      title="Bank Master"

      description="Banks used across FD, LC and BG records — issuing banks, branches and RM contacts."

      api={
        bankApi
      }

      fields={
        fields
      }

      columns={
        columns
      }

      entityLabel="Bank"

      deleteBlockedTitle="Cannot Delete Bank"

    />
  )
}