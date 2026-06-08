// ─────────────────────────────────────────────────────────────────────────────
// Standalone, per-person Injury Reports. Each injury captured inside an incident
// (Step 1a) is ALSO mirrored here as its own document so injuries can be reviewed
// and VERIFIED independently of the parent incident. Keyed deterministically by
// `${incidentId}__${personId}` so re-saving an incident updates (never dupes).
// Verification status is preserved across re-syncs (we never overwrite it here).
// ─────────────────────────────────────────────────────────────────────────────
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { logAudit } from './firestore'
import { AUDIT } from './audit'

const injuryCol = (orgId) => collection(db, 'organizations', orgId, 'injuries')
const injuryRef = (orgId, id) => doc(db, 'organizations', orgId, 'injuries', id)
const injuryId = (incidentId, personId) => `${incidentId}__${personId}`

/** Denormalized injury doc body (incident context carried for the standalone list). */
function injuryPayload(incident, report) {
  return {
    incidentId: incident.id,
    incidentRefNo: incident.refNo || '',
    personId: report.personId || '',
    personName: report.personName || '',
    firstAidDone: report.firstAidDone || false,
    firstAidDetail: report.firstAidDetail || '',
    bodyParts: report.bodyParts || [],
    injuryType: report.injuryType || '',
    medication: report.medication || '',
    daysToReturnToWork: report.daysToReturnToWork ?? '',
    recordFileIds: report.recordFileIds || [],
    // incident context (for filtering / display in the standalone page)
    incidentDate: incident.incidentDate || '',
    incidentType: incident.type || '',
    severity: incident.severity || '',
    location: incident.location || '',
    deletedAt: null,
    updatedAt: serverTimestamp(),
  }
}

/**
 * Upsert the incident's injury reports into the standalone collection, and remove
 * any prior injury docs for persons no longer present. Verification fields
 * (status/verifiedBy/verifiedAt) are intentionally omitted so re-syncing never
 * clears a completed verification — a brand-new doc simply has no status, which
 * the UI treats as "pending".
 */
export async function syncIncidentInjuries(orgId, incident, reports = [], actor) {
  const keep = new Set()
  for (const r of reports) {
    if (!r.personId) continue
    const id = injuryId(incident.id, r.personId)
    keep.add(id)
    await setDoc(injuryRef(orgId, id), injuryPayload(incident, r), { merge: true })
  }
  // Cleanup: delete injury docs for this incident whose person was removed.
  try {
    const snap = await getDocs(query(injuryCol(orgId), where('incidentId', '==', incident.id)))
    for (const d of snap.docs) if (!keep.has(d.id)) await deleteDoc(d.ref)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[Incident IRA] injury cleanup skipped:', e?.message || e)
  }
  await logAudit(orgId, actor, AUDIT.INJURY_SYNC, {
    target: 'injury',
    targetId: incident.id,
    targetLabel: incident.refNo || incident.id,
    summary: `${reports.length} injury report(s) saved for verification`,
  })
}

export function subscribeInjuries(orgId, cb) {
  // Order by updatedAt (every write stamps it); newest first.
  const q = query(injuryCol(orgId), orderBy('updatedAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => !x.deletedAt)),
    () => cb([]) // non-fatal: missing index / permissions → empty
  )
}

/** Mark an injury report verified (or revert to pending). Investigator/admin only (UI-gated). */
export async function setInjuryVerified(orgId, id, verified, actor, label) {
  await updateDoc(injuryRef(orgId, id), {
    status: verified ? 'verified' : 'pending',
    verifiedBy: verified ? actor?.uid || null : null,
    verifiedByName: verified ? actor?.name || '' : '',
    verifiedAt: verified ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  })
  await logAudit(orgId, actor, verified ? AUDIT.INJURY_VERIFY : AUDIT.INJURY_UNVERIFY, {
    target: 'injury',
    targetId: id,
    targetLabel: label || id,
    summary: verified ? 'Injury report verified' : 'Injury report verification cleared',
  })
}

/** Status helper: a doc with no explicit status is treated as pending. */
export const injuryStatus = (inj) => (inj?.status === 'verified' ? 'verified' : 'pending')
