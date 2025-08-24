import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Auth0Provider } from './components/Auth0Provider'
import { store } from './store'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Auth0Provider>
        <App />
      </Auth0Provider>
    </Provider>
  </StrictMode>,
)
