import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import './styles/effects.css'
import './styles/ui.css'
import App from './App.jsx'
import { SystemProvider } from './state/SystemContext.jsx'
import { AudioProvider } from './hooks/useAudio.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SystemProvider>
      <AudioProvider>
        <App />
      </AudioProvider>
    </SystemProvider>
  </StrictMode>,
)
