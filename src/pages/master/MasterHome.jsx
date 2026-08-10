import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import { Building2, Landmark, Users, Truck, Tags } from 'lucide-react'

const tabs = [
  { to: '/master/group-companies', label: 'Group Companies', icon: Building2 },
  { to: '/master/banks', label: 'Banks', icon: Landmark },
  { to: '/master/clients', label: 'Clients', icon: Users },
  { to: '/master/vendors', label: 'Vendors', icon: Truck },
  { to: '/master/guarantee-types', label: 'Guarantee Types', icon: Tags },
]

export default function MasterHome() {
  const location = useLocation()
  const isRoot = location.pathname === '/master' || location.pathname === '/master/'

  return (
    <div>
      {isRoot && (
        <PageHeader
          eyebrow="One-time setup"
          title="Master Data"
          description="Reference lists reused across the FD, LC and BG modules — set these up first."
        />
      )}

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-ink-900 text-ink-900'
                  : 'border-transparent text-muted hover:text-ink-900'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
