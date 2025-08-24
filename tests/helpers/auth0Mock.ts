import { vi } from 'vitest'

// Mock Auth0 React SDK for testing
export const useAuth0 = vi.fn(() => ({
  user: undefined,
  isAuthenticated: false,
  isLoading: false,
  loginWithRedirect: vi.fn(),
  logout: vi.fn(),
}))

export const Auth0Provider = ({ children }: { children: React.ReactNode }) => {
  return children
}
