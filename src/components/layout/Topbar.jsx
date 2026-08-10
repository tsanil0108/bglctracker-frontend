import React, { useState } from 'react'
import { Menu, LogOut, ChevronDown, UserRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-paper/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-ink-900 hover:bg-ink-50 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <p className="text-sm font-medium text-muted sm:hidden">{title}</p>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-900 hover:bg-ink-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-white">
            <UserRound size={16} />
          </span>
          <span className="hidden font-medium sm:inline">{user?.username}</span>
          <ChevronDown size={14} className="text-muted" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-border bg-white py-1 shadow-card">
              <div className="border-b border-border px-3 py-2">
                <p className="text-xs text-muted">Signed in as</p>
                <p className="truncate text-sm font-medium text-ink-900">{user?.username}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-50"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
