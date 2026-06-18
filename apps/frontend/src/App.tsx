import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Shell } from './components/layout/Shell'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

const LandingScreen = lazy(() => import('./screens/LandingScreen'))
const SimulatorScreen = lazy(() => import('./screens/SimulatorScreen'))
const PlansScreen = lazy(() => import('./screens/PlansScreen'))
const PlanDetailScreen = lazy(() => import('./screens/PlanDetailScreen'))
const StoryScreen = lazy(() => import('./screens/StoryScreen'))
const SubscriptionScreen = lazy(() => import('./screens/SubscriptionScreen'))
const ChatbotScreen = lazy(() => import('./screens/ChatbotScreen'))
const LoginScreen = lazy(() => import('./screens/LoginScreen'))
const RegisterScreen = lazy(() => import('./screens/RegisterScreen'))
const AccountScreen = lazy(() => import('./screens/AccountScreen'))
const NavigoScreen = lazy(() => import('./screens/NavigoScreen'))
const InterestsScreen = lazy(() => import('./screens/InterestsScreen'))
const TripsScreen = lazy(() => import('./screens/TripsScreen'))

function FallbackLoading() {
  const { t } = useTranslation()
  return (
    <div className="grid min-h-[40vh] place-items-center text-fg-muted">{t('common.loading')}</div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Suspense fallback={<FallbackLoading />}>
          <Routes>
            <Route path="/" element={<LandingScreen />} />
            <Route path="/simulateur" element={<SimulatorScreen />} />
            <Route path="/forfaits" element={<PlansScreen />} />
            <Route path="/forfaits/:planId" element={<PlanDetailScreen />} />
            <Route path="/histoires/:slug" element={<StoryScreen />} />
            <Route path="/souscrire" element={<SubscriptionScreen />} />
            <Route path="/assistant" element={<ProtectedRoute><ChatbotScreen /></ProtectedRoute>} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/mon-espace" element={<ProtectedRoute><AccountScreen /></ProtectedRoute>} />
            <Route path="/centres-interet" element={<ProtectedRoute><InterestsScreen /></ProtectedRoute>} />
            <Route path="/navigo" element={<ProtectedRoute><NavigoScreen /></ProtectedRoute>} />
            <Route path="/trajets" element={<ProtectedRoute><TripsScreen /></ProtectedRoute>} />
            <Route path="*" element={<LandingScreen />} />
          </Routes>
        </Suspense>
      </Shell>
    </BrowserRouter>
  )
}
