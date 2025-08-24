import { useAuth0 } from '@auth0/auth0-react'

export function AuthDebug() {
  const auth0 = useAuth0()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      left: '10px', 
      background: 'black', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <strong>Auth0 Debug:</strong>
      <pre>{JSON.stringify({
        isAuthenticated: auth0.isAuthenticated,
        isLoading: auth0.isLoading,
        error: auth0.error?.message,
        user: auth0.user ? {
          name: auth0.user.name,
          nickname: auth0.user.nickname,
          email: auth0.user.email,
          sub: auth0.user.sub
        } : null
      }, null, 2)}</pre>
    </div>
  )
}
