import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from './components/Auth0Provider'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider>
      <App />
    </Auth0Provider>
  </StrictMode>,
)
