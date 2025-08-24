import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockSeasons } from '../helpers/utils'
import ManageSeasons from '../../src/pages/ManageSeasons'
import * as dataServiceModule from '../../src/services/dataService'

// Mock the data service
vi.mock('../../src/services/dataService', () => ({
  dataService: {
    getSeasons: vi.fn(),
    createSeason: vi.fn()
  }
}))

describe('ManageSeasons', () => {
  const mockDataService = dataServiceModule.dataService as {
    getSeasons: ReturnType<typeof vi.fn>
    createSeason: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDataService.getSeasons.mockResolvedValue(mockSeasons)
    mockDataService.createSeason.mockResolvedValue({ id: 'new-season-id', name: 'New Season' })
  })

  it('should render manage seasons page with existing seasons', async () => {
    render(<ManageSeasons />)

    expect(screen.getByText('Manage Seasons')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create new season/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Summer League')).toBeInTheDocument()
      expect(screen.getByText('Winter Tournament')).toBeInTheDocument()
    })
  })

  it('should open create season modal when button is clicked', async () => {
    const user = userEvent.setup()
    render(<ManageSeasons />)

    const createButton = screen.getByRole('button', { name: /create new season/i })
    await user.click(createButton)

    expect(screen.getByRole('heading', { name: /create new season/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/season name/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /game/i })).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<ManageSeasons />)

    // Open modal
    const createButton = screen.getByRole('button', { name: /create new season/i })
    await user.click(createButton)

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create season/i })
    
    // Button should be disabled when required fields are empty
    expect(submitButton).toBeDisabled()
  })

  it('should create a new season with valid data', async () => {
    const user = userEvent.setup()
    render(<ManageSeasons />)

    // Open modal
    const createButton = screen.getByRole('button', { name: /create new season/i })
    await user.click(createButton)

    // Fill out the form
    await user.type(screen.getByLabelText(/season name/i), 'Test Season')
    
    // Select a game from dropdown  
    const gameSelect = screen.getByDisplayValue('Select a hockey game...')
    await user.selectOptions(gameSelect, 'NHL 25')

    // Set number of players
    const playersInput = screen.getByLabelText(/number of players/i)
    await user.clear(playersInput)
    await user.type(playersInput, '8')

    // Set number of games
    const gamesInput = screen.getByLabelText(/number of games/i)
    await user.clear(gamesInput)
    await user.type(gamesInput, '20')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create season/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockDataService.createSeason).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Season',
          game: 'NHL 25',
          numberOfPlayers: 8,
          numberOfGames: 20,
          sportsType: 'Hockey'
        })
      )
    })
  })

  it('should close modal when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<ManageSeasons />)

    // Open modal
    const createButton = screen.getByRole('button', { name: /create new season/i })
    await user.click(createButton)

    expect(screen.getByRole('heading', { name: /create new season/i })).toBeInTheDocument()

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    // Modal should be closed
    expect(screen.queryByRole('heading', { name: /create new season/i })).not.toBeInTheDocument()
  })

  it('should display season statistics correctly', async () => {
    render(<ManageSeasons />)

    await waitFor(() => {
      // Check that season information is displayed
      expect(screen.getByText('NHL 25')).toBeInTheDocument()
      expect(screen.getByText('Wayne Gretzky Hockey')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument() // games count
      expect(screen.getByText('8')).toBeInTheDocument() // games count
    })
  })

  it('should handle game selection dropdown', async () => {
    const user = userEvent.setup()
    render(<ManageSeasons />)

    // Open modal
    const createButton = screen.getByRole('button', { name: /create new season/i })
    await user.click(createButton)

    // Check that popular games are available
    expect(screen.getByRole('option', { name: /nhl 25/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /nhl 24/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /wayne gretzky hockey/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /nhl 94/i })).toBeInTheDocument()
  })

  it('should validate number ranges', async () => {
    const user = userEvent.setup()
    render(<ManageSeasons />)

    // Open modal
    const createButton = screen.getByRole('button', { name: /create new season/i })
    await user.click(createButton)

    // Test invalid number of players (too high)
    const playersInput = screen.getByLabelText(/number of players/i)
    await user.clear(playersInput)
    await user.type(playersInput, '50')

    // Test invalid number of games (too high)
    const gamesInput = screen.getByLabelText(/number of games/i)
    await user.clear(gamesInput)
    await user.type(gamesInput, '100')

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /create season/i })
    
    // Button should be disabled with invalid values
    expect(submitButton).toBeDisabled()
  })

  it('should display immutable settings warning', async () => {
    const user = userEvent.setup()
    render(<ManageSeasons />)

    // Open modal
    const createButton = screen.getByRole('button', { name: /create new season/i })
    await user.click(createButton)

    // Check for warning message
    expect(screen.getByText(/season settings are immutable once created/i)).toBeInTheDocument()
  })
})
