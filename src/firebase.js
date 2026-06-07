import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
export const db = app ? getFirestore(app) : null

// Use session persistence (sessionStorage): the login is dropped when the tab /
// browser is closed, so reopening requires signing in again. A same-tab reload
// keeps the session (sessionStorage survives reloads of the same tab).
if (auth) {
  setPersistence(auth, browserSessionPersistence).catch((e) => {
    // eslint-disable-next-line no-console
    console.warn('[Incident IRA] could not set session persistence:', e?.message || e)
  })
}

export default app
