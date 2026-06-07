import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest'
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'

let testEnv

const ORG_A = 'orgA'
const ORG_B = 'orgB'
const ADMIN_A = 'adminA'
const REPORTER_A = 'reporterA'
const ADMIN_B = 'adminB'
const INC_A = 'incA1'

const validIncident = { type: 'near_miss', severity: 'low', category: 'slip_trip_fall', lifecycle: 'reporting', location: 'Office', narrative: 'test' }

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'incident-ira-rules-test',
    firestore: { rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})
afterAll(async () => { await testEnv?.cleanup() })

beforeEach(async () => {
  await testEnv.clearFirestore()
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'users', ADMIN_A), { orgId: ORG_A, status: 'approved', role: 'admin', name: 'Admin A', email: 'a@a.com' })
    await setDoc(doc(db, 'users', REPORTER_A), { orgId: ORG_A, status: 'approved', role: 'reporter', name: 'Reporter A', email: 'r@a.com' })
    await setDoc(doc(db, 'users', ADMIN_B), { orgId: ORG_B, status: 'approved', role: 'admin', name: 'Admin B', email: 'b@b.com' })
    await setDoc(doc(db, 'organizations', ORG_A), { name: 'Org A', nameLower: 'org a' })
    await setDoc(doc(db, 'organizations', ORG_B), { name: 'Org B', nameLower: 'org b' })
    await setDoc(doc(db, 'organizations', ORG_A, 'incidents', INC_A), validIncident)
    await setDoc(doc(db, 'orgIndex', 'org a'), { orgId: ORG_A, name: 'Org A' })
  })
})

const reporter = () => testEnv.authenticatedContext(REPORTER_A).firestore()
const adminA = () => testEnv.authenticatedContext(ADMIN_A).firestore()
const adminB = () => testEnv.authenticatedContext(ADMIN_B).firestore()
const anon = () => testEnv.unauthenticatedContext().firestore()

const incPath = (db, org, id) => doc(db, 'organizations', org, 'incidents', id)

describe('incidents', () => {
  it('approved member can read incidents of their org', async () => {
    await assertSucceeds(getDoc(incPath(reporter(), ORG_A, INC_A)))
  })
  it('member of another org cannot read', async () => {
    await assertFails(getDoc(incPath(adminB(), ORG_A, INC_A)))
  })
  it('member can create a valid incident', async () => {
    await assertSucceeds(setDoc(incPath(reporter(), ORG_A, 'incNew'), validIncident))
  })
  it('rejects an invalid type enum', async () => {
    await assertFails(setDoc(incPath(reporter(), ORG_A, 'incBad'), { ...validIncident, type: 'explosion_of_doom' }))
  })
  it('rejects an over-long narrative', async () => {
    await assertFails(setDoc(incPath(reporter(), ORG_A, 'incLong'), { ...validIncident, narrative: 'x'.repeat(5001) }))
  })
  it('soft-delete (update deletedAt) allowed for a member', async () => {
    await assertSucceeds(updateDoc(incPath(reporter(), ORG_A, INC_A), { deletedAt: new Date(), lifecycle: 'reporting', type: 'near_miss', severity: 'low', category: 'slip_trip_fall' }))
  })
  it('hard delete is admin-only', async () => {
    await assertFails(deleteDoc(incPath(reporter(), ORG_A, INC_A)))
    await assertSucceeds(deleteDoc(incPath(adminA(), ORG_A, INC_A)))
  })
})

describe('photos subcollection', () => {
  const pPath = (db) => doc(db, 'organizations', ORG_A, 'incidents', INC_A, 'photos', 'p1')
  it('accepts a small image', async () => {
    await assertSucceeds(setDoc(pPath(reporter()), { type: 'image/png', size: 1000, dataUrl: 'x' }))
  })
  it('rejects a file over 750KB', async () => {
    await assertFails(setDoc(pPath(reporter()), { type: 'image/png', size: 800 * 1024, dataUrl: 'x' }))
  })
  it('rejects a disallowed type', async () => {
    await assertFails(setDoc(pPath(reporter()), { type: 'application/zip', size: 1000, dataUrl: 'x' }))
  })
})

describe('illnesses', () => {
  const ilPath = (db, id) => doc(db, 'organizations', ORG_A, 'illnesses', id)
  it('member can create a valid illness', async () => {
    await assertSucceeds(setDoc(ilPath(reporter(), 'ilNew'), { lifecycle: 'reporting', site: 'Plant 1' }))
  })
  it('rejects an invalid illness lifecycle', async () => {
    await assertFails(setDoc(ilPath(reporter(), 'ilBad'), { lifecycle: 'whatever' }))
  })
})

describe('audit log', () => {
  it('is append-only (no update/delete)', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'organizations', ORG_A, 'auditLogs', 'L1'), { action: 'incident.create', actorName: 'x' })
    })
    await assertSucceeds(setDoc(doc(reporter(), 'organizations', ORG_A, 'auditLogs', 'L2'), { action: 'incident.update', actorName: 'r' }))
    await assertFails(updateDoc(doc(reporter(), 'organizations', ORG_A, 'auditLogs', 'L1'), { action: 'tampered' }))
    await assertFails(deleteDoc(doc(adminA(), 'organizations', ORG_A, 'auditLogs', 'L1')))
  })
})

describe('orgIndex', () => {
  it('is publicly readable for signup', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'orgIndex', 'org a')))
  })
})
