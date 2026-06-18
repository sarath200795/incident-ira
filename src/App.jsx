import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import { IncidentProvider } from './context/IncidentContext'
import { FullScreenLoader } from './components/ui'
import { isFirebaseConfigured } from './firebase'
import SetupNeeded from './pages/SetupNeeded'

// Route-level code splitting — each page is fetched only when navigated to.
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const RegisterOrg = lazy(() => import('./pages/RegisterOrg'))
const PendingApproval = lazy(() => import('./pages/PendingApproval'))
const Legal = lazy(() => import('./pages/Legal'))
const Diagnostics = lazy(() => import('./pages/Diagnostics'))

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Incidents = lazy(() => import('./pages/Incidents'))
const IncidentWizard = lazy(() => import('./pages/IncidentWizard'))
const Illnesses = lazy(() => import('./pages/Illnesses'))
const IllnessWizard = lazy(() => import('./pages/IllnessWizard'))
const Injuries = lazy(() => import('./pages/Injuries'))
const ActionTracker = lazy(() => import('./pages/ActionTracker'))
const Users = lazy(() => import('./pages/Users'))
const AuditLog = lazy(() => import('./pages/AuditLog'))
const RecycleBin = lazy(() => import('./pages/RecycleBin'))

function AppShell() {
  return (
    <ProtectedRoute>
      <IncidentProvider>
        <Layout />
      </IncidentProvider>
    </ProtectedRoute>
  )
}

export default function App() {
  if (!isFirebaseConfigured) return <SetupNeeded />
  // NOTE: routes are intentionally NOT wrapped in <AnimatePresence mode="wait">.
  // That keeps the previous route's subtree mounted (with its stale location)
  // during the exit animation, so redirect routes (<Navigate>) and
  // ProtectedRoute's auth-based redirects re-fire navigate() in that window —
  // which on logout produced a blank page and tripped Chrome's "Throttling
  // navigation" guard. Pages keep their own mount animations.
  return (
    <Suspense fallback={<FullScreenLoader label="Loading…" />}>
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register-org" element={<RegisterOrg />} />
          <Route path="/pending" element={<PendingApproval />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/privacy" element={<Legal kind="privacy" />} />
          <Route path="/terms" element={<Legal kind="terms" />} />
          <Route path="/data-retention" element={<Legal kind="retention" />} />
          <Route path="/cookies" element={<Legal kind="cookies" />} />

          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="incidents/new" element={<IncidentWizard />} />
            <Route path="incidents/:id" element={<IncidentWizard />} />
            <Route path="illness" element={<Illnesses />} />
            <Route path="illness/new" element={<IllnessWizard />} />
            <Route path="illness/:id" element={<IllnessWizard />} />
            <Route path="injuries" element={<Injuries />} />
            <Route path="actions" element={<ActionTracker />} />
            <Route path="users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
            <Route path="audit" element={<ProtectedRoute adminOnly><AuditLog /></ProtectedRoute>} />
            <Route path="recycle" element={<ProtectedRoute adminOnly><RecycleBin /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
    </Suspense>
  )
}
