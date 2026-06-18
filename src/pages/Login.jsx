import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, WifiOff, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthShell from '../components/AuthShell'
import { Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { authErrorMessage, isNetworkError } from '../lib/authErrors'

export default function Login() {
  const { login, isAuthed, isApproved } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [netErr, setNetErr] = useState(false)

  // Always land on the dashboard after signing in (incl. a persisted session).
  useEffect(() => {
    if (isAuthed && isApproved) navigate('/app/dashboard', { replace: true })
  }, [isAuthed, isApproved, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setNetErr(false)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      toast.error(authErrorMessage(err))
      if (isNetworkError(err)) setNetErr(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <h2 className="text-3xl font-extrabold tracking-tight text-ink-900">Sign in</h2>
      <p className="mt-1 text-sm text-ink-500">Access your organization's safety portal.</p>

      {netErr && (
        <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <p className="flex items-center gap-1.5 font-bold"><WifiOff size={15} /> Couldn't reach the sign-in service</p>
          <p className="mt-1 text-xs text-red-600/90">A VPN, antivirus HTTPS scanning, ad-blocker, or firewall may be blocking Google. Run a quick check to find out.</p>
          <Link to="/diagnostics" className="mt-2 inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
            <Activity size={13} /> Run connection check
          </Link>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="email"
              required
              autoComplete="email"
              className="input pl-9"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Password</label>
            <Link to="/forgot-password" className="text-sm font-semibold text-brand-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="password"
              required
              autoComplete="current-password"
              className="input pl-9"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? <Spinner size={18} /> : (<>Sign in <ArrowRight size={16} /></>)}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-ink-500">
        <p>
          New teammate?{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:underline">
            Join your organization
          </Link>
        </p>
        <p>
          Setting up a new company?{' '}
          <Link to="/register-org" className="font-semibold text-brand-600 hover:underline">
            Register an organization
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
