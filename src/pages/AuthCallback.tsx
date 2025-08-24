import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function AuthCallback() {
  const { handleRedirectCallback, isLoading, error } = useAuth0()

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('Processing Auth0 callback...')
        await handleRedirectCallback()
        console.log('Auth0 callback processed successfully')
        // Redirect to home page after successful authentication
        window.location.replace('/')
      } catch (err) {
        console.error('Auth0 callback error:', err)
      }
    }

    // Only process if we have the callback URL parameters
    if (window.location.search.includes('code=') || window.location.search.includes('error=')) {
      processCallback()
    } else {
      // If no auth callback parameters, redirect to home
      window.location.replace('/')
    }
  }, [handleRedirectCallback])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error.message}
            </p>
            <button
              onClick={() => window.location.replace('/')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLoading ? 'Completing login...' : 'Redirecting...'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we complete your authentication.
          </p>
        </div>
      </div>
    </div>
  )
}
