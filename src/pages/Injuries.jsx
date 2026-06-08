import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { HeartPulse, Search, CheckCircle2, Clock, ShieldCheck, RotateCcw, ExternalLink } from 'lucide-react'
import { PageHeader, Badge, EmptyState } from '../components/ui'
import { useIncidents } from '../context/IncidentContext'
import { useAuth } from '../context/AuthContext'
import { can } from '../lib/permissions'
import { setInjuryVerified, injuryStatus } from '../lib/injuries'
import { bodyPartLabel, INCIDENT_TYPE_BY_KEY, SEVERITY_BY_KEY } from '../lib/constants'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'verified', label: 'Verified' },
]

export default function Injuries() {
  const { injuries } = useIncidents()
  const { profile, orgId } = useAuth()
  const mayVerify = can(profile?.role, 'injury.verify')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(null)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return injuries.filter((i) => {
      if (filter !== 'all' && injuryStatus(i) !== filter) return false
      if (q && !(`${i.personName} ${i.incidentRefNo} ${i.injuryType}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [injuries, filter, search])

  const verify = async (inj, next) => {
    setBusy(inj.id)
    try {
      await setInjuryVerified(orgId, inj.id, next, { uid: profile?.uid, name: profile?.name }, `${inj.personName} · ${inj.incidentRefNo}`)
      toast.success(next ? 'Injury report verified' : 'Verification cleared')
    } catch (e) {
      toast.error(e.message || 'Could not update')
    } finally {
      setBusy(null)
    }
  }

  const counts = {
    pending: injuries.filter((i) => injuryStatus(i) !== 'verified').length,
    verified: injuries.filter((i) => injuryStatus(i) === 'verified').length,
  }

  return (
    <div>
      <PageHeader title="Injury Reports" subtitle="Per-person injuries from all incidents — review and verify each one." icon={HeartPulse} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl bg-clay-surface p-1 shadow-clay-inset">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${filter === f.key ? 'bg-brand-500 text-white shadow-clay-sm' : 'text-ink-500 hover:text-ink-800'}`}
            >
              {f.label}
              {f.key === 'pending' && counts.pending > 0 && <span className="ml-1 rounded-full bg-amber-400/90 px-1.5 text-[10px] font-extrabold text-ink-900">{counts.pending}</span>}
            </button>
          ))}
        </div>
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search person, incident, injury…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={HeartPulse} title="No injury reports" hint="Injury reports are created in an incident (Step 1a) when the type is first-aid, lost-time or reportable. They appear here for independent verification." />
      ) : (
        <div className="space-y-3">
          {rows.map((inj) => {
            const verified = injuryStatus(inj) === 'verified'
            const type = INCIDENT_TYPE_BY_KEY[inj.incidentType]
            const sev = SEVERITY_BY_KEY[inj.severity]
            return (
              <div key={inj.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-ink-900">{inj.personName || 'Unnamed person'}</h3>
                      {verified ? (
                        <Badge color="#0ea5e9"><ShieldCheck size={12} /> Verified</Badge>
                      ) : (
                        <Badge color="#f59e0b"><Clock size={12} /> Pending</Badge>
                      )}
                      {inj.injuryType && <Badge color="#dc2626">{inj.injuryType}</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      <Link to={`/app/incidents/${inj.incidentId}`} className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline">
                        {inj.incidentRefNo || 'Incident'} <ExternalLink size={11} />
                      </Link>
                      {inj.incidentDate && <span> · {inj.incidentDate}</span>}
                      {type && <span> · {type.label}</span>}
                      {sev && <span> · {sev.label}</span>}
                      {inj.location && <span> · {inj.location}</span>}
                    </p>
                  </div>

                  {mayVerify && (
                    verified ? (
                      <button onClick={() => verify(inj, false)} disabled={busy === inj.id} className="btn-ghost px-3 py-1.5 text-xs">
                        <RotateCcw size={13} /> Unverify
                      </button>
                    ) : (
                      <button onClick={() => verify(inj, true)} disabled={busy === inj.id} className="btn-primary px-3 py-1.5 text-xs">
                        <CheckCircle2 size={14} /> Verify
                      </button>
                    )
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                  <Field label="First aid done">{inj.firstAidDone ? `Yes${inj.firstAidDetail ? ` — ${inj.firstAidDetail}` : ''}` : 'No'}</Field>
                  <Field label="Days to return">{inj.daysToReturnToWork !== '' && inj.daysToReturnToWork != null ? inj.daysToReturnToWork : '—'}</Field>
                  <Field label="Medication">{inj.medication || '—'}</Field>
                  <Field label="Medical records">{(inj.recordFileIds || []).length || '—'}</Field>
                </div>

                {(inj.bodyParts || []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {inj.bodyParts.map((k) => <span key={k} className="chip bg-clay-100 text-ink-600">{bodyPartLabel(k)}</span>)}
                  </div>
                )}

                {verified && inj.verifiedByName && (
                  <p className="mt-2 text-[11px] text-ink-400">Verified by {inj.verifiedByName}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="text-ink-800">{children}</p>
    </div>
  )
}
