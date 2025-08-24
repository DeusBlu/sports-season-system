import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render, mockGames } from '../helpers/utils'
import HockeyCalendar from '../../src/components/HockeyCalendar'
import * as dataServiceModule from '../../src/services/dataService'

// Mock the data service
vi.mock('../../src/services/dataService', () => ({
  dataService: {
    getGames: vi.fn()
  }
}))

describe('HockeyCalendar', () => {
  const mockDataService = dataServiceModule.dataService as any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDataService.getGames.mockResolvedValue(mockGames)
  })

  it('should render calendar component', async () => {
    render(<HockeyCalendar />)

    // Check that the calendar is rendered
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('should load and display games', async () => {
    render(<HockeyCalendar />)

    await waitFor(() => {
      expect(mockDataService.getGames).toHaveBeenCalled()
    })

    // Check that games are displayed in the calendar
    await waitFor(() => {
      expect(screen.getByText('vs Lightning')).toBeInTheDocument()
      expect(screen.getByText('@ Rangers')).toBeInTheDocument()
      expect(screen.getByText('Bruins @ Capitals')).toBeInTheDocument()
    })
  })

  it('should handle loading error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockDataService.getGames.mockRejectedValue(new Error('Failed to load games'))

    render(<HockeyCalendar />)

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to load games:', expect.any(Error))
    })

    consoleError.mockRestore()
  })

  it('should display home and away indicators correctly', async () => {
    render(<HockeyCalendar />)

    await waitFor(() => {
      expect(mockDataService.getGames).toHaveBeenCalled()
    })

    // Wait for games to be rendered
    await waitFor(() => {
      const gameElements = screen.getAllByText(/vs|@/)
      expect(gameElements.length).toBeGreaterThan(0)
    })

    // Check that home games show "vs" and away games show "@"
    expect(screen.getByText('vs Lightning')).toBeInTheDocument() // Home game
    expect(screen.getByText('@ Rangers')).toBeInTheDocument() // Away game
    expect(screen.getByText('Bruins @ Capitals')).toBeInTheDocument() // Other team's away game
  })

  it('should allow navigation between calendar views', async () => {
    render(<HockeyCalendar />)

    // Test view switching (month, week, day, agenda)
    const monthButton = screen.getByRole('button', { name: /month/i })
    const weekButton = screen.getByRole('button', { name: /week/i })
    
    expect(monthButton).toBeInTheDocument()
    expect(weekButton).toBeInTheDocument()
  })

  it('should handle empty games list', async () => {
    mockDataService.getGames.mockResolvedValue([])

    render(<HockeyCalendar />)

    await waitFor(() => {
      expect(mockDataService.getGames).toHaveBeenCalled()
    })

    // Calendar should still render without crashing
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument()
  })
})
