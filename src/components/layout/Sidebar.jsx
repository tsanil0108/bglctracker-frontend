import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Landmark,
  ScrollText,
  ShieldCheck,
  Link2,
  FileBarChart2,
  Database,
  Building2,
  Users,
  Truck,
  Tags,
  ChevronDown,
  X,
  BookOpenText,
} from 'lucide-react'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/fd', label: 'FD Tracker', icon: Landmark, tab: 'fd' },
  { to: '/lc', label: 'Letters of Credit', icon: ScrollText, tab: 'lc' },
  { to: '/bg', label: 'Bank Guarantees', icon: ShieldCheck, tab: 'bg' },
  { to: '/fd-linking', label: 'FD Linking', icon: Link2 },
  { to: '/reports', label: 'Reports', icon: FileBarChart2 },
]

const masterLinks = [
  { to: '/master/group-companies', label: 'Group Companies', icon: Building2 },
  { to: '/master/banks', label: 'Banks', icon: Landmark },
  { to: '/master/clients', label: 'Clients', icon: Users },
  { to: '/master/vendors', label: 'Vendors', icon: Truck },
  { to: '/master/guarantee-types', label: 'Guarantee Types', icon: Tags },
]

const tabDot = {
  fd: 'bg-fd-600',
  lc: 'bg-lc-600',
  bg: 'bg-bg-600',
}

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
    isActive
      ? 'bg-bg-50 text-bg-700 font-medium'
      : 'text-muted hover:bg-ink-50 hover:text-ink-900'
  }`

export default function Sidebar({ open, onClose }) {
  const location = useLocation()
  const onMasterRoute = location.pathname.startsWith('/master')
  const [masterOpen, setMasterOpen] = useState(onMasterRoute)

  useEffect(() => {
    if (onMasterRoute) setMasterOpen(true)
  }, [onMasterRoute])

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-ink-900/30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-600 text-white">
              <BookOpenText size={17} />
            </span>
            <div>
              <p className="font-display text-lg font-semibold leading-none tracking-tight text-ink-900">Ledger</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-muted">BG · LC · FD Tracker</p>
            </div>
          </div>
          <button className="rounded-lg p-1 text-muted hover:bg-ink-50 lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          <NavLink to="/" end onClick={onClose} className={navItemClass}>
            <LayoutDashboard size={17} strokeWidth={1.8} />
            <span className="flex-1">Dashboard</span>
          </NavLink>

          <div>
            <button
              onClick={() => setMasterOpen((o) => !o)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                onMasterRoute ? 'bg-bg-50 text-bg-700 font-medium' : 'text-muted hover:bg-ink-50 hover:text-ink-900'
              }`}
            >
              <Database size={17} strokeWidth={1.8} />
              <span className="flex-1 text-left">Master Data</span>
              <ChevronDown size={15} className={`transition-transform ${masterOpen ? 'rotate-180' : ''}`} />
            </button>
            {masterOpen && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3.5">
                {masterLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                        isActive
                          ? 'bg-bg-50 text-bg-700 font-medium'
                          : 'text-muted hover:bg-ink-50 hover:text-ink-900'
                      }`
                    }
                  >
                    <Icon size={14} strokeWidth={1.8} />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {nav.slice(1).map(({ to, label, icon: Icon, end, tab }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} className={navItemClass}>
              <Icon size={17} strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              {tab && <span className={`h-1.5 w-1.5 rounded-full ${tabDot[tab]}`} />}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border px-5 py-4">
          <p className="text-[11px] leading-relaxed text-muted">
            Single-ledger trade finance workspace — Bank Guarantees, Letters of Credit &amp; the Fixed
            Deposits pledged against them.
          </p>
        </div>
      </aside>
    </>
  )
}