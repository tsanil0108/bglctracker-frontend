import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/common/Field'
import Button from '../components/common/Button'
import { BookOpenText } from 'lucide-react'

export default function Register() {
  const { registerAccount, loading, error } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [registrationKey, setRegistrationKey] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await registerAccount(username, password, registrationKey)
    if (ok) navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center text-white">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <BookOpenText size={22} />
          </span>
          <h1 className="font-display text-2xl font-semibold">Ledger</h1>
          <p className="mt-1 text-sm text-white/50">BG · LC · FD Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl2 bg-white p-6 shadow-xl sm:p-8">
          <h2 className="mb-1 font-display text-lg font-semibold text-ink-900">Create an account</h2>
          <p className="mb-6 text-sm text-muted">
            This workspace is single-user. You'll need the registration key configured on the server.
          </p>

          <div className="space-y-4">
            <Input
              label="Username"
              required
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Registration key"
              required
              hint="Matches app.registration.key on the backend."
              value={registrationKey}
              onChange={(e) => setRegistrationKey(e.target.value)}
            />
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <Button type="submit" variant="primary" className="mt-6 w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>

          <p className="mt-5 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-ink-900 underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
