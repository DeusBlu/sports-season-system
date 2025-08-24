import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock Auth0 React SDK
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(() => ({
    user: undefined,
    isAuthenticated: false,
    isLoading: false,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
  })),
  Auth0Provider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock environment variables for testing
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_NODE_ENV: 'test',
    VITE_API_URL: 'http://localhost:8788/api',
    VITE_ENV: 'development',
    NODE_ENV: 'test'
  },
  writable: true
})

// Mock localStorage with actual storage
const storage = new Map<string, string>()
const localStorageMock = {
  getItem: vi.fn((key: string) => storage.get(key) || null),
  setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
  removeItem: vi.fn((key: string) => storage.delete(key)),
  clear: vi.fn(() => storage.clear()),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Reset localStorage mock before each test
beforeEach(() => {
  storage.clear()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
})
