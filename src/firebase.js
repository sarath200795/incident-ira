import { connectAuthEmulator as __connectAuthEmu } from 'firebase/auth'
import { connectFirestoreEmulator as __connectFsEmu } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserSessionPersistence, inMemoryPersistence } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

// Strip a leading UTF-8 BOM, any zero-width characters, surrounding quotes, and
// whitespace from an env value. Some build/deploy pipelines silently prepend a
// BOM to env values (e.g. the API key / project id), which corrupts every
// Firebase request and surfaces as auth/network-request-failed. Sanitizing here
// makes the app resilient regardless of how the environment was set.
const clean = (v) => (v == null ? '' : String(v).replace(/[​-‍﻿]/g, '').replace(/^["']|["']$/g, '').trim())

const firebaseConfig = {
  apiKey: clean(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: clean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: clean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(import.meta.env.VITE_FIREBASE_APP_ID),
}

// True only when the essential web-config keys are present.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

if (!isFirebaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Incident IRA] Firebase is not configured. Copy .env.example to .env and add your project keys.'
  )
}

// IMPORTANT: only initialize Firebase WHEN configured. Calling getAuth() with an
// undefined apiKey throws `auth/invalid-api-key` at module load and blanks the
// whole app — so the "Connect Firebase" SetupNeeded screen could never render.
// Export nulls until real config is supplied.
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null
// initializeFirestore (not getFirestore) so we can auto-detect when the network
// needs long-polling: behind some VPNs, proxies and corporate/restrictive
// networks the default WebChannel streaming connection is blocked, which makes
// reads/writes hang or fail. Auto-detect transparently falls back to long
// polling on those networks while keeping the faster transport everywhere else.
export const db = app ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true }) : null

if (auth) {
  // Prefer session persistence (login drops when the tab/browser closes). If the
  // browser blocks site storage (sessionStorage), fall back to in-memory so the
  // user can still sign in for this tab instead of auth failing outright.
  setPersistence(auth, browserSessionPersistence).catch(() =>
    setPersistence(auth, inMemoryPersistence).catch((e) => {
      // eslint-disable-next-line no-console
      console.warn('[Incident IRA] could not set auth persistence:', e?.message || e)
    })
  )
}

export default app

// ── Local emulator wiring (demo / offline dev only) ──────────────────────────
// When VITE_USE_EMULATOR is "1", point Auth + Firestore at the local Firebase
// emulators. Guarded by an env flag absent in production builds.
export const usingEmulator = import.meta.env.VITE_USE_EMULATOR === '1'
if (usingEmulator && auth && db) {
  __connectAuthEmu(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  __connectFsEmu(db, '127.0.0.1', 8080)
}
