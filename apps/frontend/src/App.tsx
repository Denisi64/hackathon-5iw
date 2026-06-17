import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Shell } from './components/layout/Shell'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

const LandingScreen = lazy(() => import('./screens/LandingScreen'))
const SimulateurScreen = lazy(() => import('./screens/SimulateurScreen'))
const ForfaitsScreen = lazy(() => import('./screens/ForfaitsScreen'))
const ForfaitDetailScreen = lazy(() => import('./screens/ForfaitDetailScreen'))
const StoryScreen = lazy(() => import('./screens/StoryScreen'))
const SubscriptionScreen = lazy(() => import('./screens/SubscriptionScreen'))
const ChatbotScreen = lazy(() => import('./screens/ChatbotScreen'))
const LoginScreen = lazy(() => import('./screens/LoginScreen'))
const RegisterScreen = lazy(() => import('./screens/RegisterScreen'))
const MonEspaceScreen = lazy(() => import('./screens/MonEspaceScreen'))

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
            <Route path="/simulateur" element={<SimulateurScreen />} />
            <Route path="/forfaits" element={<ForfaitsScreen />} />
            <Route path="/forfaits/:forfaitId" element={<ForfaitDetailScreen />} />
            <Route path="/histoires/:slug" element={<StoryScreen />} />
            <Route path="/souscrire" element={<SubscriptionScreen />} />
            <Route path="/assistant" element={<ProtectedRoute><ChatbotScreen /></ProtectedRoute>} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/mon-espace" element={<ProtectedRoute><MonEspaceScreen /></ProtectedRoute>} />
            <Route path="*" element={<LandingScreen />} />
          </Routes>
        </Suspense>
      </Shell>
    </BrowserRouter>
  )
}
