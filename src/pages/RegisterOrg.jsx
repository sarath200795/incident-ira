import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Building2, MapPin, ArrowRight, ShieldCheck, WifiOff, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthShell from '../components/AuthShell'
import { Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { authErrorMessage, isNetworkError } from '../lib/authErrors'

export default function RegisterOrg() {
  const { registerOrganization } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ orgName: '', address: '', name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [netErr, setNetErr] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setNetErr(false)
    try {
      await registerOrganization(form)
      toast.success('Organization created — you are the admin!')
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      toast.error(authErrorMessage(err))
      if (isNetworkError(err)) setNetErr(true)
    } finally {
      setBusy(false)
    }
  }

  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
  })

  return (
    <AuthShell>
      <span className="chip mb-3 bg-brand-50 text-brand-700">
        <ShieldCheck size={14} /> You become the admin
      </span>
      <h2 className="text-3xl font-extrabold tracking-tight text-ink-900">Register organization</h2>
      <p className="mt-1 text-sm text-ink-500">
        Create your company workspace. The first account is the administrator and approves teammates.
      </p>

      {netErr && (
        <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <p className="flex items-center gap-1.5 font-bold"><WifiOff size={15} /> Couldn't reach the sign-in service</p>
          <p className="mt-1 text-xs text-red-600/90">A VPN, antivirus HTTPS scanning, ad-blocker, or firewall may be blocking Google. Run a quick check to find out.</p>
          <Link to="/diagnostics" className="mt-2 inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
            <Activity size={13} /> Run connection check
          </Link>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Organization name</label>
            <div className="relative">
              <Building2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input required className="input pl-9" placeholder="Acme Facilities" {...field('orgName')} />
            </div>
          </div>
          <div>
            <label className="label">Location / Address</label>
            <div className="relative">
              <MapPin size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input className="input pl-9" placeholder="City, Country" {...field('address')} />
            </div>
          </div>
        </div>
        <div>
          <label className="label">Your name (admin)</label>
          <div className="relative">
            <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input required className="input pl-9" placeholder="Jordan Lee" {...field('name')} />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input type="email" required className="input pl-9" placeholder="you@company.com" {...field('email')} />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input type="password" required minLength={6} className="input pl-9" placeholder="At least 6 characters" {...field('password')} />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? <Spinner size={18} /> : (<>Create organization <ArrowRight size={16} /></>)}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}
