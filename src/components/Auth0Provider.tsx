import { Auth0Provider as Auth0ProviderBase } from '@auth0/auth0-react'
import { ReactNode } from 'react'

interface Auth0ProviderProps {
  children: ReactNode
}

export function Auth0Provider({ children }: Auth0ProviderProps) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE
  const redirectUri = `${window.location.origin}/callback`

  console.log('Auth0 Config:', { 
    domain, 
    clientId, 
    audience,
    redirectUri,
    currentUrl: window.location.href 
  })

  if (!domain || !clientId) {
    throw new Error('Auth0 domain and client ID must be provided')
  }

  return (
    <Auth0ProviderBase
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: 'openid profile email read:current_user'
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      onRedirectCallback={(appState) => {
        console.log('Auth0 Redirect Callback:', appState)
        // Redirect to the intended page or home
        const targetUrl = appState?.returnTo || '/hockey'
        window.history.replaceState({}, document.title, targetUrl)
      }}
    >
      {children}
    </Auth0ProviderBase>
  )
}
