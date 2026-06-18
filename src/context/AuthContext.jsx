import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'
import {
  createOrganization,
  createPendingMember,
  findOrgByName,
  getUserProfile,
} from '../lib/firestore'

const AuthContext = createContext(null)

// Transient network blips (flaky Wi‑Fi, a VPN reconnecting, a proxy hiccup)
// surface as `auth/network-request-failed` (Auth) or `unavailable` /
// `deadline-exceeded` (Firestore). Retry a few times with backoff so a single
// dropped request doesn't fail the whole sign-in / registration. Deterministic
// errors (wrong password, email-in-use, permission-denied) throw immediately.
const TRANSIENT_CODES = new Set(['auth/network-request-failed', 'auth/timeout', 'unavailable', 'deadline-exceeded'])
async function withNetworkRetry(fn, tries = 3) {
  let lastErr
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (!TRANSIENT_CODES.has(err?.code) || i === tries - 1) throw err
      await new Promise((r) => setTimeout(r, 700 * (i + 1)))
    }
  }
  throw lastErr
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // firebase auth user
  const [profile, setProfile] = useState(null) // users/{uid} doc
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async (uid) => {
    const p = await getUserProfile(uid)
    setProfile(p)
    return p
  }, [])

  useEffect(() => {
    // Without config the auth listener never fires — don't hang on a loader.
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        await refreshProfile(u.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [refreshProfile])

  // Register a brand new organization; caller becomes admin.
  // NOTE: create the auth user FIRST so the org-name lookup runs authenticated —
  // Firestore rules require sign-in to read `organizations`.
  const registerOrganization = async ({ orgName, address, name, email, password }) => {
    const cred = await withNetworkRetry(() => createUserWithEmailAndPassword(auth, email, password))
    try {
      const existing = await findOrgByName(orgName)
      if (existing) {
        throw new Error('An organization with that name already exists. Try signing up to join it.')
      }
      await updateProfile(cred.user, { displayName: name })
      await createOrganization({ orgName, address, uid: cred.user.uid, name, email })
      setUser(cred.user)
      await withNetworkRetry(() => refreshProfile(cred.user.uid))
    } catch (err) {
      // Roll back the half-created account so the email can be reused.
      await deleteUser(cred.user).catch(() => {})
      throw err
    }
  }

  // Sign up to join an existing org (pending admin approval). The org is now
  // chosen from a dropdown, so we receive its id directly — no name lookup.
  const signUpMember = async ({ orgId, orgName, name, email, password }) => {
    if (!orgId) throw new Error('Please select your organization.')
    const cred = await withNetworkRetry(() => createUserWithEmailAndPassword(auth, email, password))
    try {
      await updateProfile(cred.user, { displayName: name })
      await createPendingMember({
        uid: cred.user.uid,
        name,
        email,
        orgId,
        orgName: orgName || '',
      })
      setUser(cred.user)
      await withNetworkRetry(() => refreshProfile(cred.user.uid))
    } catch (err) {
      await deleteUser(cred.user).catch(() => {})
      throw err
    }
  }

  const login = async ({ email, password }) => {
    const cred = await withNetworkRetry(() => signInWithEmailAndPassword(auth, email, password))
    // Set the user immediately so isAuthed is true right away — don't wait for the
    // async onAuthStateChanged listener, which would let the post-login redirect
    // bounce off ProtectedRoute before the session is recognised.
    setUser(cred.user)
    await withNetworkRetry(() => refreshProfile(cred.user.uid))
  }

  // Send a password-reset email. Firebase handles the secure reset link and the
  // hosted reset page, so we only need to fire the request.
  const resetPassword = async (email) => {
    await withNetworkRetry(() => sendPasswordResetEmail(auth, email))
  }

  const signOut = async () => {
    await fbSignOut(auth)
    // Clear user AND profile synchronously (don't wait for the async
    // onAuthStateChanged listener). Otherwise there's a window where isAuthed is
    // still true but profile is null, which makes ProtectedRoute bounce to
    // /pending and race the redirect to /login — leaving a blank page.
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    isAuthed: Boolean(user),
    isApproved: profile?.status === 'approved',
    role: profile?.role || null,
    isAdmin: profile?.role === 'admin',
    isInvestigator: profile?.role === 'investigator' || profile?.role === 'admin',
    orgId: profile?.orgId || null,
    orgName: profile?.orgName || '',
    registerOrganization,
    signUpMember,
    login,
    resetPassword,
    signOut,
    refreshProfile: () => user && refreshProfile(user.uid),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
