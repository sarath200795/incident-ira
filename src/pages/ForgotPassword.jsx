import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, ArrowLeft, WifiOff, Activity, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthShell from '../components/AuthShell'
import { Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { authErrorMessage, isNetworkError } from '../lib/authErrors'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [netErr, setNetErr] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setNetErr(false)
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Reset link sent — check your inbox.')
    } catch (err) {
      toast.error(authErrorMessage(err))
      if (isNetworkError(err)) setNetErr(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <h2 className="text-3xl font-extrabold tracking-tight text-ink-900">Reset password</h2>
      <p className="mt-1 text-sm text-ink-500">
        Enter your email and we'll send you a link to reset your password.
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

      {sent ? (
        <div className="mt-8 rounded-xl bg-green-50 p-4 text-sm text-green-800">
          <p className="flex items-center gap-1.5 font-bold"><CheckCircle2 size={16} /> Check your email</p>
          <p className="mt-1 text-green-700/90">
            If an account exists for <span className="font-semibold">{email}</span>, you'll receive a
            password-reset link shortly. Don't forget to check your spam folder.
          </p>
        </div>
      ) : (
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? <Spinner size={18} /> : (<>Send reset link <ArrowRight size={16} /></>)}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-ink-500">
        <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </div>
    </AuthShell>
  )
}
