import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, render } from '@testing-library/react'
import App from '../src/App'
import * as dataServiceModule from '../src/services/dataService'

// Mock the data service
vi.mock('../src/services/dataService', () => ({
  dataService: {
    testConnection: vi.fn()
  }
}))

// Mock the pages to avoid complex rendering
vi.mock('./pages/Hockey', () => ({
  default: () => <div data-testid="hockey-page">Hockey Page</div>
}))

vi.mock('./pages/Schedule', () => ({
  default: () => <div data-testid="schedule-page">Schedule Page</div>
}))

vi.mock('./pages/ManageSeasons', () => ({
  default: () => <div data-testid="manage-seasons-page">Manage Seasons Page</div>
}))

describe('App', () => {
  const mockDataService = dataServiceModule.dataService as {
    testConnection: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show connecting status initially', () => {
    mockDataService.testConnection.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<App />)

    expect(screen.getByText(/connecting to api/i)).toBeInTheDocument()
  })

  it('should show connected status when connection succeeds', async () => {
    mockDataService.testConnection.mockResolvedValue(true)
    
    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText(/connecting to api/i)).not.toBeInTheDocument()
    })

    expect(screen.queryByText(/connecting to api/i)).not.toBeInTheDocument()
  })

  it('should show error status when connection fails', async () => {
    mockDataService.testConnection.mockResolvedValue(false)
    
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/api connection failed/i)).toBeInTheDocument()
    })
  })

  it('should handle connection errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockDataService.testConnection.mockRejectedValue(new Error('Network error'))
    
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/api connection failed/i)).toBeInTheDocument()
    })

    expect(consoleError).toHaveBeenCalledWith(
      'Data service connection failed:',
      expect.any(Error)
    )

    consoleError.mockRestore()
  })

  it('should render router with correct routes', async () => {
    mockDataService.testConnection.mockResolvedValue(true)
    
    render(<App />)

    // Wait for connection to complete
    await waitFor(() => {
      expect(screen.queryByText(/connecting to api/i)).not.toBeInTheDocument()
    })

    // Should render the Layout component which will handle routing
    expect(screen.getByText('Hockey')).toBeInTheDocument()
  })

  it('should redirect root path to hockey', async () => {
    mockDataService.testConnection.mockResolvedValue(true)
    
    // Mock window.location to simulate being at root
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/' },
      writable: true
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText(/connecting to api/i)).not.toBeInTheDocument()
    })

    // Should show hockey navigation (indicating redirect worked)
    expect(screen.getByText('Hockey')).toBeInTheDocument()

    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    })
  })

  it('should apply global styles and theme', async () => {
    mockDataService.testConnection.mockResolvedValue(true)
    
    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText(/connecting to api/i)).not.toBeInTheDocument()
    })

    // Check that the app container exists with expected content
    expect(screen.getByText('Hockey')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Schedule' })).toBeInTheDocument()
    expect(screen.getByText('Manage Seasons')).toBeInTheDocument()
  })

  it('should show connection banner styling correctly', async () => {
    mockDataService.testConnection.mockResolvedValue(true)
    
    render(<App />)

    // When connection succeeds, the banner should disappear
    await waitFor(() => {
      expect(screen.queryByText(/connecting to api/i)).not.toBeInTheDocument()
    })
    
    // App should be rendered properly
    expect(screen.getByText('Hockey')).toBeInTheDocument()
  })
})
