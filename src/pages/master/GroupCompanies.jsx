import React from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  ArrowUpRight,
} from 'lucide-react'

import GenericMasterPage from '../../components/common/GenericMasterPage'

import {
  groupCompanyApi,
} from '../../api/masterApi'


const fields = [

  {
    name:
      'companyName',

    label:
      'Company Name',

    required:
      true,
  },

  {
    name:
      'registeredAddress',

    label:
      'Registered Address',

    fullWidth:
      true,
  },

  {
    name:
      'gstNo',

    label:
      'GST No.',
  },

  {
    name:
      'panNo',

    label:
      'PAN No.',
  },
]


const columns = [

  {
    key:
      'companyName',

    header:
      'Company Name',

    render:
      (row) => (

        <Link
          to={
            `/master/group-companies/${row.id}`
          }
          className="group inline-flex items-center gap-1.5 font-medium text-bg-700 hover:underline"
        >

          {row.companyName}

          <ArrowUpRight
            size={13}
            className="opacity-50 transition group-hover:opacity-100"
          />

        </Link>
      ),
  },


  {
    key:
      'registeredAddress',

    header:
      'Registered Address',

    render:
      (row) =>
        row.registeredAddress ||
        '—',
  },


  {
    key:
      'gstNo',

    header:
      'GST No.',

    render:
      (row) =>
        row.gstNo ||
        '—',
  },


  {
    key:
      'panNo',

    header:
      'PAN No.',

    render:
      (row) =>
        row.panNo ||
        '—',
  },
]


export default function GroupCompanies() {

  return (

    <GenericMasterPage

      title="Group Company Master"

      description="Create company masters and click a company name to open its complete connected BG · LC · FD ledger."

      api={
        groupCompanyApi
      }

      fields={
        fields
      }

      columns={
        columns
      }

      entityLabel="Group Company"

    />
  )
}