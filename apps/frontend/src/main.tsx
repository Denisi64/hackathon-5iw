import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { useAuthStore } from './stores/authStore'
import './lib/i18n'
import './styles/tokens.css'
import './styles/tailwind.css'
import './styles/global.css'

useAuthStore.getState().hydrate()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
