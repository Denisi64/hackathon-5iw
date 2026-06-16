import { Menu, Mic, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { AssistantScreen } from './screens/AssistantScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { HomeScreen } from './screens/HomeScreen'
import { SimulateurScreen } from './screens/SimulateurScreen'
import { SubscriptionScreen } from './screens/SubscriptionScreen'
import { TimelineScreen } from './screens/TimelineScreen'
import { VoiceButton } from './components/ui/VoiceButton'

const NAV_ITEMS = [
  ['/', 'Accueil'],
  ['/simulateur', 'Simulateur'],
  ['/souscrire', 'Souscrire'],
  ['/timeline', 'Timeline'],
  ['/assistant', 'Assistant'],
  ['/dashboard', 'Espace client'],
] as const

export function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand-lockup" to="/">
          <strong>Comutitres</strong>
          <span>Souscription transport en ligne</span>
        </NavLink>
        <button
          className="icon-button topbar__menu"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav className={menuOpen ? 'main-nav main-nav--open' : 'main-nav'} aria-label="Navigation principale">
          {NAV_ITEMS.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Routes>
        <Route element={<HomeScreen />} path="/" />
        <Route element={<SimulateurScreen />} path="/simulateur" />
        <Route element={<SubscriptionScreen />} path="/souscrire" />
        <Route element={<TimelineScreen />} path="/timeline" />
        <Route element={<AssistantScreen />} path="/assistant" />
        <Route element={<DashboardScreen />} path="/dashboard" />
      </Routes>

      <button className="speech-shortcut" type="button">
        <Mic aria-hidden="true" />
        Aide vocale disponible
      </button>
      <VoiceButton listening={voiceEnabled} onPress={() => setVoiceEnabled((current) => !current)} />
    </div>
  )
}
