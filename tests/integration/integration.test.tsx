import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { setupLocalStorage, mockSeasons, mockGames } from '../helpers/utils'
import App from '../../src/App'

// Integration test for the full application flow
describe('Application Integration', () => {
  beforeEach(() => {
    // Reset localStorage and environment
    localStorage.clear()
    import.meta.env.VITE_ENV = 'development'
    
    // Setup sample data in localStorage
    setupLocalStorage({
      seasons: mockSeasons,
      games: mockGames
    })
  })

  it('should complete full season management workflow', async () => {
    const user = userEvent.setup()
    
    render(<App />)

    // Wait for app to load and connect
    await waitFor(() => {
      // In development mode, connection succeeds and banner disappears
      expect(screen.queryByText(/api connection failed/i)).not.toBeInTheDocument()
    })

    // Navigate to Manage Seasons
    const manageSeasonsLink = screen.getByRole('link', { name: /manage seasons/i })
    await user.click(manageSeasonsLink)

    // Should see existing seasons from localStorage (mock data)
    await waitFor(() => {
      expect(screen.getByText('Summer League')).toBeInTheDocument()
      expect(screen.getByText('Winter Tournament')).toBeInTheDocument()
    })

    // Create a new season
    const createButton = screen.getByRole('button', { name: /create new season/i })
    await user.click(createButton)

    // Fill out the form
    await user.type(screen.getByLabelText(/season name/i), 'Integration Test Season')
    
    const gameSelect = screen.getByLabelText(/^game \*/i)
    await user.selectOptions(gameSelect, 'NHL 25')

    const playersInput = screen.getByLabelText(/number of players/i)
    await user.clear(playersInput)
    await user.type(playersInput, '6')

    const gamesInput = screen.getByLabelText(/number of games/i)
    await user.clear(gamesInput)
    await user.type(gamesInput, '12')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create season/i })
    await user.click(submitButton)

    // Should close modal and show new season in the list
    await waitFor(() => {
      expect(screen.getByText('Integration Test Season')).toBeInTheDocument()
    })
  })

  it('should navigate between schedule and manage seasons', async () => {
    const user = userEvent.setup()
    
    render(<App />)

    // Wait for app to load
    await waitFor(() => {
      expect(screen.queryByText(/api connection failed/i)).not.toBeInTheDocument()
    })

    // Start at schedule page
    const scheduleLink = screen.getByRole('link', { name: /schedule/i })
    await user.click(scheduleLink)

    // Should be on schedule page (calendar should be visible)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument()
    })

    // Navigate to manage seasons
    const manageSeasonsLink = screen.getByRole('link', { name: /manage seasons/i })
    await user.click(manageSeasonsLink)

    // Should be on manage seasons page
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /manage seasons/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create new season/i })).toBeInTheDocument()
    })
  })

  it('should handle connection failures gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock dataService to fail
    vi.doMock('../services/dataService', () => ({
      dataService: {
        testConnection: vi.fn().mockRejectedValue(new Error('Connection failed'))
      }
    }))

    render(<App />)

    // Should still render the app even with connection failure
    await waitFor(() => {
      expect(screen.getByText('Sports Season System')).toBeInTheDocument()
    })

    // Should still allow navigation despite connection failure
    expect(screen.getByText('Hockey')).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()

    consoleError.mockRestore()
  })

  it.skip('should display games in calendar view', async () => {
    // Skip this test until games API is fully implemented
    const user = userEvent.setup()
    
    render(<App />)

    // Wait for app to load
    await waitFor(() => {
      expect(screen.queryByText(/api connection failed/i)).not.toBeInTheDocument()
    })

    // Navigate to schedule
    const scheduleLink = screen.getByRole('link', { name: /schedule/i })
    await user.click(scheduleLink)

    // Should see calendar view is loaded
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument()
    })
  })

  it('should maintain state across navigation', async () => {
    const user = userEvent.setup()
    
    render(<App />)

    // Wait for app to load
    await waitFor(() => {
      expect(screen.queryByText(/api connection failed/i)).not.toBeInTheDocument()
    })

    // Go to manage seasons and verify data loads
    const manageSeasonsLink = screen.getByRole('link', { name: /manage seasons/i })
    await user.click(manageSeasonsLink)

    await waitFor(() => {
      expect(screen.getByText('Summer League')).toBeInTheDocument()
      expect(screen.getByText('Winter Tournament')).toBeInTheDocument()
    })

    // Navigate to schedule
    const scheduleLink = screen.getByRole('link', { name: /schedule/i })
    await user.click(scheduleLink)

    // Navigate back to manage seasons - data should still be there
    await user.click(manageSeasonsLink)

    await waitFor(() => {
      expect(screen.getByText('Summer League')).toBeInTheDocument()
      expect(screen.getByText('Winter Tournament')).toBeInTheDocument()
    })
  })
})
